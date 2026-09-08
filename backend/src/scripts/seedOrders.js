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
import { User, Listing, Order } from '../models/index.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

const seedSampleOrders = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    const buyers = await User.find({ role: { $in: ['BUYER', 'USER', 'buyer', 'user'] } });
    if (buyers.length === 0) {
      console.log('No buyers found. Creating sample buyer...');
      const sampleBuyer = await User.create({
        name: 'Rohan Sharma',
        email: 'rohan.sharma@example.com',
        passwordHash: 'SamplePass@123',
        phone: '+91 98765 43210',
        role: 'BUYER',
        accountStatus: 'ACTIVE',
        location: { city: 'Bengaluru', country: 'India' }
      });
      buyers.push(sampleBuyer);
    }

    const listings = await Listing.find({ status: 'APPROVED' }).limit(12);
    if (listings.length === 0) {
      console.log('No approved listings found.');
      process.exit(0);
    }

    const existingOrders = await Order.countDocuments();
    if (existingOrders > 0) {
      console.log(`Already have ${existingOrders} orders in DB.`);
      process.exit(0);
    }

    const statuses = ['COMPLETED', 'COMPLETED', 'DELIVERED', 'PROCESSING', 'COMPLETED'];
    const ordersToCreate = [];

    for (let i = 0; i < listings.length; i++) {
      const listing = listings[i];
      const buyer = buyers[i % buyers.length];
      const orderNum = `ORD-${Date.now().toString().slice(-6)}-${Math.floor(1000 + Math.random() * 9000)}`;

      ordersToCreate.push({
        orderNumber: orderNum,
        buyerId: buyer._id,
        sellerId: listing.sellerId,
        listingId: listing._id,
        amount: listing.price || 15000,
        currency: 'INR',
        currencySymbol: '₹',
        paymentStatus: 'PAID',
        orderStatus: statuses[i % statuses.length],
        paymentMethod: 'UPI_DIRECT',
        shippingAddress: {
          fullName: buyer.name,
          phone: buyer.phone || '+91 98765 00000',
          address: '42, Residency Road, Indiranagar',
          city: buyer.location?.city || 'Bengaluru',
          state: 'Karnataka',
          postalCode: '560038'
        }
      });
    }

    await Order.insertMany(ordersToCreate);
    console.log(`Successfully created ${ordersToCreate.length} marketplace orders!`);

    for (let i = 0; i < 6 && i < listings.length; i++) {
      await Listing.findByIdAndUpdate(listings[i]._id, { isSold: true });
    }

    process.exit(0);
  } catch (error) {
    console.error('Seed orders failed:', error);
    process.exit(1);
  }
};

seedSampleOrders();
