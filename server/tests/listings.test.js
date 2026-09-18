import request from 'supertest';
import app from '../server.js';
import mongoose from 'mongoose';

describe('Categories & Listings API Endpoints', () => {
  afterAll(async () => {
    await mongoose.connection.close();
  });

  it('GET /api/v1/categories should return all categories', async () => {
    const res = await request(app).get('/api/v1/categories');
    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.data.categories)).toBe(true);
  });

  it('GET /api/v1/listings should return paginated listings', async () => {
    const res = await request(app).get('/api/v1/listings');
    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.data.listings)).toBe(true);
  });
});
