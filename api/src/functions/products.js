const { app } = require('@azure/functions');
const sql = require('mssql');

const sqlConfig = {
  server: process.env.SQL_SERVER,
  database: process.env.SQL_DATABASE,
  user: process.env.SQL_USER,
  password: process.env.SQL_PASSWORD,
  options: {
    encrypt: true,
    trustServerCertificate: false,
  },
};

app.http('products', {
  methods: ['GET'],
  authLevel: 'anonymous',
  route: 'products',
  handler: async (request, context) => {
    try {
      const pool = await sql.connect(sqlConfig);

      const result = await pool
        .request()
        .query('SELECT Id, Name, Description, PriceInCents, StripePriceId, ImageUrl FROM Products WHERE IsActive = 1 ORDER BY CreatedAt DESC');

      return {
        status: 200,
        jsonBody: result.recordset,
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
