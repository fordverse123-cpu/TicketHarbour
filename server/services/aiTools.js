import { z } from 'zod';
import Listing from '../models/Listing.js';
import Train from '../models/Train.js';
import Booking from '../models/Booking.js';
import Wishlist from '../models/Wishlist.js';
import User from '../models/User.js';

// Input Schemas
const searchParamsSchema = z.object({
  search: z.string().optional(),
  city: z.string().optional(),
  from: z.string().optional(),
  to: z.string().optional(),
  date: z.string().optional(),
  category: z.string().optional(),
  journeyClass: z.string().optional(),
  passengers: z.number().or(z.string()).optional(),
  maxPrice: z.number().or(z.string()).optional(),
}).passthrough();

const idSchema = z.object({
  listingId: z.string().min(1),
});

const userAuthSchema = z.object({
  userId: z.string().min(1),
});

/**
 * Tool 1: Search Movies
 */
export const toolSearchMovies = async (rawParams) => {
  const params = searchParamsSchema.parse(rawParams);
  const query = { categoryType: 'movie', isActive: true };

  if (params.search) {
    query.$or = [
      { title: { $regex: params.search, $options: 'i' } },
      { description: { $regex: params.search, $options: 'i' } },
      { 'transitInfo.genre': { $regex: params.search, $options: 'i' } },
    ];
  }

  if (params.city) {
    query['location.city'] = { $regex: params.city, $options: 'i' };
  }

  if (params.maxPrice) {
    const maxP = Number(params.maxPrice);
    if (!isNaN(maxP)) {
      query['pricingTiers.price'] = { $lte: maxP };
    }
  }

  const listings = await Listing.find(query).limit(10).lean();

  return listings.map((l) => ({
    _id: l._id,
    slug: l.slug || l._id,
    title: l.title,
    categoryType: 'movie',
    city: l.location?.city || 'All Cities',
    venue: l.venue?.name || l.location?.city,
    genre: l.transitInfo?.genre || 'Cinema',
    language: l.transitInfo?.language || 'Hindi, English',
    duration: l.transitInfo?.duration || '2h 30m',
    startingPrice: l.pricingTiers?.[0]?.price || 250,
    rating: l.rating || 4.8,
    bannerImage: l.bannerImage || l.images?.[0],
  }));
};

/**
 * Tool 2: Search Events
 */
export const toolSearchEvents = async (rawParams) => {
  const params = searchParamsSchema.parse(rawParams);
  const query = { categoryType: 'event', isActive: true };

  if (params.search) {
    query.$or = [
      { title: { $regex: params.search, $options: 'i' } },
      { description: { $regex: params.search, $options: 'i' } },
    ];
  }

  if (params.city) {
    query['location.city'] = { $regex: params.city, $options: 'i' };
  }

  if (params.maxPrice) {
    const maxP = Number(params.maxPrice);
    if (!isNaN(maxP)) {
      query['pricingTiers.price'] = { $lte: maxP };
    }
  }

  const listings = await Listing.find(query).limit(10).lean();

  return listings.map((l) => ({
    _id: l._id,
    slug: l.slug || l._id,
    title: l.title,
    categoryType: 'event',
    city: l.location?.city || 'All Cities',
    venue: l.venue?.name || l.location?.city,
    eventType: l.transitInfo?.eventType || 'Live Event',
    date: l.transitInfo?.date || 'Upcoming',
    startingPrice: l.pricingTiers?.[0]?.price || 999,
    rating: l.rating || 4.9,
    bannerImage: l.bannerImage || l.images?.[0],
  }));
};

/**
 * Tool 3: Search Sports
 */
export const toolSearchSports = async (rawParams) => {
  const params = searchParamsSchema.parse(rawParams);
  const query = { categoryType: 'sports', isActive: true };

  if (params.search) {
    query.$or = [
      { title: { $regex: params.search, $options: 'i' } },
      { description: { $regex: params.search, $options: 'i' } },
    ];
  }

  if (params.city) {
    query['location.city'] = { $regex: params.city, $options: 'i' };
  }

  if (params.maxPrice) {
    const maxP = Number(params.maxPrice);
    if (!isNaN(maxP)) {
      query['pricingTiers.price'] = { $lte: maxP };
    }
  }

  const listings = await Listing.find(query).limit(10).lean();

  return listings.map((l) => ({
    _id: l._id,
    slug: l.slug || l._id,
    title: l.title,
    categoryType: 'sports',
    city: l.location?.city || 'All Cities',
    venue: l.venue?.name || l.location?.city,
    sportType: l.transitInfo?.sportType || 'Match',
    date: l.transitInfo?.date || 'Matchday',
    startingPrice: l.pricingTiers?.[0]?.price || 400,
    rating: l.rating || 4.9,
    bannerImage: l.bannerImage || l.images?.[0],
  }));
};

/**
 * Tool 4: Search Trains
 */
