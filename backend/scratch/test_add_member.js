const http = require('http');

function loginAndAddMember(identifier, password, payload) {
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
            addMember(json.token, payload).then(resolve);
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

function addMember(token, payload) {
  return new Promise((resolve) => {
    const body = JSON.stringify(payload);
    const options = {
      hostname: 'localhost',
      port: 5001,
      path: '/api/members',
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(body)
      }
    };
    
    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        console.log(`POST /api/members status: ${res.statusCode}`);
        console.log(`Response body: ${data}`);
        resolve();
      });
    });
    req.on('error', e => { console.log('Post error:', e.message); resolve(); });
    req.write(body);
    req.end();
  });
}

async function run() {
  const sampleMember = {
    name: "Jane Doe Test",
    email: "janedoe@example.com",
    mobile: "9876540001",
    flatNo: "B-205",
    address: "Sunrise Apartments Block B",
    outstandingDues: 0,
    password: "password123",
    enableLogin: true,
    defaultTenure: "MONTHLY",
    paidUntil: "2026-06-01",
    initialPaymentAmount: 0,
    initialPaymentMode: "CASH",
    initialPaymentNotes: "",
    photoUrl: "",
    idProofUrl: ""
  };
  
  console.log("--- TESTING ADD MEMBER (WITH LOGIN ENABLED) ---");
  await loginAndAddMember('treasurer@sunrise.com', 'admin123', sampleMember);
  
  console.log("\n--- TESTING ADD MEMBER (WITHOUT LOGIN ENABLED) ---");
  await loginAndAddMember('treasurer@sunrise.com', 'admin123', {
    ...sampleMember,
    name: "Bob Smith Test",
    email: "bobsmith@example.com",
    mobile: "9876540002",
    flatNo: "C-305",
    enableLogin: false,
    password: ""
  });
}

run();
