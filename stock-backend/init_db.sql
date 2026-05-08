-- ====================================================
-- SCRIPT KHỞI TẠO CƠ SỞ DỮ LIỆU PHÂN QUYỀN (RBAC)
-- Dành cho hệ quản trị Microsoft SQL Server (SSMS)
-- ====================================================

-- 1. Tạo Database (Nếu chưa có)
IF NOT EXISTS (SELECT * FROM sys.databases WHERE name = 'StockTradingDB')
BEGIN
    CREATE DATABASE StockTradingDB;
END
GO

USE StockTradingDB;
GO

-- 2. Tạo bảng Roles (Vai trò)
IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[Roles]') AND type in (N'U'))
BEGIN
    CREATE TABLE Roles (
        Id INT IDENTITY(1,1) PRIMARY KEY,
        Name NVARCHAR(50) NOT NULL UNIQUE,
        Description NVARCHAR(255)
    );
END

-- 3. Tạo bảng Permissions (Quyền hạn)
IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[Permissions]') AND type in (N'U'))
BEGIN
    CREATE TABLE Permissions (
        Id INT IDENTITY(1,1) PRIMARY KEY,
        Name NVARCHAR(100) NOT NULL UNIQUE,
        Description NVARCHAR(255)
    );
END

-- 4. Tạo bảng trung gian RolePermissions (Phân quyền cho Vai trò)
IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[RolePermissions]') AND type in (N'U'))
BEGIN
    CREATE TABLE RolePermissions (
        RoleId INT NOT NULL,
        PermissionId INT NOT NULL,
        PRIMARY KEY (RoleId, PermissionId),
        FOREIGN KEY (RoleId) REFERENCES Roles(Id) ON DELETE CASCADE,
        FOREIGN KEY (PermissionId) REFERENCES Permissions(Id) ON DELETE CASCADE
    );
END

-- 5. Tạo bảng Users (Người dùng)
IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[Users]') AND type in (N'U'))
BEGIN
    CREATE TABLE Users (
        Id INT IDENTITY(1,1) PRIMARY KEY,
        Email NVARCHAR(100) NOT NULL UNIQUE,
        PasswordHash NVARCHAR(255) NOT NULL,
        FullName NVARCHAR(100) NOT NULL,
        IsActive BIT DEFAULT 1 -- Trong SQL Server dùng BIT thay cho BOOLEAN
    );
END

-- 6. Tạo bảng trung gian UserRoles (Gán Vai trò cho Người dùng)
IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[UserRoles]') AND type in (N'U'))
BEGIN
    CREATE TABLE UserRoles (
        UserId INT NOT NULL,
        RoleId INT NOT NULL,
        PRIMARY KEY (UserId, RoleId),
        FOREIGN KEY (UserId) REFERENCES Users(Id) ON DELETE CASCADE,
        FOREIGN KEY (RoleId) REFERENCES Roles(Id) ON DELETE CASCADE
    );
END
GO

-- ====================================================
-- DỮ LIỆU MẪU (SEED DATA)
-- ====================================================

-- Thêm Roles (Dùng tiền tố N' để hỗ trợ tiếng Việt)
IF NOT EXISTS (SELECT * FROM Roles)
BEGIN
    INSERT INTO Roles (Name, Description) VALUES 
    ('Admin', N'Quản trị viên hệ thống - Có toàn quyền'),
    ('Customer', N'Khách hàng - Chỉ được xem dữ liệu');
END

-- Thêm Các Quyền Cụ Thể (Permissions)
IF NOT EXISTS (SELECT * FROM Permissions)
BEGIN
    INSERT INTO Permissions (Name, Description) VALUES 
    ('READ_ITEM', N'Xem danh sách sản phẩm'),
    ('CREATE_ITEM', N'Thêm sản phẩm mới'),
    ('UPDATE_ITEM', N'Cập nhật sản phẩm'),
    ('DELETE_ITEM', N'Xóa sản phẩm'),
    ('MANAGE_USERS', N'Quản lý tài khoản người dùng');
END

-- Gán TOÀN QUYỀN cho Admin (Role Admin có ID = 1)
IF NOT EXISTS (SELECT * FROM RolePermissions WHERE RoleId = 1)
BEGIN
    INSERT INTO RolePermissions (RoleId, PermissionId)
    SELECT 1, Id FROM Permissions;
END

-- Gán quyền giới hạn cho Customer (Role Customer có ID = 2)
IF NOT EXISTS (SELECT * FROM RolePermissions WHERE RoleId = 2)
BEGIN
    INSERT INTO RolePermissions (RoleId, PermissionId) VALUES (2, 1);
END

-- Thêm Users (Mật khẩu đều là: 123456)
IF NOT EXISTS (SELECT * FROM Users)
BEGIN
    INSERT INTO Users (Email, PasswordHash, FullName, IsActive) VALUES 
    ('admin@example.com', '$2a$10$wT.f/L.E2rD//p89.E7.3.k.bW//m/0rX/kU6h3.rG2KxG1X8U1m6', N'Quản trị viên Tối cao', 1),
    ('customer@example.com', '$2a$10$wT.f/L.E2rD//p89.E7.3.k.bW//m/0rX/kU6h3.rG2KxG1X8U1m6', N'Khách hàng Tiêu chuẩn', 1);

    -- Gán vai trò cho User
    INSERT INTO UserRoles (UserId, RoleId) VALUES (1, 1), (2, 2);
END
GO
