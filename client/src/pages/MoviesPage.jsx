import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import API from '../services/api';
import GlassCard from '../components/ui/GlassCard';
import GlassButton from '../components/ui/GlassButton';
import GlassInput from '../components/ui/GlassInput';
import RatingStars from '../components/common/RatingStars';
import Skeleton from '../components/ui/Skeleton';
import { CardSkeletonGrid, MovieCardSkeleton } from '../components/loading';
import { Search, MapPin, Film, Clock, Ticket } from 'lucide-react';

const MOCK_MOVIES = [
  {
    _id: 'movie-101',
    slug: 'kalki-2898-ad',
    title: 'Kalki 2898 AD',
    categoryType: 'movies',
    rating: 4.9,
    numReviews: 1240,
    bannerImage: 'https://images.unsplash.com/photo-1536440136628-849c177e76a1',
    description: 'A modern avatar of Vishnu descends to Earth to protect humanity from dark dystopian forces.',
    location: { city: 'Mumbai', venue: 'PVR INOX IMAX' },
    pricingTiers: [{ price: 350, tierName: 'Executive' }, { price: 650, tierName: 'IMAX 3D' }],
    transitInfo: { duration: '3h 01m', language: 'Telugu, Hindi, Tamil', genre: 'Sci-Fi / Action', showTimings: ['10:30 AM', '02:15 PM', '06:45 PM', '10:00 PM'] },
  },
  {
    _id: 'movie-102',
    slug: 'stree-2',
    title: 'Stree 2: Sarkate Ka Aatank',
    categoryType: 'movies',
    rating: 4.8,
    numReviews: 980,
    bannerImage: 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba',
    description: 'Chanderi is once again haunted by a headless phantom, and only Vicky and squad can stop it.',
    location: { city: 'Delhi', venue: 'Cinepolis Megaplex' },
    pricingTiers: [{ price: 250, tierName: 'Recliner' }],
    transitInfo: { duration: '2h 27m', language: 'Hindi', genre: 'Comedy / Horror', showTimings: ['11:00 AM', '03:30 PM', '07:15 PM'] },
  },
  {
    _id: 'movie-103',
    slug: 'pushpa-2-the-rule',
    title: 'Pushpa 2: The Rule',
    categoryType: 'movies',
    rating: 4.9,
    numReviews: 2100,
    bannerImage: 'https://images.unsplash.com/photo-1517604931442-7e0c8ed2963c',
    description: 'Pushpa Raj expands his red sandalwood empire while facing intense clashes with SP Bhanwar Singh.',
    location: { city: 'Hyderabad', venue: 'Prasads Multiplex' },
    pricingTiers: [{ price: 300, tierName: 'Standard' }],
    transitInfo: { duration: '3h 10m', language: 'Telugu, Hindi', genre: 'Action / Crime', showTimings: ['09:00 AM', '01:00 PM', '05:00 PM', '09:00 PM'] },
  },
];

