const { app } = require('@azure/functions');
const Stripe = require('stripe');

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

      // Build line items from cart — each item needs { stripePriceId, quantity }
      const lineItems = items.map((item) => ({
        price: item.stripePriceId,
        quantity: item.quantity || 1,
      }));

      const origin = request.headers.get('origin') || 'https://dropliftband.com';

      const session = await stripe.checkout.sessions.create({
        mode: 'payment',
        line_items: lineItems,
        success_url: `${origin}/store?success=true`,
        cancel_url: `${origin}/store?canceled=true`,
      });

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
