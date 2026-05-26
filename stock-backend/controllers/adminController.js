import { poolPromise } from '../config/db.js';
import { getTrueTime } from '../timeService.js';

// GET /api/admin/audit-logs
export const getAuditLogs = async (req, res) => {
  try {
    const pool = await poolPromise;
    const result = await pool.request().query(`
      SELECT Id, Action, Details, CreatedAt
      FROM AuditLogs
      WHERE Action NOT IN ('PLACE_BINARY_ORDER', 'SETTLE_BINARY_ORDER', 'CLEANUP_LOGS')
      ORDER BY CreatedAt DESC
    `);
    res.json(result.recordset);
  } catch (error) {
    console.error('Lỗi lấy Audit Logs:', error);
    res.status(500).json({ message: 'Lỗi server khi lấy Audit Logs' });
  }
};

// DELETE /api/admin/audit-logs/:id - Xoá một bản ghi nhật ký cụ thể
export const deleteAuditLog = async (req, res) => {
  const { id } = req.params;
  try {
    const pool = await poolPromise;
    const result = await pool.request()
      .input('id', id)
      .query('DELETE FROM AuditLogs WHERE Id = @id');
    if (result.rowsAffected[0] === 0) {
      return res.status(404).json({ message: 'Không tìm thấy nhật ký này' });
    }
    res.json({ success: true, message: 'Đã xoá nhật ký thành công!' });
  } catch (error) {
    console.error('Lỗi xoá nhật ký:', error);
    res.status(500).json({ message: 'Lỗi server khi xoá nhật ký: ' + error.message });
  }
};

