import Train from '../models/Train.js';
import Station from '../models/Station.js';

/**
 * Train Provider Abstraction Layer
 * Separates static schedule retrieval (MongoDB) from external real-time API integrations.
 * If an authorized railway API becomes available in the future, it can be integrated here.
 */
export const fetchScheduleTrains = async (query) => {
  return await Train.find(query).lean();
};

export const fetchStationData = async (query) => {
  return await Station.find(query).lean();
};

export const enrichWithRealtimeStatus = async (trainResults) => {
  // Placeholder for future live IRCTC / Authorized Railway API enrichment
  return trainResults.map((t) => ({
    ...t,
    isRealTimeEnabled: false,
    liveStatusInfo: 'Scheduled Timetable',
  }));
};
