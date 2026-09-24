import React, { useState, useEffect } from 'react';
import API from '../services/api';
import FlightSearch from '../components/flight/FlightSearch';
import FlightCard from '../components/flight/FlightCard';
import FlightFilters from '../components/flight/FlightFilters';
import { CardSkeletonGrid, FlightCardSkeleton } from '../components/loading';
import { Plane, Filter, ArrowUpDown, ChevronLeft, ChevronRight, Layers } from 'lucide-react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { findAirportByInput } from '../data/locationData';
import toast from 'react-hot-toast';

const MOCK_FLIGHTS = [
  // Vijayawada -> Hyderabad
  {
    _id: 'flight-6e-201',
    flightId: 'FL-6E-201',
    slug: 'indigo-vga-hyd-6e201',
    title: 'IndiGo Flight 6E 201',
    categoryType: 'flight',
    rating: 4.8,
    numReviews: 450,
    transitInfo: {
      operator: 'IndiGo',
      number: '6E 201',
      source: 'Vijayawada (VGA)',
      destination: 'Hyderabad (HYD)',
      departureTime: '06:30',
      arrivalTime: '07:30',
      duration: '1h 00m',
      stops: 0,
    },
    pricingTiers: [
      { tierName: 'Economy Saver', price: 3420, totalCapacity: 120 },
      { tierName: 'Flexi Plus', price: 4699, totalCapacity: 30 },
    ],
  },
  {
    _id: 'flight-ai-402',
    flightId: 'FL-AI-402',
    slug: 'air-india-vga-hyd-ai402',
    title: 'Air India Flight AI 402',
    categoryType: 'flight',
    rating: 4.6,
    numReviews: 210,
    transitInfo: {
      operator: 'Air India',
      number: 'AI 402',
      source: 'Vijayawada (VGA)',
      destination: 'Hyderabad (HYD)',
      departureTime: '11:15',
      arrivalTime: '12:20',
      duration: '1h 05m',
      stops: 0,
    },
    pricingTiers: [
      { tierName: 'Economy Standard', price: 3899, totalCapacity: 100 },
      { tierName: 'Business Class', price: 11200, totalCapacity: 12 },
    ],
  },
  {
    _id: 'flight-qp-305',
    flightId: 'FL-QP-305',
    slug: 'akasa-vga-hyd-qp305',
    title: 'Akasa Air Flight QP 305',
    categoryType: 'flight',
    rating: 4.7,
    numReviews: 180,
    transitInfo: {
      operator: 'Akasa Air',
      number: 'QP 305',
      source: 'Vijayawada (VGA)',
      destination: 'Hyderabad (HYD)',
      departureTime: '16:45',
      arrivalTime: '17:50',
      duration: '1h 05m',
      stops: 0,
    },
    pricingTiers: [
      { tierName: 'Saver', price: 3200, totalCapacity: 90 },
    ],
  },
  {
    _id: 'flight-sg-512',
    flightId: 'FL-SG-512',
    slug: 'spicejet-vga-hyd-sg512',
    title: 'SpiceJet Flight SG 512',
    categoryType: 'flight',
    rating: 4.4,
    numReviews: 320,
    transitInfo: {
      operator: 'SpiceJet',
      number: 'SG 512',
      source: 'Vijayawada (VGA)',
      destination: 'Hyderabad (HYD)',
      departureTime: '21:10',
      arrivalTime: '22:15',
      duration: '1h 05m',
      stops: 0,
    },
    pricingTiers: [
      { tierName: 'Economy', price: 2999, totalCapacity: 80 },
    ],
  },

  // Hyderabad -> Vijayawada
  {
    _id: 'flight-6e-202',
    flightId: 'FL-6E-202',
    slug: 'indigo-hyd-vga-6e202',
    title: 'IndiGo Flight 6E 202',
    categoryType: 'flight',
    rating: 4.8,
    numReviews: 510,
    transitInfo: {
      operator: 'IndiGo',
      number: '6E 202',
      source: 'Hyderabad (HYD)',
      destination: 'Vijayawada (VGA)',
      departureTime: '08:15',
      arrivalTime: '09:15',
      duration: '1h 00m',
      stops: 0,
    },
    pricingTiers: [
      { tierName: 'Economy Saver', price: 3350, totalCapacity: 120 },
    ],
  },

  // Delhi -> Mumbai
  {
    _id: 'flight-6e-101',
    flightId: 'FL-6E-101',
    slug: 'indigo-del-bom-6e101',
    title: 'IndiGo Flight 6E 101',
    categoryType: 'flight',
    rating: 4.9,
    numReviews: 1200,
    transitInfo: {
      operator: 'IndiGo',
      number: '6E 101',
      source: 'Delhi (DEL)',
      destination: 'Mumbai (BOM)',
      departureTime: '07:00',
      arrivalTime: '09:10',
      duration: '2h 10m',
      stops: 0,
    },
    pricingTiers: [
      { tierName: 'Economy', price: 4899, totalCapacity: 150 },
    ],
  },
  {
    _id: 'flight-uk-945',
    flightId: 'FL-UK-945',
    slug: 'vistara-del-bom-uk945',
    title: 'Vistara Flight UK 945',
    categoryType: 'flight',
    rating: 4.9,
    numReviews: 890,
    transitInfo: {
      operator: 'Vistara',
      number: 'UK 945',
      source: 'Delhi (DEL)',
      destination: 'Mumbai (BOM)',
      departureTime: '10:30',
      arrivalTime: '12:45',
      duration: '2h 15m',
      stops: 0,
    },
    pricingTiers: [
      { tierName: 'Premium Economy', price: 7450, totalCapacity: 40 },
      { tierName: 'Business Class', price: 18500, totalCapacity: 16 },
    ],
  },

  // Guntur / Vijayawada -> Bengaluru
  {
    _id: 'flight-6e-711',
    flightId: 'FL-6E-711',
    slug: 'indigo-vga-blr-6e711',
    title: 'IndiGo Flight 6E 711',
    categoryType: 'flight',
    rating: 4.7,
    numReviews: 390,
    transitInfo: {
      operator: 'IndiGo',
      number: '6E 711',
      source: 'Vijayawada (VGA)',
      destination: 'Bengaluru (BLR)',
      departureTime: '13:20',
      arrivalTime: '14:35',
      duration: '1h 15m',
      stops: 0,
    },
    pricingTiers: [
      { tierName: 'Economy', price: 4150, totalCapacity: 120 },
    ],
  },

  // Chennai -> Hyderabad
  {
    _id: 'flight-ai-603',
    flightId: 'FL-AI-603',
    slug: 'air-india-maa-hyd-ai603',
    title: 'Air India Flight AI 603',
    categoryType: 'flight',
    rating: 4.6,
    numReviews: 290,
    transitInfo: {
      operator: 'Air India',
      number: 'AI 603',
      source: 'Chennai (MAA)',
      destination: 'Hyderabad (HYD)',
      departureTime: '15:00',
      arrivalTime: '16:15',
      duration: '1h 15m',
      stops: 0,
    },
    pricingTiers: [
      { tierName: 'Economy', price: 3600, totalCapacity: 110 },
    ],
  },

  // Hyderabad -> Delhi
  {
    _id: 'flight-6e-508',
    flightId: 'FL-6E-508',
    slug: 'indigo-hyd-del-6e508',
    title: 'IndiGo Flight 6E 508',
    categoryType: 'flight',
    rating: 4.8,
    numReviews: 670,
    transitInfo: {
      operator: 'IndiGo',
      number: '6E 508',
      source: 'Hyderabad (HYD)',
      destination: 'Delhi (DEL)',
      departureTime: '18:40',
      arrivalTime: '20:55',
      duration: '2h 15m',
      stops: 0,
    },
    pricingTiers: [
      { tierName: 'Saver', price: 5120, totalCapacity: 140 },
    ],
  },

  // Visakhapatnam -> Vijayawada
  {
    _id: 'flight-6e-812',
    flightId: 'FL-6E-812',
    slug: 'indigo-vtz-vga-6e812',
    title: 'IndiGo Flight 6E 812',
    categoryType: 'flight',
    rating: 4.7,
    numReviews: 140,
    transitInfo: {
      operator: 'IndiGo',
      number: '6E 812',
      source: 'Visakhapatnam (VTZ)',
      destination: 'Vijayawada (VGA)',
      departureTime: '09:00',
      arrivalTime: '09:55',
      duration: '0h 55m',
      stops: 0,
    },
    pricingTiers: [
      { tierName: 'Economy', price: 2850, totalCapacity: 90 },
    ],
  },
  {
    _id: 'flight-1stop-901',
    flightId: 'FL-1STOP-901',
    slug: 'air-india-vga-hyd-1stop-ai901',
    title: 'Air India Flight AI 901 (Via Tirupati)',
    categoryType: 'flight',
    rating: 4.3,
    numReviews: 95,
    transitInfo: {
      operator: 'Air India',
      number: 'AI 901',
      source: 'Vijayawada (VGA)',
      destination: 'Hyderabad (HYD)',
      departureTime: '14:00',
      arrivalTime: '17:30',
      duration: '3h 30m',
      stops: 1,
    },
    pricingTiers: [
      { tierName: 'Economy', price: 4900, totalCapacity: 80 },
    ],
  },
];

