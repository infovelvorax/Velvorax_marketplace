import mongoose from 'mongoose';

const localAreaSchema = new mongoose.Schema({
  name: { type: String, required: true },
  slug: { type: String, required: true },
  pincode: { type: String, default: '' },
  active: { type: Boolean, default: true }
});

const citySchema = new mongoose.Schema({
  name: { type: String, required: true },
  slug: { type: String, required: true },
  popular: { type: Boolean, default: false },
  localAreas: [localAreaSchema],
  active: { type: Boolean, default: true }
});

const regionSchema = new mongoose.Schema({
  name: { type: String, required: true },
  slug: { type: String, required: true },
  cities: [citySchema],
  active: { type: Boolean, default: true }
});

const locationSchema = new mongoose.Schema({
  countryName: { type: String, required: true, unique: true },
  countryCode: { type: String, required: true, uppercase: true }, // e.g. IN, US, AE, UK
  currency: { type: String, required: true, default: 'INR' },
  currencySymbol: { type: String, required: true, default: '₹' },
  regions: [regionSchema],
  popular: { type: Boolean, default: true },
  active: { type: Boolean, default: true }
}, { timestamps: true });

export const Location = mongoose.model('Location', locationSchema);
