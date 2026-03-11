const { app } = require('@azure/functions');
const { sendDownloadDelivery } = require('../shared/downloadDelivery');

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

      const { downloadUrl, expiresAt } = await sendDownloadDelivery({
        email,
        maxUses,
        expiryHours,
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
