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
    if (!user) return res.status(400).json({ message: 'Tài khoản không tồn tại!' });

    const validPassword = await bcrypt.compare(password, user.PasswordHash);
    if (!validPassword) return res.status(400).json({ message: 'Mật khẩu không đúng!' });

    if (!user.IsActive) return res.status(403).json({ message: 'Tài khoản của bạn đã bị khóa' });

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
      .query('SELECT Email, FullName, AccountCode, Country, IdCardType, IdNumber, Balance, PhoneNumber FROM Users WHERE Id = @id');
    
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

