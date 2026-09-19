import React, { useState, useEffect } from 'react';
import API from '../services/api';
import BusSearch from '../components/bus/BusSearch';
import BusCard from '../components/bus/BusCard';
import BusFilters from '../components/bus/BusFilters';
import PageLoader from '../components/common/PageLoader';
import { Bus, Filter, ArrowUpDown } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const MOCK_BUSES = [
  {
    _id: 'bus-101',
    slug: 'intrcity-smartbus-ac-sleeper',
    title: 'IntrCity SmartBus Volvo AC Sleeper',
    categoryType: 'bus',
    rating: 4.8,
    numReviews: 420,
    transitInfo: {
      operator: 'IntrCity SmartBus',
      busType: 'Volvo Multi-Axle AC Sleeper (2+1)',
      source: 'Mumbai',
      destination: 'Goa',
      departureTime: '21:00',
      arrivalTime: '07:30',
      duration: '10h 30m',
    },
    pricingTiers: [
      { tierName: 'Single Sleeper', price: 1250, totalCapacity: 15 },
      { tierName: 'Double Sleeper', price: 2100, totalCapacity: 10 },
      { tierName: 'Standard Seater', price: 850, totalCapacity: 20 },
    ],
  },
  {
    _id: 'bus-102',
    slug: 'vrl-travels-non-ac-seater',
    title: 'VRL Travels Non-AC Seater / Sleeper',
    categoryType: 'bus',
    rating: 4.5,
    numReviews: 280,
    transitInfo: {
      operator: 'VRL Travels',
      busType: 'Scania Multi-Axle AC Seater',
      source: 'Bengaluru',
      destination: 'Hyderabad',
      departureTime: '22:15',
      arrivalTime: '06:00',
      duration: '7h 45m',
    },
    pricingTiers: [
      { tierName: 'Standard Seater', price: 850, totalCapacity: 30 },
      { tierName: 'Upper Sleeper', price: 1100, totalCapacity: 12 },
    ],
  },
  {
    _id: 'bus-103',
    slug: 'zingbus-volvo-ac-sleeper',
    title: 'Zingbus Premium Volvo AC Sleeper',
    categoryType: 'bus',
    rating: 4.9,
    numReviews: 510,
    transitInfo: {
      operator: 'Zingbus',
      busType: 'Volvo 9600 AC Sleeper (2+1)',
      source: 'Delhi',
      destination: 'Jaipur',
      departureTime: '23:00',
      arrivalTime: '04:30',
      duration: '5h 30m',
    },
    pricingTiers: [
      { tierName: 'Lower Sleeper', price: 790, totalCapacity: 18 },
      { tierName: 'Upper Sleeper', price: 720, totalCapacity: 18 },
    ],
  },
  {
    _id: 'bus-104',
    slug: 'orange-tours-travels',
    title: 'Orange Tours & Travels AC Sleeper',
    categoryType: 'bus',
    rating: 4.6,
    numReviews: 190,
    transitInfo: {
      operator: 'Orange Travels',
      busType: 'Mercedes Multi-Axle AC Sleeper',
      source: 'Chennai',
      destination: 'Bengaluru',
      departureTime: '23:30',
      arrivalTime: '05:30',
      duration: '6h 00m',
    },
    pricingTiers: [
      { tierName: 'AC Sleeper', price: 990, totalCapacity: 24 },
    ],
  },
];

