/**
 * Buyer AI Intent & Natural Language Filter Extraction Service
 * Analyzes natural language messages into structured intents and database query filters.
 */

// Escape regex special characters
export const escapeRegex = (str = '') => str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

export const BUYER_INTENTS = {
  SEARCH_LISTINGS: 'SEARCH_LISTINGS',
  LISTING_DETAILS: 'LISTING_DETAILS',
  COMPARE_LISTINGS: 'COMPARE_LISTINGS',
  CATEGORY_SEARCH: 'CATEGORY_SEARCH',
  LOCATION_SEARCH: 'LOCATION_SEARCH',
  MARKETPLACE_HELP: 'MARKETPLACE_HELP',
  GENERAL_MARKETPLACE_QUESTION: 'GENERAL_MARKETPLACE_QUESTION',
  GREETING: 'GREETING',
  RESET_SEARCH: 'RESET_SEARCH',
  UNKNOWN: 'UNKNOWN'
};

export class BuyerIntentService {
  /**
   * Pre-processes text by correcting common spelling mistakes, typos, and location/category aliases
   */
  normalizeSpelling(text = '') {
    let normalized = text.toLowerCase();

    // City & Location Typos / Aliases
    const cityTypos = {
      'chenai': 'chennai',
      'chenna': 'chennai',
      'chennay': 'chennai',
      'madras': 'chennai',
      'banglore': 'bengaluru',
      'bangalore': 'bengaluru',
      'bengalooru': 'bengaluru',
      'blr': 'bengaluru',
      'coimbator': 'coimbatore',
      'coimbtore': 'coimbatore',
      'cbe': 'coimbatore',
      'kovai': 'coimbatore',
      'hyderbad': 'hyderabad',
      'hydrabad': 'hyderabad',
      'secunderabad': 'hyderabad',
      'hyd': 'hyderabad',
      'bombay': 'mumbai',
      'mum': 'mumbai',
      'poona': 'pune',
      'calcutta': 'kolkata',
      'cochin': 'kochi',
      'ernakulam': 'kochi',
      'newdelhi': 'delhi',
      'gurugram': 'gurgaon',
      'mysore': 'mysuru',
      'tiruppur': 'tirupur'
    };

    // Keyword & Category Typos
    const wordTypos = {
      'apartmnt': 'apartment',
      'apartmnts': 'apartments',
      'aprtment': 'apartment',
      'aprtments': 'apartments',
      'appartment': 'apartment',
      'appartments': 'apartments',
      'propertie': 'property',
      'propeties': 'properties',
      'proprty': 'property',
      'proprties': 'properties',
      'propety': 'property',
      'vehical': 'vehicle',
      'vehicls': 'vehicles',
      'vechicle': 'vehicle',
      'vechile': 'vehicle',
      'motorcyle': 'motorcycle',
      'motercycle': 'motorcycle',
      'motobike': 'motorbike',
      'scoty': 'scooter',
      'scooty': 'scooter',
      'laptp': 'laptop',
      'laptopp': 'laptop',
      'laptps': 'laptops',
      'computr': 'computer',
      'notebk': 'laptop',
      'sofware': 'software',
      'softwere': 'software',
      'softwar': 'software',
      'develpr': 'developer',
      'developr': 'developer',
      'devloper': 'developer',
      'jobss': 'jobs',
      'jbos': 'jobs',
      'plumbr': 'plumber',
      'plunber': 'plumber',
      'servics': 'services',
      'serivce': 'service',
      'serivces': 'services',
      'agriclture': 'agriculture',
      'agri': 'agriculture',
      'farmm': 'farm',
      'furnitur': 'furniture',
      'furnture': 'furniture',
      'mobil': 'mobile',
      'mobils': 'mobiles',
      'smartfone': 'smartphone'
    };

    for (const [typo, fixed] of Object.entries(cityTypos)) {
      const regex = new RegExp(`\\b${escapeRegex(typo)}\\b`, 'gi');
      normalized = normalized.replace(regex, fixed);
    }
    for (const [typo, fixed] of Object.entries(wordTypos)) {
      const regex = new RegExp(`\\b${escapeRegex(typo)}\\b`, 'gi');
      normalized = normalized.replace(regex, fixed);
    }

    return normalized;
  }

