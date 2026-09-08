const fs = require('fs');
const path = require('path');

const pages = [
  { file: 'frontend/src/pages/properties/Properties.jsx', cat: 'Properties', type: 'Properties for Sale & Rent' },
  { file: 'frontend/src/pages/vehicles/Vehicles.jsx', cat: 'Vehicles', type: 'Vehicles for Sale' },
  { file: 'frontend/src/pages/products/Products.jsx', cat: 'Products', type: 'Products for Sale & Exchange' },
  { file: 'frontend/src/pages/jobs/Jobs.jsx', cat: 'Jobs', type: 'Job Opportunities' },
  { file: 'frontend/src/pages/services/Services.jsx', cat: 'Services', type: 'Professional Services' },
  { file: 'frontend/src/pages/agriculture/Agriculture.jsx', cat: 'Agriculture', type: 'Agriculture & Farm' },
  { file: 'frontend/src/pages/businesses/Businesses.jsx', cat: 'Businesses', type: 'Business Directory' },
];

pages.forEach(p => {
  if (!fs.existsSync(p.file)) return;
  
  let c = fs.readFileSync(p.file, 'utf8');
  
  // Replace imports to include hooks and service
  if (!c.includes('useState')) {
    c = c.replace(/import React from 'react';/, "import React, { useState, useEffect } from 'react';\nimport { listingsService } from '../../services';\nimport { Loader, EmptyState } from '../../components';");
  }
  
  // Define state inside component
  const stateLogic = `
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchListings = async () => {
      try {
        setLoading(true);
        const data = await listingsService.getListings({ category: '${p.cat}' });
        setListings(data);
      } catch (err) {
        setError('Failed to load listings');
      } finally {
        setLoading(false);
      }
    };
    fetchListings();
  }, []);
  `;
  
  // Inject state logic before return
  c = c.replace(/export function [A-Za-z]+\(\) \{\s*return \(/, `export function ${path.basename(p.file, '.jsx')}() {${stateLogic}\n  return (`);
  
  // Replace the mock map logic: `{[1, 2, 3, 4, 5, 6].map((i) => (`
  const mapRegex = /\{\[1, 2, 3, 4, 5, 6\]\.map\(\(i\) => \([\s\S]*?\}\)\)\}/m;
  const listRender = `
              {loading ? (
                <div className="col-span-full py-20 flex justify-center"><Loader /></div>
              ) : error ? (
                <div className="col-span-full"><div className="text-red-500 text-center py-10">{error}</div></div>
              ) : listings.length === 0 ? (
                <div className="col-span-full"><EmptyState title="No listings found" description="There are currently no listings in this category." /></div>
              ) : (
                listings.map((item) => (
                  <ListingCard 
                    key={item.id}
                    id={item.id}
                    type={item.listingType}
                    title={item.title}
                    price={item.price}
                    location={item.location?.city || 'Location'}
                    postedDate="Recently"
                    image={item.images?.[0] || 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?q=80&w=800'}
                    seller={item.seller}
                  />
                ))
              )}
  `;
  c = c.replace(mapRegex, listRender.trim());
  
  fs.writeFileSync(p.file, c);
});

console.log('Updated category pages to use isolated service API');
