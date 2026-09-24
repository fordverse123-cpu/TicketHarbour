import { z } from 'zod';
import { callAIProvider } from './aiProviderService.js';
import { SYSTEM_PROMPT, SUPPORT_KNOWLEDGE_BASE } from './aiPrompts.js';
import {
  toolSearchMovies,
  toolSearchEvents,
  toolSearchSports,
  toolSearchTrains,
  toolSearchBuses,
  toolSearchFlights,
  toolGetListingDetails,
  toolGetUserBookings,
  toolGetUserWishlist,
  toolGetUserProfile,
} from './aiTools.js';
import Listing from '../models/Listing.js';
import Booking from '../models/Booking.js';
import SearchLog from '../models/SearchLog.js';
import User from '../models/User.js';

// Zod Intent Schemas
const intentSchema = z.object({
  intent: z.enum([
    'SEARCH',
    'RECOMMEND',
    'BOOKING_HELP',
    'BOOKING_STATUS',
    'CANCELLATION_HELP',
    'PAYMENT_HELP',
    'ACCOUNT_HELP',
    'GENERAL_SUPPORT',
    'CLARIFICATION_REQUIRED',
  ]),
  category: z.enum(['movie', 'event', 'sports', 'train', 'bus', 'flight', 'attraction', 'all']).optional(),
  filters: z.object({
    from: z.string().optional(),
    to: z.string().optional(),
    city: z.string().optional(),
    search: z.string().optional(),
    date: z.string().optional(),
    timeFrom: z.string().optional(),
    timeTo: z.string().optional(),
    passengers: z.number().or(z.string()).optional(),
    journeyClass: z.string().optional(),
    maxPrice: z.number().or(z.string()).optional(),
  }).optional(),
  clarificationQuestion: z.string().optional(),
  summary: z.string().optional(),
});

/**
 * Helper to resolve relative date expressions or month names against current server date
 */
export const resolveRelativeDate = (text = '') => {
  if (!text) return new Date().toISOString().split('T')[0];
  const lower = text.toLowerCase();
  const today = new Date();

  // Check explicit YYYY-MM-DD
  const isoMatch = text.match(/\b(202\d-[01]\d-[0-3]\d)\b/);
  if (isoMatch) return isoMatch[1];

  // Check month name formats (e.g., "October 5", "Oct 5", "5th Oct", "on October 5")
  const monthMatch = lower.match(/(january|february|march|april|may|june|july|august|september|october|november|december|jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)\s+(\d{1,2})|(?:on\s+)?(\d{1,2})(?:st|nd|rd|th)?\s+(january|february|march|april|may|june|july|august|september|october|november|december|jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)/i);

  if (monthMatch) {
    const monthStr = monthMatch[1] || monthMatch[4];
    const dayNum = parseInt(monthMatch[2] || monthMatch[3], 10);
    const months = ['jan', 'feb', 'mar', 'apr', 'may', 'jun', 'jul', 'aug', 'sep', 'oct', 'nov', 'dec'];
    const monthIdx = months.findIndex((m) => monthStr.toLowerCase().startsWith(m));
    if (monthIdx !== -1 && !isNaN(dayNum)) {
      const year = today.getFullYear();
      const targetDate = new Date(year, monthIdx, dayNum);
      if (targetDate < today) {
        targetDate.setFullYear(year + 1);
      }
      const yyyy = targetDate.getFullYear();
      const mm = String(targetDate.getMonth() + 1).padStart(2, '0');
      const dd = String(targetDate.getDate()).padStart(2, '0');
      return `${yyyy}-${mm}-${dd}`;
    }
  }

  if (lower.includes('today')) {
    return today.toISOString().split('T')[0];
  }
  if (lower.includes('tomorrow')) {
    const tomorrow = new Date(today);
    tomorrow.setDate(today.getDate() + 1);
    return tomorrow.toISOString().split('T')[0];
  }
  if (lower.includes('this weekend') || lower.includes('weekend')) {
    const saturday = new Date(today);
    const dayOfWeek = today.getDay();
    const distanceToSaturday = (6 - dayOfWeek + 7) % 7 || 7;
    saturday.setDate(today.getDate() + distanceToSaturday);
    return saturday.toISOString().split('T')[0];
  }
  if (lower.includes('next week')) {
    const nextWeek = new Date(today);
    nextWeek.setDate(today.getDate() + 7);
    return nextWeek.toISOString().split('T')[0];
  }

  // Default fallback: tomorrow for search convenience
  const tomorrow = new Date(today);
  tomorrow.setDate(today.getDate() + 1);
  return tomorrow.toISOString().split('T')[0];
};

