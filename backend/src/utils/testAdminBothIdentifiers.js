import http from 'http';
import dotenv from 'dotenv';
dotenv.config();

function login(identifier, password) {
  return new Promise((resolve) => {
    const data = JSON.stringify({ email: identifier, password, expectedRole: 'ADMIN' });
    const req = http.request({
      hostname: 'localhost',
      port: 5000,
      path: '/api/marketplace/auth/login',
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(data) }
    }, (res) => {
      let b = '';
      res.on('data', c => b += c);
      res.on('end', () => resolve({ status: res.statusCode, data: JSON.parse(b) }));
    });
    req.write(data);
    req.end();
  });
}

async function testBoth() {
  const byUsername = await login(process.env.ADMIN_USERNAME, process.env.ADMIN_PASSWORD);
  console.log('Login by Username (' + process.env.ADMIN_USERNAME + '):', byUsername.status, byUsername.data?.success ? 'PASS' : 'FAIL');

  const byEmail = await login(process.env.ADMIN_EMAIL, process.env.ADMIN_PASSWORD);
  console.log('Login by Email (' + process.env.ADMIN_EMAIL + '):', byEmail.status, byEmail.data?.success ? 'PASS' : 'FAIL');
}

testBoth();
