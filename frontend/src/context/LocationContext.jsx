import React, { createContext, useContext, useState, useEffect } from 'react';
import { locationService } from '../services/api/location.service';
import { COUNTRY_CURRENCY_MAP, formatListingPrice } from '../utils/formatters';

export const DEFAULT_WORLDWIDE_LOCATIONS = [
  {
    countryName: 'India',
    countryCode: 'IN',
    currency: 'INR',
    currencySymbol: '₹',
    popular: true,
    regions: [
      {
        name: 'Karnataka',
        slug: 'karnataka',
        cities: [
          {
            name: 'Bengaluru',
            slug: 'bengaluru',
            popular: true,
            localAreas: [
              { name: 'Koramangala', slug: 'koramangala' },
              { name: 'Indiranagar', slug: 'indiranagar' },
              { name: 'Whitefield', slug: 'whitefield' },
              { name: 'HSR Layout', slug: 'hsr-layout' }
            ]
          },
          {
            name: 'Mysuru',
            slug: 'mysuru',
            popular: false,
            localAreas: [{ name: 'Gokulam', slug: 'gokulam' }]
          }
        ]
      },
      {
        name: 'Tamil Nadu',
        slug: 'tamil-nadu',
        cities: [
          {
            name: 'Chennai',
            slug: 'chennai',
            popular: true,
            localAreas: [
              { name: 'Anna Nagar', slug: 'anna-nagar' },
              { name: 'T Nagar', slug: 't-nagar' },
              { name: 'OMR', slug: 'omr' },
              { name: 'Adyar', slug: 'adyar' }
            ]
          },
          {
            name: 'Coimbatore',
            slug: 'coimbatore',
            popular: true,
            localAreas: [{ name: 'RS Puram', slug: 'rs-puram' }]
          }
        ]
      },
      {
        name: 'Maharashtra',
        slug: 'maharashtra',
        cities: [
          {
            name: 'Mumbai',
            slug: 'mumbai',
            popular: true,
            localAreas: [
              { name: 'Bandra West', slug: 'bandra-west' },
              { name: 'Andheri East', slug: 'andheri-east' },
              { name: 'Juhu', slug: 'juhu' }
            ]
          },
          {
            name: 'Pune',
            slug: 'pune',
            popular: true,
            localAreas: [
              { name: 'Koregaon Park', slug: 'koregaon-park' },
              { name: 'Kothrud', slug: 'kothrud' }
            ]
          }
        ]
      },
      {
        name: 'Telangana',
        slug: 'telangana',
        cities: [
          {
            name: 'Hyderabad',
            slug: 'hyderabad',
            popular: true,
            localAreas: [
              { name: 'Gachibowli', slug: 'gachibowli' },
              { name: 'Hitec City', slug: 'hitec-city' },
              { name: 'Jubilee Hills', slug: 'jubilee-hills' }
            ]
          }
        ]
      },
      {
        name: 'Delhi NCR',
        slug: 'delhi-ncr',
        cities: [
          {
            name: 'New Delhi',
            slug: 'new-delhi',
            popular: true,
            localAreas: [
              { name: 'Connaught Place', slug: 'connaught-place' },
              { name: 'Hauz Khas', slug: 'hauz-khas' }
            ]
          },
          {
            name: 'Gurugram',
            slug: 'gurugram',
            popular: true,
            localAreas: [{ name: 'Cyber City', slug: 'cyber-city' }]
          }
        ]
      }
    ]
  },
  {
    countryName: 'United States',
    countryCode: 'US',
    currency: 'USD',
    currencySymbol: '$',
    popular: true,
    regions: [
      {
        name: 'California',
        slug: 'california',
        cities: [
          {
            name: 'San Francisco',
            slug: 'san-francisco',
            popular: true,
            localAreas: [{ name: 'SOMA', slug: 'soma' }, { name: 'Mission', slug: 'mission' }]
          },
          {
            name: 'Los Angeles',
            slug: 'los-angeles',
            popular: true,
            localAreas: [{ name: 'Downtown', slug: 'downtown' }, { name: 'Santa Monica', slug: 'santa-monica' }]
          }
        ]
      },
      {
        name: 'New York',
        slug: 'new-york',
        cities: [
          {
            name: 'New York City',
            slug: 'new-york-city',
            popular: true,
            localAreas: [{ name: 'Manhattan', slug: 'manhattan' }, { name: 'Brooklyn', slug: 'brooklyn' }]
          }
        ]
      },
      {
        name: 'Texas',
        slug: 'texas',
        cities: [
          {
            name: 'Austin',
            slug: 'austin',
            popular: true,
            localAreas: [{ name: 'Downtown Austin', slug: 'downtown-austin' }]
          },
          {
            name: 'Houston',
            slug: 'houston',
            popular: true,
            localAreas: [{ name: 'Galleria', slug: 'galleria' }]
          }
        ]
      }
    ]
  },
  {
    countryName: 'United Arab Emirates',
    countryCode: 'AE',
    currency: 'AED',
    currencySymbol: 'AED',
    popular: true,
    regions: [
      {
        name: 'Dubai',
        slug: 'dubai',
        cities: [
          {
            name: 'Dubai',
            slug: 'dubai-city',
            popular: true,
            localAreas: [
              { name: 'Downtown Dubai', slug: 'downtown-dubai' },
              { name: 'Dubai Marina', slug: 'dubai-marina' },
              { name: 'Business Bay', slug: 'business-bay' },
              { name: 'JLT', slug: 'jlt' }
            ]
          }
        ]
      },
      {
        name: 'Abu Dhabi',
        slug: 'abu-dhabi',
        cities: [
          {
            name: 'Abu Dhabi',
            slug: 'abu-dhabi-city',
            popular: true,
            localAreas: [{ name: 'Corniche', slug: 'corniche' }]
          }
        ]
      }
    ]
  },
  {
    countryName: 'United Kingdom',
    countryCode: 'GB',
    currency: 'GBP',
    currencySymbol: '£',
    popular: true,
    regions: [
      {
        name: 'England',
        slug: 'england',
        cities: [
          {
            name: 'London',
            slug: 'london',
            popular: true,
            localAreas: [
              { name: 'Westminster', slug: 'westminster' },
              { name: 'Canary Wharf', slug: 'canary-wharf' },
              { name: 'Camden', slug: 'camden' }
            ]
          },
          {
            name: 'Manchester',
            slug: 'manchester',
            popular: true,
            localAreas: [{ name: 'City Centre', slug: 'manchester-city-centre' }]
          }
        ]
      },
      {
        name: 'Scotland',
        slug: 'scotland',
        cities: [
          {
            name: 'Edinburgh',
            slug: 'edinburgh',
            popular: true,
            localAreas: [{ name: 'Old Town', slug: 'old-town' }]
          }
        ]
      }
    ]
  },
  {
    countryName: 'Canada',
    countryCode: 'CA',
    currency: 'CAD',
    currencySymbol: 'CA$',
    popular: true,
    regions: [
      {
        name: 'Ontario',
        slug: 'ontario',
        cities: [
          {
            name: 'Toronto',
            slug: 'toronto',
            popular: true,
            localAreas: [{ name: 'Downtown Toronto', slug: 'downtown-toronto' }]
          }
        ]
      },
      {
        name: 'British Columbia',
        slug: 'british-columbia',
        cities: [
          {
            name: 'Vancouver',
            slug: 'vancouver',
            popular: true,
            localAreas: [{ name: 'Yaletown', slug: 'yaletown' }]
          }
        ]
      }
    ]
  },
  {
    countryName: 'Australia',
    countryCode: 'AU',
    currency: 'AUD',
    currencySymbol: 'A$',
    popular: true,
    regions: [
      {
        name: 'New South Wales',
        slug: 'new-south-wales',
        cities: [
          {
            name: 'Sydney',
            slug: 'sydney',
            popular: true,
            localAreas: [{ name: 'CBD', slug: 'sydney-cbd' }]
          }
        ]
      },
      {
        name: 'Victoria',
        slug: 'victoria',
        cities: [
          {
            name: 'Melbourne',
            slug: 'melbourne',
            popular: true,
            localAreas: [{ name: 'Southbank', slug: 'southbank' }]
          }
        ]
      }
    ]
  },
  {
    countryName: 'Singapore',
    countryCode: 'SG',
    currency: 'SGD',
    currencySymbol: 'S$',
    popular: true,
    regions: [
      {
        name: 'Central Region',
        slug: 'central-region',
        cities: [
          {
            name: 'Singapore',
            slug: 'singapore-city',
            popular: true,
            localAreas: [{ name: 'Marina Bay', slug: 'marina-bay' }, { name: 'Orchard', slug: 'orchard' }]
          }
        ]
      }
    ]
  },
  {
    countryName: 'Germany',
    countryCode: 'DE',
    currency: 'EUR',
    currencySymbol: '€',
    popular: true,
    regions: [
      {
        name: 'Bavaria',
        slug: 'bavaria',
        cities: [
          {
            name: 'Munich',
            slug: 'munich',
            popular: true,
            localAreas: [{ name: 'Altstadt', slug: 'altstadt' }]
          }
        ]
      },
      {
        name: 'Berlin',
        slug: 'berlin',
        cities: [
          {
            name: 'Berlin',
            slug: 'berlin-city',
            popular: true,
            localAreas: [{ name: 'Mitte', slug: 'mitte' }]
          }
        ]
      }
    ]
  }
];

