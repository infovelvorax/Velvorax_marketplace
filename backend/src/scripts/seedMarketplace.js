import dns from 'dns';
try {
  dns.setServers(['8.8.8.8', '1.1.1.1', '8.8.4.4']);
} catch {}
try {
  if (typeof dns.setDefaultResultOrder === 'function') {
    dns.setDefaultResultOrder('ipv4first');
  }
} catch {}

import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { Category, Location, User, Listing } from '../models/index.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

const MONGODB_URI = process.env.MONGODB_URI;

// City coordinates and default location metadata
export const CITY_COORDINATES = {
  'Bengaluru': { lat: 12.9716, lng: 77.5946, region: 'Karnataka', country: 'India' },
  'Coimbatore': { lat: 11.0168, lng: 76.9558, region: 'Tamil Nadu', country: 'India' },
  'Chennai': { lat: 13.0827, lng: 80.2707, region: 'Tamil Nadu', country: 'India' },
  'Hyderabad': { lat: 17.3850, lng: 78.4867, region: 'Telangana', country: 'India' },
  'Mumbai': { lat: 19.0760, lng: 72.8777, region: 'Maharashtra', country: 'India' },
  'Pune': { lat: 18.5204, lng: 73.8567, region: 'Maharashtra', country: 'India' },
  'Delhi': { lat: 28.6139, lng: 77.2090, region: 'Delhi NCR', country: 'India' },
  'New Delhi': { lat: 28.6139, lng: 77.2090, region: 'Delhi NCR', country: 'India' },
  'Kochi': { lat: 9.9312, lng: 76.2673, region: 'Kerala', country: 'India' },
  'Mysuru': { lat: 12.2958, lng: 76.6394, region: 'Karnataka', country: 'India' }
};

/**
 * Generate 100 Controlled, Realistic Test Listings for Velvorax Marketplace
 */
