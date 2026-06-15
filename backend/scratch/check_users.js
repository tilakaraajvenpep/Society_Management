const { Pool } = require('../node_modules/pg');
const pool = new Pool({ connectionString: 'postgresql://sowndarkumar@localhost:5432/society_management' });

pool.query('SELECT u.email, u.mobile, u.name, u.role, t.name as tenant_name, t.slug FROM "User" u LEFT JOIN "Tenant" t ON u."tenantId" = t.id ORDER BY u."createdAt" ASC LIMIT 30')
  .then(r => {
    console.log('\n=== USERS IN DATABASE ===\n');
    r.rows.forEach(row => {
      console.log(`Role: ${row.role}`);
      console.log(`Name: ${row.name}`);
      console.log(`Email: ${row.email || '(none)'}`);
      console.log(`Mobile: ${row.mobile || '(none)'}`);
      console.log(`Society: ${row.tenant_name || 'N/A (Super Admin)'}`);
      console.log(`Login URL slug: ${row.slug || 'N/A'}`);
      console.log('---');
    });
    pool.end();
  })
  .catch(e => {
    console.log('DB Error:', e.message);
    pool.end();
  });
