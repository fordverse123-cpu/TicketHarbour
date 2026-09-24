// Location data for Indian Train Stations, Bus Cities & Terminals, and Airports

export const TRAIN_STATIONS = [
  { code: 'SBC', city: 'Bengaluru', name: 'KSR Bengaluru City Junction', state: 'Karnataka' },
  { code: 'NDLS', city: 'New Delhi', name: 'New Delhi Railway Station', state: 'Delhi' },
  { code: 'MMCT', city: 'Mumbai', name: 'Mumbai Central Railway Station', state: 'Maharashtra' },
  { code: 'MAS', city: 'Chennai', name: 'Chennai Central Railway Station', state: 'Tamil Nadu' },
  { code: 'HWH', city: 'Kolkata', name: 'Howrah Junction', state: 'West Bengal' },
  { code: 'SC', city: 'Hyderabad', name: 'Secunderabad Junction', state: 'Telangana' },
  { code: 'BZA', city: 'Vijayawada', name: 'Vijayawada Junction', state: 'Andhra Pradesh' },
  { code: 'GNT', city: 'Guntur', name: 'Guntur Junction', state: 'Andhra Pradesh' },
  { code: 'VSKP', city: 'Visakhapatnam', name: 'Visakhapatnam Junction', state: 'Andhra Pradesh' },
  { code: 'PUNE', city: 'Pune', name: 'Pune Junction', state: 'Maharashtra' },
  { code: 'ADI', city: 'Ahmedabad', name: 'Ahmedabad Junction', state: 'Gujarat' },
  { code: 'JP', city: 'Jaipur', name: 'Jaipur Junction', state: 'Rajasthan' },
  { code: 'LKO', city: 'Lucknow', name: 'Lucknow Charbagh NR', state: 'Uttar Pradesh' },
  { code: 'CNB', city: 'Kanpur', name: 'Kanpur Central', state: 'Uttar Pradesh' },
  { code: 'GKP', city: 'Gorakhpur', name: 'Gorakhpur Junction', state: 'Uttar Pradesh' },
  { code: 'GHY', city: 'Guwahati', name: 'Guwahati Railway Station', state: 'Assam' },
  { code: 'TVC', city: 'Thiruvananthapuram', name: 'Thiruvananthapuram Central', state: 'Kerala' },
  { code: 'PNBE', city: 'Patna', name: 'Patna Junction', state: 'Bihar' },
  { code: 'MYS', city: 'Mysuru', name: 'Mysuru Junction', state: 'Karnataka' },
  { code: 'NZM', city: 'Delhi', name: 'Hazrat Nizamuddin', state: 'Delhi' },
];

export const BUS_CITIES = [
  { city: 'Mumbai', state: 'Maharashtra', terminals: ['Borivali West', 'Dadar Asiad Bus Stand', 'Thane West', 'Andheri East'] },
  { city: 'Goa', state: 'Goa', terminals: ['Panjim Bus Stand', 'Mapusa Bus Terminal', 'Margao Bus Station'] },
  { city: 'Bengaluru', state: 'Karnataka', terminals: ['KSRTC Majestic', 'Silk Board Junction', 'Electronic City', 'Yeshwantpur'] },
  { city: 'Hyderabad', state: 'Telangana', terminals: ['MGBS Central', 'Hitec City', 'Ameerpet', 'Kukatpally'] },
  { city: 'Delhi', state: 'Delhi', terminals: ['Kashmere Gate ISBT', 'Anand Vihar ISBT', 'Dhaula Kuan'] },
  { city: 'Jaipur', state: 'Rajasthan', terminals: ['Sindhi Camp Bus Stand', '200 Feet Bypass'] },
  { city: 'Chennai', state: 'Tamil Nadu', terminals: ['Koyambedu CMBT', 'Guindy', 'Tambaram'] },
  { city: 'Pune', state: 'Maharashtra', terminals: ['Swargate Bus Stand', 'Shivajinagar', 'Viman Nagar'] },
  { city: 'Ahmedabad', state: 'Gujarat', terminals: ['Geeta Mandir Bus Stand', 'Paldi', 'Satellite'] },
  { city: 'Vijayawada', state: 'Andhra Pradesh', terminals: ['PNBS Bus Complex', 'Benz Circle'] },
  { city: 'Guntur', state: 'Andhra Pradesh', terminals: ['NTR Bus Station', 'Chuttugunta'] },
  { city: 'Visakhapatnam', state: 'Andhra Pradesh', terminals: ['Dwaraka Bus Station (RTC Complex)', 'Maddilapalem'] },
];