export const getMarketplaceTestListings = (catMap, sellerIds) => {
  const sId = (idx) => sellerIds[idx % sellerIds.length];

  return [
    // =========================================================================
    // 1. PROPERTIES (10 TEST LISTINGS)
    // =========================================================================
    {
      seedId: 'buyer-ai-test-prop-01',
      sellerId: sId(0),
      categoryId: catMap['properties'],
      categorySlug: 'properties',
      subcategoryName: 'For Sale: Houses & Apartments',
      title: '2 BHK Apartment in Coimbatore with Modular Kitchen & Balcony',
      description: 'Well-ventilated 1150 sq.ft 2 BHK apartment in Coimbatore near Avinashi Road. Gated community with 24/7 security, power backup, covered car parking, and lift. Close to IT parks and schools.',
      listingType: 'SELL',
      condition: 'NEW',
      price: 4500000,
      currency: 'INR',
      currencySymbol: '₹',
      negotiable: true,
      location: { country: 'India', region: 'Tamil Nadu', city: 'Coimbatore', localArea: 'Avinashi Road', address: 'Near Hope College Junction' },
      images: ['https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=1200&q=80', 'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=1200&q=80'],
      featured: true,
      details: {
        propertyType: 'Apartment',
        bedrooms: '2 BHK',
        bathrooms: '2',
        superBuiltupArea: '1150 sq.ft',
        furnishing: 'Semi-Furnished',
        parking: '1 Covered',
        facing: 'East',
        amenities: ['Power Backup', 'Lift', 'Security', 'Clubhouse']
      }
    },
    {
      seedId: 'buyer-ai-test-prop-02',
      sellerId: sId(1),
      categoryId: catMap['properties'],
      categorySlug: 'properties',
      subcategoryName: 'For Sale: Houses & Apartments',
      title: '3 BHK Apartment in Bengaluru under 50 Lakhs in Electronic City',
      description: 'Affordable 1350 sq.ft 3 BHK apartment in Bengaluru near Electronic City Phase 1. 3 bedrooms, 2 bathrooms, 2 balconies, swimming pool, gym, and 24-hr security. Price ₹48 Lakhs.',
      listingType: 'SELL',
      condition: 'EXCELLENT',
      price: 4800000,
      currency: 'INR',
      currencySymbol: '₹',
      negotiable: true,
      location: { country: 'India', region: 'Karnataka', city: 'Bengaluru', localArea: 'Electronic City', address: 'Phase 1, Neeladri Road' },
      images: ['https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=1200&q=80'],
      featured: true,
      details: {
        propertyType: 'Apartment',
        bedrooms: '3 BHK',
        bathrooms: '2',
        superBuiltupArea: '1350 sq.ft',
        furnishing: 'Semi-Furnished',
        parking: '1 Covered',
        amenities: ['Gym', 'Swimming Pool', 'Security', 'Power Backup']
      }
    },
    {
      seedId: 'buyer-ai-test-prop-03',
      sellerId: sId(2),
      categoryId: catMap['properties'],
      categorySlug: 'properties',
      subcategoryName: 'For Sale: Houses & Apartments',
      title: '1 BHK Flat in Chennai near OMR IT Corridor',
      description: 'Compact 620 sq.ft 1 BHK flat in Chennai on OMR Navalur. Perfect for IT professionals and rental investors. Fully modular kitchen, covered parking, and high rental yield.',
      listingType: 'SELL',
      condition: 'NEW',
      price: 2800000,
      currency: 'INR',
      currencySymbol: '₹',
      negotiable: true,
      location: { country: 'India', region: 'Tamil Nadu', city: 'Chennai', localArea: 'OMR', address: 'Near Navalur Toll Gate' },
      images: ['https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=1200&q=80'],
      featured: false,
      details: {
        propertyType: 'Apartment',
        bedrooms: '1 BHK',
        bathrooms: '1',
        superBuiltupArea: '620 sq.ft',
        furnishing: 'Unfurnished',
        parking: '1 Bike + 1 Car'
      }
    },
    {
      seedId: 'buyer-ai-test-prop-04',
      sellerId: sId(0),
      categoryId: catMap['properties'],
      categorySlug: 'properties',
      subcategoryName: 'For Sale: Houses & Apartments',
      title: 'Independent House in Coimbatore with Private Lawn and Terrace',
      description: 'Spacious 2200 sq.ft 3 BHK independent house in Coimbatore near RS Puram / Saravanampatti. Individual borewell, 3-phase EB connection, private garden lawn, and covered car parking.',
      listingType: 'SELL',
      condition: 'EXCELLENT',
      price: 7500000,
      currency: 'INR',
      currencySymbol: '₹',
      negotiable: true,
      location: { country: 'India', region: 'Tamil Nadu', city: 'Coimbatore', localArea: 'RS Puram', address: 'East Club Road' },
      images: ['https://images.unsplash.com/photo-1580587771525-78b9dba3b914?auto=format&fit=crop&w=1200&q=80'],
      featured: true,
      details: {
        propertyType: 'House',
        bedrooms: '3 BHK',
        bathrooms: '3',
        superBuiltupArea: '2200 sq.ft',
        furnishing: 'Semi-Furnished',
        parking: '2 Cars',
        amenities: ['Private Lawn', 'Borewell', 'Solar Water Heater']
      }
    },
    {
      seedId: 'buyer-ai-test-prop-05',
      sellerId: sId(1),
      categoryId: catMap['properties'],
      categorySlug: 'properties',
      subcategoryName: 'For Sale: Houses & Apartments',
      title: '4 BHK Villa in Bengaluru with Private Swimming Pool & Garden',
      description: 'Ultra-luxury 3800 sq.ft 4 BHK villa in Bengaluru near Whitefield. Contemporary Italian marble flooring, private rooftop lounge, home theatre room, and smart home automation.',
      listingType: 'SELL',
      condition: 'NEW',
      price: 28000000,
      currency: 'INR',
      currencySymbol: '₹',
      negotiable: true,
      location: { country: 'India', region: 'Karnataka', city: 'Bengaluru', localArea: 'Whitefield', address: 'Near Palm Meadows' },
      images: ['https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=1200&q=80'],
      featured: true,
      details: {
        propertyType: 'Villa',
        bedrooms: '4 BHK',
        bathrooms: '5',
        superBuiltupArea: '3800 sq.ft',
        furnishing: 'Fully Furnished',
        parking: '3 Cars',
        amenities: ['Private Pool', 'Home Theatre', 'Solar Power', 'EV Charger']
      }
    },
    {
      seedId: 'buyer-ai-test-prop-06',
      sellerId: sId(2),
      categoryId: catMap['properties'],
      categorySlug: 'properties',
      subcategoryName: 'For Sale: Houses & Apartments',
      title: '2 BHK Flat in Chennai Anna Nagar Prime Residential Location',
      description: 'Prime 1050 sq.ft 2 BHK flat in Chennai Anna Nagar West. Close to metro station, top schools, and shopping malls. Teak wood doors, premium sanitary fittings, and 100% vaastu compliant.',
      listingType: 'SELL',
      condition: 'EXCELLENT',
      price: 5500000,
      currency: 'INR',
      currencySymbol: '₹',
      negotiable: true,
      location: { country: 'India', region: 'Tamil Nadu', city: 'Chennai', localArea: 'Anna Nagar', address: '2nd Avenue, Anna Nagar West' },
      images: ['https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?auto=format&fit=crop&w=1200&q=80'],
      featured: false,
      details: {
        propertyType: 'Apartment',
        bedrooms: '2 BHK',
        bathrooms: '2',
        superBuiltupArea: '1050 sq.ft',
        furnishing: 'Semi-Furnished',
        parking: '1 Covered Car Parking'
      }
    },
    {
      seedId: 'buyer-ai-test-prop-07',
      sellerId: sId(3),
      categoryId: catMap['properties'],
      categorySlug: 'properties',
      subcategoryName: 'Lands & Plots',
      title: 'Residential Plot in Hyderabad Gated Layout near Hitec City',
      description: 'HMDA approved 250 sq.yds residential plot in Hyderabad near Financial District / Gachibowli. 40ft wide blacktop roads, underground drainage, electricity, and clear title deed.',
      listingType: 'SELL',
      condition: 'NOT_APPLICABLE',
      price: 3500000,
      currency: 'INR',
      currencySymbol: '₹',
      negotiable: true,
      location: { country: 'India', region: 'Telangana', city: 'Hyderabad', localArea: 'Gachibowli', address: 'Near Financial District' },
      images: ['https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=1200&q=80'],
      featured: false,
      details: {
        propertyType: 'Plot',
        landArea: '250 Sq.Yards',
        plotDimensions: '30x75 ft',
        approvalAuthority: 'HMDA Approved',
        facing: 'North-East'
      }
    },
    {
      seedId: 'buyer-ai-test-prop-08',
      sellerId: sId(1),
      categoryId: catMap['properties'],
      categorySlug: 'properties',
      subcategoryName: 'For Sale: Houses & Apartments',
      title: '3 BHK House in Pune Koregaon Park with Modular Interiors',
      description: 'Peaceful 1800 sq.ft 3 BHK row house in Pune Koregaon Park. Beautiful natural lighting, private terrace garden, modular Italian kitchen, and 2 designated covered car parking slots.',
      listingType: 'SELL',
      condition: 'EXCELLENT',
      price: 6500000,
      currency: 'INR',
      currencySymbol: '₹',
      negotiable: true,
      location: { country: 'India', region: 'Maharashtra', city: 'Pune', localArea: 'Koregaon Park', address: 'Lane 5, North Main Road' },
      images: ['https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=80'],
      featured: true,
      details: {
        propertyType: 'House',
        bedrooms: '3 BHK',
        bathrooms: '3',
        superBuiltupArea: '1800 sq.ft',
        furnishing: 'Fully Furnished',
        parking: '2 Cars'
      }
    },
    {
      seedId: 'buyer-ai-test-prop-09',
      sellerId: sId(2),
      categoryId: catMap['properties'],
      categorySlug: 'properties',
      subcategoryName: 'For Sale: Houses & Apartments',
      title: '2 BHK Apartment in Kochi Marine Drive with Waterfront View',
      description: 'Stunning 1200 sq.ft 2 BHK waterfront apartment in Kochi Marine Drive. Panoramic Arabian Sea views, infinity swimming pool, clubhouse, 24/7 high-speed elevators, and backup generator.',
      listingType: 'SELL',
      condition: 'NEW',
      price: 4200000,
      currency: 'INR',
      currencySymbol: '₹',
      negotiable: true,
      location: { country: 'India', region: 'Kerala', city: 'Kochi', localArea: 'Marine Drive', address: 'Near Rainbow Bridge' },
      images: ['https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=1200&q=80'],
      featured: false,
      details: {
        propertyType: 'Apartment',
        bedrooms: '2 BHK',
        bathrooms: '2',
        superBuiltupArea: '1200 sq.ft',
        furnishing: 'Semi-Furnished',
        parking: '1 Covered'
      }
    },
    {
      seedId: 'buyer-ai-test-prop-10',
      sellerId: sId(0),
      categoryId: catMap['properties'],
      categorySlug: 'properties',
      subcategoryName: 'For Sale: Houses & Apartments',
      title: 'Villa in Mumbai Bandra West Sea Facing Luxury Duplex Residence',
      description: 'Exclusive 4500 sq.ft sea-facing luxury villa in Mumbai Bandra West. Private infinity deck, imported Italian fixtures, 4 master suites, staff quarters, and 4 automated garage slots.',
      listingType: 'SELL',
      condition: 'NEW',
      price: 45000000,
      currency: 'INR',
      currencySymbol: '₹',
      negotiable: true,
      location: { country: 'India', region: 'Maharashtra', city: 'Mumbai', localArea: 'Bandra West', address: 'Carter Road Promenade' },
      images: ['https://images.unsplash.com/photo-1613490493576-7fde63acd811?auto=format&fit=crop&w=1200&q=80'],
      featured: true,
      details: {
        propertyType: 'Villa',
        bedrooms: '4 BHK',
        bathrooms: '6',
        superBuiltupArea: '4500 sq.ft',
        furnishing: 'Fully Furnished',
        parking: '4 Cars'
      }
    },

    // =========================================================================
    // 2. CARS & BIKES / VEHICLES (10 TEST LISTINGS)
    // =========================================================================
    {
      seedId: 'buyer-ai-test-veh-01',
      sellerId: sId(0),
      categoryId: catMap['vehicles'],
      categorySlug: 'vehicles',
      subcategoryName: 'Motorcycles & Scooters',
      title: 'Honda Activa 6G Scooter 2022 Single Owner Low KM',
      description: 'Well maintained two wheeler Honda Activa 6G scooter in Chennai. Only 14,000 km driven, brand new tubeless tyres, valid insurance, excellent mileage 55 kmpl. Price ₹65,000.',
      listingType: 'SELL',
      condition: 'EXCELLENT',
      price: 65000,
      currency: 'INR',
      currencySymbol: '₹',
      negotiable: true,
      location: { country: 'India', region: 'Tamil Nadu', city: 'Chennai', localArea: 'T Nagar', address: 'Near Pondy Bazaar' },
      images: ['https://images.unsplash.com/photo-1558981403-c5f9899a28bc?auto=format&fit=crop&w=1200&q=80'],
      featured: true,
      details: {
        brand: 'Honda',
        model: 'Activa 6G',
        vehicleType: 'two_wheeler',
        year: 2022,
        mileage: '14,000 km',
        fuel: 'Petrol',
        transmission: 'Automatic',
        owners: '1st Owner',
        insurance: 'Valid'
      }
    },
    {
      seedId: 'buyer-ai-test-veh-02',
      sellerId: sId(1),
      categoryId: catMap['vehicles'],
      categorySlug: 'vehicles',
      subcategoryName: 'Motorcycles & Scooters',
      title: 'Royal Enfield Classic 350 Stealth Black 2023 Dual ABS Bike',
      description: 'Pristine Royal Enfield Classic 350 Stealth Black motorcycle in Chennai. Single owner, 8,200 km done, touring seat, original crash guard, sump guard, and zero accident history.',
      listingType: 'SELL',
      condition: 'LIKE_NEW',
      price: 185000,
      currency: 'INR',
      currencySymbol: '₹',
      negotiable: true,
      location: { country: 'India', region: 'Tamil Nadu', city: 'Chennai', localArea: 'Adyar', address: 'Near Gandhi Nagar' },
      images: ['https://images.unsplash.com/photo-1558981403-c5f9899a28bc?auto=format&fit=crop&w=1200&q=80'],
      featured: true,
      details: {
        brand: 'Royal Enfield',
        model: 'Classic 350',
        vehicleType: 'two_wheeler',
        year: 2023,
        mileage: '8,200 km',
        fuel: 'Petrol',
        transmission: 'Manual',
        owners: '1st Owner'
      }
    },
    {
      seedId: 'buyer-ai-test-veh-03',
      sellerId: sId(2),
      categoryId: catMap['vehicles'],
      categorySlug: 'vehicles',
      subcategoryName: 'Motorcycles & Scooters',
      title: 'Yamaha R15 V4 Racing Blue Edition 2023 Quickshifter Bike',
      description: 'Super sporty two wheeler Yamaha R15 V4 in Bengaluru. Quickshifter, Traction Control, Bluetooth Y-Connect, 9,500 km done, completely serviced at authorized Yamaha center.',
      listingType: 'SELL',
      condition: 'LIKE_NEW',
      price: 145000,
      currency: 'INR',
      currencySymbol: '₹',
      negotiable: true,
      location: { country: 'India', region: 'Karnataka', city: 'Bengaluru', localArea: 'Indiranagar', address: '100ft Road' },
      images: ['https://images.unsplash.com/photo-1568772585407-9361f9bf3a87?auto=format&fit=crop&w=1200&q=80'],
      featured: false,
      details: {
        brand: 'Yamaha',
        model: 'R15 V4',
        vehicleType: 'two_wheeler',
        year: 2023,
        mileage: '9,500 km',
        fuel: 'Petrol',
        transmission: 'Manual'
      }
    },
    {
      seedId: 'buyer-ai-test-veh-04',
      sellerId: sId(0),
      categoryId: catMap['vehicles'],
      categorySlug: 'vehicles',
      subcategoryName: 'Motorcycles & Scooters',
      title: 'TVS Apache RTR 160 4V Special Edition Bike 2022 Under 80000',
      description: 'Reliable TVS Apache RTR 160 4V bike in Coimbatore. Matte black finish, Bluetooth SmartXonnect, dual disc brakes, 16,000 km, excellent pickup. Price under 80000 at ₹78,000.',
      listingType: 'SELL',
      condition: 'GOOD',
      price: 78000,
      currency: 'INR',
      currencySymbol: '₹',
      negotiable: true,
      location: { country: 'India', region: 'Tamil Nadu', city: 'Coimbatore', localArea: 'RS Puram', address: 'DB Road' },
      images: ['https://images.unsplash.com/photo-1558981403-c5f9899a28bc?auto=format&fit=crop&w=1200&q=80'],
      featured: false,
      details: {
        brand: 'TVS',
        model: 'Apache RTR 160',
        vehicleType: 'two_wheeler',
        year: 2022,
        mileage: '16,000 km',
        fuel: 'Petrol',
        transmission: 'Manual'
      }
    },
    {
      seedId: 'buyer-ai-test-veh-05',
      sellerId: sId(1),
      categoryId: catMap['vehicles'],
      categorySlug: 'vehicles',
      subcategoryName: 'Motorcycles & Scooters',
      title: 'TVS Jupiter 125 Disc Bluetooth Scooter Under 80000',
      description: 'Family two wheeler TVS Jupiter 125 scooter in Bengaluru. Front fuel fill, huge 33L under-seat storage, LED headlamp, 11,000 km done. Price ₹58,000 under 80000.',
      listingType: 'SELL',
      condition: 'EXCELLENT',
      price: 58000,
      currency: 'INR',
      currencySymbol: '₹',
      negotiable: true,
      location: { country: 'India', region: 'Karnataka', city: 'Bengaluru', localArea: 'Koramangala', address: '5th Block' },
      images: ['https://images.unsplash.com/photo-1558981403-c5f9899a28bc?auto=format&fit=crop&w=1200&q=80'],
      featured: false,
      details: {
        brand: 'TVS',
        model: 'Jupiter 125',
        vehicleType: 'two_wheeler',
        year: 2022,
        mileage: '11,000 km',
        fuel: 'Petrol',
        transmission: 'Automatic'
      }
    },
    {
      seedId: 'buyer-ai-test-veh-06',
      sellerId: sId(2),
      categoryId: catMap['vehicles'],
      categorySlug: 'vehicles',
      subcategoryName: 'Cars',
      title: 'Maruti Swift ZXI Plus 2021 Manual Car in Bangalore under 8 lakh',
      description: 'Used Maruti Swift car in Bangalore. Single owner, 28,000 km driven, touchscreen infotainment with Apple CarPlay/Android Auto, push-button start, alloy wheels. Price ₹5,90,000 under 8 lakh.',
      listingType: 'SELL',
      condition: 'EXCELLENT',
      price: 590000,
      currency: 'INR',
      currencySymbol: '₹',
      negotiable: true,
      location: { country: 'India', region: 'Karnataka', city: 'Bengaluru', localArea: 'HSR Layout', address: 'Sector 2' },
      images: ['https://images.unsplash.com/photo-1549399542-7e3f8b79c341?auto=format&fit=crop&w=1200&q=80'],
      featured: true,
      details: {
        brand: 'Maruti Suzuki',
        model: 'Swift ZXI',
        vehicleType: 'four_wheeler',
        year: 2021,
        mileage: '28,000 km',
        fuel: 'Petrol',
        transmission: 'Manual',
        owners: '1st Owner'
      }
    },
    {
      seedId: 'buyer-ai-test-veh-07',
      sellerId: sId(0),
      categoryId: catMap['vehicles'],
      categorySlug: 'vehicles',
      subcategoryName: 'Cars',
      title: 'Hyundai Creta SX Executive Petrol 2022 Panoramic Sunroof Car in Bangalore',
      description: 'Popular SUV car in Bangalore Hyundai Creta SX Executive. 22,000 km, panoramic sunroof, wireless charging, rear camera, LED DRLs, immaculate condition with service records.',
      listingType: 'SELL',
      condition: 'EXCELLENT',
      price: 1150000,
      currency: 'INR',
      currencySymbol: '₹',
      negotiable: true,
      location: { country: 'India', region: 'Karnataka', city: 'Bengaluru', localArea: 'Indiranagar', address: '12th Main Road' },
      images: ['https://images.unsplash.com/photo-1549399542-7e3f8b79c341?auto=format&fit=crop&w=1200&q=80'],
      featured: true,
      details: {
        brand: 'Hyundai',
        model: 'Creta SX',
        vehicleType: 'four_wheeler',
        year: 2022,
        mileage: '22,000 km',
        fuel: 'Petrol',
        transmission: 'Manual',
        owners: '1st Owner'
      }
    },
    {
      seedId: 'buyer-ai-test-veh-08',
      sellerId: sId(3),
      categoryId: catMap['vehicles'],
      categorySlug: 'vehicles',
      subcategoryName: 'Cars',
      title: 'Tata Nexon Creative AMT Automatic SUV 2022 under 8 lakh',
      description: 'Safe 5-star GNCAP rated Tata Nexon car in Mumbai. Automatic AMT, 26,000 km, dual airbags, Harman sound system, cruise control, comprehensive insurance. Price ₹7,80,000 under 8 lakh.',
      listingType: 'SELL',
      condition: 'GOOD',
      price: 780000,
      currency: 'INR',
      currencySymbol: '₹',
      negotiable: true,
      location: { country: 'India', region: 'Maharashtra', city: 'Mumbai', localArea: 'Andheri East', address: 'Near Metro Station' },
      images: ['https://images.unsplash.com/photo-1549399542-7e3f8b79c341?auto=format&fit=crop&w=1200&q=80'],
      featured: false,
      details: {
        brand: 'Tata',
        model: 'Nexon',
        vehicleType: 'four_wheeler',
        year: 2022,
        mileage: '26,000 km',
        fuel: 'Petrol',
        transmission: 'Automatic'
      }
    },
    {
      seedId: 'buyer-ai-test-veh-09',
      sellerId: sId(1),
      categoryId: catMap['vehicles'],
      categorySlug: 'vehicles',
      subcategoryName: 'Cars',
      title: 'Hyundai Grand i10 Nios Magna 2021 Petrol under 8 lakh',
      description: 'City hatchback car in Hyderabad Hyundai Grand i10 Nios. 31,000 km driven, great fuel efficiency 20 kmpl, touchscreen audio, power windows, new battery. Price ₹5,20,000 under 8 lakh.',
      listingType: 'SELL',
      condition: 'GOOD',
      price: 520000,
      currency: 'INR',
      currencySymbol: '₹',
      negotiable: true,
      location: { country: 'India', region: 'Telangana', city: 'Hyderabad', localArea: 'Hitec City', address: 'Cyber Towers Road' },
      images: ['https://images.unsplash.com/photo-1549399542-7e3f8b79c341?auto=format&fit=crop&w=1200&q=80'],
      featured: false,
      details: {
        brand: 'Hyundai',
        model: 'Grand i10',
        vehicleType: 'four_wheeler',
        year: 2021,
        mileage: '31,000 km',
        fuel: 'Petrol',
        transmission: 'Manual'
      }
    },
    {
      seedId: 'buyer-ai-test-veh-10',
      sellerId: sId(2),
      categoryId: catMap['vehicles'],
      categorySlug: 'vehicles',
      subcategoryName: 'Cars',
      title: 'Mahindra Thar LX Hard Top 4x4 Diesel 2022 Manual',
      description: 'Rugged 4x4 Mahindra Thar SUV car in Pune. Diesel engine, hard top, touchscreen navigation, alloy wheels, adventure bumper, 18,000 km driven with zero off-road abuse.',
      listingType: 'SELL',
      condition: 'EXCELLENT',
      price: 1450000,
      currency: 'INR',
      currencySymbol: '₹',
      negotiable: true,
      location: { country: 'India', region: 'Maharashtra', city: 'Pune', localArea: 'Kothrud', address: 'Near Paud Road' },
      images: ['https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?auto=format&fit=crop&w=1200&q=80'],
      featured: true,
      details: {
        brand: 'Mahindra',
        model: 'Thar',
        vehicleType: 'four_wheeler',
        year: 2022,
        mileage: '18,000 km',
        fuel: 'Diesel',
        transmission: 'Manual'
      }
    },
    {
      seedId: 'buyer-ai-test-veh-bmw-01',
      sellerId: sId(0),
      categoryId: catMap['vehicles'],
      categorySlug: 'vehicles',
      subcategoryName: 'Cars',
      title: '2023 BMW 3 Series 330i M Sport Luxury Sedan in Bangalore',
      description: 'Pristine 2023 BMW 3 Series 330i M Sport luxury sedan in Bengaluru. Portimao Blue, 2.0L Turbocharged Petrol 255HP, BMW Live Cockpit Professional, Harman Kardon Sound, Panoramic Sunroof, 14,000 km, under BMW Service Inclusive warranty.',
      listingType: 'SELL',
      condition: 'LIKE_NEW',
      price: 4950000,
      currency: 'INR',
      currencySymbol: '₹',
      negotiable: true,
      location: { country: 'India', region: 'Karnataka', city: 'Bengaluru', localArea: 'Indiranagar', address: '100 Feet Road' },
      images: ['https://images.unsplash.com/photo-1555215695-3004980ad54e?auto=format&fit=crop&w=1200&q=80', 'https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=1200&q=80'],
      featured: true,
      details: {
        brand: 'BMW',
        model: '3 Series 330i M Sport',
        vehicleType: 'four_wheeler',
        year: 2023,
        mileage: '14,000 km',
        fuel: 'Petrol',
        transmission: 'Automatic',
        owners: '1st Owner'
      }
    },
    {
      seedId: 'buyer-ai-test-veh-bmw-02',
      sellerId: sId(1),
      categoryId: catMap['vehicles'],
      categorySlug: 'vehicles',
      subcategoryName: 'Cars',
      title: '2022 BMW X5 xDrive30d Luxury 4x4 SUV in Mumbai',
      description: 'Stunning BMW X5 xDrive30d M Sport luxury SUV in Mumbai. Mineral White, 3.0L Inline-6 TwinPower Turbo Diesel, Panoramic Sky Lounge LED Roof, Air Suspension, 22,000 km, complete BMW authorized service history.',
      listingType: 'SELL',
      condition: 'LIKE_NEW',
      price: 7450000,
      currency: 'INR',
      currencySymbol: '₹',
      negotiable: true,
      location: { country: 'India', region: 'Maharashtra', city: 'Mumbai', localArea: 'Bandra West', address: 'Carter Road' },
      images: ['https://images.unsplash.com/photo-1556189250-72ba954cfc2b?auto=format&fit=crop&w=1200&q=80'],
      featured: true,
      details: {
        brand: 'BMW',
        model: 'X5 xDrive30d',
        vehicleType: 'four_wheeler',
        year: 2022,
        mileage: '22,000 km',
        fuel: 'Diesel',
        transmission: 'Automatic',
        owners: '1st Owner'
      }
    },
    {
      seedId: 'buyer-ai-test-veh-honda-01',
      sellerId: sId(2),
      categoryId: catMap['vehicles'],
      categorySlug: 'vehicles',
      subcategoryName: 'Motorcycles & Scooters',
      title: 'Honda CB350 RS Dual Channel ABS Bike 2023 in Bangalore',
      description: 'Sporty neo-retro Honda CB350 RS motorcycle in Bengaluru. Dual-tone Radiant Red, Assist & Slipper Clutch, Honda Selectable Torque Control (HSTC), 6,500 km done, single owner, zero scratch showroom condition.',
      listingType: 'SELL',
      condition: 'LIKE_NEW',
      price: 195000,
      currency: 'INR',
      currencySymbol: '₹',
      negotiable: true,
      location: { country: 'India', region: 'Karnataka', city: 'Bengaluru', localArea: 'Koramangala', address: 'Sony World Junction' },
      images: ['https://images.unsplash.com/photo-1558981403-c5f9899a28bc?auto=format&fit=crop&w=1200&q=80'],
      featured: true,
      details: {
        brand: 'Honda',
        model: 'CB350 RS',
        vehicleType: 'two_wheeler',
        year: 2023,
        mileage: '6,500 km',
        fuel: 'Petrol',
        transmission: 'Manual',
        owners: '1st Owner'
      }
    },
    {
      seedId: 'buyer-ai-test-veh-honda-02',
      sellerId: sId(3),
      categoryId: catMap['vehicles'],
      categorySlug: 'vehicles',
      subcategoryName: 'Motorcycles & Scooters',
      title: 'Honda H\'ness CB350 Anniversary Edition Bike in Chennai',
      description: 'Classic cruiser Honda Hness CB350 motorcycle in Chennai. Pearl Nightstar Black with gold emblems, split brown seats, smartphone Bluetooth voice control, 9,800 km, valid bumper-to-bumper insurance.',
      listingType: 'SELL',
      condition: 'EXCELLENT',
      price: 188000,
      currency: 'INR',
      currencySymbol: '₹',
      negotiable: true,
      location: { country: 'India', region: 'Tamil Nadu', city: 'Chennai', localArea: 'OMR', address: 'Near Sholinganallur' },
      images: ['https://images.unsplash.com/photo-1568772585407-9361f9bf3a87?auto=format&fit=crop&w=1200&q=80'],
      featured: false,
      details: {
        brand: 'Honda',
        model: 'Hness CB350',
        vehicleType: 'two_wheeler',
        year: 2022,
        mileage: '9,800 km',
        fuel: 'Petrol',
        transmission: 'Manual',
        owners: '1st Owner'
      }
    },

    // =========================================================================
    // 3. MOBILES & ELECTRONICS (10 TEST LISTINGS)
    // =========================================================================
    {
      seedId: 'buyer-ai-test-elec-01',
      sellerId: sId(0),
      categoryId: catMap['products'],
      categorySlug: 'products',
      subcategoryName: 'Laptops & Computers',
      title: 'Dell Inspiron 15 Core i5 12th Gen 16GB RAM Laptop under ₹50,000',
      description: 'Dell Inspiron 15 3520 laptop in Bengaluru. Intel Core i5-1235U 12th Gen, 16GB DDR4 RAM, 512GB NVMe SSD, 15.6" FHD 120Hz display, backlit keyboard, Windows 11. Price ₹38,000 under ₹50,000.',
      listingType: 'SELL',
      condition: 'LIKE_NEW',
      price: 38000,
      currency: 'INR',
      currencySymbol: '₹',
      negotiable: true,
      location: { country: 'India', region: 'Karnataka', city: 'Bengaluru', localArea: 'Koramangala', address: '8th Main, 4th Block' },
      images: ['https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?auto=format&fit=crop&w=1200&q=80'],
      featured: true,
      details: {
        brand: 'Dell',
        model: 'Inspiron 15',
        processor: 'Intel Core i5-1235U',
        ram: '16 GB',
        storage: '512 GB SSD',
        screenSize: '15.6 inch FHD'
      }
    },
    {
      seedId: 'buyer-ai-test-elec-02',
      sellerId: sId(1),
      categoryId: catMap['products'],
      categorySlug: 'products',
      subcategoryName: 'Laptops & Computers',
      title: 'HP Pavilion 14 Ryzen 5 5625U 16GB RAM SSD Laptop under ₹50,000',
      description: 'Sleek HP Pavilion 14 laptop in Chennai. AMD Ryzen 5 5625U 6-core processor, 16GB RAM, 512GB PCIe SSD, B&O audio, fingerprint reader, lightweight aluminium body. Price ₹45,000 under ₹50,000.',
      listingType: 'SELL',
      condition: 'EXCELLENT',
      price: 45000,
      currency: 'INR',
      currencySymbol: '₹',
      negotiable: true,
      location: { country: 'India', region: 'Tamil Nadu', city: 'Chennai', localArea: 'Anna Nagar', address: 'Near Roundtana' },
      images: ['https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?auto=format&fit=crop&w=1200&q=80'],
      featured: false,
      details: {
        brand: 'HP',
        model: 'Pavilion 14',
        processor: 'AMD Ryzen 5',
        ram: '16 GB',
        storage: '512 GB SSD',
        screenSize: '14.0 inch FHD IPS'
      }
    },
    {
      seedId: 'buyer-ai-test-elec-03',
      sellerId: sId(2),
      categoryId: catMap['products'],
      categorySlug: 'products',
      subcategoryName: 'Laptops & Computers',
      title: 'Lenovo ThinkPad E14 Intel Core i5 Business Laptop under ₹50,000',
      description: 'Durable Lenovo ThinkPad E14 Gen 4 laptop in Hyderabad. Intel Core i5, 16GB RAM, 512GB SSD, TrackPoint keyboard, 100% battery health, military-grade durability. Price ₹42,000 under ₹50,000.',
      listingType: 'SELL',
      condition: 'LIKE_NEW',
      price: 42000,
      currency: 'INR',
      currencySymbol: '₹',
      negotiable: true,
      location: { country: 'India', region: 'Telangana', city: 'Hyderabad', localArea: 'Gachibowli', address: 'Near DLF Cybercity' },
      images: ['https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?auto=format&fit=crop&w=1200&q=80'],
      featured: false,
      details: {
        brand: 'Lenovo',
        model: 'ThinkPad E14',
        processor: 'Intel Core i5',
        ram: '16 GB',
        storage: '512 GB SSD',
        screenSize: '14.0 inch FHD'
      }
    },
    {
      seedId: 'buyer-ai-test-elec-04',
      sellerId: sId(0),
      categoryId: catMap['products'],
      categorySlug: 'products',
      subcategoryName: 'Laptops & Computers',
      title: 'Apple MacBook Air M1 256GB SSD Space Grey under 1 lakh',
      description: 'Pristine condition Apple MacBook Air M1 8GB RAM 256GB SSD in Bengaluru. Battery health 95%, 13.3-inch Retina display, Magic Keyboard, original Apple charger and box included. Price ₹68,000 under 1 lakh.',
      listingType: 'SELL',
      condition: 'LIKE_NEW',
      price: 68000,
      currency: 'INR',
      currencySymbol: '₹',
      negotiable: true,
      location: { country: 'India', region: 'Karnataka', city: 'Bengaluru', localArea: 'Indiranagar', address: 'Near Metro Station' },
      images: ['https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&w=1200&q=80'],
      featured: true,
      details: {
        brand: 'Apple',
        model: 'MacBook Air M1',
        processor: 'Apple M1 Chip',
        ram: '8 GB',
        storage: '256 GB SSD',
        batteryHealth: '95%'
      }
    },
    {
      seedId: 'buyer-ai-test-elec-05',
      sellerId: sId(1),
      categoryId: catMap['products'],
      categorySlug: 'products',
      subcategoryName: 'Laptops & Computers',
      title: 'Apple MacBook Pro 14 M3 16GB RAM 512GB Space Black',
      description: 'Flagship Apple MacBook Pro 14-inch with M3 chip, 16GB Unified Memory, 512GB SSD, Liquid Retina XDR display, 100% battery capacity. AppleCare+ warranty valid. Price ₹1,65,000.',
      listingType: 'SELL',
      condition: 'NEW',
      price: 165000,
      currency: 'INR',
      currencySymbol: '₹',
      negotiable: true,
      location: { country: 'India', region: 'Maharashtra', city: 'Mumbai', localArea: 'Bandra West', address: 'Bandra Bandstand' },
      images: ['https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&w=1200&q=80'],
      featured: true,
      details: {
        brand: 'Apple',
        model: 'MacBook Pro 14',
        processor: 'Apple M3',
        ram: '16 GB',
        storage: '512 GB SSD',
        screenSize: '14.2 inch Liquid Retina XDR'
      }
    },
    {
      seedId: 'buyer-ai-test-elec-06',
      sellerId: sId(2),
      categoryId: catMap['products'],
      categorySlug: 'products',
      subcategoryName: 'Mobile Phones',
      title: 'Samsung Galaxy S23 5G 128GB Phantom Black Smartphone',
      description: 'Compact flagship Samsung Galaxy S23 5G mobile phone in Delhi. Snapdragon 8 Gen 2, 50MP triple camera, 120Hz Dynamic AMOLED 2X, bill, box, and Spigen case included. Price ₹48,000.',
      listingType: 'SELL',
      condition: 'LIKE_NEW',
      price: 48000,
      currency: 'INR',
      currencySymbol: '₹',
      negotiable: true,
      location: { country: 'India', region: 'Delhi NCR', city: 'Delhi', localArea: 'Connaught Place', address: 'Inner Circle' },
      images: ['https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?auto=format&fit=crop&w=1200&q=80'],
      featured: false,
      details: {
        brand: 'Samsung',
        model: 'Galaxy S23',
        storage: '128 GB',
        ram: '8 GB',
        color: 'Phantom Black'
      }
    },
    {
      seedId: 'buyer-ai-test-elec-07',
      sellerId: sId(0),
      categoryId: catMap['products'],
      categorySlug: 'products',
      subcategoryName: 'Mobile Phones',
      title: 'Samsung Galaxy M34 5G 128GB 6000mAh Phone under 30000',
      description: 'Battery powerhouse Samsung Galaxy M34 5G phone in Bengaluru under 30000. 6000mAh battery, 50MP No Shake OIS camera, 120Hz sAMOLED display, 8GB RAM, 128GB storage. Price ₹18,500.',
      listingType: 'SELL',
      condition: 'LIKE_NEW',
      price: 185000 / 10,
      currency: 'INR',
      currencySymbol: '₹',
      negotiable: true,
      location: { country: 'India', region: 'Karnataka', city: 'Bengaluru', localArea: 'Whitefield', address: 'ITPL Main Road' },
      images: ['https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?auto=format&fit=crop&w=1200&q=80'],
      featured: false,
      details: {
        brand: 'Samsung',
        model: 'Galaxy M34',
        storage: '128 GB',
        ram: '8 GB',
        battery: '6000 mAh'
      }
    },
    {
      seedId: 'buyer-ai-test-elec-08',
      sellerId: sId(3),
      categoryId: catMap['products'],
      categorySlug: 'products',
      subcategoryName: 'Mobile Phones',
      title: 'Apple iPhone 13 128GB Starlight with Original Bill & Box',
      description: 'Flawless Apple iPhone 13 128GB smartphone in Coimbatore. Battery health 89%, A15 Bionic chip, cinematic video mode, Ceramic Shield, original box, and Apple cable. Price ₹39,000.',
      listingType: 'SELL',
      condition: 'EXCELLENT',
      price: 39000,
      currency: 'INR',
      currencySymbol: '₹',
      negotiable: true,
      location: { country: 'India', region: 'Tamil Nadu', city: 'Coimbatore', localArea: 'RS Puram', address: 'West Club Road' },
      images: ['https://images.unsplash.com/photo-1510557880182-3d4d3cba35a5?auto=format&fit=crop&w=1200&q=80'],
      featured: true,
      details: {
        brand: 'Apple',
        model: 'iPhone 13',
        storage: '128 GB',
        color: 'Starlight',
        batteryHealth: '89%'
      }
    },
    {
      seedId: 'buyer-ai-test-elec-09',
      sellerId: sId(1),
      categoryId: catMap['products'],
      categorySlug: 'products',
      subcategoryName: 'Mobile Phones',
      title: 'OnePlus Nord CE 3 Lite 5G 128GB Pastel Lime Phone under 30000',
      description: 'Super-fast charging OnePlus Nord CE 3 Lite 5G mobile phone in Chennai under 30000. 108MP primary camera, 67W SUPERVOOC fast charging, 8GB RAM, 128GB storage. Price ₹19,500.',
      listingType: 'SELL',
      condition: 'LIKE_NEW',
      price: 19500,
      currency: 'INR',
      currencySymbol: '₹',
      negotiable: true,
      location: { country: 'India', region: 'Tamil Nadu', city: 'Chennai', localArea: 'OMR', address: 'Thoraipakkam' },
      images: ['https://images.unsplash.com/photo-1510557880182-3d4d3cba35a5?auto=format&fit=crop&w=1200&q=80'],
      featured: false,
      details: {
        brand: 'OnePlus',
        model: 'Nord CE 3 Lite',
        storage: '128 GB',
        ram: '8 GB',
        camera: '108 MP'
      }
    },
    {
      seedId: 'buyer-ai-test-elec-10',
      sellerId: sId(2),
      categoryId: catMap['products'],
      categorySlug: 'products',
      subcategoryName: 'TVs, Video & Audio',
      title: 'Sony Bravia 55 inch 4K Ultra HD Smart Google TV KD-55X74K',
      description: 'Cinematic Sony Bravia 55 inch 4K HDR Google TV in Pune. X1 4K Processor, Dolby Audio, Apple AirPlay, Chromecast built-in, voice remote, wall mount bracket included. Price ₹52,000.',
      listingType: 'SELL',
      condition: 'EXCELLENT',
      price: 52000,
      currency: 'INR',
      currencySymbol: '₹',
      negotiable: true,
      location: { country: 'India', region: 'Maharashtra', city: 'Pune', localArea: 'Koregaon Park', address: 'North Main Road' },
      images: ['https://images.unsplash.com/photo-1593784991095-a205069470b6?auto=format&fit=crop&w=1200&q=80'],
      featured: false,
      details: {
        brand: 'Sony',
        model: 'Bravia 55X74K',
        screenSize: '55 inch',
        resolution: '4K Ultra HD (3840x2160)',
        soundOutput: '20W Dolby Audio'
      }
    },

    // =========================================================================
    // 4. JOBS & CAREERS (10 TEST LISTINGS)
    // =========================================================================
    {
      seedId: 'buyer-ai-test-job-01',
      sellerId: sId(0),
      categoryId: catMap['jobs'],
      categorySlug: 'jobs',
      subcategoryName: 'IT & Software',
      title: 'Full Stack Developer React & Node.js Software Job in Bangalore',
      description: 'Hiring Full Stack Developer with 3-5 years experience in React.js, Node.js, Express, MongoDB, and TypeScript. Software jobs in Bangalore with flexible hybrid working. CTC ₹14 LPA.',
      listingType: 'SELL',
      condition: 'NOT_APPLICABLE',
      price: 1400000,
      currency: 'INR',
      currencySymbol: '₹',
      negotiable: true,
      location: { country: 'India', region: 'Karnataka', city: 'Bengaluru', localArea: 'HSR Layout', address: '27th Main Road' },
      images: ['https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&w=1200&q=80'],
      featured: true,
      details: {
        company: 'CloudScale Technologies',
        jobType: 'Full Time',
        workMode: 'Hybrid',
        experienceRequired: '3-5 Years',
        skills: ['React.js', 'Node.js', 'TypeScript', 'MongoDB', 'AWS'],
        salaryRange: '₹14,00,000 - ₹18,00,000 per annum'
      }
    },
    {
      seedId: 'buyer-ai-test-job-02',
      sellerId: sId(1),
      categoryId: catMap['jobs'],
      categorySlug: 'jobs',
      subcategoryName: 'IT & Software',
      title: 'Senior React Developer Frontend Engineer Jobs in Bangalore',
      description: 'Fast-growing fintech startup is looking for Senior React Developer jobs in Bangalore. Proficiency in Next.js, Redux Toolkit, TailwindCSS, performance optimization, and Jest. CTC ₹18 LPA.',
      listingType: 'SELL',
      condition: 'NOT_APPLICABLE',
      price: 1800000,
      currency: 'INR',
      currencySymbol: '₹',
      negotiable: true,
      location: { country: 'India', region: 'Karnataka', city: 'Bengaluru', localArea: 'Koramangala', address: 'Near Forum Mall' },
      images: ['https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&w=1200&q=80'],
      featured: true,
      details: {
        company: 'FinVortex Global',
        jobType: 'Full Time',
        workMode: 'Remote',
        experienceRequired: '4-7 Years',
        skills: ['React.js', 'Next.js', 'Redux', 'TypeScript', 'CSS'],
        salaryRange: '₹18,00,000 - ₹24,00,000'
      }
    },
    {
      seedId: 'buyer-ai-test-job-03',
      sellerId: sId(2),
      categoryId: catMap['jobs'],
      categorySlug: 'jobs',
      subcategoryName: 'IT & Software',
      title: 'Python Developer & AI Backend Engineer with FastAPI & AWS',
      description: 'Hiring Python Developer with solid hands-on experience in FastAPI, Django, Celery, PostgreSQL, Vector Databases, and LangChain for GenAI pipelines in Hyderabad. CTC ₹12 LPA.',
      listingType: 'SELL',
      condition: 'NOT_APPLICABLE',
      price: 1200000,
      currency: 'INR',
      currencySymbol: '₹',
      negotiable: true,
      location: { country: 'India', region: 'Telangana', city: 'Hyderabad', localArea: 'Hitec City', address: 'Cyber Towers' },
      images: ['https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?auto=format&fit=crop&w=1200&q=80'],
      featured: false,
      details: {
        company: 'NeuralBytes AI Labs',
        jobType: 'Full Time',
        workMode: 'Hybrid',
        experienceRequired: '2-4 Years',
        skills: ['Python', 'FastAPI', 'PostgreSQL', 'Docker', 'AWS'],
        salaryRange: '₹12,00,000 - ₹16,00,000'
      }
    },
    {
      seedId: 'buyer-ai-test-job-04',
      sellerId: sId(3),
      categoryId: catMap['jobs'],
      categorySlug: 'jobs',
      subcategoryName: 'IT & Software',
      title: 'Node.js Developer Microservices & Cloud Architecture in Pune',
      description: 'Software jobs in Pune: Senior Node.js Developer to build event-driven microservices with Kafka, Redis, Express, Docker, and Kubernetes for high-concurrency marketplace systems. CTC ₹15 LPA.',
      listingType: 'SELL',
      condition: 'NOT_APPLICABLE',
      price: 1500000,
      currency: 'INR',
      currencySymbol: '₹',
      negotiable: true,
      location: { country: 'India', region: 'Maharashtra', city: 'Pune', localArea: 'Koregaon Park', address: 'North Main Road' },
      images: ['https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&w=1200&q=80'],
      featured: false,
      details: {
        company: 'HyperScale Systems',
        jobType: 'Full Time',
        workMode: 'Hybrid',
        experienceRequired: '3-6 Years',
        skills: ['Node.js', 'Express', 'Kafka', 'Redis', 'MongoDB', 'Docker'],
        salaryRange: '₹15,00,000 - ₹20,00,000'
      }
    },
    {
      seedId: 'buyer-ai-test-job-05',
      sellerId: sId(0),
      categoryId: catMap['jobs'],
      categorySlug: 'jobs',
      subcategoryName: 'Design & Creative',
      title: 'UI/UX Designer & Design Systems Lead in Bangalore',
      description: 'Creative design job in Bangalore: Lead UI/UX Designer to craft world-class web and mobile user interfaces in Figma. Deep understanding of design tokens, typography, and micro-interactions.',
      listingType: 'SELL',
      condition: 'NOT_APPLICABLE',
      price: 950000,
      currency: 'INR',
      currencySymbol: '₹',
      negotiable: true,
      location: { country: 'India', region: 'Karnataka', city: 'Bengaluru', localArea: 'Indiranagar', address: '100ft Road' },
      images: ['https://images.unsplash.com/photo-1561070791-2526d30994b5?auto=format&fit=crop&w=1200&q=80'],
      featured: false,
      details: {
        company: 'PixelCraft Studios',
        jobType: 'Full Time',
        workMode: 'Remote',
        experienceRequired: '2-5 Years',
        skills: ['Figma', 'UI/UX Design', 'Design Systems', 'Prototyping', 'Wireframing'],
        salaryRange: '₹9,50,000 - ₹14,00,000'
      }
    },
    {
      seedId: 'buyer-ai-test-job-06',
      sellerId: sId(1),
      categoryId: catMap['jobs'],
      categorySlug: 'jobs',
      subcategoryName: 'Marketing & Sales',
      title: 'Digital Marketing Executive & Performance Marketing Lead in Chennai',
      description: 'Immediate opening for Digital Marketing Executive in Chennai. Drive paid acquisition (Google Ads, Meta Ads), SEO content optimization, email newsletters, and conversion funnel analytics. CTC ₹6.5 LPA.',
      listingType: 'SELL',
      condition: 'NOT_APPLICABLE',
      price: 650000,
      currency: 'INR',
      currencySymbol: '₹',
      negotiable: true,
      location: { country: 'India', region: 'Tamil Nadu', city: 'Chennai', localArea: 'Adyar', address: 'Lattice Bridge Road' },
      images: ['https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=1200&q=80'],
      featured: false,
      details: {
        company: 'BrandBoost Media',
        jobType: 'Full Time',
        workMode: 'On-site',
        experienceRequired: '2-4 Years',
        skills: ['Google Ads', 'Meta Ads', 'SEO', 'Google Analytics', 'Copywriting'],
        salaryRange: '₹6,50,000 - ₹8,50,000'
      }
    },
    {
      seedId: 'buyer-ai-test-job-07',
      sellerId: sId(2),
      categoryId: catMap['jobs'],
      categorySlug: 'jobs',
      subcategoryName: 'Finance & Accounting',
      title: 'Senior Accountant & GST Compliance Specialist in Mumbai',
      description: 'Finance opening for Senior Accountant in Mumbai. Managing general ledger, GST filings, TDS reconciliation, monthly balance sheets, Tally Prime, and financial audits. CTC ₹8.5 LPA.',
      listingType: 'SELL',
      condition: 'NOT_APPLICABLE',
      price: 850000,
      currency: 'INR',
      currencySymbol: '₹',
      negotiable: true,
      location: { country: 'India', region: 'Maharashtra', city: 'Mumbai', localArea: 'Andheri East', address: 'MIDC Industrial Area' },
      images: ['https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?auto=format&fit=crop&w=1200&q=80'],
      featured: false,
      details: {
        company: 'Vanguard Capital Consultants',
        jobType: 'Full Time',
        workMode: 'On-site',
        experienceRequired: '4-7 Years',
        skills: ['Tally Prime', 'GST', 'TDS', 'Financial Auditing', 'Excel'],
        salaryRange: '₹8,50,000 - ₹11,00,000'
      }
    },
    {
      seedId: 'buyer-ai-test-job-08',
      sellerId: sId(0),
      categoryId: catMap['jobs'],
      categorySlug: 'jobs',
      subcategoryName: 'Customer Support',
      title: 'Customer Support Specialist & Escalation Lead in Coimbatore',
      description: 'Join a vibrant tech team in Coimbatore as Customer Support Specialist. Handling email, chat, and phone escalations with empathy, quick resolution, and CRM ticketing tools. CTC ₹4.2 LPA.',
      listingType: 'SELL',
      condition: 'NOT_APPLICABLE',
      price: 420000,
      currency: 'INR',
      currencySymbol: '₹',
      negotiable: true,
      location: { country: 'India', region: 'Tamil Nadu', city: 'Coimbatore', localArea: 'Avinashi Road', address: 'Peelamedu' },
      images: ['https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=1200&q=80'],
      featured: false,
      details: {
        company: 'SwiftDesk Support',
        jobType: 'Full Time',
        workMode: 'On-site',
        experienceRequired: '1-3 Years',
        skills: ['Customer Support', 'Zendesk', 'CRM', 'Communication', 'Conflict Resolution'],
        salaryRange: '₹4,20,000 - ₹5,50,000'
      }
    },
    {
      seedId: 'buyer-ai-test-job-09',
      sellerId: sId(1),
      categoryId: catMap['jobs'],
      categorySlug: 'jobs',
      subcategoryName: 'IT & Software',
      title: 'DevOps & Cloud Infrastructure Engineer AWS & Kubernetes in Bangalore',
      description: 'Software jobs in Bangalore: DevOps Cloud Engineer with experience in Terraform, CI/CD GitHub Actions, AWS architecture, Docker, Prometheus, and Kubernetes cluster administration. CTC ₹16.5 LPA.',
      listingType: 'SELL',
      condition: 'NOT_APPLICABLE',
      price: 1650000,
      currency: 'INR',
      currencySymbol: '₹',
      negotiable: true,
      location: { country: 'India', region: 'Karnataka', city: 'Bengaluru', localArea: 'Whitefield', address: 'EPIP Zone' },
      images: ['https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=1200&q=80'],
      featured: false,
      details: {
        company: 'CloudGrid Infrastructure',
        jobType: 'Full Time',
        workMode: 'Hybrid',
        experienceRequired: '3-6 Years',
        skills: ['AWS', 'Kubernetes', 'Docker', 'Terraform', 'CI/CD', 'Linux'],
        salaryRange: '₹16,50,000 - ₹22,00,000'
      }
    },
    {
      seedId: 'buyer-ai-test-job-10',
      sellerId: sId(2),
      categoryId: catMap['jobs'],
      categorySlug: 'jobs',
      subcategoryName: 'Marketing & Sales',
      title: 'B2B Sales Manager & Business Development Executive in Delhi',
      description: 'Fast-paced enterprise B2B sales opening in Delhi. Lead enterprise client pitches, SaaS software demos, contract negotiations, and corporate revenue targets. CTC ₹7.5 LPA + high incentives.',
      listingType: 'SELL',
      condition: 'NOT_APPLICABLE',
      price: 750000,
      currency: 'INR',
      currencySymbol: '₹',
      negotiable: true,
      location: { country: 'India', region: 'Delhi NCR', city: 'Delhi', localArea: 'Connaught Place', address: 'Barakhamba Road' },
      images: ['https://images.unsplash.com/photo-1556761175-5973dc0f32e7?auto=format&fit=crop&w=1200&q=80'],
      featured: false,
      details: {
        company: 'Apex Enterprise Solutions',
        jobType: 'Full Time',
        workMode: 'On-site',
        experienceRequired: '2-5 Years',
        skills: ['B2B Sales', 'Lead Generation', 'Client Relations', 'CRM', 'Negotiation'],
        salaryRange: '₹7,50,000 - ₹11,00,000'
      }
    },

    // =========================================================================
    // 5. LOCAL SERVICES (10 TEST LISTINGS)
    // =========================================================================
    {
      seedId: 'buyer-ai-test-serv-01',
      sellerId: sId(0),
      categoryId: catMap['services'],
      categorySlug: 'services',
      subcategoryName: 'Electricians & Plumbers',
      title: 'Expert Plumber in Coimbatore for Pipe Leakage & Bathroom Fittings',
      description: 'Professional plumber in Coimbatore with 12+ years experience. Expert in concealed pipeline leak detection, CPVC/UPVC fitting, tap repair, water heater plumbing, and drainage unclogging. Starting ₹350.',
      listingType: 'SELL',
      condition: 'NOT_APPLICABLE',
      price: 350,
      currency: 'INR',
      currencySymbol: '₹',
      negotiable: false,
      location: { country: 'India', region: 'Tamil Nadu', city: 'Coimbatore', localArea: 'RS Puram', address: 'Coimbatore Localities' },
      images: ['https://images.unsplash.com/photo-1581578731548-c64695cc6952?auto=format&fit=crop&w=1200&q=80'],
      featured: true,
      details: {
        providerName: 'Kovai Plumbing Solutions',
        serviceType: 'plumber',
        startingPrice: '₹350',
        warranty: '30 Days Service Guarantee',
        experience: '12 Years',
        responseTime: 'Within 45 mins'
      }
    },
    {
      seedId: 'buyer-ai-test-serv-02',
      sellerId: sId(1),
      categoryId: catMap['services'],
      categorySlug: 'services',
      subcategoryName: 'Electricians & Plumbers',
      title: 'Master Plumber in Chennai 24/7 Emergency Water Leak Repair',
      description: 'Fast response master plumber in Chennai. 24/7 doorstep plumbing service for broken pipes, flush tank repair, sanitary ware installation, and booster pump connection. Starting ₹450.',
      listingType: 'SELL',
      condition: 'NOT_APPLICABLE',
      price: 450,
      currency: 'INR',
      currencySymbol: '₹',
      negotiable: false,
      location: { country: 'India', region: 'Tamil Nadu', city: 'Chennai', localArea: 'Anna Nagar', address: 'All Chennai Areas' },
      images: ['https://images.unsplash.com/photo-1581578731548-c64695cc6952?auto=format&fit=crop&w=1200&q=80'],
      featured: false,
      details: {
        providerName: 'Chennai Pro Plumbers',
        serviceType: 'plumber',
        startingPrice: '₹450',
        warranty: '45 Days Warranty',
        experience: '10 Years'
      }
    },
    {
      seedId: 'buyer-ai-test-serv-03',
      sellerId: sId(2),
      categoryId: catMap['services'],
      categorySlug: 'services',
      subcategoryName: 'Electricians & Plumbers',
      title: 'Certified Electrician in Chennai for House Wiring & MCB Tripping',
      description: 'Government certified licensed electrician in Chennai. Short circuit troubleshooting, switchboard installation, MCB tripping repair, inverter connection, and ceiling fan repair. Rate ₹399.',
      listingType: 'SELL',
      condition: 'NOT_APPLICABLE',
      price: 399,
      currency: 'INR',
      currencySymbol: '₹',
      negotiable: false,
      location: { country: 'India', region: 'Tamil Nadu', city: 'Chennai', localArea: 'T Nagar', address: 'Central Chennai' },
      images: ['https://images.unsplash.com/photo-1621905251189-08b45d6a269e?auto=format&fit=crop&w=1200&q=80'],
      featured: true,
      details: {
        providerName: 'PowerSafe Electricians',
        serviceType: 'electrician',
        startingPrice: '₹399',
        warranty: '30 Days Warranty',
        licensed: true
      }
    },
    {
      seedId: 'buyer-ai-test-serv-04',
      sellerId: sId(0),
      categoryId: catMap['services'],
      categorySlug: 'services',
      subcategoryName: 'Electricians & Plumbers',
      title: 'Licensed Electrician in Bangalore for 3-Phase Wiring & Lighting',
      description: 'Expert residential & commercial electrician in Bangalore. LED profile lighting, smart switchboard automation, distribution board wiring, generator installation, and earthing. Rate ₹499.',
      listingType: 'SELL',
      condition: 'NOT_APPLICABLE',
      price: 499,
      currency: 'INR',
      currencySymbol: '₹',
      negotiable: false,
      location: { country: 'India', region: 'Karnataka', city: 'Bengaluru', localArea: 'Koramangala', address: 'All Bengaluru Localities' },
      images: ['https://images.unsplash.com/photo-1621905251189-08b45d6a269e?auto=format&fit=crop&w=1200&q=80'],
      featured: false,
      details: {
        providerName: 'Bengaluru WireCraft Experts',
        serviceType: 'electrician',
        startingPrice: '₹499',
        experience: '15 Years'
      }
    },
    {
      seedId: 'buyer-ai-test-serv-05',
      sellerId: sId(3),
      categoryId: catMap['services'],
      categorySlug: 'services',
      subcategoryName: 'AC & Appliance Repair',
      title: 'Complete AC Repair in Bangalore Jet Service & Gas Refilling',
      description: 'Top rated AC repair in Bangalore. High pressure jet cleaning, compressor diagnostics, cooling coil chemical wash, R32 / R410A gas refilling, and PCB repair for all split and window ACs. Rate ₹499.',
      listingType: 'SELL',
      condition: 'NOT_APPLICABLE',
      price: 499,
      currency: 'INR',
      currencySymbol: '₹',
      negotiable: false,
      location: { country: 'India', region: 'Karnataka', city: 'Bengaluru', localArea: 'Indiranagar', address: 'Doorstep Service' },
      images: ['https://images.unsplash.com/photo-1581578731548-c64695cc6952?auto=format&fit=crop&w=1200&q=80'],
      featured: true,
      details: {
        providerName: 'CoolBreeze AC Care',
        serviceType: 'ac_repair',
        startingPrice: '₹499',
        warranty: '60 Days Cooling Warranty',
        duration: '45-60 Mins'
      }
    },
    {
      seedId: 'buyer-ai-test-serv-06',
      sellerId: sId(1),
      categoryId: catMap['services'],
      categorySlug: 'services',
      subcategoryName: 'AC & Appliance Repair',
      title: 'AC Repair & Duct Installation Services in Hyderabad',
      description: 'HVAC certified technicians in Hyderabad for complete air conditioner servicing, copper piping installation, gas leak brazing, and multi-split VRV maintenance. Rate ₹699.',
      listingType: 'SELL',
      condition: 'NOT_APPLICABLE',
      price: 699,
      currency: 'INR',
      currencySymbol: '₹',
      negotiable: false,
      location: { country: 'India', region: 'Telangana', city: 'Hyderabad', localArea: 'Hitec City', address: 'Madhapur' },
      images: ['https://images.unsplash.com/photo-1581578731548-c64695cc6952?auto=format&fit=crop&w=1200&q=80'],
      featured: false,
      details: {
        providerName: 'Apex HVAC Hyderabad',
        serviceType: 'ac_repair',
        startingPrice: '₹699',
        warranty: '30 Days Guarantee'
      }
    },
    {
      seedId: 'buyer-ai-test-serv-07',
      sellerId: sId(2),
      categoryId: catMap['services'],
      categorySlug: 'services',
      subcategoryName: 'Home Deep Cleaning',
      title: 'Full Home Deep Cleaning & Sanitization Service in Bangalore',
      description: '5-star residential deep cleaning service in Bangalore. Mechanized single-disc floor scrubbing, kitchen chimney degreasing, bathroom descaling, and sofa shampooing. Rate ₹2,199 for 2BHK.',
      listingType: 'SELL',
      condition: 'NOT_APPLICABLE',
      price: 2199,
      currency: 'INR',
      currencySymbol: '₹',
      negotiable: false,
      location: { country: 'India', region: 'Karnataka', city: 'Bengaluru', localArea: 'HSR Layout', address: 'Bengaluru Metro Area' },
      images: ['https://images.unsplash.com/photo-1581578731548-c64695cc6952?auto=format&fit=crop&w=1200&q=80'],
      featured: true,
      details: {
        providerName: 'SparkleClean Professionals',
        serviceType: 'cleaning',
        startingPrice: '₹2,199',
        teamSize: '3-4 Trained Cleaners',
        duration: '4-5 Hours'
      }
    },
    {
      seedId: 'buyer-ai-test-serv-08',
      sellerId: sId(0),
      categoryId: catMap['services'],
      categorySlug: 'services',
      subcategoryName: 'Carpentry & Furniture Repair',
      title: 'Furniture Carpenter & Modular Wardrobe Fitting Specialist in Pune',
      description: 'Skilled carpenter service in Pune. Custom wardrobe assembly, hydraulic bed hinge replacement, door lock fixing, sofa frame repairs, and modular kitchen modifications. Starting ₹550.',
      listingType: 'SELL',
      condition: 'NOT_APPLICABLE',
      price: 550,
      currency: 'INR',
      currencySymbol: '₹',
      negotiable: false,
      location: { country: 'India', region: 'Maharashtra', city: 'Pune', localArea: 'Koregaon Park', address: 'Pune City' },
      images: ['https://images.unsplash.com/photo-1581578731548-c64695cc6952?auto=format&fit=crop&w=1200&q=80'],
      featured: false,
      details: {
        providerName: 'Pune WoodCraft Services',
        serviceType: 'carpenter',
        startingPrice: '₹550',
        experience: '8 Years'
      }
    },
    {
      seedId: 'buyer-ai-test-serv-09',
      sellerId: sId(1),
      categoryId: catMap['services'],
      categorySlug: 'services',
      subcategoryName: 'AC & Appliance Repair',
      title: 'Doorstep Laptop & Desktop Computer Repair Service in Coimbatore',
      description: 'Quick doorstep laptop repair in Coimbatore. Screen replacement, motherboard chip-level repair, SSD/RAM upgrade, OS installation, and liquid damage recovery. Diagnostic fee ₹499.',
      listingType: 'SELL',
      condition: 'NOT_APPLICABLE',
      price: 499,
      currency: 'INR',
      currencySymbol: '₹',
      negotiable: false,
      location: { country: 'India', region: 'Tamil Nadu', city: 'Coimbatore', localArea: 'Avinashi Road', address: 'Gandhipuram' },
      images: ['https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?auto=format&fit=crop&w=1200&q=80'],
      featured: false,
      details: {
        providerName: 'Kovai TechCare Labs',
        serviceType: 'laptop_repair',
        startingPrice: '₹499',
        warranty: '90 Days Part Warranty'
      }
    },
    {
      seedId: 'buyer-ai-test-serv-10',
      sellerId: sId(2),
      categoryId: catMap['services'],
      categorySlug: 'services',
      subcategoryName: 'Home Deep Cleaning',
      title: 'Complete Interior Wall Painting & Waterproofing Service in Mumbai',
      description: 'Professional Asian Paints authorized wall painting contractors in Mumbai. Dustless mechanized sanding, primer application, 2-coat royal luxury emulsion, and roof waterproofing. Starting ₹8,500.',
      listingType: 'SELL',
      condition: 'NOT_APPLICABLE',
      price: 8500,
      currency: 'INR',
      currencySymbol: '₹',
      negotiable: true,
      location: { country: 'India', region: 'Maharashtra', city: 'Mumbai', localArea: 'Bandra West', address: 'Mumbai City' },
      images: ['https://images.unsplash.com/photo-1562259949-e8e7689d7828?auto=format&fit=crop&w=1200&q=80'],
      featured: false,
      details: {
        providerName: 'Mumbai PaintCrafters',
        serviceType: 'painting',
        startingPrice: '₹8,500',
        warranty: '3 Years Waterproofing Warranty'
      }
    },

    // =========================================================================
    // 6. AGRICULTURE & FARM (10 TEST LISTINGS)
    // =========================================================================
    {
      seedId: 'buyer-ai-test-farm-01',
      sellerId: sId(0),
      categoryId: catMap['farm'],
      categorySlug: 'farm',
      subcategoryName: 'Tractors & Farm Machinery',
      title: 'Mahindra 575 DI 45HP Farm Tractor under 5 lakh in Coimbatore',
      description: 'Top condition agriculture equipment Mahindra 575 DI 45HP farm tractor in Coimbatore. Power steering, dual clutch, 1,800 operating hours, new MRF rear tyres, clear RC documents. Price ₹3,80,000 under 5 lakh.',
      listingType: 'SELL',
      condition: 'EXCELLENT',
      price: 380000,
      currency: 'INR',
      currencySymbol: '₹',
      negotiable: true,
      location: { country: 'India', region: 'Tamil Nadu', city: 'Coimbatore', localArea: 'Pollachi Road', address: 'Near Kinathukadavu' },
      images: ['https://images.unsplash.com/photo-1530267981375-f0de937f5f13?auto=format&fit=crop&w=1200&q=80'],
      featured: true,
      details: {
        brand: 'Mahindra',
        machineType: 'Tractor',
        hp: '45 HP',
        hoursOperated: '1,800 hrs',
        fuel: 'Diesel',
        attachments: ['Trolley Hook', 'Bumper']
      }
    },
    {
      seedId: 'buyer-ai-test-farm-02',
      sellerId: sId(1),
      categoryId: catMap['farm'],
      categorySlug: 'farm',
      subcategoryName: 'Tractors & Farm Machinery',
      title: 'Swaraj 744 FE 48HP Tractor under 5 lakh near Bengaluru',
      description: 'Well-maintained agriculture equipment Swaraj 744 FE 48HP tractor near Bengaluru. Direct fuel injection engine, power steering, oil immersed brakes, 2,100 hrs run. Price ₹4,40,000 under 5 lakh.',
      listingType: 'SELL',
      condition: 'GOOD',
      price: 440000,
      currency: 'INR',
      currencySymbol: '₹',
      negotiable: true,
      location: { country: 'India', region: 'Karnataka', city: 'Bengaluru', localArea: 'Nelamangala', address: 'Tumkur Road' },
      images: ['https://images.unsplash.com/photo-1530267981375-f0de937f5f13?auto=format&fit=crop&w=1200&q=80'],
      featured: false,
      details: {
        brand: 'Swaraj',
        machineType: 'Tractor',
        hp: '48 HP',
        hoursOperated: '2,100 hrs',
        fuel: 'Diesel'
      }
    },
    {
      seedId: 'buyer-ai-test-farm-03',
      sellerId: sId(2),
      categoryId: catMap['farm'],
      categorySlug: 'farm',
      subcategoryName: 'Tractors & Farm Machinery',
      title: 'John Deere 5050D 50HP Heavy Duty Farm Tractor in Pune',
      description: 'Powerful 50HP John Deere 5050D farm tractor in Pune. Heavy duty front axle, dual clutch, 1,400 hours operated, showroom condition with reverse PTO. Price ₹5,60,000.',
      listingType: 'SELL',
      condition: 'LIKE_NEW',
      price: 560000,
      currency: 'INR',
      currencySymbol: '₹',
      negotiable: true,
      location: { country: 'India', region: 'Maharashtra', city: 'Pune', localArea: 'Baramati', address: 'MIDC Agro Zone' },
      images: ['https://images.unsplash.com/photo-1530267981375-f0de937f5f13?auto=format&fit=crop&w=1200&q=80'],
      featured: true,
      details: {
        brand: 'John Deere',
        machineType: 'Tractor',
        hp: '50 HP',
        hoursOperated: '1,400 hrs'
      }
    },
    {
      seedId: 'buyer-ai-test-farm-04',
      sellerId: sId(0),
      categoryId: catMap['farm'],
      categorySlug: 'farm',
      subcategoryName: 'Tractors & Farm Machinery',
      title: 'Shaktiman 6-Feet Heavy Duty Rotavator Agriculture Equipment in Coimbatore',
      description: 'Essential agriculture equipment in Coimbatore: Shaktiman 6ft heavy-duty multi-speed rotavator with boron steel blades, heavy gearbox, and PTO shaft included. Price ₹75,000.',
      listingType: 'SELL',
      condition: 'EXCELLENT',
      price: 75000,
      currency: 'INR',
      currencySymbol: '₹',
      negotiable: true,
      location: { country: 'India', region: 'Tamil Nadu', city: 'Coimbatore', localArea: 'Sulur', address: 'Trichy Road' },
      images: ['https://images.unsplash.com/photo-1500937386664-56d1dfef3854?auto=format&fit=crop&w=1200&q=80'],
      featured: false,
      details: {
        brand: 'Shaktiman',
        machineType: 'Rotavator',
        width: '6 Feet',
        bladeCount: '48 Boron Steel Blades'
      }
    },
    {
      seedId: 'buyer-ai-test-farm-05',
      sellerId: sId(1),
      categoryId: catMap['farm'],
      categorySlug: 'farm',
      subcategoryName: 'Tractors & Farm Machinery',
      title: 'Automatic Drip Irrigation System Kit with Screen Filter in Coimbatore',
      description: 'Complete farm agriculture equipment in Coimbatore: 2-acre automatic drip irrigation kit with disc filter, venturi injector, 16mm inline lateral tubes, and pressure regulators. Price ₹35,000.',
      listingType: 'SELL',
      condition: 'NEW',
      price: 35000,
      currency: 'INR',
      currencySymbol: '₹',
      negotiable: true,
      location: { country: 'India', region: 'Tamil Nadu', city: 'Coimbatore', localArea: 'Mettupalayam Road', address: 'Thudiyalur' },
      images: ['https://images.unsplash.com/photo-1500937386664-56d1dfef3854?auto=format&fit=crop&w=1200&q=80'],
      featured: false,
      details: {
        equipmentType: 'Drip Irrigation',
        coverageArea: '2 Acres',
        filterType: '2-inch Screen Disc Filter'
      }
    },
    {
      seedId: 'buyer-ai-test-farm-06',
      sellerId: sId(2),
      categoryId: catMap['farm'],
      categorySlug: 'farm',
      subcategoryName: 'Crops, Seeds & Fertilizers',
      title: 'High Yield Certified Hybrid Maize & Organic Vegetable Seeds in Chennai',
      description: 'Certified drought-tolerant high germination hybrid maize seeds and organic vegetable seed packs (tomato, chilli, brinjal, lady finger) for commercial farming. Price ₹2,500/bag.',
      listingType: 'SELL',
      condition: 'NEW',
      price: 2500,
      currency: 'INR',
      currencySymbol: '₹',
      negotiable: false,
      location: { country: 'India', region: 'Tamil Nadu', city: 'Chennai', localArea: 'Koyambedu', address: 'Wholesale Market' },
      images: ['https://images.unsplash.com/photo-1500937386664-56d1dfef3854?auto=format&fit=crop&w=1200&q=80'],
      featured: false,
      details: {
        seedType: 'Hybrid Seeds',
        germinationRate: '95%',
        packaging: '10kg Sealed Bags'
      }
    },
    {
      seedId: 'buyer-ai-test-farm-07',
      sellerId: sId(0),
      categoryId: catMap['farm'],
      categorySlug: 'farm',
      subcategoryName: 'Agricultural Land & Farms',
      title: '3 Acres Fertile Agricultural Land with Borewell near Coimbatore',
      description: 'Red soil agricultural land near Coimbatore with 2 active borewells, free 3-phase agricultural electricity connection, fencing, and drip lines. Clear title deed. Price ₹28,00,000.',
      listingType: 'SELL',
      condition: 'NOT_APPLICABLE',
      price: 2800000,
      currency: 'INR',
      currencySymbol: '₹',
      negotiable: true,
      location: { country: 'India', region: 'Tamil Nadu', city: 'Coimbatore', localArea: 'Pollachi', address: 'Anaimalai Road' },
      images: ['https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=1200&q=80'],
      featured: true,
      details: {
        propertyType: 'Farm Land',
        landArea: '3 Acres',
        soilType: 'Red Loam Soil',
        waterSource: '2 Active Borewells',
        powerConnection: 'Free Agro 3-Phase'
      }
    },
    {
      seedId: 'buyer-ai-test-farm-08',
      sellerId: sId(1),
      categoryId: catMap['farm'],
      categorySlug: 'farm',
      subcategoryName: 'Agricultural Land & Farms',
      title: '5 Acres Organic Coconut Farm with Solar Pump near Mysuru',
      description: 'Well maintained organic farm land near Mysuru with 300 bearing coconut trees, solar water pumping system, drip irrigation, farmhouse, and bitumen road access. Price ₹45,00,000.',
      listingType: 'SELL',
      condition: 'NOT_APPLICABLE',
      price: 4500000,
      currency: 'INR',
      currencySymbol: '₹',
      negotiable: true,
      location: { country: 'India', region: 'Karnataka', city: 'Mysuru', localArea: 'Hunsur', address: 'Hunsur Highway' },
      images: ['https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=1200&q=80'],
      featured: false,
      details: {
        propertyType: 'Farm Land',
        landArea: '5 Acres',
        crop: '300 Coconut Trees',
        waterSource: 'Solar Pump + Borewell'
      }
    },
    {
      seedId: 'buyer-ai-test-farm-09',
      sellerId: sId(3),
      categoryId: catMap['farm'],
      categorySlug: 'farm',
      subcategoryName: 'Tractors & Farm Machinery',
      title: 'Multi-Crop Power Weeder & Cultivator 7HP Agriculture Equipment in Coimbatore',
      description: 'Heavy duty petrol power weeder agriculture equipment in Coimbatore. 7HP 4-stroke engine, adjustable tilling width 2-3 ft, de-weeding blades, and ditcher attachment included. Price ₹42,000.',
      listingType: 'SELL',
      condition: 'NEW',
      price: 42000,
      currency: 'INR',
      currencySymbol: '₹',
      negotiable: true,
      location: { country: 'India', region: 'Tamil Nadu', city: 'Coimbatore', localArea: 'Singanallur', address: 'Trichy Road' },
      images: ['https://images.unsplash.com/photo-1500937386664-56d1dfef3854?auto=format&fit=crop&w=1200&q=80'],
      featured: false,
      details: {
        machineType: 'Power Weeder',
        hp: '7 HP Petrol',
        tillingDepth: '5-8 inches'
      }
    },
    {
      seedId: 'buyer-ai-test-farm-10',
      sellerId: sId(2),
      categoryId: catMap['farm'],
      categorySlug: 'farm',
      subcategoryName: 'Tractors & Farm Machinery',
      title: 'Farm Solar Fencing & Livestock Security System in Hyderabad',
      description: 'Solar electric energizer fencing kit for 5-acre agricultural farms in Hyderabad. Complete with 50W solar panel, 12V battery, high voltage pulsed energizer, insulators, and alarm siren. Price ₹55,000.',
      listingType: 'SELL',
      condition: 'NEW',
      price: 55000,
      currency: 'INR',
      currencySymbol: '₹',
      negotiable: true,
      location: { country: 'India', region: 'Telangana', city: 'Hyderabad', localArea: 'Gachibowli', address: 'Agro Tech Park' },
      images: ['https://images.unsplash.com/photo-1500937386664-56d1dfef3854?auto=format&fit=crop&w=1200&q=80'],
      featured: false,
      details: {
        equipmentType: 'Solar Fencing',
        capacity: 'Up to 5 Acres',
        battery: '12V 40Ah Exide'
      }
    },

    // =========================================================================
    // 7. BUSINESS DIRECTORY (10 TEST LISTINGS)
    // =========================================================================
    {
      seedId: 'buyer-ai-test-biz-01',
      sellerId: sId(0),
      categoryId: catMap['businesses'],
      categorySlug: 'businesses',
      subcategoryName: 'Cafes, Restaurants & Food',
      title: 'Artisan Cafe & Bakery Running Business in Chennai Anna Nagar',
      description: 'Established specialty coffee cafe & bakery businesses in Chennai Anna Nagar. 45-seating capacity, Italian espresso setup, commercial oven deck, high footfall, active Swiggy/Zomato 4.6 rating. Price ₹32,00,000.',
      listingType: 'SELL',
      condition: 'EXCELLENT',
      price: 3200000,
      currency: 'INR',
      currencySymbol: '₹',
      negotiable: true,
      location: { country: 'India', region: 'Tamil Nadu', city: 'Chennai', localArea: 'Anna Nagar', address: '2nd Avenue' },
      images: ['https://images.unsplash.com/photo-1554118811-1e0d58224f24?auto=format&fit=crop&w=1200&q=80'],
      featured: true,
      details: {
        businessType: 'Cafe & Bakery',
        establishedYear: '2021',
        monthlyRevenue: '₹6,50,000',
        monthlyProfit: '₹1,80,000',
        seatingCapacity: '45 Seats'
      }
    },
    {
      seedId: 'buyer-ai-test-biz-02',
      sellerId: sId(1),
      categoryId: catMap['businesses'],
      categorySlug: 'businesses',
      subcategoryName: 'Cafes, Restaurants & Food',
      title: 'Multi-Cuisine Family Restaurant Business in Chennai T Nagar',
      description: 'Fully equipped 70-seater air-conditioned restaurant businesses in Chennai T Nagar. Commercial kitchen equipment, tandoor, walk-in cold storage, FSSAI license, and high daily revenue. Price ₹45,00,000.',
      listingType: 'SELL',
      condition: 'EXCELLENT',
      price: 4500000,
      currency: 'INR',
      currencySymbol: '₹',
      negotiable: true,
      location: { country: 'India', region: 'Tamil Nadu', city: 'Chennai', localArea: 'T Nagar', address: 'G N Chetty Road' },
      images: ['https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=1200&q=80'],
      featured: true,
      details: {
        businessType: 'Restaurant',
        establishedYear: '2019',
        monthlyRevenue: '₹9,80,000',
        seatingCapacity: '70 Seats'
      }
    },
    {
      seedId: 'buyer-ai-test-biz-03',
      sellerId: sId(2),
      categoryId: catMap['businesses'],
      categorySlug: 'businesses',
      subcategoryName: 'Retail Shops & Showrooms',
      title: 'Boutique Designer Clothing Store Business in Chennai Alwarpet',
      description: 'Profitable designer bridal and ethnic boutique clothing store businesses in Chennai. Elegant interior display racks, trial rooms, mannequin displays, established loyal clientele. Price ₹18,00,000.',
      listingType: 'SELL',
      condition: 'EXCELLENT',
      price: 1800000,
      currency: 'INR',
      currencySymbol: '₹',
      negotiable: true,
      location: { country: 'India', region: 'Tamil Nadu', city: 'Chennai', localArea: 'Adyar', address: 'TTK Road' },
      images: ['https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&w=1200&q=80'],
      featured: false,
      details: {
        businessType: 'Clothing Boutique',
        monthlyRevenue: '₹4,20,000',
        floorArea: '850 sq.ft'
      }
    },
    {
      seedId: 'buyer-ai-test-biz-04',
      sellerId: sId(3),
      categoryId: catMap['businesses'],
      categorySlug: 'businesses',
      subcategoryName: 'Franchises & Businesses for Sale',
      title: 'Established Digital Marketing Agency Portfolio & Client Contracts in Bangalore',
      description: 'Running digital agency business in Bangalore with 14 active monthly retainer clients, trained team of 8 professionals, domain authority 52 website, and steady recurring cashflow. Price ₹22,00,000.',
      listingType: 'SELL',
      condition: 'EXCELLENT',
      price: 2200000,
      currency: 'INR',
      currencySymbol: '₹',
      negotiable: true,
      location: { country: 'India', region: 'Karnataka', city: 'Bengaluru', localArea: 'Indiranagar', address: '100ft Road' },
      images: ['https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=1200&q=80'],
      featured: false,
      details: {
        businessType: 'Digital Agency',
        monthlyRecurringRevenue: '₹4,80,000',
        activeClients: '14 Accounts'
      }
    },
    {
      seedId: 'buyer-ai-test-biz-05',
      sellerId: sId(0),
      categoryId: catMap['businesses'],
      categorySlug: 'businesses',
      subcategoryName: 'Franchises & Businesses for Sale',
      title: 'IT Services & Cloud Software Consultancy Firm in Hyderabad',
      description: 'Profitable software company business in Hyderabad with proprietary ERP SaaS codebase, active SME subscriptions, AWS credits, and plug-and-play office setup. Price ₹55,00,000.',
      listingType: 'SELL',
      condition: 'EXCELLENT',
      price: 5500000,
      currency: 'INR',
      currencySymbol: '₹',
      negotiable: true,
      location: { country: 'India', region: 'Telangana', city: 'Hyderabad', localArea: 'Hitec City', address: 'Mindspace IT Park' },
      images: ['https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&w=1200&q=80'],
      featured: true,
      details: {
        businessType: 'Software Consultancy',
        annualRevenue: '₹1.2 Crore',
        teamSize: '12 Engineers'
      }
    },
    {
      seedId: 'buyer-ai-test-biz-06',
      sellerId: sId(1),
      categoryId: catMap['businesses'],
      categorySlug: 'businesses',
      subcategoryName: 'Retail Shops & Showrooms',
      title: 'Smartphones & Multi-Brand Electronics Shop Business in Coimbatore',
      description: 'Prime showroom electronics shop business in Coimbatore Gandhipuram. Authorised retail dealership for Apple, Samsung, OnePlus, brand fixtures, CCTV security, and steady walk-in customers. Price ₹25,00,000.',
      listingType: 'SELL',
      condition: 'EXCELLENT',
      price: 2500000,
      currency: 'INR',
      currencySymbol: '₹',
      negotiable: true,
      location: { country: 'India', region: 'Tamil Nadu', city: 'Coimbatore', localArea: 'Avinashi Road', address: 'Cross Cut Road' },
      images: ['https://images.unsplash.com/photo-1550009158-9ebf69173e03?auto=format&fit=crop&w=1200&q=80'],
      featured: false,
      details: {
        businessType: 'Electronics Retail',
        monthlyTurnover: '₹18,00,000',
        floorArea: '1200 sq.ft'
      }
    },
    {
      seedId: 'buyer-ai-test-biz-07',
      sellerId: sId(2),
      categoryId: catMap['businesses'],
      categorySlug: 'businesses',
      subcategoryName: 'Automotive Garages & Centers',
      title: 'Multi-Brand Automobile Garage & Car Detailing Center in Pune',
      description: 'Complete automobile workshop and car detailing business in Pune. 3 hydraulic vehicle lifts, paint spray booth, 3D wheel alignment, high pressure wash bays, and corporate tie-ups. Price ₹38,00,000.',
      listingType: 'SELL',
      condition: 'EXCELLENT',
      price: 3800000,
      currency: 'INR',
      currencySymbol: '₹',
      negotiable: true,
      location: { country: 'India', region: 'Maharashtra', city: 'Pune', localArea: 'Kothrud', address: 'Near Highway' },
      images: ['https://images.unsplash.com/photo-1486006920555-c77dce18193b?auto=format&fit=crop&w=1200&q=80'],
      featured: false,
      details: {
        businessType: 'Auto Garage & Detailing',
        serviceBays: '6 Vehicles',
        monthlyProfit: '₹2,40,000'
      }
    },
    {
      seedId: 'buyer-ai-test-biz-08',
      sellerId: sId(3),
      categoryId: catMap['businesses'],
      categorySlug: 'businesses',
      subcategoryName: 'Franchises & Businesses for Sale',
      title: 'Modern Fitness Center & Unisex Gym Franchise in Mumbai Bandra',
      description: 'Luxury fitness center business in Mumbai Bandra with imported Life Fitness / Hammer Strength equipment, steam rooms, certified trainers, and 280 active annual members. Price ₹28,00,000.',
      listingType: 'SELL',
      condition: 'EXCELLENT',
      price: 2800000,
      currency: 'INR',
      currencySymbol: '₹',
      negotiable: true,
      location: { country: 'India', region: 'Maharashtra', city: 'Mumbai', localArea: 'Bandra West', address: 'Hill Road' },
      images: ['https://images.unsplash.com/photo-1534438327276-14e5300c3a48?auto=format&fit=crop&w=1200&q=80'],
      featured: false,
      details: {
        businessType: 'Fitness Gym',
        activeMembers: '280 Members',
        floorArea: '2500 sq.ft'
      }
    },
    {
      seedId: 'buyer-ai-test-biz-09',
      sellerId: sId(0),
      categoryId: catMap['businesses'],
      categorySlug: 'businesses',
      subcategoryName: 'Retail Shops & Showrooms',
      title: 'Organic Supermarket & Fresh Grocery Retail Store in Kochi',
      description: 'Profitable organic supermarket business in Kochi Panampilly Nagar. POS billing counters, refrigerated display coolers, dry fruit racks, home delivery network, and recurring local shoppers. Price ₹35,00,000.',
      listingType: 'SELL',
      condition: 'EXCELLENT',
      price: 3500000,
      currency: 'INR',
      currencySymbol: '₹',
      negotiable: true,
      location: { country: 'India', region: 'Kerala', city: 'Kochi', localArea: 'Marine Drive', address: 'Panampilly Nagar' },
      images: ['https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=1200&q=80'],
      featured: false,
      details: {
        businessType: 'Supermarket',
        dailyFootfall: '300+ Customers',
        monthlySales: '₹14,00,000'
      }
    },
    {
      seedId: 'buyer-ai-test-biz-10',
      sellerId: sId(1),
      categoryId: catMap['businesses'],
      categorySlug: 'businesses',
      subcategoryName: 'Franchises & Businesses for Sale',
      title: 'Express Courier & Ecommerce Logistics Franchise Hub in Delhi',
      description: 'Authorized Tier-1 courier logistics hub business in Delhi NCR. Operating fleet of 6 delivery vans, sorting conveyor, barcode scanners, and high-volume e-commerce delivery contracts. Price ₹15,00,000.',
      listingType: 'SELL',
      condition: 'EXCELLENT',
      price: 1500000,
      currency: 'INR',
      currencySymbol: '₹',
      negotiable: true,
      location: { country: 'India', region: 'Delhi NCR', city: 'Delhi', localArea: 'Connaught Place', address: 'Industrial Area' },
      images: ['https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?auto=format&fit=crop&w=1200&q=80'],
      featured: false,
      details: {
        businessType: 'Logistics Franchise',
        dailyParcels: '1200 Shipments',
        monthlyNetProfit: '₹1,60,000'
      }
    },

    // =========================================================================
    // 8. RENTALS (10 TEST LISTINGS - listingType: 'RENT')
    // =========================================================================
    {
      seedId: 'buyer-ai-test-rent-01',
      sellerId: sId(0),
      categoryId: catMap['properties'],
      categorySlug: 'properties',
      subcategoryName: 'For Rent: Houses & Apartments',
      title: '3 BHK Independent House for Rent in Bangalore Koramangala',
      description: 'Houses for rent in Bangalore: Spacious 1900 sq.ft 3 BHK independent house for rent in Koramangala 4th Block. Modular kitchen, 3 bathrooms, private terrace, 2 covered car parks, 24-hr water supply. Rent ₹32,000/month.',
      listingType: 'RENT',
      condition: 'EXCELLENT',
      price: 32000,
      currency: 'INR',
      currencySymbol: '₹',
      negotiable: true,
      location: { country: 'India', region: 'Karnataka', city: 'Bengaluru', localArea: 'Koramangala', address: '4th Block, Near Sony World' },
      images: ['https://images.unsplash.com/photo-1580587771525-78b9dba3b914?auto=format&fit=crop&w=1200&q=80'],
      featured: true,
      details: {
        propertyType: 'House',
        bedrooms: '3 BHK',
        bathrooms: '3',
        furnishing: 'Semi-Furnished',
        rentPeriod: 'Monthly',
        deposit: '₹1,50,000',
        parking: '2 Covered Cars'
      }
    },
    {
      seedId: 'buyer-ai-test-rent-02',
      sellerId: sId(1),
      categoryId: catMap['properties'],
      categorySlug: 'properties',
      subcategoryName: 'For Rent: Houses & Apartments',
      title: '2 BHK Furnished House for Rent in Bangalore Indiranagar near Metro',
      description: 'Houses for rent in Bangalore: Modern 1250 sq.ft 2 BHK house for rent in Indiranagar. Fully furnished with sofa, beds, TV, fridge, washing machine, and high-speed Wi-Fi. Rent ₹24,000/month.',
      listingType: 'RENT',
      condition: 'EXCELLENT',
      price: 24000,
      currency: 'INR',
      currencySymbol: '₹',
      negotiable: true,
      location: { country: 'India', region: 'Karnataka', city: 'Bengaluru', localArea: 'Indiranagar', address: 'Near CMH Road Metro' },
      images: ['https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=1200&q=80'],
      featured: true,
      details: {
        propertyType: 'House',
        bedrooms: '2 BHK',
        bathrooms: '2',
        furnishing: 'Fully Furnished',
        rentPeriod: 'Monthly',
        deposit: '₹1,00,000'
      }
    },
    {
      seedId: 'buyer-ai-test-rent-03',
      sellerId: sId(2),
      categoryId: catMap['properties'],
      categorySlug: 'properties',
      subcategoryName: 'For Rent: Houses & Apartments',
      title: '1 BHK Cozy Apartment for Rent in Coimbatore Peelamedu',
      description: 'Peaceful 650 sq.ft 1 BHK apartment for rent in Coimbatore near PSG Tech / Peelamedu. Semi-furnished, modular kitchen, balcony, lift, covered two-wheeler parking. Rent ₹14,000/month.',
      listingType: 'RENT',
      condition: 'GOOD',
      price: 14000,
      currency: 'INR',
      currencySymbol: '₹',
      negotiable: false,
      location: { country: 'India', region: 'Tamil Nadu', city: 'Coimbatore', localArea: 'Avinashi Road', address: 'Peelamedu' },
      images: ['https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=1200&q=80'],
      featured: false,
      details: {
        propertyType: 'Apartment',
        bedrooms: '1 BHK',
        bathrooms: '1',
        furnishing: 'Semi-Furnished',
        rentPeriod: 'Monthly'
      }
    },
    {
      seedId: 'buyer-ai-test-rent-04',
      sellerId: sId(3),
      categoryId: catMap['properties'],
      categorySlug: 'properties',
      subcategoryName: 'For Rent: Houses & Apartments',
      title: '4 BHK Luxury Gated Villa for Rent in Chennai ECR Sea Breeze',
      description: 'Exclusive 3400 sq.ft 4 BHK sea-breeze villa for rent in Chennai on East Coast Road. Private garden lawn, modular German kitchen, clubhouse, and swimming pool. Rent ₹65,000/month.',
      listingType: 'RENT',
      condition: 'NEW',
      price: 65000,
      currency: 'INR',
      currencySymbol: '₹',
      negotiable: true,
      location: { country: 'India', region: 'Tamil Nadu', city: 'Chennai', localArea: 'OMR', address: 'ECR Sea Cliff' },
      images: ['https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=1200&q=80'],
      featured: true,
      details: {
        propertyType: 'Villa',
        bedrooms: '4 BHK',
        bathrooms: '4',
        furnishing: 'Fully Furnished',
        rentPeriod: 'Monthly'
      }
    },
    {
      seedId: 'buyer-ai-test-rent-05',
      sellerId: sId(0),
      categoryId: catMap['vehicles'],
      categorySlug: 'vehicles',
      subcategoryName: 'Motorcycles & Scooters',
      title: 'Royal Enfield Himalayan 450 Adventure Bike for Daily/Monthly Rent',
      description: 'Bike rental in Bangalore: Brand new Royal Enfield Himalayan 450 adventure motorcycle available for self-drive daily or monthly rental. Fully insured with helmet and panniers. ₹1,200/day.',
      listingType: 'RENT',
      condition: 'LIKE_NEW',
      price: 1200,
      currency: 'INR',
      currencySymbol: '₹',
      negotiable: false,
      location: { country: 'India', region: 'Karnataka', city: 'Bengaluru', localArea: 'Koramangala', address: 'Rental Hub' },
      images: ['https://images.unsplash.com/photo-1558981403-c5f9899a28bc?auto=format&fit=crop&w=1200&q=80'],
      featured: false,
      details: {
        brand: 'Royal Enfield',
        model: 'Himalayan 450',
        vehicleType: 'two_wheeler',
        rentalRate: '₹1,200 per day',
        deposit: '₹3,000'
      }
    },
    {
      seedId: 'buyer-ai-test-rent-06',
      sellerId: sId(1),
      categoryId: catMap['vehicles'],
      categorySlug: 'vehicles',
      subcategoryName: 'Motorcycles & Scooters',
      title: 'Honda Activa 6G Scooter for Monthly Rental in Chennai',
      description: 'Two wheeler scooter rental in Chennai: Honda Activa 6G available on flexible monthly lease. Free regular maintenance, insurance included, zero security hassle. Rent ₹3,500/month.',
      listingType: 'RENT',
      condition: 'EXCELLENT',
      price: 3500,
      currency: 'INR',
      currencySymbol: '₹',
      negotiable: false,
      location: { country: 'India', region: 'Tamil Nadu', city: 'Chennai', localArea: 'Anna Nagar', address: 'Chennai Mobility Rentals' },
      images: ['https://images.unsplash.com/photo-1558981403-c5f9899a28bc?auto=format&fit=crop&w=1200&q=80'],
      featured: false,
      details: {
        brand: 'Honda',
        model: 'Activa 6G',
        vehicleType: 'two_wheeler',
        rentalRate: '₹3,500 per month'
      }
    },
    {
      seedId: 'buyer-ai-test-rent-07',
      sellerId: sId(2),
      categoryId: catMap['vehicles'],
      categorySlug: 'vehicles',
      subcategoryName: 'Cars',
      title: 'Self-Drive Hyundai Creta Automatic Car Rental in Hyderabad',
      description: 'Self-drive car rental in Hyderabad: Hyundai Creta Automatic SUV for outstation trips and city drives. Unlimited KM packages, GPS tracking, comprehensive insurance. ₹2,800/day.',
      listingType: 'RENT',
      condition: 'LIKE_NEW',
      price: 2800,
      currency: 'INR',
      currencySymbol: '₹',
      negotiable: false,
      location: { country: 'India', region: 'Telangana', city: 'Hyderabad', localArea: 'Gachibowli', address: 'Airport Road' },
      images: ['https://images.unsplash.com/photo-1549399542-7e3f8b79c341?auto=format&fit=crop&w=1200&q=80'],
      featured: false,
      details: {
        brand: 'Hyundai',
        model: 'Creta',
        vehicleType: 'four_wheeler',
        rentalRate: '₹2,800 per day'
      }
    },
    {
      seedId: 'buyer-ai-test-rent-08',
      sellerId: sId(3),
      categoryId: catMap['properties'],
      categorySlug: 'properties',
      subcategoryName: 'Commercial & Office Spaces',
      title: 'Fully Furnished Plug & Play Office Space for Rent in Bangalore HSR',
      description: 'Commercial office rental in Bangalore: 30-seater plug & play coworking / managed office space in HSR Layout. High-speed leased line internet, meeting rooms, pantry, power backup. Rent ₹75,000/month.',
      listingType: 'RENT',
      condition: 'NEW',
      price: 75000,
      currency: 'INR',
      currencySymbol: '₹',
      negotiable: true,
      location: { country: 'India', region: 'Karnataka', city: 'Bengaluru', localArea: 'HSR Layout', address: 'Sector 6' },
      images: ['https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=1200&q=80'],
      featured: true,
      details: {
        propertyType: 'Commercial',
        seatingCapacity: '30 Workstations',
        floorArea: '2200 sq.ft',
        rentPeriod: 'Monthly'
      }
    },
    {
      seedId: 'buyer-ai-test-rent-09',
      sellerId: sId(0),
      categoryId: catMap['properties'],
      categorySlug: 'properties',
      subcategoryName: 'Commercial & Office Spaces',
      title: 'Commercial Retail Shop for Rent in Pune High Street',
      description: 'High visibility 600 sq.ft ground floor commercial retail shop for rent in Pune Koregaon Park. Glass frontage, 3-phase power, attached washroom, ideal for boutique or clinic. Rent ₹40,000/month.',
      listingType: 'RENT',
      condition: 'EXCELLENT',
      price: 40000,
      currency: 'INR',
      currencySymbol: '₹',
      negotiable: true,
      location: { country: 'India', region: 'Maharashtra', city: 'Pune', localArea: 'Koregaon Park', address: 'North Main Road' },
      images: ['https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&w=1200&q=80'],
      featured: false,
      details: {
        propertyType: 'Commercial',
        floorArea: '600 sq.ft',
        rentPeriod: 'Monthly'
      }
    },
    {
      seedId: 'buyer-ai-test-rent-10',
      sellerId: sId(1),
      categoryId: catMap['farm'],
      categorySlug: 'farm',
      subcategoryName: 'Tractors & Farm Machinery',
      title: 'Heavy Construction Concrete Mixer & Farm Equipment for Rent in Coimbatore',
      description: 'Equipment rental in Coimbatore: Diesel engine concrete mixer machine and heavy agriculture equipment available on daily/monthly lease. On-site delivery and support. Rent ₹8,000/month.',
      listingType: 'RENT',
      condition: 'GOOD',
      price: 8000,
      currency: 'INR',
      currencySymbol: '₹',
      negotiable: true,
      location: { country: 'India', region: 'Tamil Nadu', city: 'Coimbatore', localArea: 'Sulur', address: 'Sulur Industrial Estate' },
      images: ['https://images.unsplash.com/photo-1500937386664-56d1dfef3854?auto=format&fit=crop&w=1200&q=80'],
      featured: false,
      details: {
        equipmentType: 'Concrete Mixer',
        rentPeriod: 'Monthly'
      }
    },

    // =========================================================================
    // 9. FREE GIVEAWAYS (10 TEST LISTINGS - listingType: 'FREE', price: 0)
    // =========================================================================
    {
      seedId: 'buyer-ai-test-free-01',
      sellerId: sId(0),
      categoryId: catMap['furniture'],
      categorySlug: 'furniture',
      subcategoryName: 'Office Furniture',
      title: 'Ergonomic Wooden Study Table with Drawers (Free Furniture in Coimbatore)',
      description: 'Free furniture in Coimbatore: Relocating to a new city. Giving away this solid wood study table with 2 drawers and top bookshelf for free. In good sturdy condition, pick up from RS Puram.',
      listingType: 'FREE',
      condition: 'GOOD',
      price: 0,
      currency: 'INR',
      currencySymbol: '₹',
      negotiable: false,
      location: { country: 'India', region: 'Tamil Nadu', city: 'Coimbatore', localArea: 'RS Puram', address: 'East Club Road' },
      images: ['https://images.unsplash.com/photo-1518455027359-f3f8164ba6bd?auto=format&fit=crop&w=1200&q=80'],
      featured: true,
      details: {
        furnitureType: 'Study Table',
        material: 'Solid Wood',
        dimensions: '4ft x 2.5ft',
        giveawayReason: 'House Relocation'
      }
    },
    {
      seedId: 'buyer-ai-test-free-02',
      sellerId: sId(1),
      categoryId: catMap['furniture'],
      categorySlug: 'furniture',
      subcategoryName: 'Office Furniture',
      title: 'High Back Mesh Office Chair in Good Condition (Free Furniture in Coimbatore)',
      description: 'Free furniture in Coimbatore: Free giveaway ergonomic mesh office chair with adjustable height, lumbar support, and rolling caster wheels. Fully functional, pickup from Gandhipuram.',
      listingType: 'FREE',
      condition: 'GOOD',
      price: 0,
      currency: 'INR',
      currencySymbol: '₹',
      negotiable: false,
      location: { country: 'India', region: 'Tamil Nadu', city: 'Coimbatore', localArea: 'Avinashi Road', address: 'Gandhipuram' },
      images: ['https://images.unsplash.com/photo-1580481077190-7361396d7470?auto=format&fit=crop&w=1200&q=80'],
      featured: true,
      details: {
        furnitureType: 'Office Chair',
        color: 'Black Mesh',
        adjustableHeight: true
      }
    },
    {
      seedId: 'buyer-ai-test-free-03',
      sellerId: sId(2),
      categoryId: catMap['furniture'],
      categorySlug: 'furniture',
      subcategoryName: 'Home Decor & Lighting',
      title: 'Solid Wood 4-Tier Bookshelf & Storage Rack (Free Giveaway) in Bangalore',
      description: 'Free furniture giveaway in Bengaluru: 4-shelf polished wooden bookcase. Perfect for students and book lovers. Available for free pickup in Koramangala.',
      listingType: 'FREE',
      condition: 'GOOD',
      price: 0,
      currency: 'INR',
      currencySymbol: '₹',
      negotiable: false,
      location: { country: 'India', region: 'Karnataka', city: 'Bengaluru', localArea: 'Koramangala', address: '5th Block' },
      images: ['https://images.unsplash.com/photo-1594633312681-425c7b97ccd1?auto=format&fit=crop&w=1200&q=80'],
      featured: false,
      details: {
        furnitureType: 'Bookshelf',
        material: 'Teak Wood Finish',
        tiers: '4 Shelves'
      }
    },
    {
      seedId: 'buyer-ai-test-free-04',
      sellerId: sId(3),
      categoryId: catMap['furniture'],
      categorySlug: 'furniture',
      subcategoryName: 'Sofa & Dining',
      title: '3-Seater Fabric Sofa Couch for Free Giveaway in Chennai',
      description: 'Free giveaway furniture in Chennai: Comfortable 3-seater fabric sofa couch in grey. No structural damage, clean cushions. Self pickup from Anna Nagar.',
      listingType: 'FREE',
      condition: 'FAIR',
      price: 0,
      currency: 'INR',
      currencySymbol: '₹',
      negotiable: false,
      location: { country: 'India', region: 'Tamil Nadu', city: 'Chennai', localArea: 'Anna Nagar', address: '2nd Avenue' },
      images: ['https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&w=1200&q=80'],
      featured: false,
      details: {
        furnitureType: 'Sofa',
        seatingCapacity: '3 Seater',
        color: 'Grey'
      }
    },
    {
      seedId: 'buyer-ai-test-free-05',
      sellerId: sId(0),
      categoryId: catMap['books-hobbies'],
      categorySlug: 'books-hobbies',
      subcategoryName: 'Books & Textbooks',
      title: 'Engineering & Computer Science Textbooks Collection (Free Giveaway)',
      description: 'Free educational giveaway in Bengaluru: Complete set of 12 engineering textbooks covering Data Structures, Algorithms, Computer Networks, Operating Systems, and DBMS.',
      listingType: 'FREE',
      condition: 'GOOD',
      price: 0,
      currency: 'INR',
      currencySymbol: '₹',
      negotiable: false,
      location: { country: 'India', region: 'Karnataka', city: 'Bengaluru', localArea: 'HSR Layout', address: 'Sector 2' },
      images: ['https://images.unsplash.com/photo-1497633762265-9d179a990aa6?auto=format&fit=crop&w=1200&q=80'],
      featured: false,
      details: {
        itemType: 'Books',
        quantity: '12 Books',
        subject: 'Computer Science'
      }
    },
    {
      seedId: 'buyer-ai-test-free-06',
      sellerId: sId(1),
      categoryId: catMap['books-hobbies'],
      categorySlug: 'books-hobbies',
      subcategoryName: 'Sports & Fitness Equipment',
      title: 'Hero Mountain Bicycle 21-Speed with Helmet (Free Giveaway) in Coimbatore',
      description: 'Free giveaway in Coimbatore: Hero 21-speed gear mountain bicycle with front suspension, mudguards, and helmet. Good running condition, self-pickup in RS Puram.',
      listingType: 'FREE',
      condition: 'GOOD',
      price: 0,
      currency: 'INR',
      currencySymbol: '₹',
      negotiable: false,
      location: { country: 'India', region: 'Tamil Nadu', city: 'Coimbatore', localArea: 'RS Puram', address: 'DB Road' },
      images: ['https://images.unsplash.com/photo-1485965120184-e220f721d03e?auto=format&fit=crop&w=1200&q=80'],
      featured: true,
      details: {
        brand: 'Hero',
        itemType: 'Bicycle',
        gears: '21 Speed Shimano'
      }
    },
    {
      seedId: 'buyer-ai-test-free-07',
      sellerId: sId(2),
      categoryId: catMap['products'],
      categorySlug: 'products',
      subcategoryName: 'TVs, Video & Audio',
      title: 'Stainless Steel Kitchen Cookware Set & Nonstick Pans (Free Items) in Hyderabad',
      description: 'Free household kitchen items in Hyderabad: Set of 5 stainless steel cooking pots, nonstick fry pan, and serving ladles. Relocating, free to whoever needs it.',
      listingType: 'FREE',
      condition: 'GOOD',
      price: 0,
      currency: 'INR',
      currencySymbol: '₹',
      negotiable: false,
      location: { country: 'India', region: 'Telangana', city: 'Hyderabad', localArea: 'Hitec City', address: 'Madhapur' },
      images: ['https://images.unsplash.com/photo-1556911220-e15b29be8c8f?auto=format&fit=crop&w=1200&q=80'],
      featured: false,
      details: {
        itemType: 'Kitchenware',
        itemsCount: '6 Pieces'
      }
    },
    {
      seedId: 'buyer-ai-test-free-08',
      sellerId: sId(3),
      categoryId: catMap['furniture'],
      categorySlug: 'furniture',
      subcategoryName: 'Home Decor & Lighting',
      title: 'Plastic Storage Drawers & Household Utility Organizers (Free Giveaway) in Pune',
      description: 'Free giveaway in Pune: 4-tier modular plastic storage organizer drawers and utility baskets. Clean and intact, pickup from Koregaon Park.',
      listingType: 'FREE',
      condition: 'GOOD',
      price: 0,
      currency: 'INR',
      currencySymbol: '₹',
      negotiable: false,
      location: { country: 'India', region: 'Maharashtra', city: 'Pune', localArea: 'Koregaon Park', address: 'Lane 7' },
      images: ['https://images.unsplash.com/photo-1584589167171-541ce45f1eea?auto=format&fit=crop&w=1200&q=80'],
      featured: false,
      details: {
        itemType: 'Storage Organizers',
        material: 'Virgin Plastic'
      }
    },
    {
      seedId: 'buyer-ai-test-free-09',
      sellerId: sId(0),
      categoryId: catMap['farm'],
      categorySlug: 'farm',
      subcategoryName: 'Crops, Seeds & Fertilizers',
      title: 'Large Ceramic Plant Pots & Terracotta Garden Planters (Free) in Mumbai',
      description: 'Free giveaway in Mumbai: 8 large ceramic decorative plant pots and terracotta planters with potting mix soil. Self-pickup from Bandra West balcony.',
      listingType: 'FREE',
      condition: 'GOOD',
      price: 0,
      currency: 'INR',
      currencySymbol: '₹',
      negotiable: false,
      location: { country: 'India', region: 'Maharashtra', city: 'Mumbai', localArea: 'Bandra West', address: 'Pali Hill' },
      images: ['https://images.unsplash.com/photo-1485955900006-10f4d324d411?auto=format&fit=crop&w=1200&q=80'],
      featured: false,
      details: {
        itemType: 'Garden Planters',
        quantity: '8 Pots'
      }
    },
    {
      seedId: 'buyer-ai-test-free-10',
      sellerId: sId(1),
      categoryId: catMap['furniture'],
      categorySlug: 'furniture',
      subcategoryName: 'Beds & Wardrobes',
      title: 'Wooden Baby Crib & Rocking Cradle with Mattress (Free Giveaway) in Delhi',
      description: 'Free baby furniture in Delhi: Solid pine wood convertible baby crib and rocking cradle with clean foam mattress and guard rails. Free pickup in Connaught Place.',
      listingType: 'FREE',
      condition: 'EXCELLENT',
      price: 0,
      currency: 'INR',
      currencySymbol: '₹',
      negotiable: false,
      location: { country: 'India', region: 'Delhi NCR', city: 'Delhi', localArea: 'Connaught Place', address: 'Janpath' },
      images: ['https://images.unsplash.com/photo-1586105251261-72a756497a11?auto=format&fit=crop&w=1200&q=80'],
      featured: false,
      details: {
        itemType: 'Baby Crib',
        material: 'Pine Wood',
        includesMattress: true
      }
    },

    // =========================================================================
    // 10. MAJOR EXISTING CATEGORIES (FURNITURE, FASHION, BOOKS, PETS - 10 TEST LISTINGS)
    // =========================================================================
    {
      seedId: 'buyer-ai-test-ext-01',
      sellerId: sId(0),
      categoryId: catMap['furniture'],
      categorySlug: 'furniture',
      subcategoryName: 'Sofa & Dining',
      title: '6-Seater Solid Teak Wood Dining Table with Cushioned Chairs',
      description: 'Premium dining furniture in Bengaluru: 6-seater solid teak wood dining table with glass top and 6 cushioned high-back chairs. Scratch resistant finish. Price ₹28,000.',
      listingType: 'SELL',
      condition: 'EXCELLENT',
      price: 28000,
      currency: 'INR',
      currencySymbol: '₹',
      negotiable: true,
      location: { country: 'India', region: 'Karnataka', city: 'Bengaluru', localArea: 'Koramangala', address: '4th Block' },
      images: ['https://images.unsplash.com/photo-1617806118233-18e1de247200?auto=format&fit=crop&w=1200&q=80'],
      featured: true,
      details: {
        material: 'Solid Teak Wood',
        seatingCapacity: '6 Persons',
        tableTop: 'Tempered Glass'
      }
    },
    {
      seedId: 'buyer-ai-test-ext-02',
      sellerId: sId(1),
      categoryId: catMap['furniture'],
      categorySlug: 'furniture',
      subcategoryName: 'Beds & Wardrobes',
      title: 'Queen Size Engineered Wood Bed with Hydraulic Storage in Chennai',
      description: 'Modern queen size bed (6x5 ft) in Chennai with easy-lift hydraulic storage box, upholstered headboard, and rich walnut wood finish. Price ₹19,500.',
      listingType: 'SELL',
      condition: 'LIKE_NEW',
      price: 19500,
      currency: 'INR',
      currencySymbol: '₹',
      negotiable: true,
      location: { country: 'India', region: 'Tamil Nadu', city: 'Chennai', localArea: 'Anna Nagar', address: '3rd Avenue' },
      images: ['https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=1200&q=80'],
      featured: false,
      details: {
        bedSize: 'Queen Size (78x60 in)',
        storageType: 'Hydraulic Storage',
        material: 'Engineered Wood'
      }
    },
    {
      seedId: 'buyer-ai-test-ext-03',
      sellerId: sId(2),
      categoryId: catMap['books-hobbies'],
      categorySlug: 'books-hobbies',
      subcategoryName: 'Musical Instruments',
      title: 'Yamaha F310 Acoustic Guitar with Padded Gig Bag & Tuner in Bangalore',
      description: 'Authentic Yamaha F310 dreadnought acoustic guitar in Bengaluru. Warm resonance tone, spruce top, rosewood fretboard, D’Addario strings, padded gig bag, and clip tuner. Price ₹7,500.',
      listingType: 'SELL',
      condition: 'LIKE_NEW',
      price: 7500,
      currency: 'INR',
      currencySymbol: '₹',
      negotiable: true,
      location: { country: 'India', region: 'Karnataka', city: 'Bengaluru', localArea: 'Indiranagar', address: '12th Main' },
      images: ['https://images.unsplash.com/photo-1510915361894-db8b60106cb1?auto=format&fit=crop&w=1200&q=80'],
      featured: false,
      details: {
        brand: 'Yamaha',
        instrument: 'Acoustic Guitar',
        model: 'F310',
        accessoriesIncluded: ['Padded Bag', 'Digital Tuner', 'Picks']
      }
    },
    {
      seedId: 'buyer-ai-test-ext-04',
      sellerId: sId(3),
      categoryId: catMap['books-hobbies'],
      categorySlug: 'books-hobbies',
      subcategoryName: 'Sports & Fitness Equipment',
      title: 'Decathlon Magnetic Resistance Exercise Spin Bike in Hyderabad',
      description: 'Heavy duty stationary workout exercise spin bike in Hyderabad. 8-level smooth magnetic resistance, digital LCD monitor tracking speed, distance, calories, and heart rate. Price ₹12,000.',
      listingType: 'SELL',
      condition: 'EXCELLENT',
      price: 12000,
      currency: 'INR',
      currencySymbol: '₹',
      negotiable: true,
      location: { country: 'India', region: 'Telangana', city: 'Hyderabad', localArea: 'Gachibowli', address: 'Near Stadium' },
      images: ['https://images.unsplash.com/photo-1517838277536-f5f99be501cd?auto=format&fit=crop&w=1200&q=80'],
      featured: false,
      details: {
        brand: 'Domyos by Decathlon',
        equipment: 'Spin Bike',
        flywheelWeight: '6 kg',
        maxUserWeight: '110 kg'
      }
    },
    {
      seedId: 'buyer-ai-test-ext-05',
      sellerId: sId(0),
      categoryId: catMap['fashion'],
      categorySlug: 'fashion',
      subcategoryName: 'Men Fashion',
      title: 'Pure Leather Biker Jacket for Men Size L in Delhi',
      description: 'Genuine full-grain lambskin leather biker jacket in Delhi. YKK metal zippers, quilted satin lining, zippered cuffs, tailored size Large, classic black finish. Price ₹4,500.',
      listingType: 'SELL',
      condition: 'LIKE_NEW',
      price: 4500,
      currency: 'INR',
      currencySymbol: '₹',
      negotiable: true,
      location: { country: 'India', region: 'Delhi NCR', city: 'Delhi', localArea: 'Connaught Place', address: 'Khan Market' },
      images: ['https://images.unsplash.com/photo-1551028719-00167b16eac5?auto=format&fit=crop&w=1200&q=80'],
      featured: false,
      details: {
        material: '100% Genuine Leather',
        size: 'L (40-42)',
        color: 'Black'
      }
    },
    {
      seedId: 'buyer-ai-test-ext-06',
      sellerId: sId(1),
      categoryId: catMap['fashion'],
      categorySlug: 'fashion',
      subcategoryName: 'Watches & Jewelry',
      title: 'Fossil Gen 6 Smartwatch with Stainless Steel Strap in Mumbai',
      description: 'Elegant Fossil Gen 6 Touchscreen Smartwatch in Mumbai. Snapdragon Wear 4100+, AMOLED display, SpO2 blood oxygen sensor, heart rate tracking, rapid charging, water resistant. Price ₹11,000.',
      listingType: 'SELL',
      condition: 'LIKE_NEW',
      price: 11000,
      currency: 'INR',
      currencySymbol: '₹',
      negotiable: true,
      location: { country: 'India', region: 'Maharashtra', city: 'Mumbai', localArea: 'Bandra West', address: 'Turner Road' },
      images: ['https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=1200&q=80'],
      featured: false,
      details: {
        brand: 'Fossil',
        model: 'Gen 6',
        caseSize: '44 mm',
        strapMaterial: 'Stainless Steel'
      }
    },
    {
      seedId: 'buyer-ai-test-ext-07',
      sellerId: sId(2),
      categoryId: catMap['pets'],
      categorySlug: 'pets',
      subcategoryName: 'Aquariums & Fish',
      title: 'Automatic Fish Aquarium with LED Lighting & Power Filter in Kochi',
      description: 'Curved glass 50-litre tropical fish aquarium setup in Kochi. Built-in multi-mode LED lighting, power bio-filter pump, water heater, substrate gravel, and live plants. Price ₹4,800.',
      listingType: 'SELL',
      condition: 'EXCELLENT',
      price: 4800,
      currency: 'INR',
      currencySymbol: '₹',
      negotiable: true,
      location: { country: 'India', region: 'Kerala', city: 'Kochi', localArea: 'Marine Drive', address: 'Shanmugham Road' },
      images: ['https://images.unsplash.com/photo-1522069169874-c58ec4b76be5?auto=format&fit=crop&w=1200&q=80'],
      featured: false,
      details: {
        capacity: '50 Litres',
        glassType: 'Curved Tempered Glass',
        filterType: 'Top Submersible Filter'
      }
    },
    {
      seedId: 'buyer-ai-test-ext-08',
      sellerId: sId(3),
      categoryId: catMap['pets'],
      categorySlug: 'pets',
      subcategoryName: 'Pet Food & Accessories',
      title: 'Royal Canin Premium Golden Retriever Dog Food 15kg in Coimbatore',
      description: 'Sealed 15kg bag of Royal Canin Breed Health Nutrition adult dog food for Golden Retrievers in Coimbatore. Rich in EPA-DHA and omega fatty acids for skin and cardiac health. Price ₹6,200.',
      listingType: 'SELL',
      condition: 'NEW',
      price: 6200,
      currency: 'INR',
      currencySymbol: '₹',
      negotiable: false,
      location: { country: 'India', region: 'Tamil Nadu', city: 'Coimbatore', localArea: 'RS Puram', address: 'DB Road' },
      images: ['https://images.unsplash.com/photo-1589924691995-400dc9ecc119?auto=format&fit=crop&w=1200&q=80'],
      featured: false,
      details: {
        brand: 'Royal Canin',
        weight: '15 kg',
        targetBreed: 'Golden Retriever Adult'
      }
    },
    {
      seedId: 'buyer-ai-test-ext-09',
      sellerId: sId(0),
      categoryId: catMap['books-hobbies'],
      categorySlug: 'books-hobbies',
      subcategoryName: 'Musical Instruments',
      title: 'Vintage Vinyl Record Player & Turntable with Built-in Bluetooth in Mysuru',
      description: 'Classic wooden 3-speed turntable record player (33/45/78 RPM) in Mysuru Gokulam. Built-in stereo speakers, Bluetooth receiver, RCA line-out, and headphone jack with 3 classic vinyl LP records. Price ₹9,800.',
      listingType: 'SELL',
      condition: 'LIKE_NEW',
      price: 9800,
      currency: 'INR',
      currencySymbol: '₹',
      negotiable: true,
      location: { country: 'India', region: 'Karnataka', city: 'Mysuru', localArea: 'Gokulam', address: 'Gokulam 3rd Stage' },
      images: ['https://images.unsplash.com/photo-1539375665275-f9de415ef9ac?auto=format&fit=crop&w=1200&q=80'],
      featured: false,
      details: {
        speeds: '33 1/3, 45, 78 RPM',
        connectivity: 'Bluetooth + RCA Line Out',
        casing: 'Vintage Walnut Wood'
      }
    },
    {
      seedId: 'buyer-ai-test-ext-10',
      sellerId: sId(1),
      categoryId: catMap['furniture'],
      categorySlug: 'furniture',
      subcategoryName: 'Beds & Wardrobes',
      title: 'Classic Wooden Wardrobe 3-Door with Full-Length Mirror in Bangalore',
      description: 'Spacious 3-door wooden bedroom wardrobe in Bengaluru. Hanging rod, 5 multi-tier shelves, 2 internal locking drawers, and full-length dressing mirror. Price ₹16,000.',
      listingType: 'SELL',
      condition: 'EXCELLENT',
      price: 16000,
      currency: 'INR',
      currencySymbol: '₹',
      negotiable: true,
      location: { country: 'India', region: 'Karnataka', city: 'Bengaluru', localArea: 'HSR Layout', address: 'Sector 3' },
      images: ['https://images.unsplash.com/photo-1595428774223-ef52624120d2?auto=format&fit=crop&w=1200&q=80'],
      featured: false,
      details: {
        doors: '3 Doors',
        material: 'Solid Engineered Wood',
        dimensions: '6.5ft x 4ft x 2ft',
        hasMirror: true
      }
    }
  ];
};

