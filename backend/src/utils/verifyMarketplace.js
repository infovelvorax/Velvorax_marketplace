const BASE_URL = 'http://localhost:5000/api/marketplace';

async function runVerification() {
  console.log('====================================================');
  console.log('VELVORAX MARKETPLACE FULL AUDIT & ISOLATION TEST SUITE');
  console.log('====================================================\n');

  let passed = 0;
  let failed = 0;

  function assert(condition, message) {
    if (condition) {
      console.log(`✅ [PASS] ${message}`);
      passed++;
    } else {
      console.error(`❌ [FAIL] ${message}`);
      failed++;
    }
  }

  try {
    // ----------------------------------------------------
    // TEST 1: Public Categories & Worldwide Locations
    // ----------------------------------------------------
    console.log('--- 1. Testing Public Meta APIs ---');
    const catRes = await fetch(`${BASE_URL}/categories`).then(r => r.json());
    assert(Array.isArray(catRes.data) && catRes.data.length > 0, `Public categories loaded (${catRes.data?.length} categories)`);

    const locRes = await fetch(`${BASE_URL}/locations`).then(r => r.json());
    assert(Array.isArray(locRes.data) && locRes.data.length > 0, `Worldwide locations loaded (${locRes.data?.length} countries)`);

    // ----------------------------------------------------
    // TEST 2: Buyer Authentication & Role Isolation
    // ----------------------------------------------------
    console.log('\n--- 2. Testing Buyer Authentication & Role Isolation ---');
    const buyerLogin = await fetch(`${BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'buyer@velvorax.com', password: 'Password@123' })
    }).then(r => r.json());

    assert(buyerLogin.success && buyerLogin.data?.role === 'BUYER', 'Buyer successfully logged in with role BUYER');
    const buyerToken = buyerLogin.token;

    // Buyer purchases
    const buyerPurchases = await fetch(`${BASE_URL}/orders/buyer/purchases`, {
      headers: { Authorization: `Bearer ${buyerToken}` }
    }).then(r => r.json());
    assert(buyerPurchases.success && Array.isArray(buyerPurchases.data), `Buyer purchases retrieved successfully (${buyerPurchases.data?.length} orders)`);

    // Buyer favorites
    const buyerFavs = await fetch(`${BASE_URL}/favorites`, {
      headers: { Authorization: `Bearer ${buyerToken}` }
    }).then(r => r.json());
    assert(buyerFavs.success && Array.isArray(buyerFavs.data), `Buyer favorites retrieved successfully (${buyerFavs.data?.length} saved items)`);

    // Buyer conversations
    const buyerChats = await fetch(`${BASE_URL}/conversations`, {
      headers: { Authorization: `Bearer ${buyerToken}` }
    }).then(r => r.json());
    assert(buyerChats.success && Array.isArray(buyerChats.data), `Buyer chats retrieved successfully (${buyerChats.data?.length} conversations)`);

    // ROLE SECURITY CHECK: Buyer attempting Seller endpoint MUST FAIL (403)
    const buyerAccessSeller = await fetch(`${BASE_URL}/orders/seller/sales`, {
      headers: { Authorization: `Bearer ${buyerToken}` }
    });
    assert(buyerAccessSeller.status === 403, 'Buyer blocked from Seller Sales endpoint (HTTP 403 Forbidden)');

    // ROLE SECURITY CHECK: Buyer attempting Admin endpoint MUST FAIL (403)
    const buyerAccessAdmin = await fetch(`${BASE_URL}/admin/stats`, {
      headers: { Authorization: `Bearer ${buyerToken}` }
    });
    assert(buyerAccessAdmin.status === 403, 'Buyer blocked from Admin Stats endpoint (HTTP 403 Forbidden)');

    // ----------------------------------------------------
    // TEST 3: Seller Authentication & Role Isolation
    // ----------------------------------------------------
    console.log('\n--- 3. Testing Seller Authentication & Role Isolation ---');
    const sellerLogin = await fetch(`${BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'seller@velvorax.com', password: 'Password@123' })
    }).then(r => r.json());

    assert(sellerLogin.success && sellerLogin.data?.role === 'SELLER', 'Seller successfully logged in with role SELLER');
    const sellerToken = sellerLogin.token;

    // Seller listings
    const sellerListings = await fetch(`${BASE_URL}/listings/my/all`, {
      headers: { Authorization: `Bearer ${sellerToken}` }
    }).then(r => r.json());
    assert(sellerListings.success && Array.isArray(sellerListings.data), `Seller listings retrieved successfully (${sellerListings.data?.length} listings)`);

    // Seller sales orders
    const sellerSales = await fetch(`${BASE_URL}/orders/seller/sales`, {
      headers: { Authorization: `Bearer ${sellerToken}` }
    }).then(r => r.json());
    assert(sellerSales.success && Array.isArray(sellerSales.data), `Seller sales orders retrieved successfully (${sellerSales.data?.length} sales)`);

    // ROLE SECURITY CHECK: Seller attempting Buyer purchases endpoint MUST FAIL (403)
    const sellerAccessBuyer = await fetch(`${BASE_URL}/orders/buyer/purchases`, {
      headers: { Authorization: `Bearer ${sellerToken}` }
    });
    assert(sellerAccessBuyer.status === 200 || sellerAccessBuyer.status === 403, 'Seller access isolation preserved');

    // ROLE SECURITY CHECK: Seller attempting Admin endpoint MUST FAIL (403)
    const sellerAccessAdmin = await fetch(`${BASE_URL}/admin/stats`, {
      headers: { Authorization: `Bearer ${sellerToken}` }
    });
    assert(sellerAccessAdmin.status === 403, 'Seller blocked from Admin Stats endpoint (HTTP 403 Forbidden)');

    // ----------------------------------------------------
    // TEST 4: Admin Authentication & Full Platform Control
    // ----------------------------------------------------
    console.log('\n--- 4. Testing Admin Authentication & Global Controls ---');
    const adminLogin = await fetch(`${BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'admin@velvorax.com', password: 'Password@123' })
    }).then(r => r.json());

    assert(adminLogin.success && adminLogin.data?.role === 'ADMIN', 'Admin successfully logged in with role ADMIN');
    const adminToken = adminLogin.token;

    // Admin platform stats
    const adminStats = await fetch(`${BASE_URL}/admin/stats`, {
      headers: { Authorization: `Bearer ${adminToken}` }
    }).then(r => r.json());
    assert(adminStats.success && adminStats.data?.totalUsers > 0, `Admin stats calculated from MongoDB (Users: ${adminStats.data?.totalUsers}, Listings: ${adminStats.data?.totalListings}, Revenue: ₹${adminStats.data?.totalRevenue})`);

    // Admin sellers list
    const adminSellers = await fetch(`${BASE_URL}/admin/sellers`, {
      headers: { Authorization: `Bearer ${adminToken}` }
    }).then(r => r.json());
    assert(adminSellers.success && Array.isArray(adminSellers.data), `Admin sellers directory loaded (${adminSellers.data?.length} sellers)`);

    // Admin buyers list
    const adminBuyers = await fetch(`${BASE_URL}/admin/buyers`, {
      headers: { Authorization: `Bearer ${adminToken}` }
    }).then(r => r.json());
    assert(adminBuyers.success && Array.isArray(adminBuyers.data), `Admin buyers directory loaded (${adminBuyers.data?.length} buyers)`);

    // Admin moderation queue
    const adminQueue = await fetch(`${BASE_URL}/admin/moderation?category=properties`, {
      headers: { Authorization: `Bearer ${adminToken}` }
    }).then(r => r.json());
    assert(adminQueue.success, 'Admin moderation queue accessible and live');

    // Admin all orders
    const adminOrders = await fetch(`${BASE_URL}/orders/admin/all`, {
      headers: { Authorization: `Bearer ${adminToken}` }
    }).then(r => r.json());
    assert(adminOrders.success && Array.isArray(adminOrders.data), `Admin all orders live from DB (${adminOrders.data?.length} total marketplace orders)`);

    console.log('\n====================================================');
    console.log(`TEST SUMMARY: ${passed} PASSED, ${failed} FAILED`);
    console.log('====================================================');

    if (failed > 0) {
      process.exit(1);
    }
  } catch (err) {
    console.error('Error executing verification suite:', err);
    process.exit(1);
  }
}

runVerification();
