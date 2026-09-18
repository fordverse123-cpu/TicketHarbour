import request from 'supertest';
import app from '../server.js';
import mongoose from 'mongoose';

describe('TicketHarbor Server Setup', () => {
  afterAll(async () => {
    await mongoose.connection.close();
  });

  it('GET /api/v1/health should return 200 OK and healthy status', async () => {
    const res = await request(app).get('/api/v1/health');
    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.message).toContain('TicketHarbor API Server is running');
  });
});