/**
 * Main Seeding Function
 */
export async function seedMarketplace() {
  try {
    if (!MONGODB_URI) {
      console.error('[Error] MONGODB_URI is not defined in backend/.env');
      process.exit(1);
    }

    console.log('Connecting to MongoDB Atlas for Marketplace Seeding...');
    await mongoose.connect(MONGODB_URI, { serverSelectionTimeoutMS: 15000 });
    console.log(`Connected to database: ${mongoose.connection.name}`);

    // 1. Fetch Existing Categories from DB
    const existingCategories = await Category.find({}).lean();
    if (!existingCategories || existingCategories.length === 0) {
      throw new Error('No categories found in database. Please run base seed first.');
    }
    const catMap = {};
    existingCategories.forEach((c) => {
      catMap[c.slug] = c._id;
    });
    console.log(`Mapped ${Object.keys(catMap).length} categories from DB.`);

    // 2. Fetch or Create Approved Seller Users
    let approvedSellers = await User.find({
      role: { $in: ['SELLER', 'ADMIN', 'admin', 'seller'] },
      sellerStatus: { $in: ['APPROVED', 'NOT_APPLICABLE'] }
    });

    if (approvedSellers.length === 0) {
      console.log('Creating default verified test merchant user...');
      const testSeller = await User.create({
        name: 'Velvorax Verified Merchant',
        email: 'test.merchant@velvorax.com',
        passwordHash: 'Password@123',
        phone: '+91 98450 77889',
        bio: 'Verified official test merchant on Velvorax Marketplace.',
        role: 'SELLER',
        sellerStatus: 'APPROVED',
        accountStatus: 'ACTIVE',
        verificationStatus: 'VERIFIED',
        rating: 4.9,
        reviewCount: 42,
        isTestData: true,
        seedSource: 'buyer-ai-test',
        location: { country: 'India', city: 'Bengaluru', region: 'Karnataka' }
      });
      approvedSellers = [testSeller];
    }
    const sellerIds = approvedSellers.map((s) => s._id);
    console.log(`Using ${sellerIds.length} verified sellers for listing attribution.`);

    // 3. Ensure Locations in DB contain target cities
    const indiaLoc = await Location.findOne({ countryName: 'India' });
    if (indiaLoc) {
      let modified = false;
      const targetCitiesMap = {
        'Karnataka': ['Bengaluru', 'Mysuru'],
        'Tamil Nadu': ['Chennai', 'Coimbatore', 'Madurai'],
        'Maharashtra': ['Mumbai', 'Pune'],
        'Telangana': ['Hyderabad'],
        'Delhi NCR': ['Delhi', 'New Delhi', 'Gurugram'],
        'Kerala': ['Kochi']
      };

      for (const [regionName, cities] of Object.entries(targetCitiesMap)) {
        let region = indiaLoc.regions.find((r) => r.name.toLowerCase() === regionName.toLowerCase());
        if (!region) {
          region = { name: regionName, slug: regionName.toLowerCase().replace(/\s+/g, '-'), cities: [], active: true };
          indiaLoc.regions.push(region);
          modified = true;
        }
        for (const cityName of cities) {
          const cityExists = region.cities.some((c) => c.name.toLowerCase() === cityName.toLowerCase());
          if (!cityExists) {
            region.cities.push({
              name: cityName,
              slug: cityName.toLowerCase().replace(/\s+/g, '-'),
              popular: true,
              localAreas: [],
              active: true
            });
            modified = true;
          }
        }
      }
      if (modified) {
        await indiaLoc.save();
        console.log('Updated India Location document with target cities.');
      }
    }

    // 4. Generate the 100 test listings
    const testListingsData = getMarketplaceTestListings(catMap, sellerIds);
    console.log(`\nPreparing to seed ${testListingsData.length} test listings...`);

    let createdCount = 0;
    let updatedCount = 0;
    const categoryCounts = {};
    const citiesSet = new Set();

    for (const item of testListingsData) {
      const city = item.location?.city || 'Bengaluru';
      citiesSet.add(city);
      const coords = CITY_COORDINATES[city] || { lat: 12.9716, lng: 77.5946 };
      item.location.latitude = coords.lat;
      item.location.longitude = coords.lng;
      item.geoPoint = {
        type: 'Point',
        coordinates: [coords.lng, coords.lat]
      };

      item.status = 'APPROVED';
      item.isTestData = true;
      item.seedSource = 'buyer-ai-test';
      item.approvedAt = new Date();
      item.views = item.views || Math.floor(Math.random() * 500) + 100;
      item.favoritesCount = item.favoritesCount || Math.floor(Math.random() * 30) + 5;

      const res = await Listing.findOneAndUpdate(
        { seedId: item.seedId },
        { $set: item },
        { upsert: true, new: true, rawResult: true, setDefaultsOnInsert: true }
      );

      if (res.lastErrorObject?.updatedExisting) {
        updatedCount++;
      } else {
        createdCount++;
      }

      categoryCounts[item.categorySlug] = (categoryCounts[item.categorySlug] || 0) + 1;
    }

    console.log('\n================================================================');
    console.log('VELVORAX MARKETPLACE CONTROLLED SEEDING SUMMARY');
    console.log('================================================================');
    console.log(`• Total Test Listings Processed: ${testListingsData.length}`);
    console.log(`• Inserted New: ${createdCount} | Updated In-Place: ${updatedCount}`);
    console.log(`• Status: ALL ${testListingsData.length} listings are status = APPROVED`);
    console.log(`• Marker: isTestData: true, seedSource: "buyer-ai-test"`);
    console.log(`\n• Breakdown per category slug:`);
    Object.entries(categoryCounts).forEach(([slug, count]) => {
      console.log(`  - ${slug}: ${count} listings`);
    });
    console.log(`\n• Cities covered (${citiesSet.size}): ${Array.from(citiesSet).join(', ')}`);

    const realListingsCount = await Listing.countDocuments({
      isTestData: { $ne: true },
      seedSource: { $ne: 'buyer-ai-test' }
    });
    console.log(`\n• Real user listings untouched: ${realListingsCount}`);
    console.log('================================================================\n');

    return { success: true, total: testListingsData.length, created: createdCount, updated: updatedCount };
  } catch (error) {
    console.error('[Seeding Error]:', error);
    throw error;
  }
}

// Direct execution CLI support
if (process.argv[1]?.endsWith('seedMarketplace.js')) {
  seedMarketplace()
    .then(() => {
      console.log('Marketplace seeding completed successfully.');
      process.exit(0);
    })
    .catch((err) => {
      console.error('Fatal seed failure:', err);
      process.exit(1);
    });
}
