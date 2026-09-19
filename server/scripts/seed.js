import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from '../models/User.js';
import Category from '../models/Category.js';
import Venue from '../models/Venue.js';
import Listing from '../models/Listing.js';
import Schedule from '../models/Schedule.js';

import { connectDB } from '../config/db.js';

dotenv.config();

const seedData = async () => {
  try {
    await connectDB();
    console.log('[TicketHarbor Seed] Connected to MongoDB...');

    // Clear existing data
    await User.deleteMany({});
    await Category.deleteMany({});
    await Venue.deleteMany({});
    await Listing.deleteMany({});
    await Schedule.deleteMany({});
    console.log('[TicketHarbor Seed] Cleared existing collection data.');

    // 1. Create Users (Admin & Standard User)
    const adminUser = await User.create({
      name: 'TicketHarbor Admin',
      email: 'admin@ticketharbor.com',
      password: 'admin123',
      role: 'ADMIN',
      isVerified: true,
      phone: '+1 800 555 0199',
    });

    const demoUser = await User.create({
      name: 'John Harbor',
      email: 'user@ticketharbor.com',
      password: 'user123',
      role: 'USER',
      isVerified: true,
      phone: '+1 800 555 0188',
    });

    console.log('[TicketHarbor Seed] Created Admin and Demo Users.');

    // 2. Create Categories (All 7 Ticket Categories)
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
    console.log(`[TicketHarbor Seed] Created ${categories.length} Categories.`);

    const catMap = {};
    categories.forEach((c) => {
      catMap[c.type] = c._id;
    });

    // 3. Create Sample Venues
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

    const venues = await Venue.insertMany(venuesData);
    console.log(`[TicketHarbor Seed] Created ${venues.length} Venues.`);

    // 4. Create Listings across all 7 categories
    const listingsData = [
      // 1. Movie
      {
        title: 'Inception: 15th Anniversary IMAX 4K',
        slug: 'inception-15th-anniversary-imax-4k',
        category: catMap['movie'],
        categoryType: 'movie',
        description: 'Experience Christopher Nolan’s mind-bending masterpiece back on the giant IMAX screen in restored 4K HDR audio & visual glory.',
        images: ['https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?auto=format&fit=crop&w=800&q=80'],
        bannerImage: 'https://images.unsplash.com/photo-1536440136628-849c177e76a1?auto=format&fit=crop&w=1200&q=80',
        venue: venues[0]._id,
        location: { city: 'Mumbai', state: 'Maharashtra', country: 'India' },
        rating: 4.9,
        numReviews: 340,
        isFeatured: true,
        pricingTiers: [
          { tierName: 'VIP', price: 450, description: 'Recline seats with in-seat food service', totalCapacity: 24 },
          { tierName: 'Executive', price: 300, description: 'Premium center view seats', totalCapacity: 40 },
          { tierName: 'Standard', price: 200, description: 'Standard theater seating', totalCapacity: 40 },
        ],
      },
      // 2. Event
      {
        title: 'Coldplay: Music of the Spheres World Tour',
        slug: 'coldplay-music-of-the-spheres-world-tour',
        category: catMap['event'],
        categoryType: 'event',
        description: 'Global pop icons Coldplay bring their electrifying light show, hits, and sustainable stadium stage design to Bengaluru!',
        images: ['https://images.unsplash.com/photo-1470225620780-dba8ba36b745?auto=format&fit=crop&w=800&q=80'],
        bannerImage: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&w=1200&q=80',
        venue: venues[2]._id,
        location: { city: 'Bengaluru', state: 'Karnataka', country: 'India' },
        rating: 4.95,
        numReviews: 1250,
        isFeatured: true,
        pricingTiers: [
          { tierName: 'VIP Front Row', price: 8500, description: 'Stage front access & merchandise kit', totalCapacity: 40 },
          { tierName: 'General Admission', price: 3500, description: 'Main lawn admission', totalCapacity: 200 },
        ],
      },
      // 3. Sports
      {
        title: 'Mumbai Indians vs Chennai Super Kings - T20 Thriller',
        slug: 'mumbai-indians-vs-chennai-super-kings-t20-thriller',
        category: catMap['sports'],
        categoryType: 'sports',
        description: 'The ultimate T20 rivalry at Wankhede Stadium. Feel the electrifying crowd energy and witness world-class cricket action.',
        images: ['https://images.unsplash.com/photo-1531415074968-036ba1b575da?auto=format&fit=crop&w=800&q=80'],
        bannerImage: 'https://images.unsplash.com/photo-1540747913346-19e32dc3e97e?auto=format&fit=crop&w=1200&q=80',
        venue: venues[1]._id,
        location: { city: 'Mumbai', state: 'Maharashtra', country: 'India' },
        rating: 4.8,
        numReviews: 890,
        isFeatured: true,
        pricingTiers: [
          { tierName: 'Garware VIP Pavilion', price: 6500, description: 'Air-conditioned box seat with hospitality buffet', totalCapacity: 50 },
          { tierName: 'North Stand', price: 2500, description: 'Lower tier center view', totalCapacity: 120 },
          { tierName: 'Sachin Stand', price: 1200, description: 'Upper tier view', totalCapacity: 150 },
        ],
      },
      // 4. Bus
      {
        title: 'Volvo Multi-Axle AC Sleeper: Mumbai to Goa Express',
        slug: 'volvo-multi-axle-ac-sleeper-mumbai-to-goa-express',
        category: catMap['bus'],
        categoryType: 'bus',
        description: 'Overnight premium coach service with personal TV screens, high-speed Wi-Fi, charging ports, and reading lights.',
        images: ['https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?auto=format&fit=crop&w=800&q=80'],
        bannerImage: 'https://images.unsplash.com/photo-1570125909232-eb263c188f7e?auto=format&fit=crop&w=1200&q=80',
        transitInfo: {
          source: 'Mumbai',
          destination: 'Goa',
          departureTime: '21:00',
          arrivalTime: '08:30 (+1 day)',
          duration: '11h 30m',
          number: 'MH-04-TH-9901',
          operator: 'TicketHarbor Premium Liners',
          busType: 'AC Sleeper (2+1)',
        },
        location: { city: 'Mumbai', state: 'Maharashtra', country: 'India' },
        rating: 4.7,
        numReviews: 210,
        isFeatured: false,
        pricingTiers: [
          { tierName: 'Single Sleeper', price: 1400, description: 'Upper/Lower single berth berth', classType: 'Sleeper', totalCapacity: 15 },
          { tierName: 'Double Sleeper', price: 2600, description: 'Spacious double berth for two', classType: 'Double', totalCapacity: 10 },
        ],
      },
      // 5. Train
      {
        title: 'Rajdhani Express (12951): Mumbai Central to New Delhi',
        slug: 'rajdhani-express-12951-mumbai-central-to-new-delhi',
        category: catMap['train'],
        categoryType: 'train',
        description: 'Premier superfast train service featuring complimentary gourmet meals, clean bedding, and fast schedule.',
        images: ['https://images.unsplash.com/photo-1474487548417-781cb71495f3?auto=format&fit=crop&w=800&q=80'],
        bannerImage: 'https://images.unsplash.com/photo-1515165562839-9784041b4b99?auto=format&fit=crop&w=1200&q=80',
        transitInfo: {
          source: 'Mumbai Central (MMCT)',
          destination: 'New Delhi (NDLS)',
          departureTime: '17:00',
          arrivalTime: '08:32 (+1 day)',
          duration: '15h 32m',
          number: '12951',
          operator: 'Indian Railways Express',
        },
        location: { city: 'Mumbai', state: 'Maharashtra', country: 'India' },
        rating: 4.85,
        numReviews: 620,
        isFeatured: false,
        pricingTiers: [
          { tierName: '1A (First AC)', price: 4800, description: 'Coupe/Cabin with lockable doors', classType: '1A', totalCapacity: 20 },
          { tierName: '2A (Second AC)', price: 2900, description: '4-berth AC bays with privacy curtains', classType: '2A', totalCapacity: 40 },
          { tierName: '3A (Third AC)', price: 2100, description: '6-berth AC bays', classType: '3A', totalCapacity: 60 },
          { tierName: 'SL (Sleeper)', price: 750, description: 'Non-AC sleeper coach', classType: 'SL', totalCapacity: 72 },
        ],
      },
      // 6. Flight
      {
        title: 'Direct Flight AI-502: Delhi to Bengaluru',
        slug: 'direct-flight-ai-502-delhi-to-bengaluru',
        category: catMap['flight'],
        categoryType: 'flight',
        description: 'Seamless non-stop flight with hot meal included, generous baggage allowance, and priority check-in.',
        images: ['https://images.unsplash.com/photo-1436491865332-7a61a109cc05?auto=format&fit=crop&w=800&q=80'],
        bannerImage: 'https://images.unsplash.com/photo-1508672019048-805479767517?auto=format&fit=crop&w=1200&q=80',
        transitInfo: {
          source: 'Delhi (DEL)',
          destination: 'Bengaluru (BLR)',
          departureTime: '06:15',
          arrivalTime: '09:00',
          duration: '2h 45m',
          number: 'AI-502',
          operator: 'Air TicketHarbor',
        },
        location: { city: 'Delhi', state: 'Delhi', country: 'India' },
        rating: 4.6,
        numReviews: 180,
        isFeatured: false,
        pricingTiers: [
          { tierName: 'Economy Standard', price: 5400, description: '15kg check-in + 7kg cabin baggage', classType: 'Economy', totalCapacity: 120 },
          { tierName: 'Business Premier', price: 14500, description: 'Recliner seats, lounge access & priority boarding', classType: 'Business', totalCapacity: 16 },
        ],
      },
      // 7. Attraction
      {
        title: 'Kingdom of Dreams & Amusement Park Day Pass',
        slug: 'kingdom-of-dreams-amusement-park-day-pass',
        category: catMap['attraction'],
        category: catMap['attraction'],
        categoryType: 'attraction',
        description: 'Full-day unlimited access pass to 45+ thrill rides, water slides, cultural shows, and food courts.',
        images: ['https://images.unsplash.com/photo-1513889961551-628c1e5e2ee9?auto=format&fit=crop&w=800&q=80'],
        bannerImage: 'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?auto=format&fit=crop&w=1200&q=80',
        attractionInfo: {
          openingHours: '10:00 AM - 08:00 PM Daily',
          includedServices: ['Unlimited Rides', 'Water Park Access', '4D Cinema Entry', 'Locker Rental'],
          validityDays: 1,
        },
        location: { city: 'Delhi', state: 'Haryana', country: 'India' },
        rating: 4.9,
        numReviews: 540,
        isFeatured: true,
        pricingTiers: [
          { tierName: 'Adult Pass (12+ yrs)', price: 1200, description: 'Full access to all zones', totalCapacity: 300 },
          { tierName: 'Child Pass (3-11 yrs)', price: 800, description: 'Kid-friendly ride access', totalCapacity: 200 },
          { tierName: 'VIP FastPass Ticket', price: 2200, description: 'Skip all ride queues + VIP lounge access', totalCapacity: 50 },
        ],
      },
    ];

    const listings = await Listing.insertMany(listingsData);
    console.log(`[TicketHarbor Seed] Created ${listings.length} Listings.`);

    // 5. Create Schedules for the listings
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const schedulesData = [];

    listings.forEach((listing) => {
      // Create 2 showtime/trip slots for each listing
      schedulesData.push({
        listing: listing._id,
        venue: listing.venue || null,
        date: today,
        startTime: listing.transitInfo?.departureTime || '14:30',
        endTime: listing.transitInfo?.arrivalTime || '17:30',
        pricing: listing.pricingTiers.map((t) => ({
          tierName: t.tierName,
          price: t.price,
          classType: t.classType || '',
          availableSeats: t.totalCapacity || 50,
        })),
        seatMap: {
          bookedSeats: [],
          lockedSeats: [],
        },
      });

      schedulesData.push({
        listing: listing._id,
        venue: listing.venue || null,
        date: tomorrow,
        startTime: listing.transitInfo?.departureTime || '19:30',
        endTime: listing.transitInfo?.arrivalTime || '22:30',
        pricing: listing.pricingTiers.map((t) => ({
          tierName: t.tierName,
          price: t.price,
          classType: t.classType || '',
          availableSeats: t.totalCapacity || 50,
        })),
        seatMap: {
          bookedSeats: [],
          lockedSeats: [],
        },
      });
    });

    const schedules = await Schedule.insertMany(schedulesData);
    console.log(`[TicketHarbor Seed] Created ${schedules.length} Schedules.`);

    console.log('\n==========================================');
    console.log('  TICKETHARBOR DATABASE SEEDED SUCCESSFULLY');
    console.log('==========================================');
    console.log('Admin Account:  admin@ticketharbor.com  / admin123');
    console.log('Demo User:       user@ticketharbor.com   / user123');
    console.log('==========================================\n');

    process.exit(0);
  } catch (error) {
    console.error('[TicketHarbor Seed] Error populating database:', error);
    process.exit(1);
  }
};

seedData();
