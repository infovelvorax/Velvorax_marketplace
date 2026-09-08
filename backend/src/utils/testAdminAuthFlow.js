import mongoose from 'mongoose';
import dotenv from 'dotenv';
import http from 'http';
import app from '../app.js';
import { User } from '../models/User.js';

dotenv.config();

function makeRequest(server, path, method, body, token) {
  const address = server.address();
  return new Promise((resolve, reject) => {
    const data = body ? JSON.stringify(body) : '';
    const req = http.request({
      hostname: 'localhost',
      port: address.port,
      path: `/api/marketplace${path}`,
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

async function runTest() {
  console.log('--- Running Admin Auth & Seed Verification Test ---');
  await mongoose.connect(process.env.MONGODB_URI);

  const server = app.listen(0);
  const address = server.address();
  console.log(`Ephemeral test server listening on port ${address.port}`);

  try {
    // Diagnostics
    const dbAdmin = await User.findOne({ email: 'admin@velvorax.com' });
    const bcrypt = (await import('bcryptjs')).default;
    const directCompare = dbAdmin ? await bcrypt.compare('VxAdmin@2026#Secure', dbAdmin.passwordHash) : false;
    console.log('DB Admin user details:', {
      _id: dbAdmin?._id,
      username: dbAdmin?.username,
      email: dbAdmin?.email,
      role: dbAdmin?.role,
      accountStatus: dbAdmin?.accountStatus,
      passwordHash: dbAdmin?.passwordHash,
      directCompare,
      isMatch: await dbAdmin?.matchPassword('VxAdmin@2026#Secure')
    });


    // 1. Verify Admin Login with username `velvorax_admin`
    const res1 = await makeRequest(server, '/auth/login', 'POST', {
      email: 'velvorax_admin',
      password: 'VxAdmin@2026#Secure',
      expectedRole: 'ADMIN'
    });

    console.log('1. Admin Login via username ("velvorax_admin"):', res1.status, res1.data.success ? 'SUCCESS' : res1.data.message);
    if (res1.status !== 200 || !res1.data.token || res1.data.data.role.toUpperCase() !== 'ADMIN') {
      throw new Error(`Admin username login failed: ${JSON.stringify(res1.data)}`);
    }

    const adminToken = res1.data.token;

    // 2. Verify Admin Login with email `admin@velvorax.com`
    const res2 = await makeRequest(server, '/auth/login', 'POST', {
      email: 'admin@velvorax.com',
      password: 'VxAdmin@2026#Secure',
      expectedRole: 'ADMIN'
    });
    console.log('2. Admin Login via email ("admin@velvorax.com"):', res2.status, res2.data.success ? 'SUCCESS' : res2.data.message);
    if (res2.status !== 200 || !res2.data.token) {
      throw new Error(`Admin email login failed: ${JSON.stringify(res2.data)}`);
    }

    // 3. Verify Non-Admin rejection when attempting Admin portal
    const res3 = await makeRequest(server, '/auth/login', 'POST', {
      email: 'buyer@velvorax.com',
      password: 'Password@123',
      expectedRole: 'ADMIN'
    });
    console.log('3. Buyer Rejection from Admin Login Portal:', res3.status, res3.data.message);
    if (res3.status !== 401 && res3.status !== 403) {
      throw new Error('Buyer was not rejected from Admin portal');
    }

    // 4. Verify Invalid Password rejection
    const res4 = await makeRequest(server, '/auth/login', 'POST', {
      email: 'velvorax_admin',
      password: 'WrongPassword123!',
      expectedRole: 'ADMIN'
    });
    console.log('4. Invalid Password Rejection:', res4.status, res4.data.message);
    if (res4.status !== 401 || res4.data.message !== 'Invalid admin credentials.') {
      throw new Error('Invalid credentials error message did not match');
    }

    // 5. Verify Admin Protected Route Access
    const res5 = await makeRequest(server, '/admin/stats', 'GET', null, adminToken);
    console.log('5. Admin Protected Endpoint (/api/marketplace/admin/stats):', res5.status, res5.data.success ? 'SUCCESS' : res5.data.message);
    if (res5.status !== 200) {
      throw new Error('Admin could not access /admin/stats');
    }

    console.log('\n--- ALL ADMIN AUTH & ROLE VERIFICATIONS PASSED 100%! ---');
  } finally {
    server.close();
    await mongoose.disconnect();
  }
}

runTest().catch(err => {
  console.error('Fatal test error:', err);
  process.exit(1);
});
