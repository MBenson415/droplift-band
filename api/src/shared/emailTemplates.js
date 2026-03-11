const fs = require('fs');
const path = require('path');

const logoBase64 = fs.readFileSync(path.join(__dirname, 'logo-base64.txt'), 'utf8').trim();
const undoneCoverBase64 = fs.readFileSync(path.join(__dirname, 'undone-cover-base64.txt'), 'utf8').trim();

function confirmationEmail(confirmUrl, unsubscribeUrl) {
  const text = [
    'DROPLIFT',
    '',
    "Thanks for signing up. Confirm your email to stay in the loop on new music, shows, and merch drops.",
    '',
    `Confirm your email: ${confirmUrl}`,
    '',
    '— Droplift',
    '',
    `Unsubscribe: ${unsubscribeUrl}`,
  ].join('\n');

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8"/>
<meta name="viewport" content="width=device-width, initial-scale=1.0"/>
<title>Confirm Your Email</title>
</head>
<body style="margin:0;padding:0;background-color:#ffffff;color:#000000;font-family:Arial,'Helvetica Neue',sans-serif;">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#ffffff;min-height:100vh;">
  <tr>
    <td align="center" style="padding:40px 20px;">
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:520px;">
        <!-- Logo / Band Name -->
        <tr>
          <td align="center" style="padding-bottom:24px;">
            <img src="data:image/png;base64,${logoBase64}" alt="Droplift" width="150" style="display:block;width:150px;height:auto;" />
          </td>
        </tr>
        <tr>
          <td align="center" style="padding-bottom:32px;">
            <h1 style="margin:0;font-size:36px;letter-spacing:6px;color:#FF6B00;font-family:'Special Elite',Georgia,serif;">DROPLIFT</h1>
          </td>
        </tr>

        <!-- Divider -->
        <tr>
          <td style="padding-bottom:32px;">
            <div style="height:1px;background-color:#dddddd;"></div>
          </td>
        </tr>

        <!-- Body -->
        <tr>
          <td style="padding-bottom:32px;">
            <p style="margin:0;font-size:16px;line-height:26px;color:#333333;text-align:center;">
              Thanks for signing up. Confirm your email to stay in the loop on new music, shows, and merch drops.
            </p>
          </td>
        </tr>

        <!-- CTA Button -->
        <tr>
          <td align="center" style="padding-bottom:40px;">
            <a href="${confirmUrl}" target="_blank" style="display:inline-block;padding:14px 36px;background-color:#FF6B00;color:#000000;font-size:14px;font-weight:bold;text-transform:uppercase;letter-spacing:2px;text-decoration:none;border-radius:8px;">
              Confirm Email
            </a>
          </td>
        </tr>

        <!-- Divider -->
        <tr>
          <td style="padding-bottom:24px;">
            <div style="height:1px;background-color:#dddddd;"></div>
          </td>
        </tr>

        <!-- Footer -->
        <tr>
          <td align="center" style="padding-bottom:8px;">
            <p style="margin:0;font-size:12px;color:#999999;">
              &copy; ${new Date().getFullYear()} Droplift. All rights reserved.
            </p>
          </td>
        </tr>
        <tr>
          <td align="center">
            <a href="${unsubscribeUrl}" target="_blank" style="font-size:12px;color:#999999;text-decoration:underline;">Unsubscribe</a>
          </td>
        </tr>

      </table>
    </td>
  </tr>
</table>
</body>
</html>`;

  return { text, html };
}

function downloadEmail(downloadUrl, expiresAt, options = {}) {
  const thankYouLine = options.thankYouLine || 'Thank you for helping us grow!';
  const expiry = new Date(expiresAt).toLocaleDateString('en-US', {
    month: 'long', day: 'numeric', year: 'numeric',
  });

  const attachments = [
    {
      filename: 'droplift-undone-cover.jpg',
      content: undoneCoverBase64,
      encoding: 'base64',
      contentType: 'image/jpeg',
      cid: 'undone-cover',
    },
  ];

  const text = [
    'DROPLIFT',
    '',
    'Here\u2019s your digital download of Undone.',
    thankYouLine,
    '',
    `Download: ${downloadUrl}`,
    '',
    `This link expires on ${expiry} and is limited to a few downloads.`,
    '',
    '\u2014 Droplift',
  ].join('\n');

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8"/>
<meta name="viewport" content="width=device-width, initial-scale=1.0"/>
<title>Your Exclusive Download</title>
</head>
<body style="margin:0;padding:0;background-color:#ffffff;color:#000000;font-family:Arial,'Helvetica Neue',sans-serif;">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#ffffff;min-height:100vh;">
  <tr>
    <td align="center" style="padding:40px 20px;">
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:520px;">
        <tr>
          <td align="center" style="padding-bottom:24px;">
            <img src="data:image/png;base64,${logoBase64}" alt="Droplift" width="150" style="display:block;width:150px;height:auto;" />
          </td>
        </tr>
        <tr>
          <td align="center" style="padding-bottom:32px;">
            <h1 style="margin:0;font-size:36px;letter-spacing:6px;color:#FF6B00;font-family:'Special Elite',Georgia,serif;">DROPLIFT</h1>
          </td>
        </tr>
        <tr>
          <td style="padding-bottom:32px;">
            <div style="height:1px;background-color:#dddddd;"></div>
          </td>
        </tr>
        <tr>
          <td style="padding-bottom:32px;">
            <p style="margin:0;font-size:16px;line-height:26px;color:#333333;text-align:center;">
              Here\u2019s your digital download of Undone. ${thankYouLine}
            </p>
          </td>
        </tr>
        <tr>
          <td align="center" style="padding:0 0 28px;">
            <img src="cid:undone-cover" alt="Undone cover art" width="240" style="display:block;width:240px;max-width:100%;height:auto;border-radius:12px;" />
          </td>
        </tr>
        <tr>
          <td align="center" style="padding-bottom:16px;">
            <a href="${downloadUrl}" target="_blank" style="display:inline-block;padding:14px 36px;background-color:#FF6B00;color:#000000;font-size:14px;font-weight:bold;text-transform:uppercase;letter-spacing:2px;text-decoration:none;border-radius:8px;">
              Download Undone
            </a>
          </td>
        </tr>
        <tr>
          <td style="padding-bottom:32px;">
            <p style="margin:0;font-size:13px;line-height:22px;color:#999999;text-align:center;">
              This link expires on ${expiry} and is limited to a few downloads.
            </p>
          </td>
        </tr>
        <tr>
          <td style="padding-bottom:24px;">
            <div style="height:1px;background-color:#dddddd;"></div>
          </td>
        </tr>
        <tr>
          <td align="center">
            <p style="margin:0;font-size:12px;color:#999999;">
              &copy; ${new Date().getFullYear()} Droplift. All rights reserved.
            </p>
          </td>
        </tr>
      </table>
    </td>
  </tr>
</table>
</body>
</html>`;

  return { text, html, attachments };
}

module.exports = { confirmationEmail, downloadEmail };
