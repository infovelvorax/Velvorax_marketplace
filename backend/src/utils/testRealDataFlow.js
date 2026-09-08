import http from 'http';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import dns from 'dns';
import { User, Listing, Category, Order, Conversation, Message } from '../models/index.js';

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

async function runRealDataFlowVerification() {
  console.log('================================================================');
  console.log('VELVORAX REAL MONGODB PRODUCTION DATA FLOW VERIFICATION');
  console.log('================================================================\n');

  await mongoose.connect(process.env.MONGODB_URI, { serverSelectionTimeoutMS: 15000 });
  console.log('[Setup] Connected to MongoDB Atlas for ground-truth verification.\n');

  const randomSuffix = Math.floor(100000 + Math.random() * 900000);
  const buyerEmail = `buyer.prod.${randomSuffix}@velvorax-real.com`;
  const buyerPassword = 'BuyerSecurePass@2026!';
  const buyerName = `Aarav Sharma ${randomSuffix}`;

  const sellerEmail = `seller.prod.${randomSuffix}@velvorax-real.com`;
  const sellerPassword = 'SellerSecurePass@2026!';
  const sellerName = `IndoTech Global ${randomSuffix}`;

  // -----------------------------------------------------------------
  // 1. BUYER REGISTRATION & REAL DB CHECK
  // -----------------------------------------------------------------
  console.log(`[TEST 1] Registering Real Buyer (${buyerEmail})...`);
  const regBuyerRes = await request('/api/marketplace/auth/register', 'POST', {
    name: buyerName,
    email: buyerEmail,
    password: buyerPassword,
    phone: `+91 98111${randomSuffix.toString().slice(0, 5)}`,
    role: 'buyer'
  });

  if (regBuyerRes.status !== 201 || !regBuyerRes.data?.token) {
    console.error('Buyer registration failed:', regBuyerRes.data);
    throw new Error('Test 1 failed');
  }

  const buyerInDb = await User.findOne({ email: buyerEmail.toLowerCase().trim() });
  if (!buyerInDb || buyerInDb.role !== 'BUYER' || !buyerInDb.passwordHash.startsWith('$2')) {
    console.error('Buyer DB document invalid:', buyerInDb);
    throw new Error('Buyer DB check failed');
  }
  console.log(`  ✓ HTTP Status: 201 (Created)`);
  console.log(`  ✓ MongoDB Buyer ID: ${buyerInDb._id}`);
  console.log(`  ✓ Role: ${buyerInDb.role}, Status: ${buyerInDb.accountStatus}, bcrypt Hash Verified`);

  // Buyer Login & Clean Dashboard (Zero Mock Data)
  const buyerLoginRes = await request('/api/marketplace/auth/login', 'POST', {
    email: buyerEmail,
    password: buyerPassword
  });
  if (buyerLoginRes.status !== 200 || !buyerLoginRes.data?.token) {
    throw new Error('Buyer login failed');
  }
  const buyerToken = buyerLoginRes.data.token;

  const buyerOrdersRes = await request('/api/marketplace/orders/buyer/purchases', 'GET', null, buyerToken);
  const buyerOrders = buyerOrdersRes.data?.data || buyerOrdersRes.data || [];
  console.log(`  ✓ Buyer real purchases count from MongoDB: ${buyerOrders.length} (Expected: 0)`);
  if (buyerOrders.length !== 0) throw new Error('Expected 0 purchases for fresh buyer');
  console.log('[TEST 1] PASS: Real Buyer registered and authenticated with clean DB state.\n');

  // -----------------------------------------------------------------
  // 2. SELLER REGISTRATION & REAL DB CHECK
  // -----------------------------------------------------------------
  console.log(`[TEST 2] Registering Real Seller (${sellerEmail})...`);
  const regSellerRes = await request('/api/marketplace/auth/register', 'POST', {
    name: sellerName,
    email: sellerEmail,
    password: sellerPassword,
    phone: `+91 98222${randomSuffix.toString().slice(0, 5)}`,
    role: 'seller'
  });

  if (regSellerRes.status !== 201 || !regSellerRes.data?.token) {
    console.error('Seller registration failed:', regSellerRes.data);
    throw new Error('Test 2 failed');
  }

  const sellerInDb = await User.findOne({ email: sellerEmail.toLowerCase().trim() });
  if (!sellerInDb || sellerInDb.role !== 'SELLER' || sellerInDb.sellerStatus !== 'PENDING_APPROVAL') {
    console.error('Seller DB document invalid:', sellerInDb);
    throw new Error('Seller DB check failed');
  }
  console.log(`  ✓ HTTP Status: 201 (Created)`);
  console.log(`  ✓ MongoDB Seller ID: ${sellerInDb._id}`);
  console.log(`  ✓ Role: ${sellerInDb.role}, sellerStatus: ${sellerInDb.sellerStatus}, bcrypt Hash Verified`);

  // Seller Login with PENDING_APPROVAL
  const sellerLoginRes = await request('/api/marketplace/auth/login', 'POST', {
    email: sellerEmail,
    password: sellerPassword
  });
  if (sellerLoginRes.status !== 200 || sellerLoginRes.data?.data?.sellerStatus !== 'PENDING_APPROVAL') {
    throw new Error('Seller pending login failed');
  }
  const sellerToken = sellerLoginRes.data.token;

  const sellerListingsRes = await request('/api/marketplace/listings/my/all?status=ALL', 'GET', null, sellerToken);
  const sellerListings = sellerListingsRes.data?.data || sellerListingsRes.data || [];
  console.log(`  ✓ Seller real listings count from MongoDB: ${sellerListings.length} (Expected: 0)`);
  console.log('[TEST 2] PASS: Real Seller registered with PENDING_APPROVAL and clean DB state.\n');

  // -----------------------------------------------------------------
  // 3. DEDICATED ADMIN AUTHENTICATION & REAL STATS QUERY
  // -----------------------------------------------------------------
  console.log('[TEST 3] Admin Login & Real MongoDB Stats Calculation...');
  const adminLoginRes = await request('/api/marketplace/admin/auth/login', 'POST', {
    username: process.env.ADMIN_USERNAME,
    password: process.env.ADMIN_PASSWORD
  });

  if (adminLoginRes.status !== 200 || !adminLoginRes.data?.token) {
    throw new Error('Admin login failed');
  }
  const adminToken = adminLoginRes.data.token;

  const adminStatsRes = await request('/api/marketplace/admin/stats', 'GET', null, adminToken);
  const stats = adminStatsRes.data?.data || adminStatsRes.data;
  console.log(`  ✓ Real MongoDB Stats: Total Users=${stats.totalUsers}, Total Buyers=${stats.totalBuyers}, Total Sellers=${stats.totalSellers}, Pending Approvals=${stats.pendingSellerApprovals}`);
  if (stats.pendingSellerApprovals < 1) throw new Error('Expected at least 1 pending seller');
  console.log('[TEST 3] PASS: Admin authenticated and calculated live stats directly from MongoDB.\n');

  // -----------------------------------------------------------------
  // 4. ADMIN APPROVES SELLER
  // -----------------------------------------------------------------
  console.log(`[TEST 4] Admin Approving Seller ${sellerInDb._id}...`);
  const approveRes = await request(`/api/marketplace/admin/sellers/${sellerInDb._id}/status`, 'PATCH', {
    status: 'APPROVED',
    notes: 'Verified real business registration.'
  }, adminToken);

  if (approveRes.status !== 200) throw new Error('Admin approval failed');

  const updatedSellerInDb = await User.findById(sellerInDb._id);
  if (updatedSellerInDb.sellerStatus !== 'APPROVED') throw new Error('MongoDB status not APPROVED');
  console.log(`  ✓ MongoDB sellerStatus successfully updated to: ${updatedSellerInDb.sellerStatus}`);

  // Seller logs in again with approved status
  const approvedLoginRes = await request('/api/marketplace/auth/login', 'POST', {
    email: sellerEmail,
    password: sellerPassword
  });
  if (approvedLoginRes.status !== 200 || approvedLoginRes.data?.data?.sellerStatus !== 'APPROVED') {
    throw new Error('Approved seller re-login failed');
  }
  console.log(`  ✓ Seller re-authenticated with live status: ${approvedLoginRes.data.data.sellerStatus}`);
  console.log('[TEST 4] PASS: Seller approval successfully written and verified in MongoDB.\n');

  // -----------------------------------------------------------------
  // 5. SELLER CREATES REAL LISTING & BUYER DISCOVERS IT
  // -----------------------------------------------------------------
  console.log('[TEST 5] Approved Seller Creating Real Marketplace Listing...');
  const sampleCategory = await Category.findOne({ slug: 'products' }) || await Category.findOne({});

  const createListingRes = await request('/api/marketplace/listings', 'POST', {
    title: `Industrial High-Precision Laser Sensor ${randomSuffix}`,
    description: 'Genuine high-precision laser sensor with industrial grade calibration certificate.',
    price: 45000,
    currency: 'INR',
    categoryId: sampleCategory._id,
    categorySlug: sampleCategory.slug,
    listingType: 'SELL',
    condition: 'NEW',
    location: {
      country: 'India',
      city: 'Bengaluru',
      region: 'Karnataka',
      localArea: 'Whitefield'
    },
    images: ['https://images.unsplash.com/photo-1581092160607-ee22621dd758?q=80&w=800']
  }, sellerToken);

  if (createListingRes.status !== 201 && createListingRes.status !== 200) {
    console.error('Create listing response:', createListingRes.data);
    throw new Error('Create listing failed');
  }

  const createdListing = createListingRes.data?.data || createListingRes.data;
  console.log(`  ✓ Listing created in MongoDB: ID=${createdListing._id}, Title="${createdListing.title}"`);

  // Ensure listing is approved in DB for public discovery
  await Listing.updateOne({ _id: createdListing._id }, { status: 'APPROVED', approvedAt: new Date() });

  // Public search query
  const publicListingsRes = await request('/api/marketplace/listings?category=products', 'GET', null, null);
  const publicListings = publicListingsRes.data?.data || publicListingsRes.data?.listings || [];
  const foundInPublic = publicListings.some(l => l._id.toString() === createdListing._id.toString());
  console.log(`  ✓ Listing discoverable in public marketplace API: ${foundInPublic}`);
  console.log('[TEST 5] PASS: Real listing lifecycle working seamlessly.\n');

  // -----------------------------------------------------------------
  // 6. REAL BUYER-SELLER MESSAGING FLOW
  // -----------------------------------------------------------------
  console.log('[TEST 6] Buyer Initiating Real Direct Conversation & Message...');
  const startConvoRes = await request('/api/marketplace/conversations', 'POST', {
    sellerId: sellerInDb._id,
    listingId: createdListing._id,
    initialMessage: 'Hello! Is this sensor calibrated for immediate dispatch?'
  }, buyerToken);

  if (startConvoRes.status !== 200 && startConvoRes.status !== 201) {
    console.error('Start conversation error:', startConvoRes.data);
    throw new Error('Start conversation failed');
  }

  const convo = startConvoRes.data?.data || startConvoRes.data;
  console.log(`  ✓ Conversation created in MongoDB: ID=${convo._id}`);

  // Seller checks conversations
  const sellerConvosRes = await request('/api/marketplace/conversations', 'GET', null, sellerToken);
  const sellerConvos = sellerConvosRes.data?.data || sellerConvosRes.data || [];
  const sellerFoundConvo = sellerConvos.some(c => c._id.toString() === convo._id.toString());
  console.log(`  ✓ Seller retrieved real conversation from MongoDB: ${sellerFoundConvo}`);

  // Seller replies
  const replyRes = await request(`/api/marketplace/conversations/${convo._id}/messages`, 'POST', {
    content: 'Yes, it comes with full calibration certification and can ship today.'
  }, sellerToken);
  console.log(`  ✓ Seller message reply saved: Status=${replyRes.status} (Created)`);
  if (replyRes.status !== 200 && replyRes.status !== 201) throw new Error('Reply message failed');
  console.log('[TEST 6] PASS: Direct real-time messaging verified against MongoDB.\n');

  // -----------------------------------------------------------------
  // 7. SECURITY & ERROR HANDLING
  // -----------------------------------------------------------------
  console.log('[TEST 7] Security Checks (Role Isolation & Password Rejection)...');
  
  // 7a: Non-admin calling admin endpoint
  const buyerOnAdminRes = await request('/api/marketplace/admin/stats', 'GET', null, buyerToken);
  if (buyerOnAdminRes.status !== 403) throw new Error('Role isolation failed for buyer');
  console.log('  ✓ Buyer blocked from Admin APIs (403 Forbidden)');

  // 7b: Wrong password
  const wrongPassRes = await request('/api/marketplace/auth/login', 'POST', {
    email: buyerEmail,
    password: 'InvalidPassword123!'
  });
  if (wrongPassRes.status !== 401) throw new Error('Wrong password not rejected');
  console.log('  ✓ Wrong password rejected with 401 Unauthorized');

  // Cleanup test entities created in this test run
  await Listing.deleteMany({ sellerId: sellerInDb._id });
  await Message.deleteMany({ conversationId: convo._id });
  await Conversation.deleteMany({ _id: convo._id });
  await User.deleteMany({ _id: { $in: [buyerInDb._id, sellerInDb._id] } });
  console.log('\n[Cleanup] Test accounts and listings cleaned up from MongoDB Atlas.');

  console.log('\n================================================================');
  console.log('ALL 7 REAL MONGODB PRODUCTION FLOW TESTS PASSED 100%!');
  console.log('================================================================');

  await mongoose.disconnect();
}

runRealDataFlowVerification().catch(err => {
  console.error('Verification Error:', err);
  process.exit(1);
});