// GET /api/admin/users
export const getUsers = async (req, res) => {
  try {
    const pool = await poolPromise;
    const result = await pool.request().query(`
      SELECT u.Id, u.Email, u.FullName, u.IsActive, u.Balance, u.AccountCode,
             CASE WHEN EXISTS (
                 SELECT 1 FROM UserRoles ur 
                 JOIN Roles r ON ur.RoleId = r.Id 
                 WHERE ur.UserId = u.Id AND r.Name = 'Admin'
             ) THEN 1 ELSE 0 END AS IsAdmin
      FROM Users u
      ORDER BY u.Id ASC
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

    // 1. Thống kê tổng hợp (tổng tiền cược UP/DOWN)
    let statsQuery = `
      SELECT BetType, COUNT(*) as UserCount, SUM(BetAmount) as TotalAmount
      FROM BinaryOrders
      WHERE Status = 'PENDING'
    `;
    if (symbol) {
      statsQuery += ` AND Symbol = @symbol`;
    }
    statsQuery += ` GROUP BY BetType`;

    const statsRequest = pool.request();
    if (symbol) {
      statsRequest.input('symbol', symbol);
    }
    const statsResult = await statsRequest.query(statsQuery);

    let stats = {
      upUsers: 0, upAmount: 0,
      downUsers: 0, downAmount: 0,
      activeBets: []
    };

    statsResult.recordset.forEach(row => {
      if (row.BetType === 'UP') {
        stats.upUsers = row.UserCount;
        stats.upAmount = row.TotalAmount || 0;
      } else if (row.BetType === 'DOWN') {
        stats.downUsers = row.UserCount;
        stats.downAmount = row.TotalAmount || 0;
      }
    });

    // 2. Chi tiết danh sách các lệnh cược đang chờ (active bets) của người dùng
    let betsQuery = `
      SELECT bo.Id, bo.UserId, bo.Symbol, bo.BetAmount, bo.BetType, bo.StartPrice, bo.StartTime, bo.EndTime, bo.Status,
             u.Email, u.FullName, u.AccountCode
      FROM BinaryOrders bo
      JOIN Users u ON bo.UserId = u.Id
      WHERE bo.Status = 'PENDING'
    `;
    if (symbol) {
      betsQuery += ` AND bo.Symbol = @symbol`;
    }
    betsQuery += ` ORDER BY bo.StartTime DESC`;

    const betsRequest = pool.request();
    if (symbol) {
      betsRequest.input('symbol', symbol);
    }
    const betsResult = await betsRequest.query(betsQuery);

    stats.activeBets = betsResult.recordset;

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

    // Kiểm tra xem user có phải Admin không - nếu có thì không được khoá
    const roleCheck = await pool.request()
      .input('userId', id)
      .query(`SELECT r.Name FROM UserRoles ur JOIN Roles r ON ur.RoleId = r.Id WHERE ur.UserId = @userId`);
    const isAdmin = roleCheck.recordset.some(r => r.Name === 'Admin');
    if (isAdmin) {
      return res.status(403).json({ message: 'Không thể khoá tài khoản Admin!' });
    }

    const newStatus = user.IsActive ? 0 : 1;
    await pool.request()
      .input('id', id)
      .input('newStatus', newStatus)
      .query('UPDATE Users SET IsActive = @newStatus WHERE Id = @id');

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

// DELETE /api/admin/users/cleanup - Xoá tất cả user không phải Admin
export const deleteNonAdminUsers = async (req, res) => {
  try {
    const pool = await poolPromise;

    // Lấy danh sách ID admin
    const adminIds = await pool.request().query(`
      SELECT ur.UserId FROM UserRoles ur JOIN Roles r ON ur.RoleId = r.Id WHERE r.Name = 'Admin'
    `);
    const adminIdList = adminIds.recordset.map(r => r.UserId);
    if (adminIdList.length === 0) {
      return res.status(400).json({ message: 'Không tìm thấy tài khoản Admin nào' });
    }

    // Xoá BinaryOrders của non-admin
    await pool.request().query(`
      DELETE FROM BinaryOrders WHERE UserId NOT IN (SELECT ur.UserId FROM UserRoles ur JOIN Roles r ON ur.RoleId = r.Id WHERE r.Name = 'Admin')
    `);

    // Xoá Notifications của non-admin
    await pool.request().query(`
      DELETE FROM Notifications WHERE UserId NOT IN (SELECT ur.UserId FROM UserRoles ur JOIN Roles r ON ur.RoleId = r.Id WHERE r.Name = 'Admin')
    `);

    // Xoá UserRoles của non-admin
    await pool.request().query(`
      DELETE FROM UserRoles WHERE UserId NOT IN (SELECT ur2.UserId FROM (SELECT ur.UserId FROM UserRoles ur JOIN Roles r ON ur.RoleId = r.Id WHERE r.Name = 'Admin') ur2)
    `);

    // Xoá Users không phải admin
    const delResult = await pool.request().query(`
      DELETE FROM Users WHERE Id NOT IN (SELECT ur.UserId FROM UserRoles ur JOIN Roles r ON ur.RoleId = r.Id WHERE r.Name = 'Admin')
    `);

    // Ghi log
    await pool.request()
      .input('action', 'CLEANUP_USERS')
      .input('details', `Đã xoá ${delResult.rowsAffected[0]} tài khoản không phải Admin`)
      .input('createdAt', getTrueTime())
      .query('INSERT INTO AuditLogs (Action, Details, CreatedAt) VALUES (@action, @details, @createdAt)');

    res.json({ success: true, message: `Đã xoá ${delResult.rowsAffected[0]} tài khoản thành công!` });
  } catch (error) {
    console.error('Lỗi xoá users:', error);
    res.status(500).json({ message: 'Lỗi server khi xoá tài khoản: ' + error.message });
  }
};

// DELETE /api/admin/chat/cleanup - Xoá toàn bộ lịch sử tin nhắn
export const clearAllChats = async (req, res) => {
  try {
    const pool = await poolPromise;

    // Xoá tin nhắn trước (vì có FK tới ChatSessions)
    const msgResult = await pool.request().query('DELETE FROM ChatMessages');
    // Xoá session
    const sessResult = await pool.request().query('DELETE FROM ChatSessions');

    // Ghi log
    await pool.request()
      .input('action', 'CLEANUP_CHATS')
      .input('details', `Đã xoá ${msgResult.rowsAffected[0]} tin nhắn và ${sessResult.rowsAffected[0]} phiên chat`)
      .input('createdAt', getTrueTime())
      .query('INSERT INTO AuditLogs (Action, Details, CreatedAt) VALUES (@action, @details, @createdAt)');

    res.json({ success: true, message: `Đã xoá ${msgResult.rowsAffected[0]} tin nhắn và ${sessResult.rowsAffected[0]} phiên chat!` });
  } catch (error) {
    console.error('Lỗi xoá chat:', error);
    res.status(500).json({ message: 'Lỗi server khi xoá chat: ' + error.message });
  }
};

// DELETE /api/admin/users/:id - Xoá một user cụ thể
export const deleteUser = async (req, res) => {
  const { id } = req.params;
  try {
    const pool = await poolPromise;

    // Kiểm tra user có phải admin không
    const roleCheck = await pool.request()
      .input('userId', id)
      .query(`SELECT r.Name FROM UserRoles ur JOIN Roles r ON ur.RoleId = r.Id WHERE ur.UserId = @userId`);
    const isAdmin = roleCheck.recordset.some(r => r.Name === 'Admin');
    if (isAdmin) {
      return res.status(403).json({ message: 'Không thể xoá tài khoản Admin!' });
    }

    // Lấy email để ghi log
    const userRes = await pool.request().input('id', id).query('SELECT Email FROM Users WHERE Id = @id');
    if (userRes.recordset.length === 0) {
      return res.status(404).json({ message: 'Không tìm thấy user' });
    }
    const userEmail = userRes.recordset[0].Email;

    // Xoá dữ liệu liên quan
    await pool.request().input('id', id).query('DELETE FROM BinaryOrders WHERE UserId = @id');
    await pool.request().input('id', id).query('DELETE FROM Notifications WHERE UserId = @id');
    await pool.request().input('id', id).query('DELETE FROM UserRoles WHERE UserId = @id');

    // Xoá chat sessions liên quan
    const sessionId = 'auth_user_' + id;
    await pool.request().input('sid', sessionId).query('DELETE FROM ChatMessages WHERE SessionId = @sid');
    await pool.request().input('sid', sessionId).query('DELETE FROM ChatSessions WHERE SessionId = @sid');

    // Xoá user
    await pool.request().input('id', id).query('DELETE FROM Users WHERE Id = @id');

    // Ghi log
    await pool.request()
      .input('action', 'DELETE_USER')
      .input('details', `Đã xoá tài khoản ${userEmail}`)
      .input('createdAt', getTrueTime())
      .query('INSERT INTO AuditLogs (Action, Details, CreatedAt) VALUES (@action, @details, @createdAt)');

    res.json({ success: true, message: `Đã xoá tài khoản ${userEmail}!` });
  } catch (error) {
    console.error('Lỗi xoá user:', error);
    res.status(500).json({ message: 'Lỗi server khi xoá user: ' + error.message });
  }
};

// DELETE /api/admin/audit-logs/cleanup - Xoá sạch nhật ký hệ thống
export const clearAuditLogs = async (req, res) => {
  try {
    const pool = await poolPromise;
    const result = await pool.request().query(`
      DELETE FROM AuditLogs 
      WHERE Action NOT IN ('PLACE_BINARY_ORDER', 'SETTLE_BINARY_ORDER')
    `);
    
    // Ghi log hành động dọn dẹp
    await pool.request()
      .input('action', 'CLEANUP_LOGS')
      .input('details', `Đã xoá sạch ${result.rowsAffected[0]} nhật ký hệ thống`)
      .input('createdAt', getTrueTime())
      .query('INSERT INTO AuditLogs (Action, Details, CreatedAt) VALUES (@action, @details, @createdAt)');

    res.json({ success: true, message: `Đã xoá sạch ${result.rowsAffected[0]} nhật ký hệ thống!` });
  } catch (error) {
    console.error('Lỗi xoá nhật ký hệ thống:', error);
    res.status(500).json({ message: 'Lỗi server khi xoá nhật ký hệ thống: ' + error.message });
  }
};

// DELETE /api/admin/chat/session/:sessionId - Xoá một phiên chat cụ thể
export const deleteChatSession = async (req, res) => {
  const { sessionId } = req.params;
  try {
    const pool = await poolPromise;
    // Xoá tin nhắn của session này
    const msgResult = await pool.request()
      .input('sid', sessionId)
      .query('DELETE FROM ChatMessages WHERE SessionId = @sid');
      
    // Xoá session
    const sessResult = await pool.request()
      .input('sid', sessionId)
      .query('DELETE FROM ChatSessions WHERE SessionId = @sid');

    // Ghi log
    await pool.request()
      .input('action', 'DELETE_CHAT_SESSION')
      .input('details', `Đã xoá phiên chat ${sessionId} (${msgResult.rowsAffected[0]} tin nhắn)`)
      .input('createdAt', getTrueTime())
      .query('INSERT INTO AuditLogs (Action, Details, CreatedAt) VALUES (@action, @details, @createdAt)');

    res.json({ success: true, message: `Đã xoá thành công phiên chat và lịch sử tin nhắn!` });
  } catch (error) {
    console.error('Lỗi xoá phiên chat:', error);
    res.status(500).json({ message: 'Lỗi server khi xoá phiên chat: ' + error.message });
  }
};
