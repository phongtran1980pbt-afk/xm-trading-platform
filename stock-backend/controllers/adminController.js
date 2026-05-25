import { poolPromise } from '../config/db.js';
import { getTrueTime } from '../timeService.js';

// GET /api/admin/audit-logs
export const getAuditLogs = async (req, res) => {
  try {
    const pool = await poolPromise;
    const result = await pool.request().query(`
      SELECT Id, Action, Details, CreatedAt
      FROM AuditLogs
      WHERE Action NOT IN ('PLACE_BINARY_ORDER', 'SETTLE_BINARY_ORDER')
      ORDER BY CreatedAt DESC
    `);
    res.json(result.recordset);
  } catch (error) {
    console.error('Lỗi lấy Audit Logs:', error);
    res.status(500).json({ message: 'Lỗi server khi lấy Audit Logs' });
  }
};

// GET /api/admin/users
export const getUsers = async (req, res) => {
  try {
    const pool = await poolPromise;
    const result = await pool.request().query(`
      SELECT Id, Email, FullName, IsActive, Balance, AccountCode
      FROM Users
      ORDER BY Id ASC
    `);
    res.json(result.recordset);
  } catch (error) {
    console.error('Lỗi lấy danh sách User:', error);
    res.status(500).json({ message: 'Lỗi server khi lấy Users' });
  }
};

// POST /api/admin/users/:id/deposit
export const depositUser = async (req, res) => {
  const { id } = req.params;
  const { amount } = req.body;
  if (!amount || amount <= 0) {
    return res.status(400).json({ message: 'Số tiền nạp không hợp lệ' });
  }
  
  try {
    const pool = await poolPromise;
    // Lấy thông tin user
    const userRes = await pool.request()
      .input('id', id)
      .query('SELECT Email, FullName FROM Users WHERE Id = @id');
    
    if (userRes.recordset.length === 0) {
      return res.status(404).json({ message: 'Không tìm thấy tài khoản' });
    }
    
    const user = userRes.recordset[0];
    
    // Nạp tiền
    await pool.request()
      .input('id', id)
      .input('amount', amount)
      .query('UPDATE Users SET Balance = Balance + @amount WHERE Id = @id');
      
    // Ghi AuditLog
    await pool.request()
      .input('action', 'Nạp tiền')
      .input('details', `Đã nạp $${amount} cho tài khoản ${user.Email} (${user.FullName})`)
      .input('createdAt', getTrueTime())
      .query('INSERT INTO AuditLogs (Action, Details, CreatedAt) VALUES (@action, @details, @createdAt)');
      
    // Gửi thông báo cho khách hàng
    await pool.request()
      .input('userId', id)
      .input('msg', `Tài khoản của bạn vừa được nạp $${amount}`)
      .input('createdAt', getTrueTime())
      .query('INSERT INTO Notifications (UserId, Message, CreatedAt) VALUES (@userId, @msg, @createdAt)');
      
    res.json({ success: true, message: 'Nạp tiền thành công!' });
  } catch (error) {
    console.error('Lỗi nạp tiền:', error);
    res.status(500).json({ message: 'Lỗi server khi nạp tiền' });
  }
};

// POST /api/admin/users/deposit-by-code
export const depositUserByCode = async (req, res) => {
  const { accountCode, amount } = req.body;
  
  if (!accountCode) {
    return res.status(400).json({ message: 'Vui lòng nhập mã UID' });
  }
  if (!amount || amount <= 0) {
    return res.status(400).json({ message: 'Số tiền nạp không hợp lệ' });
  }
  
  try {
    const pool = await poolPromise;
    
    // Tìm tài khoản theo AccountCode
    const userRes = await pool.request()
      .input('accountCode', accountCode)
      .query('SELECT Id, Email, FullName FROM Users WHERE AccountCode = @accountCode');
      
    if (userRes.recordset.length === 0) {
      return res.status(404).json({ message: 'Không tìm thấy tài khoản với mã UID này' });
    }
    
    const user = userRes.recordset[0];
    
    // Nạp tiền
    await pool.request()
      .input('id', user.Id)
      .input('amount', amount)
      .query('UPDATE Users SET Balance = Balance + @amount WHERE Id = @id');
      
    // Ghi AuditLog
    await pool.request()
      .input('action', 'Nạp tiền (UID)')
      .input('details', `Đã nạp $${amount} cho tài khoản ${user.Email} (${user.FullName}) bằng mã UID: ${accountCode}`)
      .input('createdAt', getTrueTime())
      .query('INSERT INTO AuditLogs (Action, Details, CreatedAt) VALUES (@action, @details, @createdAt)');
      
    // Gửi thông báo cho khách hàng
    await pool.request()
      .input('userId', user.Id)
      .input('msg', `Tài khoản của bạn vừa được nạp $${amount}`)
      .input('createdAt', getTrueTime())
      .query('INSERT INTO Notifications (UserId, Message, CreatedAt) VALUES (@userId, @msg, @createdAt)');
      
    res.json({ success: true, message: `Nạp $${amount} thành công cho ${user.FullName}!` });
  } catch (error) {
    console.error('Lỗi nạp tiền bằng UID:', error);
    res.status(500).json({ message: 'Lỗi server khi nạp tiền bằng UID' });
  }
};

