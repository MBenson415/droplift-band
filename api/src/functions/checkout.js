const { app } = require('@azure/functions');
const Stripe = require('stripe');

const SINGLE_QUANTITY_PRODUCT_IDS = new Set([
  'prod_U7x7gwYAOpgdlb',
  'prod_U72c5PgkFc1tPi',
]);

app.http('checkout', {
  methods: ['POST'],
  authLevel: 'anonymous',
  route: 'checkout',
  handler: async (request, context) => {
    try {
      const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
      const body = await request.json();
      const items = body?.items;

      if (!Array.isArray(items) || items.length === 0) {
        return {
          status: 400,
          jsonBody: { error: 'Cart is empty.' },
        };
      }

      const prices = await Promise.all(
        items.map((item) => stripe.prices.retrieve(item.stripePriceId, { expand: ['product'] }))
      );

      // Build line items from cart and clamp quantity for restricted products.
      const lineItems = items.map((item, index) => {
        const price = prices[index];
        const product = price.product;
        const productId = typeof product === 'string' ? product : product?.id;
        const requestedQuantity = Math.max(1, Number(item.quantity) || 1);

        return {
          price: item.stripePriceId,
          quantity: SINGLE_QUANTITY_PRODUCT_IDS.has(productId) ? 1 : requestedQuantity,
          ...(item.metadata ? { metadata: item.metadata } : {}),
        };
      });

      // Determine mode by checking if the price is recurring (subscription)
      const firstPrice = prices[0];
      const mode = firstPrice.recurring ? 'subscription' : 'payment';

      const origin = request.headers.get('origin') || 'https://dropliftband.com';

      // Build order summary metadata for the PaymentIntent (visible in Stripe dashboard)
      const orderMetadata = {};
      items.forEach((item, i) => {
        const label = item.metadata?.size ? `${item.metadata.name} (${item.metadata.size})` : item.metadata?.name;
        if (label) orderMetadata[`item_${i + 1}`] = `${label} x${lineItems[i].quantity}`;
      });

      const sessionParams = {
        mode,
        line_items: lineItems,
        success_url: `${origin}/store?success=true`,
        cancel_url: `${origin}/store?canceled=true`,
      };

      if (mode === 'payment' && Object.keys(orderMetadata).length > 0) {
        sessionParams.payment_intent_data = { metadata: orderMetadata };
      }

      if (mode === 'payment') {
        sessionParams.shipping_address_collection = { allowed_countries: ['US', 'CA'] };
      }

      const session = await stripe.checkout.sessions.create(sessionParams);

      return {
        status: 200,
        jsonBody: { url: session.url },
      };
    } catch (err) {
      context.log('Checkout error:', err.message);
      return {
        status: 500,
        jsonBody: { error: 'Failed to create checkout session.' },
      };
    }
  },
});
