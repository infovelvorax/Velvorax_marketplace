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
import { Category, Location, User, Listing } from '../src/models/index.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, '../.env') });

async function inspect() {
  await mongoose.connect(process.env.MONGODB_URI);
  console.log('Connected to MongoDB:', mongoose.connection.name);

  const categories = await Category.find({}).lean();
  console.log(`\n=== CATEGORIES (${categories.length}) ===`);
  categories.forEach(c => {
    console.log(`- [${c._id}] ${c.name} (slug: '${c.slug}', type: '${c.type}')`);
    if (c.subcategories && c.subcategories.length > 0) {
      console.log(`  Subcategories: ${c.subcategories.map(s => `${s.name} (${s.slug})`).join(', ')}`);
    }
  });

  const locations = await Location.find({}).lean();
  console.log(`\n=== LOCATIONS (${locations.length}) ===`);
  locations.forEach(loc => {
    console.log(`- Country: ${loc.countryName} (${loc.countryCode})`);
    loc.regions?.forEach(r => {
      console.log(`  Region: ${r.name} -> Cities: ${r.cities?.map(c => c.name).join(', ')}`);
    });
  });

  const users = await User.find({}).lean();
  console.log(`\n=== USERS (${users.length}) ===`);
  users.forEach(u => {
    console.log(`- [${u._id}] ${u.name} | ${u.email} | role: ${u.role} | sellerStatus: ${u.sellerStatus}`);
  });

  const listingsCount = await Listing.countDocuments();
  const testListingsCount = await Listing.countDocuments({ $or: [{ isTestData: true }, { seedSource: 'buyer-ai-test' }] });
  console.log(`\n=== LISTINGS ===`);
  console.log(`Total listings: ${listingsCount}`);
  console.log(`Test listings: ${testListingsCount}`);

  await mongoose.disconnect();
}

inspect().catch(err => {
  console.error('Inspection error:', err);
  process.exit(1);
});