// GET /api/admin/trade-stats
export const getTradeStats = async (req, res) => {
  try {
    const { symbol } = req.query;
    const pool = await poolPromise;
    let query = `
      SELECT BetType, COUNT(*) as UserCount, SUM(BetAmount) as TotalAmount
      FROM BinaryOrders
      WHERE Status = 'PENDING'
    `;
    if (symbol) {
      query += ` AND Symbol = @symbol`;
    }
    query += ` GROUP BY BetType`;

    const request = pool.request();
    if (symbol) {
      request.input('symbol', symbol);
    }
    
    const result = await request.query(query);
    
    let stats = {
      upUsers: 0, upAmount: 0,
      downUsers: 0, downAmount: 0
    };
    
    result.recordset.forEach(row => {
      if (row.BetType === 'UP') {
        stats.upUsers = row.UserCount;
        stats.upAmount = row.TotalAmount || 0;
      } else if (row.BetType === 'DOWN') {
        stats.downUsers = row.UserCount;
        stats.downAmount = row.TotalAmount || 0;
      }
    });
    
    res.json(stats);
  } catch (error) {
    console.error('Lỗi lấy Trade Stats:', error);
    res.status(500).json({ message: 'Lỗi server khi lấy thống kê giao dịch' });
  }
};

// POST /api/admin/users/:id/toggle-status
export const toggleUserStatus = async (req, res) => {
  const { id } = req.params;
  try {
    const pool = await poolPromise;
    // Get current status
    const selectRes = await pool.request()
      .input('id', id)
      .query('SELECT IsActive, Email, FullName FROM Users WHERE Id = @id');
    const user = selectRes.recordset[0];
    if (!user) {
      return res.status(404).json({ message: 'Không tìm thấy người dùng' });
    }

    const newStatus = user.IsActive ? 0 : 1;
    await pool.request()
      .input('id', id)
      .input('newStatus', newStatus)
      .query('UPDATE Users SET IsActive = @newStatus WHERE Id = @id');

    // Add audit log
    const actionText = newStatus ? 'UNLOCK_USER' : 'LOCK_USER';
    const detailText = `Admin thay đổi trạng thái user ${user.Email} thành ${newStatus ? 'Đang hoạt động' : 'Bị khóa'}`;
    const createdAt = new Date();
    await pool.request()
      .input('action', actionText)
      .input('details', detailText)
      .input('createdAt', createdAt)
      .query('INSERT INTO AuditLogs (Action, Details, CreatedAt) VALUES (@action, @details, @createdAt)');

    res.json({ success: true, isActive: newStatus === 1 });
  } catch (error) {
    console.error('Lỗi toggle user status:', error);
    res.status(500).json({ message: 'Lỗi server khi đổi trạng thái user' });
  }
};

// POST /api/admin/users/:id/withdraw
export const withdrawUser = async (req, res) => {
  const { id } = req.params;
  const { amount } = req.body;
  if (!amount || amount <= 0) {
    return res.status(400).json({ message: 'Số tiền rút không hợp lệ' });
  }
  
  try {
    const pool = await poolPromise;
    // Lấy thông tin user
    const userRes = await pool.request()
      .input('id', id)
      .query('SELECT Email, FullName, Balance FROM Users WHERE Id = @id');
    
    if (userRes.recordset.length === 0) {
      return res.status(404).json({ message: 'Không tìm thấy tài khoản' });
    }
    
    const user = userRes.recordset[0];
    if (user.Balance < amount) {
      return res.status(400).json({ message: `Số dư không đủ! Số dư hiện tại là $${user.Balance}` });
    }
    
    // Rút tiền
    await pool.request()
      .input('id', id)
      .input('amount', amount)
      .query('UPDATE Users SET Balance = Balance - @amount WHERE Id = @id');
      
    // Ghi AuditLog
    await pool.request()
      .input('action', 'Rút tiền')
      .input('details', `Đã rút $${amount} cho tài khoản ${user.Email} (${user.FullName})`)
      .input('createdAt', getTrueTime())
      .query('INSERT INTO AuditLogs (Action, Details, CreatedAt) VALUES (@action, @details, @createdAt)');
      
    // Gửi thông báo cho khách hàng
    await pool.request()
      .input('userId', id)
      .input('msg', `Tài khoản của bạn vừa được rút thành công $${amount}`)
      .input('createdAt', getTrueTime())
      .query('INSERT INTO Notifications (UserId, Message, CreatedAt) VALUES (@userId, @msg, @createdAt)');
      
    res.json({ success: true, message: 'Rút tiền thành công!' });
  } catch (error) {
    console.error('Lỗi rút tiền:', error);
    res.status(500).json({ message: 'Lỗi server khi rút tiền' });
  }
};

