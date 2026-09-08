import mongoose from 'mongoose';

const subcategorySchema = new mongoose.Schema({
  name: { type: String, required: true },
  slug: { type: String, required: true },
  icon: { type: String, default: '' },
  active: { type: Boolean, default: true }
});

const categorySchema = new mongoose.Schema({
  name: { type: String, required: true },
  slug: { type: String, required: true, unique: true },
  icon: { type: String, default: 'grid' },
  description: { type: String, default: '' },
  type: { 
    type: String, 
    enum: ['PRODUCT', 'VEHICLE', 'PROPERTY', 'JOB', 'SERVICE', 'AGRICULTURE', 'BUSINESS', 'OTHER'],
    default: 'PRODUCT'
  },
  subcategories: [subcategorySchema],
  fieldsSchema: { type: mongoose.Schema.Types.Mixed, default: {} },
  featured: { type: Boolean, default: false },
  order: { type: Number, default: 0 },
  countrySpecific: { type: Boolean, default: false },
  active: { type: Boolean, default: true }
}, { timestamps: true });

export const Category = mongoose.model('Category', categorySchema);
