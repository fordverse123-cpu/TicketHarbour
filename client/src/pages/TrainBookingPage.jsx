import React, { useState, useEffect } from 'react';
import API from '../services/api';
import TrainSearch from '../components/train/TrainSearch';
import TrainCard from '../components/train/TrainCard';
import TrainFilters from '../components/train/TrainFilters';
import TrainSeatSelection from '../components/train/TrainSeatSelection';
import SkeletonLoader from '../components/common/SkeletonLoader';
import { Train, ShieldCheck, Sparkles, RefreshCw } from 'lucide-react';

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
  {
    _id: 'train-12007',
    slug: 'shatabdi-express-12007',
    title: '12007 Chennai Shatabdi Express',
    categoryType: 'train',
    transitInfo: {
      number: '12007',
      source: 'Chennai Central (MAS)',
      destination: 'Bengaluru (SBC)',
      departureTime: '06:00',
      arrivalTime: '11:00',
      duration: '5h 00m',
    },
    pricingTiers: [
      { tierName: 'AC Chair Car (CC)', price: 890, classType: 'CC', totalCapacity: 80, status: 'AVAILABLE 55' },
      { tierName: 'Executive Chair (EC)', price: 1650, classType: 'EC', totalCapacity: 20, status: 'AVAILABLE 11' },
    ],
  },
  {
    _id: 'train-12267',
    slug: 'duronto-express-12267',
    title: '12267 Ahmedabad Duronto Express',
    categoryType: 'train',
    transitInfo: {
      number: '12267',
      source: 'Mumbai Central (MMCT)',
      destination: 'Ahmedabad (ADI)',
      departureTime: '23:25',
      arrivalTime: '05:55',
      duration: '6h 30m',
    },
    pricingTiers: [
      { tierName: 'AC 3 Tier (3A)', price: 1120, classType: '3A', totalCapacity: 60, status: 'AVAILABLE 39' },
      { tierName: 'AC 2 Tier (2A)', price: 1680, classType: '2A', totalCapacity: 30, status: 'RAC 8' },
      { tierName: 'AC 1st Class (1A)', price: 2840, classType: '1A', totalCapacity: 10, status: 'AVAILABLE 3' },
    ],
  },
  {
    _id: 'train-22691',
    slug: 'rajdhani-express-22691',
    title: '22691 KSR Bengaluru Rajdhani',
    categoryType: 'train',
    transitInfo: {
      number: '22691',
      source: 'Bengaluru (SBC)',
      destination: 'Hazrat Nizamuddin (NZM)',
      departureTime: '20:00',
      arrivalTime: '05:30',
      duration: '33h 30m',
    },
    pricingTiers: [
      { tierName: 'AC 3 Tier (3A)', price: 2950, classType: '3A', totalCapacity: 45, status: 'AVAILABLE 19' },
      { tierName: 'AC 2 Tier (2A)', price: 4200, classType: '2A', totalCapacity: 25, status: 'WL 14' },
      { tierName: 'AC 1st Class (1A)', price: 6700, classType: '1A', totalCapacity: 8, status: 'AVAILABLE 1' },
    ],
  },
];

export default function TrainBookingPage() {
  const [trains, setTrains] = useState([]);
  const [filteredTrains, setFilteredTrains] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({ trainType: 'ALL', timeSlot: 'ALL', classType: 'ALL' });
  const [selectedSeatTrain, setSelectedSeatTrain] = useState(null);

  useEffect(() => {
    fetchTrains();
  }, []);

  const fetchTrains = async () => {
    setLoading(true);
    try {
      const res = await API.get('/listings?categoryType=train');
      if (res.data.success && res.data.data.listings.length > 0) {
        setTrains(res.data.data.listings);
        setFilteredTrains(res.data.data.listings);
      } else {
        setTrains(MOCK_TRAINS);
        setFilteredTrains(MOCK_TRAINS);
      }
    } catch (err) {
      console.warn('Backend train API empty, loading standard Indian Rail routes', err);
      setTrains(MOCK_TRAINS);
      setFilteredTrains(MOCK_TRAINS);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (searchParams) => {
    setLoading(true);
    setTimeout(() => {
      let result = [...trains];
      if (searchParams.trainClass && searchParams.trainClass !== 'ALL') {
        result = result.filter((t) =>
          t.pricingTiers?.some((tier) => tier.classType === searchParams.trainClass)
        );
      }
      setFilteredTrains(result.length > 0 ? result : MOCK_TRAINS);
      setLoading(false);
    }, 400);
  };

  const handleFilterChange = (newFilters) => {
    setFilters(newFilters);
    let result = [...trains];
    if (newFilters.classType !== 'ALL') {
      result = result.filter((t) =>
        t.pricingTiers?.some((tier) => tier.classType === newFilters.classType)
      );
    }
    setFilteredTrains(result);
  };

  return (
    <div className="space-y-8 pb-16">
      {/* Top Search Hero */}
      <section>
        <TrainSearch onSearch={handleSearch} />
      </section>

      {/* Main Grid: Filters + Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Left Sidebar Filters */}
        <aside className="lg:col-span-1">
          <TrainFilters filters={filters} onFilterChange={handleFilterChange} />
        </aside>

        {/* Right Train Cards List */}
        <main className="lg:col-span-3 space-y-6">
          <div className="flex items-center justify-between bg-white dark:bg-slate-800 p-4 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm">
            <div className="flex items-center gap-2">
              <Train className="w-5 h-5 text-blue-900 dark:text-blue-400" />
              <h2 className="font-bold text-slate-900 dark:text-white text-sm">
                Available Trains ({filteredTrains.length})
              </h2>
            </div>
            <button
              onClick={fetchTrains}
              className="text-xs font-semibold text-blue-600 dark:text-blue-400 flex items-center gap-1 hover:underline"
            >
              <RefreshCw className="w-3.5 h-3.5" /> Refresh Status
            </button>
          </div>

          {loading ? (
            <SkeletonLoader count={4} />
          ) : filteredTrains.length === 0 ? (
            <div className="text-center py-16 bg-white dark:bg-slate-800 rounded-3xl border border-slate-200 dark:border-slate-700 space-y-3">
              <p className="text-lg font-bold text-slate-700 dark:text-slate-200">
                No trains found matching your search.
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
                onSelectClass={() => setSelectedSeatTrain(t)}
              />
            ))
          )}
        </main>
      </div>

      {/* Seat / Berth Selection Modal */}
      {selectedSeatTrain && (
        <TrainSeatSelection
          train={selectedSeatTrain}
          onClose={() => setSelectedSeatTrain(null)}
          onConfirmBerths={(berths) => {
            alert(`Selected Berths: ${berths.join(', ')}`);
            setSelectedSeatTrain(null);
          }}
        />
      )}
    </div>
  );
}