export const POPULAR_BUS_ROUTES = [
  { from: 'Mumbai', to: 'Goa', avgTime: '10h 30m', fare: '₹1,250' },
  { from: 'Bengaluru', to: 'Hyderabad', avgTime: '7h 45m', fare: '₹850' },
  { from: 'Delhi', to: 'Jaipur', avgTime: '5h 30m', fare: '₹720' },
  { from: 'Chennai', to: 'Bengaluru', avgTime: '6h 00m', fare: '₹990' },
  { from: 'Pune', to: 'Mumbai', avgTime: '3h 15m', fare: '₹450' },
  { from: 'Vijayawada', to: 'Hyderabad', avgTime: '5h 15m', fare: '₹650' },
];

export const AIRPORTS = [
  { code: 'VGA', city: 'Vijayawada', airport: 'Vijayawada International Airport', country: 'India' },
  { code: 'DEL', city: 'Delhi', airport: 'Indira Gandhi International Airport', country: 'India' },
  { code: 'BOM', city: 'Mumbai', airport: 'Chhatrapati Shivaji Maharaj Airport', country: 'India' },
  { code: 'BLR', city: 'Bengaluru', airport: 'Kempegowda International Airport', country: 'India' },
  { code: 'MAA', city: 'Chennai', airport: 'Chennai International Airport', country: 'India' },
  { code: 'CCU', city: 'Kolkata', airport: 'Netaji Subhash Chandra Bose Airport', country: 'India' },
  { code: 'HYD', city: 'Hyderabad', airport: 'Rajiv Gandhi International Airport', country: 'India' },
  { code: 'GOI', city: 'Goa', airport: 'Dabolim Airport', country: 'India' },
  { code: 'PNQ', city: 'Pune', airport: 'Pune International Airport', country: 'India' },
  { code: 'AMD', city: 'Ahmedabad', airport: 'Sardar Vallabhbhai Patel Airport', country: 'India' },
  { code: 'COK', city: 'Kochi', airport: 'Cochin International Airport', country: 'India' },
  { code: 'IXC', city: 'Chandigarh', airport: 'Chandigarh International Airport', country: 'India' },
  { code: 'VTZ', city: 'Visakhapatnam', airport: 'Visakhapatnam International Airport', country: 'India' },
];

/**
 * Helper to match input station string (code/city/name) to exact TRAIN_STATIONS object
 */
export const findStationByInput = (inputStr) => {
  if (!inputStr || typeof inputStr !== 'string') return null;
  const clean = inputStr.trim().toLowerCase();
  
  // Exact code match
  const byCode = TRAIN_STATIONS.find((s) => s.code.toLowerCase() === clean);
  if (byCode) return byCode;

  // City match
  const byCity = TRAIN_STATIONS.find(
    (s) => s.city.toLowerCase() === clean || s.city.toLowerCase().includes(clean) || clean.includes(s.city.toLowerCase())
  );
  if (byCity) return byCity;

  // Name match
  const byName = TRAIN_STATIONS.find((s) => s.name.toLowerCase().includes(clean));
  if (byName) return byName;

  // Fallback constructed station object preserving clean capitalized name
  const capitalized = inputStr.trim().charAt(0).toUpperCase() + inputStr.trim().slice(1);
  return {
    code: clean.slice(0, 4).toUpperCase(),
    city: capitalized,
    name: `${capitalized} Railway Station`,
    state: 'India',
  };
};

/**
 * Helper to match input bus city string to exact BUS_CITIES object
 */
export const findBusCityByInput = (inputStr) => {
  if (!inputStr || typeof inputStr !== 'string') return null;
  const clean = inputStr.trim().toLowerCase();

  const found = BUS_CITIES.find(
    (c) => c.city.toLowerCase() === clean || c.city.toLowerCase().includes(clean) || clean.includes(c.city.toLowerCase())
  );
  if (found) return found;

  const capitalized = inputStr.trim().charAt(0).toUpperCase() + inputStr.trim().slice(1);
  return {
    city: capitalized,
    state: 'India',
    terminals: [`${capitalized} Central Terminal`],
  };
};

/**
 * Helper to match input airport string (code/city/name) to exact AIRPORTS object
 */
export const findAirportByInput = (inputStr) => {
  if (!inputStr || typeof inputStr !== 'string') return null;
  const clean = inputStr.trim().toLowerCase();

  const byCode = AIRPORTS.find((a) => a.code.toLowerCase() === clean);
  if (byCode) return byCode;

  const byCity = AIRPORTS.find(
    (a) => a.city.toLowerCase() === clean || a.city.toLowerCase().includes(clean) || clean.includes(a.city.toLowerCase())
  );
  if (byCity) return byCity;

  const capitalized = inputStr.trim().charAt(0).toUpperCase() + inputStr.trim().slice(1);
  return {
    code: clean.slice(0, 3).toUpperCase(),
    city: capitalized,
    airport: `${capitalized} Airport`,
    country: 'India',
  };
};
