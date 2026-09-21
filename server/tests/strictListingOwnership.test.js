import request from 'supertest';
import app from '../server.js';
import mongoose from 'mongoose';
import User from '../models/User.js';
import Listing from '../models/Listing.js';
import Category from '../models/Category.js';
import { generateAccessToken } from '../utils/jwt.js';

import { jest } from '@jest/globals';

describe('Strict Admin Listing Ownership Security Tests', () => {
  jest.setTimeout(30000);

  let adminAToken = '', adminAUser = null;
  let adminBToken = '', adminBUser = null;
  let superAdminToken = '', superAdminUser = null;

  let categoryDoc = null;
  let listingA = null;
  let listingB = null;

  beforeAll(async () => {
    if (mongoose.connection.readyState !== 1) {
      await new Promise((resolve) => mongoose.connection.once('open', resolve));
    }

    // Clean up existing test users
    await User.deleteMany({ email: { $in: ['strict_adminA@test.com', 'strict_adminB@test.com', 'strict_super@test.com'] } });

    adminAUser = await User.create({
      name: 'Strict Admin A',
      email: 'strict_adminA@test.com',
      password: 'Password123!',
      role: 'ADMIN',
      permissions: ['MOVIES', 'EVENTS'],
      status: 'active',
      isVerified: true,
    });
    adminAToken = generateAccessToken(adminAUser);

    adminBUser = await User.create({
      name: 'Strict Admin B',
      email: 'strict_adminB@test.com',
      password: 'Password123!',
      role: 'ADMIN',
      permissions: ['MOVIES', 'EVENTS'],
      status: 'active',
      isVerified: true,
    });
    adminBToken = generateAccessToken(adminBUser);

    superAdminUser = await User.create({
      name: 'Strict Super Admin',
      email: 'strict_super@test.com',
      password: 'Password123!',
      role: 'SUPER_ADMIN',
      permissions: ['ALL'],
      status: 'active',
      isVerified: true,
    });
    superAdminToken = generateAccessToken(superAdminUser);

    categoryDoc = await Category.findOne({ type: 'movie' });
    if (!categoryDoc) {
      categoryDoc = await Category.create({ name: 'Movies', type: 'movie', icon: 'film' });
    }
  });

  afterAll(async () => {
    if (listingA) await Listing.findByIdAndDelete(listingA._id);
    if (listingB) await Listing.findByIdAndDelete(listingB._id);
    await User.deleteMany({ email: { $in: ['strict_adminA@test.com', 'strict_adminB@test.com', 'strict_super@test.com'] } });
    await mongoose.connection.close();
  });

  it('1. Admin A creates Listing A -> createdBy is automatically set to Admin A ID', async () => {
    const res = await request(app)
      .post('/api/v1/listings')
      .set('Authorization', `Bearer ${adminAToken}`)
      .send({
        title: 'Listing Owned By Admin A',
        category: categoryDoc._id,
        categoryType: 'movie',
        description: 'Listing created by Admin A',
        pricingTiers: [{ tierName: 'Standard', price: 300, totalCapacity: 100 }],
        location: { city: 'Mumbai', state: 'Maharashtra' },
      });

    expect(res.statusCode).toBe(201);
    listingA = res.body.data.listing;
    expect(listingA.createdBy.toString()).toBe(adminAUser._id.toString());
  });

  it('2. Admin B creates Listing B -> createdBy is automatically set to Admin B ID', async () => {
    const res = await request(app)
      .post('/api/v1/listings')
      .set('Authorization', `Bearer ${adminBToken}`)
      .send({
        title: 'Listing Owned By Admin B',
        category: categoryDoc._id,
        categoryType: 'event',
        description: 'Listing created by Admin B',
        pricingTiers: [{ tierName: 'VIP', price: 800, totalCapacity: 50 }],
        location: { city: 'Delhi', state: 'Delhi' },
      });

    expect(res.statusCode).toBe(201);
    listingB = res.body.data.listing;
    expect(listingB.createdBy.toString()).toBe(adminBUser._id.toString());
  });

  it('3. Admin A can successfully update Listing A', async () => {
    const res = await request(app)
      .put(`/api/v1/listings/${listingA._id}`)
      .set('Authorization', `Bearer ${adminAToken}`)
      .send({
        title: 'Updated Title By Owner Admin A',
      });

    expect(res.statusCode).toBe(200);
    expect(res.body.data.listing.title).toBe('Updated Title By Owner Admin A');
  });

  it('4. Admin A CANNOT update Listing B -> Returns HTTP 403 Forbidden', async () => {
    const res = await request(app)
      .put(`/api/v1/listings/${listingB._id}`)
      .set('Authorization', `Bearer ${adminAToken}`)
      .send({
        title: 'Malicious Cross-Admin Update',
      });

    expect(res.statusCode).toBe(403);
    expect(res.body.success).toBe(false);
    expect(res.body.message).toMatch(/authorized/i);
  });

  it('5. Admin A CANNOT delete Listing B -> Returns HTTP 403 Forbidden', async () => {
    const res = await request(app)
      .delete(`/api/v1/listings/${listingB._id}`)
      .set('Authorization', `Bearer ${adminAToken}`);

    expect(res.statusCode).toBe(403);
    expect(res.body.success).toBe(false);
    expect(res.body.message).toMatch(/authorized/i);
  });

  it('6. Admin A cannot transfer ownership by passing createdBy in PUT payload', async () => {
    const res = await request(app)
      .put(`/api/v1/listings/${listingA._id}`)
      .set('Authorization', `Bearer ${adminAToken}`)
      .send({
        title: 'Title Attempting Ownership Transfer',
        createdBy: adminBUser._id.toString(),
      });

    expect(res.statusCode).toBe(200);
    // Verify createdBy was stripped and remains Admin A
    const updated = await Listing.findById(listingA._id);
    expect(updated.createdBy.toString()).toBe(adminAUser._id.toString());
  });

  it('7. Admin A calling /api/v1/listings/admin receives ONLY Listing A', async () => {
    const res = await request(app)
      .get('/api/v1/listings/admin')
      .set('Authorization', `Bearer ${adminAToken}`);

    expect(res.statusCode).toBe(200);
    const listings = res.body.data.listings;
    const hasA = listings.some((l) => l._id.toString() === listingA._id.toString());
    const hasB = listings.some((l) => l._id.toString() === listingB._id.toString());

    expect(hasA).toBe(true);
    expect(hasB).toBe(false);
  });

  it('8. Admin B calling /api/v1/listings/admin receives ONLY Listing B', async () => {
    const res = await request(app)
      .get('/api/v1/listings/admin')
      .set('Authorization', `Bearer ${adminBToken}`);

    expect(res.statusCode).toBe(200);
    const listings = res.body.data.listings;
    const hasA = listings.some((l) => l._id.toString() === listingA._id.toString());
    const hasB = listings.some((l) => l._id.toString() === listingB._id.toString());

    expect(hasA).toBe(false);
    expect(hasB).toBe(true);
  });

  it('9. Super Admin calling /api/v1/listings/admin receives all listings', async () => {
    const res = await request(app)
      .get('/api/v1/listings/admin')
      .set('Authorization', `Bearer ${superAdminToken}`);

    expect(res.statusCode).toBe(200);
    const listings = res.body.data.listings;
    const hasA = listings.some((l) => l._id.toString() === listingA._id.toString());
    const hasB = listings.some((l) => l._id.toString() === listingB._id.toString());

    expect(hasA).toBe(true);
    expect(hasB).toBe(true);
  });

  it('10. Super Admin CAN update and delete any admin listing', async () => {
    const updateRes = await request(app)
      .put(`/api/v1/listings/${listingA._id}`)
      .set('Authorization', `Bearer ${superAdminToken}`)
      .send({
        title: 'Super Admin Override Title',
      });

    expect(updateRes.statusCode).toBe(200);
    expect(updateRes.body.data.listing.title).toBe('Super Admin Override Title');
  });
});
