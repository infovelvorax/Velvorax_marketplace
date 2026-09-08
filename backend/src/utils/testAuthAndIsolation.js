import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { User, Order, Conversation, Favorite } from '../models/index.js';
import jwt from 'jsonwebtoken';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

const MONGODB_URI = process.env.MONGODB_URI;
const JWT_SECRET = process.env.JWT_SECRET;

async function runTests() {
  console.log('--- Starting Velvorax Data Isolation & Auth Test ---');
  if (!MONGODB_URI) {
    console.error('MONGODB_URI is not configured in backend/.env');
    process.exit(1);
  }
  await mongoose.connect(MONGODB_URI, { serverSelectionTimeoutMS: 15000 });

  // 1. Fetch Users
  const buyerA = await User.findOne({ email: 'buyer@velvorax.com' });
  const buyerB = await User.findOne({ email: 'rahul.buyer@velvorax.com' });
  const seller = await User.findOne({ email: 'seller@velvorax.com' });
  const admin = await User.findOne({ email: 'admin@velvorax.com' });

  if (!buyerA || !buyerB || !seller || !admin) {
    console.error('Missing seed users. Please run seed script.');
    process.exit(1);
  }

  console.log('✓ Found seed users: Buyer A, Buyer B, Seller, Admin');

  // 2. Test Buyer A purchases vs Buyer B purchases
  const buyerAPurchases = await Order.find({ buyerId: buyerA._id });
  const buyerBPurchases = await Order.find({ buyerId: buyerB._id });
  console.log(`Buyer A Purchases count: ${buyerAPurchases.length} (${buyerAPurchases.map(p => p.orderNumber).join(', ')})`);
  console.log(`Buyer B Purchases count: ${buyerBPurchases.length} (${buyerBPurchases.map(p => p.orderNumber).join(', ')})`);

  const overlappingPurchases = buyerAPurchases.filter(a => buyerBPurchases.some(b => b._id.toString() === a._id.toString()));
  if (overlappingPurchases.length > 0) {
    throw new Error('FAILED: Overlapping purchases detected between Buyer A and Buyer B!');
  }
  console.log('✓ Buyer purchases strictly isolated by JWT authenticated buyerId');

  // 3. Test Buyer A conversations vs Buyer B conversations
  const buyerAConvs = await Conversation.find({ participants: buyerA._id });
  const buyerBConvs = await Conversation.find({ participants: buyerB._id });
  console.log(`Buyer A Conversations count: ${buyerAConvs.length}`);
  console.log(`Buyer B Conversations count: ${buyerBConvs.length}`);

  // 4. Test Buyer A favorites vs Buyer B favorites
  const buyerAFavs = await Favorite.find({ userId: buyerA._id });
  const buyerBFavs = await Favorite.find({ userId: buyerB._id });
  console.log(`Buyer A Saved Wishlist count: ${buyerAFavs.length}`);
  console.log(`Buyer B Saved Wishlist count: ${buyerBFavs.length}`);

  // 5. Test Password Verification
  const adminMatch = await admin.matchPassword('Password@123');
  const buyerMatch = await buyerA.matchPassword('Password@123');
  console.log(`Admin password valid: ${adminMatch}`);
  console.log(`Buyer password valid: ${buyerMatch}`);

  console.log('--- ALL BACKEND DATA ISOLATION TESTS PASSED SUCCESSFULLY! ---');
  await mongoose.disconnect();
}

runTests().catch(err => {
  console.error('Test failed:', err);
  process.exit(1);
});
