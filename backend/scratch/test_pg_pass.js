const { Client } = require('../node_modules/pg');

const users = ['postgres', 'sowndarkumar'];
const passwords = ['', 'postgres', 'admin', 'root', 'password', '123456', 'admin123', 'sowndar', 'sowndarkumar', 'society', 'sunrise', 'Sunrise Apartments'];

async function testConnection() {
  for (const user of users) {
    for (const password of passwords) {
      console.log(`Trying ${user} / ${password === '' ? '(empty)' : password}...`);
      const client = new Client({
        host: 'localhost',
        port: 5432,
        user: user,
        password: password,
        database: 'postgres' // default DB to test connection
      });
      try {
        await client.connect();
        console.log(`\n🎉 SUCCESS! Connected as ${user} with password: ${password}\n`);
        
        // Let's check if the database society_management exists
        const res = await client.query("SELECT 1 FROM pg_database WHERE datname='society_management'");
        if (res.rowCount > 0) {
          console.log("Database 'society_management' exists!");
        } else {
          console.log("Database 'society_management' does NOT exist. We will need to create it.");
        }
        await client.end();
        return { user, password, dbExists: res.rowCount > 0 };
      } catch (err) {
        // console.log(`Failed: ${err.message}`);
      }
    }
  }
  console.log('\n❌ None of the common passwords worked.');
  return null;
}

testConnection();
