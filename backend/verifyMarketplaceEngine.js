import http from 'http';

const request = (path) => {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'localhost',
      port: 5000,
      path,
      method: 'GET',
      headers: { 'Content-Type': 'application/json' }
    };
    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => { data += chunk; });
      res.on('end', () => {
        try {
          resolve({ status: res.statusCode, data: JSON.parse(data) });
        } catch (e) {
          resolve({ status: res.statusCode, raw: data });
        }
      });
    });
    req.on('error', reject);
    req.end();
  });
};

async function runTests() {
  console.log('================================================================');
  console.log('VELVORAX REAL OLX-STYLE SEARCH ENGINE - 13 TEST SUITE EXECUTION');
  console.log('================================================================\n');

  let passed = 0;
  let total = 13;

  // Test 1: Keyword search
  try {
    const res = await request('/api/marketplace/listings?q=toyota');
    const items = res.data?.data || [];
    const hasToyota = items.some(i => i.title.toLowerCase().includes('toyota') || i.details?.brand?.toLowerCase() === 'toyota');
    if (res.status === 200 && items.length > 0 && hasToyota) {
      console.log('✅ Test 1: Keyword Search ("toyota") PASSED -> Found ' + items.length + ' listing(s): ' + items.map(i => i.title).join(', '));
      passed++;
    } else {
      console.error('❌ Test 1 FAILED', res);
    }
  } catch (e) { console.error('❌ Test 1 Error', e); }

  // Test 2: Category filter
  try {
    const res = await request('/api/marketplace/listings?category=properties');
    const items = res.data?.data || [];
    const allProps = items.every(i => i.categorySlug === 'properties');
    if (res.status === 200 && items.length > 0 && allProps) {
      console.log('✅ Test 2: Category Filter ("properties") PASSED -> Found ' + items.length + ' property listing(s)');
      passed++;
    } else {
      console.error('❌ Test 2 FAILED', res);
    }
  } catch (e) { console.error('❌ Test 2 Error', e); }

  // Test 3: Subcategory filter
  try {
    const res = await request('/api/marketplace/listings?category=vehicles&subcategory=Cars');
    const items = res.data?.data || [];
    const allCars = items.every(i => i.subcategoryName === 'Cars');
    if (res.status === 200 && items.length > 0 && allCars) {
      console.log('✅ Test 3: Subcategory Filter ("Cars") PASSED -> Found ' + items.length + ' car listing(s)');
      passed++;
    } else {
      console.error('❌ Test 3 FAILED', res);
    }
  } catch (e) { console.error('❌ Test 3 Error', e); }

  // Test 4: Listing Type filter
  try {
    const res = await request('/api/marketplace/listings?listingType=rent');
    const items = res.data?.data || [];
    const allRent = items.every(i => i.listingType === 'RENT');
    if (res.status === 200 && items.length > 0 && allRent) {
      console.log('✅ Test 4: Listing Type ("RENT") PASSED -> Found ' + items.length + ' rental listing(s)');
      passed++;
    } else {
      console.error('❌ Test 4 FAILED', res);
    }
  } catch (e) { console.error('❌ Test 4 Error', e); }

  // Test 5: Price range filter
  try {
    const res = await request('/api/marketplace/listings?minPrice=20000&maxPrice=50000');
    const items = res.data?.data || [];
    const inRange = items.every(i => i.price >= 20000 && i.price <= 50000);
    if (res.status === 200 && items.length > 0 && inRange) {
      console.log('✅ Test 5: Price Range (20,000 - 50,000) PASSED -> Found ' + items.length + ' listing(s)');
      passed++;
    } else {
      console.error('❌ Test 5 FAILED', res);
    }
  } catch (e) { console.error('❌ Test 5 Error', e); }

  // Test 6: Condition filter
  try {
    const res = await request('/api/marketplace/listings?condition=LIKE_NEW');
    const items = res.data?.data || [];
    const allLikeNew = items.every(i => i.condition === 'LIKE_NEW');
    if (res.status === 200 && items.length > 0 && allLikeNew) {
      console.log('✅ Test 6: Condition ("LIKE_NEW") PASSED -> Found ' + items.length + ' listing(s)');
      passed++;
    } else {
      console.error('❌ Test 6 FAILED', res);
    }
  } catch (e) { console.error('❌ Test 6 Error', e); }

  // Test 7: Date Posted filter
  try {
    const res = await request('/api/marketplace/listings?datePosted=7d');
    const items = res.data?.data || [];
    if (res.status === 200 && items.length > 0) {
      console.log('✅ Test 7: Date Posted ("7d") PASSED -> Found ' + items.length + ' recent listing(s)');
      passed++;
    } else {
      console.error('❌ Test 7 FAILED', res);
    }
  } catch (e) { console.error('❌ Test 7 Error', e); }

  // Test 8: Location filter
  try {
    const res = await request('/api/marketplace/listings?city=Hyderabad');
    const items = res.data?.data || [];
    const allHyd = items.every(i => i.location?.city === 'Hyderabad');
    if (res.status === 200 && items.length > 0 && allHyd) {
      console.log('✅ Test 8: Location Filter ("Hyderabad") PASSED -> Found ' + items.length + ' Hyderabad listing(s)');
      passed++;
    } else {
      console.error('❌ Test 8 FAILED', res);
    }
  } catch (e) { console.error('❌ Test 8 Error', e); }

  // Test 9: Geospatial distance search
  try {
    // Hyderabad lat: 17.3850, lng: 78.4867, radius 50km
    const res = await request('/api/marketplace/listings?latitude=17.3850&longitude=78.4867&distance=50');
    const items = res.data?.data || [];
    if (res.status === 200 && items.length > 0) {
      console.log('✅ Test 9: Geospatial Radius Search (50km from Hyderabad coords) PASSED -> Found ' + items.length + ' listing(s): ' + items.map(i => `${i.title} (${i.location?.city})`).join(', '));
      passed++;
    } else {
      console.error('❌ Test 9 FAILED', res);
    }
  } catch (e) { console.error('❌ Test 9 Error', e); }

  // Test 10: Dynamic Category attribute - bedrooms
  try {
    const res = await request('/api/marketplace/listings?category=properties&bedrooms=2%20BHK');
    const items = res.data?.data || [];
    const all2BHK = items.every(i => i.details?.bedrooms === '2 BHK');
    if (res.status === 200 && items.length > 0 && all2BHK) {
      console.log('✅ Test 10: Dynamic Attribute ("2 BHK Properties") PASSED -> Found ' + items.length + ' listing(s)');
      passed++;
    } else {
      console.error('❌ Test 10 FAILED', res);
    }
  } catch (e) { console.error('❌ Test 10 Error', e); }

  // Test 11: Dynamic Category attribute - fuel
  try {
    const res = await request('/api/marketplace/listings?category=vehicles&fuel=hybrid');
    const items = res.data?.data || [];
    const allHybrid = items.every(i => i.details?.fuel?.toLowerCase() === 'hybrid');
    if (res.status === 200 && items.length > 0 && allHybrid) {
      console.log('✅ Test 11: Dynamic Attribute ("Hybrid Vehicles") PASSED -> Found ' + items.length + ' listing(s)');
      passed++;
    } else {
      console.error('❌ Test 11 FAILED', res);
    }
  } catch (e) { console.error('❌ Test 11 Error', e); }

  // Test 12: Sorting price_asc
  try {
    const res = await request('/api/marketplace/listings?sortBy=price_asc');
    const items = res.data?.data || [];
    let isAsc = true;
    for (let i = 0; i < items.length - 1; i++) {
      if (items[i].price > items[i + 1].price) {
        isAsc = false;
        break;
      }
    }
    if (res.status === 200 && items.length > 0 && isAsc) {
      console.log('✅ Test 12: Sort By Price Ascending PASSED -> Prices: ' + items.slice(0, 5).map(i => i.price).join(', '));
      passed++;
    } else {
      console.error('❌ Test 12 FAILED', res);
    }
  } catch (e) { console.error('❌ Test 12 Error', e); }

  // Test 13: Live search suggestions endpoint
  try {
    const res = await request('/api/marketplace/listings/suggestions?q=toy');
    const suggestions = res.data?.data?.suggestions || [];
    const hasToySug = suggestions.some(s => s.title.toLowerCase().includes('toy'));
    if (res.status === 200 && suggestions.length > 0 && hasToySug) {
      console.log('✅ Test 13: Search Suggestions Endpoint ("/suggestions?q=toy") PASSED -> Suggestions: ' + suggestions.map(s => s.title).join(', '));
      passed++;
    } else {
      console.error('❌ Test 13 FAILED', res);
    }
  } catch (e) { console.error('❌ Test 13 Error', res); }

  console.log('\n================================================================');
  console.log(`TOTAL RESULT: ${passed} / ${total} TESTS PASSED (${Math.round((passed / total) * 100)}%)`);
  console.log('================================================================\n');

  process.exit(passed === total ? 0 : 1);
}

runTests().catch((e) => {
  console.error('Fatal error during test run:', e);
  process.exit(1);
});