export default function FlightBookingPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [flights, setFlights] = useState([]);
  const [filteredFlights, setFilteredFlights] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sortBy, setSortBy] = useState('RECOMMENDED');
  const [showMobileFilter, setShowMobileFilter] = useState(false);
  
  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const PAGE_SIZE = 10;

  const [filters, setFilters] = useState({
    stops: 'ALL',
    airlines: [],
    timeSlot: 'ALL',
    maxPrice: 50000,
  });

  const [searchParams] = useSearchParams();

  const urlFrom = searchParams.get('from');
  const urlTo = searchParams.get('to');
  const urlDate = searchParams.get('date');

  useEffect(() => {
    fetchFlights();
  }, [urlFrom, urlTo, urlDate]);

  const fetchFlights = async () => {
    setLoading(true);
    let baseFlights = MOCK_FLIGHTS;
    try {
      const res = await API.get('/listings?categoryType=flight');
      if (res.data.success && res.data.data.listings.length > 0) {
        baseFlights = [...res.data.data.listings, ...MOCK_FLIGHTS];
      }
    } catch (err) {
      console.warn('Backend flight API fallback, using mock Indian flight data', err);
    }

    setFlights(baseFlights);

    if (urlFrom || urlTo) {
      const fromAirportObj = findAirportByInput(urlFrom || 'VGA');
      const toAirportObj = findAirportByInput(urlTo || 'HYD');
      const dateVal = urlDate || new Date().toISOString().split('T')[0];
      handleSearchInternal(baseFlights, { from: fromAirportObj, to: toAirportObj, departureDate: dateVal });
    } else {
      applyFiltersAndSort(baseFlights, filters, sortBy);
      setLoading(false);
    }
  };

  const parseDurationMinutes = (f) => {
    const durStr = f.transitInfo?.duration || '2h 00m';
    const match = durStr.match(/(\d+)h\s*(\d+)?m?/);
    if (match) {
      const hours = parseInt(match[1], 10) || 0;
      const mins = parseInt(match[2], 10) || 0;
      return hours * 60 + mins;
    }
    return 120;
  };

  const getFlightPrice = (f) => {
    return f.pricingTiers?.[0]?.price || 3500;
  };

  const applyFiltersAndSort = (baseList, currentFilters, currentSort) => {
    let result = [...baseList];

    // Source & Destination filtering
    if (urlFrom || urlTo) {
      const fromCode = (urlFrom || '').toLowerCase();
      const toCode = (urlTo || '').toLowerCase();

      result = result.filter((f) => {
        const src = (f.transitInfo?.source || '').toLowerCase();
        const dest = (f.transitInfo?.destination || '').toLowerCase();
        const title = (f.title || '').toLowerCase();

        const matchFrom = !fromCode || src.includes(fromCode) || title.includes(fromCode);
        const matchTo = !toCode || dest.includes(toCode) || title.includes(toCode);

        return matchFrom && matchTo;
      });
      // Fallback if strict route match yields no result
      if (result.length === 0) {
        result = [...baseList];
      }
    }

    // Airline Filter
    if (currentFilters.airlines && currentFilters.airlines.length > 0) {
      result = result.filter((f) =>
        currentFilters.airlines.some((al) =>
          f.transitInfo?.operator?.toLowerCase().includes(al.toLowerCase())
        )
      );
    }

    // Price Filter
    if (currentFilters.maxPrice) {
      result = result.filter((f) => getFlightPrice(f) <= currentFilters.maxPrice);
    }

    // Stops Filter
    if (currentFilters.stops && currentFilters.stops !== 'ALL') {
      if (currentFilters.stops === 'NONSTOP') {
        result = result.filter((f) => (f.transitInfo?.stops || 0) === 0);
      } else if (currentFilters.stops === '1STOP') {
        result = result.filter((f) => (f.transitInfo?.stops || 0) === 1);
      } else if (currentFilters.stops === '2STOP') {
        result = result.filter((f) => (f.transitInfo?.stops || 0) >= 2);
      }
    }

    // Departure Time Filter
    if (currentFilters.timeSlot && currentFilters.timeSlot !== 'ALL') {
      result = result.filter((f) => {
        const dep = f.transitInfo?.departureTime || '10:00';
        const hour = parseInt(dep.split(':')[0], 10);
        if (currentFilters.timeSlot === 'MORNING') return hour >= 6 && hour < 12;
        if (currentFilters.timeSlot === 'AFTERNOON') return hour >= 12 && hour < 18;
        if (currentFilters.timeSlot === 'EVENING') return hour >= 18 && hour < 24;
        if (currentFilters.timeSlot === 'NIGHT') return hour >= 0 && hour < 6;
        return true;
      });
    }

    // Sorting
    if (currentSort === 'CHEAPEST') {
      result.sort((a, b) => getFlightPrice(a) - getFlightPrice(b));
    } else if (currentSort === 'DURATION') {
      result.sort((a, b) => parseDurationMinutes(a) - parseDurationMinutes(b));
    } else if (currentSort === 'EARLIEST') {
      result.sort((a, b) =>
        (a.transitInfo?.departureTime || '').localeCompare(b.transitInfo?.departureTime || '')
      );
    } else if (currentSort === 'LATEST') {
      result.sort((a, b) =>
        (b.transitInfo?.departureTime || '').localeCompare(a.transitInfo?.departureTime || '')
      );
    }

    setFilteredFlights(result);
    setCurrentPage(1);
    setLoading(false);
  };

  const handleSearchInternal = (flightList, searchParams) => {
    setLoading(true);
    setTimeout(() => {
      applyFiltersAndSort(flightList, filters, sortBy);
    }, 200);
  };

  const handleSearch = (searchParams) => {
    handleSearchInternal(flights.length > 0 ? flights : MOCK_FLIGHTS, searchParams);
  };

  const handleFilterChange = (newFilters) => {
    setFilters(newFilters);
    applyFiltersAndSort(flights.length > 0 ? flights : MOCK_FLIGHTS, newFilters, sortBy);
  };

  const handleSortChange = (type) => {
    setSortBy(type);
    applyFiltersAndSort(flights.length > 0 ? flights : MOCK_FLIGHTS, filters, type);
  };

  const handleBookFlight = (flightObj, activeTier) => {
    if (!user) {
      toast.error('Please log in to proceed with flight booking.');
      navigate('/login');
      return;
    }

    const price = activeTier?.price || getFlightPrice(flightObj);
    const flightId = flightObj.flightId || flightObj.id || flightObj._id;

    navigate('/checkout', {
      state: {
        listing: {
          ...flightObj,
          title: flightObj.title || `${flightObj.transitInfo?.operator} Flight ${flightObj.transitInfo?.number}`,
        },
        schedule: {
          _id: `sch-${flightId}-flight`,
          date: urlDate || new Date().toISOString().split('T')[0],
          startTime: flightObj.transitInfo?.departureTime || '06:30',
          price,
        },
        seats: [],
        quantity: 1,
      },
    });
  };

  // Calculate paginated flight items
  const totalResults = filteredFlights.length;
  const totalPages = Math.ceil(totalResults / PAGE_SIZE) || 1;
  const paginatedFlights = filteredFlights.slice(0, currentPage * PAGE_SIZE);

  return (
    <div className="space-y-8 pb-16 max-w-7xl mx-auto">
      <div className="border-b border-white/10 pb-4 space-y-1">
        <h1 className="text-3xl font-black text-white tracking-tight flex items-center gap-3">
          <Plane className="w-8 h-8 text-[#03B3C3] rotate-45" /> Flight Reservation
        </h1>
        <p className="text-xs text-slate-400">
          Book low-cost domestic & international flight tickets with instant confirmation.
        </p>
      </div>

      {/* Search Bar Panel */}
      <section>
        <FlightSearch
          onSearch={handleSearch}
          initialFrom={urlFrom || 'VGA'}
          initialTo={urlTo || 'HYD'}
          initialDate={urlDate}
        />
      </section>

      {/* Mobile Filter Toggle */}
      <div className="flex lg:hidden justify-end">
        <button
          onClick={() => setShowMobileFilter(!showMobileFilter)}
          className="px-4 py-2 bg-gradient-to-r from-[#03B3C3] to-[#6750A2] text-white rounded-xl font-bold text-xs flex items-center gap-2 shadow-lg"
        >
          <Filter className="w-4 h-4" /> {showMobileFilter ? 'Hide Filters' : 'Show Filters'}
        </button>
      </div>

      {/* Main Grid Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Sidebar Filters */}
        <aside className={`lg:col-span-1 ${showMobileFilter ? 'block' : 'hidden lg:block'}`}>
          <FlightFilters
            filters={filters}
            onFilterChange={handleFilterChange}
            resetFilters={() =>
              setFilters({ stops: 'ALL', airlines: [], timeSlot: 'ALL', maxPrice: 50000 })
            }
          />
        </aside>

        {/* Flight Cards List */}
        <main className="lg:col-span-3 space-y-6 relative min-h-[320px]">
          <div className="flex flex-wrap items-center justify-between bg-[#111111] border border-white/10 p-4 rounded-2xl gap-3">
            <div className="flex items-center gap-2">
              <Plane className="w-5 h-5 text-[#03B3C3] rotate-45" />
              <h2 className="font-bold text-white text-sm">
                Available Flights ({totalResults})
              </h2>
            </div>

            {/* Sort Options */}
            <div className="flex flex-wrap items-center gap-2 text-xs font-semibold">
              <span className="text-slate-400 flex items-center gap-1">
                <ArrowUpDown className="w-3.5 h-3.5" /> Sort Fares:
              </span>
              {[
                { key: 'RECOMMENDED', label: 'Recommended' },
                { key: 'CHEAPEST', label: 'Lowest Price' },
                { key: 'DURATION', label: 'Shortest' },
                { key: 'EARLIEST', label: 'Earliest' },
                { key: 'LATEST', label: 'Latest' },
              ].map((s) => (
                <button
                  type="button"
                  key={s.key}
                  onClick={() => handleSortChange(s.key)}
                  className={`px-2.5 py-1 rounded-lg transition-colors ${
                    sortBy === s.key
                      ? 'bg-[#03B3C3]/20 text-[#03B3C3] font-bold border border-[#03B3C3]/30'
                      : 'text-slate-300 hover:text-white'
                  }`}
                >
                  {s.label}
                </button>
              ))}
            </div>
          </div>

          {loading ? (
            <CardSkeletonGrid
              count={4}
              CardSkeletonComponent={FlightCardSkeleton}
              gridClassName="space-y-6"
              ariaLabel="Searching for flight options..."
            />
          ) : filteredFlights.length === 0 ? (
            <div className="text-center py-16 bg-[#111111] border border-white/10 rounded-3xl space-y-3 p-6">
              <p className="text-lg font-bold text-white">
                No flights found for your filter criteria.
              </p>
              <p className="text-xs text-slate-400">
                Try expanding your price range, date, or resetting airline filters.
              </p>
            </div>
          ) : (
            <div className="space-y-6">
              {paginatedFlights.map((f) => (
                <FlightCard
                  key={f._id || f.flightId}
                  flight={f}
                  onSelect={(flightObj, tier) => handleBookFlight(flightObj, tier)}
                />
              ))}

              {/* Pagination & Load More Controls */}
              {totalResults > PAGE_SIZE && (
                <div className="flex flex-col sm:flex-row items-center justify-between p-4 bg-[#111111] border border-white/10 rounded-2xl gap-4">
                  <span className="text-xs text-slate-400 font-medium">
                    Showing <strong className="text-white">{paginatedFlights.length}</strong> of{' '}
                    <strong className="text-white">{totalResults}</strong> flights
                  </span>

                  <div className="flex items-center gap-2">
                    {currentPage < totalPages && (
                      <button
                        type="button"
                        onClick={() => setCurrentPage((prev) => prev + 1)}
                        className="px-4 py-2 bg-[#03B3C3] hover:bg-[#03B3C3]/80 text-white text-xs font-bold rounded-xl transition-all shadow-md"
                      >
                        Load More Flights
                      </button>
                    )}

                    <div className="flex items-center gap-1">
                      <button
                        disabled={currentPage === 1}
                        onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
                        className="p-2 bg-[#181818] border border-white/10 rounded-lg text-slate-300 hover:text-white disabled:opacity-40"
                      >
                        <ChevronLeft className="w-4 h-4" />
                      </button>

                      {Array.from({ length: totalPages }, (_, i) => i + 1).map((pg) => (
                        <button
                          key={pg}
                          onClick={() => setCurrentPage(pg)}
                          className={`w-8 h-8 rounded-lg text-xs font-bold transition-all ${
                            currentPage === pg
                              ? 'bg-[#03B3C3] text-white shadow'
                              : 'bg-[#181818] border border-white/10 text-slate-300 hover:text-white'
                          }`}
                        >
                          {pg}
                        </button>
                      ))}

                      <button
                        disabled={currentPage === totalPages}
                        onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
                        className="p-2 bg-[#181818] border border-white/10 rounded-lg text-slate-300 hover:text-white disabled:opacity-40"
                      >
                        <ChevronRight className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
