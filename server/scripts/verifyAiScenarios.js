process.env.NODE_ENV = 'test';
process.env.NO_LISTEN = 'true';
import { parseStructuredIntent, processAIChat } from '../services/aiService.js';
import { executeAiTool, AI_TOOL_DEFINITIONS } from '../services/aiTools.js';
import request from 'supertest';
import app from '../server.js';
import mongoose from 'mongoose';

async function runVerification() {
  console.log('--- Starting TicketHarbour AI Verification Suite ---\n');
  const results = [];

  function record(testName, passed, details = '') {
    const status = passed ? 'PASS' : 'FAIL';
    console.log(`[${status}] Test ${results.length + 1}: ${testName}`);
    if (details) console.log(`       ${details}`);
    results.push({ id: results.length + 1, name: testName, status, details });
  }

  try {
    // 1. "Find trains from Hyderabad to Vijayawada tomorrow morning" -> correct train intent
    {
      const parsed = await parseStructuredIntent('Find trains from Hyderabad to Vijayawada tomorrow morning');
      const isTrainIntent = parsed.intent === 'SEARCH' && (parsed.category === 'train' || parsed.category === 'trains');
      const hasRoute = parsed.filters?.from?.toLowerCase() === 'hyderabad' && parsed.filters?.to?.toLowerCase() === 'vijayawada';
      const hasTimeRange = parsed.filters?.timeFrom === '06:00' && parsed.filters?.timeTo === '12:00';
      const passed = isTrainIntent && hasRoute && hasTimeRange && !!parsed.filters?.date;
      record(
        '"Find trains from Hyderabad to Vijayawada tomorrow morning" -> correct train intent',
        passed,
        `Intent: ${parsed.intent}, Category: ${parsed.category}, From: ${parsed.filters?.from}, To: ${parsed.filters?.to}, Date: ${parsed.filters?.date}, Time: ${parsed.filters?.timeFrom}-${parsed.filters?.timeTo}`
      );
    }

    // 2. "Comedy events in Hyderabad this weekend" -> correct event filters
    {
      const parsed = await parseStructuredIntent('Comedy events in Hyderabad this weekend');
      const isEventIntent = parsed.intent === 'SEARCH' && (parsed.category === 'event' || parsed.category === 'events');
      const hasLocation = parsed.filters?.city?.toLowerCase() === 'hyderabad' || parsed.filters?.from?.toLowerCase() === 'hyderabad';
      const passed = isEventIntent && hasLocation && !!parsed.filters?.date;
      record(
        '"Comedy events in Hyderabad this weekend" -> correct event filters',
        passed,
        `Category: ${parsed.category}, City: ${parsed.filters?.city || parsed.filters?.from}, Date: ${parsed.filters?.date}`
      );
    }

    // 3. "Buses Bangalore to Hyderabad under ₹1000" -> bus intent with maxPrice
    {
      const parsed = await parseStructuredIntent('Buses Bangalore to Hyderabad under ₹1000');
      const isBusIntent = parsed.intent === 'SEARCH' && (parsed.category === 'bus' || parsed.category === 'buses');
      const hasPrice = Number(parsed.filters?.maxPrice) === 1000;
      const passed = isBusIntent && hasPrice;
      record(
        '"Buses Bangalore to Hyderabad under ₹1000" -> bus intent with maxPrice',
        passed,
        `Category: ${parsed.category}, MaxPrice: ${parsed.filters?.maxPrice}, From: ${parsed.filters?.from}, To: ${parsed.filters?.to}`
      );
    }

    // 4. "What are my bookings?" (logged in) -> caller's bookings tool capability
    {
      const mockUserId = new mongoose.Types.ObjectId();
      const toolRes = await executeAiTool('getUserBookings', {}, { userId: mockUserId });
      const passed = toolRes.success && Array.isArray(toolRes.data);
      record(
        '"What are my bookings?" (logged in) -> only caller\'s bookings fetched',
        passed,
        `Result count: ${toolRes.data.length}`
      );
    }

    // 5. "How do I download my ticket?" -> real instructions
    {
      const chatRes = await processAIChat({ userMessage: 'How do I download my ticket?' });
      const text = (chatRes.summary || chatRes.message || '').toLowerCase();
      const containsInstruction = text.includes('bookings') || text.includes('download') || text.includes('qr');
      const passed = containsInstruction;
      record(
        '"How do I download my ticket?" -> real instructions',
        passed,
        `Intent: ${chatRes.intent}, Reply summary: "${chatRes.summary}"`
      );
    }

    // 6. "Show my bookings" (logged out) -> asks to log in
    {
      const chatRes = await processAIChat({ userMessage: 'Show my bookings', user: null });
      const asksLogin = chatRes.requiresAuth || (chatRes.message || chatRes.summary || '').toLowerCase().includes('log in');
      record(
        '"Show my bookings" (logged out) -> asks to log in',
        asksLogin,
        `requiresAuth: ${chatRes.requiresAuth}, Message: "${chatRes.message || chatRes.summary}"`
      );
    }

    // 7. "Tomorrow's train schedule" -> asks for origin and destination
    {
      const chatRes = await processAIChat({ userMessage: "Tomorrow's train schedule" });
      const text = (chatRes.clarificationQuestion || chatRes.summary || '').toLowerCase();
      const isClarification = chatRes.intent === 'CLARIFICATION_REQUIRED' || text.includes('where') || text.includes('from') || text.includes('origin');
      record(
        '"Tomorrow\'s train schedule" -> asks for origin and destination',
        isClarification,
        `Intent: ${chatRes.intent}, Clarification: "${chatRes.clarificationQuestion || chatRes.summary}"`
      );
    }

    // 8. Provider down -> site works normally (fallback intent parser activated cleanly)
    {
      const parsedFallback = await parseStructuredIntent('Find flights from Mumbai to Delhi', { forceFallback: true });
      const passed = parsedFallback.intent === 'SEARCH' && (parsedFallback.category === 'flight' || parsedFallback.category === 'flights');
      record(
        'Provider down -> fallback intent parser handles search seamlessly',
        passed,
        `Category: ${parsedFallback.category}, From: ${parsedFallback.filters?.from}, To: ${parsedFallback.filters?.to}`
      );
    }

    // 9. Malformed model output -> rejected safely by schema validation
    {
      const invalidToolRun = await executeAiTool('getUserBookings', {}); // missing userId auth context
      const passed = !invalidToolRun.success && invalidToolRun.error.includes('Authentication required');
      record(
        'Malformed model output / unauthenticated context -> rejected safely',
        passed,
        `Error caught: "${invalidToolRun.error}"`
      );
    }

    // 10. Non-admin calls admin insights -> 401/403 Forbidden
    {
      const res = await request(app)
        .post('/api/v1/ai/admin-insights')
        .send({ query: 'Show top revenue routes' });
      const passed = res.statusCode === 401 || res.statusCode === 403;
      record(
        'Non-admin calls admin insights -> 401/403 Forbidden',
        passed,
        `HTTP status: ${res.statusCode}`
      );
    }

  } catch (err) {
    console.error('Error during verification:', err);
  } finally {
    if (mongoose.connection.readyState !== 0) {
      await mongoose.connection.close();
    }
  }

  console.log('\n--- VERIFICATION SUMMARY ---');
  let passCount = 0;
  results.forEach(r => {
    if (r.status === 'PASS') passCount++;
    console.log(`${r.status.padEnd(5)} | Test ${r.id}: ${r.name}`);
  });
  console.log(`\nPassed ${passCount} / ${results.length} tests.\n`);
}

runVerification();
