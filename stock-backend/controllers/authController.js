import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import sql from 'mssql';
import { poolPromise, SECRET_KEY } from '../config/db.js';

export const register = async (req, res) => {
  const { email, password, fullName } = req.body;
  
  try {
    const pool = await poolPromise;

    if (!pool) {
      return res.status(500).json({ 
        message: 'Lỗi: Không thể kết nối đến cơ sở dữ liệu SQL Server. Vui lòng kiểm tra cấu hình trong db.js' 
      });
    }

    // 1. Kiểm tra email đã tồn tại chưa
    const checkUser = await pool.request()
      .input('email', sql.NVarChar, email)
      .query('SELECT * FROM Users WHERE Email = @email');

    if (checkUser.recordset.length > 0) {
      return res.status(400).json({ message: 'Email này đã được đăng ký!' });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // 2. Lưu vào bảng Users
    const insertUser = await pool.request()
      .input('email', sql.NVarChar, email)
      .input('password', sql.NVarChar, hashedPassword)
      .input('fullName', sql.NVarChar, fullName)
      .query('INSERT INTO Users (Email, PasswordHash, FullName, IsActive) OUTPUT INSERTED.Id VALUES (@email, @password, @fullName, 1)');

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
      .query('INSERT INTO AuditLogs (Action, Details) VALUES (@action, @details)');

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
        WHERE u.Email = @email
      `);

    const user = result.recordset[0];
    if (!user) return res.status(400).json({ message: 'Email không tồn tại!' });

    const validPassword = await bcrypt.compare(password, user.PasswordHash);
    if (!validPassword) return res.status(400).json({ message: 'Mật khẩu không đúng!' });

    if (!user.IsActive) return res.status(403).json({ message: 'Tài khoản đã bị khóa!' });

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
        role,                       // 'Admin' hoặc 'Customer'
        isAdmin: role === 'Admin',   // tiện dùng ở frontend
      } 
    });

  } catch (error) {
    console.error('Lỗi Login:', error);
    res.status(500).json({ message: 'Lỗi máy chủ khi đăng nhập!' });
  }
};

