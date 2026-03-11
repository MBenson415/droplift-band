const { app } = require('@azure/functions');
const crypto = require('crypto');
const { sql, getPool } = require('../shared/db');
const { createTransporter } = require('../shared/mailer');
const { downloadEmail } = require('../shared/emailTemplates');

app.http('generateDownload', {
  methods: ['POST'],
  authLevel: 'anonymous',
  route: 'mgmt/generate-download',
  handler: async (request, context) => {
    try {
      const principal = request.headers.get('x-ms-client-principal');
      if (!principal) {
        return { status: 401, jsonBody: { error: 'Not authenticated.' } };
      }

      const decoded = JSON.parse(Buffer.from(principal, 'base64').toString('utf8'));
      const userEmail = String(decoded.userDetails || '').toLowerCase();

      const ALLOWED_ADMINS = ['marshall@clinedge.io'];
      if (!userEmail || !ALLOWED_ADMINS.includes(userEmail)) {
        return { status: 403, jsonBody: { error: 'Forbidden.' } };
      }

      const body = await request.json();
      const email = body?.email?.trim().toLowerCase();

      if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        return { status: 400, jsonBody: { error: 'Valid email required.' } };
      }

      const maxUses = body?.maxUses || 5;
      const expiryHours = body?.expiryHours || 72;

      const token = crypto.randomBytes(32).toString('base64url');
      const expiresAt = new Date(Date.now() + expiryHours * 60 * 60 * 1000);

      const pool = await getPool();
      await pool
        .request()
        .input('email', sql.NVarChar(320), email)
        .input('token', sql.NVarChar(64), token)
        .input('maxUses', sql.Int, maxUses)
        .input('expiresAt', sql.DateTime2, expiresAt)
        .query(`INSERT INTO DropliftDownloadTokens (Email, Token, MaxUses, ExpiresAt)
                VALUES (@email, @token, @maxUses, @expiresAt)`);

      const baseUrl = process.env.SITE_URL || 'https://dropliftband.com';
      const downloadUrl = `${baseUrl}/api/download?token=${token}`;

      // Send the download link via email
      const { text, html, attachments } = downloadEmail(downloadUrl, expiresAt);
      const transporter = createTransporter();
      await transporter.sendMail({
        from: `"Droplift" <${process.env.SMTP_USER}>`,
        to: email,
        subject: 'Your Exclusive Download: Droplift - Undone',
        text,
        html,
        attachments,
      });

      return {
        status: 200,
        jsonBody: {
          message: `Download link sent to ${email}`,
          downloadUrl,
          maxUses,
          expiresAt: expiresAt.toISOString(),
        },
      };
    } catch (err) {
      context.log('Generate download error:', err.message);
      return { status: 500, jsonBody: { error: 'Internal server error.' } };
    }
  },
});
