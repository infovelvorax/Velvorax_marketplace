import mongoose from 'mongoose';

const orderSchema = new mongoose.Schema({
  orderNumber: {
    type: String,
    required: true,
    unique: true,
    index: true,
    uppercase: true,
    trim: true
  },
  buyerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  sellerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  listingId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Listing',
    required: true,
    index: true
  },
  amount: {
    type: Number,
    required: true,
    min: 0
  },
  currency: {
    type: String,
    default: 'INR'
  },
  currencySymbol: {
    type: String,
    default: '₹'
  },
  paymentStatus: {
    type: String,
    enum: ['PAID', 'PENDING', 'FAILED', 'REFUNDED'],
    default: 'PAID'
  },
  orderStatus: {
    type: String,
    enum: ['PENDING', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'COMPLETED', 'CANCELLED'],
    default: 'COMPLETED'
  },
  paymentMethod: {
    type: String,
    default: 'DIRECT_MARKETPLACE'
  },
  shippingAddress: {
    fullName: { type: String, default: '' },
    phone: { type: String, default: '' },
    address: { type: String, default: '' },
    city: { type: String, default: '' },
    region: { type: String, default: '' },
    country: { type: String, default: 'India' },
    postalCode: { type: String, default: '' }
  },
  notes: {
    type: String,
    default: ''
  }
}, { timestamps: true });

export const Order = mongoose.model('Order', orderSchema);
export default Order;
