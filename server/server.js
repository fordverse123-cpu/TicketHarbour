import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import mongoSanitize from 'express-mongo-sanitize';
import rateLimit from 'express-rate-limit';
import { connectDB } from './config/db.js';
import { errorHandler } from './middleware/errorHandler.js';
import { successResponse } from './utils/apiResponse.js';

import authRoutes from './routes/authRoutes.js';
import userRoutes from './routes/userRoutes.js';
import categoryRoutes from './routes/categoryRoutes.js';
import listingRoutes from './routes/listingRoutes.js';
import scheduleRoutes from './routes/scheduleRoutes.js';
import venueRoutes from './routes/venueRoutes.js';
import bookingRoutes from './routes/bookingRoutes.js';
import paymentRoutes from './routes/paymentRoutes.js';
import couponRoutes from './routes/couponRoutes.js';
import reviewRoutes from './routes/reviewRoutes.js';
import wishlistRoutes from './routes/wishlistRoutes.js';
import adminRoutes from './routes/adminRoutes.js';
import superAdminRoutes from './routes/superAdminRoutes.js';
import trainRoutes from './routes/trainRoutes.js';
import stationRoutes from './routes/stationRoutes.js';
import searchLogRoutes from './routes/searchLogRoutes.js';
import { seedSuperAdmin } from './scripts/seedSuperAdmin.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Connect to MongoDB Database & Seed initial Super Admin
connectDB().then(async () => {
  try {
    await seedSuperAdmin();
  } catch (seedErr) {
    console.warn('[Server Startup Warning] Seed SuperAdmin skipped:', seedErr.message);
  }
}).catch((err) => {
  console.error('[TicketHarbor DB] Database connection error:', err.message);
});

// Security Middleware
app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" }
}));

// CORS Configuration with credential support for Vercel + Render deployment
const allowedOrigins = [
  process.env.CLIENT_URL,
  'https://ticket-harbour.vercel.app',
  'http://localhost:5173',
  'http://localhost:3000',
].filter(Boolean);

app.use(cors({
  origin: function (origin, callback) {
    if (!origin) return callback(null, true);
    if (allowedOrigins.indexOf(origin) !== -1 || origin.endsWith('.vercel.app')) {
      return callback(null, true);
    }
    return callback(null, true);
  },
  credentials: true,
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 300, // limit each IP to 300 requests per windowMs
  message: {
    success: false,
    message: 'Too many requests from this IP, please try again after 15 minutes'
  }
});
app.use('/api', limiter);

// Body and Cookie Parsers
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(cookieParser());

// Data sanitization against NoSQL query injection
app.use(mongoSanitize());

// API Routes
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/users', userRoutes);
app.use('/api/v1/categories', categoryRoutes);
app.use('/api/v1/listings', listingRoutes);
app.use('/api/v1/schedules', scheduleRoutes);
app.use('/api/v1/venues', venueRoutes);
app.use('/api/v1/bookings', bookingRoutes);
app.use('/api/v1/payments', paymentRoutes);
app.use('/api/v1/coupons', couponRoutes);
app.use('/api/v1/reviews', reviewRoutes);
app.use('/api/v1/wishlist', wishlistRoutes);
app.use('/api/v1/admin', adminRoutes);
app.use('/api/admin', adminRoutes); // Direct route alias
app.use('/api/v1/super-admin', superAdminRoutes);
app.use('/api/super-admin', superAdminRoutes); // Alias for flexible API calls

// Indian Railways Train & Station Routes
app.use('/api/v1/trains', trainRoutes);
app.use('/api/trains', trainRoutes); // Route alias for /api/trains/search
app.use('/api/v1/stations', stationRoutes);
app.use('/api/stations', stationRoutes); // Route alias for /api/stations

// Search History, Recent Searches & Popular Routes Analytics Routes
app.use('/api/v1/searches', searchLogRoutes);
app.use('/api/searches', searchLogRoutes);

// Root Welcome Route
app.get('/', (req, res) => {
  return successResponse(res, 200, 'Welcome to TicketHarbor API', {
    app: 'TicketHarbor API Server',
    status: 'healthy',
    version: '1.0.0',
    repository: 'https://github.com/fordverse123-cpu/TicketHarbour',
    healthCheck: '/api/v1/health',
    endpoints: {
      auth: '/api/v1/auth',
      trains: '/api/trains/search',
      stations: '/api/stations/search',
      searches: '/api/searches/recent',
      admin: '/api/admin',
    },
  });
});

// Health Check Route
app.get('/api/v1/health', (req, res) => {
  return successResponse(res, 200, 'TicketHarbor API Server is running', {
    app: 'TicketHarbor',
    status: 'healthy',
    timestamp: new Date().toISOString()
  });
});

// Centralized Error Handling Middleware
app.use(errorHandler);

if (process.env.NODE_ENV !== 'test') {
  app.listen(PORT, () => {
    console.log(`[TicketHarbor Server] Server running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
  });
}

export default app;
