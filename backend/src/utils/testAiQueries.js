import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import dns from 'dns';
import { Listing, Category, Location } from '../models/index.js';
import { buyerIntentService } from '../services/ai/buyerIntent.service.js';
import { buyerAiService } from '../services/ai/buyerAi.service.js';

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

async function run() {
  await mongoose.connect(process.env.MONGODB_URI);
  console.log('Connected to MongoDB.');

  const totalListings = await Listing.countDocuments();
  const approvedListings = await Listing.countDocuments({ status: 'APPROVED' });
  console.log(`Total Listings in DB: ${totalListings}, Approved: ${approvedListings}`);

  const sampleApproved = await Listing.find({ status: 'APPROVED' }).select('title categorySlug subcategoryName location.city price details');
  console.log('Approved sample listings:');
  sampleApproved.forEach(l => {
    console.log(`- [${l.categorySlug}] "${l.title}" in ${l.location?.city} for ₹${l.price}`, l.details);
  });

  const testQueries = [
    'Find 2BHK apartments in Coimbatore',
    '2bhk in Coimbatore',
    'properties in bangalore',
    'Software jobs in Bangalore',
    'developer jobs in Bengaluru',
    'Laptops under ₹50,000',
    'Laptops under 50000 in Chennai',
    'Bikes near Chennai',
    'Cars under 8 lakh',
    'two wheeler'
  ];

  console.log('\n--- TESTING BUYER INTENT SERVICE ---');
  for (const q of testQueries) {
    const analysis = buyerIntentService.analyzeMessage(q, {});
    console.log(`\nQuery: "${q}"`);
    console.log('Extracted Filters:', JSON.stringify(analysis.filters));
    const label = buyerAiService.constructDescriptiveLabel(analysis.filters);
    console.log('Constructed Label:', label);
  }

  await mongoose.disconnect();
}

run().catch(console.error);