/**
 * Fallback Deterministic NLP Parser (When LLM Provider is offline or unconfigured)
 */
export const parseStructuredIntentFallback = (userMessage, history = []) => {
  const msg = userMessage.trim().toLowerCase();

  // Check 1: User Bookings / Booking Status
  if (
    msg.includes('my bookings') ||
    msg.includes('my tickets') ||
    msg.includes('what are my bookings') ||
    msg.includes('show my bookings') ||
    msg.includes('my reservations')
  ) {
    return {
      intent: 'BOOKING_STATUS',
      summary: 'Checking your TicketHarbour bookings.',
    };
  }

  // Check 2: Download / QR / Support Questions
  if (msg.includes('download') || msg.includes('pdf') || msg.includes('qr') || msg.includes('gate')) {
    return {
      intent: 'BOOKING_HELP',
      summary: SUPPORT_KNOWLEDGE_BASE.ticketDownload,
    };
  }
  if (msg.includes('cancel') || msg.includes('refund')) {
    return {
      intent: 'CANCELLATION_HELP',
      summary: SUPPORT_KNOWLEDGE_BASE.cancellation,
    };
  }
  if (msg.includes('password') || msg.includes('reset') || msg.includes('login') || msg.includes('account')) {
    return {
      intent: 'ACCOUNT_HELP',
      summary: SUPPORT_KNOWLEDGE_BASE.accountAndPassword,
    };
  }
  if (msg.includes('payment') || msg.includes('deducted') || msg.includes('failed')) {
    return {
      intent: 'PAYMENT_HELP',
      summary: SUPPORT_KNOWLEDGE_BASE.paymentIssues,
    };
  }

  // Check 3: Universal Route Intent Matching (Bus, Train, Flight)
  // Example queries:
  // "buses from Vijayawada to Hyderabad"
  // "I want to travel from Guntur to Bangalore"
  // "Find trains from Chennai to Hyderabad tomorrow"
  // "Show buses from Vijayawada to Visakhapatnam"
  // "I need a bus from Hyderabad to Vijayawada on October 5"
  // "flights from Hyderabad to Delhi"
  const routeRegex = /(?:from|between|travel\s+from|bus\s+from|buses\s+from|train\s+from|trains\s+from|flight\s+from|flights\s+from|go\s+from|need\s+(?:a\s+)?(?:bus|train|flight)?\s*from|show\s+(?:buses|trains|flights)?\s*from)\s+([a-zA-Z\s]+?)\s+(?:to|and)\s+([a-zA-Z\s]+?)(?:\s+on\s+|\s+tomorrow|\s+today|\s+this|\s+under|\s+below|\s*$)/i;
  const simpleToRegex = /([a-zA-Z\s]+?)\s+to\s+([a-zA-Z\s]+?)(?:\s+on\s+|\s+tomorrow|\s+today|\s+this|\s+under|\s+below|\s*$)/i;

  const routeMatch = msg.match(routeRegex) || msg.match(simpleToRegex);
  const maxPriceMatch = msg.match(/(?:under|<|below|rs|₹)\s*(\d+)/i);

  let category = 'bus';
  if (msg.includes('train') || msg.includes('railway') || msg.includes('express')) {
    category = 'train';
  } else if (msg.includes('flight') || msg.includes('airline') || msg.includes('plane') || msg.includes('fly')) {
    category = 'flight';
  } else if (msg.includes('bus') || msg.includes('volvo') || msg.includes('sleeper')) {
    category = 'bus';
  }

  let timeFrom, timeTo;
  if (msg.includes('morning')) {
    timeFrom = '06:00';
    timeTo = '12:00';
  } else if (msg.includes('evening')) {
    timeFrom = '17:00';
    timeTo = '21:00';
  }

  if (routeMatch) {
    const rawFrom = routeMatch[1]
      .replace(/\b(?:buses|bus|trains|train|flights|flight|show|find|need|a|i|want|to|go|travel|between)\b/gi, '')
      .trim();
    const rawTo = routeMatch[2]
      .replace(/\b(?:on|tomorrow|today|this|under|below)\b/gi, '')
      .trim();

    const capitalize = (str) =>
      str ? str.charAt(0).toUpperCase() + str.slice(1).toLowerCase() : '';

    const from = capitalize(rawFrom);
    const to = capitalize(rawTo);
    const dateResolved = resolveRelativeDate(msg);
    const maxPrice = maxPriceMatch ? Number(maxPriceMatch[1]) : undefined;

    if (from && to && from.toLowerCase() !== to.toLowerCase()) {
      return {
        intent: 'SEARCH',
        category,
        filters: { from, to, date: dateResolved, timeFrom, timeTo, maxPrice },
        summary: `Found ${category} options from ${from} to ${to}.`,
      };
    }
  }

  // Handle incomplete travel requests (e.g., "I want to travel" or "buses to Hyderabad")
  if (msg.includes('travel') || msg.includes('bus') || msg.includes('train') || msg.includes('flight') || msg.includes('schedule')) {
    const toOnlyMatch = msg.match(/\bto\b\s+([a-zA-Z\s]+?)(?:\s+on|\s+tomorrow|\s+today|\s*$)/i);
    if (toOnlyMatch) {
      const toName = toOnlyMatch[1].replace(/\b(?:travel|go|see|view|find|search)\b/gi, '').trim();
      if (toName) {
        const capTo = toName.charAt(0).toUpperCase() + toName.slice(1).toLowerCase();
        return {
          intent: 'CLARIFICATION_REQUIRED',
          category,
          clarificationQuestion: `I understood that you want to travel to ${capTo}, but I couldn't identify your origin location. Please specify where you are traveling from.`,
          summary: `Please specify your origin location for travel to ${capTo}.`,
        };
      }
    }

    return {
      intent: 'CLARIFICATION_REQUIRED',
      category,
      clarificationQuestion: "Where are you traveling from and to? I couldn't identify the destination. Please select your destination.",
      summary: "I understood that you want to travel, but I couldn't identify the destination. Please select your destination.",
    };
  }

  // Check Events / Sports / Movies
  if (msg.includes('event') || msg.includes('concert') || msg.includes('comedy') || msg.includes('standup')) {
    const cityMatch = msg.match(/in\s+([a-z\s]+?)(?:\s+this|\s+today|\s+tomorrow|$)/i);
    return {
      intent: 'SEARCH',
      category: 'event',
      filters: {
        city: cityMatch ? cityMatch[1].trim() : undefined,
        search: msg.includes('comedy') ? 'comedy' : undefined,
        date: resolveRelativeDate(msg),
      },
      summary: `Found events.`,
    };
  }

  if (msg.includes('movie') || msg.includes('cinema') || msg.includes('film') || msg.includes('imax')) {
    const cityMatch = msg.match(/(?:in|near)\s+([a-z\s]+?)(?:\s+today|\s+tomorrow|$)/i);
    return {
      intent: 'SEARCH',
      category: 'movie',
      filters: {
        city: cityMatch ? cityMatch[1].trim() : undefined,
        date: resolveRelativeDate(msg),
      },
      summary: `Found movies showing in theaters.`,
    };
  }

  if (msg.includes('sport') || msg.includes('match') || msg.includes('cricket') || msg.includes('football')) {
    const cityMatch = msg.match(/in\s+([a-z\s]+?)(?:\s+today|\s+tomorrow|$)/i);
    return {
      intent: 'SEARCH',
      category: 'sports',
      filters: {
        city: cityMatch ? cityMatch[1].trim() : undefined,
        date: resolveRelativeDate(msg),
      },
      summary: `Found sports matches.`,
    };
  }

  // Default Fallback
  return {
    intent: 'GENERAL_SUPPORT',
    summary: "I don't have enough information to answer that accurately. You can try searching by category or specifying dates and locations.",
  };
};