export default function MoviesPage() {
  const [movies, setMovies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [activeTab, setActiveTab] = useState('NOW_SHOWING');

  useEffect(() => {
    fetchMovies();
  }, [activeTab]);

  const fetchMovies = async () => {
    setLoading(true);
    try {
      const res = await API.get('/listings?categoryType=movies');
      if (res.data.success && res.data.data.listings.length > 0) {
        setMovies(res.data.data.listings);
      } else {
        setMovies(MOCK_MOVIES);
      }
    } catch (err) {
      setMovies(MOCK_MOVIES);
    } finally {
      setLoading(false);
    }
  };

  const filteredMovies = movies.filter((m) =>
    m.title.toLowerCase().includes(search.toLowerCase()) ||
    m.transitInfo?.genre?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-8 pb-12">
      {/* Page Header */}
      <div className="border-b border-[var(--border)] pb-6 space-y-2">
        <h1 className="text-3xl sm:text-4xl font-black text-[var(--foreground)] tracking-tight">
          Book Movie Tickets
        </h1>
        <p className="text-xs sm:text-sm text-[var(--muted-foreground)]">
          Explore latest cinema releases, IMAX 3D blockbusters, and advance show bookings.
        </p>
      </div>

      {/* Filter Tabs & Search */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-2 overflow-x-auto pb-2 sm:pb-0 scrollbar-none">
          {['NOW_SHOWING', 'UPCOMING', 'POPULAR'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
                activeTab === tab
                  ? 'bg-gradient-to-r from-[var(--primary)] to-[var(--secondary)] text-white shadow-lg'
                  : 'bg-[var(--card)] text-[var(--muted-foreground)] hover:text-[var(--foreground)] border border-[var(--border)]'
              }`}
            >
              {tab.replace('_', ' ')}
            </button>
          ))}
        </div>

        <div className="max-w-xs w-full">
          <GlassInput
            icon={Search}
            placeholder="Search movie name or genre..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      {/* Movies Grid */}
      {loading ? (
        <CardSkeletonGrid
          count={6}
          CardSkeletonComponent={MovieCardSkeleton}
          gridClassName="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
          ariaLabel="Loading movies..."
        />
      ) : filteredMovies.length === 0 ? (
        <GlassCard className="text-center py-20 space-y-3 bg-[var(--card)]">
          <Film className="w-12 h-12 text-[var(--primary)] mx-auto opacity-80" />
          <p className="text-lg font-black text-[var(--foreground)]">No movies found</p>
          <p className="text-xs text-[var(--muted-foreground)]">Try searching for another movie title or genre.</p>
        </GlassCard>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredMovies.map((item) => {
            const image = item.bannerImage || item.images?.[0] || MOCK_MOVIES[0].bannerImage;
            const price = item.pricingTiers?.[0]?.price || 250;
            const timings = item.transitInfo?.showTimings || ['10:30 AM', '02:30 PM', '07:00 PM'];

            return (
              <GlassCard key={item._id} className="p-0 overflow-hidden flex flex-col justify-between group bg-[var(--card)]">
                <div className="relative h-52 overflow-hidden bg-[var(--muted)]">
                  <img
                    src={image}
                    alt={item.title}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute top-3 left-3 px-3 py-1 bg-[var(--card)]/90 backdrop-blur-md text-[var(--primary)] text-[10px] font-black rounded-full uppercase tracking-wider border border-[var(--border)]">
                    {item.transitInfo?.genre || 'Cinema'}
                  </div>
                </div>

                <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-xs text-[var(--muted-foreground)]">
                      <span className="flex items-center gap-1 font-semibold">
                        <MapPin className="w-3.5 h-3.5 text-[var(--primary)]" />
                        {item.location?.venue || item.location?.city || 'IMAX Multiplex'}
                      </span>
                      <RatingStars rating={item.rating || 4.8} numReviews={item.numReviews || 500} />
                    </div>

                    <h3 className="font-black text-[var(--foreground)] text-lg line-clamp-1 group-hover:text-[var(--primary)] transition-colors">
                      {item.title}
                    </h3>
                    
                    <p className="text-xs text-[var(--muted-foreground)] line-clamp-2 leading-relaxed">
                      {item.description}
                    </p>

                    <div className="flex items-center gap-3 text-xs text-[var(--muted-foreground)] pt-1">
                      <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5 text-[var(--primary)]" /> {item.transitInfo?.duration || '2h 30m'}</span>
                      <span>•</span>
                      <span>{item.transitInfo?.language || 'Hindi, English'}</span>
                    </div>

                    {/* Show Timings */}
                    <div className="pt-2">
                      <span className="text-[10px] uppercase font-bold text-[var(--muted-foreground)] block mb-1.5">Available Timings</span>
                      <div className="flex flex-wrap gap-1.5">
                        {timings.map((time, idx) => (
                          <span key={idx} className="px-2.5 py-1 bg-[var(--muted)] border border-[var(--border)] text-[11px] font-bold text-[var(--foreground)] rounded-lg">
                            {time}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="pt-3 border-t border-[var(--border)] flex items-center justify-between">
                    <div>
                      <span className="text-[10px] uppercase font-bold text-[var(--muted-foreground)] block">Tickets From</span>
                      <span className="text-xl font-black text-[var(--foreground)]">₹{price}</span>
                    </div>

                    <Link to={`/listings/${item.slug || item._id}`}>
                      <GlassButton size="sm" variant="gradient" icon={Ticket}>
                        Book Tickets
                      </GlassButton>
                    </Link>
                  </div>
                </div>
              </GlassCard>
            );
          })}
        </div>
      )}
    </div>
  );
}
