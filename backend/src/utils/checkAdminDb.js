import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { User } from '../models/User.js';

dotenv.config();

async function check() {
  await mongoose.connect(process.env.MONGODB_URI);
  const users = await User.find({
    $or: [
      { role: 'ADMIN' },
      { role: 'admin' },
      { username: 'velvorax_admin' },
      { email: 'rarajuvagga@velvorax.tech' },
      { email: 'admin@velvorax.com' }
    ]
  });

  console.log(`Found ${users.length} admin/target user documents:`);
  for (const u of users) {
    console.log({
      id: u._id,
      name: u.name,
      username: u.username,
      email: u.email,
      role: u.role,
      accountStatus: u.accountStatus,
      isMatch_vmprv: await u.matchPassword('vmprv_6891'),
      isMatch_vmprv_space: await u.matchPassword(' vmprv_6891'),
      isMatch_VxAdmin: await u.matchPassword('VxAdmin@2026#Secure'),
      isMatch_Pass123: await u.matchPassword('Password@123')
    });
  }
  await mongoose.disconnect();
}

check();
