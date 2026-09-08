const test = async () => {
  const urls = [
    'http://127.0.0.1:5000/api/marketplace/listings?q=bike&category=vehicles',
    'http://127.0.0.1:5000/api/marketplace/listings?q=bike',
    'http://127.0.0.1:5000/api/marketplace/listings?category=vehicles',
    'http://127.0.0.1:5000/api/marketplace/listings?q=iphone',
    'http://127.0.0.1:5000/api/marketplace/listings?category=products',
    'http://127.0.0.1:5000/api/marketplace/listings?category=electronics',
    'http://127.0.0.1:5000/api/marketplace/listings?q=villa',
    'http://127.0.0.1:5000/api/marketplace/listings?q=bmw',
    'http://127.0.0.1:5000/api/marketplace/listings?q=plumber'
  ];

  for (const url of urls) {
    try {
      const res = await fetch(url);
      const json = await res.json();
      const count = json?.listings?.length ?? json?.data?.listings?.length ?? (Array.isArray(json) ? json.length : 0);
      console.log(`URL: ${url}`);
      console.log(` -> Status: ${res.status}, Count: ${count}`);
      if (count > 0) {
        const first = (json?.listings || json?.data?.listings || json)[0];
        console.log(` -> Sample match: "${first.title}" [${first.categorySlug}]`);
      }
    } catch (e) {
      console.error(`Error fetching ${url}:`, e.message);
    }
  }
};

test();
