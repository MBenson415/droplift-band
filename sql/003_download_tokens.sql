-- Download tokens for private MP3 rewards
CREATE TABLE DropliftDownloadTokens (
  Id          INT IDENTITY(1,1) PRIMARY KEY,
  Email       NVARCHAR(320) NOT NULL,
  Token       NVARCHAR(64)  NOT NULL,
  MaxUses     INT           NOT NULL DEFAULT 5,
  UseCount    INT           NOT NULL DEFAULT 0,
  ExpiresAt   DATETIME2     NOT NULL,
  CreatedAt   DATETIME2     NOT NULL DEFAULT SYSUTCDATETIME()
);

CREATE UNIQUE NONCLUSTERED INDEX IX_DropliftDownloadTokens_Token
  ON DropliftDownloadTokens (Token);
