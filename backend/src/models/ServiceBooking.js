import mongoose from 'mongoose';

const serviceBookingSchema = new mongoose.Schema({
  serviceListingId: { type: mongoose.Schema.Types.ObjectId, ref: 'Listing', required: true, index: true },
  providerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  customerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  serviceTitle: { type: String, required: true },
  bookingDate: { type: String, required: true },
  timeSlot: { type: String, required: true },
  address: { type: String, required: true },
  phone: { type: String, required: true },
  notes: { type: String, default: '' },
  priceEstimate: { type: Number, default: 0 },
  currencySymbol: { type: String, default: '₹' },
  status: {
    type: String,
    enum: ['REQUESTED', 'CONFIRMED', 'ON_THE_WAY', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED'],
    default: 'REQUESTED'
  },
  rating: { type: Number },
  review: { type: String }
}, { timestamps: true });

export const ServiceBooking = mongoose.model('ServiceBooking', serviceBookingSchema);
