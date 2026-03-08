const { app } = require('@azure/functions');
const Stripe = require('stripe');

app.http('products', {
  methods: ['GET'],
  authLevel: 'anonymous',
  route: 'products',
  handler: async (request, context) => {
    try {
      const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

      // Fetch active products
      const products = await stripe.products.list({ active: true });

      // Fetch all active prices and group by product
      const prices = await stripe.prices.list({ active: true, limit: 100 });

      const pricesByProduct = {};
      for (const price of prices.data) {
        const pid = price.product;
        if (!pricesByProduct[pid]) pricesByProduct[pid] = [];
        pricesByProduct[pid].push({
          priceId: price.id,
          priceCents: price.unit_amount,
          currency: price.currency,
          label: price.nickname || null,
        });
      }

      const items = products.data.map((product) => {
        const productPrices = pricesByProduct[product.id] || [];
        // Sort by price ascending
        productPrices.sort((a, b) => a.priceCents - b.priceCents);
        return {
          id: product.id,
          name: product.name,
          description: product.description,
          image: product.images?.[0] || null,
          prices: productPrices,
        };
      });

      return {
        status: 200,
        jsonBody: items,
      };
    } catch (err) {
      context.log('Products error:', err.message);
      return {
        status: 500,
        jsonBody: { error: 'Failed to load products.' },
      };
    }
  },
});
