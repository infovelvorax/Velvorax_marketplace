import http from 'http';

const testUrls = [
  // 1. Without location
  'http://127.0.0.1:5000/api/marketplace/listings?q=bike&category=vehicles',
  'http://127.0.0.1:5000/api/marketplace/listings?q=bike',
  'http://127.0.0.1:5000/api/marketplace/listings?category=vehicles',
  
  // 2. With city (what happens when search page injects selectedLocation.city)
  'http://127.0.0.1:5000/api/marketplace/listings?q=bike&category=vehicles&city=Bengaluru',
  'http://127.0.0.1:5000/api/marketplace/listings?q=bike&category=vehicles&city=Dubai',
  'http://127.0.0.1:5000/api/marketplace/listings?q=bike&category=vehicles&city=Chennai',
  
  // 3. Other categories & keywords
  'http://127.0.0.1:5000/api/marketplace/listings?category=electronics',
  'http://127.0.0.1:5000/api/marketplace/listings?q=iphone',
  'http://127.0.0.1:5000/api/marketplace/listings?q=villa',
  'http://127.0.0.1:5000/api/marketplace/listings?q=bmw',
  'http://127.0.0.1:5000/api/marketplace/listings?q=plumber'
];

const fetchUrl = (url) => new Promise((resolve) => {
  http.get(url, (res) => {
    let data = '';
    res.on('data', chunk => data += chunk);
    res.on('end', () => {
      try {
        const json = JSON.parse(data);
        resolve({ url, status: res.statusCode, json });
      } catch (e) {
        resolve({ url, status: res.statusCode, error: e.message });
      }
    });
  }).on('error', (err) => resolve({ url, error: err.message }));
});

const run = async () => {
  for (const u of testUrls) {
    const res = await fetchUrl(u);
    const count = res.json?.listings?.length ?? res.json?.data?.listings?.length ?? (Array.isArray(res.json) ? res.json.length : 0);
    const total = res.json?.pagination?.total ?? res.json?.data?.pagination?.total ?? count;
    console.log(`URL: ${u.replace('http://127.0.0.1:5000/api/marketplace', '')}`);
    console.log(`   -> Found: ${count} items (Total in DB: ${total})`);
    const listings = res.json?.listings || res.json?.data?.listings || [];
    if (listings.length > 0) {
      console.log(`   -> Sample: "${listings[0].title}" [${listings[0].categorySlug}] (City: ${listings[0].location?.city})`);
    }
  }
};

run();
