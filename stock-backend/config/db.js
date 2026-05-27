import sql from 'mssql';
import dotenv from 'dotenv';

dotenv.config();

// ==========================================
// CẤU HÌNH KẾT NỐI SQL SERVER (SSMS) - PURE JS TEDIOUS
// ==========================================
const dbConfig = {
    user: process.env.DB_USER || 'sa',
    password: process.env.DB_PASSWORD || 'SaPassword123!',
    server: process.env.DB_SERVER || 'localhost',
    port: parseInt(process.env.DB_PORT) || 1433,
    database: process.env.DB_DATABASE || 'StockTradingDB',
    options: {
        encrypt: process.env.DB_ENCRYPT === 'true', 
        trustServerCertificate: process.env.DB_TRUST_CERT === 'true'
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

        // Dynamic schema migration for KYC verification columns in Users table
        await pool.request().query(`
            IF NOT EXISTS(SELECT * FROM sys.columns WHERE Name = N'Country' AND Object_ID = Object_ID(N'Users'))
            BEGIN
                ALTER TABLE Users ADD Country NVARCHAR(100) NULL;
            END
            IF NOT EXISTS(SELECT * FROM sys.columns WHERE Name = N'IdCardType' AND Object_ID = Object_ID(N'Users'))
            BEGIN
                ALTER TABLE Users ADD IdCardType NVARCHAR(50) NULL;
            END
            IF NOT EXISTS(SELECT * FROM sys.columns WHERE Name = N'IdNumber' AND Object_ID = Object_ID(N'Users'))
            BEGIN
                ALTER TABLE Users ADD IdNumber NVARCHAR(50) NULL;
            END
            IF NOT EXISTS(SELECT * FROM sys.columns WHERE Name = N'IdFrontPhoto' AND Object_ID = Object_ID(N'Users'))
            BEGIN
                ALTER TABLE Users ADD IdFrontPhoto NVARCHAR(MAX) NULL;
            END
            IF NOT EXISTS(SELECT * FROM sys.columns WHERE Name = N'IdBackPhoto' AND Object_ID = Object_ID(N'Users'))
            BEGIN
                ALTER TABLE Users ADD IdBackPhoto NVARCHAR(MAX) NULL;
            END
            IF NOT EXISTS(SELECT * FROM sys.columns WHERE Name = N'PhoneNumber' AND Object_ID = Object_ID(N'Users'))
            BEGIN
                ALTER TABLE Users ADD PhoneNumber NVARCHAR(20) NULL;
            END
        `);
        console.log('✅ [SQL Server] Đã kiểm tra và cập nhật các cột KYC cho bảng Users');
        
        return pool;
    } catch (err) {
        console.error('❌ [SQL Server] LỖI KẾT NỐI CHI TIẾT:', err.message);
        return null; // Trả về null thay vì báo lỗi chết server
    }
};

export const poolPromise = connectDB();
export const SECRET_KEY = process.env.JWT_SECRET || 'KHOA_BAO_MAT_CUA_BAN_123';

// Mock items data (nếu cần dùng)
export const items = [
  { id: 1, name: 'Sản phẩm A', quantity: 10 },
  { id: 2, name: 'Sản phẩm B', quantity: 20 }
];

