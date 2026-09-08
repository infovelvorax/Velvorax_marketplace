const fs = require('fs');
const path = require('path');

const content = `import { MOCK_LISTINGS } from '../../data/mockData';

const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

export const listingsService = {
  getListings: async (filters = {}) => {
    await delay(600); // Simulate network
    let results = [...MOCK_LISTINGS];
    
    if (filters.category) {
      results = results.filter(l => l.category.toLowerCase() === filters.category.toLowerCase());
    }
    
    if (filters.search) {
      const q = filters.search.toLowerCase();
      results = results.filter(l => l.title.toLowerCase().includes(q) || l.description.toLowerCase().includes(q));
    }
    
    return results;
  },

  getListingDetails: async (id) => {
    await delay(500);
    const listing = MOCK_LISTINGS.find(l => l.id === id);
    if (!listing) throw new Error('Listing not found');
    return listing;
  },
  
  createListing: async (listingData) => {
    await delay(800);
    // Pretend to save
    const newListing = {
      ...listingData,
      id: Math.random().toString(36).substring(7),
      createdAt: new Date().toISOString(),
      status: 'PENDING'
    };
    return { success: true, listing: newListing };
  }
};
`;

fs.writeFileSync('frontend/src/services/api/listings.service.js', content);

let indexContent = fs.readFileSync('frontend/src/services/api/index.js', 'utf8');
if (!indexContent.includes('listings.service')) {
  fs.writeFileSync('frontend/src/services/api/index.js', indexContent + "\nexport * from './listings.service';");
}

console.log('Created listings.service.js');
