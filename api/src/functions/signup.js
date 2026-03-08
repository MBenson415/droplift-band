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

      const pool = await sql.connect(sqlConfig);

      // Check for duplicate
      const check = await pool
        .request()
        .input('email', sql.NVarChar(320), email)
        .query('SELECT Id FROM DropliftEmailSignups WHERE Email = @email');

      if (check.recordset.length > 0) {
        return {
          status: 409,
          jsonBody: { error: 'This email is already on the list.' },
        };
      }

      // Insert new signup
      await pool
        .request()
        .input('email', sql.NVarChar(320), email)
        .query('INSERT INTO DropliftEmailSignups (Email) VALUES (@email)');

      return {
        status: 200,
        jsonBody: { message: 'Signed up successfully.' },
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
