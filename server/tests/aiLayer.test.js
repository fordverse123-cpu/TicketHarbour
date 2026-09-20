process.env.NODE_ENV = 'test';
process.env.NO_LISTEN = 'true';

import request from 'supertest';
import app from '../server.js';
import mongoose from 'mongoose';
import { parseStructuredIntent, processAIChat } from '../services/aiService.js';
import { executeAiTool } from '../services/aiTools.js';

describe('TicketHarbour AI Production Layer Tests', () => {
  afterAll(async () => {
    if (mongoose.connection.readyState !== 0) {
      await mongoose.connection.close();
    }
  });

  it('1. Should resolve correct train intent for "Find trains from Hyderabad to Vijayawada tomorrow morning"', async () => {
    const parsed = await parseStructuredIntent('Find trains from Hyderabad to Vijayawada tomorrow morning');
    expect(parsed.intent).toBe('SEARCH');
    expect(parsed.category).toBe('train');
    expect(parsed.filters.from.toLowerCase()).toBe('hyderabad');
    expect(parsed.filters.to.toLowerCase()).toBe('vijayawada');
    expect(parsed.filters.timeFrom).toBe('06:00');
    expect(parsed.filters.timeTo).toBe('12:00');
    expect(parsed.filters.date).toBeDefined();
  });

  it('2. Should extract correct event filters for "Comedy events in Hyderabad this weekend"', async () => {
    const parsed = await parseStructuredIntent('Comedy events in Hyderabad this weekend');
    expect(parsed.intent).toBe('SEARCH');
    expect(parsed.category).toBe('event');
    expect(parsed.filters.date).toBeDefined();
  });

  it('3. Should extract bus intent with maxPrice for "Buses Bangalore to Hyderabad under ₹1000"', async () => {
    const parsed = await parseStructuredIntent('Buses Bangalore to Hyderabad under ₹1000');
    expect(parsed.intent).toBe('SEARCH');
    expect(parsed.category).toBe('bus');
    expect(Number(parsed.filters.maxPrice)).toBe(1000);
  });

  it('4. Should fetch only caller\'s bookings when logged in', async () => {
    const mockUserId = new mongoose.Types.ObjectId();
    const toolRes = await executeAiTool('getUserBookings', {}, { userId: mockUserId });
    expect(toolRes.success).toBe(true);
    expect(Array.isArray(toolRes.data)).toBe(true);
  });

  it('5. Should provide real instructions for "How do I download my ticket?"', async () => {
    const chatRes = await processAIChat({ userMessage: 'How do I download my ticket?' });
    const text = (chatRes.summary || chatRes.message || '').toLowerCase();
    expect(text.includes('bookings') || text.includes('download') || text.includes('qr')).toBe(true);
  });

  it('6. Should ask user to log in when logged out for "Show my bookings"', async () => {
    const chatRes = await processAIChat({ userMessage: 'Show my bookings', user: null });
    expect(chatRes.requiresAuth || (chatRes.message || chatRes.summary || '').toLowerCase().includes('log in')).toBe(true);
  });

  it('7. Should request clarification for incomplete train query "Tomorrow\'s train schedule"', async () => {
    const chatRes = await processAIChat({ userMessage: "Tomorrow's train schedule" });
    expect(chatRes.intent).toBe('CLARIFICATION_REQUIRED');
    expect(chatRes.clarificationQuestion).toContain('Where');
  });

  it('8. Should fall back to NLP intent parser cleanly if provider fails', async () => {
    const parsedFallback = await parseStructuredIntent('Find flights from Mumbai to Delhi', { forceFallback: true });
    expect(parsedFallback.intent).toBe('SEARCH');
    expect(parsedFallback.category).toBe('flight');
  });

  it('9. Should reject malformed or unauthenticated tool execution safely', async () => {
    const invalidToolRun = await executeAiTool('getUserBookings', {}); // missing auth context
    expect(invalidToolRun.success).toBe(false);
    expect(invalidToolRun.error).toContain('Authentication required');
  });

  it('10. Should deny non-admin access to admin insights endpoint (401/403)', async () => {
    const res = await request(app)
      .post('/api/v1/ai/admin-insights')
      .send({ query: 'Show top revenue routes' });
    expect([401, 403]).toContain(res.statusCode);
  });
});