export default function BusBookingPage() {
  const navigate = useNavigate();
  const [buses, setBuses] = useState([]);
  const [filteredBuses, setFilteredBuses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sortBy, setSortBy] = useState('DEPARTURE');
  const [showMobileFilter, setShowMobileFilter] = useState(false);
  const [filters, setFilters] = useState({
    busTypes: [],
    acType: 'ALL',
    timeSlot: 'ALL',
    minRating: 0,
  });

  useEffect(() => {
    fetchBuses();
  }, []);

  const fetchBuses = async () => {
    setLoading(true);
    try {
      const res = await API.get('/listings?categoryType=bus');
      if (res.data.success && res.data.data.listings.length > 0) {
        setBuses(res.data.data.listings);
        setFilteredBuses(res.data.data.listings);
      } else {
        setBuses(MOCK_BUSES);
        setFilteredBuses(MOCK_BUSES);
      }
    } catch (err) {
      console.warn('Backend bus API empty, loading standard Indian Bus routes', err);
      setBuses(MOCK_BUSES);
      setFilteredBuses(MOCK_BUSES);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (searchParams) => {
    setLoading(true);
    setTimeout(() => {
      let result = [...buses];
      if (searchParams.from?.city && searchParams.to?.city) {
        result = result.filter(
          (b) =>
            b.transitInfo?.source?.toLowerCase().includes(searchParams.from.city.toLowerCase()) ||
            b.transitInfo?.destination?.toLowerCase().includes(searchParams.to.city.toLowerCase())
        );
      }
      setFilteredBuses(result.length > 0 ? result : MOCK_BUSES);
      setLoading(false);
    }, 300);
  };

  const handleFilterChange = (newFilters) => {
    setFilters(newFilters);
    let result = [...buses];
    if (newFilters.busTypes && newFilters.busTypes.length > 0) {
      result = result.filter((b) =>
        newFilters.busTypes.some((t) =>
          b.transitInfo?.busType?.toLowerCase().includes(t.toLowerCase())
        )
      );
    }
    if (newFilters.minRating > 0) {
      result = result.filter((b) => (b.rating || 4.5) >= newFilters.minRating);
    }
    setFilteredBuses(result);
  };

  const handleSortChange = (type) => {
    setSortBy(type);
    let sorted = [...filteredBuses];
    if (type === 'CHEAPEST') {
      sorted.sort((a, b) => (a.pricingTiers?.[0]?.price || 0) - (b.pricingTiers?.[0]?.price || 0));
    } else if (type === 'RATING') {
      sorted.sort((a, b) => (b.rating || 0) - (a.rating || 0));
    }
    setFilteredBuses(sorted);
  };

  const handleBookSeat = (selectedSeats, totalAmount) => {
    alert(`Seats Selected: ${selectedSeats.join(', ')} • Total Amount: ₹${totalAmount}`);
  };

  return (
    <div className="space-y-8 pb-16 max-w-7xl mx-auto">
      <div className="border-b border-white/10 pb-4 space-y-1">
        <h1 className="text-3xl font-black text-white tracking-tight flex items-center gap-3">
          <Bus className="w-8 h-8 text-[#03B3C3]" /> Book Bus Tickets
        </h1>
        <p className="text-xs text-[#9CA3AF]">
          Search and book intercity AC sleeper, Volvo, and Multi-Axle bus tickets.
        </p>
      </div>

      {/* Top Search Hero */}
      <section>
        <BusSearch onSearch={handleSearch} />
      </section>

      {/* Mobile Filter Toggle Button */}
      <div className="flex lg:hidden justify-end">
        <button
          onClick={() => setShowMobileFilter(!showMobileFilter)}
          className="px-4 py-2 bg-gradient-to-r from-[#03B3C3] to-[#6750A2] text-white rounded-xl font-bold text-xs flex items-center gap-2"
        >
          <Filter className="w-4 h-4" /> {showMobileFilter ? 'Hide Filters' : 'Show Filters'}
        </button>
      </div>

      {/* Main Grid: Filters + Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Left Sidebar Filters */}
        <aside className={`lg:col-span-1 ${showMobileFilter ? 'block' : 'hidden lg:block'}`}>
          <BusFilters
            filters={filters}
            onFilterChange={handleFilterChange}
            resetFilters={() =>
              setFilters({ busTypes: [], acType: 'ALL', timeSlot: 'ALL', minRating: 0 })
            }
          />
        </aside>

        {/* Right Bus Cards List */}
        <main className="lg:col-span-3 space-y-6">
          <div className="flex flex-wrap items-center justify-between bg-[#111111] border border-white/10 p-4 rounded-2xl gap-3">
            <div className="flex items-center gap-2">
              <Bus className="w-5 h-5 text-[#03B3C3]" />
              <h2 className="font-bold text-white text-sm">
                Available Buses ({filteredBuses.length})
              </h2>
            </div>

            {/* Sort options */}
            <div className="flex items-center gap-2 text-xs font-semibold">
              <span className="text-[#9CA3AF] flex items-center gap-1">
                <ArrowUpDown className="w-3.5 h-3.5" /> Sort:
              </span>
              <button
                type="button"
                onClick={() => handleSortChange('DEPARTURE')}
                className={`px-2.5 py-1 rounded-lg transition-colors ${
                  sortBy === 'DEPARTURE'
                    ? 'bg-[#03B3C3]/20 text-[#03B3C3] font-bold border border-[#03B3C3]/30'
                    : 'text-[#D1D5DB] hover:text-white'
                }`}
              >
                Departure
              </button>
              <button
                type="button"
                onClick={() => handleSortChange('CHEAPEST')}
                className={`px-2.5 py-1 rounded-lg transition-colors ${
                  sortBy === 'CHEAPEST'
                    ? 'bg-[#03B3C3]/20 text-[#03B3C3] font-bold border border-[#03B3C3]/30'
                    : 'text-[#D1D5DB] hover:text-white'
                }`}
              >
                Cheapest
              </button>
              <button
                type="button"
                onClick={() => handleSortChange('RATING')}
                className={`px-2.5 py-1 rounded-lg transition-colors ${
                  sortBy === 'RATING'
                    ? 'bg-[#03B3C3]/20 text-[#03B3C3] font-bold border border-[#03B3C3]/30'
                    : 'text-[#D1D5DB] hover:text-white'
                }`}
              >
                Highest Rated
              </button>
            </div>
          </div>

          {loading ? (
            <PageLoader text="Searching intercity bus routes..." />
          ) : filteredBuses.length === 0 ? (
            <div className="text-center py-16 bg-[#111111] border border-white/10 rounded-3xl space-y-3 p-6">
              <p className="text-lg font-bold text-white">
                No buses found matching your search.
              </p>
              <p className="text-xs text-[#9CA3AF]">
                Try selecting a different date or clearing your filter criteria.
              </p>
            </div>
          ) : (
            filteredBuses.map((b) => (
              <BusCard key={b._id} bus={b} onBookSeat={handleBookSeat} />
            ))
          )}
        </main>
      </div>
    </div>
  );
}
