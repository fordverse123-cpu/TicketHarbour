import React, { useState, useEffect } from 'react';
import API from '../services/api';
import TrainSearch from '../components/train/TrainSearch';
import TrainCard from '../components/train/TrainCard';
import TrainFilters from '../components/train/TrainFilters';
import TrainSeatSelection from '../components/train/TrainSeatSelection';
import SkeletonLoader from '../components/common/SkeletonLoader';
import { Train, ShieldCheck, Sparkles, RefreshCw, Filter } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const MOCK_TRAINS = [
  {
    _id: 'train-12627',
    slug: 'karnataka-express-12627',
    title: '12627 Karnataka Express',
    categoryType: 'train',
    transitInfo: {
      number: '12627',
      source: 'Bengaluru (SBC)',
      destination: 'New Delhi (NDLS)',
      departureTime: '20:20',
      arrivalTime: '05:30',
      duration: '33h 10m',
    },
    pricingTiers: [
      { tierName: 'Sleeper (SL)', price: 780, classType: 'SL', totalCapacity: 100, status: 'AVAILABLE 64' },
      { tierName: 'AC 3 Tier (3A)', price: 1850, classType: '3A', totalCapacity: 40, status: 'AVAILABLE 28' },
      { tierName: 'AC 2 Tier (2A)', price: 2750, classType: '2A', totalCapacity: 20, status: 'RAC 4' },
      { tierName: 'AC 1st Class (1A)', price: 4600, classType: '1A', totalCapacity: 10, status: 'AVAILABLE 2' },
    ],
  },
  {
    _id: 'train-12951',
    slug: 'mumbai-rajdhani-12951',
    title: '12951 Mumbai Rajdhani Express',
    categoryType: 'train',
    transitInfo: {
      number: '12951',
      source: 'Mumbai Central (MMCT)',
      destination: 'New Delhi (NDLS)',
      departureTime: '17:00',
      arrivalTime: '08:32',
      duration: '15h 32m',
    },
    pricingTiers: [
      { tierName: 'AC 3 Tier (3A)', price: 2340, classType: '3A', totalCapacity: 50, status: 'AVAILABLE 42' },
      { tierName: 'AC 2 Tier (2A)', price: 3420, classType: '2A', totalCapacity: 30, status: 'AVAILABLE 18' },
      { tierName: 'AC 1st Class (1A)', price: 5890, classType: '1A', totalCapacity: 12, status: 'AVAILABLE 5' },
    ],
  },
];

// Fare mapping helper for standard railway classes
const getFareForClass = (cls) => {
  switch (cls) {
    case '1A': return 4600;
    case '2A': return 2750;
    case '3A': return 1850;
    case 'SL': return 780;
    case 'CC': return 890;
    case 'EC': return 1650;
    case '2S': return 320;
    default: return 950;
  }
};

