import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import API from '../services/api';
import GlassCard from '../components/ui/GlassCard';
import GlassButton from '../components/ui/GlassButton';
import GlassInput from '../components/ui/GlassInput';
import RatingStars from '../components/common/RatingStars';
import Skeleton from '../components/ui/Skeleton';
import { Search, MapPin, Ticket, Compass } from 'lucide-react';

const MOCK_ATTRACTIONS = [
  {
    _id: 'attraction-401',
    slug: 'imagicaa-theme-water-park',
    title: 'Imagicaa Theme & Water Park Pass',
    categoryType: 'attractions',
    rating: 4.8,
    numReviews: 1890,
    bannerImage: 'https://images.unsplash.com/photo-1513836279014-a89f7a76ae86',
    description: 'All-access pass to India’s premier international theme park, thrill rides, and wave pool attractions.',
    location: { city: 'Lonavala', venue: 'Imagicaa World' },
    pricingTiers: [{ price: 1499, tierName: 'Regular Ticket' }, { price: 2299, tierName: 'Express Skip-The-Line' }],
    transitInfo: { category: 'Theme Park', duration: 'Full Day' },
  },
  {
    _id: 'attraction-402',
    slug: 'wonderla-amusement-park-bengaluru',
    title: 'Wonderla Amusement Park Entry',
    categoryType: 'attractions',
    rating: 4.9,
    numReviews: 3200,
    bannerImage: 'https://images.unsplash.com/photo-1572715655204-47e298620059',
    description: 'Over 60 high-thrill land rides, water slides, 4D theater experiences, and musical fountains.',
    location: { city: 'Bengaluru', venue: 'Wonderla Resort' },
    pricingTiers: [{ price: 1290, tierName: 'Adult Entry' }],
    transitInfo: { category: 'Amusement Park', duration: 'Full Day' },
  },
  {
    _id: 'attraction-403',
    slug: 'ramoji-film-city-tour',
    title: 'Ramoji Film City Guided Studio Tour',
    categoryType: 'attractions',
    rating: 4.7,
    numReviews: 1540,
    bannerImage: 'https://images.unsplash.com/photo-1509198397868-475647b2a1e5',
    description: 'Explore the world’s largest film studio complex, movie sets, live stunts, and carnival parades.',
    location: { city: 'Hyderabad', venue: 'Ramoji Film City' },
    pricingTiers: [{ price: 1350, tierName: 'Day Pass' }],
    transitInfo: { category: 'Studio Tour', duration: '8 Hours' },
  },
];

export default function AttractionsPage() {
  const [attractions, setAttractions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [activeCategory, setActiveCategory] = useState('ALL');

  useEffect(() => {
    fetchAttractions();
  }, [activeCategory]);

  const fetchAttractions = async () => {
    setLoading(true);
    try {
      const res = await API.get('/listings?categoryType=attractions');
      if (res.data.success && res.data.data.listings.length > 0) {
        setAttractions(res.data.data.listings);
      } else {
        setAttractions(MOCK_ATTRACTIONS);
      }
    } catch (err) {
      setAttractions(MOCK_ATTRACTIONS);
    } finally {
      setLoading(false);
    }
  };

  const filteredAttractions = attractions.filter((a) =>
    a.title.toLowerCase().includes(search.toLowerCase()) ||
    a.location?.city?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-8 pb-12">
      {/* Page Header */}
      <div className="border-b border-[var(--border)] pb-6 space-y-2">
        <h1 className="text-3xl sm:text-4xl font-black text-[var(--foreground)] tracking-tight">
          Explore Attractions
        </h1>
        <p className="text-xs sm:text-sm text-[var(--muted-foreground)]">
          Theme parks, water worlds, guided studio tours, heritage museum passes, and adventure experiences.
        </p>
      </div>

      {/* Categories & Search Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-2 overflow-x-auto pb-2 sm:pb-0 scrollbar-none">
          {['ALL', 'THEME PARKS', 'MUSEUMS', 'EXPERIENCES', 'ADVENTURE', 'LOCAL'].map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
                activeCategory === cat
                  ? 'bg-gradient-to-r from-[var(--primary)] to-[var(--secondary)] text-white shadow-lg'
                  : 'bg-[var(--card)] text-[var(--muted-foreground)] hover:text-[var(--foreground)] border border-[var(--border)]'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        <div className="max-w-xs w-full">
          <GlassInput
            icon={Search}
            placeholder="Search park, city, tour..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      {/* Attractions Grid */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          <Skeleton className="h-72" count={6} />
        </div>
      ) : filteredAttractions.length === 0 ? (
        <GlassCard className="text-center py-20 space-y-3 bg-[var(--card)]">
          <Compass className="w-12 h-12 text-[var(--primary)] mx-auto opacity-80" />
          <p className="text-lg font-black text-[var(--foreground)]">No attractions found</p>
          <p className="text-xs text-[var(--muted-foreground)]">Try adjusting your search keywords.</p>
        </GlassCard>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredAttractions.map((item) => {
            const image = item.bannerImage || item.images?.[0] || MOCK_ATTRACTIONS[0].bannerImage;
            const price = item.pricingTiers?.[0]?.price || 1290;

            return (
              <GlassCard key={item._id} className="p-0 overflow-hidden flex flex-col justify-between group bg-[var(--card)]">
                <div className="relative h-52 overflow-hidden bg-[var(--muted)]">
                  <img
                    src={image}
                    alt={item.title}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute top-3 left-3 px-3 py-1 bg-[var(--card)]/90 backdrop-blur-md text-[var(--primary)] text-[10px] font-black rounded-full uppercase tracking-wider border border-[var(--border)]">
                    {item.transitInfo?.category || 'Attraction'}
                  </div>
                </div>

                <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-xs text-[var(--muted-foreground)]">
                      <span className="flex items-center gap-1 font-semibold">
                        <MapPin className="w-3.5 h-3.5 text-[var(--primary)]" />
                        {item.location?.venue || item.location?.city || 'Park'}
                      </span>
                      <RatingStars rating={item.rating || 4.8} numReviews={item.numReviews || 1200} />
                    </div>

                    <h3 className="font-black text-[var(--foreground)] text-lg line-clamp-1 group-hover:text-[var(--primary)] transition-colors">
                      {item.title}
                    </h3>

                    <p className="text-xs text-[var(--muted-foreground)] line-clamp-2 leading-relaxed">
                      {item.description}
                    </p>
                  </div>

                  <div className="pt-3 border-t border-[var(--border)] flex items-center justify-between">
                    <div>
                      <span className="text-[10px] uppercase font-bold text-[var(--muted-foreground)] block">Pass From</span>
                      <span className="text-xl font-black text-[var(--foreground)]">₹{price}</span>
                    </div>

                    <Link to={`/listings/${item.slug || item._id}`}>
                      <GlassButton size="sm" variant="gradient" icon={Ticket}>
                        Book Now
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
