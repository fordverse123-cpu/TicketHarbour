process.env.NODE_ENV = 'test';
process.env.NO_LISTEN = 'true';

import { parseStructuredIntentFallback, processAIChat } from '../services/aiService.js';
import { connectDB } from '../config/db.js';
import mongoose from 'mongoose';

describe('TicketHarbour AI Assistant Structured Route Search Integration Tests', () => {
  beforeAll(async () => {
    await connectDB();
  });

  afterAll(async () => {
    if (mongoose.connection.readyState !== 0) {
      await mongoose.connection.close();
    }
  });

  it('1. Should extract structured route for "buses from Vijayawada to Hyderabad"', async () => {
    const parsed = parseStructuredIntentFallback('buses from Vijayawada to Hyderabad');
    expect(parsed.intent).toBe('SEARCH');
    expect(parsed.category).toBe('bus');
    expect(parsed.filters.from).toBe('Vijayawada');
    expect(parsed.filters.to).toBe('Hyderabad');
  });

  it('2. Should extract structured route for "trains from Guntur to Chennai"', async () => {
    const parsed = parseStructuredIntentFallback('trains from Guntur to Chennai');
    expect(parsed.intent).toBe('SEARCH');
    expect(parsed.category).toBe('train');
    expect(parsed.filters.from).toBe('Guntur');
    expect(parsed.filters.to).toBe('Chennai');
  });

  it('3. Should extract structured route for "flights from Hyderabad to Delhi"', async () => {
    const parsed = parseStructuredIntentFallback('flights from Hyderabad to Delhi');
    expect(parsed.intent).toBe('SEARCH');
    expect(parsed.category).toBe('flight');
    expect(parsed.filters.from).toBe('Hyderabad');
    expect(parsed.filters.to).toBe('Delhi');
  });

  it('4. Should extract date and locations for "show buses from Vijayawada to Visakhapatnam tomorrow"', async () => {
    const parsed = parseStructuredIntentFallback('show buses from Vijayawada to Visakhapatnam tomorrow');
    expect(parsed.intent).toBe('SEARCH');
    expect(parsed.category).toBe('bus');
    expect(parsed.filters.from).toBe('Vijayawada');
    expect(parsed.filters.to).toBe('Visakhapatnam');
    expect(parsed.filters.date).toBeDefined();
  });

  it('5. Should extract specific date for "I need a bus from Hyderabad to Vijayawada on October 5"', async () => {
    const parsed = parseStructuredIntentFallback('I need a bus from Hyderabad to Vijayawada on October 5');
    expect(parsed.intent).toBe('SEARCH');
    expect(parsed.category).toBe('bus');
    expect(parsed.filters.from).toBe('Hyderabad');
    expect(parsed.filters.to).toBe('Vijayawada');
    expect(parsed.filters.date).toContain('-10-05');
  });

  it('6. Should return structured type="route_search" payload from processAIChat', async () => {
    const res = await processAIChat({ userMessage: 'Buses from Vijayawada to Hyderabad' });
    expect(res.success).toBe(true);
    expect(res.type).toBe('route_search');
    expect(res.route).toBeDefined();
    expect(res.route.source.name).toBe('Vijayawada');
    expect(res.route.destination.name).toBe('Hyderabad');
    expect(res.route.transportType).toBe('bus');
    expect(res.targetUrl).toContain('/bus?from=Vijayawada&to=Hyderabad');
  });

  it('7. Should return clarification question when destination is missing', async () => {
    const res = await processAIChat({ userMessage: 'I want to travel' });
    expect(res.success).toBe(true);
    expect(res.type).toBe('general');
    expect(res.intent).toBe('CLARIFICATION_REQUIRED');
    expect(res.clarificationQuestion).toContain("couldn't identify the destination");
  });
});
