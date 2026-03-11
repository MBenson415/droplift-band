const { app } = require('@azure/functions');
const { sql, getPool } = require('../shared/db');

app.http('unsubscribe', {
  methods: ['GET'],
  authLevel: 'anonymous',
  route: 'unsubscribe',
  handler: async (request, context) => {
    const token = request.query.get('token');

    if (!token || !/^[0-9a-f-]{36}$/i.test(token)) {
      return { status: 400, body: 'Invalid unsubscribe link.' };
    }

    try {
      const pool = await getPool();
      const result = await pool
        .request()
        .input('token', sql.NVarChar(36), token)
        .query(`UPDATE DropliftEmailSignups
                SET Unsubscribed = 1, UnsubscribedAt = SYSUTCDATETIME()
                WHERE ConfirmToken = @token AND Unsubscribed = 0`);

      if (result.rowsAffected[0] === 0) {
        return {
          status: 200,
          headers: { 'Content-Type': 'text/html' },
          body: unsubscribePage('Already Unsubscribed', 'This email has already been removed from the list.'),
        };
      }

      return {
        status: 200,
        headers: { 'Content-Type': 'text/html' },
        body: unsubscribePage('Unsubscribed', 'You\u2019ve been removed from the mailing list. Sorry to see you go.'),
      };
    } catch (err) {
      context.log('Unsubscribe error:', err.message);
      return { status: 500, body: 'Something went wrong.' };
    }
  },
});

function unsubscribePage(heading, message) {
  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8"/>
<meta name="viewport" content="width=device-width, initial-scale=1.0"/>
<title>${heading} — Droplift</title>
<link href="https://fonts.googleapis.com/css2?family=Special+Elite&display=swap" rel="stylesheet"/>
</head>
<body style="margin:0;padding:0;background:#000;color:#fff;font-family:Arial,'Helvetica Neue',sans-serif;display:flex;align-items:center;justify-content:center;min-height:100vh;">
<div style="text-align:center;padding:40px 24px;max-width:480px;">
  <h1 style="font-family:'Special Elite',Georgia,serif;color:#FF6B00;font-size:36px;letter-spacing:6px;margin:0 0 12px;">DROPLIFT</h1>
  <div style="height:1px;background:#333;margin:24px 0;"></div>
  <h2 style="font-size:24px;margin:0 0 16px;color:#fff;">${heading}</h2>
  <p style="font-size:16px;line-height:26px;color:#ccc;margin:0 0 32px;">${message}</p>
  <a href="https://dropliftband.com" style="display:inline-block;padding:14px 36px;background:#FF6B00;color:#000;font-weight:bold;text-transform:uppercase;letter-spacing:2px;text-decoration:none;border-radius:8px;font-size:14px;">Visit Site</a>
</div>
</body>
</html>`;
}
