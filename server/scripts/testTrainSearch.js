import dotenv from 'dotenv';
import { connectDB } from '../config/db.js';
import { searchTrains } from '../services/trainSearchService.js';
import { recordSearchLog } from '../controllers/searchLogController.js';
import SearchLog from '../models/SearchLog.js';

dotenv.config();

const runTests = async () => {
  await connectDB();
  console.log('==================================================');
  console.log('[TEST] Testing Train Search & Search Analytics Log');
  console.log('==================================================\n');

  // Perform sample search logs
  await recordSearchLog({
    categoryType: 'train',
    from: 'Vijayawada',
    to: 'Hyderabad',
    fromCode: 'BZA',
    toCode: 'SC',
    travelDate: '2026-09-25',
    resultsCount: 3,
  });

  await recordSearchLog({
    categoryType: 'train',
    from: 'Mumbai',
    to: 'Delhi',
    fromCode: 'MMCT',
    toCode: 'NDLS',
    travelDate: '2026-09-25',
    resultsCount: 1,
  });

  const totalLogs = await SearchLog.countDocuments();
  console.log(`[SearchLog Status] Total Search Logs in DB: ${totalLogs}`);

  const recent = await SearchLog.find({ categoryType: 'train' }).sort({ createdAt: -1 }).limit(5).lean();
  console.log('\n📌 Recent Logged Train Searches:');
  recent.forEach((r) => {
    console.log(` - ${r.from} (${r.fromCode || '-'}) ➔ ${r.to} (${r.toCode || '-'}) | Travel Date: ${r.travelDate} | Results: ${r.resultsCount}`);
  });

  console.log('\n==================================================');
  process.exit(0);
};

runTests();
