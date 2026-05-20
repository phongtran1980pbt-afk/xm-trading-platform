-- ============================================================
-- THÊM TÀI KHOẢN ADMIN: admin@gmail.com / admin123@
-- Chạy file này trong SQL Server Management Studio (SSMS)
-- ============================================================

USE StockTradingDB;
GO

-- Bước 1: Xóa tài khoản admin cũ nếu tồn tại (tránh trùng)
IF EXISTS (SELECT * FROM Users WHERE Email = 'admin@gmail.com')
BEGIN
    DECLARE @OldAdminId INT = (SELECT Id FROM Users WHERE Email = 'admin@gmail.com');
    DELETE FROM UserRoles WHERE UserId = @OldAdminId;
    DELETE FROM Users WHERE Id = @OldAdminId;
    PRINT 'Đã xóa admin cũ.';
END

-- Bước 2: Thêm tài khoản admin mới
-- Mật khẩu gốc: admin123@  (đã hash bằng bcrypt 10 rounds)
INSERT INTO Users (Email, PasswordHash, FullName, IsActive)
VALUES (
    'admin@gmail.com',
    '$2a$10$/WT9XsgbILtGRY5WQDklY.l9V94EndgnwAlTgbLLFu8gMmLTs2oX2',
    N'Quản trị viên Hệ thống',
    1
);

-- Bước 3: Gán Role Admin (RoleId = 1) cho tài khoản vừa tạo
DECLARE @NewAdminId INT = (SELECT Id FROM Users WHERE Email = 'admin@gmail.com');
INSERT INTO UserRoles (UserId, RoleId) VALUES (@NewAdminId, 1);

-- Bước 4: Xác nhận
SELECT 
    u.Id,
    u.Email,
    u.FullName,
    u.IsActive,
    r.Name AS Role
FROM Users u
LEFT JOIN UserRoles ur ON u.Id = ur.UserId
LEFT JOIN Roles r ON ur.RoleId = r.Id
WHERE u.Email = 'admin@gmail.com';

PRINT '✅ Đã thêm tài khoản admin@gmail.com thành công!';
GO
