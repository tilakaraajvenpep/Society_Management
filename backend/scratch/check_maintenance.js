const { Client } = require('../node_modules/pg');

async function checkMaintenance() {
  const client = new Client({
    host: 'localhost',
    port: 5432,
    user: 'postgres',
    password: 'password',
    database: 'society_management'
  });

  try {
    await client.connect();
    const tenants = await client.query('SELECT id, name, "maintenanceAmount" FROM "Tenant"');
    console.log("Tenants:");
    console.log(tenants.rows);

    const costs = await client.query('SELECT * FROM "MaintenanceCost"');
    console.log("\nConfigured Maintenance Costs (MaintenanceCost table):");
    console.log(costs.rows);
  } catch (err) {
    console.error(err.message);
  } finally {
    await client.end();
  }
}

checkMaintenance();
