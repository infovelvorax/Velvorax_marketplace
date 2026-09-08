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
import { Listing, User } from '../models/index.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

const MONGODB_URI = process.env.MONGODB_URI;

export async function cleanMarketplaceSeed() {
  try {
    if (!MONGODB_URI) {
      console.error('[Error] MONGODB_URI is not defined in backend/.env');
      process.exit(1);
    }

    console.log('Connecting to MongoDB Atlas for Marketplace Clean...');
    await mongoose.connect(MONGODB_URI, { serverSelectionTimeoutMS: 15000 });
    console.log(`Connected to database: ${mongoose.connection.name}`);

    // Verify real listings before cleanup
    const realListingsBefore = await Listing.countDocuments({
      isTestData: { $ne: true },
      seedSource: { $ne: 'buyer-ai-test' }
    });
    const realUsersBefore = await User.countDocuments({
      isTestData: { $ne: true },
      seedSource: { $ne: 'buyer-ai-test' }
    });

    console.log(`Current real listings count (protected): ${realListingsBefore}`);
    console.log(`Current real users count (protected): ${realUsersBefore}`);

    // Target ONLY listings with test markers
    const deleteResult = await Listing.deleteMany({
      $or: [
        { seedSource: 'buyer-ai-test' },
        { isTestData: true },
        { seedId: { $regex: /^buyer-ai-test-/ } }
      ]
    });

    // Delete ONLY test users created specifically for this seed
    const userDeleteResult = await User.deleteMany({
      $or: [
        { seedSource: 'buyer-ai-test' },
        { email: 'test.merchant@velvorax.com' }
      ]
    });

    // Verify real listings after cleanup
    const realListingsAfter = await Listing.countDocuments({
      isTestData: { $ne: true },
      seedSource: { $ne: 'buyer-ai-test' }
    });
    const realUsersAfter = await User.countDocuments({
      isTestData: { $ne: true },
      seedSource: { $ne: 'buyer-ai-test' }
    });

    console.log('\n================================================================');
    console.log('MARKETPLACE TEST SEED CLEANUP RESULT');
    console.log('================================================================');
    console.log(`• Test Listings Deleted: ${deleteResult.deletedCount}`);
    console.log(`• Test Users Deleted: ${userDeleteResult.deletedCount}`);
    console.log(`• Real Listings Before: ${realListingsBefore} | Real Listings After: ${realListingsAfter} (Untouched: ${realListingsBefore === realListingsAfter})`);
    console.log(`• Real Users Before: ${realUsersBefore} | Real Users After: ${realUsersAfter} (Untouched: ${realUsersBefore === realUsersAfter})`);
    console.log('================================================================\n');

    return {
      success: true,
      deletedListings: deleteResult.deletedCount,
      realListingsUntouched: realListingsBefore === realListingsAfter
    };
  } catch (error) {
    console.error('Marketplace cleanup failed:', error);
    throw error;
  }
}

if (process.argv[1]?.endsWith('cleanMarketplaceSeed.js')) {
  cleanMarketplaceSeed()
    .then(() => {
      console.log('Cleanup finished.');
      process.exit(0);
    })
    .catch((err) => {
      console.error('Fatal cleanup error:', err);
      process.exit(1);
    });
}