/**
 * Parses user input into a validated structured JSON intent
 */
export const parseStructuredIntent = async (userMessage, options = {}) => {
  if (options.forceFallback) {
    return parseStructuredIntentFallback(userMessage, options.history || []);
  }

  const llmResult = await callAIProvider({
    messages: [{ role: 'user', content: userMessage }],
  });

  if (llmResult.success && llmResult.text) {
    try {
      const rawObj = JSON.parse(llmResult.text);
      const validation = intentSchema.safeParse(rawObj);
      if (validation.success) {
        return validation.data;
      }
    } catch (e) {
      // Ignore JSON parse error and use fallback
    }
  }

  return parseStructuredIntentFallback(userMessage, options.history || []);
};


/**
 * Main Controller Process Function for Chat / Search
 */
export const processAIChat = async ({ userMessage, history = [], user = null }) => {
  if (!userMessage || typeof userMessage !== 'string') {
    return {
      success: false,
      message: "Please enter a valid request.",
    };
  }

  const cleanMessage = userMessage.trim();

  // Try LLM Provider First
  const llmResult = await callAIProvider({
    messages: [
      ...history.map((h) => ({ role: h.role, content: h.content })),
      { role: 'user', content: cleanMessage },
    ],
  });

  let parsedIntent = null;

  if (llmResult.success && llmResult.text) {
    try {
      const rawObj = JSON.parse(llmResult.text);
      const validation = intentSchema.safeParse(rawObj);
      if (validation.success) {
        parsedIntent = validation.data;
      }
    } catch (e) {
      console.warn('[AI Service] LLM returned non-JSON text, falling back to NLP parser.');
    }
  }

  // Fallback to NLP Parser if LLM key unconfigured or failed
  if (!parsedIntent) {
    parsedIntent = parseStructuredIntentFallback(cleanMessage, history.map((h) => h.content));
  }

  // Execute Tool Logic based on validated intent
  let toolResults = null;
  let targetUrl = null;
  let routeObj = null;
  let responseType = 'general';

  if (parsedIntent.intent === 'SEARCH') {
    const cat = parsedIntent.category || 'bus';
    const filters = parsedIntent.filters || {};

    if (filters.from && filters.to) {
      responseType = 'route_search';
      routeObj = {
        source: {
          name: filters.from,
        },
        destination: {
          name: filters.to,
        },
        date: filters.date || resolveRelativeDate(cleanMessage),
        transportType: cat,
      };
    }

    if (cat === 'train') {
      if (filters.from && filters.to) {
        toolResults = await toolSearchTrains(filters);
        targetUrl = `/train?from=${encodeURIComponent(filters.from)}&to=${encodeURIComponent(filters.to)}&date=${encodeURIComponent(filters.date || '')}`;
      } else {
        parsedIntent.intent = 'CLARIFICATION_REQUIRED';
        parsedIntent.clarificationQuestion = 'Where are you traveling from and to?';
      }
    } else if (cat === 'bus') {
      if (filters.from && filters.to) {
        toolResults = await toolSearchBuses(filters);
        targetUrl = `/bus?from=${encodeURIComponent(filters.from)}&to=${encodeURIComponent(filters.to)}&date=${encodeURIComponent(filters.date || '')}`;
      } else {
        toolResults = await toolSearchBuses(filters);
        targetUrl = `/bus`;
      }
    } else if (cat === 'flight') {
      if (filters.from && filters.to) {
        toolResults = await toolSearchFlights(filters);
        targetUrl = `/flights?from=${encodeURIComponent(filters.from)}&to=${encodeURIComponent(filters.to)}&date=${encodeURIComponent(filters.date || '')}`;
      } else {
        toolResults = await toolSearchFlights(filters);
        targetUrl = `/flights`;
      }
    } else if (cat === 'movie') {
      toolResults = await toolSearchMovies(filters);
      targetUrl = `/movies`;
    } else if (cat === 'event') {
      toolResults = await toolSearchEvents(filters);
      targetUrl = `/events`;
    } else if (cat === 'sports') {
      toolResults = await toolSearchSports(filters);
      targetUrl = `/sports`;
    }
  } else if (parsedIntent.intent === 'BOOKING_STATUS') {
    if (!user) {
      return {
        success: true,
        type: 'general',
        intent: 'BOOKING_STATUS',
        requiresAuth: true,
        message: 'Please log in to view your bookings and ticket reservations.',
        summary: 'Authentication required to view personal bookings.',
      };
    }
    toolResults = await toolGetUserBookings({ userId: user._id.toString() });
  }

  const finalSummary = parsedIntent.clarificationQuestion || parsedIntent.summary || `I found ${parsedIntent.category || 'ticket'} options.`;

  return {
    success: true,
    type: responseType,
    intent: parsedIntent.intent,
    category: parsedIntent.category,
    filters: parsedIntent.filters,
    message: finalSummary,
    summary: finalSummary,
    route: routeObj,
    clarificationQuestion: parsedIntent.clarificationQuestion,
    results: toolResults,
    targetUrl,
  };
};

