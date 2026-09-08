import dns from 'dns';
try {
  dns.setServers(['8.8.8.8', '1.1.1.1', '8.8.4.4']);
} catch {}
try {
  if (typeof dns.setDefaultResultOrder === 'function') {
    dns.setDefaultResultOrder('ipv4first');
  }
} catch {}

import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { Listing, Category, Location, User } from '../models/index.js';
import { buyerAiService } from '../services/ai/buyerAi.service.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

const MONGODB_URI = process.env.MONGODB_URI;

export async function verifyMarketplace() {
  console.log('================================================================');
  console.log('VELVORAX MARKETPLACE - COMPREHENSIVE FILTER & BUYER AI VERIFIER');
  console.log('================================================================\n');

  await mongoose.connect(MONGODB_URI, { serverSelectionTimeoutMS: 15000 });
  console.log(`Connected to MongoDB: ${mongoose.connection.name}\n`);

  let totalTests = 0;
  let passedTests = 0;

  function assert(name, condition, details = '') {
    totalTests++;
    if (condition) {
      passedTests++;
      console.log(`  ✅ [PASS] ${name}${details ? ` -> ${details}` : ''}`);
    } else {
      console.error(`  ❌ [FAIL] ${name}${details ? ` -> ${details}` : ''}`);
    }
  }

  // ---------------------------------------------------------------------------
  // SUITE 1: DATA INTEGRITY & STATUS VERIFICATION
  // ---------------------------------------------------------------------------
  console.log('--- 1. DATA INTEGRITY & APPROVAL STATUS ---');
  const totalListings = await Listing.countDocuments();
  const testListings = await Listing.countDocuments({ isTestData: true, seedSource: 'buyer-ai-test' });
  const approvedTestListings = await Listing.countDocuments({ isTestData: true, status: 'APPROVED' });
  const realListings = await Listing.countDocuments({ isTestData: { $ne: true } });

  assert('100 Test Listings Created', testListings === 100, `Found: ${testListings}`);
  assert('All Test Listings APPROVED', approvedTestListings === testListings, `${approvedTestListings} / ${testListings}`);
  assert('Real User Listings Untouched', realListings >= 5, `Real listings count: ${realListings}`);

  // ---------------------------------------------------------------------------
  // SUITE 2: CATEGORY FILTER COVERAGE (10 Major Categories)
  // ---------------------------------------------------------------------------
  console.log('\n--- 2. CATEGORY FILTER COVERAGE ---');
  const categoriesToTest = [
    { slug: 'properties', name: 'Properties', minExpected: 10 },
    { slug: 'vehicles', name: 'Cars & Bikes', minExpected: 10 },
    { slug: 'products', name: 'Mobiles & Electronics', minExpected: 10 },
    { slug: 'jobs', name: 'Jobs & Careers', minExpected: 10 },
    { slug: 'services', name: 'Local Services', minExpected: 10 },
    { slug: 'farm', name: 'Agriculture & Farm', minExpected: 10 },
    { slug: 'businesses', name: 'Business Directory', minExpected: 10 },
    { slug: 'furniture', name: 'Furniture', minExpected: 5 },
    { slug: 'books-hobbies', name: 'Books & Hobbies', minExpected: 4 },
    { slug: 'fashion', name: 'Fashion', minExpected: 2 },
    { slug: 'pets', name: 'Pets', minExpected: 2 }
  ];

  for (const cat of categoriesToTest) {
    const count = await Listing.countDocuments({ categorySlug: cat.slug, status: 'APPROVED' });
    assert(`Category: ${cat.name} (${cat.slug})`, count >= cat.minExpected, `${count} approved listings`);
  }

  // ---------------------------------------------------------------------------
  // SUITE 3: LISTING TYPE FILTERS (SELL, RENT, FREE, EXCHANGE)
  // ---------------------------------------------------------------------------
  console.log('\n--- 3. LISTING TYPE & CONDITION FILTERS ---');
  const rentCount = await Listing.countDocuments({ listingType: 'RENT', status: 'APPROVED' });
  const freeCount = await Listing.countDocuments({ listingType: 'FREE', status: 'APPROVED', price: 0 });
  const sellCount = await Listing.countDocuments({ listingType: 'SELL', status: 'APPROVED' });
  const newConditionCount = await Listing.countDocuments({ condition: 'NEW', status: 'APPROVED' });
  const excellentConditionCount = await Listing.countDocuments({ condition: 'EXCELLENT', status: 'APPROVED' });
  const goodConditionCount = await Listing.countDocuments({ condition: 'GOOD', status: 'APPROVED' });

  assert('Rental Listings (listingType: RENT)', rentCount >= 10, `${rentCount} rentals`);
  assert('Free Giveaways (listingType: FREE, price: 0)', freeCount >= 10, `${freeCount} giveaways`);
  assert('Sale Listings (listingType: SELL)', sellCount >= 60, `${sellCount} sale items`);
  assert('Condition NEW', newConditionCount >= 10, `${newConditionCount} items`);
  assert('Condition EXCELLENT', excellentConditionCount >= 20, `${excellentConditionCount} items`);
  assert('Condition GOOD', goodConditionCount >= 15, `${goodConditionCount} items`);

  // ---------------------------------------------------------------------------
  // SUITE 4: LOCATION / CITY COVERAGE
  // ---------------------------------------------------------------------------
  console.log('\n--- 4. LOCATION & CITY FILTERS ---');
  const targetCities = ['Bengaluru', 'Coimbatore', 'Chennai', 'Hyderabad', 'Mumbai', 'Pune', 'Delhi', 'Kochi', 'Mysuru'];
  for (const city of targetCities) {
    const count = await Listing.countDocuments({ 'location.city': { $regex: city, $options: 'i' }, status: 'APPROVED' });
    assert(`City Filter: ${city}`, count >= 2, `${count} listings`);
  }

  // ---------------------------------------------------------------------------
  // SUITE 5: BUYER AI NATURAL LANGUAGE QUERIES (All 21 Required Queries)
  // ---------------------------------------------------------------------------
  console.log('\n--- 5. BUYER AI NATURAL LANGUAGE SEARCH BENCHMARK ---');

  const buyerAiQueries = [
    { q: "two wheeler", check: (res) => res.count >= 1 && res.results.some(r => /activa|jupiter|scooter|bike|royal enfield|yamaha|r15|apache/i.test(r.title)) },
    { q: "bikes under 80000", check: (res) => res.count >= 1 && res.results.every(r => r.price <= 80000) },
    { q: "bikes in Chennai", check: (res) => res.count >= 1 && res.results.some(r => r.location.city === 'Chennai') },
    { q: "cars under 8 lakh", check: (res) => res.count >= 1 && res.results.every(r => r.price <= 800000) },
    { q: "cars in Bangalore", check: (res) => res.count >= 1 && res.results.some(r => /bengaluru|bangalore/i.test(r.location.city)) },
    { q: "Find 2BHK apartments in Coimbatore", check: (res) => res.count >= 1 && res.results.some(r => /2 bhk|apartment/i.test(r.title) && r.location.city === 'Coimbatore') },
    { q: "3BHK under 50 lakhs in Bengaluru", check: (res) => res.count >= 1 && res.results.some(r => /bengaluru/i.test(r.location.city) && r.price <= 5000000) },
    { q: "properties in Bangalore", check: (res) => res.count >= 1 && res.results.some(r => /bengaluru/i.test(r.location.city) && r.categorySlug === 'properties') },
    { q: "Laptops under ₹50,000", check: (res) => res.count >= 1 && res.results.some(r => /dell|hp|lenovo|laptop/i.test(r.title) && r.price <= 50000) },
    { q: "MacBook under 1 lakh", check: (res) => res.count >= 1 && res.results.some(r => /macbook/i.test(r.title) && r.price <= 100000) },
    { q: "phones under 30000", check: (res) => res.count >= 1 && res.results.some(r => /samsung|oneplus|phone/i.test(r.title) && r.price <= 30000) },
    { q: "Software jobs in Bangalore", check: (res) => res.count >= 1 && res.results.some(r => /developer|react|engineer|software/i.test(r.title) && /bengaluru/i.test(r.location.city)) },
    { q: "React developer jobs", check: (res) => res.count >= 1 && res.results.some(r => /react/i.test(r.title)) },
    { q: "plumber in Coimbatore", check: (res) => res.count >= 1 && res.results.some(r => /plumber/i.test(r.title) && r.location.city === 'Coimbatore') },
    { q: "electrician in Chennai", check: (res) => res.count >= 1 && res.results.some(r => /electrician/i.test(r.title) && r.location.city === 'Chennai') },
    { q: "AC repair in Bangalore", check: (res) => res.count >= 1 && res.results.some(r => /ac repair|ac servicing/i.test(r.title) && /bengaluru/i.test(r.location.city)) },
    { q: "tractors under 5 lakh", check: (res) => res.count >= 1 && res.results.some(r => /tractor/i.test(r.title) && r.price <= 500000) },
    { q: "agriculture equipment near Coimbatore", check: (res) => res.count >= 1 && res.results.some(r => r.location.city === 'Coimbatore' && r.categorySlug === 'farm') },
    { q: "businesses in Chennai", check: (res) => res.count >= 1 && res.results.some(r => r.location.city === 'Chennai' && r.categorySlug === 'businesses') },
    { q: "houses for rent in Bangalore", check: (res) => res.count >= 1 && res.results.some(r => /bengaluru/i.test(r.location.city) && r.listingType === 'RENT') },
    { q: "free furniture in Coimbatore", check: (res) => res.count >= 1 && res.results.some(r => r.location.city === 'Coimbatore' && (r.listingType === 'FREE' || r.price === 0)) }
  ];

  const queryResultsSummary = [];

  for (let i = 0; i < buyerAiQueries.length; i++) {
    const item = buyerAiQueries[i];
    try {
      const result = await buyerAiService.processChatMessage({ message: item.q });
      const passed = item.check(result);
      const topMatches = (result.results || []).slice(0, 2).map(r => `"${r.title}" (₹${r.price?.toLocaleString()} in ${r.location?.city})`).join(', ');
      assert(`Buyer AI Query #${i + 1}: "${item.q}"`, passed, `Found ${result.count} items: ${topMatches || 'None'}`);
      queryResultsSummary.push({ query: item.q, count: result.count, passed, topMatch: result.results?.[0]?.title || 'None' });
    } catch (err) {
      assert(`Buyer AI Query #${i + 1}: "${item.q}"`, false, `Error: ${err.message}`);
      queryResultsSummary.push({ query: item.q, count: 0, passed: false, topMatch: 'Error' });
    }
  }

  console.log('\n================================================================');
  console.log(`VERIFICATION SUMMARY: ${passedTests} / ${totalTests} CHECKS PASSED (${Math.round((passedTests / totalTests) * 100)}%)`);
  console.log('================================================================\n');

  await mongoose.disconnect();
  return { totalTests, passedTests, queryResultsSummary };
}

if (process.argv[1]?.endsWith('verifyMarketplaceTestEngine.js')) {
  verifyMarketplace()
    .then((res) => {
      process.exit(res.passedTests === res.totalTests ? 0 : 1);
    })
    .catch((err) => {
      console.error('Verifier error:', err);
      process.exit(1);
    });
}
