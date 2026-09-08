import mongoose from 'mongoose';

const notificationSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  title: { type: String, required: true },
  message: { type: String, required: true },
  type: {
    type: String,
    enum: [
      'MESSAGE',
      'OFFER',
      'LISTING_PENDING',
      'LISTING_APPROVED',
      'LISTING_REJECTED',
      'LISTING_CHANGES_REQUESTED',
      'APPLICATION',
      'BOOKING',
      'VERIFICATION_SUBMITTED',
      'VERIFICATION_APPROVED',
      'VERIFICATION_REJECTED',
      'SYSTEM'
    ],
    default: 'SYSTEM'
  },
  link: { type: String, default: '' },
  isRead: { type: Boolean, default: false }
}, { timestamps: true });

export const Notification = mongoose.model('Notification', notificationSchema);
