const crypto = require('crypto');
const { sql, getPool } = require('./db');
const { createTransporter } = require('./mailer');
const { downloadEmail } = require('./emailTemplates');

async function prepareStripeDelivery({
  email,
  maxUses,
  expiryHours,
  stripeSessionId,
  stripeProductId,
}) {
  const normalizedEmail = String(email || '').trim().toLowerCase();
  const pool = await getPool();
  const transaction = new sql.Transaction(pool);
  let transactionBegun = false;

  await transaction.begin();
  transactionBegun = true;

  try {
    const lockResult = await new sql.Request(transaction)
      .input('resource', sql.NVarChar(255), `stripe-download:${stripeSessionId}:${stripeProductId}`)
      .query(`DECLARE @result INT;
              EXEC @result = sp_getapplock
                @Resource = @resource,
                @LockMode = 'Exclusive',
                @LockOwner = 'Transaction',
                @LockTimeout = 10000;
              SELECT @result AS Result;`);

    if ((lockResult.recordset[0]?.Result ?? -999) < 0) {
      throw new Error('Could not acquire download delivery lock.');
    }

    const existing = await new sql.Request(transaction)
      .input('stripeSessionId', sql.NVarChar(255), stripeSessionId)
      .input('stripeProductId', sql.NVarChar(255), stripeProductId)
      .query(`SELECT TOP 1 Token, ExpiresAt, MaxUses, DeliveryEmailSentAt
              FROM DropliftDownloadTokens
              WHERE StripeSessionId = @stripeSessionId
                AND StripeProductId = @stripeProductId`);

    if (existing.recordset.length > 0) {
      const row = existing.recordset[0];
      await transaction.commit();
      return {
        alreadySent: Boolean(row.DeliveryEmailSentAt),
        token: row.Token,
        expiresAt: row.ExpiresAt,
        maxUses: row.MaxUses,
        normalizedEmail,
      };
    }

    const token = crypto.randomBytes(32).toString('base64url');
    const expiresAt = new Date(Date.now() + expiryHours * 60 * 60 * 1000);

    await new sql.Request(transaction)
      .input('email', sql.NVarChar(320), normalizedEmail)
      .input('token', sql.NVarChar(64), token)
      .input('maxUses', sql.Int, maxUses)
      .input('expiresAt', sql.DateTime2, expiresAt)
      .input('stripeSessionId', sql.NVarChar(255), stripeSessionId)
      .input('stripeProductId', sql.NVarChar(255), stripeProductId)
      .query(`INSERT INTO DropliftDownloadTokens (
                Email,
                Token,
                MaxUses,
                ExpiresAt,
                StripeSessionId,
                StripeProductId
              )
              VALUES (
                @email,
                @token,
                @maxUses,
                @expiresAt,
                @stripeSessionId,
                @stripeProductId
              )`);

    await transaction.commit();
    return {
      alreadySent: false,
      token,
      expiresAt,
      maxUses,
      normalizedEmail,
    };
  } catch (error) {
    if (transactionBegun) {
      try {
        await transaction.rollback();
      } catch {
        // Ignore rollback failures after the original error.
      }
    }
    throw error;
  }
}

async function markStripeDeliverySent({ stripeSessionId, stripeProductId }) {
  const pool = await getPool();
  await pool
    .request()
    .input('stripeSessionId', sql.NVarChar(255), stripeSessionId)
    .input('stripeProductId', sql.NVarChar(255), stripeProductId)
    .query(`UPDATE DropliftDownloadTokens
            SET DeliveryEmailSentAt = SYSUTCDATETIME(),
                DeliveryError = NULL
            WHERE StripeSessionId = @stripeSessionId
              AND StripeProductId = @stripeProductId`);
}

async function markStripeDeliveryFailed({ stripeSessionId, stripeProductId, errorMessage }) {
  const pool = await getPool();
  await pool
    .request()
    .input('stripeSessionId', sql.NVarChar(255), stripeSessionId)
    .input('stripeProductId', sql.NVarChar(255), stripeProductId)
    .input('errorMessage', sql.NVarChar(sql.MAX), errorMessage)
    .query(`UPDATE DropliftDownloadTokens
            SET DeliveryError = @errorMessage
            WHERE StripeSessionId = @stripeSessionId
              AND StripeProductId = @stripeProductId`);
}

async function sendDownloadDelivery({
  email,
  maxUses = 5,
  expiryHours = 72,
  thankYouLine,
  stripeSessionId,
  stripeProductId,
}) {
  const normalizedEmail = String(email || '').trim().toLowerCase();

  let token;
  let expiresAt;
  let effectiveMaxUses = maxUses;
  let effectiveEmail = normalizedEmail;

  if (stripeSessionId && stripeProductId) {
    const prepared = await prepareStripeDelivery({
      email: normalizedEmail,
      maxUses,
      expiryHours,
      stripeSessionId,
      stripeProductId,
    });

    if (prepared.alreadySent) {
      const baseUrl = process.env.SITE_URL || 'https://dropliftband.com';
      return {
        alreadySent: true,
        downloadUrl: `${baseUrl}/api/download?token=${prepared.token}`,
        expiresAt: prepared.expiresAt,
        maxUses: prepared.maxUses,
      };
    }

    token = prepared.token;
    expiresAt = prepared.expiresAt;
    effectiveMaxUses = prepared.maxUses;
    effectiveEmail = prepared.normalizedEmail;
  } else {
    token = crypto.randomBytes(32).toString('base64url');
    expiresAt = new Date(Date.now() + expiryHours * 60 * 60 * 1000);

    const pool = await getPool();
    await pool
      .request()
      .input('email', sql.NVarChar(320), normalizedEmail)
      .input('token', sql.NVarChar(64), token)
      .input('maxUses', sql.Int, maxUses)
      .input('expiresAt', sql.DateTime2, expiresAt)
      .query(`INSERT INTO DropliftDownloadTokens (Email, Token, MaxUses, ExpiresAt)
              VALUES (@email, @token, @maxUses, @expiresAt)`);
  }

  const baseUrl = process.env.SITE_URL || 'https://dropliftband.com';
  const downloadUrl = `${baseUrl}/api/download?token=${token}`;

  const { text, html, attachments } = downloadEmail(downloadUrl, expiresAt, { thankYouLine });
  const transporter = createTransporter();
  try {
    await transporter.sendMail({
      from: `"Droplift" <${process.env.SMTP_USER}>`,
      to: effectiveEmail,
      subject: 'Your Exclusive Download: Droplift - Undone',
      text,
      html,
      attachments,
    });

    if (stripeSessionId && stripeProductId) {
      await markStripeDeliverySent({ stripeSessionId, stripeProductId });
    }
  } catch (error) {
    if (stripeSessionId && stripeProductId) {
      await markStripeDeliveryFailed({
        stripeSessionId,
        stripeProductId,
        errorMessage: error.message.slice(0, 4000),
      });
    }
    throw error;
  }

  return {
    alreadySent: false,
    downloadUrl,
    expiresAt,
    maxUses: effectiveMaxUses,
  };
}

module.exports = { sendDownloadDelivery };
