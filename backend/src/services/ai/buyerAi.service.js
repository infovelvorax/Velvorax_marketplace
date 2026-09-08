import { Listing } from '../../models/Listing.js';
import { Category } from '../../models/Category.js';
import { Location } from '../../models/Location.js';
import { User } from '../../models/User.js';
import { buyerIntentService, BUYER_INTENTS, escapeRegex } from './buyerIntent.service.js';
import { aiProvider } from './ai.provider.js';

export class BuyerAIService {
  /**
   * Search APPROVED listings strictly in real MongoDB database
   * @param {Object} filters - Extracted filter parameters
   * @returns {Promise<Array>}
   */
  async searchApprovedListings(filters = {}) {
    try {
      const {
        q,
        category,
        subcategory,
        listingType,
        city,
        region,
        country,
        minPrice,
        maxPrice,
        condition,
        bedrooms,
        propertyType,
        vehicleType,
        brand,
        model,
        jobType,
        workMode,
        serviceType,
        limit = 8
      } = filters;

      const query = { status: 'APPROVED' };

      // 1. Category Filter
      if (category && category !== 'all') {
        const catSlug = category.toLowerCase().trim();
        query.categorySlug = catSlug;
      }

      // 2. Subcategory Filter
      if (subcategory && subcategory !== 'all') {
        query.subcategoryName = { $regex: escapeRegex(subcategory.trim()), $options: 'i' };
      }

      // 3. Vehicle Type Specific Handling
      if (vehicleType === 'two_wheeler') {
        query.$or = [
          { subcategoryName: { $regex: /motorcycle|scooter|bike|two\s*wheeler/i } },
          { 'details.vehicleType': { $regex: /two_wheeler|bike|scooter|motorcycle/i } },
          { title: { $regex: /\b(?:bike|motorcycle|scooter|activa|pulsar|bullet|two\s*wheeler)\b/i } }
        ];
      } else if (vehicleType === 'four_wheeler') {
        query.$or = [
          { subcategoryName: { $regex: /cars|car/i } },
          { 'details.vehicleType': { $regex: /four_wheeler|car|sedan|suv|hatchback/i } },
          { title: { $regex: /\b(?:car|sedan|suv|hatchback|swift|creta|four\s*wheeler)\b/i } }
        ];
      }

      // 4. Listing Type (SELL, RENT, EXCHANGE, FREE)
      if (listingType && listingType !== 'all') {
        query.listingType = listingType.toUpperCase().trim();
      }

      // 5. Location matching (City / Region / Country)
      const targetCity = city?.trim();
      const targetRegion = region?.trim();
      const targetCountry = country?.trim();

      if (targetCity && targetCity !== 'all') {
        const cityLower = targetCity.toLowerCase();
        const cityAliases = {
          'chennai': /(?:chennai|madras)/i,
          'bengaluru': /(?:bengaluru|bangalore|blr)/i,
          'bangalore': /(?:bengaluru|bangalore|blr)/i,
          'coimbatore': /(?:coimbatore|cbe|kovai)/i,
          'hyderabad': /(?:hyderabad|secunderabad|hyd)/i,
          'mumbai': /(?:mumbai|bombay)/i,
          'pune': /(?:pune|poona)/i,
          'kolkata': /(?:kolkata|calcutta)/i,
          'kochi': /(?:kochi|cochin|ernakulam)/i,
          'new delhi': /(?:delhi|new delhi|ncr|gurgaon|noida)/i,
          'delhi': /(?:delhi|new delhi|ncr|gurgaon|noida)/i
        };

        if (cityAliases[cityLower]) {
          query['location.city'] = { $regex: cityAliases[cityLower] };
        } else {
          query['location.city'] = { $regex: escapeRegex(targetCity), $options: 'i' };
        }
      }
      if (targetRegion && targetRegion !== 'all') {
        query['location.region'] = { $regex: escapeRegex(targetRegion), $options: 'i' };
      }
      if (targetCountry && targetCountry !== 'all') {
        query['location.country'] = { $regex: escapeRegex(targetCountry), $options: 'i' };
      }

      // 6. Price range filtering
      if ((minPrice !== undefined && minPrice !== '') || (maxPrice !== undefined && maxPrice !== '')) {
        query.price = {};
        const numMin = Number(minPrice);
        const numMax = Number(maxPrice);
        if (!isNaN(numMin)) query.price.$gte = numMin;
        if (!isNaN(numMax)) query.price.$lte = numMax;
        if (Object.keys(query.price).length === 0) delete query.price;
      }

      // 7. Condition Filter
      if (condition && condition !== 'all') {
        query.condition = condition.toUpperCase().trim();
      }

      // 8. Real Estate Dynamic Attributes
      if (bedrooms && bedrooms !== 'all') {
        const digitMatch = bedrooms.match(/([1-5])/);
        if (digitMatch) {
          query['details.bedrooms'] = { $regex: digitMatch[1], $options: 'i' };
        } else {
          query['details.bedrooms'] = { $regex: escapeRegex(bedrooms.trim()), $options: 'i' };
        }
      }

      if (propertyType && propertyType !== 'all') {
        query['details.propertyType'] = { $regex: escapeRegex(propertyType.trim()), $options: 'i' };
      }

      // 9. Brands & Models
      if (brand && brand !== 'all') {
        query['details.brand'] = { $regex: escapeRegex(brand.trim()), $options: 'i' };
      }
      if (model && model !== 'all') {
        query['details.model'] = { $regex: escapeRegex(model.trim()), $options: 'i' };
      }

      // 10. Jobs & Services Attributes
      if (jobType && jobType !== 'all') {
        query['details.jobType'] = { $regex: escapeRegex(jobType.trim()), $options: 'i' };
      }
      if (workMode && workMode !== 'all') {
        query['details.workMode'] = { $regex: escapeRegex(workMode.trim()), $options: 'i' };
      }
      if (serviceType && serviceType !== 'all') {
        query['details.serviceType'] = { $regex: escapeRegex(serviceType.trim()), $options: 'i' };
      }

      // 11. Keyword Search across Title, Description, and Brand
      if (q && q.trim() !== '') {
        const rawTrimmed = q.trim();
        const escaped = escapeRegex(rawTrimmed);
        const keywordOr = [
          { title: { $regex: escaped, $options: 'i' } },
          { description: { $regex: escaped, $options: 'i' } },
          { subcategoryName: { $regex: escaped, $options: 'i' } },
          { 'details.brand': { $regex: escaped, $options: 'i' } },
          { 'details.model': { $regex: escaped, $options: 'i' } }
        ];

        if (query.$or) {
          query.$and = [{ $or: query.$or }, { $or: keywordOr }];
          delete query.$or;
        } else {
          query.$or = keywordOr;
        }
      }

      const limitNum = Math.min(12, Math.max(1, parseInt(limit, 10) || 8));

      let sortConfig = { featured: -1, createdAt: -1 };
      if (filters.sortBy === 'price_asc') {
        sortConfig = { price: 1, createdAt: -1 };
      } else if (filters.sortBy === 'price_desc') {
        sortConfig = { price: -1, createdAt: -1 };
      }

      let rawListings = await Listing.find(query)
        .populate('sellerId', 'name rating reviewCount verificationStatus location')
        .populate('categoryId', 'name slug icon')
        .sort(sortConfig)
        .limit(limitNum)
        .lean();

      // Fallback: If strict nested filters returned 0, broaden slightly by removing strict nested details
      if (rawListings.length === 0 && (bedrooms || propertyType || brand || vehicleType)) {
        const broaderQuery = { status: 'APPROVED' };
        if (category) broaderQuery.categorySlug = category.toLowerCase().trim();
        if (targetCity) broaderQuery['location.city'] = query['location.city'] || { $regex: escapeRegex(targetCity), $options: 'i' };
        if (query.price) broaderQuery.price = query.price;
        if (q) broaderQuery.title = { $regex: escapeRegex(q), $options: 'i' };

        rawListings = await Listing.find(broaderQuery)
          .populate('sellerId', 'name rating reviewCount verificationStatus location')
          .populate('categoryId', 'name slug icon')
          .sort(sortConfig)
          .limit(limitNum)
          .lean();
      }

      // Development logging per architecture specification
      console.log(`\n[Marketplace AI]`);
      console.log(`role: buyer`);
      console.log(`intent: SEARCH_LISTINGS`);
      console.log(`category: ${category || 'all'}`);
      console.log(`location: ${targetCity || targetRegion || 'all'}`);
      console.log(`filters:`, JSON.stringify(filters));
      console.log(`query:`, JSON.stringify(query));
      console.log(`resultCount: ${rawListings.length}\n`);

      // Format clean, safe public listing objects with verified attributes
      return rawListings.map((item) => ({
        id: item._id.toString(),
        _id: item._id.toString(),
        title: item.title,
        description: item.description?.substring(0, 180) + (item.description?.length > 180 ? '...' : ''),
        price: item.price,
        currencySymbol: item.currencySymbol || '₹',
        currency: item.currency || 'INR',
        categorySlug: item.categorySlug,
        categoryName: item.categoryId?.name || item.categorySlug,
        subcategoryName: item.subcategoryName || '',
        listingType: item.listingType || 'SELL',
        condition: item.condition || 'GOOD',
        location: {
          city: item.location?.city || '',
          region: item.location?.region || '',
          country: item.location?.country || 'India',
          localArea: item.location?.localArea || ''
        },
        image: Array.isArray(item.images) && item.images.length > 0 ? item.images[0] : null,
        details: item.details || {},
        seller: {
          name: item.sellerId?.name || 'Verified Seller',
          rating: item.sellerId?.rating || 5.0,
          verified: item.sellerId?.verificationStatus === 'VERIFIED'
        },
        url: item.categorySlug === 'properties' ? `/properties/${item._id}` : `/listing/${item._id}`
      }));
    } catch (error) {
      console.error('BuyerAIService searchApprovedListings error:', error);
      return [];
    }
  }