  /**
   * Main analysis function that takes a user message and existing conversation context
   * @param {string} message - User query text
   * @param {Object} [previousFilters={}] - Accumulated filters from previous turns in conversation
   * @returns {{ intent: string, filters: Object, confidence: number, rawKeywords: string }}
   */
  analyzeMessage(message = '', previousFilters = {}) {
    if (!message || typeof message !== 'string') {
      return {
        intent: BUYER_INTENTS.GREETING,
        filters: {},
        confidence: 1.0,
        rawKeywords: ''
      };
    }

    const raw = message.trim();
    // Pre-normalize spelling mistakes
    const text = this.normalizeSpelling(raw);

    // 1. Check for Reset / Clear Filters intent
    if (
      /^(?:new search|start over|clear filters?|reset|restart|search something else|different search|clear)$/i.test(text) ||
      text.includes('clear filter') ||
      text.includes('start over') ||
      text.includes('new search')
    ) {
      return {
        intent: BUYER_INTENTS.RESET_SEARCH,
        filters: {},
        confidence: 1.0,
        rawKeywords: ''
      };
    }

    // 2. Check for Greetings (ONLY when the message is exclusively a greeting)
    const isPureGreeting = /^(?:hi|hello|hey|greetings|good\s+(?:morning|afternoon|evening)|namaste|hola|howdy)[!.]*$/i.test(text);
    if (isPureGreeting) {
      return {
        intent: BUYER_INTENTS.GREETING,
        filters: {},
        confidence: 1.0,
        rawKeywords: ''
      };
    }

    // 3. Check for General Marketplace Help / Platform Overview
    if (
      /^(?:what is velvorax|about velvorax|how does this work|how to buy|how to sell|how to contact seller|is it safe|payment safety|help|marketplace help)\??$/i.test(text) ||
      text.startsWith('what is velvorax') ||
      text.startsWith('how to contact') ||
      text.startsWith('how to post') ||
      text.startsWith('how to buy')
    ) {
      return {
        intent: BUYER_INTENTS.MARKETPLACE_HELP,
        filters: {},
        confidence: 0.95,
        rawKeywords: text
      };
    }

    // 4. Extract Natural Language Filters from the normalized text
    const extracted = this.extractFilters(text);

    // Primary domain attributes that clearly indicate a search or refinement
    const hasExplicitSearchFilters =
      Boolean(extracted.category) ||
      Boolean(extracted.subcategory) ||
      Boolean(extracted.city) ||
      Boolean(extracted.region) ||
      extracted.minPrice !== undefined ||
      extracted.maxPrice !== undefined ||
      Boolean(extracted.bedrooms) ||
      Boolean(extracted.propertyType) ||
      Boolean(extracted.vehicleType) ||
      Boolean(extracted.brand) ||
      Boolean(extracted.condition) ||
      Boolean(extracted.listingType) ||
      Boolean(extracted.jobType) ||
      Boolean(extracted.serviceType) ||
      Boolean(extracted.refineCheaper);

    // Has accumulated search context from a previous turn
    const hasPreviousSearchContext = Object.keys(previousFilters).length > 0;

    // Check if user is asking for comparison
    if (text.includes('compare') || text.includes('difference between') || text.includes('vs')) {
      const merged = this.mergeFilters(previousFilters, extracted);
      return {
        intent: BUYER_INTENTS.COMPARE_LISTINGS,
        filters: merged,
        confidence: 0.9,
        rawKeywords: extracted.q || text
      };
    }

    // If explicit search filters exist OR user is refining a previous search
    if (hasExplicitSearchFilters || (hasPreviousSearchContext && (extracted.minPrice !== undefined || extracted.maxPrice !== undefined || extracted.city || extracted.q || extracted.refineCheaper))) {
      const merged = this.mergeFilters(previousFilters, extracted);
      return {
        intent: BUYER_INTENTS.SEARCH_LISTINGS,
        filters: merged,
        confidence: 0.95,
        rawKeywords: extracted.q || text
      };
    }

    // Check if message has search indicator verbs
    const isSearchPhrased = /\b(?:find|search|show|looking for|buy|rent|get me|want to buy)\b/i.test(text);
    if (isSearchPhrased && extracted.q) {
      return {
        intent: BUYER_INTENTS.SEARCH_LISTINGS,
        filters: { q: extracted.q },
        confidence: 0.85,
        rawKeywords: extracted.q
      };
    }

    // Fallback: Default to search if it contains alphanumeric words
    if (text.length >= 2) {
      return {
        intent: BUYER_INTENTS.SEARCH_LISTINGS,
        filters: { q: text },
        confidence: 0.7,
        rawKeywords: text
      };
    }

    return {
      intent: BUYER_INTENTS.GENERAL_MARKETPLACE_QUESTION,
      filters: {},
      confidence: 0.5,
      rawKeywords: text
    };
  }