export const toolSearchTrains = async (rawParams) => {
  const params = searchParamsSchema.parse(rawParams);
  const { from = '', to = '', journeyClass } = params;

  let query = {};
  if (from && to) {
    query = {
      $or: [
        {
          source: { $regex: from, $options: 'i' },
          destination: { $regex: to, $options: 'i' },
        },
        {
          'from.stationName': { $regex: from, $options: 'i' },
          'to.stationName': { $regex: to, $options: 'i' },
        },
        {
          'from.stationCode': { $regex: from, $options: 'i' },
          'to.stationCode': { $regex: to, $options: 'i' },
        },
      ],
    };
  }

  if (journeyClass && journeyClass !== 'ALL') {
    query.classes = journeyClass.toUpperCase();
  }

  const trains = await Train.find(query).limit(10).lean();

  if (trains.length > 0) {
    return trains.map((t) => ({
      _id: t._id,
      trainNumber: t.trainNumber,
      trainName: t.trainName,
      trainType: t.trainType,
      source: t.source || t.from?.stationName,
      destination: t.destination || t.to?.stationName,
      departureTime: t.from?.departure || '10:00',
      arrivalTime: t.to?.arrival || '18:00',
      duration: t.duration || '8h 00m',
      classes: t.classes || ['3A', '2A', 'SL'],
      startingPrice: 780,
    }));
  }

  // Fallback search in Listings collection
  const listingQuery = { categoryType: 'train', isActive: true };
  if (from && to) {
    listingQuery.$or = [
      { 'transitInfo.source': { $regex: from, $options: 'i' }, 'transitInfo.destination': { $regex: to, $options: 'i' } },
      { title: { $regex: `${from}|${to}`, $options: 'i' } },
    ];
  }

  const listings = await Listing.find(listingQuery).limit(10).lean();
  return listings.map((l) => ({
    _id: l._id,
    trainNumber: l.transitInfo?.number || '12951',
    trainName: l.title,
    source: l.transitInfo?.source || from,
    destination: l.transitInfo?.destination || to,
    departureTime: l.transitInfo?.departureTime || '17:00',
    arrivalTime: l.transitInfo?.arrivalTime || '08:30',
    duration: l.transitInfo?.duration || '15h 32m',
    classes: ['1A', '2A', '3A', 'SL'],
    startingPrice: l.pricingTiers?.[0]?.price || 780,
  }));
};

/**
 * Tool 5: Search Buses
 */
export const toolSearchBuses = async (rawParams) => {
  const params = searchParamsSchema.parse(rawParams);
  const { from = '', to = '', maxPrice } = params;

  const query = { categoryType: 'bus', isActive: true };
  if (from || to) {
    const conditions = [];
    if (from) conditions.push({ 'transitInfo.source': { $regex: from, $options: 'i' } });
    if (to) conditions.push({ 'transitInfo.destination': { $regex: to, $options: 'i' } });
    query.$and = conditions;
  }

  if (maxPrice) {
    const maxP = Number(maxPrice);
    if (!isNaN(maxP)) {
      query['pricingTiers.price'] = { $lte: maxP };
    }
  }

  const listings = await Listing.find(query).limit(10).lean();

  return listings.map((l) => ({
    _id: l._id,
    slug: l.slug || l._id,
    title: l.title,
    operator: l.transitInfo?.operator || 'TicketHarbour Premium Coach',
    busType: l.transitInfo?.busType || 'Volvo AC Sleeper',
    source: l.transitInfo?.source || from,
    destination: l.transitInfo?.destination || to,
    departureTime: l.transitInfo?.departureTime || '21:00',
    arrivalTime: l.transitInfo?.arrivalTime || '07:30',
    duration: l.transitInfo?.duration || '10h 30m',
    startingPrice: l.pricingTiers?.[0]?.price || 850,
    rating: l.rating || 4.7,
  }));
};

/**
 * Tool 6: Search Flights
 */
export const toolSearchFlights = async (rawParams) => {
  const params = searchParamsSchema.parse(rawParams);
  const { from = '', to = '', maxPrice } = params;

  const query = { categoryType: 'flight', isActive: true };
  if (from || to) {
    const conditions = [];
    if (from) conditions.push({ 'transitInfo.source': { $regex: from, $options: 'i' } });
    if (to) conditions.push({ 'transitInfo.destination': { $regex: to, $options: 'i' } });
    query.$and = conditions;
  }

  if (maxPrice) {
    const maxP = Number(maxPrice);
    if (!isNaN(maxP)) {
      query['pricingTiers.price'] = { $lte: maxP };
    }
  }

  const listings = await Listing.find(query).limit(10).lean();

  return listings.map((l) => ({
    _id: l._id,
    slug: l.slug || l._id,
    title: l.title,
    airline: l.transitInfo?.operator || 'Air TicketHarbour',
    flightNumber: l.transitInfo?.number || 'AI-502',
    source: l.transitInfo?.source || from,
    destination: l.transitInfo?.destination || to,
    departureTime: l.transitInfo?.departureTime || '08:15',
    arrivalTime: l.transitInfo?.arrivalTime || '10:30',
    duration: l.transitInfo?.duration || '2h 15m',
    startingPrice: l.pricingTiers?.[0]?.price || 4200,
    rating: l.rating || 4.6,
  }));
};

