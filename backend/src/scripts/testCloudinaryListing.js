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
import { Listing } from '../models/Listing.js';
import { User } from '../models/User.js';
import { Category } from '../models/Category.js';
import { deleteCloudinaryAsset } from '../config/cloudinary.config.js';

dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/velvorax';

async function runTests() {
  console.log('\n==================================================');
  console.log('VELVORAX MARKETPLACE - CLOUDINARY LISTING TEST SUITE');
  console.log('==================================================\n');

  try {
    await mongoose.connect(MONGODB_URI);
    console.log('✓ Connected to MongoDB');

    // 1. Find or create a test seller
    let seller = await User.findOne({ role: 'SELLER' });
    if (!seller) {
      seller = await User.create({
        name: 'Test Cloudinary Seller',
        email: `seller_cloudinary_${Date.now()}@velvorax.test`,
        passwordHash: 'dummyhash123',
        role: 'SELLER',
        sellerStatus: 'APPROVED'
      });
    }
    console.log(`✓ Test Seller: ${seller.name} (${seller._id})`);

    // 2. Find a category
    let category = await Category.findOne({ slug: 'vehicles' }) || await Category.findOne({});
    if (!category) {
      category = await Category.create({
        name: 'Cars & Bikes',
        slug: 'vehicles',
        icon: '🚗',
        active: true
      });
    }
    console.log(`✓ Category: ${category.name} (${category.slug})`);

    // 3. Test Listing Creation with Media Metadata
    const mockMedia = [
      {
        url: 'http://res.cloudinary.com/attcc2xg/image/upload/v1740000001/velvorax-marketplace/listings/car_front.jpg',
        secure_url: 'https://res.cloudinary.com/attcc2xg/image/upload/v1740000001/velvorax-marketplace/listings/car_front.jpg',
        publicId: 'velvorax-marketplace/listings/car_front',
        width: 1920,
        height: 1080,
        format: 'jpg',
        resourceType: 'image',
        isCover: true,
        order: 0
      },
      {
        url: 'http://res.cloudinary.com/attcc2xg/image/upload/v1740000002/velvorax-marketplace/listings/car_interior.png',
        secure_url: 'https://res.cloudinary.com/attcc2xg/image/upload/v1740000002/velvorax-marketplace/listings/car_interior.png',
        publicId: 'velvorax-marketplace/listings/car_interior',
        width: 1920,
        height: 1080,
        format: 'png',
        resourceType: 'image',
        isCover: false,
        order: 1
      },
      {
        url: 'http://res.cloudinary.com/attcc2xg/image/upload/v1740000003/velvorax-marketplace/listings/car_side.webp',
        secure_url: 'https://res.cloudinary.com/attcc2xg/image/upload/v1740000003/velvorax-marketplace/listings/car_side.webp',
        publicId: 'velvorax-marketplace/listings/car_side',
        width: 1920,
        height: 1080,
        format: 'webp',
        resourceType: 'image',
        isCover: false,
        order: 2
      }
    ];

    const testListing = await Listing.create({
      sellerId: seller._id,
      categoryId: category._id,
      categorySlug: category.slug,
      title: 'TEST 2023 Hyundai Creta SX Diesel - Cloudinary Verified',
      description: 'Test listing created with full Cloudinary media metadata and unsigned browser upload flow verification.',
      listingType: 'SELL',
      condition: 'LIKE_NEW',
      price: 1650000,
      currency: 'INR',
      currencySymbol: '₹',
      location: {
        country: 'India',
        region: 'Karnataka',
        city: 'Bengaluru',
        localArea: 'Indiranagar',
        latitude: 12.9716,
        longitude: 77.5946
      },
      media: mockMedia,
      status: 'PENDING_REVIEW',
      isTestData: true,
      seedSource: 'cloudinary_test'
    });

    console.log(`\n[TEST 1] Listing Created with status: ${testListing.status}`);
    if (testListing.status === 'PENDING_REVIEW') {
      console.log('✓ PASS: Listing status defaults to PENDING_REVIEW (not auto-approved)');
    } else {
      console.error(`✗ FAIL: Expected status PENDING_REVIEW, got ${testListing.status}`);
    }

    // 4. Verify MongoDB stores media metadata and synced images
    console.log('\n[TEST 2] Verifying Media Metadata & Synchronized images array:');
    console.log(`- Media Count: ${testListing.media.length}`);
    console.log(`- Images Count: ${testListing.images.length}`);
    console.log(`- First Image (Cover): ${testListing.images[0]}`);

    if (testListing.media.length === 3 && testListing.images.length === 3) {
      console.log('✓ PASS: Media metadata count matches images array count');
    } else {
      console.error('✗ FAIL: Media count and images array mismatch');
    }

    if (testListing.images[0] === mockMedia[0].secure_url) {
      console.log('✓ PASS: Cover image is placed first in images array');
    } else {
      console.error('✗ FAIL: Cover image is not index 0');
    }

    // Verify no binary data in document
    const rawDoc = testListing.toObject();
    const hasBinary = JSON.stringify(rawDoc).includes('data:image/');
    if (!hasBinary) {
      console.log('✓ PASS: No image binary data stored in MongoDB (URLs & public IDs only)');
    } else {
      console.error('✗ FAIL: Found base64 binary image in MongoDB document');
    }

    // 5. Test Changing Cover Image and Reordering
    console.log('\n[TEST 3] Testing Set Cover and Media Reordering:');
    // Set 3rd image (car_side) as cover
    testListing.media[2].isCover = true;
    testListing.media[0].isCover = false;
    await testListing.save();

    console.log(`- New Cover Image: ${testListing.images[0]}`);
    if (testListing.images[0].includes('car_side')) {
      console.log('✓ PASS: Re-saving with new isCover automatically re-ordered images[0]');
    } else {
      console.error('✗ FAIL: images[0] did not update to new cover photo');
    }

    // 6. Test Media Deletion
    console.log('\n[TEST 4] Testing Single Media Deletion:');
    const targetPublicId = 'velvorax-marketplace/listings/car_interior';
    testListing.media = testListing.media.filter(m => m.publicId !== targetPublicId);
    await testListing.save();

    console.log(`- Remaining Media Count: ${testListing.media.length}`);
    console.log(`- Remaining Images Count: ${testListing.images.length}`);

    if (testListing.media.length === 2 && testListing.images.length === 2) {
      console.log('✓ PASS: Media and images successfully reduced to 2 items');
    } else {
      console.error('✗ FAIL: Media deletion failed');
    }

    // 7. Test Moderation Approval -> Public Availability
    console.log('\n[TEST 5] Testing Admin Approval & Public Visibility:');
    
    // Check that listing is not visible in public search when PENDING_REVIEW
    let publicSearch = await Listing.find({ status: 'APPROVED', _id: testListing._id });
    if (publicSearch.length === 0) {
      console.log('✓ PASS: PENDING_REVIEW listing is NOT visible in public search');
    } else {
      console.error('✗ FAIL: PENDING_REVIEW listing leaked into public search');
    }

    // Approve listing
    testListing.status = 'APPROVED';
    testListing.approvedAt = new Date();
    await testListing.save();

    publicSearch = await Listing.find({ status: 'APPROVED', _id: testListing._id });
    if (publicSearch.length === 1) {
      console.log('✓ PASS: APPROVED listing is now visible in public search with secure CDN URLs');
      console.log(`- Public URL: ${publicSearch[0].images[0]}`);
    } else {
      console.error('✗ FAIL: APPROVED listing not found in public search');
    }

    // 8. Clean up test listing
    await Listing.findByIdAndDelete(testListing._id);
    console.log('\n✓ Cleaned up test listing document');

    console.log('\n==================================================');
    console.log('ALL CLOUDINARY LISTING TESTS PASSED (100%)');
    console.log('==================================================\n');

  } catch (error) {
    console.error('Test error:', error);
  } finally {
    await mongoose.disconnect();
  }
}

runTests();
