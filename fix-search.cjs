const fs = require('fs');

const searchPath = 'frontend/src/pages/marketplace/Search.jsx';
let searchCode = fs.readFileSync(searchPath, 'utf8');

searchCode = searchCode.replace(/import React from 'react';/, "import React, { useState, useEffect } from 'react';\nimport { listingsService } from '../../services';\nimport { ListingCard, Loader, EmptyState } from '../../components';");

const stateLogic = `
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      setLoading(true);
      try {
        const results = await listingsService.getListings({ 
          search: searchParams.get('q') || '', 
          category: searchParams.get('category') || '' 
        });
        setListings(results);
      } catch (err) {
        console.error(err);
      }
      setLoading(false);
    };
    fetch();
  }, [searchParams]);
`;

searchCode = searchCode.replace(/const listingType.*?category\};\s*/s, 
  `const listingType = searchParams.get('listingType');\n  const category = searchParams.get('category');\n  const q = searchParams.get('q');\n` + stateLogic
);

searchCode = searchCode.replace(/let title = "Explore Marketplace";.*?\} \s*return \(/s, 
  `let title = "Explore Marketplace";
  if (listingType === 'rent') title = "Rent Listings";
  else if (listingType === 'exchange') title = "Exchange";
  else if (listingType === 'free') title = "Free Giveaway";
  else if (category) title = \`Category: \${category}\`;
  if (q) title = \`Search results for "\${q}"\`;

  return (`
);

const renderGrid = `
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {loading ? (
            <div className="col-span-full py-10"><Loader /></div>
          ) : listings.length === 0 ? (
            <div className="col-span-full"><EmptyState title="No results found" description="Try adjusting your search filters." /></div>
          ) : (
            listings.map(item => (
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
        </div>
`;
searchCode = searchCode.replace(/<div className="grid.*?<\/div>\s*<\/div>/s, renderGrid + "\n      ");

fs.writeFileSync(searchPath, searchCode);
console.log('Search.jsx updated to use real service');
