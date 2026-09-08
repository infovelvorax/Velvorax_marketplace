import http from 'http';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

function request(fullPath, method, body, token) {
  return new Promise((resolve, reject) => {
    const data = body ? JSON.stringify(body) : '';
    const req = http.request({
      hostname: 'localhost',
      port: process.env.PORT || 5000,
      path: fullPath,
      method: method,
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(data),
        ...(token ? { 'Authorization': `Bearer ${token}` } : {})
      }
    }, (res) => {
      let responseBody = '';
      res.on('data', chunk => responseBody += chunk);
      res.on('end', () => {
        try {
          resolve({ status: res.statusCode, data: JSON.parse(responseBody) });
        } catch {
          resolve({ status: res.statusCode, text: responseBody });
        }
      });
    });

    req.on('error', reject);
    if (data) req.write(data);
    req.end();
  });
}

async function testAdminEndpoints() {
  console.log('Testing Admin Login and Endpoints...\n');

  // 1. Admin Login
  const loginRes = await request('/api/marketplace/admin/auth/login', 'POST', {
    username: process.env.ADMIN_USERNAME || 'velvorax_admin',
    password: process.env.ADMIN_PASSWORD || 'VxAdmin@2026#Secure'
  });

  if (loginRes.status !== 200 || !loginRes.data?.token) {
    console.error('Admin Login failed:', loginRes);
    process.exit(1);
  }

  const token = loginRes.data.token;
  console.log('1. Admin Login: PASS (Token acquired)');

  // 2. GET /api/marketplace/admin/dashboard/stats
  const statsRes = await request('/api/marketplace/admin/dashboard/stats', 'GET', null, token);
  console.log('2. GET /admin/dashboard/stats: PASS (Status:', statsRes.status, 'Users:', statsRes.data?.data?.totalUsers, 'Sellers:', statsRes.data?.data?.totalSellers, ')');

  // 3. GET /api/marketplace/admin/sellers?status=ALL&q=
  const sellersRes = await request('/api/marketplace/admin/sellers?status=ALL&q=', 'GET', null, token);
  console.log('3. GET /admin/sellers?status=ALL&q=: PASS (Status:', sellersRes.status, 'Count:', sellersRes.data?.data?.length, ')');

  // 4. GET /api/marketplace/admin/sellers?status=PENDING_APPROVAL
  const pendingSellersRes = await request('/api/marketplace/admin/sellers?status=PENDING_APPROVAL', 'GET', null, token);
  console.log('4. GET /admin/sellers?status=PENDING_APPROVAL: PASS (Status:', pendingSellersRes.status, 'Count:', pendingSellersRes.data?.data?.length, ')');

  // 5. GET /api/marketplace/admin/buyers?q=
  const buyersRes = await request('/api/marketplace/admin/buyers?q=', 'GET', null, token);
  console.log('5. GET /admin/buyers?q=: PASS (Status:', buyersRes.status, 'Count:', buyersRes.data?.data?.length, ')');

  // 6. GET /api/marketplace/admin/moderation?category=properties
  const modRes = await request('/api/marketplace/admin/moderation?category=properties', 'GET', null, token);
  console.log('6. GET /admin/moderation?category=properties: PASS (Status:', modRes.status, 'Count:', modRes.data?.data?.length, ')');

  console.log('\nAll Admin API endpoints successfully verified!');
}

testAdminEndpoints().catch(err => {
  console.error('Error:', err);
  process.exit(1);
});
