import React, { useState, useEffect } from 'react';
import API from '../services/api';
import BusSearch from '../components/bus/BusSearch';
import BusCard from '../components/bus/BusCard';
import BusFilters from '../components/bus/BusFilters';
import SkeletonLoader from '../components/common/SkeletonLoader';
import { Bus, RefreshCw, Filter, Sparkles } from 'lucide-react';
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
  const [filters, setFilters] = useState({
    busType: 'ALL',
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
      if (searchParams.from && searchParams.to) {
        result = result.filter(
          (b) =>
            b.transitInfo?.source?.toLowerCase().includes(searchParams.from.toLowerCase()) ||
            b.transitInfo?.destination?.toLowerCase().includes(searchParams.to.toLowerCase())
        );
      }
      setFilteredBuses(result.length > 0 ? result : MOCK_BUSES);
      setLoading(false);
    }, 400);
  };

  const handleFilterChange = (newFilters) => {
    setFilters(newFilters);
    let result = [...buses];
    if (newFilters.busType !== 'ALL') {
      result = result.filter((b) =>
        b.transitInfo?.busType?.toLowerCase().includes(newFilters.busType.toLowerCase())
      );
    }
    if (newFilters.minRating > 0) {
      result = result.filter((b) => b.rating >= newFilters.minRating);
    }
    setFilteredBuses(result);
  };

  const handleBookSeat = (selectedSeats, totalAmount) => {
    alert(`Booking ${selectedSeats.length} seats (${selectedSeats.join(', ')}) for ₹${totalAmount}`);
  };

  return (
    <div className="space-y-8 pb-16">
      {/* Top Search Hero */}
      <section>
        <BusSearch onSearch={handleSearch} />
      </section>

      {/* Main Grid: Filters + Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Left Sidebar Filters */}
        <aside className="lg:col-span-1">
          <BusFilters filters={filters} onFilterChange={handleFilterChange} />
        </aside>

        {/* Right Bus Cards List */}
        <main className="lg:col-span-3 space-y-6">
          <div className="flex items-center justify-between bg-white dark:bg-slate-800 p-4 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm">
            <div className="flex items-center gap-2">
              <Bus className="w-5 h-5 text-red-600" />
              <h2 className="font-bold text-slate-900 dark:text-white text-sm">
                Available Buses ({filteredBuses.length})
              </h2>
            </div>
            <button
              onClick={fetchBuses}
              className="text-xs font-semibold text-red-600 dark:text-red-400 flex items-center gap-1 hover:underline"
            >
              <RefreshCw className="w-3.5 h-3.5" /> Refresh List
            </button>
          </div>

          {loading ? (
            <SkeletonLoader count={4} />
          ) : filteredBuses.length === 0 ? (
            <div className="text-center py-16 bg-white dark:bg-slate-800 rounded-3xl border border-slate-200 dark:border-slate-700 space-y-3">
              <p className="text-lg font-bold text-slate-700 dark:text-slate-200">
                No buses found matching your search.
              </p>
              <p className="text-xs text-slate-400">
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