  /**
   * Get single approved listing details for Q&A on listing detail pages
   */
  async getListingDetails(listingId) {
    if (!listingId) return null;
    try {
      const listing = await Listing.findById(listingId)
        .populate('sellerId', 'name rating reviewCount verificationStatus bio location createdAt')
        .populate('categoryId', 'name slug')
        .lean();

      if (!listing || listing.status !== 'APPROVED') {
        return null;
      }

      return {
        id: listing._id.toString(),
        title: listing.title,
        description: listing.description,
        price: listing.price,
        currencySymbol: listing.currencySymbol || '₹',
        categorySlug: listing.categorySlug,
        categoryName: listing.categoryId?.name || listing.categorySlug,
        subcategoryName: listing.subcategoryName || '',
        listingType: listing.listingType,
        condition: listing.condition,
        negotiable: listing.negotiable,
        location: {
          city: listing.location?.city || '',
          region: listing.location?.region || '',
          country: listing.location?.country || 'India',
          localArea: listing.location?.localArea || '',
          landmark: listing.location?.landmark || ''
        },
        images: listing.images || [],
        details: listing.details || {},
        seller: {
          name: listing.sellerId?.name || 'Seller',
          rating: listing.sellerId?.rating || 5.0,
          reviewCount: listing.sellerId?.reviewCount || 0,
          verified: listing.sellerId?.verificationStatus === 'VERIFIED',
          location: listing.sellerId?.location || {}
        },
        url: listing.categorySlug === 'properties' ? `/properties/${listing._id}` : `/listing/${listing._id}`
      };
    } catch (err) {
      console.error('getListingDetails error:', err);
      return null;
    }
  }

