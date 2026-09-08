import mongoose from 'mongoose';

const savedSearchSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  title: { type: String, required: true },
  query: { type: String, default: '' },
  category: { type: String, default: '' },
  location: { type: String, default: '' },
  filters: { type: mongoose.Schema.Types.Mixed, default: {} },
  notifyOnMatch: { type: Boolean, default: true }
}, { timestamps: true });

export const SavedSearch = mongoose.model('SavedSearch', savedSearchSchema);
