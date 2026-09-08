import mongoose from 'mongoose';

const sellerVerificationSchema = new mongoose.Schema({
  sellerId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true, 
    unique: true, 
    index: true 
  },
  sellerType: { 
    type: String, 
    enum: ['OWNER', 'AGENT', 'BUILDER', 'INDIVIDUAL', 'BUSINESS'], 
    default: 'OWNER' 
  },
  businessName: { type: String, default: '' },
  reraId: { type: String, default: '' },
  
  // Masked identity references (never raw or exposed publicly)
  aadhaarMasked: { type: String, default: '' }, // e.g. 'XXXX-XXXX-1234'
  panMasked: { type: String, default: '' },     // e.g. 'ABCDE****F'
  
  // Secure document references (private, admin-only)
  documentType: { 
    type: String, 
    enum: ['AADHAAR', 'PAN', 'PASSPORT', 'VOTER_ID', 'BUSINESS_REGISTRATION', 'OTHER'], 
    default: 'AADHAAR' 
  },
  documentUrl: { type: String, default: '' },
  
  status: {
    type: String,
    enum: ['UNVERIFIED', 'PENDING', 'VERIFIED', 'REJECTED', 'CHANGES_REQUESTED'],
    default: 'PENDING',
    index: true
  },
  
  reviewedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  reviewedAt: { type: Date },
  rejectionReason: { type: String, default: '' },
  adminNotes: { type: String, default: '' }
}, { timestamps: true });

export const SellerVerification = mongoose.model('SellerVerification', sellerVerificationSchema);
export default SellerVerification;
