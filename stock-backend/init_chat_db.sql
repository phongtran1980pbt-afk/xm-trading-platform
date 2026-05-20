USE StockTradingDB;
GO

-- 1. Bảng ChatSessions (Quản lý phiên chat của từng khách hàng)
IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[ChatSessions]') AND type in (N'U'))
BEGIN
    CREATE TABLE ChatSessions (
        SessionId NVARCHAR(100) PRIMARY KEY,
        Username NVARCHAR(100) NOT NULL,
        UnreadAdmin INT DEFAULT 0,
        UnreadUser INT DEFAULT 0,
        CreatedAt DATETIME DEFAULT GETDATE(),
        LastActivity DATETIME DEFAULT GETDATE()
    );
END
GO

-- 2. Bảng ChatMessages (Lưu trữ tin nhắn)
IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[ChatMessages]') AND type in (N'U'))
BEGIN
    CREATE TABLE ChatMessages (
        Id NVARCHAR(100) PRIMARY KEY, -- Sinh ID tự động (uuid hoặc timestamp string) từ code
        SessionId NVARCHAR(100) NOT NULL,
        Sender NVARCHAR(50) NOT NULL, -- 'customer' hoặc 'admin'
        Text NVARCHAR(MAX) NOT NULL,
        Timestamp BIGINT NOT NULL, -- Unix timestamp (milliseconds)
        FOREIGN KEY (SessionId) REFERENCES ChatSessions(SessionId) ON DELETE CASCADE
    );
END
GO
