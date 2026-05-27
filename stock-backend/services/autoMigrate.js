import { poolPromise } from '../config/db.js';

export async function runAutoMigrations() {
  try {
    const pool = await poolPromise;

    const query = `
      -- Tạo bảng BankAccounts nếu chưa có
      IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[BankAccounts]') AND type in (N'U'))
      BEGIN
        CREATE TABLE BankAccounts (
          Id INT IDENTITY(1,1) PRIMARY KEY,
          UserId INT NOT NULL UNIQUE,
          BankName NVARCHAR(200),
          BankAccountNumber NVARCHAR(50),
          BankAccountHolder NVARCHAR(200),
          BankBranch NVARCHAR(200),
          CreatedAt DATETIME DEFAULT GETDATE(),
          UpdatedAt DATETIME,
          FOREIGN KEY (UserId) REFERENCES Users(Id) ON DELETE CASCADE
        );
        PRINT 'BankAccounts table created.';
      END

      -- Tạo bảng WithdrawRequests nếu chưa có
      IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[WithdrawRequests]') AND type in (N'U'))
      BEGIN
        CREATE TABLE WithdrawRequests (
          Id INT IDENTITY(1,1) PRIMARY KEY,
          UserId INT NOT NULL,
          Amount DECIMAL(18,2) NOT NULL,
          BankName NVARCHAR(200),
          BankAccountNumber NVARCHAR(50),
          BankAccountHolder NVARCHAR(200),
          BankBranch NVARCHAR(200),
          Status NVARCHAR(20) DEFAULT 'PENDING',
          Note NVARCHAR(500),
          CreatedAt DATETIME DEFAULT GETDATE(),
          UpdatedAt DATETIME,
          FOREIGN KEY (UserId) REFERENCES Users(Id) ON DELETE CASCADE
        );
        PRINT 'WithdrawRequests table created.';
      END
    `;

    await pool.request().query(query);
    console.log('✅ Auto-migration hoàn thành (BankAccounts, WithdrawRequests)');
  } catch (err) {
    console.error('⚠️  Auto-migration lỗi:', err.message);
  }
}
