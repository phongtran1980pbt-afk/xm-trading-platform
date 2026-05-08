import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import sql from 'mssql';
import { poolPromise, SECRET_KEY } from '../config/db.js';

// Mảng dự phòng nếu SQL lỗi
const usersFallback = [];

export const register = async (req, res) => {
  const { email, password, fullName } = req.body;
  
  try {
    let pool;
    try {
        pool = await poolPromise;
    } catch (e) {
        console.warn('⚠️ Đang chạy ở chế độ dự phòng (Không có SQL)');
    }

    if (pool) {
        // 1. Kiểm tra email đã tồn tại chưa trong SQL
        const checkUser = await pool.request()
          .input('email', sql.NVarChar, email)
          .query('SELECT * FROM Users WHERE Email = @email');

        if (checkUser.recordset.length > 0) {
          return res.status(400).json({ message: 'Email này đã được đăng ký!' });
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // 2. Lưu vào bảng Users và lấy ID vừa tạo
        const insertUser = await pool.request()
          .input('email', sql.NVarChar, email)
          .input('password', sql.NVarChar, hashedPassword)
          .input('fullName', sql.NVarChar, fullName)
          .query('INSERT INTO Users (Email, PasswordHash, FullName, IsActive) OUTPUT INSERTED.Id VALUES (@email, @password, @fullName, 1)');

        const newUserId = insertUser.recordset[0].Id;

        // 3. Tự động gán Role "Customer" (RoleId = 2)
        await pool.request()
          .input('userId', sql.Int, newUserId)
          .input('roleId', sql.Int, 2) // ID = 2 là role Customer trong init_db.sql
          .query('INSERT INTO UserRoles (UserId, RoleId) VALUES (@userId, @roleId)');
          
    } else {
        // Chế độ dự phòng (RAM)
        if (usersFallback.find(u => u.email === email)) {
            return res.status(400).json({ message: 'Email đã tồn tại (RAM)!' });
        }
        usersFallback.push({ email, fullName });
    }

    res.status(201).json({ message: 'Đăng ký thành công!' });

  } catch (error) {
    console.error('Lỗi Backend:', error);
    res.status(500).json({ message: 'Lỗi: ' + error.message });
  }
};

export const login = async (req, res) => {
  const { email, password } = req.body;
  
  try {
    const pool = await poolPromise;
    const result = await pool.request()
      .input('email', sql.NVarChar, email)
      .query('SELECT * FROM Users WHERE Email = @email');

    const user = result.recordset[0];
    if (!user) return res.status(400).json({ message: 'Email không tồn tại!' });

    const validPassword = await bcrypt.compare(password, user.PasswordHash);
    if (!validPassword) return res.status(400).json({ message: 'Mật khẩu không đúng!' });

    const token = jwt.sign({ id: user.Id, email: user.Email }, SECRET_KEY, { expiresIn: '1h' });
    
    res.json({ 
      message: 'Đăng nhập thành công!', 
      token, 
      user: { id: user.Id, email: user.Email, fullName: user.FullName } 
    });

  } catch (error) {
    console.error('Lỗi Login:', error);
    res.status(500).json({ message: 'Lỗi máy chủ khi đăng nhập!' });
  }
};
