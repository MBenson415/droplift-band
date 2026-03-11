-- Add confirmation and unsubscribe support to DropliftEmailSignups
ALTER TABLE DropliftEmailSignups
  ADD ConfirmToken NVARCHAR(36) NULL,
      Confirmed BIT NOT NULL DEFAULT 0,
      ConfirmedAt DATETIME2 NULL,
      Unsubscribed BIT NOT NULL DEFAULT 0,
      UnsubscribedAt DATETIME2 NULL;

-- Index on token for fast lookups
CREATE UNIQUE NONCLUSTERED INDEX IX_DropliftEmailSignups_ConfirmToken
  ON DropliftEmailSignups (ConfirmToken)
  WHERE ConfirmToken IS NOT NULL;
