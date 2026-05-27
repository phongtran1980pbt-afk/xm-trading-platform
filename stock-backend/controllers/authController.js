import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import sql from 'mssql';
import { poolPromise, SECRET_KEY } from '../config/db.js';
import { getTrueTime } from '../timeService.js';

export const register = async (req, res) => {
  const { email, password, fullName, country, idCardType, idNumber, idFrontPhoto, idBackPhoto, phoneNumber } = req.body;
  
  try {
    const pool = await poolPromise;

    if (!pool) {
      return res.status(500).json({ 
        message: 'Lỗi: Không thể kết nối đến cơ sở dữ liệu SQL Server. Vui lòng kiểm tra cấu hình trong db.js' 
      });
    }

    // 1. Kiểm tra email hoặc số điện thoại đã tồn tại chưa
    const checkUser = await pool.request()
      .input('email', sql.NVarChar, email)
      .input('phoneNumber', sql.NVarChar, phoneNumber || '')
      .query('SELECT * FROM Users WHERE Email = @email OR (PhoneNumber != \'\' AND PhoneNumber = @phoneNumber) OR Email = @phoneNumber');

    if (checkUser.recordset.length > 0) {
      const existingUser = checkUser.recordset[0];
      if (existingUser.Email === email) {
        return res.status(400).json({ message: email.includes('@') ? 'Email này đã được đăng ký!' : 'Số điện thoại này đã được đăng ký!' });
      } else {
        return res.status(400).json({ message: 'Số điện thoại này đã được đăng ký!' });
      }
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Generate 8-digit AccountCode
    const accountCode = Math.floor(10000000 + Math.random() * 90000000).toString();

    // 2. Lưu vào bảng Users với các trường KYC và PhoneNumber
    const insertUser = await pool.request()
      .input('email', sql.NVarChar, email)
      .input('password', sql.NVarChar, hashedPassword)
      .input('fullName', sql.NVarChar, fullName ? fullName.toUpperCase() : 'NHÀ GIAO DỊCH KANET')
      .input('accountCode', sql.NVarChar, accountCode)
      .input('country', sql.NVarChar, country || 'Vietnam')
      .input('idCardType', sql.NVarChar, idCardType || 'Thẻ căn cước')
      .input('idNumber', sql.NVarChar, idNumber || '')
      .input('idFrontPhoto', sql.NVarChar, idFrontPhoto || '')
      .input('idBackPhoto', sql.NVarChar, idBackPhoto || '')
      .input('phoneNumber', sql.NVarChar, phoneNumber || '')
      .query(`
        INSERT INTO Users 
        (Email, PasswordHash, FullName, AccountCode, IsActive, Country, IdCardType, IdNumber, IdFrontPhoto, IdBackPhoto, PhoneNumber) 
        OUTPUT INSERTED.Id 
        VALUES 
        (@email, @password, @fullName, @accountCode, 1, @country, @idCardType, @idNumber, @idFrontPhoto, @idBackPhoto, @phoneNumber)
      `);

    const newUserId = insertUser.recordset[0].Id;

    // 3. LUÔN LUÔN gán Role "Customer" (RoleId = 2)
    await pool.request()
      .input('userId', sql.Int, newUserId)
      .input('roleId', sql.Int, 2) 
      .query('INSERT INTO UserRoles (UserId, RoleId) VALUES (@userId, @roleId)');

    // 4. Ghi log tạo tài khoản
    await pool.request()
      .input('action', sql.NVarChar, 'Tạo tài khoản')
      .input('details', sql.NVarChar, `Tài khoản ${email} đã được tạo thành công`)
      .input('createdAt', sql.DateTime, getTrueTime())
      .query('INSERT INTO AuditLogs (Action, Details, CreatedAt) VALUES (@action, @details, @createdAt)');

    res.status(201).json({ message: 'Đăng ký thành công và đã lưu vào SQL!' });

  } catch (error) {
    console.error('Lỗi Backend (Register):', error);
    res.status(500).json({ message: 'Lỗi hệ thống: ' + error.message });
  }
};

export const login = async (req, res) => {
  const { email, password } = req.body;
  
  try {
    const pool = await poolPromise;

    if (!pool) {
      return res.status(500).json({ 
        message: 'Lỗi: Không thể kết nối đến cơ sở dữ liệu SQL Server. Vui lòng kiểm tra cấu hình trong db.js' 
      });
    }

    // Lấy user + role cùng lúc bằng JOIN
    const result = await pool.request()
      .input('email', sql.NVarChar, email)
      .query(`
        SELECT u.*, r.Name AS RoleName
        FROM Users u
        LEFT JOIN UserRoles ur ON u.Id = ur.UserId
        LEFT JOIN Roles r ON ur.RoleId = r.Id
        WHERE u.Email = @email OR u.PhoneNumber = @email
      `);

    const user = result.recordset[0];
    const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress || '127.0.0.1';
    const cleanIp = ip.replace('::ffff:', '').replace('::1', '127.0.0.1');
    const ua = req.headers['user-agent'] || '';
    const { device, browser } = parseUserAgent(ua);

    if (!user) return res.status(400).json({ message: 'Tài khoản không tồn tại!' });

    const validPassword = await bcrypt.compare(password, user.PasswordHash);
    if (!validPassword) {
      // Ghi nhận đăng nhập thất bại
      try {
        await pool.request()
          .input('userId', sql.Int, user.Id)
          .input('ipAddress', sql.NVarChar, cleanIp)
          .input('device', sql.NVarChar, device)
          .input('browser', sql.NVarChar, browser)
          .input('status', sql.NVarChar, 'Thất bại')
          .input('createdAt', sql.DateTime, getTrueTime())
          .query(`
            INSERT INTO LoginHistory (UserId, IpAddress, Device, Browser, Status, CreatedAt)
            VALUES (@userId, @ipAddress, @device, @browser, @status, @createdAt)
          `);
      } catch (err) {
        console.error('Lỗi ghi nhận lịch sử đăng nhập thất bại:', err);
      }
      return res.status(400).json({ message: 'Mật khẩu không đúng!' });
    }

    if (!user.IsActive) return res.status(403).json({ message: 'Tài khoản của bạn đã bị khóa' });

    // Ghi nhận đăng nhập thành công
    try {
      await pool.request()
        .input('userId', sql.Int, user.Id)
        .input('ipAddress', sql.NVarChar, cleanIp)
        .input('device', sql.NVarChar, device)
        .input('browser', sql.NVarChar, browser)
        .input('status', sql.NVarChar, 'Thành công')
        .input('createdAt', sql.DateTime, getTrueTime())
        .query(`
          INSERT INTO LoginHistory (UserId, IpAddress, Device, Browser, Status, CreatedAt)
          VALUES (@userId, @ipAddress, @device, @browser, @status, @createdAt)
        `);
    } catch (err) {
      console.error('Lỗi ghi nhận lịch sử đăng nhập thành công:', err);
    }

    const role = user.RoleName || 'Customer';
    const token = jwt.sign(
      { id: user.Id, email: user.Email, role },
      SECRET_KEY,
      { expiresIn: '8h' }
    );
    
    res.json({ 
      message: 'Đăng nhập thành công!', 
      token, 
      user: { 
        id: user.Id, 
        email: user.Email, 
        fullName: user.FullName,
        accountCode: user.AccountCode,
        role,                       // 'Admin' hoặc 'Customer'
        isAdmin: role === 'Admin',   // tiện dùng ở frontend
      } 
    });

  } catch (error) {
    console.error('Lỗi Login:', error);
    res.status(500).json({ message: 'Lỗi máy chủ khi đăng nhập!' });
  }
};

export const getBalance = async (req, res) => {
  const { id } = req.params;
  try {
    const pool = await poolPromise;
    const result = await pool.request()
      .input('id', sql.Int, id)
      .query('SELECT Balance FROM Users WHERE Id = @id');
    
    if (result.recordset.length === 0) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    res.json({ balance: result.recordset[0].Balance });
  } catch (error) {
    console.error('Lỗi lấy số dư:', error);
    res.status(500).json({ message: 'Lỗi server' });
  }
};

export const getProfile = async (req, res) => {
  const { id } = req.params;
  try {
    const pool = await poolPromise;
    const result = await pool.request()
      .input('id', sql.Int, id)
      .query(`
        SELECT Email, FullName, AccountCode, Country, IdCardType, IdNumber, Balance, PhoneNumber,
               CASE WHEN IdFrontPhoto IS NOT NULL AND IdFrontPhoto <> '' THEN 1 ELSE 0 END AS HasFrontPhoto,
               CASE WHEN IdBackPhoto IS NOT NULL AND IdBackPhoto <> '' THEN 1 ELSE 0 END AS HasBackPhoto
        FROM Users 
        WHERE Id = @id
      `);
    
    if (result.recordset.length === 0) {
      return res.status(404).json({ message: 'Không tìm thấy người dùng!' });
    }
    
    res.json(result.recordset[0]);
  } catch (error) {
    console.error('Lỗi lấy profile:', error);
    res.status(500).json({ message: 'Lỗi server khi lấy thông tin người dùng!' });
  }
};

export const checkUserExists = async (req, res) => {
  const { email } = req.body;
  if (!email) {
    return res.status(400).json({ message: 'Vui lòng cung cấp email hoặc số điện thoại!' });
  }
  try {
    const pool = await poolPromise;
    if (!pool) {
      return res.status(500).json({ message: 'Lỗi kết nối cơ sở dữ liệu' });
    }
    const result = await pool.request()
      .input('email', sql.NVarChar, email)
      .query('SELECT Id, IsActive FROM Users WHERE Email = @email OR PhoneNumber = @email');
      
    if (result.recordset.length === 0) {
      return res.status(404).json({ exists: false, message: 'Tài khoản chưa được đăng ký!' });
    }
    
    const user = result.recordset[0];
    if (!user.IsActive) {
      return res.status(403).json({ exists: true, isActive: false, message: 'Tài khoản của bạn đã bị khóa' });
    }
    
    res.json({ exists: true, isActive: true });
  } catch (error) {
    console.error('Lỗi kiểm tra user:', error);
    res.status(500).json({ message: 'Lỗi hệ thống khi kiểm tra tài khoản!' });
  }
};

export const updateKyc = async (req, res) => {
  const { id } = req.params;
  const { fullName, country, idCardType, idNumber, idFrontPhoto, idBackPhoto, phoneNumber } = req.body;
  
  try {
    const pool = await poolPromise;
    if (!pool) {
      return res.status(500).json({ message: 'Lỗi kết nối cơ sở dữ liệu' });
    }
    
    // Kiểm tra CCCD đã được sử dụng chưa
    if (idNumber) {
      const checkId = await pool.request()
        .input('id', id)
        .input('idNumber', idNumber)
        .query('SELECT Id FROM Users WHERE IdNumber = @idNumber AND Id != @id');
        
      if (checkId.recordset.length > 0) {
        return res.status(400).json({ message: 'Số CCCD này đã được đăng ký bởi tài khoản khác!' });
      }
    }

    await pool.request()
      .input('id', id)
      .input('fullName', fullName ? fullName.toUpperCase() : null)
      .input('country', country || null)
      .input('idCardType', idCardType || null)
      .input('idNumber', idNumber || null)
      .input('idFrontPhoto', idFrontPhoto || null)
      .input('idBackPhoto', idBackPhoto || null)
      .input('phoneNumber', phoneNumber || null)
      .query(`
        UPDATE Users 
        SET FullName = COALESCE(@fullName, FullName),
            Country = COALESCE(@country, Country),
            IdCardType = COALESCE(@idCardType, IdCardType),
            IdNumber = COALESCE(@idNumber, IdNumber),
            IdFrontPhoto = COALESCE(@idFrontPhoto, IdFrontPhoto),
            IdBackPhoto = COALESCE(@idBackPhoto, IdBackPhoto),
            PhoneNumber = COALESCE(@phoneNumber, PhoneNumber)
        WHERE Id = @id
      `);

    // Ghi log hoạt động
    const userRes = await pool.request().input('id', id).query('SELECT Email FROM Users WHERE Id = @id');
    const userEmail = userRes.recordset[0]?.Email || 'Unknown';
    
    await pool.request()
      .input('action', 'Cập nhật KYC')
      .input('details', `Người dùng ${userEmail} đã cập nhật thông tin xác thực KYC`)
      .input('createdAt', getTrueTime())
      .query('INSERT INTO AuditLogs (Action, Details, CreatedAt) VALUES (@action, @details, @createdAt)');

    res.json({ success: true, message: 'Cập nhật thông tin xác thực KYC thành công!' });
  } catch (error) {
    console.error('Lỗi cập nhật KYC:', error);
    res.status(500).json({ message: 'Lỗi server khi cập nhật KYC: ' + error.message });
  }
};

function parseUserAgent(ua) {
  if (!ua) return { device: 'Unknown Device', browser: 'Unknown Browser' };
  let browser = 'Unknown Browser';
  let device = 'PC / Desktop';

  // Basic browser detection
  if (ua.includes('Firefox')) browser = 'Firefox';
  else if (ua.includes('Chrome') && ua.includes('Safari')) {
    if (ua.includes('Edg')) browser = 'Edge';
    else if (ua.includes('OPR') || ua.includes('Opera')) browser = 'Opera';
    else browser = 'Chrome';
  }
  else if (ua.includes('Safari') && !ua.includes('Chrome')) browser = 'Safari';
  else if (ua.includes('MSIE') || ua.includes('Trident')) browser = 'Internet Explorer';

  // Basic device/OS detection
  if (ua.includes('Mobi') || ua.includes('Android') || ua.includes('iPhone') || ua.includes('iPad')) {
    if (ua.includes('iPhone')) device = 'iPhone';
    else if (ua.includes('iPad')) device = 'iPad';
    else if (ua.includes('Android')) device = 'Android Mobile';
    else device = 'Mobile Device';
  } else {
    if (ua.includes('Windows')) device = 'Windows PC';
    else if (ua.includes('Macintosh')) device = 'macOS';
    else if (ua.includes('Linux')) device = 'Linux PC';
  }

  return { device, browser };
}

export const changePassword = async (req, res) => {
  const { id } = req.params;
  const { oldPassword, newPassword } = req.body;

  try {
    const pool = await poolPromise;
    // Lấy user
    const checkUser = await pool.request()
      .input('id', sql.Int, id)
      .query('SELECT PasswordHash, Email FROM Users WHERE Id = @id');

    if (checkUser.recordset.length === 0) {
      return res.status(404).json({ message: 'Không tìm thấy người dùng!' });
    }

    const user = checkUser.recordset[0];

    // Kiểm tra mật khẩu cũ
    const validPassword = await bcrypt.compare(oldPassword, user.PasswordHash);
    if (!validPassword) {
      return res.status(400).json({ message: 'Mật khẩu cũ không chính xác!' });
    }

    // Mã hóa mật khẩu mới
    const salt = await bcrypt.genSalt(10);
    const newPasswordHash = await bcrypt.hash(newPassword, salt);

    // Cập nhật
    await pool.request()
      .input('id', sql.Int, id)
      .input('newPasswordHash', sql.NVarChar, newPasswordHash)
      .query('UPDATE Users SET PasswordHash = @newPasswordHash WHERE Id = @id');

    // Ghi log
    await pool.request()
      .input('action', 'Đổi mật khẩu')
      .input('details', `Người dùng ${user.Email} đã đổi mật khẩu tài khoản`)
      .input('createdAt', getTrueTime())
      .query('INSERT INTO AuditLogs (Action, Details, CreatedAt) VALUES (@action, @details, @createdAt)');

    res.json({ success: true, message: 'Đổi mật khẩu thành công!' });
  } catch (error) {
    console.error('Lỗi đổi mật khẩu:', error);
    res.status(500).json({ message: 'Lỗi server khi đổi mật khẩu!' });
  }
};

export const getLoginHistory = async (req, res) => {
  const { id } = req.params;
  try {
    const pool = await poolPromise;
    const result = await pool.request()
      .input('id', sql.Int, id)
      .query(`
        SELECT TOP 20 Id, IpAddress, Device, Browser, Status, CreatedAt 
        FROM LoginHistory 
        WHERE UserId = @id 
        ORDER BY CreatedAt DESC
      `);
    
    res.json(result.recordset);
  } catch (error) {
    console.error('Lỗi lấy lịch sử đăng nhập:', error);
    res.status(500).json({ message: 'Lỗi server khi lấy lịch sử đăng nhập: ' + error.message });
  }
};

export const getTransactionHistory = async (req, res) => {
  const { id } = req.params;
  try {
    const pool = await poolPromise;
    
    // 1. Lấy thông tin user (email)
    const userRes = await pool.request()
      .input('id', sql.Int, id)
      .query('SELECT Email FROM Users WHERE Id = @id');
      
    if (userRes.recordset.length === 0) {
      return res.status(404).json({ message: 'Không tìm thấy người dùng!' });
    }
    const email = userRes.recordset[0].Email;

    // 2. Lấy BinaryOrders của user
    const ordersRes = await pool.request()
      .input('userId', sql.Int, id)
      .query(`
        SELECT Id, Symbol, BetAmount, BetType, StartPrice, EndPrice, StartTime, EndTime, Status, Payout 
        FROM BinaryOrders 
        WHERE UserId = @userId
        ORDER BY StartTime DESC
      `);

    // 3. Lấy AuditLogs liên quan nạp/rút của user email
    const logsRes = await pool.request()
      .input('emailFilter', sql.NVarChar, `%tài khoản ${email}%`)
      .query(`
        SELECT Id, Action, Details, CreatedAt 
        FROM AuditLogs 
        WHERE Details LIKE @emailFilter 
          AND (Action LIKE N'Nạp tiền%' OR Action LIKE N'Rút tiền%')
        ORDER BY CreatedAt DESC
      `);

    // 4. Kết hợp và định dạng
    const transactions = [];

    // Chuyển BinaryOrders sang định dạng giao dịch
    ordersRes.recordset.forEach(order => {
      let type = 'Đặt cược';
      let amount = order.BetAmount;
      let profit = 0;

      if (order.Status === 'WIN') {
        type = 'Thắng cược';
        amount = order.Payout;
        profit = order.Payout - order.BetAmount;
      } else if (order.Status === 'LOSE') {
        type = 'Thua cược';
        amount = order.BetAmount;
        profit = -order.BetAmount;
      } else if (order.Status === 'TIE') {
        type = 'Hòa cược';
        amount = order.BetAmount;
        profit = 0;
      } else {
        type = 'Đang chờ';
        amount = order.BetAmount;
        profit = 0;
      }

      transactions.push({
        id: `bet-${order.Id}`,
        date: order.EndTime || order.StartTime,
        type: type,
        amount: amount,
        betAmount: order.BetAmount,
        payout: order.Payout,
        profit: profit,
        description: `Đặt cược ${order.Symbol} (${order.BetType}) - Giá vào: ${order.StartPrice} -> Giá ra: ${order.EndPrice || 'chờ'}`,
        rawType: 'bet',
        status: order.Status
      });
    });

    // Chuyển AuditLogs sang định dạng giao dịch
    logsRes.recordset.forEach(log => {
      let type = 'Khác';
      if (log.Action.includes('Nạp tiền')) {
        type = 'Nạp tiền';
      } else if (log.Action.includes('Rút tiền')) {
        type = 'Rút tiền';
      }

      let amount = 0;
      const match = log.Details.match(/Đã (?:nạp|rút) \$([0-9.]+)/);
      if (match && match[1]) {
        amount = parseFloat(match[1]);
      }

      transactions.push({
        id: `log-${log.Id}`,
        date: log.CreatedAt,
        type: type,
        amount: amount,
        profit: type === 'Nạp tiền' ? amount : -amount,
        description: log.Details,
        rawType: 'log',
        status: 'SUCCESS'
      });
    });

    // Sắp xếp theo ngày giảm dần
    transactions.sort((a, b) => new Date(b.date) - new Date(a.date));

    res.json(transactions);
  } catch (error) {
    console.error('Lỗi lấy lịch sử giao dịch:', error);
    res.status(500).json({ message: 'Lỗi server khi lấy lịch sử giao dịch: ' + error.message });
  }
};

// GET /api/auth/profile/:id/bank-info
export const getBankInfo = async (req, res) => {
  const { id } = req.params;
  try {
    const pool = await poolPromise;
    const result = await pool.request()
      .input('id', sql.Int, id)
      .query(`
        SELECT BankName, BankAccountNumber, BankAccountHolder, BankBranch
        FROM Users WHERE Id = @id
      `);

    if (result.recordset.length === 0) {
      return res.status(404).json({ message: 'Không tìm thấy người dùng!' });
    }

    res.json(result.recordset[0]);
  } catch (error) {
    console.error('Lỗi lấy thông tin ngân hàng:', error);
    res.status(500).json({ message: 'Lỗi server khi lấy thông tin ngân hàng: ' + error.message });
  }
};

// POST /api/auth/profile/:id/bank-info
export const saveBankInfo = async (req, res) => {
  const { id } = req.params;
  const { bankName, bankAccountNumber, bankAccountHolder, bankBranch } = req.body;

  if (!bankName || !bankAccountNumber || !bankAccountHolder) {
    return res.status(400).json({ message: 'Vui lòng nhập đầy đủ thông tin ngân hàng!' });
  }

  try {
    const pool = await poolPromise;

    await pool.request()
      .input('id', sql.Int, id)
      .input('bankName', sql.NVarChar, bankName)
      .input('bankAccountNumber', sql.NVarChar, bankAccountNumber)
      .input('bankAccountHolder', sql.NVarChar, bankAccountHolder.toUpperCase())
      .input('bankBranch', sql.NVarChar, bankBranch || '')
      .query(`
        UPDATE Users 
        SET BankName = @bankName,
            BankAccountNumber = @bankAccountNumber,
            BankAccountHolder = @bankAccountHolder,
            BankBranch = @bankBranch
        WHERE Id = @id
      `);

    // Log
    const userRes = await pool.request().input('id', sql.Int, id).query('SELECT Email FROM Users WHERE Id = @id');
    const email = userRes.recordset[0]?.Email || 'Unknown';

    await pool.request()
      .input('action', sql.NVarChar, 'Cập nhật ngân hàng')
      .input('details', sql.NVarChar, `Người dùng ${email} đã cập nhật thông tin ngân hàng: ${bankName} - ${bankAccountNumber}`)
      .input('createdAt', sql.DateTime, getTrueTime())
      .query('INSERT INTO AuditLogs (Action, Details, CreatedAt) VALUES (@action, @details, @createdAt)');

    res.json({ success: true, message: 'Cập nhật thông tin ngân hàng thành công!' });
  } catch (error) {
    console.error('Lỗi lưu thông tin ngân hàng:', error);
    res.status(500).json({ message: 'Lỗi server khi lưu thông tin ngân hàng: ' + error.message });
  }
};

// POST /api/auth/profile/:id/withdraw-request
export const createWithdrawRequest = async (req, res) => {
  const { id } = req.params;
  const { amount } = req.body;

  if (!amount || parseFloat(amount) <= 0) {
    return res.status(400).json({ message: 'Số tiền rút không hợp lệ!' });
  }

  try {
    const pool = await poolPromise;

    // Kiểm tra user và số dư
    const userRes = await pool.request()
      .input('id', sql.Int, id)
      .query(`
        SELECT Email, FullName, Balance, BankName, BankAccountNumber, BankAccountHolder, BankBranch
        FROM Users WHERE Id = @id
      `);

    if (userRes.recordset.length === 0) {
      return res.status(404).json({ message: 'Không tìm thấy người dùng!' });
    }

    const user = userRes.recordset[0];

    // Kiểm tra tài khoản ngân hàng đã liên kết chưa
    if (!user.BankAccountNumber) {
      return res.status(400).json({ message: 'Vui lòng liên kết tài khoản ngân hàng trước khi rút tiền!' });
    }

    // Kiểm tra số dư
    if (parseFloat(user.Balance) < parseFloat(amount)) {
      return res.status(400).json({ 
        message: `Số dư không đủ! Số dư hiện tại: $${parseFloat(user.Balance).toLocaleString('en-US', { minimumFractionDigits: 2 })}` 
      });
    }

    // Tạo yêu cầu rút tiền
    await pool.request()
      .input('userId', sql.Int, id)
      .input('amount', sql.Decimal(18, 2), parseFloat(amount))
      .input('bankName', sql.NVarChar, user.BankName || '')
      .input('bankAccountNumber', sql.NVarChar, user.BankAccountNumber)
      .input('bankAccountHolder', sql.NVarChar, user.BankAccountHolder || '')
      .input('bankBranch', sql.NVarChar, user.BankBranch || '')
      .input('createdAt', sql.DateTime, getTrueTime())
      .query(`
        INSERT INTO WithdrawRequests (UserId, Amount, BankName, BankAccountNumber, BankAccountHolder, BankBranch, Status, CreatedAt)
        VALUES (@userId, @amount, @bankName, @bankAccountNumber, @bankAccountHolder, @bankBranch, 'PENDING', @createdAt)
      `);

    // Ghi AuditLog để Admin thấy
    await pool.request()
      .input('action', sql.NVarChar, 'Yêu cầu rút tiền')
      .input('details', sql.NVarChar, `Người dùng ${user.Email} (${user.FullName}) yêu cầu rút $${parseFloat(amount).toLocaleString('en-US', { minimumFractionDigits: 2 })} về ${user.BankName} - ${user.BankAccountNumber} (${user.BankAccountHolder})`)
      .input('createdAt', sql.DateTime, getTrueTime())
      .query('INSERT INTO AuditLogs (Action, Details, CreatedAt) VALUES (@action, @details, @createdAt)');

    // Gửi thông báo cho user
    await pool.request()
      .input('userId', sql.Int, id)
      .input('msg', sql.NVarChar, `Yêu cầu rút $${parseFloat(amount).toFixed(2)} đang được xử lý. Vui lòng chờ bộ phận hỗ trợ xác nhận.`)
      .input('createdAt', sql.DateTime, getTrueTime())
      .query('INSERT INTO Notifications (UserId, Message, CreatedAt) VALUES (@userId, @msg, @createdAt)');

    res.json({ success: true, message: `Yêu cầu rút $${parseFloat(amount).toFixed(2)} đã được gửi thành công! Vui lòng chờ xác nhận.` });
  } catch (error) {
    console.error('Lỗi tạo yêu cầu rút tiền:', error);
    res.status(500).json({ message: 'Lỗi server khi tạo yêu cầu rút tiền: ' + error.message });
  }
};

// GET /api/auth/profile/:id/withdraw-requests
export const getWithdrawRequests = async (req, res) => {
  const { id } = req.params;
  try {
    const pool = await poolPromise;
    const result = await pool.request()
      .input('id', sql.Int, id)
      .query(`
        SELECT TOP 20 Id, Amount, BankName, BankAccountNumber, BankAccountHolder, BankBranch, Status, Note, CreatedAt, UpdatedAt
        FROM WithdrawRequests
        WHERE UserId = @id
        ORDER BY CreatedAt DESC
      `);

    res.json(result.recordset);
  } catch (error) {
    console.error('Lỗi lấy lịch sử rút tiền:', error);
    res.status(500).json({ message: 'Lỗi server: ' + error.message });
  }
};




