const { Client } = require('../node_modules/pg');

async function createDatabase() {
  const client = new Client({
    host: 'localhost',
    port: 5432,
    user: 'postgres',
    password: 'password',
    database: 'postgres'
  });

  try {
    await client.connect();
    console.log("Connected to postgres database.");
    await client.query("CREATE DATABASE society_management");
    console.log("Database 'society_management' created successfully!");
  } catch (err) {
    console.error("Error creating database:", err.message);
  } finally {
    await client.end();
  }
}

createDatabase();
