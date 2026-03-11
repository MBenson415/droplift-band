const { app } = require('@azure/functions');
const { sql, getPool } = require('../shared/db');

function getRewardFileUrl() {
  return process.env.REWARD_FILE_URL || 'https://squarespacemusic.blob.core.windows.net/$web/Undone.mp3';
}

app.setup({ enableHttpStream: true });

app.http('download', {
  methods: ['GET'],
  authLevel: 'anonymous',
  route: 'download',
  handler: async (request, context) => {
    const token = request.query.get('token');

    if (!token || token.length > 64) {
      return { status: 400, body: 'Invalid download link.' };
    }

    try {
      const pool = await getPool();

      // Look up token and check validity
      const result = await pool
        .request()
        .input('token', sql.NVarChar(64), token)
        .query(`SELECT Id, UseCount, MaxUses, ExpiresAt
                FROM DropliftDownloadTokens
                WHERE Token = @token`);

      if (result.recordset.length === 0) {
        return { status: 404, body: 'Download link not found.' };
      }

      const row = result.recordset[0];

      if (new Date() > new Date(row.ExpiresAt)) {
        return { status: 410, body: 'This download link has expired.' };
      }

      if (row.UseCount >= row.MaxUses) {
        return { status: 410, body: 'This download link has reached its download limit.' };
      }

      const rewardFileUrl = getRewardFileUrl();
      const rewardResponse = await fetch(rewardFileUrl);
      if (!rewardResponse.ok) {
        context.log('Reward file fetch failed.', {
          url: rewardFileUrl,
          status: rewardResponse.status,
        });
        return { status: 500, body: 'Download unavailable. Please contact us.' };
      }

      // Increment use count
      await pool
        .request()
        .input('id', sql.Int, row.Id)
        .query('UPDATE DropliftDownloadTokens SET UseCount = UseCount + 1 WHERE Id = @id');

      const contentType = rewardResponse.headers.get('content-type') || 'audio/mpeg';
      const fileName = process.env.REWARD_DOWNLOAD_FILENAME || 'Droplift - Undone.mp3';
      const contentLength = rewardResponse.headers.get('content-length');

      return {
        status: 200,
        headers: {
          'Content-Type': contentType,
          'Content-Disposition': `attachment; filename="${fileName}"`,
          ...(contentLength ? { 'Content-Length': contentLength } : {}),
        },
        body: rewardResponse.body,
      };
    } catch (err) {
      context.log('Download error:', err.message);
      return { status: 500, body: 'Something went wrong.' };
    }
  },
});