  /**
   * Helper to merge previous turn filters with newly extracted filters
   */
  mergeFilters(previousFilters = {}, newFilters = {}) {
    let merged = { ...previousFilters };

    const isNewCategory = Boolean(newFilters.category && previousFilters.category && newFilters.category !== previousFilters.category);

    // If new query specifies a different category, reset category-specific sub-filters AND reset location unless explicitly provided in newFilters
    if (isNewCategory) {
      delete merged.vehicleType;
      delete merged.bedrooms;
      delete merged.propertyType;
      delete merged.jobType;
      delete merged.workMode;
      delete merged.serviceType;
      delete merged.subcategory;
      delete merged.q;
      delete merged.brand;
      delete merged.model;
      delete merged.condition;
      delete merged.minPrice;
      delete merged.maxPrice;

      if (!newFilters.city && !newFilters.region && !newFilters.country) {
        delete merged.city;
        delete merged.region;
        delete merged.country;
      }
    }

    // If new query has a new item/keyword (e.g. "laptops under 50000") and no location was provided, but previous search was for properties in chennai
    if (newFilters.q && !newFilters.city && !newFilters.region && previousFilters.category && newFilters.category !== previousFilters.category) {
      delete merged.city;
      delete merged.region;
      delete merged.country;
    }

    // Handle "show cheaper" refinement
    if (newFilters.refineCheaper) {
      if (merged.maxPrice && typeof merged.maxPrice === 'number') {
        merged.maxPrice = Math.round(merged.maxPrice * 0.75);
      }
      merged.sortBy = 'price_asc';
    }

    if (newFilters.category) merged.category = newFilters.category;
    if (newFilters.subcategory) merged.subcategory = newFilters.subcategory;
    if (newFilters.city) merged.city = newFilters.city;
    if (newFilters.region) merged.region = newFilters.region;
    if (newFilters.country) merged.country = newFilters.country;
    if (newFilters.minPrice !== undefined) merged.minPrice = newFilters.minPrice;
    if (newFilters.maxPrice !== undefined) merged.maxPrice = newFilters.maxPrice;
    if (newFilters.bedrooms) merged.bedrooms = newFilters.bedrooms;
    if (newFilters.propertyType) merged.propertyType = newFilters.propertyType;
    if (newFilters.vehicleType) merged.vehicleType = newFilters.vehicleType;
    if (newFilters.brand) merged.brand = newFilters.brand;
    if (newFilters.condition) merged.condition = newFilters.condition;
    if (newFilters.listingType) merged.listingType = newFilters.listingType;
    if (newFilters.jobType) merged.jobType = newFilters.jobType;
    if (newFilters.workMode) merged.workMode = newFilters.workMode;
    if (newFilters.serviceType) merged.serviceType = newFilters.serviceType;
    if (newFilters.q) merged.q = newFilters.q;
    if (newFilters.sortBy) merged.sortBy = newFilters.sortBy;

    return merged;
  }

