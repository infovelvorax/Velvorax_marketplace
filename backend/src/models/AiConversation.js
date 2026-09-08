import mongoose from 'mongoose';

const aiConversationSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
      index: true
    },
    sessionId: {
      type: String,
      default: '',
      index: true
    },
    role: {
      type: String,
      enum: ['BUYER', 'SELLER', 'ADMIN', 'GUEST'],
      default: 'BUYER',
      index: true
    },
    title: {
      type: String,
      default: 'New AI Conversation',
      trim: true
    },
    lastMessageAt: {
      type: Date,
      default: Date.now
    }
  },
  { timestamps: true }
);

aiConversationSchema.index({ userId: 1, role: 1, updatedAt: -1 });
aiConversationSchema.index({ sessionId: 1, role: 1, updatedAt: -1 });

export const AiConversation = mongoose.model('AiConversation', aiConversationSchema);
export default AiConversation;
