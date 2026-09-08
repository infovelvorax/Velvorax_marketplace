import mongoose from 'mongoose';

const messageSchema = new mongoose.Schema({
  conversationId: { type: mongoose.Schema.Types.ObjectId, ref: 'Conversation', required: true, index: true },
  senderId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  text: { type: String, required: true },
  images: [{ type: String }],
  offerDetails: {
    offerId: { type: mongoose.Schema.Types.ObjectId, ref: 'Offer' },
    amount: { type: Number },
    currency: { type: String },
    status: { type: String }
  },
  isRead: { type: Boolean, default: false }
}, { timestamps: true });

export const Message = mongoose.model('Message', messageSchema);
