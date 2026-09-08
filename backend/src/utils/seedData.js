import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import bcrypt from 'bcryptjs';
import dns from 'dns';
import { User, Category, Location, Listing, Order, Conversation, Message, Favorite } from '../models/index.js';

// Ensure DNS resolution handles SRV and prioritizes IPv4 across all networks & Windows
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

export const seedDatabase = async () => {
  try {
    if (!MONGODB_URI) {
      console.error('[Database Error] MONGODB_URI is not configured in backend/.env');
      process.exit(1);
    }
    console.log('Connecting to MongoDB Atlas for seeding...');
    await mongoose.connect(MONGODB_URI, { serverSelectionTimeoutMS: 15000 });
    console.log('Connected to database:', mongoose.connection.name);

    // Clear existing collections
    await User.deleteMany({});
    await Category.deleteMany({});
    await Location.deleteMany({});
    await Listing.deleteMany({});
    await Order.deleteMany({});
    await Conversation.deleteMany({});
    await Message.deleteMany({});
    await Favorite.deleteMany({});
    console.log('Cleared existing collections.');

    // 1. Seed Locations
    const locations = await Location.create([
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
              },
              {
                name: 'Mysuru',
                slug: 'mysuru',
                popular: false,
                localAreas: [{ name: 'Gokulam', slug: 'gokulam' }]
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
                  { name: 'OMR', slug: 'omr' },
                  { name: 'Adyar', slug: 'adyar' }
                ]
              },
              {
                name: 'Coimbatore',
                slug: 'coimbatore',
                popular: true,
                localAreas: [{ name: 'RS Puram', slug: 'rs-puram' }]
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
              },
              {
                name: 'Pune',
                slug: 'pune',
                popular: true,
                localAreas: [
                  { name: 'Koregaon Park', slug: 'koregaon-park' },
                  { name: 'Kothrud', slug: 'kothrud' }
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
                  { name: 'Hitec City', slug: 'hitec-city' },
                  { name: 'Jubilee Hills', slug: 'jubilee-hills' }
                ]
              }
            ]
          },
          {
            name: 'Delhi NCR',
            slug: 'delhi-ncr',
            cities: [
              {
                name: 'New Delhi',
                slug: 'new-delhi',
                popular: true,
                localAreas: [
                  { name: 'Connaught Place', slug: 'connaught-place' },
                  { name: 'Hauz Khas', slug: 'hauz-khas' }
                ]
              },
              {
                name: 'Gurugram',
                slug: 'gurugram',
                popular: true,
                localAreas: [{ name: 'Cyber City', slug: 'cyber-city' }]
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
              },
              {
                name: 'Los Angeles',
                slug: 'los-angeles',
                popular: true,
                localAreas: [{ name: 'Downtown', slug: 'downtown' }]
              }
            ]
          },
          {
            name: 'Texas',
            slug: 'texas',
            cities: [
              {
                name: 'Houston',
                slug: 'houston',
                popular: true,
                localAreas: [{ name: 'Galleria', slug: 'galleria' }]
              },
              {
                name: 'Austin',
                slug: 'austin',
                popular: true,
                localAreas: [{ name: 'Downtown Austin', slug: 'downtown-austin' }]
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
                localAreas: [{ name: 'Manhattan', slug: 'manhattan' }, { name: 'Brooklyn', slug: 'brooklyn' }]
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
                localAreas: [{ name: 'Downtown Dubai', slug: 'downtown-dubai' }, { name: 'Dubai Marina', slug: 'dubai-marina' }]
              }
            ]
          },
          {
            name: 'Abu Dhabi',
            slug: 'abu-dhabi',
            cities: [
              {
                name: 'Abu Dhabi',
                slug: 'abu-dhabi',
                popular: true,
                localAreas: [{ name: 'Corniche', slug: 'corniche' }]
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
                localAreas: [{ name: 'Westminster', slug: 'westminster' }, { name: 'Canary Wharf', slug: 'canary-wharf' }]
              },
              {
                name: 'Manchester',
                slug: 'manchester',
                popular: true,
                localAreas: [{ name: 'City Centre', slug: 'city-centre' }]
              }
            ]
          }
        ]
      }
    ]);
    console.log(`Seeded ${locations.length} Countries with regions and cities.`);

    // 2. Seed Categories
    const categories = await Category.create([
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
    console.log(`Seeded ${categories.length} Categories with subcategories.`);

    // Map categories for quick lookup
    const catMap = {};
    categories.forEach(c => { catMap[c.slug] = c._id; });

    // 3. Seed Users with distinct roles
    const adminUser = await User.create({
      name: 'Velvorax Admin',
      username: (process.env.ADMIN_USERNAME || 'velvorax_admin').toLowerCase().trim(),
      email: (process.env.ADMIN_EMAIL || 'admin@velvorax.com').toLowerCase().trim(),
      passwordHash: process.env.ADMIN_PASSWORD || 'Password@123',
      phone: '+91 98765 43210',
      bio: 'Official Velvorax Marketplace Global Administration & Quality Team.',
      role: 'ADMIN',
      sellerStatus: 'NOT_APPLICABLE',
      accountStatus: 'ACTIVE',
      verificationStatus: 'VERIFIED',
      rating: 5.0,
      reviewCount: 48,
      location: { country: 'India', city: 'Bengaluru', region: 'Karnataka' }
    });

    const seller1 = await User.create({
      name: 'Rajesh Kumar',
      email: 'rajesh.kumar@velvorax.com',
      passwordHash: 'Password@123',
      phone: '+91 98450 11223',
      bio: 'Verified gadgets & vehicle seller in Bengaluru. Fast replies!',
      role: 'SELLER',
      sellerStatus: 'APPROVED',
      accountStatus: 'ACTIVE',
      verificationStatus: 'VERIFIED',
      rating: 4.9,
      reviewCount: 32,
      location: { country: 'India', city: 'Bengaluru', region: 'Karnataka', localArea: 'Indiranagar' }
    });

    const seller2 = await User.create({
      name: 'Priya Properties',
      email: 'priya.realty@velvorax.com',
      passwordHash: 'Password@123',
      phone: '+91 98111 22334',
      bio: 'Prime residential and commercial real estate solutions across Chennai and Hyderabad.',
      role: 'SELLER',
      sellerStatus: 'APPROVED',
      accountStatus: 'ACTIVE',
      verificationStatus: 'VERIFIED',
      rating: 4.8,
      reviewCount: 56,
      location: { country: 'India', city: 'Chennai', region: 'Tamil Nadu', localArea: 'Anna Nagar' }
    });

    const pendingSeller = await User.create({
      name: 'Vikram Real Estate',
      email: 'vikram.seller@velvorax.com',
      passwordHash: 'Password@123',
      phone: '+91 97777 88899',
      bio: 'Commercial developer and residential broker in Mumbai.',
      role: 'SELLER',
      sellerStatus: 'PENDING_APPROVAL',
      accountStatus: 'ACTIVE',
      verificationStatus: 'PENDING',
      rating: 5.0,
      reviewCount: 0,
      location: { country: 'India', city: 'Mumbai', region: 'Maharashtra', localArea: 'Bandra West' }
    });

    const sellerMain = await User.create({
      name: 'Sarah Seller',
      email: 'seller@velvorax.com',
      passwordHash: 'Password@123',
      phone: '+91 98450 99999',
      bio: 'Verified official merchant on Velvorax Marketplace.',
      role: 'SELLER',
      sellerStatus: 'APPROVED',
      accountStatus: 'ACTIVE',
      verificationStatus: 'VERIFIED',
      rating: 5.0,
      reviewCount: 40,
      location: { country: 'India', city: 'Bengaluru', region: 'Karnataka', localArea: 'Indiranagar' }
    });

    const buyerMain = await User.create({
      name: 'Sarah Buyer',
      email: 'buyer@velvorax.com',
      passwordHash: 'Password@123',
      phone: '+91 98222 88888',
      bio: 'Active buyer discovering properties and marketplace products.',
      role: 'BUYER',
      sellerStatus: 'NOT_APPLICABLE',
      accountStatus: 'ACTIVE',
      verificationStatus: 'VERIFIED',
      rating: 5.0,
      reviewCount: 15,
      location: { country: 'India', city: 'Bengaluru', region: 'Karnataka', localArea: 'Koramangala' }
    });

    const buyer1 = await User.create({
      name: 'Rahul Sharma',
      email: 'rahul.buyer@velvorax.com',
      passwordHash: 'Password@123',
      phone: '+91 98222 33445',
      bio: 'Tech enthusiast and active property seeker in Bengaluru.',
      role: 'BUYER',
      sellerStatus: 'NOT_APPLICABLE',
      accountStatus: 'ACTIVE',
      verificationStatus: 'VERIFIED',
      rating: 5.0,
      reviewCount: 12,
      location: { country: 'India', city: 'Bengaluru', region: 'Karnataka', localArea: 'Koramangala' }
    });

    const buyer2 = await User.create({
      name: 'Ananya Iyer',
      email: 'ananya.buyer@velvorax.com',
      passwordHash: 'Password@123',
      phone: '+91 98333 44556',
      bio: 'Verified buyer looking for electronics and automobiles.',
      role: 'BUYER',
      sellerStatus: 'NOT_APPLICABLE',
      accountStatus: 'ACTIVE',
      verificationStatus: 'UNVERIFIED',
      rating: 5.0,
      reviewCount: 4,
      location: { country: 'India', city: 'Chennai', region: 'Tamil Nadu', localArea: 'Adyar' }
    });

    const employer1 = await User.create({
      name: 'TechNova Global Solutions',
      email: 'careers@technova.com',
      passwordHash: 'TechNova@123',
      phone: '+91 80 4455 6677',
      bio: 'Next-generation cloud and AI software consultancy hiring globally.',
      role: 'EMPLOYER',
      sellerStatus: 'APPROVED',
      accountStatus: 'ACTIVE',
      verificationStatus: 'VERIFIED',
      rating: 4.9,
      reviewCount: 19,
      location: { country: 'India', city: 'Bengaluru', region: 'Karnataka' }
    });

    const provider1 = await User.create({
      name: 'CoolCare Home & AC Services',
      email: 'support@coolcare.in',
      passwordHash: 'CoolCare@123',
      phone: '+91 99000 88776',
      bio: 'Licensed HVAC & home maintenance technicians with 10+ years experience.',
      role: 'PROVIDER',
      sellerStatus: 'APPROVED',
      accountStatus: 'ACTIVE',
      verificationStatus: 'VERIFIED',
      rating: 4.9,
      reviewCount: 142,
      location: { country: 'India', city: 'Chennai', region: 'Tamil Nadu' }
    });

    const farmSeller1 = await User.create({
      name: 'Kisan Agro Ventures',
      email: 'kisan.agro@velvorax.com',
      passwordHash: 'Kisan@123456',
      phone: '+91 94440 33221',
      bio: 'Direct farm machinery, tractors, organic seeds, and farm lands.',
      role: 'SELLER',
      sellerStatus: 'APPROVED',
      accountStatus: 'ACTIVE',
      verificationStatus: 'VERIFIED',
      rating: 4.8,
      reviewCount: 27,
      location: { country: 'India', city: 'Coimbatore', region: 'Tamil Nadu' }
    });

    console.log('Seeded Users (Admin, Approved Sellers, Pending Sellers, Buyers).');

    // City Coordinates Dictionary
    const CITY_COORDINATES = {
      'Bengaluru': { lat: 12.9716, lng: 77.5946 },
      'Chennai': { lat: 13.0827, lng: 80.2707 },
      'Hyderabad': { lat: 17.3850, lng: 78.4867 },
      'Mumbai': { lat: 19.0760, lng: 72.8777 },
      'Pune': { lat: 18.5204, lng: 73.8567 },
      'New Delhi': { lat: 28.6139, lng: 77.2090 },
      'Gurugram': { lat: 28.4595, lng: 77.0266 },
      'Coimbatore': { lat: 11.0168, lng: 76.9558 },
      'Mysuru': { lat: 12.2958, lng: 76.6394 },
      'San Francisco': { lat: 37.7749, lng: -122.4194 },
      'Los Angeles': { lat: 34.0522, lng: -118.2437 },
      'Houston': { lat: 29.7604, lng: -95.3698 },
      'Austin': { lat: 30.2672, lng: -97.7431 },
      'New York City': { lat: 40.7128, lng: -74.0060 },
      'Dubai': { lat: 25.2048, lng: 55.2708 },
      'Abu Dhabi': { lat: 24.4539, lng: 54.3773 },
      'London': { lat: 51.5074, lng: -0.1278 },
      'Manchester': { lat: 53.4808, lng: -2.2426 }
    };

    // 4. Seed High Quality Listings
    const sampleListings = [
      // Properties
      {
        sellerId: sellerMain._id,
        categoryId: catMap['properties'],
        categorySlug: 'properties',
        subcategoryName: 'For Rent: Houses & Apartments',
        title: '3 BHK Luxury Apartment with Balcony & Modular Kitchen',
        description: 'Spacious 1850 sq.ft 3 BHK apartment in gated society with 24/7 security, clubhouse, swimming pool, power backup, and covered car parking. Near metro station.',
        listingType: 'RENT',
        condition: 'EXCELLENT',
        price: 38000,
        currency: 'INR',
        currencySymbol: '₹',
        location: { country: 'India', region: 'Karnataka', city: 'Bengaluru', localArea: 'Koramangala', address: '8th Main, 4th Block' },
        images: [
          'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?q=80&w=1200',
          'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?q=80&w=1200',
          'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?q=80&w=1200'
        ],
        featured: true,
        status: 'APPROVED',
        views: 450,
        favoritesCount: 18,
        details: {
          propertyType: 'Apartment',
          bedrooms: '3 BHK',
          bathrooms: '3',
          superBuiltupArea: '1850 sq.ft',
          furnishing: 'Semi-Furnished',
          parking: '2 Covered',
          amenities: ['Gym', 'Swimming Pool', 'Clubhouse', 'Power Backup', 'Lift', 'Security']
        }
      },
      {
        sellerId: sellerMain._id,
        categoryId: catMap['properties'],
        categorySlug: 'properties',
        subcategoryName: 'For Rent: Houses & Apartments',
        title: '2 BHK Modern Apartment in Gated Community for Rent',
        description: 'Well-ventilated 1250 sq.ft 2 BHK apartment in Hitec City, Hyderabad. Modular kitchen, 2 balconies, 100% power backup, and reserved parking.',
        listingType: 'RENT',
        condition: 'GOOD',
        price: 22000,
        currency: 'INR',
        currencySymbol: '₹',
        location: { country: 'India', region: 'Telangana', city: 'Hyderabad', localArea: 'Hitec City', address: 'Near Cyber Towers' },
        images: [
          'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?q=80&w=1200',
          'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?q=80&w=1200'
        ],
        featured: true,
        status: 'APPROVED',
        views: 610,
        favoritesCount: 35,
        details: {
          propertyType: 'Apartment',
          bedrooms: '2 BHK',
          bathrooms: '2',
          superBuiltupArea: '1250 sq.ft',
          furnishing: 'Semi-Furnished',
          parking: '1 Covered'
        }
      },
      {
        sellerId: seller2._id,
        categoryId: catMap['properties'],
        categorySlug: 'properties',
        subcategoryName: 'For Sale: Houses & Apartments',
        title: 'Modern 4 BHK Luxury Villa with Private Garden',
        description: 'Brand new 3200 sq.ft independent villa with private lawn, Italian marble flooring, solar heating, EV charger, and smart home automation.',
        listingType: 'SELL',
        condition: 'NEW',
        price: 24500000,
        currency: 'INR',
        currencySymbol: '₹',
        location: { country: 'India', region: 'Tamil Nadu', city: 'Chennai', localArea: 'OMR', address: 'Near Navalur Junction' },
        images: [
          'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?q=80&w=1200',
          'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?q=80&w=1200'
        ],
        featured: true,
        status: 'APPROVED',
        views: 890,
        favoritesCount: 42,
        details: {
          propertyType: 'Villa / Independent House',
          bedrooms: '4 BHK',
          bathrooms: '5',
          superBuiltupArea: '3200 sq.ft',
          furnishing: 'Fully Furnished',
          parking: '3 Cars',
          amenities: ['Private Garden', 'Smart Home Automation', 'Solar Power', 'EV Charger', 'CCTV']
        }
      },

      // Vehicles
      {
        sellerId: seller1._id,
        categoryId: catMap['vehicles'],
        categorySlug: 'vehicles',
        subcategoryName: 'Cars',
        title: 'Honda City ZX CVT Automatic 2022 Sunroof',
        description: 'Single owner, only 22,000 km driven with complete service history at authorised Honda dealership. Pristine condition with zero accident history and comprehensive insurance.',
        listingType: 'SELL',
        condition: 'EXCELLENT',
        price: 1285000,
        currency: 'INR',
        currencySymbol: '₹',
        location: { country: 'India', region: 'Karnataka', city: 'Bengaluru', localArea: 'Indiranagar' },
        images: [
          'https://images.unsplash.com/photo-1609521263047-f8f205293f24?q=80&w=1200',
          'https://images.unsplash.com/photo-1549399542-7e3f8b79c341?q=80&w=1200'
        ],
        featured: true,
        status: 'APPROVED',
        views: 620,
        favoritesCount: 29,
        details: {
          brand: 'Honda',
          model: 'City ZX',
          year: 2022,
          mileage: '22,000 km',
          fuel: 'Petrol',
          transmission: 'Automatic',
          owners: '1st Owner',
          insurance: 'Valid up to Dec 2026'
        }
      },
      {
        sellerId: seller1._id,
        categoryId: catMap['vehicles'],
        categorySlug: 'vehicles',
        subcategoryName: 'Cars',
        title: 'Toyota Urban Cruiser Hyryder Hybrid 2023 Automatic',
        description: 'Used Toyota Urban Cruiser Hyryder in immaculate condition. 18,500 km done, single owner, comprehensive insurance, dual-tone finish with panoramic sunroof.',
        listingType: 'SELL',
        condition: 'USED',
        price: 850000,
        currency: 'INR',
        currencySymbol: '₹',
        location: { country: 'India', region: 'Telangana', city: 'Hyderabad', localArea: 'Gachibowli' },
        images: [
          'https://images.unsplash.com/photo-1552519507-da3b142c6e3d?q=80&w=1200',
          'https://images.unsplash.com/photo-1549399542-7e3f8b79c341?q=80&w=1200'
        ],
        featured: true,
        status: 'APPROVED',
        views: 740,
        favoritesCount: 48,
        details: {
          brand: 'Toyota',
          model: 'Hyryder',
          year: 2023,
          mileage: '18,500 km',
          fuel: 'Hybrid',
          transmission: 'Automatic'
        }
      },
      {
        sellerId: seller1._id,
        categoryId: catMap['vehicles'],
        categorySlug: 'vehicles',
        subcategoryName: 'Motorcycles & Scooters',
        title: 'Royal Enfield Classic 350 Stealth Black 2023 Dual Channel ABS',
        description: 'Royal Enfield Classic 350 in mint condition. Just 6,500 km done. Fitted with original crash guard, touring seat, and sump guard. All services done on time.',
        listingType: 'SELL',
        condition: 'LIKE_NEW',
        price: 195000,
        currency: 'INR',
        currencySymbol: '₹',
        location: { country: 'India', region: 'Tamil Nadu', city: 'Chennai', localArea: 'T Nagar' },
        images: [
          'https://images.unsplash.com/photo-1558981403-c5f9899a28bc?q=80&w=1200',
          'https://images.unsplash.com/photo-1568772585407-9361f9bf3a87?q=80&w=1200'
        ],
        featured: false,
        status: 'APPROVED',
        views: 380,
        favoritesCount: 21,
        details: {
          brand: 'Royal Enfield',
          model: 'Classic 350',
          year: 2023,
          mileage: '6,500 km',
          fuel: 'Petrol',
          transmission: 'Manual'
        }
      },

      // Mobiles & Electronics
      {
        sellerId: seller1._id,
        categoryId: catMap['products'],
        categorySlug: 'products',
        subcategoryName: 'Mobile Phones',
        title: 'Apple iPhone 15 Pro 256GB Natural Titanium (Under Warranty)',
        description: 'Flawless condition iPhone 15 Pro, battery health 98%. Comes with original box, braided USB-C cable, Apple bill, and Spigen protective case.',
        listingType: 'SELL',
        condition: 'LIKE_NEW',
        price: 98000,
        currency: 'INR',
        currencySymbol: '₹',
        location: { country: 'India', region: 'Karnataka', city: 'Bengaluru', localArea: 'Whitefield' },
        images: [
          'https://images.unsplash.com/photo-1695048133142-1a20484d2569?q=80&w=1200',
          'https://images.unsplash.com/photo-1510557880182-3d4d3cba35a5?q=80&w=1200'
        ],
        featured: true,
        status: 'APPROVED',
        views: 940,
        favoritesCount: 54,
        details: {
          brand: 'Apple',
          storage: '256 GB',
          color: 'Natural Titanium',
          batteryHealth: '98%',
          warranty: 'Valid for 4 months'
        }
      },
      {
        sellerId: seller1._id,
        categoryId: catMap['products'],
        categorySlug: 'products',
        subcategoryName: 'Laptops & Computers',
        title: 'MacBook Pro 16" M3 Max 36GB RAM 1TB SSD Space Black',
        description: 'Unopened sealed box MacBook Pro with M3 Max 14-core CPU, 30-core GPU, 36GB Unified Memory, and 1TB SSD. Indian purchase invoice included.',
        listingType: 'SELL',
        condition: 'NEW',
        price: 285000,
        currency: 'INR',
        currencySymbol: '₹',
        location: { country: 'India', region: 'Maharashtra', city: 'Mumbai', localArea: 'Bandra West' },
        images: [
          'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?q=80&w=1200',
          'https://images.unsplash.com/photo-1611186871348-b1ce696e52c9?q=80&w=1200'
        ],
        featured: true,
        status: 'APPROVED',
        views: 512,
        favoritesCount: 38,
        details: {
          brand: 'Apple',
          processor: 'Apple M3 Max',
          ram: '36 GB',
          storage: '1 TB SSD',
          screenSize: '16.2 inch Liquid Retina XDR'
        }
      },

      // Jobs
      {
        sellerId: employer1._id,
        categoryId: catMap['jobs'],
        categorySlug: 'jobs',
        subcategoryName: 'IT & Software',
        title: 'Senior Full Stack React & Node.js Engineer (Remote)',
        description: 'TechNova is looking for an experienced Senior Full Stack Engineer proficient in React 19, TypeScript, Node.js, and MongoDB / PostgreSQL. Competitive global package with flexible working hours.',
        listingType: 'SELL', // Job posting
        condition: 'NOT_APPLICABLE',
        price: 1800000, // Annual CTC
        currency: 'INR',
        currencySymbol: '₹',
        location: { country: 'India', region: 'Karnataka', city: 'Bengaluru', address: 'Remote / Hybrid' },
        images: [
          'https://images.unsplash.com/photo-1498050108023-c5249f4df085?q=80&w=1200',
          'https://images.unsplash.com/photo-1522071820081-009f0129c71c?q=80&w=1200'
        ],
        featured: true,
        status: 'APPROVED',
        views: 1200,
        favoritesCount: 88,
        details: {
          company: 'TechNova Global Solutions',
          jobType: 'Full Time',
          experienceRequired: '4-7 Years',
          salaryRange: '₹18,00,000 - ₹26,00,000 per annum',
          workMode: 'Remote',
          skills: ['React.js', 'Node.js', 'TypeScript', 'MongoDB', 'AWS', 'Docker']
        }
      },
      {
        sellerId: employer1._id,
        categoryId: catMap['jobs'],
        categorySlug: 'jobs',
        subcategoryName: 'Marketing & Sales',
        title: 'Growth Marketing & Social Media Lead',
        description: 'Lead user acquisition campaigns, SEO/SEM strategies, and viral social content for a fast-scaling international marketplace.',
        listingType: 'SELL',
        condition: 'NOT_APPLICABLE',
        price: 1200000,
        currency: 'INR',
        currencySymbol: '₹',
        location: { country: 'India', region: 'Telangana', city: 'Hyderabad', localArea: 'Hitec City' },
        images: [
          'https://images.unsplash.com/photo-1460925895917-afdab827c52f?q=80&w=1200'
        ],
        featured: false,
        status: 'APPROVED',
        views: 640,
        favoritesCount: 34,
        details: {
          company: 'Velvorax Ecosystem Partners',
          jobType: 'Full Time',
          experienceRequired: '3-5 Years',
          salaryRange: '₹12,00,000 - ₹16,00,000',
          workMode: 'Hybrid',
          skills: ['Growth Marketing', 'Performance Ads', 'SEO', 'Analytics', 'Content Strategy']
        }
      },

      // Services
      {
        sellerId: provider1._id,
        categoryId: catMap['services'],
        categorySlug: 'services',
        subcategoryName: 'AC & Appliance Repair',
        title: 'Complete AC Servicing, Jet Cleaning & Gas Refilling',
        description: 'Expert doorstep air conditioner maintenance by certified HVAC professionals. Includes high-pressure jet cleaning, indoor coil sanitization, electrical checkup, and leak detection.',
        listingType: 'SELL',
        condition: 'NOT_APPLICABLE',
        price: 499,
        currency: 'INR',
        currencySymbol: '₹',
        location: { country: 'India', region: 'Tamil Nadu', city: 'Chennai', localArea: 'All Localities' },
        images: [
          'https://images.unsplash.com/photo-1581578731548-c64695cc6952?q=80&w=1200',
          'https://images.unsplash.com/photo-1621905251189-08b45d6a269e?q=80&w=1200'
        ],
        featured: true,
        status: 'APPROVED',
        views: 820,
        favoritesCount: 45,
        details: {
          providerName: 'CoolCare Home Services',
          startingPrice: '₹499',
          serviceType: 'AC Cleaning & Repair',
          duration: '45-60 Mins',
          warranty: '30-Day Service Guarantee',
          availability: 'Same Day Booking'
        }
      },
      {
        sellerId: provider1._id,
        categoryId: catMap['services'],
        categorySlug: 'services',
        subcategoryName: 'Home Deep Cleaning',
        title: 'Full Home Deep Cleaning & Sanitization Service',
        description: 'Comprehensive 5-star rated home deep cleaning using hospital-grade chemicals and mechanized single-disc scrubbing machines for tiles, kitchen, bathrooms, and sofas.',
        listingType: 'SELL',
        condition: 'NOT_APPLICABLE',
        price: 2499,
        currency: 'INR',
        currencySymbol: '₹',
        location: { country: 'India', region: 'Karnataka', city: 'Bengaluru' },
        images: [
          'https://images.unsplash.com/photo-1581578731548-c64695cc6952?q=80&w=1200'
        ],
        featured: false,
        status: 'APPROVED',
        views: 430,
        favoritesCount: 19,
        details: {
          providerName: 'CleanPro Experts',
          startingPrice: '₹2,499 for 2 BHK',
          serviceType: 'Residential Deep Cleaning',
          duration: '4-6 Hours'
        }
      },

      // Agriculture
      {
        sellerId: farmSeller1._id,
        categoryId: catMap['farm'],
        categorySlug: 'farm',
        subcategoryName: 'Tractors & Farm Machinery',
        title: 'John Deere 5050D Tractor 50HP with Rotavator Attachment',
        description: 'Well-maintained John Deere 5050D Tractor with only 1,200 operating hours. Power steering, dual clutch, oil immersed brakes, and heavy-duty 6-feet rotavator included.',
        listingType: 'SELL',
        condition: 'EXCELLENT',
        price: 520000,
        currency: 'INR',
        currencySymbol: '₹',
        location: { country: 'India', region: 'Tamil Nadu', city: 'Coimbatore', localArea: 'Pollachi Road' },
        images: [
          'https://images.unsplash.com/photo-1530267981375-f0de937f5f13?q=80&w=1200',
          'https://images.unsplash.com/photo-1500937386664-56d1dfef3854?q=80&w=1200'
        ],
        featured: true,
        status: 'APPROVED',
        views: 740,
        favoritesCount: 31,
        details: {
          machineType: 'Tractor',
          brand: 'John Deere',
          hp: '50 HP',
          hoursOperated: '1,200 hrs',
          attachmentsIncluded: ['Rotavator 6ft', 'Trolley Hitch']
        }
      },
      {
        sellerId: farmSeller1._id,
        categoryId: catMap['farm'],
        categorySlug: 'farm',
        subcategoryName: 'Agricultural Land & Farms',
        title: '5 Acres Fertile Organic Farm Land with Borewell & Fencing',
        description: 'Red soil agricultural land with 2 active high-yield borewells, solar drip irrigation setup, EB electricity connection, and coconut/mango plantation. Clear titles.',
        listingType: 'SELL',
        condition: 'NOT_APPLICABLE',
        price: 4500000,
        currency: 'INR',
        currencySymbol: '₹',
        location: { country: 'India', region: 'Karnataka', city: 'Mysuru', localArea: 'Hunsur Road' },
        images: [
          'https://images.unsplash.com/photo-1500382017468-9049fed747ef?q=80&w=1200'
        ],
        featured: true,
        status: 'APPROVED',
        views: 920,
        favoritesCount: 52,
        details: {
          landArea: '5 Acres',
          soilType: 'Red Loam Soil',
          waterSource: '2 Borewells + Solar Pump',
          electricity: '3-Phase Free Agro EB',
          cropsSuitable: ['Coconut', 'Arecanut', 'Vegetables', 'Organic Farming']
        }
      },

      // Businesses
      {
        sellerId: seller1._id,
        categoryId: catMap['businesses'],
        categorySlug: 'businesses',
        subcategoryName: 'Cafes, Restaurants & Food',
        title: 'Specialty Artisan Cafe & Bakery in Prime High-Street',
        description: 'Running cafe business with 45 seating capacity, imported La Marzocco espresso machine, commercial baking deck, established customer base, and active Zomato/Swiggy 4.6 star ratings.',
        listingType: 'SELL',
        condition: 'EXCELLENT',
        price: 3200000,
        currency: 'INR',
        currencySymbol: '₹',
        location: { country: 'India', region: 'Karnataka', city: 'Bengaluru', localArea: 'Indiranagar', address: '100ft Road' },
        images: [
          'https://images.unsplash.com/photo-1554118811-1e0d58224f24?q=80&w=1200',
          'https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?q=80&w=1200'
        ],
        featured: true,
        status: 'APPROVED',
        views: 670,
        favoritesCount: 39,
        details: {
          businessType: 'Artisan Cafe & Bakery',
          establishedYear: '2021',
          monthlyRevenue: '₹6,50,000',
          monthlyNetProfit: '₹1,80,000',
          seatingCapacity: '45 Seats',
          leasePeriod: '5 Years Remaining'
        }
      },

      // Free Giveaway & Exchange
      {
        sellerId: seller1._id,
        categoryId: catMap['furniture'],
        categorySlug: 'furniture',
        subcategoryName: 'Furniture',
        title: 'Solid Wood Study Desk & Bookcase (Free Giveaway)',
        description: 'Relocating to another city. Giving away this solid wooden study desk with 2 drawers and a 4-tier book shelf for free. Must pick up from apartment in Indiranagar.',
        listingType: 'FREE',
        condition: 'GOOD',
        price: 0,
        currency: 'INR',
        currencySymbol: '₹',
        location: { country: 'India', region: 'Karnataka', city: 'Bengaluru', localArea: 'Indiranagar' },
        images: [
          'https://images.unsplash.com/photo-1518455027359-f3f8164ba6bd?q=80&w=1200'
        ],
        featured: false,
        status: 'APPROVED',
        views: 310,
        favoritesCount: 22,
        details: {
          material: 'Solid Wood',
          dimensions: '4ft x 2ft',
          giveawayReason: 'Relocation'
        }
      },
      {
        sellerId: seller1._id,
        categoryId: catMap['products'],
        categorySlug: 'products',
        subcategoryName: 'Gaming Consoles & Accessories',
        title: 'Sony PlayStation 5 Disc Edition for Exchange with Gaming Laptop',
        description: 'PS5 Disc Edition with 2 DualSense Controllers, charging dock, and 4 physical game discs (Spider-Man 2, God of War Ragnarok, Horizon Forbidden West, Gran Turismo 7). Open for exchange with RTX 4060/4070 laptop.',
        listingType: 'EXCHANGE',
        condition: 'EXCELLENT',
        price: 45000,
        currency: 'INR',
        currencySymbol: '₹',
        location: { country: 'India', region: 'Tamil Nadu', city: 'Chennai', localArea: 'Anna Nagar' },
        images: [
          'https://images.unsplash.com/photo-1606813907291-d86efa9b94db?q=80&w=1200'
        ],
        featured: false,
        status: 'APPROVED',
        views: 480,
        favoritesCount: 30,
        details: {
          brand: 'Sony',
          exchangeFor: 'RTX 4060 / 4070 Gaming Laptop or iPad Pro M2',
          includedAccessories: ['2 DualSense Controllers', '4 PS5 Games', 'Charging Station']
        }
      }
    ];

    // Populate coordinates for all listings
    sampleListings.forEach(item => {
      const coords = CITY_COORDINATES[item.location?.city] || { lat: 12.9716, lng: 77.5946 };
      item.location.latitude = coords.lat;
      item.location.longitude = coords.lng;
      item.geoPoint = {
        type: 'Point',
        coordinates: [coords.lng, coords.lat]
      };
    });

    const listings = await Listing.create(sampleListings);
    console.log(`Seeded ${listings.length} Listings across all marketplace categories.`);

    // 5. Seed Orders (Purchases)
    const iphoneListing = listings.find(l => l.title.includes('iPhone 15 Pro')) || listings[0];
    const apartmentListing = listings.find(l => l.title.includes('3 BHK Luxury Apartment')) || listings[1];
    const carListing = listings.find(l => l.title.includes('Honda City')) || listings[2];

    const orders = await Order.create([
      {
        orderNumber: 'VX10025',
        buyerId: buyer1._id,
        sellerId: iphoneListing.sellerId,
        listingId: iphoneListing._id,
        amount: iphoneListing.price,
        currency: iphoneListing.currency,
        currencySymbol: iphoneListing.currencySymbol,
        paymentStatus: 'PAID',
        orderStatus: 'COMPLETED',
        paymentMethod: 'ESCROW_WALLET',
        shippingAddress: {
          fullName: buyer1.name,
          phone: buyer1.phone,
          address: 'Flat 402, Prestige Palms, Koramangala',
          city: 'Bengaluru',
          region: 'Karnataka',
          country: 'India',
          postalCode: '560034'
        },
        createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000)
      },
      {
        orderNumber: 'VX10026',
        buyerId: buyer1._id,
        sellerId: apartmentListing.sellerId,
        listingId: apartmentListing._id,
        amount: apartmentListing.price,
        currency: apartmentListing.currency,
        currencySymbol: apartmentListing.currencySymbol,
        paymentStatus: 'PAID',
        orderStatus: 'COMPLETED',
        paymentMethod: 'BANK_TRANSFER',
        shippingAddress: {
          fullName: buyer1.name,
          phone: buyer1.phone,
          address: 'Flat 402, Prestige Palms',
          city: 'Bengaluru',
          region: 'Karnataka',
          country: 'India',
          postalCode: '560034'
        },
        createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
      },
      {
        orderNumber: 'VX10027',
        buyerId: buyer2._id,
        sellerId: carListing.sellerId,
        listingId: carListing._id,
        amount: carListing.price,
        currency: carListing.currency,
        currencySymbol: carListing.currencySymbol,
        paymentStatus: 'PAID',
        orderStatus: 'PROCESSING',
        paymentMethod: 'AUTO_LOAN',
        shippingAddress: {
          fullName: buyer2.name,
          phone: buyer2.phone,
          address: '12th Cross, Gandhi Nagar, Adyar',
          city: 'Chennai',
          region: 'Tamil Nadu',
          country: 'India',
          postalCode: '600020'
        },
        createdAt: new Date()
      },
      {
        orderNumber: 'VX10028',
        buyerId: buyerMain._id,
        sellerId: sellerMain._id,
        listingId: apartmentListing._id,
        amount: apartmentListing.price,
        currency: apartmentListing.currency,
        currencySymbol: apartmentListing.currencySymbol,
        paymentStatus: 'PAID',
        orderStatus: 'COMPLETED',
        paymentMethod: 'ONLINE_ESCROW',
        shippingAddress: {
          fullName: buyerMain.name,
          phone: buyerMain.phone,
          address: '42, 100 Feet Road, Indiranagar',
          city: 'Bengaluru',
          region: 'Karnataka',
          country: 'India',
          postalCode: '560038'
        },
        createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000)
      },
      {
        orderNumber: 'VX10029',
        buyerId: buyerMain._id,
        sellerId: sellerMain._id,
        listingId: iphoneListing._id,
        amount: iphoneListing.price,
        currency: iphoneListing.currency,
        currencySymbol: iphoneListing.currencySymbol,
        paymentStatus: 'PAID',
        orderStatus: 'PROCESSING',
        paymentMethod: 'CREDIT_CARD',
        shippingAddress: {
          fullName: buyerMain.name,
          phone: buyerMain.phone,
          address: '42, 100 Feet Road, Indiranagar',
          city: 'Bengaluru',
          region: 'Karnataka',
          country: 'India',
          postalCode: '560038'
        },
        createdAt: new Date()
      }
    ]);
    console.log(`Seeded ${orders.length} Marketplace Orders/Purchases.`);

    // 6. Seed Conversations & Messages
    const conv1 = await Conversation.create({
      participants: [buyer1._id, iphoneListing.sellerId],
      listingId: iphoneListing._id,
      lastMessage: {
        text: 'Is this available for instant delivery in Koramangala?',
        senderId: buyer1._id,
        createdAt: new Date()
      }
    });

    await Message.create({
      conversationId: conv1._id,
      senderId: buyer1._id,
      text: 'Hello, is this available for instant delivery in Koramangala?',
      isRead: false
    });

    const conv2 = await Conversation.create({
      participants: [buyer1._id, apartmentListing.sellerId],
      listingId: apartmentListing._id,
      lastMessage: {
        text: 'Can we schedule a physical visit this Saturday at 11 AM?',
        senderId: buyer1._id,
        createdAt: new Date()
      }
    });

    await Message.create({
      conversationId: conv2._id,
      senderId: buyer1._id,
      text: 'Can we schedule a physical visit this Saturday at 11 AM?',
      isRead: true
    });

    const conv3 = await Conversation.create({
      participants: [buyerMain._id, sellerMain._id],
      listingId: apartmentListing._id,
      lastMessage: {
        text: 'Hi Sarah, is the floor plan customizable?',
        senderId: buyerMain._id,
        createdAt: new Date()
      }
    });

    await Message.create({
      conversationId: conv3._id,
      senderId: buyerMain._id,
      text: 'Hi Sarah, is the floor plan customizable?',
      isRead: false
    });
    console.log('Seeded Conversations and Messages.');

    // 7. Seed Saved Favorites for Buyer
    await Favorite.create([
      { userId: buyer1._id, listingId: apartmentListing._id },
      { userId: buyer1._id, listingId: carListing._id },
      { userId: buyerMain._id, listingId: apartmentListing._id },
      { userId: buyerMain._id, listingId: iphoneListing._id }
    ]);
    console.log('Seeded Buyer Saved Wishlists.');

    console.log('Database seeding successfully completed!');
    return true;
  } catch (error) {
    console.error('Database seeding failed:', error);
    throw error;
  }
};

// If run directly via node
if (process.argv[1]?.endsWith('seedData.js')) {
  seedDatabase().then(() => {
    console.log('Done. Exiting process.');
    process.exit(0);
  }).catch((err) => {
    console.error(err);
    process.exit(1);
  });
}
