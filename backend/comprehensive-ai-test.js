import http from 'http';

const postJson = (path, body, headers = {}) => {
  return new Promise((resolve, reject) => {
    const dataString = JSON.stringify(body);
    const options = {
      hostname: 'localhost',
      port: 5000,
      path,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(dataString),
        ...headers
      }
    };
    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => { data += chunk; });
      res.on('end', () => {
        try {
          resolve({ status: res.statusCode, data: JSON.parse(data) });
        } catch {
          resolve({ status: res.statusCode, raw: data });
        }
      });
    });
    req.on('error', reject);
    req.write(dataString);
    req.end();
  });
};

const getJson = (path, headers = {}) => {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'localhost',
      port: 5000,
      path,
      method: 'GET',
      headers: { 'Content-Type': 'application/json', ...headers }
    };
    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => { data += chunk; });
      res.on('end', () => {
        try {
          resolve({ status: res.statusCode, data: JSON.parse(data) });
        } catch {
          resolve({ status: res.statusCode, raw: data });
        }
      });
    });
    req.on('error', reject);
    req.end();
  });
};

async function runComprehensiveTests() {
  console.log('================================================================');
  console.log('VELVORAX REAL AI SYSTEM - 10 COMPREHENSIVE TEST SUITE');
  console.log('================================================================\n');

  let passed = 0;
  let total = 10;

  // 1. Buyer AI: Real MongoDB approved listing search (iPhone)
  try {
    const res = await postJson('/api/marketplace/ai/chat', { message: 'Find iPhone in products' });
    const hasCards = res.data?.data?.listingCards?.length > 0;
    const card = res.data?.data?.listingCards?.[0];
    if (res.status === 200 && hasCards && card?.title?.toLowerCase().includes('iphone')) {
      console.log(`✅ Test 1 PASSED: Buyer AI found real iPhone: "${card.title}" (₹${card.price?.toLocaleString()})`);
      passed++;
    } else {
      console.error('❌ Test 1 FAILED:', res);
    }
  } catch (e) { console.error('❌ Test 1 Error:', e.message); }

  // 2. Buyer AI: Real MongoDB approved vehicle search (Hyundai Creta)
  try {
    const res = await postJson('/api/marketplace/ai/chat', { message: 'Show cars or Creta in vehicles' });
    const hasCards = res.data?.data?.listingCards?.length > 0;
    const card = res.data?.data?.listingCards?.[0];
    if (res.status === 200 && hasCards && card?.title?.toLowerCase().includes('creta')) {
      console.log(`✅ Test 2 PASSED: Buyer AI found real Car: "${card.title}" in ${card.location?.city}`);
      passed++;
    } else {
      console.error('❌ Test 2 FAILED:', res);
    }
  } catch (e) { console.error('❌ Test 2 Error:', e.message); }

  // 3. Buyer AI: Real MongoDB approved property search (Penthouse in Indiranagar)
  try {
    const res = await postJson('/api/marketplace/ai/chat', { message: 'Find 3BHK penthouse in Indiranagar' });
    const hasCards = res.data?.data?.listingCards?.length > 0;
    const card = res.data?.data?.listingCards?.[0];
    if (res.status === 200 && hasCards && card?.title?.toLowerCase().includes('penthouse')) {
      console.log(`✅ Test 3 PASSED: Buyer AI found real Property: "${card.title}"`);
      passed++;
    } else {
      console.error('❌ Test 3 FAILED:', res);
    }
  } catch (e) { console.error('❌ Test 3 Error:', e.message); }

  // 4. Buyer AI: Zero Hallucination test on nonexistent item
  try {
    const res = await postJson('/api/marketplace/ai/chat', { message: 'Find private jet for 100 rupees' });
    const cards = res.data?.data?.listingCards || [];
    const msg = res.data?.data?.message || '';
    if (res.status === 200 && cards.length === 0 && (msg.includes("couldn't find") || msg.includes('not find'))) {
      console.log('✅ Test 4 PASSED: Buyer AI Zero-Hallucination verified (Zero fake listings created)');
      passed++;
    } else {
      console.error('❌ Test 4 FAILED:', res);
    }
  } catch (e) { console.error('❌ Test 4 Error:', e.message); }

  // 5. Buyer AI: Listing Detail Page Context Q&A
  try {
    const res = await postJson('/api/marketplace/ai/chat', {
      message: 'What questions should I ask the seller?',
      currentListingId: '6a9a706459655f1181ab6925'
    });
    const msg = res.data?.data?.message || '';
    if (res.status === 200 && msg.includes('Hyundai Creta') && msg.includes('seller')) {
      console.log('✅ Test 5 PASSED: Buyer AI contextual listing Q&A verified');
      passed++;
    } else {
      console.error('❌ Test 5 FAILED:', res);
    }
  } catch (e) { console.error('❌ Test 5 Error:', e.message); }

  // 6. Security: Admin AI endpoint blocks unauthenticated users (401)
  try {
    const res = await postJson('/api/marketplace/admin/ai/chat', { message: 'Get stats' });
    if (res.status === 401) {
      console.log('✅ Test 6 PASSED: Admin AI blocks unauthenticated requests (401)');
      passed++;
    } else {
      console.error('❌ Test 6 FAILED:', res);
    }
  } catch (e) { console.error('❌ Test 6 Error:', e.message); }

  // 7. Security: Admin AI endpoint blocks buyers/sellers (403)
  try {
    // Generate a buyer token
    const jwt = (await import('jsonwebtoken')).default;
    const dotenv = (await import('dotenv')).default;
    dotenv.config();
    const fakeBuyerToken = jwt.sign({ id: '6a9a49d95266c29fd3d92b30', role: 'BUYER' }, process.env.JWT_SECRET);
    
    const res = await postJson(
      '/api/marketplace/admin/ai/chat',
      { message: 'Get stats' },
      { Authorization: `Bearer ${fakeBuyerToken}` }
    );
    if (res.status === 403) {
      console.log('✅ Test 7 PASSED: Admin AI blocks non-admin roles with 403 Forbidden');
      passed++;
    } else {
      console.error('❌ Test 7 FAILED:', res);
    }
  } catch (e) { console.error('❌ Test 7 Error:', e.message); }

  // 8. Admin AI: Real live MongoDB seller approval metrics
  let adminToken = null;
  try {
    const loginRes = await postJson('/api/marketplace/admin/auth/login', {
      username: 'velvorax_admin',
      password: 'vmprv_2022'
    });
    adminToken = loginRes.data?.token;

    if (loginRes.status === 200 && adminToken) {
      const res = await postJson(
        '/api/marketplace/admin/ai/chat',
        { message: 'How many sellers are waiting for approval?' },
        { Authorization: `Bearer ${adminToken}` }
      );
      const msg = res.data?.data?.message || '';
      const statsCards = res.data?.data?.statsCards || [];
      if (res.status === 200 && statsCards.length > 0 && msg.includes('Seller')) {
        console.log(`✅ Test 8 PASSED: Admin AI live MongoDB seller stats: ${statsCards.map(s => `${s.label}: ${s.value}`).join(', ')}`);
        passed++;
      } else {
        console.error('❌ Test 8 FAILED:', res);
      }
    }
  } catch (e) { console.error('❌ Test 8 Error:', e.message); }

  // 9. Admin AI: Real live MongoDB marketplace overview & moderation queue
  try {
    if (adminToken) {
      const res = await postJson(
        '/api/marketplace/admin/ai/chat',
        { message: 'Show me listing moderation queue and order activity' },
        { Authorization: `Bearer ${adminToken}` }
      );
      const actionLinks = res.data?.data?.actionLinks || [];
      if (res.status === 200 && actionLinks.length > 0) {
        console.log(`✅ Test 9 PASSED: Admin AI moderation queue & action shortcuts verified: ${actionLinks.map(l => l.label).join(', ')}`);
        passed++;
      } else {
        console.error('❌ Test 9 FAILED:', res);
      }
    }
  } catch (e) { console.error('❌ Test 9 Error:', e.message); }

  // 10. AI Conversation History & Clearing
  try {
    const clearRes = await postJson('/api/marketplace/ai/clear', { sessionId: 'comp-test-session' });
    if (clearRes.status === 200 && clearRes.data?.success) {
      console.log('✅ Test 10 PASSED: AI Conversation clearing verified');
      passed++;
    } else {
      console.error('❌ Test 10 FAILED:', clearRes);
    }
  } catch (e) { console.error('❌ Test 10 Error:', e.message); }

  console.log('\n================================================================');
  console.log(`COMPREHENSIVE TEST SUITE RESULT: ${passed} / ${total} TESTS PASSED (${Math.round((passed / total) * 100)}%)`);
  console.log('================================================================\n');

  process.exit(passed === total ? 0 : 1);
}

runComprehensiveTests().catch((e) => {
  console.error('Fatal error during comprehensive test run:', e);
  process.exit(1);
});
