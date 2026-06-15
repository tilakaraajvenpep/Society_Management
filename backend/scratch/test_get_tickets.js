const http = require('http');

function loginAndGetTickets(identifier, password) {
  return new Promise((resolve) => {
    const loginBody = JSON.stringify({ identifier, password });
    const loginOptions = {
      hostname: 'localhost',
      port: 5001,
      path: '/api/auth/login',
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(loginBody) }
    };
    
    const req = http.request(loginOptions, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          const json = JSON.parse(data);
          if (json.token) {
            console.log(`✅ Logged in: ${identifier}`);
            fetchTickets(json.token).then(resolve);
          } else {
            console.log(`❌ Login failed: ${identifier} -> ${json.message}`);
            resolve();
          }
        } catch(e) { console.log('Parse error during login:', data); resolve(); }
      });
    });
    req.write(loginBody);
    req.end();
  });
}

function fetchTickets(token) {
  return new Promise((resolve) => {
    const options = {
      hostname: 'localhost',
      port: 5001,
      path: '/api/tickets',
      method: 'GET',
      headers: { 'Authorization': `Bearer ${token}` }
    };
    
    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        console.log(`GET /api/tickets status: ${res.statusCode}`);
        console.log(`Response body: ${data}`);
        resolve();
      });
    });
    req.on('error', e => { console.log('Fetch error:', e.message); resolve(); });
    req.end();
  });
}

async function run() {
  console.log('--- TESTING MEMBER GET TICKETS ---');
  await loginAndGetTickets('member@sunrise.com', 'admin123');

  console.log('\n--- TESTING TENANT ADMIN GET TICKETS ---');
  await loginAndGetTickets('treasurer@sunrise.com', 'admin123');
}

run();
