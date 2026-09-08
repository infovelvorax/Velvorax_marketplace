import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

import { connectDB } from '../config/db.js';
import { Listing } from '../models/Listing.js';
import { Category } from '../models/Category.js';

const check = async () => {
  await connectDB();
  const count = await Listing.countDocuments();
  const statuses = await Listing.aggregate([{ $group: { _id: '$status', count: { $sum: 1 } } }]);
  const cats = await Listing.aggregate([{ $group: { _id: '$categorySlug', count: { $sum: 1 } } }]);
  const sampleListings = await Listing.find({}).limit(5).select('title categorySlug status location details price');
  console.log('Total listings:', count);
  console.log('Statuses:', JSON.stringify(statuses, null, 2));
  console.log('Categories:', JSON.stringify(cats, null, 2));
  console.log('Sample listings:', JSON.stringify(sampleListings, null, 2));
  
  const allCategories = await Category.find({}).select('name slug _id');
  console.log('All DB Categories:', JSON.stringify(allCategories, null, 2));
  process.exit(0);
};

check();
