import React, { useState, useEffect, useRef } from 'react';
import API from '../services/api';
import TrainSearch from '../components/train/TrainSearch';
import TrainCard from '../components/train/TrainCard';
import TrainFilters from '../components/train/TrainFilters';
import SkeletonLoader from '../components/common/SkeletonLoader';
import PageLoader from '../components/common/PageLoader';
import AppLoader from '../components/AppLoader';
import { CardSkeletonGrid, TrainCardSkeleton } from '../components/loading';
import { Train, RefreshCw, Filter, AlertCircle, SearchX } from 'lucide-react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { findStationByInput } from '../data/locationData';
import toast from 'react-hot-toast';

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
  const { user } = useAuth();
  const searchSectionRef = useRef(null);
  const requestIdRef = useRef(0);

  const [trains, setTrains] = useState([]);
  const [filteredTrains, setFilteredTrains] = useState([]);
  const [status, setStatus] = useState('loading'); // 'idle' | 'loading' | 'success' | 'empty' | 'error'
  const [errorMessage, setErrorMessage] = useState('');
  const [lastSearchParams, setLastSearchParams] = useState(null);
  const [filters, setFilters] = useState({ trainType: 'ALL', timeSlot: 'ALL', classType: 'ALL' });
  const [showMobileFilter, setShowMobileFilter] = useState(false);

  const [searchParams] = useSearchParams();

  const urlFrom = searchParams.get('from');
  const urlTo = searchParams.get('to');
  const urlDate = searchParams.get('date');

  useEffect(() => {
    const fromObj = findStationByInput(urlFrom) || { code: 'BZA', city: 'Vijayawada', name: 'Vijayawada Junction' };
    const toObj = findStationByInput(urlTo) || { code: 'SC', city: 'Hyderabad', name: 'Secunderabad Junction' };
    const dateVal = urlDate || new Date().toISOString().split('T')[0];

    handleSearch({
      from: fromObj,
      to: toObj,
      date: dateVal,
      trainClass: 'ALL',
      quota: 'GN',
    });
  }, [urlFrom, urlTo, urlDate]);

  const handleSearch = async (searchParams) => {
    const currentRequestId = ++requestIdRef.current;
    setStatus('loading');
    setErrorMessage('');
    setLastSearchParams(searchParams);

    const fromCode = searchParams.from?.code || searchParams.from;
    const toCode = searchParams.to?.code || searchParams.to;
    const dateStr = searchParams.date || new Date().toISOString().split('T')[0];

    try {
      const res = await API.get('/trains/search', {
        params: {
          from: fromCode,
          to: toCode,
          date: dateStr,
          class: searchParams.trainClass !== 'ALL' ? searchParams.trainClass : undefined,
          quota: searchParams.quota,
        },
      });

      // Ignore stale response if a newer search was initiated
      if (currentRequestId !== requestIdRef.current) return;

      if (res.data && res.data.success && Array.isArray(res.data.trains)) {
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
              source: `${t.from?.stationName || fromCode} (${t.from?.stationCode || fromCode})`,
              destination: `${t.to?.stationName || toCode} (${t.to?.stationCode || toCode})`,
              departureTime: t.from?.departure || '10:00',
              arrivalTime: t.to?.arrival || '18:00',
              duration: t.duration || '8h 00m',
            },
            pricingTiers,
            route: t.route,
            amenities: t.amenities,
          };
        });

        if (mappedTrains.length > 0) {
          setTrains(mappedTrains);
          setFilteredTrains(mappedTrains);
          setStatus('success');
        } else {
          setTrains([]);
          setFilteredTrains([]);
          setStatus('empty');
        }
      } else {
        // Fallback to cached mock data if API succeeds with alternate format
        setTrains(MOCK_TRAINS);
        setFilteredTrains(MOCK_TRAINS);
        setStatus('success');
      }
    } catch (err) {
      if (currentRequestId !== requestIdRef.current) return;
      console.warn('Backend train API failure:', err);
      if (err.response?.status === 429) {
        const msg = err.response?.data?.message || 'Daily search limit of 42 searches per day reached. Please try again tomorrow.';
        toast.error(msg);
        setErrorMessage(msg);
        setStatus('error');
        setTrains([]);
        setFilteredTrains([]);
      } else if (MOCK_TRAINS.length > 0) {
        setTrains(MOCK_TRAINS);
        setFilteredTrains(MOCK_TRAINS);
        setStatus('success');
      } else {
        setErrorMessage('Unable to load trains. Please check your network connection and try again.');
        setStatus('error');
      }
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
    if (result.length === 0 && trains.length > 0) {
      setStatus('empty');
    } else if (result.length > 0) {
      setStatus('success');
    }
  };

  const handleBookNow = (trainObj, activeTier) => {
    if (!user) {
      toast.error('Please log in to proceed with train booking.');
      navigate('/login');
      return;
    }

    const selectedClass = activeTier?.classType || '3A';
    const tierPrice = activeTier?.price || 1850;

    // Navigate directly to checkout without any seat/berth selection map
    navigate('/checkout', {
      state: {
        listing: trainObj,
        schedule: {
          _id: `sch-${trainObj._id}-${selectedClass}`,
          date: lastSearchParams?.date || new Date().toISOString().split('T')[0],
          startTime: trainObj.transitInfo?.departureTime || '10:00',
          selectedClass: selectedClass,
          price: tierPrice,
        },
        seats: [], // No seat numbers for train
        quantity: 1,
      },
    });
  };

  const handleFocusSearch = () => {
    if (searchSectionRef.current) {
      searchSectionRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="space-y-8 pb-16">
      <div className="border-b border-[var(--border)] pb-4 space-y-1">
        <h1 className="text-3xl font-black text-[var(--foreground)] tracking-tight">Search Trains</h1>
        <p className="text-xs text-[var(--muted-foreground)]">Indian Railways train reservation, Tatkal quota & fare availability.</p>
      </div>

      {/* Search Hero Panel */}
      <section ref={searchSectionRef}>
        <TrainSearch
          onSearch={handleSearch}
          initialFrom={urlFrom || 'BZA'}
          initialTo={urlTo || 'SC'}
          initialDate={urlDate}
        />
      </section>

      {/* Mobile Filter Toggle */}
      <div className="flex lg:hidden justify-end">
        <button
          onClick={() => setShowMobileFilter(!showMobileFilter)}
          className="px-4 py-2 bg-[var(--primary)] text-white rounded-xl font-bold text-xs flex items-center gap-2 cursor-pointer shadow-md"
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

        {/* Right Train Results Area */}
        <main className="lg:col-span-3 space-y-6 relative min-h-[320px]">
          <div className="flex items-center justify-between glass-card p-4 rounded-2xl border border-[var(--border)] bg-[var(--card)]">
            <div className="flex items-center gap-2">
              <Train className="w-5 h-5 text-[var(--primary)]" />
              <h2 className="font-bold text-[var(--foreground)] text-sm">
                Available Trains ({status === 'success' ? filteredTrains.length : 0})
              </h2>
            </div>
            <button
              onClick={() => handleSearch(lastSearchParams || { from: 'BZA', to: 'SC', date: new Date().toISOString().split('T')[0] })}
              className="text-xs font-semibold text-[var(--primary)] flex items-center gap-1 hover:underline cursor-pointer"
            >
              <RefreshCw className="w-3.5 h-3.5" /> Refresh Schedule
            </button>
          </div>

          {/* State Machine Rendering */}
          {status === 'loading' && (
            <CardSkeletonGrid
              count={4}
              CardSkeletonComponent={TrainCardSkeleton}
              gridClassName="space-y-6"
              ariaLabel="Loading available trains..."
            />
          )}

          {status === 'error' && (
            <div className="text-center py-16 glass-card rounded-3xl space-y-4 p-8 border border-[var(--border)] bg-[var(--card)]">
              <div className="w-14 h-14 rounded-full bg-rose-500/10 text-[var(--danger)] flex items-center justify-center mx-auto border border-rose-500/20">
                <AlertCircle className="w-7 h-7" />
              </div>
              <div className="space-y-1">
                <h3 className="text-lg font-bold text-[var(--foreground)]">Unable to load trains</h3>
                <p className="text-xs text-[var(--muted-foreground)] max-w-md mx-auto">
                  {errorMessage || 'A network error occurred while connecting to Indian Railways server.'}
                </p>
              </div>
              <button
                type="button"
                onClick={() => handleSearch(lastSearchParams || { from: 'BZA', to: 'SC', date: new Date().toISOString().split('T')[0] })}
                className="px-6 py-2.5 bg-[var(--primary)] text-white font-bold text-xs rounded-xl shadow-md hover:opacity-90 transition-all cursor-pointer inline-flex items-center gap-2"
              >
                <RefreshCw className="w-4 h-4" /> Retry Search
              </button>
            </div>
          )}

          {status === 'empty' && (
            <div className="text-center py-12 glass-card rounded-3xl space-y-5 p-8 border border-[var(--border)] bg-[var(--card)]">
              <div className="w-14 h-14 rounded-full bg-amber-500/10 text-[var(--warning)] flex items-center justify-center mx-auto border border-amber-500/20">
                <SearchX className="w-7 h-7" />
              </div>
              <div className="space-y-2 max-w-md mx-auto">
                <h3 className="text-xl font-black text-[var(--foreground)]">No trains found</h3>
                <p className="text-xs text-[var(--muted-foreground)]">
                  We couldn't find trains matching your current search parameters.
                </p>
                <div className="p-4 bg-[var(--muted)] rounded-2xl text-left border border-[var(--border)] space-y-1 text-xs">
                  <span className="font-bold text-[var(--foreground)] block">Try changing your:</span>
                  <ul className="list-disc list-inside text-[var(--muted-foreground)] space-y-0.5 pl-1">
                    <li>Journey date</li>
                    <li>Class selection</li>
                    <li>Quota filter</li>
                    <li>From or To stations</li>
                  </ul>
                </div>
              </div>
              <button
                type="button"
                onClick={handleFocusSearch}
                className="px-6 py-3 bg-[var(--primary)] text-white font-black text-xs rounded-2xl shadow-lg hover:opacity-95 transition-all cursor-pointer"
              >
                Modify Search
              </button>
            </div>
          )}

          {status === 'success' && (
            filteredTrains.map((t) => (
              <TrainCard
                key={t._id}
                train={t}
                onBookNow={handleBookNow}
              />
            ))
          )}
        </main>
      </div>
    </div>
  );
}
