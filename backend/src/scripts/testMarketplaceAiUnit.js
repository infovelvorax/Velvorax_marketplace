import { buyerIntentService } from '../services/ai/buyerIntent.service.js';

function runUnitAcceptanceTests() {
  console.log('====================================================');
  console.log('STARTING MARKETPLACE AI NLP & INTENT ACCEPTANCE TESTS');
  console.log('====================================================\n');

  const testQueries = [
    {
      id: 1,
      query: "properties in chennai",
      check: (analysis) =>
        analysis.filters.category === 'properties' &&
        /chennai/i.test(analysis.filters.city)
    },
    {
      id: 2,
      query: "properties in chennai 2bhk",
      check: (analysis) =>
        analysis.filters.category === 'properties' &&
        /chennai/i.test(analysis.filters.city) &&
        analysis.filters.bedrooms === '2 BHK'
    },
    {
      id: 3,
      query: "2bhk apartments in chennai",
      check: (analysis) =>
        analysis.filters.category === 'properties' &&
        analysis.filters.propertyType === 'Apartment' &&
        analysis.filters.bedrooms === '2 BHK' &&
        /chennai/i.test(analysis.filters.city)
    },
    {
      id: 4,
      query: "2 bhk flats in chenai",
      check: (analysis) =>
        analysis.filters.category === 'properties' &&
        analysis.filters.bedrooms === '2 BHK' &&
        /chennai/i.test(analysis.filters.city)
    },
    {
      id: 5,
      query: "2bhk under 40 lakhs in chennai",
      check: (analysis) =>
        analysis.filters.category === 'properties' &&
        analysis.filters.bedrooms === '2 BHK' &&
        analysis.filters.maxPrice === 4000000 &&
        /chennai/i.test(analysis.filters.city)
    },
    {
      id: 6,
      query: "laptops under 50000",
      check: (analysis) =>
        analysis.filters.category === 'products' &&
        analysis.filters.maxPrice === 50000 &&
        !analysis.filters.city
    },
    {
      id: 7,
      query: "laptp below 50k",
      check: (analysis) =>
        analysis.filters.category === 'products' &&
        analysis.filters.maxPrice === 50000
    },
    {
      id: 8,
      query: "bikes near chennai",
      check: (analysis) =>
        analysis.filters.category === 'vehicles' &&
        analysis.filters.vehicleType === 'two_wheeler' &&
        /chennai/i.test(analysis.filters.city)
    },
    {
      id: 9,
      query: "bikes in banglore",
      check: (analysis) =>
        analysis.filters.category === 'vehicles' &&
        analysis.filters.vehicleType === 'two_wheeler' &&
        /bengaluru/i.test(analysis.filters.city)
    },
    {
      id: 10,
      query: "cars under 8 lakh in Bangalore",
      check: (analysis) =>
        analysis.filters.category === 'vehicles' &&
        analysis.filters.vehicleType === 'four_wheeler' &&
        analysis.filters.maxPrice === 800000 &&
        /bengaluru/i.test(analysis.filters.city)
    },
    {
      id: 11,
      query: "software jobs in bangalore",
      check: (analysis) =>
        analysis.filters.category === 'jobs' &&
        /bengaluru/i.test(analysis.filters.city)
    },
    {
      id: 12,
      query: "developer jobs in Bengaluru",
      check: (analysis) =>
        analysis.filters.category === 'jobs' &&
        /bengaluru/i.test(analysis.filters.city)
    },
    {
      id: 13,
      query: "plumber in coimbatore",
      check: (analysis) =>
        analysis.filters.category === 'services' &&
        analysis.filters.serviceType === 'plumber' &&
        /coimbatore/i.test(analysis.filters.city)
    },
    {
      id: 14,
      query: "services in coimbator",
      check: (analysis) =>
        analysis.filters.category === 'services' &&
        /coimbatore/i.test(analysis.filters.city)
    },
    {
      id: 15,
      query: "agriculture land in coimbatore",
      check: (analysis) =>
        (analysis.filters.category === 'farm' || analysis.filters.category === 'properties') &&
        /coimbatore/i.test(analysis.filters.city)
    },
    {
      id: 16,
      query: "mobile phones under 20000",
      check: (analysis) =>
        analysis.filters.category === 'products' &&
        analysis.filters.maxPrice === 20000
    },
    {
      id: 17,
      query: "show me properties",
      check: (analysis) =>
        analysis.filters.category === 'properties'
    },
    {
      id: 18,
      query: "show cheaper properties",
      check: (analysis) =>
        analysis.filters.sortBy === 'price_asc' || analysis.filters.refineCheaper
    },
    {
      id: 19,
      query: "2bhk",
      check: (analysis) =>
        analysis.filters.bedrooms === '2 BHK'
    },
    {
      id: 20,
      query: "Hi",
      check: (analysis) =>
        analysis.intent === 'GREETING'
    }
  ];

  let passed = 0;
  let failed = 0;

  for (const t of testQueries) {
    const analysis = buyerIntentService.analyzeMessage(t.query, {});
    const isOk = t.check(analysis);
    if (isOk) {
      console.log(`[PASS] Test #${t.id}: "${t.query}" -> Intent: ${analysis.intent}, Filters:`, analysis.filters);
      passed++;
    } else {
      console.error(`[FAIL] Test #${t.id}: "${t.query}" -> Intent: ${analysis.intent}, Filters:`, analysis.filters);
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
    console.log('✓ PASS: Topic shift cleanly isolated! Location (Chennai) was NOT wrongly carried over to laptops.');
    passed++;
  } else {
    console.error('❌ FAIL: Topic shift failed to clear previous property/location context.');
    failed++;
  }

  console.log('\n====================================================');
  console.log(`RESULTS: ${passed} PASSED, ${failed} FAILED`);
  console.log('====================================================\n');

  process.exit(failed > 0 ? 1 : 0);
}

runUnitAcceptanceTests();