/**
 * Tool 7: Get Listing Details
 */
export const toolGetListingDetails = async (rawParams) => {
  const { listingId } = idSchema.parse(rawParams);
  const listing = await Listing.findOne({
    $or: [{ _id: listingId }, { slug: listingId }],
  }).populate('venue category').lean();

  if (!listing) return null;

  return {
    _id: listing._id,
    title: listing.title,
    slug: listing.slug,
    categoryType: listing.categoryType,
    description: listing.description,
    location: listing.location,
    venue: listing.venue?.name,
    transitInfo: listing.transitInfo,
    attractionInfo: listing.attractionInfo,
    pricingTiers: listing.pricingTiers,
    rating: listing.rating,
    numReviews: listing.numReviews,
    bannerImage: listing.bannerImage || listing.images?.[0],
  };
};

/**
 * Tool 8: Get User Bookings (Enforces caller userId authorization)
 */
export const toolGetUserBookings = async (rawParams) => {
  const { userId } = userAuthSchema.parse(rawParams);
  const bookings = await Booking.find({ user: userId })
    .populate('listing schedule')
    .sort({ createdAt: -1 })
    .limit(10)
    .lean();

  return bookings.map((b) => ({
    _id: b._id,
    bookingReference: b.bookingReference,
    categoryType: b.categoryType,
    status: b.status,
    totalAmount: b.totalAmount,
    listingTitle: b.listing?.title || 'Ticket Booking',
    scheduleDate: b.schedule?.date ? new Date(b.schedule.date).toISOString().split('T')[0] : '',
    startTime: b.schedule?.startTime || '10:00 AM',
    seats: b.seats || [],
    quantity: b.quantity || 1,
    createdAt: b.createdAt,
  }));
};

/**
 * Tool 9: Get User Wishlist (Enforces caller userId authorization)
 */
export const toolGetUserWishlist = async (rawParams) => {
  const { userId } = userAuthSchema.parse(rawParams);
  const wishlist = await Wishlist.find({ user: userId })
    .populate('listing')
    .sort({ createdAt: -1 })
    .lean();

  return wishlist
    .filter((w) => w.listing)
    .map((w) => ({
      _id: w._id,
      listingId: w.listing._id,
      slug: w.listing.slug,
      title: w.listing.title,
      categoryType: w.listing.categoryType,
      city: w.listing.location?.city,
      startingPrice: w.listing.pricingTiers?.[0]?.price || 150,
      bannerImage: w.listing.bannerImage || w.listing.images?.[0],
    }));
};

/**
 * Tool 10: Get User Profile (Minimal masked non-sensitive fields)
 */
export const toolGetUserProfile = async (rawParams) => {
  const { userId } = userAuthSchema.parse(rawParams);
  const user = await User.findById(userId).select('name email phone role isVerified status createdAt').lean();
  if (!user) return null;

  return {
    id: user._id,
    name: user.name,
    email: user.email,
    phone: user.phone ? user.phone.replace(/(\d{2})\d{5}(\d{3})/, '$1*****$2') : '',
    role: user.role,
    isVerified: user.isVerified,
    status: user.status,
    memberSince: new Date(user.createdAt).getFullYear(),
  };
};

/**
 * AI Tool Dispatcher with Safe Parameter Validation & Auth Checks
 */
export const executeAiTool = async (toolName, params = {}, authContext = {}) => {
  try {
    switch (toolName) {
      case 'searchMovies':
        return { success: true, data: await toolSearchMovies(params) };
      case 'searchEvents':
        return { success: true, data: await toolSearchEvents(params) };
      case 'searchSports':
        return { success: true, data: await toolSearchSports(params) };
      case 'searchTrains':
        return { success: true, data: await toolSearchTrains(params) };
      case 'searchBuses':
        return { success: true, data: await toolSearchBuses(params) };
      case 'searchFlights':
        return { success: true, data: await toolSearchFlights(params) };
      case 'getListingDetails':
        return { success: true, data: await toolGetListingDetails(params) };
      case 'getUserBookings':
        if (!authContext.userId) return { success: false, error: 'Authentication required' };
        return { success: true, data: await toolGetUserBookings({ ...params, userId: authContext.userId.toString() }) };
      case 'getUserWishlist':
        if (!authContext.userId) return { success: false, error: 'Authentication required' };
        return { success: true, data: await toolGetUserWishlist({ ...params, userId: authContext.userId.toString() }) };
      case 'getUserProfile':
        if (!authContext.userId) return { success: false, error: 'Authentication required' };
        return { success: true, data: await toolGetUserProfile({ ...params, userId: authContext.userId.toString() }) };
      default:
        return { success: false, error: `Unknown tool: ${toolName}` };
    }
  } catch (err) {
    return { success: false, error: `Validation failed or execution error: ${err.message}` };
  }
};

export const AI_TOOL_DEFINITIONS = [
  'searchMovies', 'searchEvents', 'searchSports', 'searchTrains',
  'searchBuses', 'searchFlights', 'getListingDetails', 'getUserBookings',
  'getUserWishlist', 'getUserProfile'
];

