import { buyerIntentService } from '../src/services/ai/buyerIntent.service.js';

const testQueries = [
  "two wheeler",
  "bikes under 80000",
  "bikes in Chennai",
  "cars under 8 lakh",
  "cars in Bangalore",
  "Find 2BHK apartments in Coimbatore",
  "3BHK under 50 lakhs in Bengaluru",
  "properties in Bangalore",
  "Laptops under ₹50,000",
  "MacBook under 1 lakh",
  "phones under 30000",
  "Software jobs in Bangalore",
  "React developer jobs",
  "plumber in Coimbatore",
  "electrician in Chennai",
  "AC repair in Bangalore",
  "tractors under 5 lakh",
  "agriculture equipment near Coimbatore",
  "businesses in Chennai",
  "houses for rent in Bangalore",
  "free furniture in Coimbatore"
];

console.log('=== TESTING BUYER INTENT PARSING ===\n');
testQueries.forEach((q, idx) => {
  const res = buyerIntentService.analyzeMessage(q);
  console.log(`[Query ${idx + 1}] "${q}"`);
  console.log(`  Intent: ${res.intent}`);
  console.log(`  Filters:`, JSON.stringify(res.filters));
  console.log('');
});
