import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

import { connectDB } from '../config/db.js';
import { Listing } from '../models/Listing.js';

const escapeRegex = (str) => str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

const testQuery = async (q, category, city) => {
  const query = { status: 'APPROVED' };
  
  if (q && q.trim() !== '') {
    const rawTerm = q.trim();
    const escaped = escapeRegex(rawTerm);
    const exactRegex = { $regex: escaped, $options: 'i' };
    
    const tokens = rawTerm.split(/\s+/).filter(t => t.length > 0).map(escapeRegex);
    const tokenRegexes = tokens.map(t => ({ $regex: t, $options: 'i' }));
    
    const searchableFields = (regex) => [
      { title: regex },
      { description: regex },
      { categorySlug: regex },
      { subcategoryName: regex },
      { 'location.city': regex },
      { 'location.region': regex },
      { 'location.localArea': regex },
      { 'location.landmark': regex },
      { 'details.brand': regex },
      { 'details.model': regex },
      { 'details.electronicsBrand': regex },
      { 'details.electronicsModel': regex },
      { 'details.company': regex },
      { 'details.propertyType': regex },
      { 'details.vehicleType': regex },
      { 'details.productType': regex },
      { 'details.serviceType': regex },
      { 'details.jobTitle': regex },
      { 'details.bhk': regex },
      { 'details.bedrooms': regex }
    ];

    if (tokens.length > 1) {
      const allTokenConditions = tokenRegexes.map(r => ({
        $or: searchableFields(r)
      }));
      query.$and = [{ $or: [{ $or: searchableFields(exactRegex) }, { $and: allTokenConditions }] }];
    } else {
      query.$or = searchableFields(exactRegex);
    }
  }

  if (category && category !== 'all') {
    const catSlug = category.toLowerCase().trim();
    const aliasMap = {
      'electronics': ['products', 'electronics', 'mobiles-electronics'],
      'mobiles': ['products', 'mobiles-electronics'],
      'mobile': ['products', 'mobiles-electronics'],
      'phones': ['products', 'mobiles-electronics'],
      'gadgets': ['products'],
      'appliances': ['products'],
      'products': ['products', 'electronics', 'mobiles-electronics'],
      'vehicles': ['vehicles', 'cars', 'bikes', 'motorcycles'],
      'cars': ['vehicles'],
      'bikes': ['vehicles'],
      'motorcycles': ['vehicles'],
      'scooters': ['vehicles'],
      'properties': ['properties', 'real-estate', 'property'],
      'property': ['properties', 'real-estate'],
      'real-estate': ['properties', 'real-estate'],
      'apartments': ['properties'],
      'villas': ['properties'],
      'farm': ['farm', 'agriculture', 'farming'],
      'agriculture': ['farm', 'agriculture', 'farming'],
      'farming': ['farm', 'agriculture'],
      'jobs': ['jobs', 'careers', 'employment'],
      'careers': ['jobs', 'careers'],
      'employment': ['jobs', 'careers'],
      'services': ['services', 'local-services'],
      'local-services': ['services', 'local-services'],
      'furniture': ['furniture', 'home-decor'],
      'businesses': ['businesses', 'business', 'commercial'],
      'business': ['businesses', 'business', 'commercial'],
      'books': ['books-hobbies', 'books'],
      'hobbies': ['books-hobbies', 'hobbies'],
      'books-hobbies': ['books-hobbies', 'books', 'hobbies'],
      'fashion': ['fashion', 'clothing', 'apparel'],
      'pets': ['pets', 'animals']
    };
    const matchingSlugs = aliasMap[catSlug] || [catSlug];
    query.categorySlug = { $in: matchingSlugs };
  }

  if (city && city !== 'all') {
    query['location.city'] = { $regex: `^${escapeRegex(city)}$`, $options: 'i' };
  }

  const results = await Listing.find(query).limit(5);
  console.log(`\n--- Test: q="${q}", category="${category}", city="${city}" ---`);
  console.log(`Found: ${results.length} items`);
  results.forEach(r => console.log(`  * "${r.title}" [${r.categorySlug}] (${r.location?.city})`));
};

const run = async () => {
  await connectDB();
  await testQuery('bike', 'vehicles', '');
  await testQuery('honda bike', 'vehicles', '');
  await testQuery('iPhone', 'electronics', '');
  await testQuery('3 BHK Villa', 'properties', '');
  await testQuery('BMW', 'vehicles', '');
  await testQuery('Plumber', 'services', '');
  await testQuery('Tractor', 'farm', '');
  await testQuery('Developer', 'jobs', '');
  process.exit(0);
};

run();
