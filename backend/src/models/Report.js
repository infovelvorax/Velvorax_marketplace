import mongoose from 'mongoose';

const reportSchema = new mongoose.Schema({
  reporterId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  targetType: {
    type: String,
    enum: ['LISTING', 'USER', 'MESSAGE', 'REVIEW', 'ORDER', 'OTHER'],
    default: 'LISTING',
    uppercase: true,
    trim: true,
    required: true
  },
  targetId: { type: mongoose.Schema.Types.ObjectId, required: true, index: true },
  reason: {
    type: String,
    enum: [
      'FRAUD',
      'SCAM',
      'INAPPROPRIATE',
      'INAPPROPRIATE_CONTENT',
      'SPAM',
      'WRONG_CATEGORY',
      'MISCATEGORIZED',
      'DUPLICATE',
      'PROHIBITED',
      'PROHIBITED_ITEM',
      'MISLEADING',
      'HARASSMENT',
      'OFFENSIVE',
      'COPYRIGHT',
      'OTHER'
    ],
    default: 'OTHER',
    uppercase: true,
    trim: true,
    required: true
  },
  description: { type: String, default: '' },
  signature: { type: String, default: '' },
  status: {
    type: String,
    enum: ['OPEN', 'PENDING', 'INVESTIGATING', 'RESOLVED', 'DISMISSED', 'ACTION_TAKEN', 'CLOSED'],
    default: 'OPEN',
    uppercase: true,
    trim: true
  },
  adminAction: { type: String, default: '' },
  action: { type: String, default: '' },
  resolvedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
  resolvedAt: { type: Date, default: null },
  resolutionNote: { type: String, default: '' }
}, { timestamps: true });

export const Report = mongoose.model('Report', reportSchema);

