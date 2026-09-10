import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import http from 'http';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

import app from '../app.js';
import { connectDB } from '../config/db.js';
import { syncAdminUser } from '../utils/syncAdminUser.js';
import { syncUserEmailIndexes } from '../utils/syncUserEmailIndexes.js';
import mongoose from 'mongoose';

const makeRequest = (server, path, method = 'GET', body = null, headers = {}) => {
  const address = server.address();
  return new Promise((resolve, reject) => {
    const postData = body ? JSON.stringify(body) : '';
    const reqHeaders = {
      'Content-Type': 'application/json',
      ...headers
    };
    if (postData) {
      reqHeaders['Content-Length'] = Buffer.byteLength(postData);
    }

    const req = http.request({
      hostname: 'localhost',
      port: address.port,
      path,
      method,
      headers: reqHeaders
    }, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          resolve({ status: res.statusCode, headers: res.headers, data: JSON.parse(data) });
        } catch {
          resolve({ status: res.statusCode, headers: res.headers, text: data });
        }
      });
    });

    req.on('error', reject);
    if (postData) req.write(postData);
    req.end();
  });
};

async function runTests() {
  console.log('\n======================================================');
  console.log('🚀 TESTING ADMIN AUTHENTICATION & PRODUCTION FIXES');
  console.log('======================================================\n');

  await connectDB();
  await syncUserEmailIndexes();
  await syncAdminUser();

  const server = app.listen(0);
  const address = server.address();
  console.log(`[Test Server] Ephemeral server running on port: ${address.port}`);

  try {
    const adminUser = process.env.ADMIN_USERNAME || 'velvorax_admin';
    const adminPass = process.env.ADMIN_PASSWORD || 'vmprv_2022';
    const adminMail = process.env.ADMIN_EMAIL || 'info.velvorax@gmail.com';
    const pin = process.env.ADMIN_SECRET_PIN || '680019';

    // TEST 1: CORS Preflight OPTIONS from production origin
    console.log('\n--- 1. Testing CORS Preflight from Live Domain ---');
    const corsRes = await makeRequest(server, '/api/marketplace/admin/auth/login', 'OPTIONS', null, {
      'Origin': 'https://velvorax.com',
      'Access-Control-Request-Method': 'POST',
      'Access-Control-Request-Headers': 'Content-Type, Authorization'
    });
    console.log(`OPTIONS /api/marketplace/admin/auth/login: Status ${corsRes.status}`);
    console.log(`Access-Control-Allow-Origin: ${corsRes.headers['access-control-allow-origin'] || 'NONE'}`);
    if (corsRes.status !== 204 && corsRes.status !== 200) {
      throw new Error(`CORS Preflight failed with status: ${corsRes.status}`);
    }
    console.log('✅ TEST 1 PASSED: CORS preflight passes for live domain');

    // TEST 2: Admin PIN Verification (Standard & Fallback routes)
    console.log('\n--- 2. Testing Admin Gateway PIN Verification ---');
    const pinRes1 = await makeRequest(server, '/api/marketplace/admin/auth/verify-pin', 'POST', { pin });
    console.log(`POST /api/marketplace/admin/auth/verify-pin: Status ${pinRes1.status}, success: ${pinRes1.data?.success}`);
    if (pinRes1.status !== 200 || !pinRes1.data?.success) {
      throw new Error(`PIN verification failed on /api/marketplace/admin/auth/verify-pin: ${JSON.stringify(pinRes1.data)}`);
    }

    const pinRes2 = await makeRequest(server, '/admin/auth/verify-pin', 'POST', { pin });
    console.log(`POST /admin/auth/verify-pin (fallback route): Status ${pinRes2.status}, success: ${pinRes2.data?.success}`);
    if (pinRes2.status !== 200 || !pinRes2.data?.success) {
      throw new Error(`PIN verification failed on /admin/auth/verify-pin: ${JSON.stringify(pinRes2.data)}`);
    }
    console.log('✅ TEST 2 PASSED: Admin PIN clearance verified on all route mounts');

    // TEST 3: Admin Direct Login via Username
    console.log('\n--- 3. Testing Admin Login via Username ---');
    const loginRes1 = await makeRequest(server, '/api/marketplace/admin/auth/login', 'POST', {
      username: adminUser,
      password: adminPass
    });
    console.log(`POST /api/marketplace/admin/auth/login: Status ${loginRes1.status}, role: ${loginRes1.data?.user?.role}`);
    if (loginRes1.status !== 200 || !loginRes1.data?.token || loginRes1.data?.user?.role !== 'ADMIN') {
      throw new Error(`Admin login failed: ${JSON.stringify(loginRes1.data)}`);
    }
    const adminToken = loginRes1.data.token;
    console.log('✅ TEST 3 PASSED: Admin login succeeded, valid JWT generated with ADMIN role');

    // TEST 4: Admin Login via Email and on /admin route
    console.log('\n--- 4. Testing Admin Login via Email on Fallback Route ---');
    const loginRes2 = await makeRequest(server, '/admin/auth/login', 'POST', {
      email: adminMail,
      password: adminPass
    });
    console.log(`POST /admin/auth/login: Status ${loginRes2.status}, role: ${loginRes2.data?.user?.role}`);
    if (loginRes2.status !== 200 || !loginRes2.data?.token || loginRes2.data?.user?.role !== 'ADMIN') {
      throw new Error(`Admin email login failed on fallback route: ${JSON.stringify(loginRes2.data)}`);
    }
    console.log('✅ TEST 4 PASSED: Admin email login succeeded on fallback mount');

    // TEST 5: Admin Protected Endpoints
    console.log('\n--- 5. Testing Protected Admin Dashboard APIs ---');
    const statsRes = await makeRequest(server, '/api/marketplace/admin/stats', 'GET', null, {
      'Authorization': `Bearer ${adminToken}`
    });
    console.log(`GET /api/marketplace/admin/stats: Status ${statsRes.status}, success: ${statsRes.data?.success}`);
    if (statsRes.status !== 200) {
      throw new Error(`Admin could not access /admin/stats: ${JSON.stringify(statsRes.data)}`);
    }

    const sellersRes = await makeRequest(server, '/api/marketplace/admin/sellers', 'GET', null, {
      'Authorization': `Bearer ${adminToken}`
    });
    console.log(`GET /api/marketplace/admin/sellers: Status ${sellersRes.status}, count: ${sellersRes.data?.data?.length ?? 'OK'}`);
    if (sellersRes.status !== 200) {
      throw new Error(`Admin could not access /admin/sellers: ${JSON.stringify(sellersRes.data)}`);
    }

    const verifRes = await makeRequest(server, '/api/marketplace/admin/verifications', 'GET', null, {
      'Authorization': `Bearer ${adminToken}`
    });
    console.log(`GET /api/marketplace/admin/verifications: Status ${verifRes.status}`);
    if (verifRes.status !== 200) {
      throw new Error(`Admin could not access /admin/verifications: ${JSON.stringify(verifRes.data)}`);
    }

    const consolidationRes = await makeRequest(server, '/api/marketplace/admin/consolidation', 'GET', null, {
      'Authorization': `Bearer ${adminToken}`
    });
    console.log(`GET /api/marketplace/admin/consolidation: Status ${consolidationRes.status}`);
    if (consolidationRes.status !== 200) {
      throw new Error(`Admin could not access /admin/consolidation`);
    }
    console.log('✅ TEST 5 PASSED: All protected Admin Dashboard APIs accessible with Admin token');

    // TEST 6: Non-Admin Rejection from Admin Portal
    console.log('\n--- 6. Testing Non-Admin Rejection from Admin Portal ---');
    const buyerLoginRes = await makeRequest(server, '/api/marketplace/auth/buyer/login', 'POST', {
      email: 'buyer@velvorax.com',
      password: 'Password@123'
    });
    const buyerToken = buyerLoginRes.data?.token;

    if (buyerToken) {
      const forbiddenRes = await makeRequest(server, '/api/marketplace/admin/stats', 'GET', null, {
        'Authorization': `Bearer ${buyerToken}`
      });
      console.log(`Buyer token on /admin/stats: Status ${forbiddenRes.status} (Expected 403 Forbidden)`);
      if (forbiddenRes.status !== 403) {
        throw new Error(`Security violation: Buyer was not blocked with 403 Forbidden from admin stats! Got: ${forbiddenRes.status}`);
      }
      console.log('✅ TEST 6 PASSED: Buyer correctly rejected from Admin APIs with 403 Forbidden');
    } else {
      console.log('ℹ️ Buyer test account not present in current DB seed, skipping buyer token test.');
    }

    // TEST 7: Invalid Admin Password Rejection
    console.log('\n--- 7. Testing Invalid Password Rejection ---');
    const invalidLogin = await makeRequest(server, '/api/marketplace/admin/auth/login', 'POST', {
      username: adminUser,
      password: 'DefinatelyWrongPassword!#123'
    });
    console.log(`Invalid Admin Password Attempt: Status ${invalidLogin.status}, Message: "${invalidLogin.data?.message}"`);
    if (invalidLogin.status !== 401) {
      throw new Error(`Invalid password was not rejected with 401! Got: ${invalidLogin.status}`);
    }
    console.log('✅ TEST 7 PASSED: Invalid admin credentials safely rejected with 401');

    console.log('\n======================================================');
    console.log('🎉 ALL PRODUCTION & ADMIN AUTHENTICATION TESTS PASSED 100%!');
    console.log('======================================================\n');
  } finally {
    server.close();
    await mongoose.disconnect();
  }
}

runTests().catch((err) => {
  console.error('\n❌ Test Failure:', err.message);
  process.exit(1);
});
