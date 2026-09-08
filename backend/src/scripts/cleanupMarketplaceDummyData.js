import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import dns from 'dns';
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

// Configure DNS resolution for Atlas SRV
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

export const cleanupMarketplaceDummyData = async (isConfirmed = false) => {
  try {
    if (!MONGODB_URI) {
      console.error('[Error] MONGODB_URI is not defined in backend/.env');
      process.exit(1);
    }

    console.log('================================================================');
    console.log('VELVORAX MARKETPLACE — DATABASE AUDIT & CONTROLLED DATA CLEANUP');
    console.log('================================================================\n');

    console.log('Connecting to MongoDB Atlas...');
    await mongoose.connect(MONGODB_URI, { serverSelectionTimeoutMS: 15000 });
    const currentDbName = mongoose.connection.name;
    console.log(`Connected to Target Database: [ ${currentDbName} ]\n`);

    if (currentDbName !== 'velvorax') {
      console.warn(`[WARNING] Target database is "${currentDbName}". Expected "velvorax".`);
      console.warn(`Please ensure MONGODB_URI in backend/.env includes "/velvorax".\n`);
    }

    // 1. Identify seed / dummy / mock accounts vs real admin
    const adminUsername = (process.env.ADMIN_USERNAME || 'velvorax_admin').toLowerCase().trim();
    const adminEmail = (process.env.ADMIN_EMAIL || 'info.velvorax@gmail.com').toLowerCase().trim();

    const dummyUserFilter = {
      $and: [
        {
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
            { email: { $regex: /@velvorax-real\.com$/i } },
            { email: { $regex: /^test\./i } },
            { email: { $regex: /^seller\.test\./i } },
            { email: { $regex: /^buyer\.test\./i } },
            { email: { $regex: /^seller\.prod\./i } },
            { email: { $regex: /^buyer\.prod\./i } }
          ]
        },
        // Safeguard: Never target the real administrator
        { email: { $ne: adminEmail } },
        { username: { $ne: adminUsername } }
      ]
    };

    const dummyUsersCount = await User.countDocuments(dummyUserFilter);
    const totalUsersCount = await User.countDocuments();
    const listingsCount = await Listing.countDocuments();
    const ordersCount = await Order.countDocuments();
    const convosCount = await Conversation.countDocuments();
    const notifsCount = await Notification.countDocuments();
    const categoriesCount = await Category.countDocuments();
    const locationsCount = await Location.countDocuments();

    console.log('[DATABASE AUDIT SUMMARY]:');
    console.log(`  - Database Name: "${currentDbName}"`);
    console.log(`  - Total Users: ${totalUsersCount} (${dummyUsersCount} identifiable test/dummy users)`);
    console.log(`  - Total Listings: ${listingsCount}`);
    console.log(`  - Total Orders: ${ordersCount}`);
    console.log(`  - Total Conversations: ${convosCount}`);
    console.log(`  - Total Notifications: ${notifsCount}`);
    console.log(`  - Marketplace Categories: ${categoriesCount}`);
    console.log(`  - Marketplace Locations: ${locationsCount}`);

    // If confirmation flag was not provided, perform dry run only
    if (!isConfirmed) {
      console.log('\n----------------------------------------------------------------');
      console.log('[DRY-RUN MODE / PREVIEW ONLY]');
      console.log('No records were deleted because confirmation was not provided.');
      console.log('To perform the cleanup, run with the --confirm flag:');
      console.log('  node src/scripts/cleanupMarketplaceDummyData.js --confirm');
      console.log('----------------------------------------------------------------\n');
      await mongoose.disconnect();
      return { dryRun: true };
    }

    console.log('\n[CONFIRMATION DETECTED] Proceeding with controlled marketplace cleanup...');

    // A. Delete identified dummy users
    const delUsersRes = await User.deleteMany(dummyUserFilter);
    console.log(`  ✓ Removed ${delUsersRes.deletedCount} dummy/test user records.`);

    // B. Ensure real Admin exists in velvorax.users
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
        passwordHash: process.env.ADMIN_PASSWORD || 'vmprv_2022',
        phone: '+91 9876543210',
        role: 'ADMIN',
        sellerStatus: 'NOT_APPLICABLE',
        accountStatus: 'ACTIVE',
        verificationStatus: 'VERIFIED',
        location: { country: 'India', city: 'Bengaluru', region: 'Karnataka' }
      });
      console.log(`  ✓ Created Real Admin user in ${currentDbName}.users: ${adminUser.email}`);
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
      console.log(`  ✓ Verified Real Admin user in ${currentDbName}.users: ${adminUser.email}`);
    }

    // C. Remove mock listings, orders, messages, notifications, favorites
    const delListings = await Listing.deleteMany({});
    const delOrders = await Order.deleteMany({});
    const delConvos = await Conversation.deleteMany({});
    const delMessages = await Message.deleteMany({});
    const delNotifs = await Notification.deleteMany({});
    const delFavs = await Favorite.deleteMany({});
    const delReports = await Report.deleteMany({});
    const delReviews = await Review.deleteMany({});
    const delJobApps = await JobApplication.deleteMany({});
    const delServiceBookings = await ServiceBooking.deleteMany({});
    const delSellerVerifs = await SellerVerification.deleteMany({});
    const delOffers = await Offer.deleteMany({});
    const delSavedSearches = await SavedSearch.deleteMany({});

    console.log(`  ✓ Purged ${delListings.deletedCount} dummy listings.`);
    console.log(`  ✓ Purged ${delOrders.deletedCount} dummy orders.`);
    console.log(`  ✓ Purged ${delConvos.deletedCount} dummy conversations.`);
    console.log(`  ✓ Purged ${delMessages.deletedCount} dummy messages.`);
    console.log(`  ✓ Purged ${delNotifs.deletedCount} dummy notifications.`);

    // D. Seed Taxonomy if empty in velvorax database
    if (categoriesCount === 0) {
      console.log('  ➜ Initializing official marketplace categories in velvorax database...');
      await Category.create([
        {
          name: 'Properties',
          slug: 'properties',
          icon: 'home',
          description: 'Apartments, Houses, Commercial Spaces, Land, and PG Accommodations',
          type: 'PROPERTY',
          featured: true,
          order: 1,
          subcategories: [
            { name: 'For Sale: Houses & Apartments', slug: 'for-sale-houses-apartments' },
            { name: 'For Rent: Houses & Apartments', slug: 'for-rent-houses-apartments' },
            { name: 'Lands & Plots', slug: 'lands-plots' },
            { name: 'Commercial & Office Spaces', slug: 'commercial-office-spaces' },
            { name: 'PG & Guest Houses', slug: 'pg-guest-houses' }
          ]
        },
        {
          name: 'Vehicles',
          slug: 'vehicles',
          icon: 'truck',
          description: 'Cars, Motorcycles, Scooters, Commercial Vehicles, and Auto Parts',
          type: 'VEHICLE',
          featured: true,
          order: 2,
          subcategories: [
            { name: 'Cars', slug: 'cars' },
            { name: 'Motorcycles & Scooters', slug: 'motorcycles-scooters' },
            { name: 'Commercial Vehicles', slug: 'commercial-vehicles' },
            { name: 'Spare Parts & Accessories', slug: 'spare-parts-accessories' }
          ]
        },
        {
          name: 'Mobiles & Electronics',
          slug: 'products',
          icon: 'device-mobile',
          description: 'Smartphones, Tablets, Laptops, Cameras, TVs, and Audio Equipment',
          type: 'PRODUCT',
          featured: true,
          order: 3,
          subcategories: [
            { name: 'Mobile Phones', slug: 'mobile-phones' },
            { name: 'Laptops & Computers', slug: 'laptops-computers' },
            { name: 'TVs, Video & Audio', slug: 'tvs-video-audio' },
            { name: 'Cameras & Lenses', slug: 'cameras-lenses' },
            { name: 'Gaming Consoles & Accessories', slug: 'gaming' }
          ]
        },
        {
          name: 'Jobs',
          slug: 'jobs',
          icon: 'briefcase',
          description: 'Full Time, Remote, Tech, Sales, Marketing, and Skilled Trades',
          type: 'JOB',
          featured: true,
          order: 4,
          subcategories: [
            { name: 'IT & Software', slug: 'it-software' },
            { name: 'Marketing & Sales', slug: 'marketing-sales' },
            { name: 'Finance & Accounting', slug: 'finance-accounting' },
            { name: 'Customer Support', slug: 'customer-support' },
            { name: 'Design & Creative', slug: 'design-creative' }
          ]
        },
        {
          name: 'Services',
          slug: 'services',
          icon: 'wrench',
          description: 'Home Cleaning, AC Repair, Electrical, Plumbing, Carpentry, and Repairs',
          type: 'SERVICE',
          featured: true,
          order: 5,
          subcategories: [
            { name: 'AC & Appliance Repair', slug: 'ac-appliance-repair' },
            { name: 'Home Deep Cleaning', slug: 'home-deep-cleaning' },
            { name: 'Electricians & Plumbers', slug: 'electricians-plumbers' },
            { name: 'Carpentry & Furniture Repair', slug: 'carpentry' },
            { name: 'Packers & Movers', slug: 'packers-movers' }
          ]
        },
        {
          name: 'Agriculture',
          slug: 'farm',
          icon: 'leaf',
          description: 'Crops, Seeds, Tractors, Farm Tools, Livestock, and Agricultural Land',
          type: 'AGRICULTURE',
          featured: true,
          order: 6,
          subcategories: [
            { name: 'Tractors & Farm Machinery', slug: 'tractors-machinery' },
            { name: 'Crops, Seeds & Fertilizers', slug: 'crops-seeds-fertilizers' },
            { name: 'Livestock & Poultry', slug: 'livestock-poultry' },
            { name: 'Agricultural Land & Farms', slug: 'agricultural-land' }
          ]
        },
        {
          name: 'Businesses',
          slug: 'businesses',
          icon: 'building-storefront',
          description: 'Local Business Directory, Wholesale, Franchises, and Commercial Services',
          type: 'BUSINESS',
          featured: true,
          order: 7,
          subcategories: [
            { name: 'Cafes, Restaurants & Food', slug: 'food-restaurants' },
            { name: 'Retail Shops & Showrooms', slug: 'retail-shops' },
            { name: 'Automotive Garages & Centers', slug: 'auto-centers' },
            { name: 'Franchises & Businesses for Sale', slug: 'businesses-for-sale' }
          ]
        },
        {
          name: 'Furniture',
          slug: 'furniture',
          icon: 'table',
          description: 'Sofas, Dining Tables, Beds, Wardrobes, and Office Furniture',
          type: 'PRODUCT',
          featured: false,
          order: 8,
          subcategories: [
            { name: 'Sofa & Dining', slug: 'sofa-dining' },
            { name: 'Beds & Wardrobes', slug: 'beds-wardrobes' },
            { name: 'Home Decor & Lighting', slug: 'home-decor' },
            { name: 'Office Furniture', slug: 'office-furniture' }
          ]
        },
        {
          name: 'Fashion',
          slug: 'fashion',
          icon: 'sparkles',
          description: 'Clothing, Footwear, Watches, Jewelry, and Luxury Accessories',
          type: 'PRODUCT',
          featured: false,
          order: 9,
          subcategories: [
            { name: 'Men Fashion', slug: 'men-fashion' },
            { name: 'Women Fashion', slug: 'women-fashion' },
            { name: 'Watches & Jewelry', slug: 'watches-jewelry' }
          ]
        },
        {
          name: 'Books & Hobbies',
          slug: 'books-hobbies',
          icon: 'book-open',
          description: 'Books, Musical Instruments, Sports Gear, and Collectibles',
          type: 'PRODUCT',
          featured: false,
          order: 10,
          subcategories: [
            { name: 'Books & Textbooks', slug: 'books' },
            { name: 'Musical Instruments', slug: 'musical-instruments' },
            { name: 'Sports & Fitness Equipment', slug: 'sports-fitness' }
          ]
        },
        {
          name: 'Pets',
          slug: 'pets',
          icon: 'heart',
          description: 'Pet Food, Accessories, Aquariums, and Pet Care Essentials',
          type: 'PRODUCT',
          featured: false,
          order: 11,
          subcategories: [
            { name: 'Pet Food & Accessories', slug: 'pet-food-accessories' },
            { name: 'Aquariums & Fish', slug: 'aquariums' }
          ]
        }
      ]);
      console.log('  ✓ Seeded official categories into velvorax database.');
    }

    if (locationsCount === 0) {
      console.log('  ➜ Initializing official marketplace locations in velvorax database...');
      await Location.create([
        {
          countryName: 'India',
          countryCode: 'IN',
          currency: 'INR',
          currencySymbol: '₹',
          popular: true,
          regions: [
            {
              name: 'Karnataka',
              slug: 'karnataka',
              cities: [
                {
                  name: 'Bengaluru',
                  slug: 'bengaluru',
                  popular: true,
                  localAreas: [
                    { name: 'Koramangala', slug: 'koramangala' },
                    { name: 'Indiranagar', slug: 'indiranagar' },
                    { name: 'Whitefield', slug: 'whitefield' },
                    { name: 'HSR Layout', slug: 'hsr-layout' }
                  ]
                }
              ]
            },
            {
              name: 'Tamil Nadu',
              slug: 'tamil-nadu',
              cities: [
                {
                  name: 'Chennai',
                  slug: 'chennai',
                  popular: true,
                  localAreas: [
                    { name: 'Anna Nagar', slug: 'anna-nagar' },
                    { name: 'T Nagar', slug: 't-nagar' },
                    { name: 'OMR', slug: 'omr' }
                  ]
                }
              ]
            },
            {
              name: 'Maharashtra',
              slug: 'maharashtra',
              cities: [
                {
                  name: 'Mumbai',
                  slug: 'mumbai',
                  popular: true,
                  localAreas: [
                    { name: 'Bandra West', slug: 'bandra-west' },
                    { name: 'Andheri East', slug: 'andheri-east' },
                    { name: 'Juhu', slug: 'juhu' }
                  ]
                }
              ]
            },
            {
              name: 'Telangana',
              slug: 'telangana',
              cities: [
                {
                  name: 'Hyderabad',
                  slug: 'hyderabad',
                  popular: true,
                  localAreas: [
                    { name: 'Gachibowli', slug: 'gachibowli' },
                    { name: 'Hitec City', slug: 'hitec-city' }
                  ]
                }
              ]
            }
          ]
        },
        {
          countryName: 'United States',
          countryCode: 'US',
          currency: 'USD',
          currencySymbol: '$',
          popular: true,
          regions: [
            {
              name: 'California',
              slug: 'california',
              cities: [
                {
                  name: 'San Francisco',
                  slug: 'san-francisco',
                  popular: true,
                  localAreas: [{ name: 'SOMA', slug: 'soma' }]
                }
              ]
            },
            {
              name: 'New York',
              slug: 'new-york',
              cities: [
                {
                  name: 'New York City',
                  slug: 'new-york-city',
                  popular: true,
                  localAreas: [{ name: 'Manhattan', slug: 'manhattan' }]
                }
              ]
            }
          ]
        },
        {
          countryName: 'United Arab Emirates',
          countryCode: 'AE',
          currency: 'AED',
          currencySymbol: 'AED',
          popular: true,
          regions: [
            {
              name: 'Dubai',
              slug: 'dubai',
              cities: [
                {
                  name: 'Dubai',
                  slug: 'dubai',
                  popular: true,
                  localAreas: [{ name: 'Downtown Dubai', slug: 'downtown-dubai' }]
                }
              ]
            }
          ]
        },
        {
          countryName: 'United Kingdom',
          countryCode: 'GB',
          currency: 'GBP',
          currencySymbol: '£',
          popular: true,
          regions: [
            {
              name: 'England',
              slug: 'england',
              cities: [
                {
                  name: 'London',
                  slug: 'london',
                  popular: true,
                  localAreas: [{ name: 'Westminster', slug: 'westminster' }]
                }
              ]
            }
          ]
        }
      ]);
      console.log('  ✓ Seeded official locations into velvorax database.');
    }

    console.log('\n================================================================');
    console.log(`DEDICATED DATABASE [ ${currentDbName} ] INITIALIZED & READY!`);
    console.log('================================================================\n');

    await mongoose.disconnect();
    return { success: true };
  } catch (error) {
    console.error('[Cleanup Error]:', error);
    process.exit(1);
  }
};

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const hasConfirm = process.argv.includes('--confirm') || process.argv.includes('--force');
  cleanupMarketplaceDummyData(hasConfirm);
}
