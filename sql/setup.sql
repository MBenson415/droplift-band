-- ============================================
-- Droplift Band - Azure SQL Database Setup
-- ============================================
-- Run this against your Azure SQL Database 
-- (e.g. via Azure Data Studio, SSMS, or Azure Portal Query Editor)

-- 1. Email Signups Table
CREATE TABLE EmailSignups (
    Id          INT IDENTITY(1,1) PRIMARY KEY,
    Email       NVARCHAR(320)   NOT NULL UNIQUE,
    SignedUpAt  DATETIME2       NOT NULL DEFAULT GETUTCDATE()
);

-- Index for fast duplicate lookups
CREATE NONCLUSTERED INDEX IX_EmailSignups_Email
    ON EmailSignups (Email);

GO

-- ============================================
-- Future: Merch Store tables (Stripe integration)
-- Uncomment when ready to build the store
-- ============================================

/*
CREATE TABLE Products (
    Id              INT IDENTITY(1,1) PRIMARY KEY,
    Name            NVARCHAR(200)   NOT NULL,
    Description     NVARCHAR(MAX),
    PriceInCents    INT             NOT NULL,
    StripePriceId   NVARCHAR(255),
    ImageUrl        NVARCHAR(500),
    IsActive        BIT             NOT NULL DEFAULT 1,
    CreatedAt       DATETIME2       NOT NULL DEFAULT GETUTCDATE()
);

CREATE TABLE Orders (
    Id                  INT IDENTITY(1,1) PRIMARY KEY,
    StripeSessionId     NVARCHAR(255)   NOT NULL UNIQUE,
    CustomerEmail       NVARCHAR(320)   NOT NULL,
    TotalInCents        INT             NOT NULL,
    Status              NVARCHAR(50)    NOT NULL DEFAULT 'pending',
    CreatedAt           DATETIME2       NOT NULL DEFAULT GETUTCDATE()
);

CREATE TABLE OrderItems (
    Id          INT IDENTITY(1,1) PRIMARY KEY,
    OrderId     INT             NOT NULL REFERENCES Orders(Id),
    ProductId   INT             NOT NULL REFERENCES Products(Id),
    Quantity    INT             NOT NULL DEFAULT 1,
    PriceInCents INT            NOT NULL
);
*/
