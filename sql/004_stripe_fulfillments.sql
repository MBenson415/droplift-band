ALTER TABLE DropliftDownloadTokens
ADD StripeSessionId NVARCHAR(255) NULL,
    StripeProductId NVARCHAR(255) NULL,
    DeliveryEmailSentAt DATETIME2 NULL,
    DeliveryError NVARCHAR(MAX) NULL;

CREATE UNIQUE NONCLUSTERED INDEX IX_DropliftDownloadTokens_StripeSessionProduct
  ON DropliftDownloadTokens (StripeSessionId, StripeProductId)
  WHERE StripeSessionId IS NOT NULL AND StripeProductId IS NOT NULL;