  /**
   * Extract comprehensive filter properties from natural language text
   */
  extractFilters(text = '') {
    const filters = {};

    // ----------------------------------------------------
    // Refine cheaper / lower price
    // ----------------------------------------------------
    if (/\b(?:cheaper|lower price|less expensive|budget friendly|low price|cheapest|cheaper ones|show cheaper)\b/i.test(text)) {
      filters.refineCheaper = true;
      filters.sortBy = 'price_asc';
    }

    // ----------------------------------------------------
    // A. Price Range Extraction (Supports INR, USD, EUR, GBP, AED, CAD, AUD, SGD & millions/k)
    // ----------------------------------------------------
    // "under 50000", "under $1500", "below 20k", "under 1 lakh", "up to €500", "under £2000", "below 1.5 million"
    const priceUnderMatch = text.match(/(?:under|below|less than|within|up to|max(?:imum)?|cheaper than)\s*(?:rs\.?|inr|₹|\$|usd|€|eur|£|gbp|aed|cad|aud|sgd)?\s*([0-9]+(?:\.[0-9]+)?(?:,[0-9]+)*(?:\s*k|\s*m|\s*million|\s*millions|\s*lakh|\s*lakhs|\s*lac|\s*lacs|\s*cr|\s*crore|\s*crores)?)/i);
    if (priceUnderMatch) {
      filters.maxPrice = this.normalizePriceNumber(priceUnderMatch[1]);
    }

    // "above 10000", "more than $20k", "min 50000", "over £1000"
    const priceAboveMatch = text.match(/(?:above|more than|min(?:imum)?|over|greater than|starting from)\s*(?:rs\.?|inr|₹|\$|usd|€|eur|£|gbp|aed|cad|aud|sgd)?\s*([0-9]+(?:\.[0-9]+)?(?:,[0-9]+)*(?:\s*k|\s*m|\s*million|\s*millions|\s*lakh|\s*lakhs|\s*lac|\s*lacs|\s*cr|\s*crore|\s*crores)?)/i);
    if (priceAboveMatch) {
      filters.minPrice = this.normalizePriceNumber(priceAboveMatch[1]);
    }

    // "between 10000 and 30000", "between $20k and $50k", "10k to 20k"
    const priceRangeMatch = text.match(/(?:between|from)?\s*(?:rs\.?|inr|₹|\$|usd|€|eur|£|gbp|aed|cad|aud|sgd)?\s*([0-9]+(?:\.[0-9]+)?(?:,[0-9]+)*(?:\s*k|\s*m|\s*million|\s*millions|\s*lakh|\s*lakhs|\s*lac|\s*lacs)?)\s*(?:and|to|-)\s*(?:rs\.?|inr|₹|\$|usd|€|eur|£|gbp|aed|cad|aud|sgd)?\s*([0-9]+(?:\.[0-9]+)?(?:,[0-9]+)*(?:\s*k|\s*m|\s*million|\s*millions|\s*lakh|\s*lakhs|\s*lac|\s*lacs)?)/i);
    if (priceRangeMatch && !priceUnderMatch && !priceAboveMatch) {
      const p1 = this.normalizePriceNumber(priceRangeMatch[1]);
      const p2 = this.normalizePriceNumber(priceRangeMatch[2]);
      if (p1 !== null && p2 !== null) {
        filters.minPrice = Math.min(p1, p2);
        filters.maxPrice = Math.max(p1, p2);
      }
    }

    // Direct standalone price "₹50,000", "$50000", "€40000" or "50000 rs / usd / eur"
    if (filters.maxPrice === undefined && filters.minPrice === undefined) {
      const exactPriceMatch = text.match(/(?:(?:rs\.?|inr|₹|\$|usd|€|eur|£|gbp|aed|cad|aud|sgd)\s*([0-9]+(?:\.[0-9]+)?(?:,[0-9]+)*(?:\s*k|\s*m|\s*million|\s*millions|\s*lakh|\s*lakhs|\s*lac|\s*lacs)?)|(?:([0-9]+(?:\.[0-9]+)?(?:,[0-9]+)*(?:\s*k|\s*m|\s*million|\s*millions|\s*lakh|\s*lakhs|\s*lac|\s*lacs)?)\s*(?:rupees|rupee|inr|rs\.?|usd|dollars?|euros?|pounds?|aed|dirhams?)))/i);
      if (exactPriceMatch) {
        const valStr = exactPriceMatch[1] || exactPriceMatch[2];
        const normalized = this.normalizePriceNumber(valStr);
        if (normalized && normalized > 100) {
          filters.maxPrice = normalized;
        }
      }
    }

    // ----------------------------------------------------
    // B. Location Extraction (Indian & Global Cities/States)
    // ----------------------------------------------------
    const citiesMap = [
      { name: 'Coimbatore', regex: /\b(?:coimbatore|cbe)\b/i },
      { name: 'Chennai', regex: /\b(?:chennai|madras)\b/i },
      { name: 'Bengaluru', regex: /\b(?:bengaluru|bangalore|blr)\b/i },
      { name: 'Mumbai', regex: /\b(?:mumbai|bombay)\b/i },
      { name: 'Pune', regex: /\b(?:pune|poona)\b/i },
      { name: 'Hyderabad', regex: /\b(?:hyderabad|secunderabad)\b/i },
      { name: 'New Delhi', regex: /\b(?:delhi|new delhi|ncr|gurgaon|gurugram|noida)\b/i },
      { name: 'Kolkata', regex: /\b(?:kolkata|calcutta)\b/i },
      { name: 'Kochi', regex: /\b(?:kochi|cochin|ernakulam)\b/i },
      { name: 'Madurai', regex: /\b(?:madurai)\b/i },
      { name: 'Salem', regex: /\b(?:salem)\b/i },
      { name: 'Tirupur', regex: /\b(?:tirupur|tiruppur)\b/i },
      { name: 'Mysuru', regex: /\b(?:mysuru|mysore)\b/i },
      { name: 'Ahmedabad', regex: /\b(?:ahmedabad)\b/i },
      { name: 'Jaipur', regex: /\b(?:jaipur)\b/i },
      { name: 'Dubai', regex: /\b(?:dubai)\b/i },
      { name: 'London', regex: /\b(?:london)\b/i },
      { name: 'New York', regex: /\b(?:new york|nyc)\b/i }
    ];

    for (const cityObj of citiesMap) {
      if (cityObj.regex.test(text)) {
        filters.city = cityObj.name;
        break;
      }
    }

    // Region / State checks
    if (!filters.city) {
      if (/\b(?:tamil nadu|tamilnadu|tn)\b/i.test(text)) filters.region = 'Tamil Nadu';
      else if (/\b(?:karnataka)\b/i.test(text)) filters.region = 'Karnataka';
      else if (/\b(?:maharashtra)\b/i.test(text)) filters.region = 'Maharashtra';
      else if (/\b(?:telangana)\b/i.test(text)) filters.region = 'Telangana';
      else if (/\b(?:kerala)\b/i.test(text)) filters.region = 'Kerala';
    }

    // Generic "in <Location>", "near <Location>", "at <Location>" regex fallback
    if (!filters.city && !filters.region) {
      const locMatch = text.match(/(?:in|near|around|at|from)\s+([a-zA-Z\s]{3,20})(?:\s+under|\s+for|\s+with|\s+below|\s*$)/i);
      if (locMatch) {
        const potentialLoc = locMatch[1].trim();
        const nonLocationWords = new Set([
          'the', 'my', 'a', 'an', 'this', 'that', 'sale', 'rent', 'free', 'india', 'budget', 'price', 'condition',
          'two wheeler', 'four wheeler', 'good condition', 'bhk', 'apartment', 'house'
        ]);
        if (!nonLocationWords.has(potentialLoc.toLowerCase()) && potentialLoc.length > 2) {
          filters.city = potentialLoc.replace(/\b\w/g, (l) => l.toUpperCase());
        }
      }
    }

    // ----------------------------------------------------
    // C. Category & Subcategory Taxonomy Extraction
    // ----------------------------------------------------

    // 1. VEHICLES
    if (
      /\b(?:two\s*wheeler|two-wheeler|2\s*wheeler|2-wheeler|bike|bikes|motorcycle|motorcycles|scooter|scooters|activa|jupiter|pulsar|bullet|royal enfield|yamaha|ktm|tvs|honda activa)\b/i.test(text)
    ) {
      filters.category = 'vehicles';
      filters.vehicleType = 'two_wheeler';
      filters.subcategory = 'Motorcycles & Scooters';
    } else if (
      /\b(?:car|cars|four\s*wheeler|4\s*wheeler|sedan|suv|hatchback|maruti|hyundai|tata|toyota|mahindra|honda city|creta|swift|thar|scorpio|bmw|audi|mercedes|commercial vehicle|auto parts)\b/i.test(text)
    ) {
      filters.category = 'vehicles';
      filters.vehicleType = 'four_wheeler';
      if (/\b(?:sedan|suv|hatchback|car|cars)\b/i.test(text)) {
        filters.subcategory = 'Cars';
      }
    } else if (/\b(?:vehicle|vehicles|automobile|automobiles|auto)\b/i.test(text)) {
      filters.category = 'vehicles';
    }

    // 2. PROPERTIES & REAL ESTATE (Includes "2bhk", "1bhk", "3 bhk", "apartments", "houses", "flats")
    if (
      /\b(?:property|properties|apartment|apartments|flat|flats|house|houses|villa|villas|plot|plots|land|lands|commercial space|office space|pg|hostel|guest house|rent house|real estate)\b|\b\d+\s*bhk\b|\bbhk\b/i.test(text)
    ) {
      filters.category = 'properties';

      // Property Type
      if (/\b(?:apartment|apartments|flat|flats)\b/i.test(text)) {
        filters.propertyType = 'Apartment';
        filters.subcategory = 'For Sale: Houses & Apartments';
      } else if (/\b(?:villa|villas|independent house|house|houses|individual house)\b/i.test(text)) {
        filters.propertyType = 'House';
        filters.subcategory = 'For Sale: Houses & Apartments';
      } else if (/\b(?:plot|plots|land|lands|site|sites)\b/i.test(text)) {
        filters.propertyType = 'Plot';
        filters.subcategory = 'Lands & Plots';
      } else if (/\b(?:commercial|office|shop|showroom)\b/i.test(text)) {
        filters.propertyType = 'Commercial';
        filters.subcategory = 'Commercial & Office Spaces';
      } else if (/\b(?:pg|hostel|guest house)\b/i.test(text)) {
        filters.propertyType = 'PG';
        filters.subcategory = 'PG & Guest Houses';
      }

      // Bedrooms (BHK extraction: "1bhk", "2 bhk", "3 bedroom", "4-bhk", "two bhk", "three bhk")
      const bhkDigitMatch = text.match(/\b([1-5])\s*bhk\b/i) || text.match(/\b([1-5])\s*(?:bedroom|bed)\b/i);
      if (bhkDigitMatch) {
        filters.bedrooms = `${bhkDigitMatch[1]} BHK`;
      } else if (/\b(?:one|1)\s*(?:bhk|bedroom)\b/i.test(text)) {
        filters.bedrooms = '1 BHK';
      } else if (/\b(?:two|2)\s*(?:bhk|bedroom)\b/i.test(text)) {
        filters.bedrooms = '2 BHK';
      } else if (/\b(?:three|3)\s*(?:bhk|bedroom)\b/i.test(text)) {
        filters.bedrooms = '3 BHK';
      } else if (/\b(?:four|4)\s*(?:bhk|bedroom)\b/i.test(text)) {
        filters.bedrooms = '4 BHK';
      }
    }

    // 3. MOBILES, LAPTOPS & ELECTRONICS (Category Slug: 'products')
    if (
      /\b(?:phone|phones|mobile|mobiles|smartphone|smartphones|iphone|samsung|oneplus|laptop|laptops|computer|computers|pc|macbook|ipad|tablet|camera|tv|television|audio|gadget|gadgets|headphone|airpods|smartwatch)\b/i.test(text)
    ) {
      filters.category = 'products';

      if (/\b(?:phone|phones|mobile|mobiles|smartphone|iphone)\b/i.test(text)) {
        filters.subcategory = 'Mobile Phones';
      } else if (/\b(?:laptop|laptops|macbook|computer|computers|pc)\b/i.test(text)) {
        filters.subcategory = 'Laptops & Computers';
      } else if (/\b(?:tv|television|audio|speakers|soundbar)\b/i.test(text)) {
        filters.subcategory = 'TVs, Video & Audio';
      } else if (/\b(?:camera|cameras|lens|dslr)\b/i.test(text)) {
        filters.subcategory = 'Cameras & Lenses';
      }
    }

    // 4. JOBS
    if (
      /\b(?:job|jobs|hiring|vacancy|vacancies|career|recruitment|developer|engineer|software engineer|accountant|sales executive|remote job|part time job|full time job)\b/i.test(text)
    ) {
      filters.category = 'jobs';

      if (/\b(?:developer|engineer|software|it|programmer|frontend|backend|fullstack|react|node|python|java)\b/i.test(text)) {
        filters.subcategory = 'IT & Software';
      } else if (/\b(?:sales|marketing|telecaller)\b/i.test(text)) {
        filters.subcategory = 'Marketing & Sales';
      } else if (/\b(?:accountant|finance|accounting)\b/i.test(text)) {
        filters.subcategory = 'Finance & Accounting';
      }

      if (/\b(?:remote|work from home|wfh)\b/i.test(text)) filters.workMode = 'REMOTE';
      if (/\b(?:part\s*time|part-time)\b/i.test(text)) filters.jobType = 'PART_TIME';
      if (/\b(?:full\s*time|full-time)\b/i.test(text)) filters.jobType = 'FULL_TIME';
    }

    // 5. SERVICES
    if (
      /\b(?:service|services|plumber|plumbers|plumbing|electrician|electricians|cleaning|deep cleaning|repair|ac repair|carpenter|carpentry|packers and movers|painter|mechanic)\b/i.test(text)
    ) {
      filters.category = 'services';

      if (/\b(?:plumber|plumbing)\b/i.test(text)) {
        filters.serviceType = 'plumber';
        filters.subcategory = 'Electricians & Plumbers';
      } else if (/\b(?:electrician|electrical)\b/i.test(text)) {
        filters.serviceType = 'electrician';
        filters.subcategory = 'Electricians & Plumbers';
      } else if (/\b(?:ac repair|appliance repair|washing machine repair)\b/i.test(text)) {
        filters.serviceType = 'ac_repair';
        filters.subcategory = 'AC & Appliance Repair';
      } else if (/\b(?:cleaning|deep cleaning|house cleaning)\b/i.test(text)) {
        filters.serviceType = 'cleaning';
        filters.subcategory = 'Home Deep Cleaning';
      }
    }

    // 6. AGRICULTURE & FARM
    if (
      /\b(?:agriculture|farm|farming|tractor|tractors|seeds|fertilizer|cattle|cow|cows|buffalo|livestock|crop|crops|farm land)\b/i.test(text)
    ) {
      filters.category = 'farm';
      if (/\b(?:tractor|tractors|harvester|machinery)\b/i.test(text)) {
        filters.subcategory = 'Tractors & Farm Machinery';
      }
    }

    // 7. BUSINESS DIRECTORY
    if (
      /\b(?:business|businesses|shop for sale|restaurant for sale|cafe for sale|franchise|franchises|wholesale)\b/i.test(text)
    ) {
      filters.category = 'businesses';
    }

    // 8. FURNITURE
    if (
      /\b(?:furniture|sofa|sofas|dining table|bed|beds|wardrobe|wardrobes|office chair|desk|table)\b/i.test(text)
    ) {
      filters.category = 'furniture';
    }

    // ----------------------------------------------------
    // D. Brands Extraction
    // ----------------------------------------------------
    const brandsMap = [
      { name: 'Apple', regex: /\b(?:apple|iphone|ipad|macbook)\b/i },
      { name: 'Samsung', regex: /\b(?:samsung|galaxy)\b/i },
      { name: 'OnePlus', regex: /\b(?:oneplus)\b/i },
      { name: 'Xiaomi', regex: /\b(?:xiaomi|redmi|mi)\b/i },
      { name: 'Realme', regex: /\b(?:realme)\b/i },
      { name: 'Dell', regex: /\b(?:dell)\b/i },
      { name: 'HP', regex: /\b(?:hp)\b/i },
      { name: 'Lenovo', regex: /\b(?:lenovo|thinkpad)\b/i },
      { name: 'Sony', regex: /\b(?:sony|playstation|ps5)\b/i },
      { name: 'Honda', regex: /\b(?:honda|activa)\b/i },
      { name: 'Royal Enfield', regex: /\b(?:royal enfield|bullet|classic 350|hunter)\b/i },
      { name: 'Yamaha', regex: /\b(?:yamaha|r15|mt15|fz)\b/i },
      { name: 'TVS', regex: /\b(?:tvs|jupiter|apache)\b/i },
      { name: 'Bajaj', regex: /\b(?:bajaj|pulsar)\b/i },
      { name: 'Hero', regex: /\b(?:hero|splendor)\b/i },
      { name: 'KTM', regex: /\b(?:ktm|duke)\b/i },
      { name: 'Maruti Suzuki', regex: /\b(?:maruti|suzuki|swift|baleno|brezza|dzire)\b/i },
      { name: 'Hyundai', regex: /\b(?:hyundai|creta|i20|verna)\b/i },
      { name: 'Tata', regex: /\b(?:tata|nexon|harrier|punch|tiago)\b/i },
      { name: 'Mahindra', regex: /\b(?:mahindra|thar|scorpio|xuv700)\b/i },
      { name: 'Toyota', regex: /\b(?:toyota|innova|fortuner)\b/i }
    ];

    for (const b of brandsMap) {
      if (b.regex.test(text)) {
        filters.brand = b.name;
        break;
      }
    }

    // ----------------------------------------------------
    // E. Listing Type & Condition
    // ----------------------------------------------------
    if (/\b(?:for rent|to rent|on rent|rental|rent|lease|monthly rent)\b/i.test(text)) {
      filters.listingType = 'RENT';
      if (filters.category === 'properties') {
        filters.subcategory = 'For Rent: Houses & Apartments';
      }
    } else if (/\b(?:free|giveaway|donation|zero cost)\b/i.test(text)) {
      filters.listingType = 'FREE';
    } else if (/\b(?:exchange|swap|trade)\b/i.test(text)) {
      filters.listingType = 'EXCHANGE';
    } else if (/\b(?:for sale|to buy|buy|purchase|sell)\b/i.test(text)) {
      filters.listingType = 'SELL';
    }

    if (/\b(?:brand new|new|sealed|unopened)\b/i.test(text)) {
      filters.condition = 'NEW';
    } else if (/\b(?:used|second hand|second-hand|pre-owned|preowned|old)\b/i.test(text)) {
      filters.condition = 'USED';
    } else if (/\b(?:refurbished|renewed)\b/i.test(text)) {
      filters.condition = 'REFURBISHED';
    }

    // ----------------------------------------------------
    // F. Search Query Keywords (Only when valid marketplace search indicators exist)
    // ----------------------------------------------------
    const hasAnyMarketplaceFilter = filters.category || filters.city || filters.maxPrice !== undefined || filters.brand;
    if (hasAnyMarketplaceFilter) {
      let cleaned = text
        .replace(/\b(?:find|show|search|give me|look for|i need|i want|tell me about|any|please|view|get me)\b/gi, '')
        .replace(/\b(?:under|below|less than|within|above|more than|for|at|around|near|in|between|to)\s*(?:rs\.?|inr|₹)?\s*[0-9,k\s\.]+(?:rupees|rupee|lakh|lakhs|lac|lacs|cr|crore|crores)?\b/gi, '')
        .replace(/\b(?:coimbatore|cbe|chennai|madras|bengaluru|bangalore|blr|mumbai|bombay|pune|poona|hyderabad|delhi|new delhi|ncr|gurgaon|gurugram|noida|kolkata|kochi|cochin|madurai|salem|tirupur|mysuru|mysore)\b/gi, '')
        .replace(/\b(?:rupees|rupee|inr|rs\.?|lakh|lakhs|crore|crores)\b/gi, '')
        .replace(/\b(?:for sale|for rent|to rent|on rent|rental|rent|free|giveaway|used|new|second hand|second-hand)\b/gi, '');

      // If category or propertyType is already set, strip generic taxonomy terms
      if (filters.category || filters.propertyType || filters.vehicleType) {
        cleaned = cleaned
          .replace(/\b(?:\d+\s*bhk|[1-5]\s*bedroom|bhk|apartments?|flats?|houses?|villas?|plots?|lands?|commercial|properties|property)\b/gi, '')
          .replace(/\b(?:two\s*wheelers?|2\s*wheelers?|four\s*wheelers?|4\s*wheelers?|bikes?|motorcycles?|scooters?|cars?|vehicles?|automobiles?)\b/gi, '')
          .replace(/\b(?:phones?|mobiles?|smartphones?|laptops?|computers?|gadgets?|electronics)\b/gi, '')
          .replace(/\b(?:jobs?|careers?|vacancies|services?|businesses?|furniture)\b/gi, '');
      }

      cleaned = cleaned.trim().replace(/\s+/g, ' ');

      const stopWords = new Set(['and', 'the', 'with', 'a', 'an', 'in', 'at', 'of', 'for', 'to', 'on', 'near', 'by']);
      if (cleaned.length >= 2 && !stopWords.has(cleaned.toLowerCase())) {
        filters.q = cleaned;
      }
    }

    return filters;
  }

