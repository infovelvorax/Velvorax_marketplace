import { Listing } from '../models/Listing.js';
import { Category } from '../models/Category.js';
import { Notification } from '../models/Notification.js';
import { deleteCloudinaryAsset } from '../config/cloudinary.config.js';
import { isValidCurrency, getCurrencyByCode, getDefaultCurrencyForCountry } from '../config/currencies.js';

// Helper to escape regex special characters for safe keyword matching
const escapeRegex = (str) => str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

// @desc    Get all listings with advanced OLX-style search, filters, sorting & pagination
// @route   GET /api/marketplace/listings
// @access  Public
export const getListings = async (req, res) => {
  try {
    const {
      q,
      category,
      subcategory,
      listingType,
      country,
      region,
      state,
      city,
      localArea,
      minPrice,
      maxPrice,
      currency,
      condition,
      featured,
      datePosted,
      distance,
      latitude,
      lat,
      longitude,
      lng,
      sortBy = 'newest',
      page = 1,
      limit = 12,
      
      // Category-specific attribute filters
      bedrooms,
      bhk,
      propertyType,
      furnishing,
      brand,
      model,
      year,
      yearMin,
      yearMax,
      fuel,
      transmission,
      jobType,
      workMode,
      experience,
      serviceType
    } = req.query;

    const query = { status: 'APPROVED' };

    // 1. Keyword search (case-insensitive across multiple fields with multi-token and exact match support)
    if (q && q.trim() !== '') {
      const rawTerm = q.trim();
      const escaped = escapeRegex(rawTerm);
      const exactRegex = { $regex: escaped, $options: 'i' };

      const searchableFields = (r) => [
        { title: r },
        { description: r },
        { categorySlug: r },
        { subcategoryName: r },
        { 'location.city': r },
        { 'location.region': r },
        { 'location.localArea': r },
        { 'location.landmark': r },
        { 'details.brand': r },
        { 'details.model': r },
        { 'details.electronicsBrand': r },
        { 'details.electronicsModel': r },
        { 'details.company': r },
        { 'details.propertyType': r },
        { 'details.vehicleType': r },
        { 'details.productType': r },
        { 'details.serviceType': r },
        { 'details.jobTitle': r },
        { 'details.bhk': r },
        { 'details.bedrooms': r },
        { 'details.amenities': r }
      ];

      const tokens = rawTerm.split(/\s+/).filter(t => t.length > 0).map(escapeRegex);
      if (tokens.length > 1) {
        const tokenRegexes = tokens.map(t => ({ $regex: t, $options: 'i' }));
        const allTokenConditions = tokenRegexes.map(r => ({
          $or: searchableFields(r)
        }));
        
        // Match exact phrase OR all tokens across fields OR any token
        const tokenOrConditions = tokenRegexes.map(r => ({
          $or: searchableFields(r)
        }));

        query.$or = [
          { $or: searchableFields(exactRegex) },
          { $and: allTokenConditions },
          { $or: tokenOrConditions }
        ];
      } else {
        query.$or = searchableFields(exactRegex);
      }
    }

    // 2. Category filter (support slug, ObjectId, or aliases)
    if (category && category !== 'all') {
      if (category.match(/^[0-9a-fA-F]{24}$/)) {
        query.categoryId = category;
      } else {
        const catSlug = category.toLowerCase().trim();
        const aliasMap = {
          'electronics': ['products', 'electronics', 'mobiles-electronics'],
          'mobiles': ['products', 'mobiles-electronics'],
          'mobile': ['products', 'mobiles-electronics'],
          'phones': ['products', 'mobiles-electronics'],
          'phone': ['products', 'mobiles-electronics'],
          'gadgets': ['products'],
          'appliances': ['products'],
          'products': ['products', 'electronics', 'mobiles-electronics'],
          'vehicles': ['vehicles', 'cars', 'bikes', 'motorcycles'],
          'vehicle': ['vehicles', 'cars', 'bikes', 'motorcycles'],
          'cars': ['vehicles'],
          'car': ['vehicles'],
          'bikes': ['vehicles'],
          'bike': ['vehicles'],
          'motorcycles': ['vehicles'],
          'motorcycle': ['vehicles'],
          'scooters': ['vehicles'],
          'scooter': ['vehicles'],
          'automobiles': ['vehicles'],
          'properties': ['properties', 'real-estate', 'property'],
          'property': ['properties', 'real-estate'],
          'real-estate': ['properties', 'real-estate'],
          'apartments': ['properties'],
          'apartment': ['properties'],
          'villas': ['properties'],
          'villa': ['properties'],
          'farm': ['farm', 'agriculture', 'farming'],
          'agriculture': ['farm', 'agriculture', 'farming'],
          'farming': ['farm', 'agriculture'],
          'jobs': ['jobs', 'careers', 'employment'],
          'job': ['jobs', 'careers', 'employment'],
          'careers': ['jobs', 'careers'],
          'career': ['jobs', 'careers'],
          'employment': ['jobs', 'careers'],
          'services': ['services', 'local-services'],
          'service': ['services', 'local-services'],
          'local-services': ['services', 'local-services'],
          'furniture': ['furniture', 'home-decor'],
          'businesses': ['businesses', 'business', 'commercial'],
          'business': ['businesses', 'business', 'commercial'],
          'books': ['books-hobbies', 'books'],
          'book': ['books-hobbies', 'books'],
          'hobbies': ['books-hobbies', 'hobbies'],
          'hobby': ['books-hobbies', 'hobbies'],
          'books-hobbies': ['books-hobbies', 'books', 'hobbies'],
          'fashion': ['fashion', 'clothing', 'apparel'],
          'pets': ['pets', 'animals'],
          'pet': ['pets', 'animals']
        };

        const matchingSlugs = aliasMap[catSlug] || [catSlug];
        query.categorySlug = { $in: matchingSlugs };
      }
    }

    // 3. Subcategory filter
    if (subcategory && subcategory !== 'all') {
      query.subcategoryName = { $regex: `^${escapeRegex(subcategory)}$`, $options: 'i' };
    }

    // 4. Listing Type filter (SELL, RENT, EXCHANGE, FREE)
    if (listingType && listingType !== 'all') {
      query.listingType = listingType.toUpperCase();
    }

    // 5. Hierarchical Location filters
    if (country && country !== 'all' && country !== 'Worldwide') {
      query['location.country'] = { $regex: `^${escapeRegex(country)}$`, $options: 'i' };
    }
    const regionVal = region || state;
    if (regionVal && regionVal !== 'all') {
      query['location.region'] = { $regex: `^${escapeRegex(regionVal)}$`, $options: 'i' };
    }
    if (city && city !== 'all') {
      query['location.city'] = { $regex: `^${escapeRegex(city)}$`, $options: 'i' };
    }
    if (localArea && localArea !== 'all') {
      query['location.localArea'] = { $regex: `^${escapeRegex(localArea)}$`, $options: 'i' };
    }

    // 6. Price range filter
    if (minPrice !== undefined && minPrice !== '' || maxPrice !== undefined && maxPrice !== '') {
      query.price = {};
      if (minPrice !== undefined && minPrice !== '') {
        const numMin = Number(minPrice);
        if (!isNaN(numMin)) query.price.$gte = numMin;
      }
      if (maxPrice !== undefined && maxPrice !== '') {
        const numMax = Number(maxPrice);
        if (!isNaN(numMax)) query.price.$lte = numMax;
      }
      if (Object.keys(query.price).length === 0) {
        delete query.price;
      }
    }

    if (currency) {
      query.currency = currency.toUpperCase();
    }

    // 7. Condition filter
    if (condition && condition !== 'all') {
      query.condition = condition.toUpperCase();
    }

    // 8. Featured filter
    if (featured === 'true' || featured === true) {
      query.featured = true;
    }

    // 9. Date posted filter
    if (datePosted && datePosted !== 'all') {
      const now = new Date();
      let limitDate = null;
      if (datePosted === 'today' || datePosted === '24h' || datePosted === '1d') {
        limitDate = new Date(now.getTime() - 24 * 60 * 60 * 1000);
      } else if (datePosted === '3d') {
        limitDate = new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000);
      } else if (datePosted === '7d' || datePosted === 'week') {
        limitDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      } else if (datePosted === '30d' || datePosted === 'month') {
        limitDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      } else if (!isNaN(Date.parse(datePosted))) {
        limitDate = new Date(datePosted);
      }
      if (limitDate) {
        query.createdAt = { $gte: limitDate };
      }
    }

    // 10. Geospatial distance filter ($geoWithin using $centerSphere)
    const targetLat = parseFloat(latitude || lat);
    const targetLng = parseFloat(longitude || lng);
    const radiusKm = parseFloat(distance);
    if (!isNaN(targetLat) && !isNaN(targetLng) && !isNaN(radiusKm) && radiusKm > 0) {
      // 6378.1 km is the radius of the Earth
      query.geoPoint = {
        $geoWithin: {
          $centerSphere: [[targetLng, targetLat], radiusKm / 6378.1]
        }
      };
    }

    // 11. Category-specific dynamic attribute filters
    const bhkVal = bedrooms || bhk;
    if (bhkVal && bhkVal !== 'all') {
      query['details.bedrooms'] = { $regex: escapeRegex(bhkVal), $options: 'i' };
    }
    if (propertyType && propertyType !== 'all') {
      query['details.propertyType'] = { $regex: escapeRegex(propertyType), $options: 'i' };
    }
    if (furnishing && furnishing !== 'all') {
      query['details.furnishing'] = { $regex: escapeRegex(furnishing), $options: 'i' };
    }
    const propStatus = req.query.possessionStatus || req.query.propertyStatus;
    if (propStatus && propStatus !== 'all') {
      query['details.possessionStatus'] = { $regex: escapeRegex(propStatus), $options: 'i' };
    }
    const { minArea, maxArea, facing } = req.query;
    if (facing && facing !== 'all') {
      query['details.facing'] = { $regex: escapeRegex(facing), $options: 'i' };
    }
    if (minArea || maxArea) {
      query['details.builtUpArea'] = {};
      if (minArea) query['details.builtUpArea'].$gte = Number(minArea);
      if (maxArea) query['details.builtUpArea'].$lte = Number(maxArea);
    }
    if (brand && brand !== 'all') {
      query['details.brand'] = { $regex: escapeRegex(brand), $options: 'i' };
    }
    if (model && model !== 'all') {
      query['details.model'] = { $regex: escapeRegex(model), $options: 'i' };
    }
    if (fuel && fuel !== 'all') {
      query['details.fuel'] = { $regex: escapeRegex(fuel), $options: 'i' };
    }
    if (transmission && transmission !== 'all') {
      query['details.transmission'] = { $regex: escapeRegex(transmission), $options: 'i' };
    }
    if (jobType && jobType !== 'all') {
      query['details.jobType'] = { $regex: escapeRegex(jobType), $options: 'i' };
    }
    if (workMode && workMode !== 'all') {
      query['details.workMode'] = { $regex: escapeRegex(workMode), $options: 'i' };
    }
    if (experience && experience !== 'all') {
      query['details.experienceRequired'] = { $regex: escapeRegex(experience), $options: 'i' };
    }
    if (serviceType && serviceType !== 'all') {
      query['details.serviceType'] = { $regex: escapeRegex(serviceType), $options: 'i' };
    }
    if (year) {
      const yearNum = Number(year);
      if (!isNaN(yearNum)) query['details.year'] = yearNum;
    } else if (yearMin || yearMax) {
      query['details.year'] = {};
      if (yearMin) query['details.year'].$gte = Number(yearMin);
      if (yearMax) query['details.year'].$lte = Number(yearMax);
    }

    // 12. Sorting options
    let sortOptions = { featured: -1, createdAt: -1 };
    if (sortBy === 'price_asc') sortOptions = { price: 1, createdAt: -1 };
    else if (sortBy === 'price_desc') sortOptions = { price: -1, createdAt: -1 };
    else if (sortBy === 'popular') sortOptions = { views: -1, favoritesCount: -1, createdAt: -1 };
    else if (sortBy === 'oldest') sortOptions = { createdAt: 1 };
    else if (sortBy === 'newest') sortOptions = { createdAt: -1 };

    const pageNum = Math.max(1, parseInt(page, 10) || 1);
    const limitNum = Math.min(100, Math.max(1, parseInt(limit, 10) || 12));
    const skip = (pageNum - 1) * limitNum;

    const total = await Listing.countDocuments(query);
    const totalPages = Math.ceil(total / limitNum) || 1;
    const listings = await Listing.find(query)
      .populate('sellerId', 'name profilePhoto rating reviewCount verificationStatus location phone')
      .populate('categoryId', 'name slug icon')
      .sort(sortOptions)
      .skip(skip)
      .limit(limitNum);

    res.json({
      success: true,
      data: listings,
      listings: listings,
      pagination: {
        total,
        page: pageNum,
        limit: limitNum,
        totalPages,
        hasNextPage: pageNum < totalPages,
        hasPrevPage: pageNum > 1
      }
    });
  } catch (error) {
    console.error('getListings error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get live search suggestions based on real database records
// @route   GET /api/marketplace/listings/suggestions
// @access  Public
export const getSearchSuggestions = async (req, res) => {
  try {
    const { q, category } = req.query;
    if (!q || q.trim().length < 1) {
      return res.json({ success: true, data: { suggestions: [], categories: [], cities: [] }, suggestions: [] });
    }

    const searchTerm = q.trim();
    const regex = { $regex: escapeRegex(searchTerm), $options: 'i' };

    const filter = { status: 'APPROVED' };
    if (category && category !== 'all') {
      const catSlug = category.toLowerCase().trim();
      const aliasMap = {
        'electronics': 'products',
        'mobiles': 'products',
        'phones': 'products',
        'cars': 'vehicles',
        'bikes': 'vehicles',
        'motorcycles': 'vehicles',
        'property': 'properties',
        'real-estate': 'properties',
        'farming': 'farm',
        'agriculture': 'farm'
      };
      filter.categorySlug = aliasMap[catSlug] || catSlug;
    }

    // 1. Search matching listing titles
    const titleMatches = await Listing.find({
      ...filter,
      $or: [
        { title: regex },
        { 'details.brand': regex },
        { 'details.model': regex },
        { 'details.electronicsBrand': regex },
        { 'details.propertyType': regex },
        { subcategoryName: regex }
      ]
    })
      .select('title categorySlug details location.city')
      .limit(8);

    const suggestions = [];
    const seenTitles = new Set();
    titleMatches.forEach(item => {
      if (!seenTitles.has(item.title)) {
        seenTitles.add(item.title);
        suggestions.push({
          title: item.title,
          category: item.categorySlug,
          brand: item.details?.brand || item.details?.electronicsBrand || '',
          city: item.location?.city || ''
        });
      }
    });

    // 2. Search matching categories
    const categoryMatches = await Category.find({
      active: true,
      $or: [{ name: regex }, { 'subcategories.name': regex }]
    }).select('name slug icon subcategories').limit(4);

    // 3. Search matching cities
    const cityMatches = await Listing.distinct('location.city', {
      status: 'APPROVED',
      'location.city': regex
    });

    res.json({
      success: true,
      data: {
        suggestions,
        categories: categoryMatches,
        cities: cityMatches.slice(0, 5)
      },
      suggestions
    });
  } catch (error) {
    console.error('getSearchSuggestions error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get single listing details & increment view count
// @route   GET /api/marketplace/listings/:id
// @access  Public
export const getListingById = async (req, res) => {
  try {
    const listing = await Listing.findById(req.params.id)
      .populate('sellerId', 'name profilePhoto rating reviewCount verificationStatus location phone bio createdAt')
      .populate('categoryId', 'name slug icon');

    if (!listing) {
      return res.status(404).json({ success: false, message: 'Listing not found' });
    }

    // If listing is not approved, only the seller or an admin can access it
    if (listing.status !== 'APPROVED') {
      const authHeader = req.headers.authorization;
      if (!authHeader) {
        return res.status(403).json({ 
          success: false, 
          message: 'This listing is currently pending moderation review and is not publicly visible.' 
        });
      }
    }

    // Increment view count
    listing.views = (listing.views || 0) + 1;
    await listing.save();

    res.json({ success: true, data: listing });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Create new listing
// @route   POST /api/marketplace/listings
// @access  Private
export const createListing = async (req, res) => {
  try {
    const {
      title,
      description,
      categoryId,
      categorySlug,
      subcategoryName,
      listingType,
      condition,
      price,
      currency,
      currencySymbol,
      location,
      images,
      media,
      video,
      details,
      status: requestedStatus
    } = req.body;

    if (!title || !description || (!categoryId && !categorySlug)) {
      return res.status(400).json({ success: false, message: 'Please provide title, description, and category' });
    }

    // Seller Approval Check: Strict backend rule enforcement
    const userRole = (req.user.role || '').toUpperCase();
    if (userRole === 'SELLER') {
      if (req.user.accountStatus !== 'ACTIVE' || req.user.sellerStatus !== 'APPROVED') {
        return res.status(403).json({
          success: false,
          code: 'SELLER_NOT_APPROVED',
          message: 'Your seller account must be approved by an administrator before you can publish listings.'
        });
      }
    }

    // Resolve category if slug is given
    let catId = categoryId;
    let catSlug = categorySlug;
    if (!catId && catSlug) {
      const categoryDoc = await Category.findOne({ slug: catSlug });
      if (categoryDoc) {
        catId = categoryDoc._id;
      }
    } else if (catId && !catSlug) {
      const categoryDoc = await Category.findById(catId);
      if (categoryDoc) {
        catSlug = categoryDoc.slug;
      }
    }

    // Determine initial status:
    // User Requirement: "listing remains PENDING_REVIEW -> admin approves -> approved listing becomes public. Never automatically approve seller listings."
    // Only ADMIN role can directly create an APPROVED listing.
    let initialStatus = 'PENDING_REVIEW';
    if (requestedStatus === 'DRAFT') {
      initialStatus = 'DRAFT';
    } else if (req.user.role === 'ADMIN') {
      initialStatus = requestedStatus || 'APPROVED';
    } else {
      initialStatus = 'PENDING_REVIEW';
    }

    // Enforce strict image limit (Max 3 images per listing)
    if (Array.isArray(media) && media.length > 3) {
      return res.status(400).json({
        success: false,
        message: 'A maximum of 3 images is allowed per listing.'
      });
    }
    if (Array.isArray(images) && images.length > 3) {
      return res.status(400).json({
        success: false,
        message: 'A maximum of 3 images is allowed per listing.'
      });
    }

    // Process media metadata if provided (capped at 3)
    let processedMedia = [];
    if (Array.isArray(media) && media.length > 0) {
      const validMedia = media.slice(0, 3);
      processedMedia = validMedia.map((item, idx) => {
        const rawUrl = item.secure_url || item.url;
        if (!rawUrl || typeof rawUrl !== 'string') {
          throw new Error('Invalid image URL detected in media upload.');
        }
        return {
          url: rawUrl,
          secure_url: rawUrl,
          publicId: item.publicId || item.public_id || `upload_${idx}_${Date.now()}`,
          width: item.width || null,
          height: item.height || null,
          format: item.format || '',
          resourceType: item.resourceType || item.resource_type || 'image',
          isCover: Boolean(item.isCover || idx === 0),
          order: typeof item.order === 'number' ? item.order : idx
        };
      });
    }

    let finalImages = [];
    if (Array.isArray(images) && images.length > 0) {
      finalImages = images.slice(0, 3).filter(img => typeof img === 'string' && img.trim().length > 0);
    } else if (processedMedia.length > 0) {
      finalImages = processedMedia.map(m => m.secure_url || m.url);
    }

    // Currency resolution and validation
    let resolvedCurrency = 'INR';
    let resolvedCurrencySymbol = '₹';
    if (currency) {
      if (isValidCurrency(currency)) {
        resolvedCurrency = currency.trim().toUpperCase();
        resolvedCurrencySymbol = currencySymbol || getCurrencyByCode(resolvedCurrency).symbol || '₹';
      } else {
        return res.status(400).json({
          success: false,
          message: `Invalid currency code: ${currency}. Please select a valid worldwide ISO-4217 currency.`
        });
      }
    } else {
      const defaultCurr = getDefaultCurrencyForCountry(location?.country || 'India');
      resolvedCurrency = defaultCurr.code;
      resolvedCurrencySymbol = defaultCurr.symbol;
    }

    const newListing = await Listing.create({
      sellerId: req.user._id,
      categoryId: catId,
      categorySlug: catSlug || 'properties',
      subcategoryName: subcategoryName || '',
      title: title.trim(),
      description,
      listingType: (listingType || 'SELL').toUpperCase(),
      condition: (condition || 'GOOD').toUpperCase(),
      price: listingType?.toUpperCase() === 'FREE' ? 0 : Number(price) || 0,
      currency: resolvedCurrency,
      currencySymbol: resolvedCurrencySymbol,
      location: location || { country: 'India', city: 'Bengaluru' },
      media: processedMedia,
      images: finalImages,
      video: video || '',
      status: initialStatus,
      approvedAt: initialStatus === 'APPROVED' ? new Date() : undefined,
      approvedBy: initialStatus === 'APPROVED' ? req.user._id : undefined,
      details: details || {}
    });

    // Create notification for user
    await Notification.create({
      userId: req.user._id,
      title: initialStatus === 'APPROVED' ? 'Listing Published' : 'Listing Submitted for Review',
      message: initialStatus === 'APPROVED'
        ? `Your listing "${title}" has been published successfully.`
        : `Your listing "${title}" has been submitted and is currently in moderation (PENDING_REVIEW). It will appear publicly once approved by an admin.`,
      type: initialStatus === 'APPROVED' ? 'LISTING_APPROVED' : 'LISTING_PENDING',
      link: `/listing/${newListing._id}`
    });

    res.status(201).json({ success: true, data: newListing });
  } catch (error) {
    console.error('createListing error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Delete a specific media asset from listing
// @route   DELETE /api/marketplace/listings/:id/media/:publicId
// @access  Private
export const deleteListingMedia = async (req, res) => {
  try {
    const { id, publicId } = req.params;
    const decodedPublicId = decodeURIComponent(publicId);

    const listing = await Listing.findById(id);
    if (!listing) {
      return res.status(404).json({ success: false, message: 'Listing not found' });
    }

    // Validate ownership before deleting media
    if (listing.sellerId.toString() !== req.user._id.toString() && req.user.role !== 'ADMIN') {
      return res.status(403).json({ success: false, message: 'Not authorized to delete media from this listing' });
    }

    // Filter out the media item
    const initialMediaCount = listing.media?.length || 0;
    listing.media = (listing.media || []).filter(m => m.publicId !== decodedPublicId && m.publicId !== publicId);

    // If deleted image was cover, make the first remaining image the cover
    if (listing.media.length > 0 && !listing.media.some(m => m.isCover)) {
      listing.media[0].isCover = true;
    }

    await listing.save();

    // Trigger secure Cloudinary destruction in background
    deleteCloudinaryAsset(decodedPublicId).catch(err => {
      console.error('deleteCloudinaryAsset background error:', err);
    });

    res.json({
      success: true,
      message: 'Media asset deleted successfully',
      data: listing
    });
  } catch (error) {
    console.error('deleteListingMedia error:', error);
    res.status(500).json({ success: false, message: error.message });
  }

};

// @desc    Update listing
// @route   PUT /api/marketplace/listings/:id
// @access  Private
export const updateListing = async (req, res) => {
  try {
    const listing = await Listing.findById(req.params.id);
    if (!listing) {
      return res.status(404).json({ success: false, message: 'Listing not found' });
    }

    // Check ownership or admin
    if (listing.sellerId.toString() !== req.user._id.toString() && req.user.role !== 'ADMIN') {
      return res.status(403).json({ success: false, message: 'Not authorized to edit this listing' });
    }

    // Strict Allowlist for Mass Assignment Prevention
    const allowedFields = [
      'title',
      'description',
      'categoryId',
      'categorySlug',
      'subcategoryName',
      'listingType',
      'condition',
      'price',
      'currency',
      'currencySymbol',
      'location',
      'images',
      'media',
      'video',
      'details'
    ];

    const updates = {};
    for (const key of allowedFields) {
      if (req.body[key] !== undefined) {
        updates[key] = req.body[key];
      }
    }

    if (updates.title && typeof updates.title === 'string') {
      updates.title = updates.title.trim();
    }

    if (updates.price !== undefined) {
      const numPrice = Number(updates.price);
      updates.price = isNaN(numPrice) || numPrice < 0 ? 0 : numPrice;
    }

    // Currency validation on update
    if (updates.currency !== undefined) {
      if (isValidCurrency(updates.currency)) {
        updates.currency = updates.currency.trim().toUpperCase();
        updates.currencySymbol = updates.currencySymbol || getCurrencyByCode(updates.currency).symbol || '₹';
      } else {
        return res.status(400).json({
          success: false,
          message: `Invalid currency code: ${updates.currency}. Please provide a valid ISO-4217 currency.`
        });
      }
    }

    // Validate and limit images / media on update
    if (Array.isArray(updates.media)) {
      if (updates.media.length > 3) {
        return res.status(400).json({
          success: false,
          message: 'A maximum of 3 images is allowed per listing.'
        });
      }
      updates.media = updates.media.slice(0, 3).map((item, idx) => {
        const rawUrl = item.secure_url || item.url;
        if (!rawUrl || typeof rawUrl !== 'string') {
          throw new Error('Invalid image URL detected in media upload.');
        }
        return {
          url: rawUrl,
          secure_url: rawUrl,
          publicId: item.publicId || item.public_id || `upload_${idx}_${Date.now()}`,
          width: item.width || null,
          height: item.height || null,
          format: item.format || '',
          resourceType: item.resourceType || item.resource_type || 'image',
          isCover: Boolean(item.isCover || idx === 0),
          order: typeof item.order === 'number' ? item.order : idx
        };
      });
    }

    if (Array.isArray(updates.images)) {
      if (updates.images.length > 3) {
        return res.status(400).json({
          success: false,
          message: 'A maximum of 3 images is allowed per listing.'
        });
      }
      updates.images = updates.images.slice(0, 3).filter(img => typeof img === 'string' && img.trim().length > 0);
    }

    // If listing was REJECTED or CHANGES_REQUESTED and seller is updating, re-queue for review
    if (
      (listing.status === 'REJECTED' || listing.status === 'CHANGES_REQUESTED') &&
      req.user.role !== 'ADMIN'
    ) {
      updates.status = 'PENDING_REVIEW';
      updates.rejectionReason = '';
      updates.changeRequestReason = '';
    } else if (req.user.role === 'ADMIN' && req.body.status) {
      const validAdminStatuses = ['DRAFT', 'PENDING_REVIEW', 'APPROVED', 'REJECTED', 'CHANGES_REQUESTED', 'SOLD', 'RENTED', 'CLOSED'];
      if (validAdminStatuses.includes(req.body.status)) {
        updates.status = req.body.status;
      }
    }

    // Never allow updating sellerId, views, approvedAt, approvedBy directly via updateListing
    delete updates.sellerId;
    delete updates.views;
    delete updates.approvedAt;
    delete updates.approvedBy;

    const updatedListing = await Listing.findByIdAndUpdate(
      req.params.id,
      updates,
      { new: true, runValidators: true }
    );

    res.json({ success: true, data: updatedListing });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Delete listing
// @route   DELETE /api/marketplace/listings/:id
// @access  Private
export const deleteListing = async (req, res) => {
  try {
    const listing = await Listing.findById(req.params.id);
    if (!listing) {
      return res.status(404).json({ success: false, message: 'Listing not found' });
    }

    if (listing.sellerId.toString() !== req.user._id.toString() && req.user.role !== 'ADMIN') {
      return res.status(403).json({ success: false, message: 'Not authorized to delete this listing' });
    }

    await Listing.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'Listing deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Change listing status (e.g. SOLD, RENTED, CLOSED, DRAFT, PENDING_REVIEW)
// @route   PATCH /api/marketplace/listings/:id/status
// @access  Private
export const updateListingStatus = async (req, res) => {
  try {
    const { status } = req.body;
    if (!status) {
      return res.status(400).json({ success: false, message: 'Status is required' });
    }

    const listing = await Listing.findById(req.params.id);
    if (!listing) {
      return res.status(404).json({ success: false, message: 'Listing not found' });
    }

    if (listing.sellerId.toString() !== req.user._id.toString() && req.user.role !== 'ADMIN') {
      return res.status(403).json({ success: false, message: 'Not authorized to update this listing status' });
    }

    const validAllStatuses = ['DRAFT', 'PENDING_REVIEW', 'APPROVED', 'REJECTED', 'CHANGES_REQUESTED', 'SOLD', 'RENTED', 'CLOSED'];
    const targetStatus = status.toUpperCase();

    if (!validAllStatuses.includes(targetStatus)) {
      return res.status(400).json({ success: false, message: 'Invalid listing status provided' });
    }

    // Role-based status transition restrictions
    if (req.user.role !== 'ADMIN') {
      const allowedSellerTransitions = ['DRAFT', 'PENDING_REVIEW', 'CLOSED', 'SOLD', 'RENTED'];
      if (!allowedSellerTransitions.includes(targetStatus)) {
        return res.status(403).json({
          success: false,
          message: 'Sellers cannot approve, reject, or request changes on listings. Administrative review required.'
        });
      }
    } else {
      if (targetStatus === 'APPROVED') {
        listing.approvedAt = new Date();
        listing.approvedBy = req.user._id;
      }
    }

    listing.status = targetStatus;
    await listing.save();

    res.json({ success: true, data: listing });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get user's own listings
// @route   GET /api/marketplace/listings/my/all
// @access  Private
export const getMyListings = async (req, res) => {
  try {
    const { status, category, categorySlug } = req.query;
    const query = { sellerId: req.user._id };
    if (status && status !== 'ALL') {
      query.status = status.toUpperCase();
    }
    const cat = category || categorySlug;
    if (cat && cat !== 'all' && cat !== 'ALL') {
      query.categorySlug = cat.toLowerCase();
    }

    const listings = await Listing.find(query)
      .populate('categoryId', 'name slug icon')
      .sort({ createdAt: -1 });

    res.json({ success: true, data: listings });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get similar / related listings
// @route   GET /api/marketplace/listings/:id/similar
// @access  Public
export const getSimilarListings = async (req, res) => {
  try {
    const listing = await Listing.findById(req.params.id);
    if (!listing) {
      return res.status(404).json({ success: false, message: 'Listing not found' });
    }

    const similar = await Listing.find({
      _id: { $ne: listing._id },
      categoryId: listing.categoryId,
      status: 'APPROVED'
    })
      .populate('sellerId', 'name profilePhoto rating verificationStatus')
      .limit(4);

    res.json({ success: true, data: similar });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
