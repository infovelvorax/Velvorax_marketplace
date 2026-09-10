import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

import { connectDB } from '../config/db.js';
import { User } from '../models/User.js';
import mongoose from 'mongoose';

async function inspect() {
  await connectDB();
  const adminUsers = await User.find({
    $or: [
      { role: { $in: ['ADMIN', 'admin'] } },
      { username: 'velvorax_admin' },
      { email: 'info.velvorax@gmail.com' },
      { email: 'admin@velvorax.com' }
    ]
  });

  console.log(`Found ${adminUsers.length} admin user(s) in database:`);
  for (const u of adminUsers) {
    console.log({
      id: u._id,
      name: u.name,
      username: u.username,
      email: u.email,
      emailNormalized: u.emailNormalized,
      role: u.role,
      accountStatus: u.accountStatus,
      sellerStatus: u.sellerStatus,
      isSuspended: u.isSuspended,
      hasPasswordHash: !!u.passwordHash,
      isMatch_envPassword: process.env.ADMIN_PASSWORD ? await u.matchPassword(process.env.ADMIN_PASSWORD) : 'NO_ENV_PASS',
      isMatch_vmprv_2022: await u.matchPassword('vmprv_2022'),
      isMatch_VxAdmin: await u.matchPassword('VxAdmin@2026#Secure'),
      isMatch_Pass123: await u.matchPassword('Password@123')
    });
  }
  await mongoose.disconnect();
}

inspect().catch(err => {
  console.error('Inspect error:', err);
  process.exit(1);
});
