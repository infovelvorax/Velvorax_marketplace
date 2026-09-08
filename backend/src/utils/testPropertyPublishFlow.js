import http from 'http';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import dns from 'dns';
import { User, Listing, Category } from '../models/index.js';

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

async function verifyPropertyUploadFlow() {
  console.log('================================================================');
  console.log('TEST: SELLER UPLOADS LISTING → LISTED IN PROPERTIES CATEGORY');
  console.log('================================================================\n');

  await mongoose.connect(process.env.MONGODB_URI, { serverSelectionTimeoutMS: 15000 });
  console.log(`[Setup] Connected to database: ${mongoose.connection.name}\n`);

  const randomSuffix = Math.floor(100000 + Math.random() * 900000);
  const sellerEmail = `property.seller.${randomSuffix}@velvorax-real.com`;
  const sellerPassword = 'SellerSecurePass@2026!';
  const sellerName = `IndoRealty Properties ${randomSuffix}`;

  // STEP 1: Register Seller
  console.log(`[Step 1] Registering Seller: ${sellerEmail}...`);
  const regRes = await request('/api/marketplace/auth/register', 'POST', {
    name: sellerName,
    email: sellerEmail,
    password: sellerPassword,
    phone: `+91 98450${randomSuffix.toString().slice(0, 5)}`,
    role: 'seller'
  });
  if (regRes.status !== 201) throw new Error('Seller registration failed');
  const sellerId = regRes.data?.data?._id || regRes.data?.data?.id;

  // STEP 2: Admin Approves Seller
  console.log(`[Step 2] Admin approving seller...`);
  const adminLoginRes = await request('/api/marketplace/admin/auth/login', 'POST', {
    username: process.env.ADMIN_USERNAME,
    password: process.env.ADMIN_PASSWORD
  });
  const adminToken = adminLoginRes.data.token;
  await request(`/api/marketplace/admin/sellers/${sellerId}/status`, 'PATCH', { status: 'APPROVED' }, adminToken);

  // STEP 3: Seller Login
  console.log(`[Step 3] Approved seller logging in...`);
  const loginRes = await request('/api/marketplace/auth/login', 'POST', {
    email: sellerEmail,
    password: sellerPassword
  });
  const sellerToken = loginRes.data.token;

  // STEP 4: Seller Uploads / Posts Property Listing
  const propertyCategory = await Category.findOne({ slug: 'properties' });
  const propertyTitle = `Luxury 3 BHK Sea-View Penthouse ${randomSuffix}`;
  console.log(`[Step 4] Seller uploading property listing: "${propertyTitle}"...`);

  const uploadRes = await request('/api/marketplace/listings', 'POST', {
    title: propertyTitle,
    description: 'Ultra-luxurious 3 BHK penthouse with private terrace, modern modular kitchen, and panoramic skyline view.',
    categoryId: propertyCategory._id,
    categorySlug: 'properties',
    subcategoryName: 'For Sale: Houses & Apartments',
    listingType: 'SELL',
    condition: 'NEW',
    price: 18500000,
    currency: 'INR',
    currencySymbol: '₹',
    location: {
      country: 'India',
      region: 'Karnataka',
      city: 'Bengaluru',
      localArea: 'Indiranagar',
      address: '100ft Road, Indiranagar'
    },
    images: ['https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?q=80&w=800'],
    details: {
      propertyType: 'Apartment',
      bhk: '3 BHK',
      bedrooms: '3 BHK',
      bathrooms: '3',
      balconies: '2',
      builtUpArea: '2400',
      furnishing: 'Fully Furnished',
      possessionStatus: 'Ready to Move',
      amenities: ['Car Parking', 'Swimming Pool', '24/7 Security & CCTV', 'Modern Gymnasium']
    }
  }, sellerToken);

  if (uploadRes.status !== 201 && uploadRes.status !== 200) {
    console.error('Upload response error:', uploadRes.data);
    throw new Error('Upload listing failed');
  }
  const uploadedListing = uploadRes.data?.data || uploadRes.data;
  console.log(`  ✓ Listing created in MongoDB: ID=${uploadedListing._id}`);
  console.log(`  ✓ Status: ${uploadedListing.status} (Expected: APPROVED)`);
  console.log(`  ✓ Category: ${uploadedListing.categorySlug}`);

  if (uploadedListing.status !== 'APPROVED') {
    throw new Error(`Listing status is ${uploadedListing.status}, expected APPROVED`);
  }

  // STEP 5: Public Query for Properties Category
  console.log(`[Step 5] Public user querying GET /api/marketplace/listings?category=properties...`);
  const publicRes = await request('/api/marketplace/listings?category=properties', 'GET', null, null);
  const publicListings = publicRes.data?.data || publicRes.data?.listings || [];

  const foundProperty = publicListings.find(l => l._id.toString() === uploadedListing._id.toString());
  console.log(`  ✓ Public properties total: ${publicListings.length}`);
  console.log(`  ✓ Uploaded property found in public Properties list: ${!!foundProperty}`);

  if (!foundProperty) {
    console.error('Property not found in public listings list:', publicListings);
    throw new Error('Property missing from public category');
  }

  console.log(`  ✓ Title: "${foundProperty.title}"`);
  console.log(`  ✓ Price: ${foundProperty.currencySymbol}${foundProperty.price?.toLocaleString()}`);
  console.log(`  ✓ Location: ${foundProperty.location?.city}, ${foundProperty.location?.localArea}`);
  console.log(`  ✓ Seller: ${foundProperty.sellerId?.name}`);

  // STEP 6: Direct Public Detail Fetch
  console.log(`\n[Step 6] Public user opening property details /api/marketplace/listings/${uploadedListing._id}...`);
  const detailRes = await request(`/api/marketplace/listings/${uploadedListing._id}`, 'GET', null, null);
  if (detailRes.status !== 200) throw new Error('Detail fetch failed');
  console.log(`  ✓ HTTP Status: 200 OK`);
  console.log(`  ✓ Views count incremented: ${detailRes.data?.data?.views}`);

  // Clean up test seller & listing
  await Listing.deleteMany({ sellerId });
  await User.deleteOne({ _id: sellerId });
  console.log('\n[Cleanup] Test seller & property listing cleaned up from MongoDB.');

  console.log('\n================================================================');
  console.log('VERIFIED: SELLER UPLOADS → IMMEDIATELY LIVE IN PROPERTIES CATEGORY!');
  console.log('================================================================');

  await mongoose.disconnect();
}

verifyPropertyUploadFlow().catch(err => {
  console.error('Property Flow Error:', err);
  process.exit(1);
});
