import React, { useState, useEffect } from 'react';
import API from '../services/api';
import FlightSearch from '../components/flight/FlightSearch';
import FlightCard from '../components/flight/FlightCard';
import FlightFilters from '../components/flight/FlightFilters';
import SkeletonLoader from '../components/common/SkeletonLoader';
import { Plane, RefreshCw, Filter, ArrowUpDown } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

const MOCK_FLIGHTS = [
  {
    _id: 'flight-6e-1234',
    slug: 'indigo-vga-del-6e1234',
    title: 'IndiGo Flight 6E 1234',
    categoryType: 'flight',
    rating: 4.7,
    numReviews: 890,
    transitInfo: {
      operator: 'IndiGo',
      number: '6E 1234',
      source: 'Vijayawada (VGA)',
      destination: 'Delhi (DEL)',
      departureTime: '10:30',
      arrivalTime: '13:05',
      duration: '2h 35m',
    },
    pricingTiers: [
      { tierName: 'Economy Saver', price: 5499, totalCapacity: 120 },
      { tierName: 'Flexi Plus', price: 6899, totalCapacity: 30 },
    ],
  },
  {
    _id: 'flight-ai-505',
    slug: 'air-india-bom-blr-ai505',
    title: 'Air India Flight AI 505',
    categoryType: 'flight',
    rating: 4.6,
    numReviews: 640,
    transitInfo: {
      operator: 'Air India',
      number: 'AI 505',
      source: 'Mumbai (BOM)',
      destination: 'Bengaluru (BLR)',
      departureTime: '08:15',
      arrivalTime: '10:00',
      duration: '1h 45m',
    },
    pricingTiers: [
      { tierName: 'Economy', price: 4200, totalCapacity: 100 },
      { tierName: 'Business Class', price: 14500, totalCapacity: 12 },
    ],
  },
  {
    _id: 'flight-qp-1102',
    slug: 'akasa-air-del-bom-qp1102',
    title: 'Akasa Air Flight QP 1102',
    categoryType: 'flight',
    rating: 4.8,
    numReviews: 310,
    transitInfo: {
      operator: 'Akasa Air',
      number: 'QP 1102',
      source: 'Delhi (DEL)',
      destination: 'Mumbai (BOM)',
      departureTime: '15:40',
      arrivalTime: '17:55',
      duration: '2h 15m',
    },
    pricingTiers: [
      { tierName: 'Saver', price: 4999, totalCapacity: 90 },
      { tierName: 'Flexi', price: 6200, totalCapacity: 20 },
    ],
  },
  {
    _id: 'flight-sg-819',
    slug: 'spicejet-hyd-maa-sg819',
    title: 'SpiceJet Flight SG 819',
    categoryType: 'flight',
    rating: 4.3,
    numReviews: 420,
    transitInfo: {
      operator: 'SpiceJet',
      number: 'SG 819',
      source: 'Hyderabad (HYD)',
      destination: 'Chennai (MAA)',
      departureTime: '19:10',
      arrivalTime: '20:30',
      duration: '1h 20m',
    },
    pricingTiers: [
      { tierName: 'Standard', price: 3499, totalCapacity: 80 },
    ],
  },
];

