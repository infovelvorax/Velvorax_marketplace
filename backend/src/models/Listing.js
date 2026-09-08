import mongoose from 'mongoose';

const listingSchema = new mongoose.Schema({
  sellerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  categoryId: { type: mongoose.Schema.Types.ObjectId, ref: 'Category', required: true, index: true },
  categorySlug: { type: String, index: true },
  subcategoryName: { type: String, default: '' },
  
  title: { type: String, required: true, trim: true },
  description: { type: String, required: true },
  listingType: { 
    type: String, 
    enum: ['SELL', 'RENT', 'EXCHANGE', 'FREE'], 
    default: 'SELL',
    index: true 
  },
  condition: { 
    type: String, 
    enum: ['NEW', 'LIKE_NEW', 'EXCELLENT', 'GOOD', 'FAIR', 'REFURBISHED', 'NOT_APPLICABLE', 'USED', ''],
    default: 'GOOD' 
  },
  price: { type: Number, default: 0, index: true },
  currency: { 
    type: String, 
    default: 'INR', 
    uppercase: true, 
    trim: true,
    index: true 
  },
  currencySymbol: { type: String, default: '₹', trim: true },
  negotiable: { type: Boolean, default: true },
  
  location: {
    country: { type: String, default: 'India', index: true },
    region: { type: String, default: '', index: true },
    city: { type: String, default: '', index: true },
    localArea: { type: String, default: '' },
    landmark: { type: String, default: '' },
    zipCode: { type: String, default: '' },
    latitude: { type: Number, default: null },
    longitude: { type: Number, default: null },
    address: { type: String, default: '' }
  },
  
  // GeoJSON Point for geospatial radius & distance queries
  geoPoint: {
    type: {
      type: String,
      enum: ['Point'],
      default: 'Point'
    },
    coordinates: {
      type: [Number], // [longitude, latitude]
      default: [0, 0]
    }
  },
  
  images: [{ type: String }],
  media: [{
    url: { type: String, required: true },
    secure_url: { type: String },
    publicId: { type: String, required: true },
    width: { type: Number },
    height: { type: Number },
    format: { type: String, default: '' },
    resourceType: { type: String, default: 'image' },
    isCover: { type: Boolean, default: false },
    order: { type: Number, default: 0 }
  }],
  video: { type: String, default: '' },
  featured: { type: Boolean, default: false, index: true },
  status: {
    type: String,
    enum: ['DRAFT', 'PENDING', 'PENDING_REVIEW', 'UNDER_REVIEW', 'APPROVED', 'REJECTED', 'CHANGES_REQUESTED', 'SUSPENDED', 'REMOVED', 'EXPIRED', 'SOLD', 'RENTED', 'CLOSED'],
    default: 'PENDING_REVIEW',
    index: true
  },
  rejectionReason: { type: String, default: '' },
  changeRequestReason: { type: String, default: '' },
  approvedAt: { type: Date },
  approvedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  removedAt: { type: Date, default: null },
  removedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
  removalReason: { type: String, default: '' },
  views: { type: Number, default: 0 },
  favoritesCount: { type: Number, default: 0 },
  expiresAt: { type: Date },
  
  // Test Data & Seeding Markers
  isTestData: { type: Boolean, default: false, index: true },
  seedSource: { type: String, default: '', index: true },
  seedId: { type: String, unique: true, sparse: true, index: true },
  
  // Dynamic category details (Vehicles, Properties, Jobs, Services, Agriculture, Businesses, Electronics)
  details: { type: mongoose.Schema.Types.Mixed, default: {} }
}, { timestamps: true });

// Sync geoPoint and media before saving
listingSchema.pre('save', function (next) {
  if (
    this.location &&
    typeof this.location.latitude === 'number' &&
    typeof this.location.longitude === 'number' &&
    !isNaN(this.location.latitude) &&
    !isNaN(this.location.longitude)
  ) {
    this.geoPoint = {
      type: 'Point',
      coordinates: [this.location.longitude, this.location.latitude]
    };
  }

  // Auto-sync images array from media array (ensuring cover image is at images[0])
  if (Array.isArray(this.media) && this.media.length > 0) {
    const sortedMedia = [...this.media].sort((a, b) => {
      if (a.isCover && !b.isCover) return -1;
      if (!a.isCover && b.isCover) return 1;
      return (a.order || 0) - (b.order || 0);
    });
    this.images = sortedMedia.map(m => m.secure_url || m.url).filter(Boolean);
  } else if (Array.isArray(this.images) && this.images.length > 0 && (!this.media || this.media.length === 0)) {
    this.media = this.images.map((imgUrl, idx) => ({
      url: imgUrl,
      secure_url: imgUrl,
      publicId: `external_${idx}_${Date.now()}`,
      isCover: idx === 0,
      order: idx
    }));
  }

  next();
});

// Indexes for high-performance marketplace searching & filtering
listingSchema.index({ geoPoint: '2dsphere' });
listingSchema.index({ status: 1, categorySlug: 1, createdAt: -1 });
listingSchema.index({ status: 1, price: 1, createdAt: -1 });
listingSchema.index({ status: 1, 'location.city': 1, createdAt: -1 });
listingSchema.index({ status: 1, 'location.country': 1, 'location.region': 1, 'location.city': 1 });
listingSchema.index({ status: 1, listingType: 1, condition: 1 });
listingSchema.index({ status: 1, featured: -1, createdAt: -1 });

// Text search index over primary text fields
listingSchema.index({
  title: 'text',
  description: 'text',
  'location.city': 'text',
  'location.region': 'text',
  'location.localArea': 'text',
  categorySlug: 'text',
  subcategoryName: 'text'
});

export const Listing = mongoose.model('Listing', listingSchema);

