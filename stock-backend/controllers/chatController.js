import sql from 'mssql';
import { poolPromise } from '../config/db.js';

// GET /api/chat/sessions
export const getAllSessions = async (req, res) => {
  try {
    const pool = await poolPromise;
    const result = await pool.request().query(`
      SELECT SessionId, Username, UnreadAdmin, UnreadUser, LastActivity 
      FROM ChatSessions
      ORDER BY LastActivity DESC
    `);
    
    // Transform to an object keyed by SessionId to match previous localStorage format
    const sessions = {};
    for (const row of result.recordset) {
      sessions[row.SessionId] = {
        sessionId: row.SessionId,
        username: row.Username,
        unreadAdmin: row.UnreadAdmin,
        unreadUser: row.UnreadUser,
        lastActivity: row.LastActivity,
      };
    }
    res.json(sessions);
  } catch (error) {
    console.error('Lỗi lấy danh sách session:', error);
    res.status(500).json({ message: 'Lỗi server' });
  }
};

// GET /api/chat/:sessionId
export const getMessagesBySession = async (req, res) => {
  const { sessionId } = req.params;
  try {
    const pool = await poolPromise;
    const result = await pool.request()
      .input('sessionId', sql.NVarChar, sessionId)
      .query(`
        SELECT Id, Sender, Text, Timestamp
        FROM ChatMessages
        WHERE SessionId = @sessionId
        ORDER BY Timestamp ASC
      `);

    // Explicitly map fields so casing issues with MSSQL don't break things
    const messages = result.recordset.map(row => ({
      id: row.Id,
      from: row.Sender,
      text: row.Text,
      timestamp: Number(row.Timestamp),
    }));

    res.json(messages);
  } catch (error) {
    console.error('Lỗi lấy tin nhắn:', error);
    res.status(500).json({ message: 'Lỗi server' });
  }
};

// POST /api/chat/:sessionId
export const sendMessage = async (req, res) => {
  const { sessionId } = req.params;
  const { from, text, username } = req.body; // 'customer' or 'admin'
  const msgId = Date.now() + '_' + Math.random().toString(36).slice(2);
  const timestamp = Date.now();

  try {
    const pool = await poolPromise;
    
    // Đảm bảo Session tồn tại
    const sessionCheck = await pool.request()
      .input('sessionId', sql.NVarChar, sessionId)
      .query('SELECT SessionId FROM ChatSessions WHERE SessionId = @sessionId');
      
    if (sessionCheck.recordset.length === 0) {
      await pool.request()
        .input('sessionId', sql.NVarChar, sessionId)
        .input('username', sql.NVarChar, username || 'Khách hàng')
        .query(`
          INSERT INTO ChatSessions (SessionId, Username, UnreadAdmin, UnreadUser, LastActivity)
          VALUES (@sessionId, @username, 0, 0, GETDATE())
        `);
    }

    // Cập nhật số tin nhắn chưa đọc & LastActivity
    if (from === 'customer') {
      await pool.request()
        .input('sessionId', sql.NVarChar, sessionId)
        .query('UPDATE ChatSessions SET UnreadAdmin = UnreadAdmin + 1, LastActivity = GETDATE() WHERE SessionId = @sessionId');
    } else {
      await pool.request()
        .input('sessionId', sql.NVarChar, sessionId)
        .query('UPDATE ChatSessions SET UnreadUser = UnreadUser + 1, LastActivity = GETDATE() WHERE SessionId = @sessionId');
    }

    // Thêm tin nhắn
    await pool.request()
      .input('id', sql.NVarChar, msgId)
      .input('sessionId', sql.NVarChar, sessionId)
      .input('sender', sql.NVarChar, from)
      .input('text', sql.NVarChar, text)
      .input('timestamp', sql.BigInt, timestamp)
      .query(`
        INSERT INTO ChatMessages (Id, SessionId, Sender, Text, Timestamp)
        VALUES (@id, @sessionId, @sender, @text, @timestamp)
      `);

    res.status(201).json({ id: msgId, from, text, timestamp });
  } catch (error) {
    console.error('Lỗi gửi tin nhắn:', error);
    res.status(500).json({ message: 'Lỗi server' });
  }
};

// POST /api/chat/:sessionId/read
export const markAsRead = async (req, res) => {
  const { sessionId } = req.params;
  const { reader } = req.body; // 'customer' hoặc 'admin'
  
  try {
    const pool = await poolPromise;
    if (reader === 'admin') {
      await pool.request()
        .input('sessionId', sql.NVarChar, sessionId)
        .query('UPDATE ChatSessions SET UnreadAdmin = 0 WHERE SessionId = @sessionId');
    } else if (reader === 'customer') {
      await pool.request()
        .input('sessionId', sql.NVarChar, sessionId)
        .query('UPDATE ChatSessions SET UnreadUser = 0 WHERE SessionId = @sessionId');
    }
    res.json({ success: true });
  } catch (error) {
    console.error('Lỗi đánh dấu đã đọc:', error);
    res.status(500).json({ message: 'Lỗi server' });
  }
};
