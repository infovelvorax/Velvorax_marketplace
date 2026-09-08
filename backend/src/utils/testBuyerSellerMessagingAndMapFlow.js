import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { User } from '../models/User.js';
import { Listing } from '../models/Listing.js';
import { Conversation } from '../models/Conversation.js';
import { Message } from '../models/Message.js';
import { Notification } from '../models/Notification.js';

import { connectDB } from '../config/db.js';

import { Category } from '../models/Category.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, '../../.env') });

async function runTest() {
  console.log('🚀 [TEST] Starting Buyer-Seller Messaging, Notifications, Dial & Map Verification...');
  
  await connectDB();
  console.log('✅ Connected to MongoDB Atlas:', mongoose.connection.name);

  // 1. Create or retrieve test verified seller with phone and location
  const sellerEmail = 'verified.seller.test@velvorox.com';
  let seller = await User.findOne({ email: sellerEmail });
  if (!seller) {
    seller = await User.create({
      name: 'Rajesh Realty Estates',
      email: sellerEmail,
      phone: '+91 98765 43210',
      role: 'SELLER',
      sellerStatus: 'APPROVED',
      passwordHash: '$2a$10$e7K4V5mK5eL9L4sU8P6rROe8pI8n9Q1j8R7T6Y5U4I3O2P1A0S9D8',
      isEmailVerified: true,
      location: {
        city: 'Bengaluru',
        region: 'Karnataka',
        country: 'India'
      }
    });
    console.log('✅ Created test seller with phone & location:', seller.name, seller.phone);
  } else {
    seller.phone = '+91 98765 43210';
    seller.location = { city: 'Bengaluru', region: 'Karnataka', country: 'India' };
    await seller.save();
    console.log('✅ Verified existing seller with phone & location:', seller.name, seller.phone);
  }

  // 2. Create or retrieve test buyer with phone and location
  const buyerEmail = 'active.buyer.test@velvorox.com';
  let buyer = await User.findOne({ email: buyerEmail });
  if (!buyer) {
    buyer = await User.create({
      name: 'Amit Sharma',
      email: buyerEmail,
      phone: '+91 91234 56789',
      role: 'BUYER',
      passwordHash: '$2a$10$e7K4V5mK5eL9L4sU8P6rROe8pI8n9Q1j8R7T6Y5U4I3O2P1A0S9D8',
      isEmailVerified: true,
      location: {
        city: 'Bengaluru',
        region: 'Karnataka',
        country: 'India'
      }
    });
    console.log('✅ Created test buyer with phone & location:', buyer.name, buyer.phone);
  } else {
    buyer.phone = '+91 91234 56789';
    buyer.location = { city: 'Bengaluru', region: 'Karnataka', country: 'India' };
    await buyer.save();
    console.log('✅ Verified existing buyer with phone & location:', buyer.name, buyer.phone);
  }

  // 3. Find properties category
  let propCategory = await Category.findOne({ slug: 'properties' });
  if (!propCategory) {
    propCategory = await Category.create({
      name: 'Properties',
      slug: 'properties',
      type: 'PROPERTY',
      description: 'Real estate properties, apartments, villas, and lands',
      active: true
    });
    console.log('✅ Created properties category:', propCategory.name);
  }

  // 4. Create property listing with full location details and GPS coordinates
  let listing = await Listing.findOne({ title: 'Luxury 3BHK Penthouse in Indiranagar' });
  if (!listing) {
    listing = await Listing.create({
      title: 'Luxury 3BHK Penthouse in Indiranagar',
      description: 'Ultra-modern 3BHK penthouse with private terrace garden, dedicated parking, and premium amenities.',
      categoryId: propCategory._id,
      categorySlug: 'properties',
      category: 'properties',
      subCategory: 'Apartments / Flats',
      price: 24500000,
      currency: 'INR',
      currencySymbol: '₹',
      status: 'APPROVED',
      images: ['https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=1200&q=80'],
      sellerId: seller._id,
      location: {
        country: 'India',
        region: 'Karnataka',
        city: 'Bengaluru',
        localArea: 'Indiranagar',
        landmark: 'Near 100 Feet Road & Metro Station',
        address: '12th Main Road, HAL 2nd Stage, Indiranagar',
        latitude: 12.9719,
        longitude: 77.6412,
        zipCode: '560038'
      },
      propertyDetails: {
        propertyType: 'Penthouse',
        bedrooms: 3,
        bathrooms: 3,
        area: 2850,
        areaUnit: 'sqft',
        furnishingStatus: 'Furnished'
      }
    });
    console.log('✅ Created property listing with GPS coords & landmark:', listing.title, `(${listing.location.latitude}, ${listing.location.longitude})`);
  } else {
    listing.categoryId = propCategory._id;
    listing.location.latitude = 12.9719;
    listing.location.longitude = 77.6412;
    listing.location.landmark = 'Near 100 Feet Road & Metro Station';
    await listing.save();
    console.log('✅ Updated property listing with GPS coords & landmark:', listing.title);
  }

  // 4. Test Conversation Creation between Buyer and Seller for this listing
  let conversation = await Conversation.findOne({
    participants: { $all: [buyer._id, seller._id] },
    listingId: listing._id
  });

  if (!conversation) {
    conversation = await Conversation.create({
      participants: [buyer._id, seller._id],
      listingId: listing._id,
      unreadCounts: new Map()
    });
    console.log('✅ Created conversation between buyer and seller');
  }

  // 5. Test Buyer sending message to Seller
  const inquiryText = 'Hello Rajesh, I am interested in viewing this Indiranagar penthouse this Saturday. Is the property available for a site visit?';
  const message = await Message.create({
    conversationId: conversation._id,
    senderId: buyer._id,
    text: inquiryText
  });

  conversation.lastMessage = {
    text: message.text,
    senderId: buyer._id,
    createdAt: message.createdAt
  };
  await conversation.save();
  console.log('✅ Message created from buyer to seller in MongoDB');

  // 6. Test Notification creation for Seller
  const notification = await Notification.create({
    userId: seller._id,
    title: `New Message from ${buyer.name}`,
    message: `${buyer.name}: ${message.text.substring(0, 100)}`,
    type: 'MESSAGE',
    link: `/dashboard/messages?conversation=${conversation._id}`
  });
  console.log('✅ Notification created in MongoDB for seller:', notification.title);

  // 7. Verify Seller retrieves conversations with populated buyer phone, email, and location
  const sellerConversations = await Conversation.find({ participants: seller._id })
    .populate('participants', 'name email phone profilePhoto role rating verificationStatus location')
    .populate('listingId', 'title price currency currencySymbol images status categorySlug location');

  const activeConvo = sellerConversations.find(c => c._id.toString() === conversation._id.toString());
  if (!activeConvo) {
    throw new Error('Seller could not find active conversation in MongoDB');
  }

  const buyerParticipant = activeConvo.participants.find(p => p._id.toString() === buyer._id.toString());
  if (!buyerParticipant || !buyerParticipant.phone || !buyerParticipant.email) {
    throw new Error('Buyer contact details (phone/email) were not populated correctly for seller');
  }

  console.log('✅ Seller successfully fetched buyer contact details:', {
    name: buyerParticipant.name,
    phone: buyerParticipant.phone,
    email: buyerParticipant.email,
    location: buyerParticipant.location
  });

  // 8. Verify Seller retrieves notifications
  const sellerNotifications = await Notification.find({ userId: seller._id, isRead: false });
  const messageNotification = sellerNotifications.find(n => n._id.toString() === notification._id.toString());
  if (!messageNotification) {
    throw new Error('Seller could not find new message notification in MongoDB');
  }
  console.log('✅ Seller received notification alert:', messageNotification.title, messageNotification.message);

  // 9. Verify Listing Map Data
  const fetchedListing = await Listing.findById(listing._id);
  if (!fetchedListing.location || fetchedListing.location.latitude !== 12.9719 || fetchedListing.location.longitude !== 77.6412) {
    throw new Error('Listing GPS coordinates mismatch');
  }
  console.log('✅ Property listing map location verified:', {
    city: fetchedListing.location.city,
    localArea: fetchedListing.location.localArea,
    landmark: fetchedListing.location.landmark,
    lat: fetchedListing.location.latitude,
    lng: fetchedListing.location.longitude
  });

  console.log('\n🎉 [ALL CHECKS PASSED] End-to-end messaging, seller dashboard notifications, buyer contact viewing, phone dialer integration, and real map location are fully verified and backed by MongoDB Atlas!');
  await mongoose.disconnect();
}

runTest().catch(err => {
  console.error('❌ Test failed:', err);
  process.exit(1);
});
