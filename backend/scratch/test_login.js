const http = require('http');

function testLogin(identifier, password, tenantId) {
  return new Promise((resolve) => {
    const body = JSON.stringify({ identifier, password, tenantId });
    const options = {
      hostname: 'localhost',
      port: 5001,
      path: '/api/auth/login',
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(body) }
    };
    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          const json = JSON.parse(data);
          if (json.token) {
            console.log(`✅ SUCCESS: ${identifier} (${json.user.role})`);
            console.log(`   Name: ${json.user.name}`);
            console.log(`   Society: ${json.user.tenantName || 'N/A (Super Admin)'}`);
          } else {
            console.log(`❌ FAILED: ${identifier} -> ${json.message}`);
          }
        } catch(e) { console.log('Parse error:', data); }
        resolve();
      });
    });
    req.on('error', e => { console.log('Request error:', e.message); resolve(); });
    req.write(body);
    req.end();
  });
}

async function run() {
  console.log('\n--- VERIFYING SEEDED ROLES ---');
  
  console.log('1. Super Admin:');
  await testLogin('superadmin@example.com', 'admin123', undefined);

  console.log('\n2. Tenant Admin:');
  await testLogin('treasurer@sunrise.com', 'admin123', undefined);

  console.log('\n3. Resident/Member:');
  await testLogin('member@sunrise.com', 'admin123', undefined);
  console.log('');
}

run();
