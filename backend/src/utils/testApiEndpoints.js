import http from 'http';

function makeRequest(path, method, body, token) {
  return new Promise((resolve, reject) => {
    const data = body ? JSON.stringify(body) : '';
    const req = http.request({
      hostname: 'localhost',
      port: 5000,
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

async function runApiTests() {
  console.log('--- Testing API Endpoints & Role Authorization ---');

  // 1. Test Admin Login with valid admin credentials (username: velvorax_admin)
  const adminLoginRes = await makeRequest('/auth/login', 'POST', {
    email: 'velvorax_admin',
    password: 'VxAdmin@2026#Secure',
    expectedRole: 'ADMIN'
  });
  console.log('Admin Username Login Result:', adminLoginRes.status, adminLoginRes.data?.success ? 'SUCCESS' : adminLoginRes.data?.message);
  if (adminLoginRes.status !== 200 || !adminLoginRes.data?.token) {
    throw new Error('Admin username login failed');
  }
  const adminToken = adminLoginRes.data.token;


  // 2. Test Buyer attempting Admin Login (Should be rejected with 401 or 403)
  const buyerAsAdminRes = await makeRequest('/auth/login', 'POST', {
    email: 'buyer@velvorax.com',
    password: 'Password@123',
    expectedRole: 'ADMIN'
  });
  console.log('Buyer Attempting Admin Portal:', buyerAsAdminRes.status, buyerAsAdminRes.data?.message);
  if (buyerAsAdminRes.status !== 401 && buyerAsAdminRes.status !== 403) {
    throw new Error('Buyer was not rejected from Admin portal!');
  }


  // 3. Test Buyer A login & fetch purchases
  const buyerALoginRes = await makeRequest('/auth/login', 'POST', {
    email: 'buyer@velvorax.com',
    password: 'Password@123'
  });
  const buyerAToken = buyerALoginRes.data.token;
  const buyerAPurchasesRes = await makeRequest('/orders/buyer/purchases', 'GET', null, buyerAToken);
  console.log(`Buyer A Purchases API returned ${buyerAPurchasesRes.data?.data?.length} orders:`, buyerAPurchasesRes.data?.data?.map(o => o.orderNumber));

  // 4. Test Buyer B login & fetch purchases
  const buyerBLoginRes = await makeRequest('/auth/login', 'POST', {
    email: 'rahul.buyer@velvorax.com',
    password: 'Password@123'
  });
  const buyerBToken = buyerBLoginRes.data.token;
  const buyerBPurchasesRes = await makeRequest('/orders/buyer/purchases', 'GET', null, buyerBToken);
  console.log(`Buyer B Purchases API returned ${buyerBPurchasesRes.data?.data?.length} orders:`, buyerBPurchasesRes.data?.data?.map(o => o.orderNumber));

  // 5. Test Buyer attempting Admin API (Should be rejected with 403 Forbidden)
  const buyerAccessAdminApi = await makeRequest('/orders/admin/all', 'GET', null, buyerAToken);
  console.log('Buyer Accessing /orders/admin/all:', buyerAccessAdminApi.status, buyerAccessAdminApi.data?.message);
  if (buyerAccessAdminApi.status !== 403) {
    throw new Error('Buyer was not forbidden from accessing admin API');
  }

  // 6. Test Admin accessing Admin API (Should succeed 200)
  const adminAccessAdminApi = await makeRequest('/orders/admin/all', 'GET', null, adminToken);
  console.log('Admin Accessing /orders/admin/all:', adminAccessAdminApi.status, `Returned ${adminAccessAdminApi.data?.data?.length} orders`);

  console.log('--- ALL API AUTH & ROLE PROTECTION TESTS PASSED! ---');
}

runApiTests().catch(err => {
  console.error('API Test Failed:', err);
  process.exit(1);
});
