const http = require('http');

function loginAndPostTicket(identifier, password) {
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
            createTicket(json.token).then(resolve);
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

function createTicket(token) {
  return new Promise((resolve) => {
    const ticketBody = JSON.stringify({
      subject: "Water leakage in flat 4B",
      description: "There is some leakage from the ceiling in the master bedroom.",
      priority: "HIGH"
    });

    const options = {
      hostname: 'localhost',
      port: 5001,
      path: '/api/tickets',
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(ticketBody)
      }
    };
    
    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        console.log(`POST /api/tickets status: ${res.statusCode}`);
        console.log(`Response body: ${data}`);
        resolve();
      });
    });
    req.on('error', e => { console.log('Post error:', e.message); resolve(); });
    req.write(ticketBody);
    req.end();
  });
}

async function run() {
  await loginAndPostTicket('member@sunrise.com', 'admin123');
}

run();
