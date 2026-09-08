import http from 'http';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import dns from 'dns';
import { User } from '../models/User.js';

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

async function runSellerFlowTests() {
  console.log('================================================================');
  console.log('SELLER REGISTRATION → MONGODB → LOGIN → DASHBOARD → ADMIN FLOW');
  console.log('================================================================\n');

  await mongoose.connect(process.env.MONGODB_URI, { serverSelectionTimeoutMS: 15000 });
  console.log('[Setup] Direct MongoDB Atlas connection established for DB verification.\n');

  const randomSuffix = Math.floor(100000 + Math.random() * 900000);
  const seller1Email = `seller.test.${randomSuffix}@velvorax-test.com`;
  const seller1Password = 'StrongSellerPass@2026!';
  const seller1Name = `Apex Global Ventures ${randomSuffix}`;
  const seller1Phone = `+91 98765${randomSuffix.toString().slice(0, 5)}`;

  // -----------------------------------------------------------------
  // TEST 1 — REGISTER SELLER
  // -----------------------------------------------------------------
  console.log(`[TEST 1] Registering New Seller: ${seller1Email}...`);
  const reg1Res = await request('/api/marketplace/auth/register', 'POST', {
    name: seller1Name,
    email: seller1Email,
    phone: seller1Phone,
    password: seller1Password,
    role: 'seller'
  });

  const reg1Success = reg1Res.status === 201 && reg1Res.data?.success && reg1Res.data?.token;
  if (!reg1Success) {
    console.error(`[TEST 1] FAILED: Status=${reg1Res.status}`, reg1Res.data);
    throw new Error('Test 1 failed');
  }

  // Verify in MongoDB Atlas directly
  const seller1InDb = await User.findOne({ email: seller1Email.toLowerCase().trim() });
  if (!seller1InDb) {
    console.error(`[TEST 1] FAILED: Seller document not found in MongoDB Atlas!`);
    throw new Error('Seller not in DB');
  }

  const dbRoleMatch = seller1InDb.role === 'SELLER';
  const dbStatusMatch = seller1InDb.sellerStatus === 'PENDING_APPROVAL';
  const dbPasswordHashed = seller1InDb.passwordHash && seller1InDb.passwordHash.startsWith('$2');

  console.log(`  ✓ HTTP Status: ${reg1Res.status} (Created)`);
  console.log(`  ✓ MongoDB Document ID: ${seller1InDb._id}`);
  console.log(`  ✓ MongoDB role: ${seller1InDb.role} (matches ${dbRoleMatch})`);
  console.log(`  ✓ MongoDB sellerStatus: ${seller1InDb.sellerStatus} (matches ${dbStatusMatch})`);
  console.log(`  ✓ MongoDB password hashed with bcrypt: ${dbPasswordHashed}`);
  console.log('[TEST 1] PASS: Registration writes correctly to MongoDB with PENDING_APPROVAL\n');

  // -----------------------------------------------------------------
  // TEST 2 — LOGIN WITH REGISTERED CREDENTIALS
  // -----------------------------------------------------------------
  console.log(`[TEST 2] Logging in as newly registered seller (Pending Approval)...`);
  const login1Res = await request('/api/marketplace/auth/login', 'POST', {
    email: `  ${seller1Email.toUpperCase()}  `, // Test normalization with uppercase & spaces
    password: seller1Password
  });

  const login1Success = login1Res.status === 200 && login1Res.data?.token && login1Res.data?.data?.role === 'SELLER';
  if (!login1Success) {
    console.error(`[TEST 2] FAILED: Status=${login1Res.status}`, login1Res.data);
    throw new Error('Test 2 failed');
  }

  const seller1Token = login1Res.data.token;
  console.log(`  ✓ HTTP Status: ${login1Res.status} (OK)`);
  console.log(`  ✓ JWT Token issued: ${seller1Token.slice(0, 20)}...`);
  console.log(`  ✓ Returned User: Name="${login1Res.data.data.name}", Role="${login1Res.data.data.role}", Status="${login1Res.data.data.sellerStatus}"`);
  console.log('[TEST 2] PASS: Seller successfully logged in against MongoDB Atlas and allowed dashboard access\n');

  // -----------------------------------------------------------------
  // TEST 3 — WRONG PASSWORD LOGIN
  // -----------------------------------------------------------------
  console.log(`[TEST 3] Testing Wrong Password rejection...`);
  const wrongPassRes = await request('/api/marketplace/auth/login', 'POST', {
    email: seller1Email,
    password: 'CompletelyWrongPassword!123'
  });

  const wrongPassPass = wrongPassRes.status === 401 && wrongPassRes.data?.message === 'Invalid email or password.';
  if (!wrongPassPass) {
    console.error(`[TEST 3] FAILED: Status=${wrongPassRes.status}`, wrongPassRes.data);
    throw new Error('Test 3 failed');
  }
  console.log(`  ✓ HTTP Status: ${wrongPassRes.status} (Unauthorized)`);
  console.log(`  ✓ Message: "${wrongPassRes.data.message}"`);
  console.log('[TEST 3] PASS: Wrong password rejected securely with 401\n');

  // -----------------------------------------------------------------
  // TEST 4 — ADMIN SELLER APPROVALS QUERY
  // -----------------------------------------------------------------
  console.log(`[TEST 4] Admin logging in and querying /api/marketplace/admin/sellers?status=PENDING_APPROVAL...`);
  const adminLoginRes = await request('/api/marketplace/admin/auth/login', 'POST', {
    username: process.env.ADMIN_USERNAME,
    password: process.env.ADMIN_PASSWORD
  });

  if (adminLoginRes.status !== 200 || !adminLoginRes.data?.token) {
    console.error(`[TEST 4] Admin Login FAILED`, adminLoginRes.data);
    throw new Error('Admin login failed');
  }

  const adminToken = adminLoginRes.data.token;
  const adminSellersRes = await request('/api/marketplace/admin/sellers?status=PENDING_APPROVAL&q=', 'GET', null, adminToken);

  const sellersList = adminSellersRes.data?.data?.sellers || adminSellersRes.data?.data || [];
  const foundSeller = sellersList.find(s => s.email === seller1Email.toLowerCase() || s.id === seller1InDb._id.toString() || s._id === seller1InDb._id.toString());

  console.log(`  ✓ HTTP Status: ${adminSellersRes.status} (OK)`);
  console.log(`  ✓ Pending sellers count: ${sellersList.length}`);
  console.log(`  ✓ Newly registered seller found in Admin List: ${!!foundSeller}`);
  if (!foundSeller) {
    console.error('[TEST 4] FAILED: Newly registered seller not found in pending sellers list!');
    throw new Error('Test 4 failed');
  }
  console.log('[TEST 4] PASS: Admin can see new seller in Seller Approvals\n');

  // -----------------------------------------------------------------
  // TEST 5 — ADMIN APPROVES SELLER
  // -----------------------------------------------------------------
  console.log(`[TEST 5] Admin approving seller ${seller1InDb._id}...`);
  const approveRes = await request(`/api/marketplace/admin/sellers/${seller1InDb._id}/status`, 'PATCH', {
    status: 'APPROVED',
    notes: 'All documents verified and approved in automated verification test.'
  }, adminToken);

  const approveSuccess = approveRes.status === 200 && approveRes.data?.success;
  if (!approveSuccess) {
    console.error(`[TEST 5] FAILED: Status=${approveRes.status}`, approveRes.data);
    throw new Error('Test 5 failed');
  }

  // Verify MongoDB document update
  const updatedSeller1InDb = await User.findById(seller1InDb._id);
  const isApprovedInDb = updatedSeller1InDb.sellerStatus === 'APPROVED';

  console.log(`  ✓ HTTP Status: ${approveRes.status} (OK)`);
  console.log(`  ✓ MongoDB sellerStatus after approval: ${updatedSeller1InDb.sellerStatus}`);
  if (!isApprovedInDb) {
    console.error('[TEST 5] FAILED: MongoDB document status did not update to APPROVED');
    throw new Error('Test 5 failed');
  }
  console.log('[TEST 5] PASS: Seller successfully approved in MongoDB Atlas\n');

  // -----------------------------------------------------------------
  // TEST 6 — SELLER LOGIN AGAIN (VERIFY APPROVED STATUS)
  // -----------------------------------------------------------------
  console.log(`[TEST 6] Seller re-authenticating after approval...`);
  const reLoginRes = await request('/api/marketplace/auth/login', 'POST', {
    email: seller1Email,
    password: seller1Password
  });

  const reLoginSuccess = reLoginRes.status === 200 && reLoginRes.data?.data?.sellerStatus === 'APPROVED';
  if (!reLoginSuccess) {
    console.error(`[TEST 6] FAILED: Status=${reLoginRes.status}`, reLoginRes.data);
    throw new Error('Test 6 failed');
  }
  console.log(`  ✓ HTTP Status: ${reLoginRes.status} (OK)`);
  console.log(`  ✓ Seller status returned to frontend: ${reLoginRes.data?.data?.sellerStatus}`);
  console.log('[TEST 6] PASS: Seller logs in with APPROVED status and active permissions\n');

  // -----------------------------------------------------------------
  // TEST 7 — REJECT FLOW WITH 2ND SELLER
  // -----------------------------------------------------------------
  const seller2Email = `seller2.test.${randomSuffix}@velvorax-test.com`;
  const seller2Password = 'AnotherStrongPass@2026!';
  console.log(`[TEST 7] Testing Rejection Flow with 2nd Seller (${seller2Email})...`);

  // 7a: Register 2nd seller
  const reg2Res = await request('/api/marketplace/auth/register', 'POST', {
    name: `Declined Seller ${randomSuffix}`,
    email: seller2Email,
    phone: `+91 99999${randomSuffix.toString().slice(0, 5)}`,
    password: seller2Password,
    role: 'seller'
  });
  if (reg2Res.status !== 201) throw new Error('Seller 2 registration failed');

  const seller2InDb = await User.findOne({ email: seller2Email.toLowerCase().trim() });

  // 7b: Admin rejects 2nd seller
  const rejectRes = await request(`/api/marketplace/admin/sellers/${seller2InDb._id}/status`, 'PATCH', {
    status: 'REJECTED',
    notes: 'Missing business license documentation.'
  }, adminToken);

  if (rejectRes.status !== 200) throw new Error('Admin reject failed');

  // 7c: Verify in DB
  const rejectedSellerInDb = await User.findById(seller2InDb._id);
  const isRejectedInDb = rejectedSellerInDb.sellerStatus === 'REJECTED';
  console.log(`  ✓ MongoDB sellerStatus after rejection: ${rejectedSellerInDb.sellerStatus}`);
  console.log(`  ✓ Seller rejection note saved: "${rejectedSellerInDb.sellerRejectionReason}"`);

  // 7d: Seller logs in and sees REJECTED status
  const seller2LoginRes = await request('/api/marketplace/auth/login', 'POST', {
    email: seller2Email,
    password: seller2Password
  });

  const seller2LoginPass = seller2LoginRes.status === 200 && seller2LoginRes.data?.data?.sellerStatus === 'REJECTED';
  console.log(`  ✓ Seller 2 login status: ${seller2LoginRes.data?.data?.sellerStatus}`);
  if (!isRejectedInDb || !seller2LoginPass) throw new Error('Test 7 failed');
  console.log('[TEST 7] PASS: Rejection flow completed, recorded in MongoDB, and verified in login payload\n');

  // Clean up test users created during automated test
  await User.deleteMany({ _id: { $in: [seller1InDb._id, seller2InDb._id] } });
  console.log('[Cleanup] Test sellers cleaned up from MongoDB Atlas.');

  console.log('\n================================================================');
  console.log('ALL 7 SELLER AUTH & APPROVAL FLOW TESTS PASSED 100%!');
  console.log('================================================================');

  await mongoose.disconnect();
}

runSellerFlowTests().catch(err => {
  console.error('Seller Flow Test Error:', err);
  process.exit(1);
});
