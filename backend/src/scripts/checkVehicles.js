import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

import { connectDB } from '../config/db.js';
import { Listing } from '../models/Listing.js';

const check = async () => {
  await connectDB();
  const vehicles = await Listing.find({ categorySlug: 'vehicles' }).select('title description categorySlug subcategoryName location details price status');
  console.log('Vehicles listings count:', vehicles.length);
  vehicles.forEach((v, i) => {
    console.log(`${i+1}. [${v.status}] "${v.title}" | Subcat: "${v.subcategoryName}" | City: "${v.location?.city}" | Brand: "${v.details?.brand}" | Type: "${v.details?.vehicleType}"`);
  });
  
  // Now simulate getListings query for q=bike, category=vehicles
  const query1 = { status: 'APPROVED', categorySlug: 'vehicles' };
  const rawTerm = 'bike';
  const regex = { $regex: rawTerm, $options: 'i' };
  query1.$or = [
    { title: regex },
    { description: regex },
    { categorySlug: regex },
    { subcategoryName: regex },
    { 'location.city': regex },
    { 'location.region': regex },
    { 'location.localArea': regex },
    { 'details.brand': regex },
    { 'details.model': regex },
    { 'details.company': regex },
    { 'details.propertyType': regex }
  ];
  const results1 = await Listing.find(query1);
  console.log('\nDirect Backend Query results for q=bike, category=vehicles (no location filter):', results1.length);
  results1.forEach(r => console.log(` - ${r.title}`));

  // Now simulate if city='Bengaluru' or city='Dubai' or whatever
  const queryWithCity = { ...query1, 'location.city': { $regex: '^Dubai$', $options: 'i' } };
  const resultsDubai = await Listing.find(queryWithCity);
  console.log('\nBackend Query results with city=Dubai:', resultsDubai.length);

  // Now simulate if user searched with category='electronics' (slug in DB is 'products')
  const queryElectronics = { status: 'APPROVED', categorySlug: 'electronics' };
  const resultsElectronics = await Listing.find(queryElectronics);
  console.log('\nBackend Query results with category=electronics:', resultsElectronics.length);

  process.exit(0);
};

check();
