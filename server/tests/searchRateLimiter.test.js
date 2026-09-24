process.env.NODE_ENV = 'test';
process.env.NO_LISTEN = 'true';
process.env.SEARCH_DAILY_LIMIT = '42';

import request from 'supertest';
import app from '../server.js';
import mongoose from 'mongoose';
import { getDailySearchLimit } from '../middleware/searchRateLimiter.js';

describe('Search Daily Rate Limiter (42 searches/day limit)', () => {
  afterAll(async () => {
    if (mongoose.connection.readyState !== 0) {
      await mongoose.connection.close();
    }
  });

  it('1. Should correctly parse daily search limit of 42 from environment', () => {
    expect(getDailySearchLimit()).toBe(42);
  });

  it('2. Should respond to search requests properly', async () => {
    const res = await request(app).get('/api/v1/trains/search?from=BZA&to=SC');
    expect([200, 429]).toContain(res.statusCode);
  });
});
