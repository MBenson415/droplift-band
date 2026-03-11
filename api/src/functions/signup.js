const { app } = require('@azure/functions');
const crypto = require('crypto');
const { sql, getPool } = require('../shared/db');
const { createTransporter } = require('../shared/mailer');
const { confirmationEmail } = require('../shared/emailTemplates');

app.http('signup', {
  methods: ['POST'],
  authLevel: 'anonymous',
  route: 'signup',
  handler: async (request, context) => {
    try {
      const body = await request.json();
      const email = body?.email?.trim().toLowerCase();

      // Validate email format
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!email || !emailRegex.test(email)) {
        return {
          status: 400,
          jsonBody: { error: 'A valid email address is required.' },
        };
      }

      const pool = await getPool();

      // Check for duplicate
      const check = await pool
        .request()
        .input('email', sql.NVarChar(320), email)
        .query('SELECT Id, Unsubscribed FROM DropliftEmailSignups WHERE Email = @email');

      if (check.recordset.length > 0) {
        const existing = check.recordset[0];
        // If they previously unsubscribed, re-subscribe them
        if (existing.Unsubscribed) {
          const token = crypto.randomUUID();
          await pool
            .request()
            .input('id', sql.Int, existing.Id)
            .input('token', sql.NVarChar(36), token)
            .query(`UPDATE DropliftEmailSignups
                     SET Unsubscribed = 0, UnsubscribedAt = NULL,
                         Confirmed = 0, ConfirmedAt = NULL,
                         ConfirmToken = @token
                     WHERE Id = @id`);

          const baseUrl = process.env.SITE_URL || 'https://dropliftband.com';
          const confirmUrl = `${baseUrl}/api/confirm?token=${token}`;
          const unsubscribeUrl = `${baseUrl}/api/unsubscribe?token=${token}`;
          const { text, html } = confirmationEmail(confirmUrl, unsubscribeUrl);

          const transporter = createTransporter();
          await transporter.sendMail({
            from: `"Droplift" <${process.env.SMTP_USER}>`,
            to: email,
            subject: 'Confirm Your Email — Droplift',
            text,
            html,
          });

          return {
            status: 200,
            jsonBody: { message: 'Check your inbox to confirm.' },
          };
        }

        return {
          status: 409,
          jsonBody: { error: 'This email is already on the list.' },
        };
      }

      // Insert new signup with confirmation token
      const token = crypto.randomUUID();
      await pool
        .request()
        .input('email', sql.NVarChar(320), email)
        .input('token', sql.NVarChar(36), token)
        .query('INSERT INTO DropliftEmailSignups (Email, ConfirmToken) VALUES (@email, @token)');

      // Build URLs
      const baseUrl = process.env.SITE_URL || 'https://dropliftband.com';
      const confirmUrl = `${baseUrl}/api/confirm?token=${token}`;
      const unsubscribeUrl = `${baseUrl}/api/unsubscribe?token=${token}`;

      const { text, html } = confirmationEmail(confirmUrl, unsubscribeUrl);

      const transporter = createTransporter();
      await transporter.sendMail({
        from: `"Droplift" <${process.env.SMTP_USER}>`,
        to: email,
        subject: 'Confirm Your Email — Droplift',
        text,
        html,
      });

      return {
        status: 200,
        jsonBody: { message: 'Check your inbox to confirm.' },
      };
    } catch (err) {
      context.log('Signup error:', err.message);
      return {
        status: 500,
        jsonBody: { error: 'Internal server error.' },
      };
    }
  },
});