  /**
   * Helper to normalize currency / price shorthand strings to real numbers
   * (e.g. "30k" -> 30000, "1.5 lakh" -> 150000, "25 lakhs" -> 2500000, "2 crore" -> 20000000)
   */
  normalizePriceNumber(rawStr = '') {
    if (!rawStr) return null;
    let s = rawStr.toLowerCase().replace(/,/g, '').trim();

    if (s.endsWith('cr') || s.endsWith('crore') || s.endsWith('crores')) {
      const num = parseFloat(s.replace(/(?:cr|crores|crore)/g, '').trim());
      return isNaN(num) ? null : Math.round(num * 10000000);
    }
    if (s.endsWith('million') || s.endsWith('millions') || s.endsWith('m')) {
      const num = parseFloat(s.replace(/(?:millions|million|m)/g, '').trim());
      return isNaN(num) ? null : Math.round(num * 1000000);
    }
    if (s.endsWith('lakh') || s.endsWith('lakhs') || s.endsWith('lac') || s.endsWith('lacs') || s.endsWith('l')) {
      const num = parseFloat(s.replace(/(?:lakhs|lakh|lacs|lac|l)/g, '').trim());
      return isNaN(num) ? null : Math.round(num * 100000);
    }
    if (s.endsWith('k') || s.endsWith('thousand')) {
      const num = parseFloat(s.replace(/(?:thousand|k)/g, '').trim());
      return isNaN(num) ? null : Math.round(num * 1000);
    }

    const num = parseFloat(s);
    return isNaN(num) ? null : Math.round(num);
  }
}

export const buyerIntentService = new BuyerIntentService();
export default buyerIntentService;
