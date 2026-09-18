import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from '../models/User.js';
import Category from '../models/Category.js';
import Venue from '../models/Venue.js';
import Listing from '../models/Listing.js';
import Schedule from '../models/Schedule.js';
import Coupon from '../models/Coupon.js';
import { connectDB } from '../config/db.js';

dotenv.config();

const seedCleanData = async () => {
  try {
    await connectDB();
    console.log('[TicketHarbor Clean Seed] Connected to MongoDB Atlas...');

    // Clear existing data
    await User.deleteMany({});
    await Category.deleteMany({});
    await Venue.deleteMany({});
    await Listing.deleteMany({});
    await Schedule.deleteMany({});
    await Coupon.deleteMany({});
    console.log('[TicketHarbor Clean Seed] Cleared all legacy test collection data.');

    // 1. Create Production Admin Account
    const adminUser = await User.create({
      name: 'TicketHarbor Admin',
      email: 'admin@ticketharbor.com',
      password: 'admin123',
      role: 'admin',
      isVerified: true,
      phone: '+1 800 555 0199',
    });

    console.log('[TicketHarbor Clean Seed] Created Official Admin Account.');

    // 2. Initialize Core Categories (All 7 Ticket Categories)
    const categoriesData = [
      { name: 'Movies', type: 'movie', slug: 'movies', icon: 'Film', description: 'Blockbuster movies, IMAX screenings & local theaters' },
      { name: 'Events & Concerts', type: 'event', slug: 'events', icon: 'Music', description: 'Live music concerts, festivals & theater performances' },
      { name: 'Sports', type: 'sports', slug: 'sports', icon: 'Trophy', description: 'Stadium matches, cricket, soccer & basketball leagues' },
      { name: 'Bus', type: 'bus', slug: 'bus', icon: 'Bus', description: 'Intercity AC sleepers, luxury Volvo coaches & express routes' },
      { name: 'Train', type: 'train', slug: 'train', icon: 'Train', description: 'High-speed express trains, Sleeper, 3A, 2A & Executive Class' },
      { name: 'Flights', type: 'flight', slug: 'flight', icon: 'Plane', description: 'Domestic & international flights with Economy & Business class' },
      { name: 'Attractions & Parks', type: 'attraction', slug: 'attractions', icon: 'Ticket', description: 'Amusement parks, water parks, museums & city pass passes' },
    ];

    const categories = await Category.insertMany(categoriesData);
    console.log(`[TicketHarbor Clean Seed] Initialized ${categories.length} Core Ticket Categories.`);

    // 3. Create Official Venues
    const venuesData = [
      {
        name: 'PVR Director\'s Cut IMAX',
        city: 'Mumbai',
        state: 'Maharashtra',
        address: 'Palladium Mall, Senapati Bapat Marg, Lower Parel',
        capacity: 120,
        seatConfig: {
          blocks: [
            { name: 'VIP', rows: 3, cols: 8, priceMultiplier: 1.5 },
            { name: 'Executive', rows: 4, cols: 10, priceMultiplier: 1.2 },
            { name: 'Standard', rows: 4, cols: 10, priceMultiplier: 1.0 },
          ],
        },
      },
      {
        name: 'Wankhede Cricket Stadium',
        city: 'Mumbai',
        state: 'Maharashtra',
        address: 'D-Road, Churchgate',
        capacity: 500,
        seatConfig: {
          blocks: [
            { name: 'Garware Pavilion (VIP)', rows: 5, cols: 10, priceMultiplier: 2.5 },
            { name: 'North Stand', rows: 8, cols: 15, priceMultiplier: 1.5 },
            { name: 'Sachin Tendulkar Stand', rows: 10, cols: 15, priceMultiplier: 1.0 },
          ],
        },
      },
      {
        name: 'Grand Arena Dome',
        city: 'Bengaluru',
        state: 'Karnataka',
        address: 'Palace Grounds, Jayamahal Road',
        capacity: 300,
        seatConfig: {
          blocks: [
            { name: 'VIP Front Row', rows: 4, cols: 10, priceMultiplier: 2.0 },
            { name: 'General Admission', rows: 10, cols: 20, priceMultiplier: 1.0 },
          ],
        },
      },
    ];

    await Venue.insertMany(venuesData);
    console.log('[TicketHarbor Clean Seed] Initialized Official Venues.');

    // 4. Create Official Promotional Coupon
    await Coupon.create({
      code: 'HARBOR20',
      discountPercent: 20,
      maxDiscount: 500,
      minBookingAmount: 200,
      validTill: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), // 1 year
      isActive: true,
    });
    console.log('[TicketHarbor Clean Seed] Created Official Coupon HARBOR20.');

    console.log('\n======================================================');
    console.log('  TICKETHARBOR PRODUCTION DATABASE INITIALIZED');
    console.log('======================================================');
    console.log('Admin Account:  admin@ticketharbor.com  / admin123');
    console.log('You can now add real-time ticket listings via Admin Panel');
    console.log('======================================================\n');

    process.exit(0);
  } catch (error) {
    console.error('[TicketHarbor Clean Seed] Error initializing clean database:', error);
    process.exit(1);
  }
};

seedCleanData();
