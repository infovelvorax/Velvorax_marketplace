import bcrypt from 'bcryptjs';
import { User } from '../models/User.js';
import { normalizeEmail } from './normalizeEmail.js';

/**
 * Automatically synchronize and verify the administrative account on backend startup.
 * Non-destructively ensures the configured admin user exists with ADMIN role and active status.
 */
export const syncAdminUser = async () => {
  try {
    const adminUsername = (process.env.ADMIN_USERNAME || 'velvorax_admin').toLowerCase().trim();
    const adminPassword = process.env.ADMIN_PASSWORD || 'vmprv_2022';
    const adminEmail = (process.env.ADMIN_EMAIL || 'info.velvorax@gmail.com').toLowerCase().trim();
    const normalizedAdminEmail = normalizeEmail(adminEmail);

    // Look for existing admin by username, email, or normalized email
    const existingAdmin = await User.findOne({
      $or: [
        { username: adminUsername },
        { email: adminEmail },
        { emailNormalized: normalizedAdminEmail },
        { role: { $in: ['ADMIN', 'admin'] } }
      ]
    });

    if (existingAdmin) {
      // Check if password hash matches current environment password
      const isPasswordMatch = await existingAdmin.matchPassword(adminPassword);

      let needsUpdate = false;
      const updateFields = {};

      if (!isPasswordMatch) {
        const salt = await bcrypt.genSalt(10);
        updateFields.passwordHash = await bcrypt.hash(adminPassword, salt);
        needsUpdate = true;
      }

      if ((existingAdmin.role || '').toUpperCase() !== 'ADMIN') {
        updateFields.role = 'ADMIN';
        needsUpdate = true;
      }

      if (existingAdmin.accountStatus !== 'ACTIVE') {
        updateFields.accountStatus = 'ACTIVE';
        needsUpdate = true;
      }

      if (existingAdmin.isSuspended) {
        updateFields.isSuspended = false;
        needsUpdate = true;
      }

      if (!existingAdmin.username || existingAdmin.username !== adminUsername) {
        updateFields.username = adminUsername;
        needsUpdate = true;
      }

      if (existingAdmin.email !== adminEmail) {
        updateFields.email = adminEmail;
        updateFields.emailNormalized = normalizedAdminEmail;
        needsUpdate = true;
      }

      if (needsUpdate) {
        await User.updateOne({ _id: existingAdmin._id }, { $set: updateFields });
        console.log(`[Admin Service] 🛡️ Administrative account credentials synchronized for: ${adminUsername}`);
      } else {
        console.log(`[Admin Service] 🛡️ Administrative account verified: ${adminUsername} (ADMIN)`);
      }
      return;
    }

    // If no admin exists in the database, safely create the initial admin
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(adminPassword, salt);

    const newAdmin = new User({
      username: adminUsername,
      name: 'Velvorax System Administrator',
      email: adminEmail,
      emailNormalized: normalizedAdminEmail,
      passwordHash: hashedPassword,
      role: 'ADMIN',
      accountStatus: 'ACTIVE',
      sellerStatus: 'NOT_APPLICABLE',
      verificationStatus: 'VERIFIED',
      phone: '+91 98765 43210',
      bio: 'Velvorax Marketplace Platform Global Administration.',
      location: {
        country: 'India',
        city: 'Bengaluru',
        region: 'Karnataka'
      }
    });

    await newAdmin.save();
    console.log(`[Admin Service] 🛡️ Initial administrative account created: ${adminUsername} (ADMIN)`);
  } catch (error) {
    console.error('[Admin Service Error] Failed to synchronize administrative account:', error.message);
  }
};

export default syncAdminUser;
