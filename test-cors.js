const https = require('https');

const options = {
  hostname: 'online-grocery-store-brqh.onrender.com',
  port: 443,
  path: '/api/auth/login',
  method: 'OPTIONS',
  headers: {
    'Origin': 'https://online-grocery-store-tau-tan.vercel.app',
    'Access-Control-Request-Method': 'POST'
  }
};

const req = https.request(options, (res) => {
  console.log(`STATUS: ${res.statusCode}`);
  console.log(`HEADERS: ${JSON.stringify(res.headers, null, 2)}`);
});

req.on('error', (e) => {
  console.error(`problem with request: ${e.message}`);
});

req.end();
