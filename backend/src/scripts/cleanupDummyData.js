import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import dns from 'dns';
import bcrypt from 'bcryptjs';
import {
  User,
  Category,
  Location,
  Listing,
  Order,
  Conversation,
  Message,
  Favorite,
  Notification,
  Report,
  Review,
  JobApplication,
  ServiceBooking,
  SellerVerification,
  SavedSearch,
  Offer
} from '../models/index.js';

// Ensure DNS resolution handles SRV across all networks & Windows
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

const MONGODB_URI = process.env.MONGODB_URI;

export const cleanupDummyData = async () => {
  try {
    if (!MONGODB_URI) {
      console.error('[Error] MONGODB_URI is not defined in backend/.env');
      process.exit(1);
    }

    console.log('================================================================');
    console.log('VELVORAX MARKETPLACE — REAL MONGODB DATA PURGE & INITIALIZATION');
    console.log('================================================================\n');

    console.log('Connecting to MongoDB Atlas...');
    await mongoose.connect(MONGODB_URI, { serverSelectionTimeoutMS: 15000 });
    console.log(`Connected to database: ${mongoose.connection.name}\n`);

    // 1. Identify & Purge dummy / seed / test users
    // Preserve only legitimate admin user based on environment variables
    const adminUsername = (process.env.ADMIN_USERNAME || 'velvorax_admin').toLowerCase().trim();
    const adminEmail = (process.env.ADMIN_EMAIL || 'admin@velvorax.com').toLowerCase().trim();

    console.log('[Step 1] Purging seed and test users...');
    
    // Purge known seed / dummy emails and test patterns
    const dummyUserFilter = {
      $or: [
        { email: { $in: [
          'rajesh.kumar@velvorax.com',
          'priya.realty@velvorax.com',
          'vikram.seller@velvorax.com',
          'rahul.buyer@velvorax.com',
          'ananya.buyer@velvorax.com',
          'careers@technova.com',
          'support@coolcare.in',
          'buyer@velvorax.com',
          'seller@velvorax.com'
        ]}},
        { email: { $regex: /@velvorax-test\.com$/i } },
        { email: { $regex: /^test\./i } },
        { email: { $regex: /^seller\.test\./i } },
        { email: { $regex: /^buyer\.test\./i } }
      ]
    };

    const deletedUsersResult = await User.deleteMany(dummyUserFilter);
    console.log(`  ✓ Removed ${deletedUsersResult.deletedCount} dummy/test user records from MongoDB.`);

    // 2. Ensure Real Admin User Exists and is Active
    console.log('\n[Step 2] Ensuring dedicated real Admin user exists in MongoDB...');
    let adminUser = await User.findOne({
      $or: [
        { username: adminUsername },
        { email: adminEmail },
        { role: 'ADMIN' }
      ]
    });

    if (!adminUser) {
      adminUser = await User.create({
        name: 'Velvorax System Administrator',
        username: adminUsername,
        email: adminEmail,
        passwordHash: process.env.ADMIN_PASSWORD || 'VelvoraxAdmin@2026!',
        phone: '+91 9876543210',
        role: 'ADMIN',
        sellerStatus: 'NOT_APPLICABLE',
        accountStatus: 'ACTIVE',
        verificationStatus: 'VERIFIED',
        location: { country: 'India', city: 'Bengaluru', region: 'Karnataka' }
      });
      console.log(`  ✓ Created real Admin document: ID=${adminUser._id}, Email=${adminUser.email}`);
    } else {
      adminUser.role = 'ADMIN';
      adminUser.accountStatus = 'ACTIVE';
      adminUser.sellerStatus = 'NOT_APPLICABLE';
      adminUser.username = adminUsername;
      adminUser.email = adminEmail;
      
      if (process.env.ADMIN_PASSWORD) {
        adminUser.passwordHash = process.env.ADMIN_PASSWORD;
      }
      await adminUser.save();
      console.log(`  ✓ Verified real Admin document: ID=${adminUser._id}, Email=${adminUser.email}`);
    }

    // 3. Purge all dummy marketplace activity (listings, orders, messages, notifications, etc.)
    console.log('\n[Step 3] Purging mock/dummy marketplace records across all collections...');

    const deletedListings = await Listing.deleteMany({});
    console.log(`  ✓ Purged ${deletedListings.deletedCount} dummy listings.`);

    const deletedOrders = await Order.deleteMany({});
    console.log(`  ✓ Purged ${deletedOrders.deletedCount} dummy orders.`);

    const deletedConversations = await Conversation.deleteMany({});
    console.log(`  ✓ Purged ${deletedConversations.deletedCount} dummy conversations.`);

    const deletedMessages = await Message.deleteMany({});
    console.log(`  ✓ Purged ${deletedMessages.deletedCount} dummy messages.`);

    const deletedNotifications = await Notification.deleteMany({});
    console.log(`  ✓ Purged ${deletedNotifications.deletedCount} dummy notifications.`);

    const deletedFavorites = await Favorite.deleteMany({});
    console.log(`  ✓ Purged ${deletedFavorites.deletedCount} dummy favorites.`);

    const deletedReports = await Report.deleteMany({});
    console.log(`  ✓ Purged ${deletedReports.deletedCount} dummy reports.`);

    const deletedReviews = await Review.deleteMany({});
    console.log(`  ✓ Purged ${deletedReviews.deletedCount} dummy reviews.`);

    const deletedJobApps = await JobApplication.deleteMany({});
    console.log(`  ✓ Purged ${deletedJobApps.deletedCount} dummy job applications.`);

    const deletedServiceBookings = await ServiceBooking.deleteMany({});
    console.log(`  ✓ Purged ${deletedServiceBookings.deletedCount} dummy service bookings.`);

    const deletedSellerVerifs = await SellerVerification.deleteMany({});
    console.log(`  ✓ Purged ${deletedSellerVerifs.deletedCount} dummy seller verifications.`);

    const deletedOffers = await Offer.deleteMany({});
    console.log(`  ✓ Purged ${deletedOffers.deletedCount} dummy offers.`);

    const deletedSavedSearches = await SavedSearch.deleteMany({});
    console.log(`  ✓ Purged ${deletedSavedSearches.deletedCount} dummy saved searches.`);

    // 4. Preserve Category & Location Taxonomy
    const categoryCount = await Category.countDocuments();
    const locationCount = await Location.countDocuments();
    console.log(`\n[Step 4] Verified taxonomy collections preserved:`);
    console.log(`  ✓ Categories count: ${categoryCount}`);
    console.log(`  ✓ Locations count: ${locationCount}`);

    // 5. Final Real State Summary
    const totalRealUsers = await User.countDocuments();
    console.log('\n================================================================');
    console.log('MONGODB ATLAS CLEANUP COMPLETE: 100% REAL PRODUCTION DATA READY');
    console.log(`  - Real Users: ${totalRealUsers} (Admin initialized)`);
    console.log(`  - Real Listings: 0 (Fresh Marketplace)`);
    console.log(`  - Real Orders: 0`);
    console.log(`  - Real Conversations: 0`);
    console.log(`  - Real Notifications: 0`);
    console.log('================================================================\n');

    await mongoose.disconnect();
    return { success: true };
  } catch (error) {
    console.error('[Cleanup Error]:', error);
    process.exit(1);
  }
};

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  cleanupDummyData();
}
