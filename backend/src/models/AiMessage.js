import mongoose from 'mongoose';

const aiMessageSchema = new mongoose.Schema(
  {
    conversationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'AiConversation',
      required: true,
      index: true
    },
    sender: {
      type: String,
      enum: ['user', 'assistant', 'system'],
      required: true
    },
    message: {
      type: String,
      required: true
    },
    metadata: {
      type: mongoose.Schema.Types.Mixed,
      default: {}
    }
  },
  { timestamps: true }
);

aiMessageSchema.index({ conversationId: 1, createdAt: 1 });

export const AiMessage = mongoose.model('AiMessage', aiMessageSchema);
export default AiMessage;
