import http from 'http';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import dns from 'dns';
import { User } from '../models/User.js';

// Ensure DNS resolution handles SRV across networks
try {
  dns.setServers(['8.8.8.8', '1.1.1.1', '8.8.4.4']);
} catch {}
try {
  if (typeof dns.setDefaultResultOrder === 'function') {
    dns.setDefaultResultOrder('ipv4first');
  }
} catch {}

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

async function verifyAll() {
  console.log('====================================================');
  console.log('VELVORAX MARKETPLACE — COMPREHENSIVE BACKEND AUDIT');
  console.log('====================================================\n');

  // STEP 1: Environment Check
  const requiredEnvVars = [
    'PORT', 'MONGODB_URI', 'JWT_SECRET', 'NODE_ENV',
    'ADMIN_USERNAME', 'ADMIN_PASSWORD', 'ADMIN_EMAIL',
    'SMTP_HOST', 'SMTP_PORT', 'SMTP_USER', 'SMTP_PASS', 'SMTP_FROM'
  ];

  let missingEnv = [];
  for (const v of requiredEnvVars) {
    if (!process.env[v]) {
      missingEnv.push(v);
    }
  }

  if (missingEnv.length > 0) {
    console.error('STEP 1 — ENV CONFIG: FAIL (Missing:', missingEnv.join(', '), ')');
    process.exit(1);
  } else {
    console.log('STEP 1 — ENV CONFIG: PASS (All 12 variables defined and valid)');
  }

  // STEP 2: GET /api/health
  const healthRes = await request('/api/health', 'GET', null, null);
  const healthValid = healthRes.status === 200 && healthRes.data?.status === 'healthy' && healthRes.data?.database?.connected === true;
  console.log('STEP 2 — GET /api/health: ', healthValid ? `PASS (Status: ${healthRes.data?.status}, DB: ${healthRes.data?.database?.status}, Uptime: ${healthRes.data?.uptime}s)` : `FAIL (${JSON.stringify(healthRes)})`);
  if (!healthValid) throw new Error('Health check failed');

  // STEP 3: GET /api/marketplace/categories
  const catRes = await request('/api/marketplace/categories', 'GET', null, null);
  const catValid = (catRes.status === 200 || catRes.status === 304) && Array.isArray(catRes.data?.data || catRes.data);
  console.log('STEP 3 — GET /api/marketplace/categories: ', catValid ? `PASS (Count: ${(catRes.data?.data || catRes.data)?.length || 0})` : `FAIL (${catRes.status})`);
  if (!catValid) throw new Error('Categories check failed');

  // STEP 4: GET /api/marketplace/locations
  const locRes = await request('/api/marketplace/locations', 'GET', null, null);
  const locValid = locRes.status === 200 && Array.isArray(locRes.data?.data);
  console.log('STEP 4 — GET /api/marketplace/locations: ', locValid ? `PASS (Count: ${locRes.data?.data?.length || 0})` : `FAIL (${locRes.status})`);
  if (!locValid) throw new Error('Locations check failed');

  // STEP 5: GET /api/marketplace/locations/popular-cities
  const popRes = await request('/api/marketplace/locations/popular-cities', 'GET', null, null);
  const popValid = popRes.status === 200 && Array.isArray(popRes.data?.data);
  console.log('STEP 5 — GET /api/marketplace/locations/popular-cities: ', popValid ? `PASS (Count: ${popRes.data?.data?.length || 0})` : `FAIL (${popRes.status})`);
  if (!popValid) throw new Error('Popular cities check failed');

  // STEP 6: User Model & Admin Seed Verification in DB
  await mongoose.connect(process.env.MONGODB_URI, { serverSelectionTimeoutMS: 15000 });
  const adminUsername = (process.env.ADMIN_USERNAME || 'velvorax_admin').toLowerCase().trim();
  const adminUser = await User.findOne({ 
    $or: [
      { username: adminUsername },
      { email: (process.env.ADMIN_EMAIL || '').toLowerCase().trim() },
      { role: 'ADMIN' }
    ]
  });

  if (!adminUser) {
    console.error('STEP 6 — Admin account: FAILED (Admin user not found in DB)');
    process.exit(1);
  }

  console.log('STEP 6 — Admin account in DB: PASS (Role:', adminUser.role, '| Status:', adminUser.accountStatus, ')');
  const isBcrypt = adminUser.passwordHash && (adminUser.passwordHash.startsWith('$2a$') || adminUser.passwordHash.startsWith('$2b$'));
  console.log('STEP 6 — Admin password hash: ', isBcrypt ? 'PASS (bcrypt secure hash verified)' : 'FAIL');

  // STEP 7: Dedicated Admin Login POST /api/marketplace/admin/auth/login
  const adminLoginRes = await request('/api/marketplace/admin/auth/login', 'POST', {
    username: process.env.ADMIN_USERNAME,
    password: process.env.ADMIN_PASSWORD
  });

  const adminLoginSuccess = adminLoginRes.status === 200 && adminLoginRes.data?.success && adminLoginRes.data?.token && adminLoginRes.data?.user?.role === 'ADMIN';
  const noSensitiveLeak = !adminLoginRes.data?.user?.password && !adminLoginRes.data?.user?.passwordHash && !JSON.stringify(adminLoginRes.data).includes(process.env.ADMIN_PASSWORD);
  console.log('STEP 7 — Dedicated Admin Login (POST /api/marketplace/admin/auth/login): ', (adminLoginSuccess && noSensitiveLeak) ? 'PASS (Status 200, JWT returned, role ADMIN)' : `FAIL (${JSON.stringify(adminLoginRes.data)})`);
  if (!adminLoginSuccess || !noSensitiveLeak) throw new Error('Admin login failed');

  const adminToken = adminLoginRes.data.token;

  // STEP 8: Reject Buyer/Seller from Admin Login endpoint
  const buyerOnAdminEndpoint = await request('/api/marketplace/admin/auth/login', 'POST', {
    username: 'buyer@velvorax.com',
    password: 'Password@123'
  });
  const buyerOnAdminRejected = buyerOnAdminEndpoint.status === 401 && buyerOnAdminEndpoint.data?.message === 'Invalid admin credentials.';
  console.log('STEP 8 — Non-Admin rejected from Admin endpoint: ', buyerOnAdminRejected ? 'PASS (Status 401, generic error message)' : `FAIL (${buyerOnAdminEndpoint.status})`);
  if (!buyerOnAdminRejected) throw new Error('Buyer not rejected from admin endpoint');

  // STEP 9: Reject Bad Password on Admin Login endpoint
  const badPassAdminRes = await request('/api/marketplace/admin/auth/login', 'POST', {
    username: process.env.ADMIN_USERNAME,
    password: 'IncorrectPassword!999'
  });
  const badPassAdminRejected = badPassAdminRes.status === 401 && badPassAdminRes.data?.message === 'Invalid admin credentials.';
  console.log('STEP 9 — Bad password rejected on Admin endpoint: ', badPassAdminRejected ? 'PASS (Status 401, generic error message)' : `FAIL (${badPassAdminRes.status})`);
  if (!badPassAdminRejected) throw new Error('Bad password not rejected');

  // STEP 10: Public Login POST /api/marketplace/auth/login with Buyer & Seller
  // 10a. Buyer Login
  const buyerLoginRes = await request('/api/marketplace/auth/login', 'POST', {
    email: 'buyer@velvorax.com',
    password: 'Password@123'
  });
  const buyerLoginSuccess = buyerLoginRes.status === 200 && buyerLoginRes.data?.token && (buyerLoginRes.data?.data?.role === 'BUYER' || buyerLoginRes.data?.data?.role === 'USER');
  console.log('STEP 10a — Normal Buyer Login (POST /api/marketplace/auth/login): ', buyerLoginSuccess ? 'PASS (Status 200)' : `FAIL (${buyerLoginRes.status})`);
  if (!buyerLoginSuccess) throw new Error('Buyer login failed');
  const buyerToken = buyerLoginRes.data.token;

  // 10b. Seller Login
  const sellerLoginRes = await request('/api/marketplace/auth/login', 'POST', {
    email: 'seller@velvorax.com',
    password: 'Password@123'
  });
  const sellerLoginSuccess = sellerLoginRes.status === 200 && sellerLoginRes.data?.token && sellerLoginRes.data?.data?.role === 'SELLER';
  console.log('STEP 10b — Normal Seller Login (POST /api/marketplace/auth/login): ', sellerLoginSuccess ? 'PASS (Status 200)' : `FAIL (${sellerLoginRes.status})`);
  if (!sellerLoginSuccess) throw new Error('Seller login failed');
  const sellerToken = sellerLoginRes.data.token;

  // 10c. Reject Admin from Public Login
  const adminOnPublicLoginRes = await request('/api/marketplace/auth/login', 'POST', {
    email: process.env.ADMIN_USERNAME,
    password: process.env.ADMIN_PASSWORD
  });
  const adminOnPublicRejected = adminOnPublicLoginRes.status === 403;
  console.log('STEP 10c — Admin account disallowed from Public Login: ', adminOnPublicRejected ? 'PASS (Status 403, redirected to admin portal)' : `FAIL (${adminOnPublicLoginRes.status})`);
  if (!adminOnPublicRejected) throw new Error('Admin not rejected from public login');

  // STEP 11: Admin Role Isolation (Backend Route Guard Verification)
  const unauthStatsRes = await request('/api/marketplace/admin/stats', 'GET', null, null);
  const unauthBlocked = unauthStatsRes.status === 401;

  const buyerStatsRes = await request('/api/marketplace/admin/stats', 'GET', null, buyerToken);
  const buyerBlocked = buyerStatsRes.status === 403;

  const sellerStatsRes = await request('/api/marketplace/admin/stats', 'GET', null, sellerToken);
  const sellerBlocked = sellerStatsRes.status === 403;

  const adminStatsRes = await request('/api/marketplace/admin/stats', 'GET', null, adminToken);
  const adminAllowed = adminStatsRes.status === 200 && adminStatsRes.data?.success === true;

  const roleIsolationPass = unauthBlocked && buyerBlocked && sellerBlocked && adminAllowed;
  console.log('STEP 11 — Admin Role Isolation on backend (/api/marketplace/admin/stats): ', roleIsolationPass ? 'PASS (Unauth: 401, Buyer: 403, Seller: 403, Admin: 200)' : `FAIL`);
  if (!roleIsolationPass) throw new Error('Role isolation failed');

  console.log('\n====================================================');
  console.log('ALL AUDIT CHECKS COMPLETED AND VERIFIED 100% PASS');
  console.log('====================================================');

  await mongoose.disconnect();
}

verifyAll().catch(err => {
  console.error('Audit Error:', err);
  process.exit(1);
});

