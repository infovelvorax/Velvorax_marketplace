const API_BASE = 'http://localhost:5000/api/marketplace';

const runTests = async () => {
  console.log('====================================================');
  console.log('🧪 RUNNING VERIFICATION SUITE: KYC + REPORT RESOLUTION');
  console.log('====================================================\n');

  let passed = 0;
  let failed = 0;

  const assert = (condition, title, details = '') => {
    if (condition) {
      console.log(`✅ PASS: ${title}`);
      passed++;
    } else {
      console.error(`❌ FAIL: ${title} - ${details}`);
      failed++;
    }
  };

  const randSuffix = Date.now() + Math.floor(Math.random() * 1000);

  try {
    // ----------------------------------------------------
    // TEST 1: Buyer registration without Aadhaar/PAN
    // ----------------------------------------------------
    const buyerEmail = `buyer_${randSuffix}@test.com`;
    const buyerRes = await fetch(`${API_BASE}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Test Buyer',
        email: buyerEmail,
        password: 'Password123!',
        role: 'BUYER',
        phone: '+91 9876543210',
        location: { country: 'India', city: 'Bengaluru', state: 'Karnataka' }
      })
    });
    const buyerData = await buyerRes.json();
    assert(buyerRes.status === 201 && buyerData.success, 'Buyer registered successfully without Aadhaar/PAN');
    assert(buyerData.data.role === 'BUYER', 'Buyer role confirmed as BUYER');
    assert(buyerData.data.verificationStatus === 'UNVERIFIED', 'Buyer verificationStatus is UNVERIFIED');
    const buyerToken = buyerData.token;

    // ----------------------------------------------------
    // TEST 2: Seller registration missing Aadhaar
    // ----------------------------------------------------
    const sellerEmail1 = `seller_no_aadhaar_${randSuffix}@test.com`;
    const noAadhaarRes = await fetch(`${API_BASE}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Test Seller No Aadhaar',
        email: sellerEmail1,
        password: 'Password123!',
        role: 'SELLER',
        sellerCategory: 'properties',
        panNumber: 'ABCDE1234F',
        companyName: 'Test Realty'
      })
    });
    const noAadhaarData = await noAadhaarRes.json();
    assert(noAadhaarRes.status === 400 && noAadhaarData.code === 'AADHAAR_REQUIRED', 'Seller registration without Aadhaar is rejected with AADHAAR_REQUIRED');

    // ----------------------------------------------------
    // TEST 3: Seller registration invalid Aadhaar (e.g. 11 digits)
    // ----------------------------------------------------
    const invalidAadhaarRes = await fetch(`${API_BASE}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Test Seller Bad Aadhaar',
        email: sellerEmail1,
        password: 'Password123!',
        role: 'SELLER',
        sellerCategory: 'properties',
        aadhaarNumber: '12345678901', // 11 digits
        panNumber: 'ABCDE1234F',
        companyName: 'Test Realty'
      })
    });
    const invalidAadhaarData = await invalidAadhaarRes.json();
    assert(invalidAadhaarRes.status === 400 && invalidAadhaarData.code === 'INVALID_AADHAAR', 'Seller registration with 11-digit Aadhaar rejected with INVALID_AADHAAR');

    // ----------------------------------------------------
    // TEST 4: Seller registration missing PAN
    // ----------------------------------------------------
    const noPanRes = await fetch(`${API_BASE}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Test Seller No PAN',
        email: sellerEmail1,
        password: 'Password123!',
        role: 'SELLER',
        sellerCategory: 'properties',
        aadhaarNumber: '123456789012',
        companyName: 'Test Realty'
      })
    });
    const noPanData = await noPanRes.json();
    assert(noPanRes.status === 400 && noPanData.code === 'PAN_REQUIRED', 'Seller registration without PAN rejected with PAN_REQUIRED');

    // ----------------------------------------------------
    // TEST 5: Seller registration invalid PAN format
    // ----------------------------------------------------
    const invalidPanRes = await fetch(`${API_BASE}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Test Seller Bad PAN',
        email: sellerEmail1,
        password: 'Password123!',
        role: 'SELLER',
        sellerCategory: 'properties',
        aadhaarNumber: '123456789012',
        panNumber: '12345ABCDE', // Invalid format
        companyName: 'Test Realty'
      })
    });
    const invalidPanData = await invalidPanRes.json();
    assert(invalidPanRes.status === 400 && invalidPanData.code === 'INVALID_PAN', 'Seller registration with invalid PAN format rejected with INVALID_PAN');

    // ----------------------------------------------------
    // TEST 6: Valid Seller registration with Aadhaar + lowercase PAN
    // ----------------------------------------------------
    const validSellerEmail = `seller_valid_${randSuffix}@test.com`;
    const validSellerRes = await fetch(`${API_BASE}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Test Prime Seller',
        email: validSellerEmail,
        password: 'Password123!',
        role: 'SELLER',
        sellerCategory: 'properties',
        companyName: 'Prime Properties India',
        aadhaarNumber: '987654321098',
        panNumber: 'abcde1234f', // lowercase to test normalization
        phone: '+91 9988776655',
        location: { country: 'India', city: 'Bengaluru', state: 'Karnataka' }
      })
    });
    const validSellerData = await validSellerRes.json();
    assert(validSellerRes.status === 201 && validSellerData.success, 'Seller registered successfully with valid KYC');
    assert(validSellerData.data.sellerStatus === 'PENDING_APPROVAL', 'Seller status starts as PENDING_APPROVAL');
    assert(validSellerData.data.verificationStatus === 'PENDING', 'Seller verificationStatus is PENDING');
    assert(!validSellerData.data.aadhaarNumber && !validSellerData.data.panNumber, 'Raw Aadhaar and PAN are NOT returned in registration payload');
    const sellerToken = validSellerData.token;
    const sellerId = validSellerData.data.id;

    // ----------------------------------------------------
    // TEST 7: Pending seller attempts to publish listing -> must be blocked with 403
    // ----------------------------------------------------
    const publishAttemptRes = await fetch(`${API_BASE}/listings`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${sellerToken}`
      },
      body: JSON.stringify({
        title: 'Luxury 3BHK Villa in Indiranagar',
        description: 'Prime luxury villa with modern amenities.',
        categorySlug: 'properties',
        price: 25000000,
        currency: 'INR',
        location: { country: 'India', city: 'Bengaluru' }
      })
    });
    const publishAttemptData = await publishAttemptRes.json();
    assert(publishAttemptRes.status === 403 && publishAttemptData.code === 'SELLER_NOT_APPROVED', 'Pending seller cannot publish listing (403 SELLER_NOT_APPROVED)');

    // ----------------------------------------------------
    // TEST 8: Admin Authentication & Verification of Masked KYC
    // ----------------------------------------------------
    // Admin login using secret clearance
    const adminLoginRes = await fetch(`${API_BASE}/admin/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        username: 'admin',
        password: 'AdminPassword123!' // or default admin credentials
      })
    });
    let adminToken = '';
    if (adminLoginRes.status === 200) {
      const adminLoginData = await adminLoginRes.json();
      adminToken = adminLoginData.token;
    } else {
      // 2FA login fallback
      const twoFaInitRes = await fetch(`${API_BASE}/admin/auth/login-init`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: 'admin', password: 'AdminPassword123!' })
      });
      const twoFaInitData = await twoFaInitRes.json();
      const verify2faRes = await fetch(`${API_BASE}/admin/auth/verify-2fa`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tempSessionId: twoFaInitData.tempSessionId, code: '123456' })
      });
      const verify2faData = await verify2faRes.json();
      adminToken = verify2faData.token;
    }
    assert(Boolean(adminToken), 'Admin authenticated successfully');

    // Admin fetches sellers list and verifies masked KYC values
    const adminSellersRes = await fetch(`${API_BASE}/admin/sellers?q=${validSellerEmail}`, {
      headers: { 'Authorization': `Bearer ${adminToken}` }
    });
    const adminSellersData = await adminSellersRes.json();
    const fetchedSeller = (adminSellersData.data || adminSellersData.sellers || [])[0];
    assert(Boolean(fetchedSeller), 'Admin successfully retrieved registered seller in seller governance queue');
    assert(fetchedSeller?.verification?.aadhaarMasked === 'XXXX XXXX 1098', `Aadhaar masked correctly (got: ${fetchedSeller?.verification?.aadhaarMasked})`);
    assert(fetchedSeller?.verification?.panMasked === 'XXXXX1234F', `PAN masked correctly and normalized (got: ${fetchedSeller?.verification?.panMasked})`);

    // ----------------------------------------------------
    // TEST 9: Admin Approves Seller
    // ----------------------------------------------------
    const approveSellerRes = await fetch(`${API_BASE}/admin/sellers/${sellerId}/moderate`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${adminToken}`
      },
      body: JSON.stringify({ action: 'APPROVE' })
    });
    const approveSellerData = await approveSellerRes.json();
    assert(approveSellerRes.status === 200 && approveSellerData.success, 'Admin approved seller successfully');
    assert(approveSellerData.data.sellerStatus === 'APPROVED', 'Seller sellerStatus is now APPROVED');

    // Re-fetch seller profile with seller token
    const meRes = await fetch(`${API_BASE}/auth/me`, {
      headers: { 'Authorization': `Bearer ${sellerToken}` }
    });
    const meData = await meRes.json();
    assert(meData.data.sellerStatus === 'APPROVED', 'Seller profile reflects APPROVED status');

    // ----------------------------------------------------
    // TEST 10: Approved Seller Publishes Listing
    // ----------------------------------------------------
    const publishRes = await fetch(`${API_BASE}/listings`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${sellerToken}`
      },
      body: JSON.stringify({
        title: 'Approved Villa in Indiranagar',
        description: 'Spectacular villa with garden and pool.',
        categorySlug: 'properties',
        price: 25000000,
        currency: 'INR',
        location: { country: 'India', city: 'Bengaluru' }
      })
    });
    const publishData = await publishRes.json();
    assert(publishRes.status === 201 && publishData.success, 'Approved seller successfully submitted listing for review');
    const createdListingId = publishData.data._id;

    // Admin approves the listing to make it public
    const approveListingRes = await fetch(`${API_BASE}/admin/listings/${createdListingId}/moderate`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${adminToken}`
      },
      body: JSON.stringify({ action: 'APPROVE' })
    });
    const approveListingData = await approveListingRes.json();
    assert(approveListingRes.status === 200 && approveListingData.data.status === 'APPROVED', 'Admin approved listing for public marketplace');

    // ----------------------------------------------------
    // TEST 11: Buyer Reports the Listing
    // ----------------------------------------------------
    const submitReportRes = await fetch(`${API_BASE}/reports`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${buyerToken}`
      },
      body: JSON.stringify({
        targetType: 'LISTING',
        targetId: createdListingId,
        reason: 'MISLEADING',
        description: 'Price is listed incorrectly compared to property area.'
      })
    });
    const submitReportData = await submitReportRes.json();
    assert(submitReportRes.status === 201 && submitReportData.success, 'Buyer submitted incident report successfully');
    const reportId = submitReportData.data._id;

    // ----------------------------------------------------
    // TEST 12: Admin views Reports Queue with Enriched Listing Details
    // ----------------------------------------------------
    const getReportsRes = await fetch(`${API_BASE}/reports`, {
      headers: { 'Authorization': `Bearer ${adminToken}` }
    });
    const getReportsData = await getReportsRes.json();
    const reportsList = getReportsData.data || getReportsData.reports || [];
    const targetReport = reportsList.find(r => r._id === reportId);
    assert(Boolean(targetReport), 'Report appears in Admin Reports queue');
    assert(targetReport?.targetItem?.title === 'Approved Villa in Indiranagar', 'Report includes populated target item details');

    // ----------------------------------------------------
    // TEST 13: Unauthorized user (Buyer) cannot resolve report
    // ----------------------------------------------------
    const unauthResolveRes = await fetch(`${API_BASE}/reports/${reportId}/resolve`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${buyerToken}`
      },
      body: JSON.stringify({ action: 'DISMISS' })
    });
    assert(unauthResolveRes.status === 403, 'Unauthorized buyer rejected with 403 when attempting report resolution');

    // ----------------------------------------------------
    // TEST 14: Admin executes [Dismiss Flag] on a test report
    // ----------------------------------------------------
    // Create another report to test Dismiss Flag
    const dismissReportRes = await fetch(`${API_BASE}/reports`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${buyerToken}`
      },
      body: JSON.stringify({
        targetType: 'LISTING',
        targetId: createdListingId,
        reason: 'SPAM',
        description: 'Test flag to verify dismissal.'
      })
    });
    const dismissReportData = await dismissReportRes.json();
    const dismissReportId = dismissReportData.data._id;

    const adminDismissRes = await fetch(`${API_BASE}/reports/${dismissReportId}/resolve`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${adminToken}`
      },
      body: JSON.stringify({ action: 'DISMISS', resolutionNotes: 'Flag investigated and dismissed as invalid' })
    });
    const adminDismissData = await adminDismissRes.json();
    assert(adminDismissRes.status === 200 && adminDismissData.success, 'Admin dismissed flag successfully');
    assert(adminDismissData.data.status === 'DISMISSED', 'Report status updated to DISMISSED');

    // Verify listing is still active after dismiss
    const checkListingAfterDismiss = await fetch(`${API_BASE}/listings/${createdListingId}`);
    const checkListingAfterDismissData = await checkListingAfterDismiss.json();
    assert(checkListingAfterDismissData.data.status === 'APPROVED', 'Listing remains active after flag dismissal');

    // ----------------------------------------------------
    // TEST 15: Admin executes [Remove Item] on the primary report
    // ----------------------------------------------------
    const adminRemoveRes = await fetch(`${API_BASE}/reports/${reportId}/resolve`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${adminToken}`
      },
      body: JSON.stringify({
        action: 'REMOVE_ITEM',
        resolutionNotes: 'Item removed due to verified pricing violation'
      })
    });
    const adminRemoveData = await adminRemoveRes.json();
    assert(adminRemoveRes.status === 200 && adminRemoveData.success, 'Admin executed Remove Item successfully');
    assert(adminRemoveData.data.status === 'RESOLVED', 'Report status updated to RESOLVED');
    assert(adminRemoveData.data.action === 'REMOVE_ITEM', 'Report action recorded as REMOVE_ITEM');

    // ----------------------------------------------------
    // TEST 16: Verify Listing is now REMOVED and excluded from public marketplace
    // ----------------------------------------------------
    const publicSearchRes = await fetch(`${API_BASE}/listings?q=Indiranagar`);
    const publicSearchData = await publicSearchRes.json();
    const publicList = publicSearchData.data || publicSearchData.listings || [];
    const isListingPublic = publicList.some(l => l._id === createdListingId);
    assert(!isListingPublic, 'Moderated listing is completely excluded from public marketplace results');

    // Direct access by unauthenticated user returns 403
    const directListingRes = await fetch(`${API_BASE}/listings/${createdListingId}`);
    assert(directListingRes.status === 403, 'Direct access to removed listing by public user returns 403');

    // ----------------------------------------------------
    // TEST 17: Verify Seller received Notification for Removal
    // ----------------------------------------------------
    const sellerNotifRes = await fetch(`${API_BASE}/notifications`, {
      headers: { 'Authorization': `Bearer ${sellerToken}` }
    });
    const sellerNotifData = await sellerNotifRes.json();
    const notifs = sellerNotifData.data || sellerNotifData.notifications || [];
    const removalNotif = notifs.find(n => n.title.includes('Listing removed') || n.message.includes('removed after an administrator reviewed'));
    assert(Boolean(removalNotif), 'Seller received real notification regarding listing removal');

    // ----------------------------------------------------
    // TEST 18: Invalid Report ID returns structured error
    // ----------------------------------------------------
    const fakeReportRes = await fetch(`${API_BASE}/reports/660000000000000000000000/resolve`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${adminToken}`
      },
      body: JSON.stringify({ action: 'TAKE_ACTION' })
    });
    const fakeReportData = await fakeReportRes.json();
    assert(fakeReportRes.status === 404 && fakeReportData.code === 'REPORT_NOT_FOUND', 'Invalid report ID returns 404 REPORT_NOT_FOUND');

  } catch (err) {
    console.error('Test execution error:', err);
    failed++;
  }

  console.log('\n====================================================');
  console.log(`🏁 VERIFICATION SUMMARY: ${passed} PASSED, ${failed} FAILED`);
  console.log('====================================================');
  process.exit(failed > 0 ? 1 : 0);
};

runTests();
