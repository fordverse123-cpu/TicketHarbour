import { successResponse, errorResponse } from '../utils/apiResponse.js';
import {
  processAIChat,
  getAIRecommendations,
  getAIAdminInsights,
} from '../services/aiService.js';
import { SUPPORT_KNOWLEDGE_BASE } from '../services/aiPrompts.js';

/**
 * @desc    Main AI Chat & Query Endpoint
 * @route   POST /api/v1/ai/chat or POST /api/ai/chat
 * @access  Public (Optional Auth)
 */
export const handleAIChat = async (req, res, next) => {
  try {
    const { message, history = [] } = req.body;

    if (!message || typeof message !== 'string' || !message.trim()) {
      return errorResponse(res, 400, 'Please provide a non-empty message string.');
    }

    // Limit context length & message length for cost & security safety
    const cleanMessage = message.trim().slice(0, 500);
    const limitedHistory = Array.isArray(history) ? history.slice(-6) : [];

    const result = await processAIChat({
      userMessage: cleanMessage,
      history: limitedHistory,
      user: req.user || null,
    });

    return successResponse(res, 200, 'AI response processed', result);
  } catch (error) {
    console.error('[AI Chat Error]:', error);
    return successResponse(res, 200, 'AI response fallback', {
      success: true,
      intent: 'GENERAL_SUPPORT',
      summary: 'TicketHarbour AI is temporarily unavailable. You can continue using normal search.',
      fallback: true,
    });
  }
};

/**
 * @desc    Natural Language Search Parser Endpoint
 * @route   POST /api/v1/ai/search or POST /api/ai/search
 * @access  Public
 */
export const handleAISearch = async (req, res, next) => {
  try {
    const { query } = req.body;
    if (!query) {
      return errorResponse(res, 400, 'Please provide a search query.');
    }

    const result = await processAIChat({
      userMessage: query,
      history: [],
      user: req.user || null,
    });

    return successResponse(res, 200, 'AI search intent parsed', result);
  } catch (error) {
    console.error('[AI Search Error]:', error);
    return successResponse(res, 200, 'AI search fallback', {
      success: true,
      intent: 'SEARCH',
      summary: 'Unable to retrieve ticket information right now. Please try again.',
      fallback: true,
    });
  }
};

/**
 * @desc    AI Support Assistant Endpoint
 * @route   POST /api/v1/ai/support or POST /api/ai/support
 * @access  Public
 */
export const handleAISupport = async (req, res, next) => {
  try {
    const { question } = req.body;
    const lower = (question || '').toLowerCase();

    let answer = 'You can browse tickets by selecting a category on the homepage, choose your journey date, select seats, and complete secure checkout.';

    if (lower.includes('download') || lower.includes('pdf')) {
      answer = SUPPORT_KNOWLEDGE_BASE.ticketDownload;
    } else if (lower.includes('cancel') || lower.includes('refund')) {
      answer = SUPPORT_KNOWLEDGE_BASE.cancellation;
    } else if (lower.includes('password') || lower.includes('reset') || lower.includes('account')) {
      answer = SUPPORT_KNOWLEDGE_BASE.accountAndPassword;
    } else if (lower.includes('payment') || lower.includes('failed') || lower.includes('deducted')) {
      answer = SUPPORT_KNOWLEDGE_BASE.paymentIssues;
    } else if (lower.includes('qr') || lower.includes('gate') || lower.includes('entry')) {
      answer = SUPPORT_KNOWLEDGE_BASE.qrEntryGate;
    }

    return successResponse(res, 200, 'Support response generated', {
      success: true,
      question,
      answer,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    AI Booking Assistant Endpoint (Requires User Auth)
 * @route   POST /api/v1/ai/booking-assistant or POST /api/ai/booking-assistant
 * @access  Private (Authenticated User Only)
 */
export const handleAIBookingAssistant = async (req, res, next) => {
  try {
    if (!req.user) {
      return errorResponse(res, 401, 'Please log in to view and ask about your personal bookings.');
    }

    const { message = 'What are my bookings?' } = req.body;

    const result = await processAIChat({
      userMessage: message,
      history: [],
      user: req.user,
    });

    return successResponse(res, 200, 'User booking assistant response', result);
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    AI Recommendations Endpoint
 * @route   GET /api/v1/ai/recommendations or GET /api/ai/recommendations
 * @access  Public (Optional Auth)
 */
export const handleAIRecommendations = async (req, res, next) => {
  try {
    const result = await getAIRecommendations(req.user || null);
    return successResponse(res, 200, 'Recommendations fetched', result);
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    AI Admin Insights Endpoint (Requires Admin Authorization)
 * @route   POST /api/v1/ai/admin-insights or POST /api/ai/admin-insights
 * @access  Private (Admin & Super Admin Only)
 */
export const handleAIAdminInsights = async (req, res, next) => {
  try {
    if (!req.user) {
      return errorResponse(res, 401, 'Authentication required');
    }

    const role = req.user.role ? req.user.role.toUpperCase() : '';
    if (role !== 'ADMIN' && role !== 'SUPER_ADMIN') {
      return errorResponse(res, 403, 'Access Denied: Administrator privileges required.');
    }

    const result = await getAIAdminInsights(req.user);
    return successResponse(res, 200, 'Admin insights fetched', result);
  } catch (error) {
    if (error.statusCode === 403) {
      return errorResponse(res, 403, error.message);
    }
    next(error);
  }
};
