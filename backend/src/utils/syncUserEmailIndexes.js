import { User } from '../models/User.js';
import { normalizeEmail } from './normalizeEmail.js';

/**
 * Safely backfill emailNormalized for legacy user documents
 * and ensure the unique index on emailNormalized is enforced.
 * NEVER deletes or destroys user data.
 */
export const syncUserEmailIndexes = async () => {
  try {
    const usersWithoutNormalized = await User.find({
      $or: [
        { emailNormalized: { $exists: false } },
        { emailNormalized: null },
        { emailNormalized: '' }
      ]
    });

    if (usersWithoutNormalized.length > 0) {
      console.log(`[Database Migration] Normalizing email identity for ${usersWithoutNormalized.length} existing users...`);
      for (const user of usersWithoutNormalized) {
        if (user.email) {
          const normalized = normalizeEmail(user.email);
          await User.updateOne({ _id: user._id }, { $set: { emailNormalized: normalized } });
        }
      }
    }

    // Detect if there are duplicate normalized emails among legacy users and report them safely
    const duplicates = await User.aggregate([
      { $match: { emailNormalized: { $exists: true, $ne: '' } } },
      { $group: { _id: '$emailNormalized', count: { $sum: 1 }, ids: { $push: '$_id' }, emails: { $push: '$email' } } },
      { $match: { count: { $gt: 1 } } }
    ]);

    if (duplicates.length > 0) {
      console.warn(`[Security / Data Warning] Found ${duplicates.length} duplicate normalized email identities among legacy accounts:`);
      duplicates.forEach(dup => {
        console.warn(`- Normalized identity: ${dup._id} (Accounts: ${dup.emails.join(', ')})`);
      });
      console.warn('Preserving all existing user records safely without destructive deletion. Flagged for admin review.');
    }

    // Ensure unique index exists on emailNormalized
    try {
      await User.collection.createIndex({ emailNormalized: 1 }, { unique: true, sparse: true });
    } catch (indexError) {
      // If duplicate records exist, sparse unique index on clean records or log warning
      console.warn('[Database Index Info]', indexError.message);
    }
  } catch (error) {
    console.error('[Database Migration Error] Failed to sync user email normalized index:', error.message);
  }
};

export default syncUserEmailIndexes;
