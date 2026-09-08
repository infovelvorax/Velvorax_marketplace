import http from 'http';

const testCases = [
  { name: 'Vehicle search: bike in vehicles', query: 'q=bike&category=vehicles', expectMin: 1 },
  { name: 'Vehicle search: bike worldwide', query: 'q=bike', expectMin: 1 },
  { name: 'Vehicle category all: vehicles', query: 'category=vehicles', expectMin: 5 },
  { name: 'Electronics search: iPhone', query: 'q=iphone', expectMin: 1 },
  { name: 'Electronics alias: category=electronics', query: 'category=electronics', expectMin: 5 },
  { name: 'Property search: villa', query: 'q=villa', expectMin: 1 },
  { name: 'Property search: 3 BHK Apartment', query: 'q=3+BHK&category=properties', expectMin: 1 },
  { name: 'Luxury Car search: BMW in vehicles', query: 'q=BMW&category=vehicles', expectMin: 1 },
  { name: 'Honda Bike search in vehicles', query: 'q=Honda+bike&category=vehicles', expectMin: 1 },
  { name: 'Local Services search: Plumber', query: 'q=plumber&category=services', expectMin: 1 },
  { name: 'Agriculture search: Tractor in farm', query: 'q=tractor&category=farm', expectMin: 1 },
  { name: 'City specific search: Bengaluru bikes', query: 'q=bike&category=vehicles&city=Bengaluru', expectMin: 1 },
  { name: 'City specific search: Chennai bikes', query: 'q=bike&category=vehicles&city=Chennai', expectMin: 1 },
  { name: 'Search suggestions for "bik"', path: '/listings/suggestions?q=bik', expectMin: 1, isSuggestion: true }
];

const runHttp = (path) => new Promise((resolve, reject) => {
  http.get(`http://127.0.0.1:5000/api/marketplace${path}`, (res) => {
    let data = '';
    res.on('data', chunk => data += chunk);
    res.on('end', () => {
      try {
        const parsed = JSON.parse(data);
        resolve({ status: res.statusCode, data: parsed });
      } catch (e) {
        reject(e);
      }
    });
  }).on('error', reject);
});

const runTests = async () => {
  console.log('====================================================');
  console.log('VELVORAX SEARCH & FILTERING END-TO-END TEST SUITE');
  console.log('====================================================\n');
  
  let passed = 0;
  let failed = 0;

  for (const tc of testCases) {
    const path = tc.path || `/listings?${tc.query}`;
    try {
      const res = await runHttp(path);
      const items = tc.isSuggestion 
        ? (res.data?.suggestions || res.data?.data?.suggestions || [])
        : (res.data?.listings || res.data?.data || []);
      
      const count = items.length;
      const total = res.data?.pagination?.total ?? count;

      if (res.status === 200 && count >= tc.expectMin) {
        console.log(`✅ PASS: [${tc.name}]`);
        console.log(`   Path: ${path}`);
        console.log(`   Items Returned: ${count} (Total matching in DB: ${total})`);
        if (count > 0) {
          const sample = items[0];
          console.log(`   Sample Match: "${sample.title}" | City: ${sample.location?.city || sample.city || 'N/A'}`);
        }
        console.log('');
        passed++;
      } else {
        console.error(`❌ FAIL: [${tc.name}]`);
        console.error(`   Path: ${path}`);
        console.error(`   Status: ${res.status}, Items: ${count} (Expected >= ${tc.expectMin})`);
        console.log('');
        failed++;
      }
    } catch (e) {
      console.error(`❌ ERROR: [${tc.name}]: ${e.message}`);
      failed++;
    }
  }

  console.log('====================================================');
  console.log(`TOTAL: ${testCases.length} | PASSED: ${passed} | FAILED: ${failed}`);
  console.log('====================================================\n');

  if (failed > 0) process.exit(1);
  process.exit(0);
};

runTests();
