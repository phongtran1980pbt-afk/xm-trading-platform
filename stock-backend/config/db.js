import sql from 'mssql';

// ==========================================
// CẤU HÌNH KẾT NỐI SQL SERVER (SSMS)
// ==========================================
const dbConfig = {
    user: 'sa',             // 1. Tên đăng nhập (Thường là sa)
    password: 'your_password', // 2. THAY BẰNG MẬT KHẨU SQL CỦA BẠN
    server: 'localhost',    // 3. Để nguyên localhost
    database: 'StockTradingDB', // 4. Tên database (Đã tạo trong init_db.sql)
    options: {
        encrypt: true, 
        trustServerCertificate: true
    },
    connectionTimeout: 10000 
};

// Hàm kết nối
const connectDB = async () => {
    try {
        const pool = await sql.connect(dbConfig);
        console.log('✅ [SQL Server] Đã kết nối thành công tới database StockTradingDB');
        return pool;
    } catch (err) {
        console.error('❌ [SQL Server] KHÔNG THỂ KẾT NỐI. Server sẽ chạy ở chế độ dự phòng (Không lưu vào SQL).');
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