export const DEFAULT_POPULAR_CITIES = [
  { name: 'Dubai', countryName: 'United Arab Emirates', countryCode: 'AE', region: 'Dubai', currency: 'AED', currencySymbol: 'AED' },
  { name: 'London', countryName: 'United Kingdom', countryCode: 'GB', region: 'England', currency: 'GBP', currencySymbol: '£' },
  { name: 'New York City', countryName: 'United States', countryCode: 'US', region: 'New York', currency: 'USD', currencySymbol: '$' },
  { name: 'San Francisco', countryName: 'United States', countryCode: 'US', region: 'California', currency: 'USD', currencySymbol: '$' },
  { name: 'Bengaluru', countryName: 'India', countryCode: 'IN', region: 'Karnataka', currency: 'INR', currencySymbol: '₹' },
  { name: 'Chennai', countryName: 'India', countryCode: 'IN', region: 'Tamil Nadu', currency: 'INR', currencySymbol: '₹' },
  { name: 'Mumbai', countryName: 'India', countryCode: 'IN', region: 'Maharashtra', currency: 'INR', currencySymbol: '₹' },
  { name: 'Hyderabad', countryName: 'India', countryCode: 'IN', region: 'Telangana', currency: 'INR', currencySymbol: '₹' },
  { name: 'Toronto', countryName: 'Canada', countryCode: 'CA', region: 'Ontario', currency: 'CAD', currencySymbol: 'CA$' },
  { name: 'Sydney', countryName: 'Australia', countryCode: 'AU', region: 'New South Wales', currency: 'AUD', currencySymbol: 'A$' },
  { name: 'Singapore', countryName: 'Singapore', countryCode: 'SG', region: 'Central Region', currency: 'SGD', currencySymbol: 'S$' },
  { name: 'Berlin', countryName: 'Germany', countryCode: 'DE', region: 'Berlin', currency: 'EUR', currencySymbol: '€' }
];

