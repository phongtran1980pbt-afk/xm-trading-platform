import sql from 'mssql';
import { poolPromise } from '../config/db.js';

// GET /api/notifications/:userId
export const getNotifications = async (req, res) => {
  const { userId } = req.params;
  try {
    const pool = await poolPromise;
    const result = await pool.request()
      .input('userId', sql.Int, userId)
      .query(`
        SELECT Id, Message, IsRead, CreatedAt 
        FROM Notifications 
        WHERE UserId = @userId 
        ORDER BY CreatedAt DESC
      `);
    res.json(result.recordset);
  } catch (error) {
    console.error('Lỗi lấy thông báo:', error);
    res.status(500).json({ message: 'Lỗi server' });
  }
};

// POST /api/notifications/:userId/read
export const markNotificationsAsRead = async (req, res) => {
  const { userId } = req.params;
  try {
    const pool = await poolPromise;
    await pool.request()
      .input('userId', sql.Int, userId)
      .query(`
        UPDATE Notifications 
        SET IsRead = 1 
        WHERE UserId = @userId AND IsRead = 0
      `);
    res.json({ success: true });
  } catch (error) {
    console.error('Lỗi cập nhật trạng thái thông báo:', error);
    res.status(500).json({ message: 'Lỗi server' });
  }
};