/**
 * Recommendations Generator (Rule-based from User History or Popular Listings)
 */
export const getAIRecommendations = async (user = null) => {
  try {
    let recommendations = [];
    let isPersonalized = false;

    if (user && user._id) {
      const [userWishlist, userBookings] = await Promise.all([
        toolGetUserWishlist({ userId: user._id.toString() }),
        toolGetUserBookings({ userId: user._id.toString() }),
      ]);

      if (userWishlist.length > 0 || userBookings.length > 0) {
        isPersonalized = true;
        const favCategory = userWishlist[0]?.categoryType || userBookings[0]?.categoryType || 'movie';
        const listings = await Listing.find({ categoryType: favCategory, isActive: true })
          .limit(6)
          .lean();

        recommendations = listings.map((l) => ({
          _id: l._id,
          slug: l.slug || l._id,
          title: l.title,
          categoryType: l.categoryType,
          city: l.location?.city || 'All Cities',
          startingPrice: l.pricingTiers?.[0]?.price || 150,
          bannerImage: l.bannerImage || l.images?.[0],
          rating: l.rating || 4.8,
        }));
      }
    }

    if (recommendations.length === 0) {
      const popular = await Listing.find({ isFeatured: true, isActive: true })
        .limit(6)
        .lean();

      recommendations = popular.map((l) => ({
        _id: l._id,
        slug: l.slug || l._id,
        title: l.title,
        categoryType: l.categoryType,
        city: l.location?.city || 'All Cities',
        startingPrice: l.pricingTiers?.[0]?.price || 150,
        bannerImage: l.bannerImage || l.images?.[0],
        rating: l.rating || 4.8,
      }));
    }

    return {
      success: true,
      label: isPersonalized ? 'Recommended for You' : 'Popular on TicketHarbour',
      isPersonalized,
      items: recommendations,
    };
  } catch (err) {
    console.error('Recommendations error:', err);
    return {
      success: false,
      message: 'Unable to retrieve recommendations right now.',
    };
  }
};

