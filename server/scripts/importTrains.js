import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { connectDB } from '../config/db.js';
import Station from '../models/Station.js';
import Train from '../models/Train.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const stationsFilePath = path.join(__dirname, '../data/stations.json');
const trainsFilePath = path.join(__dirname, '../data/trains.json');

const validateStation = (station) => {
  if (!station.stationCode || typeof station.stationCode !== 'string') return 'Missing stationCode';
  if (!station.stationName || typeof station.stationName !== 'string') return 'Missing stationName';
  if (!station.city || typeof station.city !== 'string') return 'Missing city';
  return null;
};

const validateTrain = (train) => {
  if (!train.trainNumber || typeof train.trainNumber !== 'string') return 'Missing trainNumber';
  if (!train.trainName || typeof train.trainName !== 'string') return 'Missing trainName';
  if (!Array.isArray(train.route) || train.route.length < 2) return 'Train route must have at least 2 stations';

  // Validate route order & timings
  for (let i = 0; i < train.route.length; i++) {
    const stop = train.route[i];
    if (!stop.stationCode) return `Route stop at index ${i} missing stationCode`;
    if (i === 0 && !stop.departureTime) return `Source station missing departureTime`;
    if (i === train.route.length - 1 && !stop.arrivalTime) return `Destination station missing arrivalTime`;
  }
  return null;
};

const importData = async () => {
  try {
    await connectDB();
    console.log('--------------------------------------------------');
    console.log('[Import] Connected to MongoDB for Indian Railways Import');

    // 1. Load and Import Stations
    if (!fs.existsSync(stationsFilePath)) {
      throw new Error(`stations.json not found at ${stationsFilePath}`);
    }
    const rawStations = JSON.parse(fs.readFileSync(stationsFilePath, 'utf-8'));
    console.log(`[Import] Read ${rawStations.length} station records from JSON.`);

    const stationOps = [];
    let validStationsCount = 0;
    let invalidStationsCount = 0;

    for (const st of rawStations) {
      const err = validateStation(st);
      if (err) {
        console.warn(`[Import WARNING] Invalid Station ${st.stationCode || 'UNKNOWN'}: ${err}`);
        invalidStationsCount++;
        continue;
      }
      stationOps.push({
        updateOne: {
          filter: { stationCode: st.stationCode.toUpperCase() },
          update: { $set: { ...st, stationCode: st.stationCode.toUpperCase() } },
          upsert: true,
        },
      });
      validStationsCount++;
    }

    if (stationOps.length > 0) {
      const stationResult = await Station.bulkWrite(stationOps);
      console.log(`[Import SUCCESS] Stations bulkWrite completed: ${stationResult.upsertedCount} inserted, ${stationResult.modifiedCount} updated.`);
    }

    // 2. Load and Import Trains
    if (!fs.existsSync(trainsFilePath)) {
      throw new Error(`trains.json not found at ${trainsFilePath}`);
    }
    const rawTrains = JSON.parse(fs.readFileSync(trainsFilePath, 'utf-8'));
    console.log(`[Import] Read ${rawTrains.length} train records from JSON.`);

    const trainOps = [];
    let validTrainsCount = 0;
    let invalidTrainsCount = 0;

    for (const tr of rawTrains) {
      const err = validateTrain(tr);
      if (err) {
        console.warn(`[Import WARNING] Invalid Train ${tr.trainNumber || 'UNKNOWN'}: ${err}`);
        invalidTrainsCount++;
        continue;
      }
      trainOps.push({
        updateOne: {
          filter: { trainNumber: tr.trainNumber.trim() },
          update: { $set: tr },
          upsert: true,
        },
      });
      validTrainsCount++;
    }

    if (trainOps.length > 0) {
      const trainResult = await Train.bulkWrite(trainOps);
      console.log(`[Import SUCCESS] Trains bulkWrite completed: ${trainResult.upsertedCount} inserted, ${trainResult.modifiedCount} updated.`);
    }

    console.log('--------------------------------------------------');
    console.log(`[Import SUMMARY] Valid Stations: ${validStationsCount}, Invalid: ${invalidStationsCount}`);
    console.log(`[Import SUMMARY] Valid Trains: ${validTrainsCount}, Invalid: ${invalidTrainsCount}`);
    console.log('--------------------------------------------------');

    process.exit(0);
  } catch (error) {
    console.error('[Import ERROR] Train data import failed:', error);
    process.exit(1);
  }
};

importData();