const DEFAULT_LOCATION = {
  country: '',
  countryCode: '',
  region: '',
  city: '',
  localArea: '',
  currency: 'USD',
  currencySymbol: '$'
};

export const LocationContext = createContext({
  selectedLocation: DEFAULT_LOCATION,
  locations: DEFAULT_WORLDWIDE_LOCATIONS,
  popularCities: DEFAULT_POPULAR_CITIES,
  setLocation: () => {},
  setCountry: () => {},
  setRegion: () => {},
  setCity: () => {},
  setLocalArea: () => {},
  clearLocation: () => {},
  isLoading: false
});

export const LocationProvider = ({ children }) => {
  const [locations, setLocations] = useState(DEFAULT_WORLDWIDE_LOCATIONS);
  const [popularCities, setPopularCities] = useState(DEFAULT_POPULAR_CITIES);
  const [isLoading, setIsLoading] = useState(true);

  const [selectedLocation, setSelectedLocation] = useState(() => {
    try {
      const saved = localStorage.getItem('velvorax_location');
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error('Error loading location from storage', e);
    }
    return DEFAULT_LOCATION;
  });

  useEffect(() => {
    let isMounted = true;
    const fetchLocations = async () => {
      try {
        const [locsRes, popCitiesRes] = await Promise.all([
          locationService.getLocations(),
          locationService.getPopularCities()
        ]);
        const locs = Array.isArray(locsRes) ? locsRes : (Array.isArray(locsRes?.data) ? locsRes.data : []);
        const popCities = Array.isArray(popCitiesRes) ? popCitiesRes : (Array.isArray(popCitiesRes?.data) ? popCitiesRes.data : []);
        if (isMounted) {
          if (locs.length > 0) {
            setLocations(locs);
          }
          if (popCities.length > 0) {
            setPopularCities(popCities);
          }
        }
      } catch (err) {
        // Graceful fallback to built-in worldwide catalogue
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };
    fetchLocations();

    return () => {
      isMounted = false;
    };
  }, []);


  const setLocation = (newLoc) => {
    setSelectedLocation(prev => {
      const updated = { ...prev, ...newLoc };
      try {
        localStorage.setItem('velvorax_location', JSON.stringify(updated));
      } catch (e) {
        console.error('Failed to save location', e);
      }
      return updated;
    });
  };

  const setCountry = (countryName) => {
    const targetCountry = locations.find(
      l => l.countryName?.toLowerCase() === countryName?.toLowerCase() ||
           l.countryCode?.toUpperCase() === countryName?.toUpperCase()
    );

    const countryKey = targetCountry?.countryName || countryName || 'India';
    const countryMeta = COUNTRY_CURRENCY_MAP[countryKey] || (countryKey.toLowerCase().includes('india') ? COUNTRY_CURRENCY_MAP['India'] : COUNTRY_CURRENCY_MAP['United States']);
    const currency = targetCountry?.currency || countryMeta?.currency || (countryKey === 'India' ? 'INR' : 'USD');
    const currencySymbol = targetCountry?.currencySymbol || countryMeta?.symbol || (currency === 'INR' ? '₹' : '$');

    const updated = {
      country: targetCountry ? targetCountry.countryName : (countryName || 'India'),
      countryCode: targetCountry ? targetCountry.countryCode : (currency === 'INR' ? 'IN' : 'US'),
      currency,
      currencySymbol,
      region: '',     // Reset state / province
      city: '',       // Reset city
      localArea: ''   // Reset local area
    };
    setLocation(updated);
  };

  const setRegion = (regionName) => {
    setLocation({
      region: regionName || '',
      city: '',       // Reset city
      localArea: ''   // Reset local area
    });
  };

  const setCity = (cityName, regionName, countryName) => {
    let targetCountry = countryName 
      ? locations.find(l => l.countryName === countryName)
      : locations.find(l => l.countryName === selectedLocation.country);

    const effectiveCountry = targetCountry?.countryName || countryName || selectedLocation.country || 'India';
    const countryMeta = COUNTRY_CURRENCY_MAP[effectiveCountry] || {};
    const currency = targetCountry?.currency || countryMeta?.currency || selectedLocation.currency || (effectiveCountry === 'India' ? 'INR' : 'USD');
    const currencySymbol = targetCountry?.currencySymbol || countryMeta?.symbol || selectedLocation.currencySymbol || (currency === 'INR' ? '₹' : '$');

    const updated = {
      country: effectiveCountry,
      countryCode: targetCountry ? targetCountry.countryCode : (selectedLocation.countryCode || (currency === 'INR' ? 'IN' : 'US')),
      currency,
      currencySymbol,
      region: regionName !== undefined ? regionName : (selectedLocation.region || ''),
      city: cityName || '',
      localArea: ''   // Reset local area
    };
    setLocation(updated);
  };

  const setLocalArea = (localAreaName) => {
    setLocation({ localArea: localAreaName || '' });
  };

  const clearLocation = () => {
    const reset = {
      country: 'India',
      countryCode: 'IN',
      region: '',
      city: '',
      localArea: '',
      currency: 'INR',
      currencySymbol: '₹'
    };
    try {
      localStorage.removeItem('velvorax_location');
    } catch (e) {}
    setLocation(reset);
  };

  const syncWithUserLocation = (userLoc) => {
    if (!userLoc || !userLoc.country) return;
    const countryKey = userLoc.country;
    const countryMeta = COUNTRY_CURRENCY_MAP[countryKey] || (countryKey.toLowerCase().includes('india') ? COUNTRY_CURRENCY_MAP['India'] : COUNTRY_CURRENCY_MAP['United States']);
    const currency = userLoc.currency || countryMeta?.currency || (countryKey === 'India' ? 'INR' : 'USD');
    const currencySymbol = userLoc.currencySymbol || countryMeta?.symbol || (currency === 'INR' ? '₹' : '$');

    const synced = {
      country: userLoc.country,
      countryCode: userLoc.countryCode || (currency === 'INR' ? 'IN' : 'US'),
      region: userLoc.state || userLoc.region || '',
      city: userLoc.city || '',
      localArea: userLoc.localArea || '',
      currency,
      currencySymbol
    };
    setLocation(synced);
  };

  const resetOnLogout = () => {
    try {
      localStorage.removeItem('velvorax_location');
    } catch (e) {}
    setSelectedLocation(DEFAULT_LOCATION);
  };

  const formatPrice = (price, options = {}) => {
    return formatListingPrice(price, selectedLocation.currency, null, options);
  };

  return (
    <LocationContext.Provider
      value={{
        selectedLocation,
        locations,
        popularCities,
        setLocation,
        setCountry,
        setRegion,
        setCity,
        setLocalArea,
        clearLocation,
        syncWithUserLocation,
        resetOnLogout,
        formatPrice,
        currency: selectedLocation.currency || 'INR',
        currencySymbol: selectedLocation.currencySymbol || '₹',
        isLoading
      }}
    >
      {children}
    </LocationContext.Provider>
  );
};

export const useLocationContext = () => useContext(LocationContext);
export const useLocation = useLocationContext;
export default LocationProvider;
