import sql from 'mssql/msnodesqlv8.js';
import { poolPromise } from './config/db.js';

async function migrate() {
    try {
        const pool = await poolPromise;
        if (!pool) throw new Error("Pool is null");
        console.log("Connected to SQL Server");
        
        const query = `
            IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[BinaryOrders]') AND type in (N'U'))
            BEGIN
                CREATE TABLE BinaryOrders (
                    Id INT IDENTITY(1,1) PRIMARY KEY,
                    UserId INT NOT NULL,
                    Symbol NVARCHAR(20) NOT NULL,
                    BetAmount DECIMAL(18,2) NOT NULL,
                    BetType NVARCHAR(10) NOT NULL, -- 'UP' or 'DOWN'
                    StartPrice DECIMAL(18,6) NOT NULL,
                    EndPrice DECIMAL(18,6),
                    StartTime DATETIME DEFAULT GETDATE(),
                    EndTime DATETIME NOT NULL,
                    Status NVARCHAR(20) DEFAULT 'PENDING', -- 'PENDING', 'WIN', 'LOSE', 'TIE'
                    Payout DECIMAL(18,2) DEFAULT 0,
                    FOREIGN KEY (UserId) REFERENCES Users(Id) ON DELETE CASCADE
                );
                PRINT 'BinaryOrders table created.';
            END
            ELSE
            BEGIN
                PRINT 'BinaryOrders table already exists.';
            END
        `;
        
        await pool.request().query(query);
        console.log("Migration successful.");
        process.exit(0);
    } catch (err) {
        console.error("Migration failed:", err);
        process.exit(1);
    }
}

migrate();