  /**
   * Helper to construct human-friendly descriptive labels
   */
  constructDescriptiveLabel(filters = {}) {
    const parts = [];
    if (filters.condition) parts.push(filters.condition.toLowerCase());
    if (filters.bedrooms) parts.push(filters.bedrooms);
    if (filters.propertyType) parts.push(filters.propertyType);
    if (filters.vehicleType === 'two_wheeler') parts.push('two-wheeler');
    else if (filters.vehicleType === 'four_wheeler') parts.push('car');
    else if (filters.brand) parts.push(filters.brand);
    else if (filters.subcategory) parts.push(filters.subcategory);
    else if (filters.category) {
      if (filters.category === 'products') parts.push('electronics');
      else if (filters.category === 'farm') parts.push('agriculture');
      else parts.push(filters.category);
    } else if (filters.q) {
      parts.push(filters.q);
    } else {
      parts.push('marketplace');
    }
    return parts.join(' ');
  }

  /**
   * Process Buyer AI Chat Message with Two-Stage Reasoning:
   * STAGE 1: Extract intent & natural language filters
   * STAGE 2: Search MongoDB source of truth & return structured results
   */
  async processChatMessage({
    message,
    conversationHistory = [],
    currentListingId = null,
    currentRoute = '',
    filters: routeFilters = {},
    accumulatedFilters = {}
  }) {
    if (!message || typeof message !== 'string') {
      return {
        success: true,
        intent: BUYER_INTENTS.GREETING,
        filters: {},
        count: 0,
        results: [],
        listingCards: [],
        message: "Hello! I am the **Velvorax Buyer AI**. How can I assist you with exploring properties, vehicles, electronics, jobs, or services today?",
        suggestions: [
          "Find 2BHK apartments in Coimbatore",
          "Laptops under ₹50,000",
          "Bikes near Chennai",
          "Software jobs in Bangalore"
        ]
      };
    }

    const trimmedMsg = message.trim();

    // STAGE 1: Analyze Intent and Extract Filters
    const analysis = buyerIntentService.analyzeMessage(trimmedMsg, accumulatedFilters);
    const intent = analysis.intent;
    const filters = { ...analysis.filters };

    // Merge route-level context if present (e.g. if user is browsing /properties)
    if (routeFilters.category && !filters.category) filters.category = routeFilters.category;
    if (routeFilters.city && !filters.city) filters.city = routeFilters.city;

    console.log(`[Buyer AI] User message: "${trimmedMsg}" | Intent: ${intent} | Extracted Filters:`, filters);

    // 1. Handle GREETING Intent
    if (intent === BUYER_INTENTS.GREETING) {
      return {
        success: true,
        intent,
        filters: {},
        count: 0,
        results: [],
        listingCards: [],
        message: "Hello! I am the **Velvorax Buyer AI**. I can search approved listings, compare properties, check vehicle specs, and help you find great marketplace deals.\n\nWhat are you looking for today?",
        suggestions: [
          "Find 2BHK apartments in Coimbatore",
          "Laptops under ₹50,000",
          "Bikes near Chennai",
          "Software jobs in Bangalore"
        ]
      };
    }

    // 2. Handle RESET_SEARCH Intent
    if (intent === BUYER_INTENTS.RESET_SEARCH) {
      return {
        success: true,
        intent,
        filters: {},
        count: 0,
        results: [],
        listingCards: [],
        message: "Search filters have been reset. What would you like to discover next in the marketplace?",
        suggestions: [
          "Find 2BHK apartments in Coimbatore",
          "Laptops under ₹50,000",
          "Bikes near Chennai",
          "Software jobs in Bangalore"
        ]
      };
    }

    // 3. Handle MARKETPLACE_HELP Intent
    if (intent === BUYER_INTENTS.MARKETPLACE_HELP) {
      return {
        success: true,
        intent,
        filters: {},
        count: 0,
        results: [],
        listingCards: [],
        message: "### How Velvorax Marketplace Works\n\n" +
          "• **Search & Discover**: Explore verified listings across Properties, Vehicles, Electronics, Jobs, and Services.\n" +
          "• **Direct Buyer Chat**: Contact sellers directly through our built-in real-time chat.\n" +
          "• **Verified Sellers**: Look for the **✓ Verified Badge** on trusted merchant listings.\n" +
          "• **Safety Tip**: Always inspect high-value items or properties in person before completing payments.",
        suggestions: [
          "Find 2BHK apartments in Coimbatore",
          "Laptops under ₹50,000",
          "Bikes near Chennai"
        ]
      };
    }

    // 4. Handle General Marketplace Question or Unknown Non-Search Query
    if (intent === BUYER_INTENTS.GENERAL_MARKETPLACE_QUESTION || intent === BUYER_INTENTS.UNKNOWN) {
      return {
        success: true,
        intent,
        filters: {},
        count: 0,
        results: [],
        listingCards: [],
        message: "I am the **Velvorax Buyer AI**, specialized in searching approved properties, vehicles, electronics, jobs, and services.\n\nTry exploring with queries like:\n• **Two wheelers under ₹80,000**\n• **Find 2BHK apartments in Coimbatore**\n• **Laptops under ₹50,000**\n• **Bikes near Chennai**",
        suggestions: [
          "two wheeler",
          "Find 2BHK apartments in Coimbatore",
          "Laptops under ₹50,000",
          "Bikes near Chennai"
        ]
      };
    }

    // 5. Handle Listing Detail Context on detail pages
    let activeListingContext = null;
    if (currentListingId) {
      activeListingContext = await this.getListingDetails(currentListingId);
    }


    // STAGE 2: Search Real MongoDB Database
    let matchingListings = [];
    if (intent === BUYER_INTENTS.SEARCH_LISTINGS || intent === BUYER_INTENTS.COMPARE_LISTINGS) {
      matchingListings = await this.searchApprovedListings(filters);
    }

    const count = matchingListings.length;
    const categoryLabel = this.constructDescriptiveLabel(filters);
    const locationLabel = filters.city ? ` in **${filters.city}**` : filters.region ? ` in **${filters.region}**` : '';
    const priceLabel = filters.maxPrice ? ` under **₹${filters.maxPrice.toLocaleString()}**` : filters.minPrice ? ` starting from **₹${filters.minPrice.toLocaleString()}**` : '';

    // STAGE 3: Construct Response with Real-Data-First & Zero Hallucinations
    let responseText = '';

    // Try optional LLM enrichment if AI provider is configured
    const systemPrompt = `You are the friendly, professional AI Assistant for the Velvorax Marketplace.
PRIMARY RULES:
1. TRUTHFULNESS & ZERO HALLUCINATIONS: You MUST ONLY refer to real approved listings provided in the context. Never invent fake properties, vehicles, products, prices, or contacts.
2. If there are 0 approved listings found, politely inform the user and suggest broadening their search.
3. Keep the response concise, engaging, and highlight key listing features using markdown.

REAL DATABASE RESULTS (${count} found):
${
  count > 0
    ? matchingListings
        .map(
          (l, idx) =>
            `[${idx + 1}] "${l.title}" - ${l.currencySymbol}${l.price?.toLocaleString()} in ${l.location.city}, ${l.location.region} | Category: ${l.categoryName} | Condition: ${l.condition}`
        )
        .join('\n')
    : 'No listings matched the search filters.'
}`;

    const formattedMessages = [];
    for (const h of conversationHistory.slice(-4)) {
      formattedMessages.push({
        role: h.sender === 'user' ? 'user' : 'assistant',
        content: h.message
      });
    }
    formattedMessages.push({ role: 'user', content: trimmedMsg });

    const aiEnrichedText = await aiProvider.generateCompletion({
      systemPrompt,
      messages: formattedMessages,
      temperature: 0.5
    });

    if (aiEnrichedText) {
      responseText = aiEnrichedText;
    } else {
      // Deterministic Real-Data Fallback Synthesis (100% Reliable & Fast)
      if (activeListingContext && /family|detail|inspect|question/i.test(trimmedMsg)) {
        responseText = `### **${activeListingContext.title}**\n\n` +
          `• **Price**: ${activeListingContext.currencySymbol}${activeListingContext.price?.toLocaleString()} (${activeListingContext.negotiable ? 'Negotiable' : 'Fixed'})\n` +
          `• **Location**: ${activeListingContext.location.city}, ${activeListingContext.location.region}\n` +
          `• **Category**: ${activeListingContext.categoryName}\n` +
          `• **Seller**: ${activeListingContext.seller.name} (${activeListingContext.seller.verified ? '✓ Verified' : 'Standard'})\n\n` +
          `*${activeListingContext.description.substring(0, 180)}...*`;
      } else if (count > 0) {
        responseText = `I found **${count} approved ${categoryLabel} listing${count > 1 ? 's' : ''}** matching your request${locationLabel}${priceLabel}:`;
      } else {
        responseText = `I couldn't find any approved ${categoryLabel} listings matching your request${locationLabel}${priceLabel}. Try adjusting your price range, checking another location, or exploring related categories.`;
      }
    }

    // Dynamic Follow-Up Suggestions
    const dynamicSuggestions = [];
    if (count > 0) {
      if (filters.city) {
        dynamicSuggestions.push(`Cheaper options in ${filters.city}`);
      } else {
        dynamicSuggestions.push("Show cheaper options", "Under ₹50,000");
      }
      dynamicSuggestions.push("Compare these listings", "Clear filters");
    } else {
      dynamicSuggestions.push(
        "Find 2BHK apartments in Coimbatore",
        "Bikes near Chennai",
        "Laptops under ₹50,000",
        "Software jobs in Bangalore"
      );
    }

    return {
      success: true,
      intent,
      filters,
      count,
      results: matchingListings,
      listingCards: matchingListings,
      message: responseText,
      suggestions: dynamicSuggestions
    };
  }
}

export const buyerAiService = new BuyerAIService();
export default buyerAiService;
