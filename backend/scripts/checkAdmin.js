import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import dns from 'dns';
import { User } from '../src/models/User.js';

try {
  dns.setServers(['8.8.8.8', '1.1.1.1', '8.8.4.4']);
} catch {}

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, '../.env') });

async function check() {
  await mongoose.connect(process.env.MONGODB_URI);
  console.log('Connected to DB');

  const allUsers = await User.find({}).lean();
  console.log('Total users:', allUsers.length);
  const admins = await User.find({ role: { $in: ['ADMIN', 'admin'] } });
  console.log('Admin accounts:', admins.map(a => ({
    id: a._id,
    username: a.username,
    email: a.email,
    role: a.role,
    accountStatus: a.accountStatus
  })));

  for (const admin of admins) {
    const test1 = await admin.matchPassword('vmprv_2022');
    const test2 = await admin.matchPassword('VxAdmin@2026#Secure');
    console.log(`User: ${admin.username} (${admin.email}) | matches 'vmprv_2022': ${test1} | matches 'VxAdmin@2026#Secure': ${test2}`);
  }

  await mongoose.disconnect();
}

check().catch(console.error);
