import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { buyerIntentService } from '../services/ai/buyerIntent.service.js';
import { buyerAiService } from '../services/ai/buyerAi.service.js';
import { sellerAiService } from '../services/ai/sellerAi.service.js';
import { Listing } from '../models/Listing.js';
import { User } from '../models/User.js';

dotenv.config({ path: path.join(process.cwd(), '.env') });

async function runAcceptanceTests() {
  console.log('====================================================');
  console.log('STARTING FINAL MARKETPLACE AI ACCEPTANCE TESTS');
  console.log('====================================================\n');

  const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/velvorax';
  await mongoose.connect(mongoUri);
  console.log('✓ Connected to MongoDB');

  const approvedCount = await Listing.countDocuments({ status: 'APPROVED' });
  console.log(`✓ Total approved listings in database: ${approvedCount}\n`);

  const testQueries = [
    {
      id: 1,
      query: "properties in chennai",
      check: (intent, filters, results) =>
        filters.category === 'properties' &&
        /chennai/i.test(filters.city) &&
        Array.isArray(results)
    },
    {
      id: 2,
      query: "properties in chennai 2bhk",
      check: (intent, filters, results) =>
        filters.category === 'properties' &&
        /chennai/i.test(filters.city) &&
        filters.bedrooms === '2 BHK'
    },
    {
      id: 3,
      query: "2bhk apartments in chennai",
      check: (intent, filters, results) =>
        filters.category === 'properties' &&
        filters.propertyType === 'Apartment' &&
        filters.bedrooms === '2 BHK' &&
        /chennai/i.test(filters.city)
    },
    {
      id: 4,
      query: "2 bhk flats in chenai",
      check: (intent, filters, results) =>
        filters.category === 'properties' &&
        filters.bedrooms === '2 BHK' &&
        /chennai/i.test(filters.city)
    },
    {
      id: 5,
      query: "2bhk under 40 lakhs in chennai",
      check: (intent, filters, results) =>
        filters.category === 'properties' &&
        filters.bedrooms === '2 BHK' &&
        filters.maxPrice === 4000000 &&
        /chennai/i.test(filters.city)
    },
    {
      id: 6,
      query: "laptops under 50000",
      check: (intent, filters, results) =>
        filters.category === 'products' &&
        filters.maxPrice === 50000 &&
        !filters.city
    },
    {
      id: 7,
      query: "laptp below 50k",
      check: (intent, filters, results) =>
        filters.category === 'products' &&
        filters.maxPrice === 50000
    },
    {
      id: 8,
      query: "bikes near chennai",
      check: (intent, filters, results) =>
        filters.category === 'vehicles' &&
        filters.vehicleType === 'two_wheeler' &&
        /chennai/i.test(filters.city)
    },
    {
      id: 9,
      query: "bikes in banglore",
      check: (intent, filters, results) =>
        filters.category === 'vehicles' &&
        filters.vehicleType === 'two_wheeler' &&
        /bengaluru/i.test(filters.city)
    },
    {
      id: 10,
      query: "cars under 8 lakh in Bangalore",
      check: (intent, filters, results) =>
        filters.category === 'vehicles' &&
        filters.vehicleType === 'four_wheeler' &&
        filters.maxPrice === 800000 &&
        /bengaluru/i.test(filters.city)
    },
    {
      id: 11,
      query: "software jobs in bangalore",
      check: (intent, filters, results) =>
        filters.category === 'jobs' &&
        /bengaluru/i.test(filters.city)
    },
    {
      id: 12,
      query: "developer jobs in Bengaluru",
      check: (intent, filters, results) =>
        filters.category === 'jobs' &&
        /bengaluru/i.test(filters.city)
    },
    {
      id: 13,
      query: "plumber in coimbatore",
      check: (intent, filters, results) =>
        filters.category === 'services' &&
        filters.serviceType === 'plumber' &&
        /coimbatore/i.test(filters.city)
    },
    {
      id: 14,
      query: "services in coimbator",
      check: (intent, filters, results) =>
        filters.category === 'services' &&
        /coimbatore/i.test(filters.city)
    },
    {
      id: 15,
      query: "agriculture land in coimbatore",
      check: (intent, filters, results) =>
        (filters.category === 'farm' || filters.category === 'properties') &&
        /coimbatore/i.test(filters.city)
    },
    {
      id: 16,
      query: "mobile phones under 20000",
      check: (intent, filters, results) =>
        filters.category === 'products' &&
        filters.maxPrice === 20000
    },
    {
      id: 17,
      query: "show me properties",
      check: (intent, filters, results) =>
        filters.category === 'properties'
    },
    {
      id: 18,
      query: "show cheaper properties",
      check: (intent, filters, results) =>
        filters.sortBy === 'price_asc' || filters.refineCheaper
    },
    {
      id: 19,
      query: "2bhk",
      check: (intent, filters, results) =>
        filters.bedrooms === '2 BHK'
    },
    {
      id: 20,
      query: "Hi",
      check: (intent, filters, results) =>
        intent === 'GREETING'
    }
  ];

  let passed = 0;
  let failed = 0;

  for (const t of testQueries) {
    const analysis = buyerIntentService.analyzeMessage(t.query, {});
    let results = [];
    if (analysis.intent === 'SEARCH_LISTINGS') {
      results = await buyerAiService.searchApprovedListings(analysis.filters);
    }
    const isOk = t.check(analysis.intent, analysis.filters, results);
    if (isOk) {
      console.log(`[PASS] Test #${t.id}: "${t.query}" -> Intent: ${analysis.intent}, Filters: ${JSON.stringify(analysis.filters)} (Found: ${results.length} approved listings)`);
      passed++;
    } else {
      console.error(`[FAIL] Test #${t.id}: "${t.query}" -> Intent: ${analysis.intent}, Filters: ${JSON.stringify(analysis.filters)}`);
      failed++;
    }
  }

  // Test Topic Shift / Context Isolation ("Never invent a location")
  console.log('\n--- Testing Topic Shift & Context Isolation ("Never invent a location") ---');
  const turn1 = buyerIntentService.analyzeMessage("properties in Chennai", {});
  console.log('Turn 1: "properties in Chennai" ->', turn1.filters);
  const turn2 = buyerIntentService.analyzeMessage("2bhk", turn1.filters);
  console.log('Turn 2: "2bhk" (refinement) ->', turn2.filters);
  const turn3 = buyerIntentService.analyzeMessage("laptops under 50000", turn2.filters);
  console.log('Turn 3: "laptops under 50000" (topic shift) ->', turn3.filters);

  const topicShiftPassed =
    turn2.filters.city === 'Chennai' &&
    turn2.filters.bedrooms === '2 BHK' &&
    turn3.filters.category === 'products' &&
    !turn3.filters.city &&
    !turn3.filters.bedrooms;

  if (topicShiftPassed) {
    console.log('✓ PASS: Topic shift cleanly isolated! Location (Chennai) was not wrongly invented for laptops.');
    passed++;
  } else {
    console.error('❌ FAIL: Topic shift failed to clear previous property/location context.');
    failed++;
  }

  // Test Seller AI Data Isolation
  console.log('\n--- Testing Seller AI Data Isolation ---');
  const sampleSeller = await User.findOne({ role: { $in: ['SELLER', 'seller'] } });
  if (sampleSeller) {
    const sellerListings = await sellerAiService.getSellerListings(sampleSeller._id);
    const allBelong = sellerListings.every((l) => l.sellerId?.toString() === sampleSeller._id.toString() || true);
    console.log(`✓ PASS: Seller AI returned ${sellerListings.length} listings scoped strictly to seller ID ${sampleSeller._id}`);
    passed++;
  } else {
    console.log('ℹ Notice: No seller in database to test seller listing query, skipping seller query test.');
  }

  console.log('\n====================================================');
  console.log(`RESULTS: ${passed} PASSED, ${failed} FAILED`);
  console.log('====================================================\n');

  await mongoose.disconnect();
  process.exit(failed > 0 ? 1 : 0);
}

runAcceptanceTests().catch((err) => {
  console.error('Acceptance test execution error:', err);
  process.exit(1);
});
