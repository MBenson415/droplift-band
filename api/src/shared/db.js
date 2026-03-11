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

let poolPromise;

function getPool() {
  if (!poolPromise) {
    poolPromise = sql.connect(sqlConfig);
  }
  return poolPromise;
}

module.exports = { sql, getPool };