export default function TrainBookingPage() {
  const navigate = useNavigate();
  const [trains, setTrains] = useState([]);
  const [filteredTrains, setFilteredTrains] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({ trainType: 'ALL', timeSlot: 'ALL', classType: 'ALL' });
  const [selectedSeatTrain, setSelectedSeatTrain] = useState(null);
  const [selectedTier, setSelectedTier] = useState(null);
  const [showMobileFilter, setShowMobileFilter] = useState(false);
  const [searchMessage, setSearchMessage] = useState('');

  useEffect(() => {
    // Initial fetch for default route BZA -> SC
    handleSearch({
      from: { code: 'BZA', city: 'Vijayawada' },
      to: { code: 'SC', city: 'Hyderabad' },
      date: new Date().toISOString().split('T')[0],
      trainClass: 'ALL',
      quota: 'GN',
    });
  }, []);

  const handleSearch = async (searchParams) => {
    setLoading(true);
    setSearchMessage('');

    const fromCode = searchParams.from?.code || searchParams.from;
    const toCode = searchParams.to?.code || searchParams.to;
    const dateStr = searchParams.date || new Date().toISOString().split('T')[0];

    try {
      // Call MongoDB Backend Train Search API
      const res = await API.get('/trains/search', {
        params: {
          from: fromCode,
          to: toCode,
          date: dateStr,
          class: searchParams.trainClass !== 'ALL' ? searchParams.trainClass : undefined,
          quota: searchParams.quota,
        },
      });

      if (res.data && res.data.success && res.data.trains) {
        const mappedTrains = res.data.trains.map((t) => {
          const pricingTiers = (t.classes || ['3A', '2A', 'SL']).map((cls) => ({
            tierName: `${cls}`,
            classType: cls,
            price: getFareForClass(cls),
            totalCapacity: 50,
            status: 'AVAILABLE ' + (Math.floor(Math.random() * 40) + 10),
          }));

          return {
            _id: t._id,
            slug: `train-${t.trainNumber}`,
            title: `${t.trainNumber} ${t.trainName}`,
            categoryType: 'train',
            transitInfo: {
              number: t.trainNumber,
              source: `${t.from.stationName} (${t.from.stationCode})`,
              destination: `${t.to.stationName} (${t.to.stationCode})`,
              departureTime: t.from.departure,
              arrivalTime: t.to.arrival,
              duration: t.duration,
            },
            pricingTiers,
            route: t.route,
            amenities: t.amenities,
          };
        });

        setTrains(mappedTrains);
        setFilteredTrains(mappedTrains);

        if (mappedTrains.length === 0) {
          setSearchMessage(`No trains found between ${fromCode} and ${toCode} for ${dateStr}.`);
        }
      } else {
        setTrains(MOCK_TRAINS);
        setFilteredTrains(MOCK_TRAINS);
      }
    } catch (err) {
      console.warn('Backend train API error, falling back to cached train data', err);
      setTrains(MOCK_TRAINS);
      setFilteredTrains(MOCK_TRAINS);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (newFilters) => {
    setFilters(newFilters);
    let result = [...trains];
    if (newFilters.classType && newFilters.classType !== 'ALL') {
      result = result.filter((t) =>
        t.pricingTiers?.some((tier) => tier.classType === newFilters.classType)
      );
    }
    if (newFilters.trainType && newFilters.trainType !== 'ALL') {
      result = result.filter((t) =>
        t.title?.toLowerCase().includes(newFilters.trainType.toLowerCase())
      );
    }
    setFilteredTrains(result);
  };

  const handleOpenSeatSelection = (trainObj, tierObj) => {
    setSelectedSeatTrain(trainObj);
    setSelectedTier(tierObj || trainObj.pricingTiers?.[0]);
  };

  const handleConfirmBerths = (berths, totalPrice) => {
    if (selectedSeatTrain) {
      navigate(`/listings/${selectedSeatTrain.slug || selectedSeatTrain._id}?class=${selectedTier?.classType || '3A'}&berths=${berths.join(',')}`);
    }
  };

  return (
    <div className="space-y-8 pb-16">
      <div className="border-b border-white/10 pb-4 space-y-1">
        <h1 className="text-3xl font-black text-white tracking-tight">Search Trains</h1>
        <p className="text-xs text-[#B5B5B5]">Indian Railways train reservation, Tatkal quota & seat availability.</p>
      </div>

      {/* Search Hero Panel */}
      <section>
        <TrainSearch onSearch={handleSearch} />
      </section>

      {/* Mobile Filter Toggle */}
      <div className="flex lg:hidden justify-end">
        <button
          onClick={() => setShowMobileFilter(!showMobileFilter)}
          className="px-4 py-2 bg-blue-900 text-white rounded-xl font-bold text-xs flex items-center gap-2"
        >
          <Filter className="w-4 h-4" /> {showMobileFilter ? 'Hide Filters' : 'Show Filters'}
        </button>
      </div>

      {/* Main Grid: Filters + Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Left Sidebar Filters */}
        <aside className={`lg:col-span-1 ${showMobileFilter ? 'block' : 'hidden lg:block'}`}>
          <TrainFilters filters={filters} onFilterChange={handleFilterChange} />
        </aside>

        {/* Right Train Cards List */}
        <main className="lg:col-span-3 space-y-6">
          <div className="flex items-center justify-between glass-card p-4 rounded-2xl">
            <div className="flex items-center gap-2">
              <Train className="w-5 h-5 text-cyanAccent" />
              <h2 className="font-bold text-white text-sm">
                Available Trains ({filteredTrains.length})
              </h2>
            </div>
            <button
              onClick={() => handleSearch({ from: 'BZA', to: 'SC', date: new Date().toISOString().split('T')[0] })}
              className="text-xs font-semibold text-cyanAccent flex items-center gap-1 hover:underline"
            >
              <RefreshCw className="w-3.5 h-3.5" /> Refresh Schedule
            </button>
          </div>

          {loading ? (
            <SkeletonLoader count={4} />
          ) : filteredTrains.length === 0 ? (
            <div className="text-center py-16 glass-card rounded-3xl space-y-3 p-6">
              <p className="text-lg font-bold text-white">
                {searchMessage || 'No trains found matching your search.'}
              </p>
              <p className="text-xs text-slate-400">
                Try selecting a different date, quota, or class filter.
              </p>
            </div>
          ) : (
            filteredTrains.map((t) => (
              <TrainCard
                key={t._id}
                train={t}
                onSelectClass={(tier) => handleOpenSeatSelection(t, tier)}
              />
            ))
          )}
        </main>
      </div>

      {/* Seat / Berth Selection Modal */}
      {selectedSeatTrain && (
        <TrainSeatSelection
          train={selectedSeatTrain}
          selectedClass={selectedTier?.classType || '3A'}
          price={selectedTier?.price || 1850}
          onClose={() => setSelectedSeatTrain(null)}
          onConfirmBerths={handleConfirmBerths}
        />
      )}
    </div>
  );
}