export default function FlightBookingPage() {
  const navigate = useNavigate();
  const [flights, setFlights] = useState([]);
  const [filteredFlights, setFilteredFlights] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sortBy, setSortBy] = useState('CHEAPEST');
  const [showMobileFilter, setShowMobileFilter] = useState(false);
  const [filters, setFilters] = useState({
    stops: 'ALL',
    airlines: [],
    cabinClass: 'ALL',
  });

  useEffect(() => {
    fetchFlights();
  }, []);

  const fetchFlights = async () => {
    setLoading(true);
    try {
      const res = await API.get('/listings?categoryType=flight');
      if (res.data.success && res.data.data.listings.length > 0) {
        setFlights(res.data.data.listings);
        setFilteredFlights(res.data.data.listings);
      } else {
        setFlights(MOCK_FLIGHTS);
        setFilteredFlights(MOCK_FLIGHTS);
      }
    } catch (err) {
      console.warn('Backend flight API empty, loading standard Indian Air routes', err);
      setFlights(MOCK_FLIGHTS);
      setFilteredFlights(MOCK_FLIGHTS);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (searchParams) => {
    setLoading(true);
    setTimeout(() => {
      let result = [...flights];
      if (searchParams.from?.code && searchParams.to?.code) {
        result = result.filter(
          (f) =>
            f.transitInfo?.source?.includes(searchParams.from.code) ||
            f.transitInfo?.destination?.includes(searchParams.to.code) ||
            f.transitInfo?.source?.toLowerCase().includes(searchParams.from.city.toLowerCase())
        );
      }
      setFilteredFlights(result.length > 0 ? result : MOCK_FLIGHTS);
      setLoading(false);
    }, 400);
  };

  const handleFilterChange = (newFilters) => {
    setFilters(newFilters);
    let result = [...flights];
    if (newFilters.airlines && newFilters.airlines.length > 0) {
      result = result.filter((f) => newFilters.airlines.includes(f.transitInfo?.operator));
    }
    setFilteredFlights(result);
  };

  const handleSortChange = (type) => {
    setSortBy(type);
    let sorted = [...filteredFlights];
    if (type === 'CHEAPEST') {
      sorted.sort((a, b) => (a.pricingTiers?.[0]?.price || 0) - (b.pricingTiers?.[0]?.price || 0));
    } else if (type === 'DEPARTURE') {
      sorted.sort((a, b) => (a.transitInfo?.departureTime || '').localeCompare(b.transitInfo?.departureTime || ''));
    }
    setFilteredFlights(sorted);
  };

  const handleBookFlight = (flightObj, activeTier) => {
    if (!user) {
      toast.error('Please log in to proceed with flight booking.');
      navigate('/login');
      return;
    }

    const price = activeTier?.price || flightObj.pricingTiers?.[0]?.price || 5499;

    navigate('/checkout', {
      state: {
        listing: flightObj,
        schedule: {
          _id: `sch-${flightObj._id}-flight`,
          date: new Date().toISOString().split('T')[0],
          startTime: flightObj.transitInfo?.departureTime || '10:30',
          price,
        },
        seats: [],
        quantity: 1,
      },
    });
  };

  return (
    <div className="space-y-8 pb-16">
      <div className="border-b border-white/10 pb-4 space-y-1">
        <h1 className="text-3xl font-black text-white tracking-tight">Search Flights</h1>
        <p className="text-xs text-[#B5B5B5]">Book cheap domestic & international flight tickets.</p>
      </div>

      {/* Search Bar Panel */}
      <section>
        <FlightSearch onSearch={handleSearch} />
      </section>

      {/* Mobile Filter Toggle */}
      <div className="flex lg:hidden justify-end">
        <button
          onClick={() => setShowMobileFilter(!showMobileFilter)}
          className="px-4 py-2 bg-sky-600 text-white rounded-xl font-bold text-xs flex items-center gap-2"
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
            resetFilters={() => setFilters({ stops: 'ALL', airlines: [], cabinClass: 'ALL' })}
          />
        </aside>

        {/* Flight Cards List */}
        <main className="lg:col-span-3 space-y-6 relative min-h-[320px]">
          <div className="flex flex-wrap items-center justify-between glass-card p-4 rounded-2xl gap-3">
            <div className="flex items-center gap-2">
              <Plane className="w-5 h-5 text-cyanAccent rotate-45" />
              <h2 className="font-bold text-white text-sm">
                Available Flights ({filteredFlights.length})
              </h2>
            </div>

            {/* Sort Options */}
            <div className="flex items-center gap-2 text-xs font-semibold">
              <span className="text-slate-400 flex items-center gap-1">
                <ArrowUpDown className="w-3.5 h-3.5" /> Sort Fares:
              </span>
              <button
                type="button"
                onClick={() => handleSortChange('CHEAPEST')}
                className={`px-2.5 py-1 rounded-lg transition-colors ${
                  sortBy === 'CHEAPEST' ? 'bg-cyanAccent/20 text-cyanAccent font-bold border border-cyanAccent/30' : 'text-slate-300 hover:text-white'
                }`}
              >
                Cheapest
              </button>
              <button
                type="button"
                onClick={() => handleSortChange('DEPARTURE')}
                className={`px-2.5 py-1 rounded-lg transition-colors ${
                  sortBy === 'DEPARTURE' ? 'bg-cyanAccent/20 text-cyanAccent font-bold border border-cyanAccent/30' : 'text-slate-300 hover:text-white'
                }`}
              >
                Departure Time
              </button>
            </div>
          </div>

          {loading ? (
            <SkeletonLoader count={4} />
          ) : filteredFlights.length === 0 ? (
            <div className="text-center py-16 glass-card rounded-3xl space-y-3 p-6">
              <p className="text-lg font-bold text-white">
                No flights found matching your search.
              </p>
              <p className="text-xs text-slate-400">
                Try selecting a different date or airline filter.
              </p>
            </div>
          ) : (
            filteredFlights.map((f) => (
              <FlightCard
                key={f._id}
                flight={f}
                onSelect={(flightObj, tier) => handleBookFlight(flightObj, tier)}
              />
            ))
          )}
        </main>
      </div>
    </div>
  );
}
