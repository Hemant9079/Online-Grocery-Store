const https = require('https');

const data = JSON.stringify({ email: 'hkumar954995@gmail.com' });

const options = {
  hostname: 'online-grocery-store-brqh.onrender.com',
  port: 443,
  path: '/api/auth/forgot-password',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': data.length
  }
};

const req = https.request(options, (res) => {
  let body = '';
  res.on('data', chunk => body += chunk);
  res.on('end', () => console.log(`STATUS: ${res.statusCode}\nBODY: ${body}`));
});

req.on('error', (e) => {
  console.error(`problem with request: ${e.message}`);
});

req.write(data);
req.end();
