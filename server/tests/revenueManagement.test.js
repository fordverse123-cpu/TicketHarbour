import request from 'supertest';
import app from '../server.js';
import mongoose from 'mongoose';
import User from '../models/User.js';
import Listing from '../models/Listing.js';
import Category from '../models/Category.js';
import Schedule from '../models/Schedule.js';
import Booking from '../models/Booking.js';
import Transaction from '../models/Transaction.js';
import { generateAccessToken } from '../utils/jwt.js';

describe('Per-Admin Revenue Management System Tests', () => {
  let adminAToken = '', adminAUser = null;
  let adminBToken = '', adminBUser = null;
  let superAdminToken = '', superAdminUser = null;
  let customerToken = '', customerUser = null;

  let categoryDoc = null;
  let listingA = null;
  let listingB = null;
  let scheduleA = null;
  let scheduleB = null;
  let bookingA = null;
  let bookingB = null;

  beforeAll(async () => {
    if (mongoose.connection.readyState !== 1) {
      await new Promise((resolve) => mongoose.connection.once('open', resolve));
    }

    // Clean up test users and data
    await User.deleteMany({ email: { $in: ['adminA_rev@test.com', 'adminB_rev@test.com', 'super_rev@test.com', 'customer_rev@test.com'] } });

    adminAUser = await User.create({
      name: 'Admin Alpha',
      email: 'adminA_rev@test.com',
      password: 'Password123!',
      role: 'ADMIN',
      permissions: ['MOVIES', 'EVENTS'],
      status: 'active',
      isVerified: true,
    });
    adminAToken = generateAccessToken(adminAUser);

    adminBUser = await User.create({
      name: 'Admin Beta',
      email: 'adminB_rev@test.com',
      password: 'Password123!',
      role: 'ADMIN',
      permissions: ['MOVIES', 'EVENTS'],
      status: 'active',
      isVerified: true,
    });
    adminBToken = generateAccessToken(adminBUser);

    superAdminUser = await User.create({
      name: 'Super Admin Revenue',
      email: 'super_rev@test.com',
      password: 'Password123!',
      role: 'SUPER_ADMIN',
      permissions: ['ALL'],
      status: 'active',
      isVerified: true,
    });
    superAdminToken = generateAccessToken(superAdminUser);

    customerUser = await User.create({
      name: 'Customer Buyer',
      email: 'customer_rev@test.com',
      password: 'Password123!',
      role: 'USER',
      status: 'active',
      isVerified: true,
    });
    customerToken = generateAccessToken(customerUser);

    // Create category
    categoryDoc = await Category.findOne({ type: 'movie' });
    if (!categoryDoc) {
      categoryDoc = await Category.create({ name: 'Movies', type: 'movie', icon: 'film' });
    }
  });

  afterAll(async () => {
    if (listingA) await Listing.findByIdAndDelete(listingA._id);
    if (listingB) await Listing.findByIdAndDelete(listingB._id);
    if (scheduleA) await Schedule.findByIdAndDelete(scheduleA._id);
    if (scheduleB) await Schedule.findByIdAndDelete(scheduleB._id);
    if (bookingA) await Booking.findByIdAndDelete(bookingA._id);
    if (bookingB) await Booking.findByIdAndDelete(bookingB._id);
    await Transaction.deleteMany({ adminId: { $in: [adminAUser._id, adminBUser._id] } });
    await User.deleteMany({ email: { $in: ['adminA_rev@test.com', 'adminB_rev@test.com', 'super_rev@test.com', 'customer_rev@test.com'] } });
    await mongoose.connection.close();
  });

  it('1. Admin A creates Listing A and Listing stores createdBy = Admin A ID', async () => {
    const res = await request(app)
      .post('/api/v1/listings')
      .set('Authorization', `Bearer ${adminAToken}`)
      .send({
        title: 'Admin A Exclusive Movie',
        category: categoryDoc._id,
        categoryType: 'movie',
        description: 'Test movie by Admin A',
        pricingTiers: [{ tierName: 'Standard', price: 500, totalCapacity: 100 }],
        location: { city: 'Mumbai', state: 'Maharashtra' },
      });

    expect(res.statusCode).toBe(201);
    expect(res.body.success).toBe(true);
    listingA = res.body.data.listing;
    expect(listingA.createdBy.toString()).toBe(adminAUser._id.toString());
  });

  it('2. Admin B creates Listing B and Listing stores createdBy = Admin B ID', async () => {
    const res = await request(app)
      .post('/api/v1/listings')
      .set('Authorization', `Bearer ${adminBToken}`)
      .send({
        title: 'Admin B Exclusive Event',
        category: categoryDoc._id,
        categoryType: 'event',
        description: 'Test event by Admin B',
        pricingTiers: [{ tierName: 'VIP', price: 1000, totalCapacity: 50 }],
        location: { city: 'Delhi', state: 'Delhi' },
      });

    expect(res.statusCode).toBe(201);
    expect(res.body.success).toBe(true);
    listingB = res.body.data.listing;
    expect(listingB.createdBy.toString()).toBe(adminBUser._id.toString());
  });

  it('3. Customer purchases Listing A -> Booking & Transaction created under Admin A', async () => {
    // Create schedule for listing A
    scheduleA = await Schedule.create({
      listing: listingA._id,
      date: new Date(),
      startTime: '18:00',
      pricing: [{ tierName: 'Standard', price: 500, availableSeats: 50 }],
      seatMap: { bookedSeats: [], lockedSeats: [] },
    });

    const bookingRes = await request(app)
      .post('/api/v1/bookings')
      .set('Authorization', `Bearer ${customerToken}`)
      .send({
        scheduleId: scheduleA._id,
        quantity: 2,
      });

    expect(bookingRes.statusCode).toBe(201);
    bookingA = bookingRes.body.data.booking;
    expect(bookingA.adminId.toString()).toBe(adminAUser._id.toString());

    // Confirm booking payment
    const confirmRes = await request(app)
      .post(`/api/v1/bookings/${bookingA._id}/confirm`)
      .set('Authorization', `Bearer ${customerToken}`)
      .send({ paymentIntentId: 'pi_test_adminA_123' });

    expect(confirmRes.statusCode).toBe(200);

    // Verify transaction
    const tx = await Transaction.findOne({ booking: bookingA._id });
    expect(tx).not.toBeNull();
    expect(tx.adminId.toString()).toBe(adminAUser._id.toString());
    expect(tx.grossRevenue).toBe(bookingA.totalAmount);
    expect(tx.status).toBe('paid');
  });

  it('4. Customer purchases Listing B -> Booking & Transaction created under Admin B', async () => {
    scheduleB = await Schedule.create({
      listing: listingB._id,
      date: new Date(),
      startTime: '20:00',
      pricing: [{ tierName: 'VIP', price: 1000, availableSeats: 50 }],
      seatMap: { bookedSeats: [], lockedSeats: [] },
    });

    const bookingRes = await request(app)
      .post('/api/v1/bookings')
      .set('Authorization', `Bearer ${customerToken}`)
      .send({
        scheduleId: scheduleB._id,
        quantity: 1,
      });

    expect(bookingRes.statusCode).toBe(201);
    bookingB = bookingRes.body.data.booking;
    expect(bookingB.adminId.toString()).toBe(adminBUser._id.toString());

    const confirmRes = await request(app)
      .post(`/api/v1/bookings/${bookingB._id}/confirm`)
      .set('Authorization', `Bearer ${customerToken}`)
      .send({ paymentIntentId: 'pi_test_adminB_456' });

    expect(confirmRes.statusCode).toBe(200);

    const tx = await Transaction.findOne({ booking: bookingB._id });
    expect(tx).not.toBeNull();
    expect(tx.adminId.toString()).toBe(adminBUser._id.toString());
    expect(tx.status).toBe('paid');
  });

  it('5. Admin A querying revenue summary gets ONLY Admin A revenue (isolated from Admin B)', async () => {
    const res = await request(app)
      .get('/api/v1/admin/revenue/summary')
      .set('Authorization', `Bearer ${adminAToken}`);

    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);

    const summary = res.body.data.summary;
    expect(summary.totalGrossRevenue).toBe(bookingA.totalAmount);
    expect(summary.totalTicketsSold).toBe(2);
  });

  it('6. Admin B querying revenue summary gets ONLY Admin B revenue', async () => {
    const res = await request(app)
      .get('/api/v1/admin/revenue/summary')
      .set('Authorization', `Bearer ${adminBToken}`);

    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);

    const summary = res.body.data.summary;
    expect(summary.totalGrossRevenue).toBe(bookingB.totalAmount);
    expect(summary.totalTicketsSold).toBe(1);
  });

  it('7. Admin A cannot modify Admin B\'s listing', async () => {
    const res = await request(app)
      .put(`/api/v1/listings/${listingB._id}`)
      .set('Authorization', `Bearer ${adminAToken}`)
      .send({ title: 'Hacked Title' });

    expect(res.statusCode).toBe(403);
  });

  it('8. Super Admin querying global revenue summary receives combined GMV & per-admin breakdown', async () => {
    const summaryRes = await request(app)
      .get('/api/v1/super-admin/revenue/summary')
      .set('Authorization', `Bearer ${superAdminToken}`);

    expect(summaryRes.statusCode).toBe(200);
    expect(summaryRes.body.data.global.totalGrossRevenue).toBeGreaterThanOrEqual(bookingA.totalAmount + bookingB.totalAmount);

    const breakdownRes = await request(app)
      .get('/api/v1/super-admin/revenue/breakdown')
      .set('Authorization', `Bearer ${superAdminToken}`);

    expect(breakdownRes.statusCode).toBe(200);
    const breakdown = breakdownRes.body.data.breakdown;
    const adminARow = breakdown.find((r) => r._id.toString() === adminAUser._id.toString());
    const adminBRow = breakdown.find((r) => r._id.toString() === adminBUser._id.toString());

    expect(adminARow).toBeDefined();
    expect(adminARow.grossRevenue).toBe(bookingA.totalAmount);
    expect(adminBRow).toBeDefined();
    expect(adminBRow.grossRevenue).toBe(bookingB.totalAmount);
  });

  it('9. Cancelling Admin A\'s booking updates transaction status to refunded', async () => {
    const cancelRes = await request(app)
      .post(`/api/v1/bookings/${bookingA._id}/cancel`)
      .set('Authorization', `Bearer ${customerToken}`);

    expect(cancelRes.statusCode).toBe(200);

    const tx = await Transaction.findOne({ booking: bookingA._id });
    expect(tx.status).toBe('refunded');
  });
});
