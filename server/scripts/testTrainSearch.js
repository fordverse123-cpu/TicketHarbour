import dotenv from 'dotenv';
import { connectDB } from '../config/db.js';
import { searchTrains } from '../services/trainSearchService.js';

dotenv.config();

const runTests = async () => {
  await connectDB();
  console.log('==================================================');
  console.log('[TEST] Testing Train Search Service Algorithm');
  console.log('==================================================\n');

  const testCases = [
    { from: 'BZA', to: 'SC', date: '2026-09-25', desc: 'Vijayawada -> Secunderabad' },
    { from: 'SC', to: 'BZA', date: '2026-09-25', desc: 'Secunderabad -> Vijayawada' },
    { from: 'NDLS', to: 'MMCT', date: '2026-09-25', desc: 'Delhi -> Mumbai' },
    { from: 'MMCT', to: 'NDLS', date: '2026-09-25', desc: 'Mumbai -> Delhi' },
    { from: 'MAS', to: 'SBC', date: '2026-09-25', desc: 'Chennai -> Bengaluru' },
    { from: 'SBC', to: 'MAS', date: '2026-09-25', desc: 'Bengaluru -> Chennai' },
  ];

  for (const tc of testCases) {
    console.log(`🔍 SEARCH: ${tc.desc} (${tc.from} -> ${tc.to} on ${tc.date})`);
    try {
      const res = await searchTrains({ from: tc.from, to: tc.to, date: tc.date });
      console.log(`   Result: Found ${res.count} train(s)`);
      res.trains.forEach((t) => {
        console.log(`   - [${t.trainNumber}] ${t.trainName} (${t.from.stationCode} ${t.from.departure} -> ${t.to.stationCode} ${t.to.arrival}, Duration: ${t.duration})`);
      });
    } catch (err) {
      console.error(`   Error:`, err.message);
    }
    console.log('--------------------------------------------------');
  }

  process.exit(0);
};

runTests();
