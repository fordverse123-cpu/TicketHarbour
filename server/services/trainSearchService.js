import Station from '../models/Station.js';
import Train from '../models/Train.js';
import { fetchScheduleTrains } from './trainProvider.js';

const DAYS_OF_WEEK = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];

/**
 * Helper to resolve input string (code/name/city/alias) to an uppercase station code
 */
export const resolveStationCode = async (inputStr) => {
  if (!inputStr || typeof inputStr !== 'string') return null;
  const cleanStr = inputStr.trim().toUpperCase();

  // Direct match by station code
  const exactCodeMatch = await Station.findOne({ stationCode: cleanStr }).lean();
  if (exactCodeMatch) return exactCodeMatch.stationCode;

  // Case-insensitive match by stationName, city, or aliases
  const regex = new RegExp(`^${cleanStr}`, 'i');
  const matchedStation = await Station.findOne({
    active: true,
    $or: [
      { stationCode: regex },
      { stationName: regex },
      { city: regex },
      { aliases: regex },
    ],
  }).lean();

  return matchedStation ? matchedStation.stationCode : cleanStr;
};

/**
 * Calculate journey duration in minutes and format as "XXh YYm"
 */
export const calculateDuration = (fromStop, toStop) => {
  const parseTimeToMinutes = (timeStr) => {
    if (!timeStr) return 0;
    const [hours, minutes] = timeStr.split(':').map(Number);
    return hours * 60 + minutes;
  };

  const depMinutes = parseTimeToMinutes(fromStop.departureTime || fromStop.arrivalTime);
  const arrMinutes = parseTimeToMinutes(toStop.arrivalTime || toStop.departureTime);

  const dayDiff = Math.max(0, (toStop.day || 1) - (fromStop.day || 1));
  const totalDep = depMinutes;
  const totalArr = dayDiff * 1440 + arrMinutes;

  let diffMinutes = totalArr - totalDep;
  if (diffMinutes < 0) diffMinutes += 1440; // Fallback edge case for midnight crossover

  const hrs = Math.floor(diffMinutes / 60);
  const mins = diffMinutes % 60;

  const hrsStr = hrs < 10 ? `0${hrs}` : `${hrs}`;
  const minsStr = mins < 10 ? `0${mins}` : `${mins}`;

  return `${hrsStr}h ${minsStr}m`;
};

/**
 * Search trains by route, order, date, and filters
 */
export const searchTrains = async ({ from, to, date, class: reqClass, quota }) => {
  if (!from || !to) {
    throw new Error('From and To station parameters are required.');
  }

  const fromCode = await resolveStationCode(from);
  const toCode = await resolveStationCode(to);

  if (!fromCode || !toCode) {
    throw new Error('Invalid station code or station not found.');
  }

  if (fromCode === toCode) {
    throw new Error('From and To stations cannot be the same.');
  }

  // Parse Date & Determine Day of Week
  let searchDateObj = new Date();
  if (date) {
    searchDateObj = new Date(date);
    if (isNaN(searchDateObj.getTime())) {
      throw new Error('Invalid date format. Use YYYY-MM-DD.');
    }
  }

  const targetDayOfWeek = DAYS_OF_WEEK[searchDateObj.getUTCDay()];

  // MongoDB Query: Find trains whose route includes both fromCode AND toCode
  const rawTrains = await fetchScheduleTrains({
    active: true,
    'route.stationCode': { $all: [fromCode, toCode] },
  });

  const matchingTrains = [];

  for (const train of rawTrains) {
    const route = train.route || [];

    // Find indices of fromCode and toCode in route array
    const fromIndex = route.findIndex((r) => r.stationCode === fromCode);
    const toIndex = route.findIndex((r) => r.stationCode === toCode);

    // CRITICAL: Ensure From station appears BEFORE To station in travel route
    if (fromIndex === -1 || toIndex === -1 || fromIndex >= toIndex) {
      continue;
    }

    const fromStop = route[fromIndex];
    const toStop = route[toIndex];

    // Running Days Check considering train origin start day offset
    // If train reaches fromStop on Day 2 of its journey, origin started 1 day prior
    const dayOffset = Math.max(0, (fromStop.day || 1) - 1);
    const originDateObj = new Date(searchDateObj);
    originDateObj.setUTCDate(originDateObj.getUTCDate() - dayOffset);
    const originDayOfWeek = DAYS_OF_WEEK[originDateObj.getUTCDay()];

    const runsOnDate = train.runningDays && train.runningDays.includes(originDayOfWeek);
    if (!runsOnDate) {
      continue;
    }

    // Class Filter Check
    if (reqClass && reqClass !== 'ALL') {
      if (!train.classes || !train.classes.includes(reqClass)) {
        continue;
      }
    }

    // Calculate journey duration
    const durationFormatted = calculateDuration(fromStop, toStop);

    // Build clean API response object
    matchingTrains.push({
      _id: train._id,
      trainNumber: train.trainNumber,
      trainName: train.trainName,
      trainType: train.trainType || 'Express',
      zone: train.zone,
      source: train.source,
      destination: train.destination,
      from: {
        stationCode: fromStop.stationCode,
        stationName: fromStop.stationName,
        departure: fromStop.departureTime || fromStop.arrivalTime,
        day: fromStop.day,
      },
      to: {
        stationCode: toStop.stationCode,
        stationName: toStop.stationName,
        arrival: toStop.arrivalTime || toStop.departureTime,
        day: toStop.day,
      },
      duration: durationFormatted,
      classes: train.classes || [],
      runningDays: train.runningDays || [],
      amenities: train.amenities || [],
      route: train.route,
    });
  }

  return {
    success: true,
    count: matchingTrains.length,
    fromStation: fromCode,
    toStation: toCode,
    searchDate: date || searchDateObj.toISOString().split('T')[0],
    trains: matchingTrains,
  };
};
