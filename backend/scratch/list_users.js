const { Client } = require('../node_modules/pg');

async function listUsers() {
  const client = new Client({
    host: 'localhost',
    port: 5432,
    user: 'postgres',
    password: 'password',
    database: 'society_management'
  });

  try {
    await client.connect();
    const res = await client.query('SELECT u.email, u.mobile, u.name, u.role, t.slug FROM "User" u LEFT JOIN "Tenant" t ON u."tenantId" = t.id');
    console.log(JSON.stringify(res.rows, null, 2));
  } catch (err) {
    console.error(err.message);
  } finally {
    await client.end();
  }
}

listUsers();
