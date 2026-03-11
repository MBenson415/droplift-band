const { app } = require('@azure/functions');
const Stripe = require('stripe');
const { sendDownloadDelivery } = require('../shared/downloadDelivery');

const DIGITAL_DOWNLOAD_PRODUCT_ID = process.env.DIGITAL_DOWNLOAD_PRODUCT_ID || 'prod_U7x7gwYAOpgdlb';

app.http('stripeWebhook', {
  methods: ['POST'],
  authLevel: 'anonymous',
  route: 'stripe/webhook',
  handler: async (request, context) => {
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
    const signature = request.headers.get('stripe-signature');

    if (!webhookSecret) {
      context.log('Missing STRIPE_WEBHOOK_SECRET');
      return { status: 500, body: 'Webhook is not configured.' };
    }

    if (!signature) {
      return { status: 400, body: 'Missing Stripe signature.' };
    }

    const payload = await request.text();
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

    let event;
    try {
      event = stripe.webhooks.constructEvent(payload, signature, webhookSecret);
    } catch (error) {
      context.log('Stripe webhook signature verification failed:', error.message);
      return { status: 400, body: `Webhook Error: ${error.message}` };
    }

    if (event.type !== 'checkout.session.completed') {
      return { status: 200, jsonBody: { received: true, ignored: true } };
    }

    const session = event.data.object;
    if (session.payment_status !== 'paid') {
      return { status: 202, jsonBody: { received: true, ignored: true, reason: 'unpaid' } };
    }

    const email = String(session.customer_details?.email || session.customer_email || '').trim().toLowerCase();
    if (!email) {
      context.log('Stripe webhook missing customer email', { sessionId: session.id });
      return { status: 200, jsonBody: { received: true, ignored: true, reason: 'missing_email' } };
    }

    try {
      const lineItems = await stripe.checkout.sessions.listLineItems(session.id, {
        limit: 100,
        expand: ['data.price.product'],
      });

      const matchingItem = lineItems.data.find((item) => {
        const product = item.price?.product;
        const productId = typeof product === 'string' ? product : product?.id;
        return productId === DIGITAL_DOWNLOAD_PRODUCT_ID;
      });

      if (!matchingItem) {
        return { status: 200, jsonBody: { received: true, ignored: true, reason: 'non_download_purchase' } };
      }

      const result = await sendDownloadDelivery({
        email,
        thankYouLine: 'Thank you for supporting us!',
        stripeSessionId: session.id,
        stripeProductId: DIGITAL_DOWNLOAD_PRODUCT_ID,
      });

      if (result.alreadySent) {
        return { status: 200, jsonBody: { received: true, skipped: true } };
      }

      return { status: 200, jsonBody: { received: true, fulfilled: true } };
    } catch (error) {
      context.log('Stripe webhook fulfillment error:', error.message);

      return { status: 500, body: 'Failed to fulfill digital download.' };
    }
  },
});
