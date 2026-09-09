import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import bcrypt from 'bcryptjs';
import dns from 'dns';
import { User } from '../models/User.js';

// Ensure DNS resolution handles SRV and prioritizes IPv4 across all networks & Windows
try {
  dns.setServers(['8.8.8.8', '1.1.1.1', '8.8.4.4']);
} catch {}
try {
  if (typeof dns.setDefaultResultOrder === 'function') {
    dns.setDefaultResultOrder('ipv4first');
  }
} catch {}

// Resolve current directory & load .env from backend root
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, '../../.env') });


export const createAdmin = async () => {
  const uri = process.env.MONGODB_URI;

  if (!uri) {
    console.error('Error: MONGODB_URI environment variable is missing.');
    process.exit(1);
  }

  const adminUsername = (process.env.ADMIN_USERNAME || 'velvorax_admin').toLowerCase().trim();
  const adminPassword = process.env.ADMIN_PASSWORD || 'VxAdmin@2026#Secure';
  const adminEmail = (process.env.ADMIN_EMAIL || 'admin@velvorax.com').toLowerCase().trim();

  try {
    // Connect to MongoDB Atlas / configured database
    await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 15000,
    });

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(adminPassword, salt);

    // Check whether an active admin account already exists
    const existingAdmin = await User.findOne({
      $or: [
        { username: adminUsername },
        { email: adminEmail },
        { role: { $in: ['ADMIN', 'admin'] } }
      ]
    });

    if (existingAdmin) {
      await User.updateOne(
        { _id: existingAdmin._id },
        {
          $set: {
            username: adminUsername,
            email: adminEmail,
            passwordHash: hashedPassword,
            role: 'ADMIN',
            accountStatus: 'ACTIVE',
            verificationStatus: 'VERIFIED',
            sellerStatus: 'NOT_APPLICABLE'
          }
        }
      );

      console.log('Admin account synchronized successfully with .env credentials.');
      console.log(`Admin username: ${adminUsername}`);
      console.log(`Admin email:    ${adminEmail}`);
      console.log(`Admin role:     ADMIN`);
      await mongoose.disconnect();
      return;
    }

    // Create First Admin Document
    const newAdmin = new User({
      username: adminUsername,
      name: 'Velvorax Admin',
      email: adminEmail,
      passwordHash: adminPassword, // Will be hashed securely by User pre-save middleware via bcrypt
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

    console.log('Admin created successfully.');
    console.log(`Admin username: ${newAdmin.username}`);
  } catch (error) {
    console.error('Error creating admin account:', error.message);
    process.exit(1);
  } finally {
    try {
      await mongoose.disconnect();
    } catch {
      // ignore
    }
  }
};


// Execute if run directly via CLI
if (process.argv[1]?.endsWith('createAdmin.js')) {
  createAdmin().then(() => {
    process.exit(0);
  }).catch((err) => {
    console.error('Fatal admin creation failure:', err.message);
    process.exit(1);
  });
}
