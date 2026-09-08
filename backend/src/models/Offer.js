import mongoose from 'mongoose';

const offerSchema = new mongoose.Schema({
  listingId: { type: mongoose.Schema.Types.ObjectId, ref: 'Listing', required: true, index: true },
  buyerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  sellerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  amount: { type: Number, required: true },
  currency: { type: String, default: 'INR' },
  currencySymbol: { type: String, default: '₹' },
  message: { type: String, default: '' },
  status: {
    type: String,
    enum: ['PENDING', 'ACCEPTED', 'REJECTED', 'COUNTERED', 'CANCELLED'],
    default: 'PENDING'
  },
  counterAmount: { type: Number },
  counterMessage: { type: String, default: '' }
}, { timestamps: true });

export const Offer = mongoose.model('Offer', offerSchema);
