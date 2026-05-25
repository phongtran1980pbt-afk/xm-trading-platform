import sql from 'mssql';

// ==========================================
// CẤU HÌNH KẾT NỐI SQL SERVER (SSMS) - PURE JS TEDIOUS
// ==========================================
const dbConfig = {
    user: 'sa',
    password: 'SaPassword123!',
    server: 'localhost',
    port: 1433,
    database: 'StockTradingDB',
    options: {
        encrypt: false, 
        trustServerCertificate: true
    },
    connectionTimeout: 10000 
};

// Hàm kết nối
const connectDB = async () => {
    try {
        const pool = await sql.connect(dbConfig);
        console.log('✅ [SQL Server] Đã kết nối thành công tới database StockTradingDB');
        
        // Auto-create AuditLogs table if it doesn't exist
        await pool.request().query(`
            IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='AuditLogs' and xtype='U')
            BEGIN
                CREATE TABLE AuditLogs (
                    Id INT IDENTITY(1,1) PRIMARY KEY,
                    Action NVARCHAR(255) NOT NULL,
                    Details NVARCHAR(MAX),
                    CreatedAt DATETIME DEFAULT GETDATE()
                )
                PRINT '✅ [SQL Server] Đã tạo bảng AuditLogs'
            END
        `);
        
        return pool;
    } catch (err) {
        console.error('❌ [SQL Server] LỖI KẾT NỐI CHI TIẾT:', err.message);
        return null; // Trả về null thay vì báo lỗi chết server
    }
};

export const poolPromise = connectDB();
export const SECRET_KEY = 'KHOA_BAO_MAT_CUA_BAN_123';

// Mock items data (nếu cần dùng)
export const items = [
  { id: 1, name: 'Sản phẩm A', quantity: 10 },
  { id: 2, name: 'Sản phẩm B', quantity: 20 }
];

