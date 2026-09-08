import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import { normalizeEmail } from '../utils/normalizeEmail.js';

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    trim: true,
    sparse: true,
    unique: true,
    lowercase: true,
    index: true
  },
  name: { type: String, required: true, trim: true },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true, index: true },
  emailNormalized: { 
    type: String, 
    required: true, 
    unique: true, 
    lowercase: true, 
    trim: true, 
    index: true 
  },
  passwordHash: { type: String, required: true },
  phone: { type: String, default: '' },
  bio: { type: String, default: '' },
  profilePhoto: { type: String, default: '' },
  role: { 
    type: String, 
    enum: ['BUYER', 'USER', 'SELLER', 'PROVIDER', 'EMPLOYER', 'BUSINESS', 'ADMIN', 'MODERATOR', 'admin', 'seller', 'buyer'],
    default: 'BUYER'
  },
  sellerCategory: {
    type: String,
    enum: ['properties', 'vehicles', 'products', 'jobs', 'services', 'farm', 'businesses', 'rentals', 'free', 'general'],
    default: 'properties'
  },
  enabledCategories: {
    type: [String],
    default: function() {
      return ['properties', 'vehicles', 'products', 'jobs', 'services', 'farm', 'businesses', 'rentals', 'free', 'general'];
    }
  },
  activeCategory: {
    type: String,
    enum: ['properties', 'vehicles', 'products', 'jobs', 'services', 'farm', 'businesses', 'rentals', 'free', 'general'],
    default: 'properties'
  },
  companyName: { type: String, default: '' },
  businessType: { type: String, default: '' },
  sellerStatus: {
    type: String,
    enum: ['PENDING_APPROVAL', 'APPROVED', 'REJECTED', 'SUSPENDED', 'NOT_APPLICABLE'],
    default: function() {
      return (this.role === 'SELLER' || this.role === 'seller') ? 'PENDING_APPROVAL' : 'NOT_APPLICABLE';
    }
  },

  sellerRejectionReason: { type: String, default: '' },
  sellerApprovedAt: { type: Date, default: null },
  sellerApprovedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
  accountStatus: {
    type: String,
    enum: ['ACTIVE', 'SUSPENDED', 'BLOCKED'],
    default: 'ACTIVE'
  },
  verificationStatus: {
    type: String,
    enum: ['UNVERIFIED', 'PENDING', 'VERIFIED', 'APPROVED', 'REJECTED'],
    default: 'UNVERIFIED'
  },
  verification: {
    aadhaarMasked: { type: String, default: '' },
    panMasked: { type: String, default: '' },
    status: {
      type: String,
      enum: ['UNVERIFIED', 'PENDING', 'APPROVED', 'VERIFIED', 'REJECTED'],
      default: 'UNVERIFIED'
    },
    submittedAt: { type: Date, default: null },
    reviewedAt: { type: Date, default: null },
    reviewedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
    rejectionReason: { type: String, default: '' }
  },
  rating: { type: Number, default: 5.0 },
  reviewCount: { type: Number, default: 0 },
  location: {
    country: { type: String, default: 'India' },
    countryCode: { type: String, default: 'IN' },
    state: { type: String, default: '' },
    region: { type: String, default: '' },
    city: { type: String, default: '' },
    localArea: { type: String, default: '' },
  },
  social: {
    website: { type: String, default: '' },
    twitter: { type: String, default: '' },
    linkedin: { type: String, default: '' },
  },
  shippingAddress: {
    fullName: { type: String, default: '' },
    phone: { type: String, default: '' },
    street: { type: String, default: '' },
    city: { type: String, default: '' },
    region: { type: String, default: '' },
    country: { type: String, default: 'India' },
    postalCode: { type: String, default: '' }
  },
  preferences: {
    theme: { type: String, default: 'dark' },
    currency: { type: String, default: 'INR' },
    language: { type: String, default: 'en' },
    emailNotifications: { type: Boolean, default: true },
    orderUpdates: { type: Boolean, default: true },
    chatAlerts: { type: Boolean, default: true },
    marketingEmails: { type: Boolean, default: false },
    profileVisibility: { type: String, default: 'PUBLIC' },
    showOnlineStatus: { type: Boolean, default: true }
  },
  isSuspended: { type: Boolean, default: false },
  resetPasswordToken: { type: String, default: null },
  resetPasswordExpire: { type: Date, default: null },
  resetPasswordOtp: { type: String, default: null },
}, { timestamps: true });


// Match user entered password to hashed password in database
userSchema.methods.matchPassword = async function(enteredPassword) {
  if (!enteredPassword || !this.passwordHash) return false;
  try {
    const directMatch = await bcrypt.compare(enteredPassword, this.passwordHash);
    if (directMatch) return true;
    if (typeof enteredPassword === 'string') {
      const trimmed = enteredPassword.trim();
      if (trimmed && trimmed !== enteredPassword) {
        return await bcrypt.compare(trimmed, this.passwordHash);
      }
    }
    return false;
  } catch {
    return false;
  }
};


// Pre-validate & pre-save hook to ensure emailNormalized and password hashing
userSchema.pre('validate', function() {
  if (this.email) {
    this.email = this.email.trim().toLowerCase();
    this.emailNormalized = normalizeEmail(this.email);
  }
  if (!this.enabledCategories || this.enabledCategories.length === 0) {
    this.enabledCategories = ['properties', 'vehicles', 'products', 'jobs', 'services', 'farm', 'businesses', 'rentals', 'free', 'general'];
  }
  if (!this.activeCategory) {
    this.activeCategory = this.sellerCategory || 'properties';
  }
});

userSchema.pre('save', async function() {
  if (this.email) {
    this.email = this.email.trim().toLowerCase();
    this.emailNormalized = normalizeEmail(this.email);
  }
  if (!this.isModified('passwordHash')) {
    return;
  }
  // Prevent double hashing if password is already a valid bcrypt hash
  if (typeof this.passwordHash === 'string' && (this.passwordHash.startsWith('$2a$') || this.passwordHash.startsWith('$2b$'))) {
    return;
  }
  const salt = await bcrypt.genSalt(10);
  this.passwordHash = await bcrypt.hash(this.passwordHash, salt);
});

export const User = mongoose.model('User', userSchema);

