import mongoose from 'mongoose';

const favoriteSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  listingId: { type: mongoose.Schema.Types.ObjectId, ref: 'Listing', required: true, index: true }
}, { timestamps: true });

favoriteSchema.index({ userId: 1, listingId: 1 }, { unique: true });

export const Favorite = mongoose.model('Favorite', favoriteSchema);