/**
 * Read-Only Admin Insights Generator
 */
export const getAIAdminInsights = async (user) => {
  if (!user || (user.role?.toUpperCase() !== 'ADMIN' && user.role?.toUpperCase() !== 'SUPER_ADMIN')) {
    const error = new Error('Access Denied: Administrator privileges required.');
    error.statusCode = 403;
    throw error;
  }

  const role = user.role.toUpperCase();
  const permissions = user.permissions || ['MOVIES', 'EVENTS', 'SPORTS', 'BUS', 'TRAIN', 'FLIGHTS', 'ATTRACTIONS'];
  const isSuperAdmin = role === 'SUPER_ADMIN' || permissions.includes('ALL');

  const allowedCategories = isSuperAdmin
    ? ['movie', 'event', 'sports', 'bus', 'train', 'flight', 'attraction']
    : permissions.map((p) => p.toLowerCase());

  // Aggregate Aggregations
  const [totalBookings, totalRevenue, topRoutes, bookingsByCategory] = await Promise.all([
    Booking.countDocuments({ categoryType: { $in: allowedCategories } }),
    Booking.aggregate([
      { $match: { status: 'confirmed', categoryType: { $in: allowedCategories } } },
      { $group: { _id: null, total: { $sum: '$totalAmount' } } },
    ]),
    SearchLog.aggregate([
      { $match: { categoryType: { $in: allowedCategories } } },
      { $group: { _id: { category: '$categoryType', from: '$from', to: '$to' }, count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 5 },
    ]),
    Booking.aggregate([
      { $match: { categoryType: { $in: allowedCategories } } },
      { $group: { _id: '$categoryType', count: { $sum: 1 }, totalRevenue: { $sum: '$totalAmount' } } },
    ]),
  ]);

  return {
    success: true,
    insights: {
      scope: isSuperAdmin ? 'Global Platform Analytics' : `Permitted Categories (${allowedCategories.join(', ')})`,
      totalBookings,
      totalRevenue: totalRevenue[0]?.total || 0,
      topSearchedRoutes: topRoutes.map((r) => ({
        category: r._id.category,
        route: `${r._id.from} → ${r._id.to}`,
        searchCount: r.count,
      })),
      bookingsByCategory: bookingsByCategory.map((c) => ({
        category: c._id,
        bookingCount: c.count,
        revenue: c.totalRevenue,
      })),
    },
  };
};
