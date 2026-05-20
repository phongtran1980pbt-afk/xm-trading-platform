import { poolPromise } from '../config/db.js';

// GET /api/admin/audit-logs
export const getAuditLogs = async (req, res) => {
  try {
    const pool = await poolPromise;
    const result = await pool.request().query(`
      SELECT Id, Action, Details, CreatedAt
      FROM AuditLogs
      ORDER BY CreatedAt DESC
    `);
    res.json(result.recordset);
  } catch (error) {
    console.error('Lỗi lấy Audit Logs:', error);
    res.status(500).json({ message: 'Lỗi server khi lấy Audit Logs' });
  }
};
