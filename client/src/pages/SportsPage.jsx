import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import API from '../services/api';
import GlassCard from '../components/ui/GlassCard';
import GlassButton from '../components/ui/GlassButton';
import GlassInput from '../components/ui/GlassInput';
import RatingStars from '../components/common/RatingStars';
import Skeleton from '../components/ui/Skeleton';
import { Search, MapPin, Trophy, Calendar as CalendarIcon, Ticket } from 'lucide-react';

const MOCK_SPORTS = [
  {
    _id: 'sports-301',
    slug: 'india-vs-australia-t20',
    title: 'India vs Australia 3rd T20 International',
    categoryType: 'sports',
    rating: 4.9,
    numReviews: 2400,
    bannerImage: 'https://images.unsplash.com/photo-1540747913346-19e32dc3e97e',
    description: 'High-octane T20 cricket clash live at Wankhede Stadium. Experience stadium roar and luxury box seats.',
    location: { city: 'Mumbai', venue: 'Wankhede Stadium' },
    pricingTiers: [{ price: 1250, tierName: 'East Stand' }, { price: 4500, tierName: 'Pavilion Box' }],
    transitInfo: { date: '18 Nov 2026', time: '07:00 PM', sportType: 'Cricket', teams: 'India vs Australia' },
  },
  {
    _id: 'sports-302',
    slug: 'pro-kabaddi-league-finals',
    title: 'Pro Kabaddi League 2026 Grand Final',
    categoryType: 'sports',
    rating: 4.8,
    numReviews: 910,
    bannerImage: 'https://images.unsplash.com/photo-1574629810360-7efbbe195018',
    description: 'The top 2 kabaddi powerhouses clash for the trophy in an adrenaline-pumping indoor stadium atmosphere.',
    location: { city: 'Hyderabad', venue: 'Gachibowli Indoor Stadium' },
    pricingTiers: [{ price: 500, tierName: 'General' }, { price: 1800, tierName: 'VIP Ringside' }],
    transitInfo: { date: '22 Dec 2026', time: '08:00 PM', sportType: 'Kabaddi', teams: 'Telugu Titans vs Puneri Paltan' },
  },
  {
    _id: 'sports-303',
    slug: 'isl-football-derby',
    title: 'ISL Derby: Mohun Bagan vs East Bengal',
    categoryType: 'sports',
    rating: 4.9,
    numReviews: 3100,
    bannerImage: 'https://images.unsplash.com/photo-1508098682722-e99c43a406b2',
    description: 'The historic Kolkata football derby live at Salt Lake Stadium with 80,000 passionate fans.',
    location: { city: 'Kolkata', venue: 'Salt Lake Stadium (VYBK)' },
    pricingTiers: [{ price: 400, tierName: 'Gallery' }],
    transitInfo: { date: '04 Dec 2026', time: '07:30 PM', sportType: 'Football', teams: 'Mohun Bagan vs East Bengal' },
  },
];

export default function SportsPage() {
  const [sports, setSports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [activeSport, setActiveSport] = useState('ALL');

  useEffect(() => {
    fetchSports();
  }, [activeSport]);

  const fetchSports = async () => {
    setLoading(true);
    try {
      const res = await API.get('/listings?categoryType=sports');
      if (res.data.success && res.data.data.listings.length > 0) {
        setSports(res.data.data.listings);
      } else {
        setSports(MOCK_SPORTS);
      }
    } catch (err) {
      setSports(MOCK_SPORTS);
    } finally {
      setLoading(false);
    }
  };

  const filteredSports = sports.filter((s) =>
    s.title.toLowerCase().includes(search.toLowerCase()) ||
    s.location?.venue?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-8 pb-12">
      {/* Page Header */}
      <div className="border-b border-[var(--border)] pb-6 space-y-2">
        <h1 className="text-3xl sm:text-4xl font-black text-[var(--foreground)] tracking-tight">
          Book Sports Tickets
        </h1>
        <p className="text-xs sm:text-sm text-[var(--muted-foreground)]">
          Stadium seats for International Cricket, ISL Football, Pro Kabaddi, and Tennis tournaments.
        </p>
      </div>

      {/* Sport Category Filters */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-2 overflow-x-auto pb-2 sm:pb-0 scrollbar-none">
          {['ALL', 'CRICKET', 'FOOTBALL', 'KABADDI', 'BASKETBALL', 'TENNIS', 'OTHER'].map((sp) => (
            <button
              key={sp}
              onClick={() => setActiveSport(sp)}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
                activeSport === sp
                  ? 'bg-gradient-to-r from-[var(--primary)] to-[var(--secondary)] text-white shadow-lg'
                  : 'bg-[var(--card)] text-[var(--muted-foreground)] hover:text-[var(--foreground)] border border-[var(--border)]'
              }`}
            >
              {sp}
            </button>
          ))}
        </div>

        <div className="max-w-xs w-full">
          <GlassInput
            icon={Search}
            placeholder="Search team, stadium, tournament..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      {/* Sports Grid */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          <Skeleton className="h-72" count={6} />
        </div>
      ) : filteredSports.length === 0 ? (
        <GlassCard className="text-center py-20 space-y-3 bg-[var(--card)]">
          <Trophy className="w-12 h-12 text-[var(--primary)] mx-auto opacity-80" />
          <p className="text-lg font-black text-[var(--foreground)]">No sports matches found</p>
          <p className="text-xs text-[var(--muted-foreground)]">Try adjusting your search query or sport filter.</p>
        </GlassCard>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredSports.map((item) => {
            const image = item.bannerImage || item.images?.[0] || MOCK_SPORTS[0].bannerImage;
            const price = item.pricingTiers?.[0]?.price || 400;
            const matchDate = item.transitInfo?.date || 'Matchday';

            return (
              <GlassCard key={item._id} className="p-0 overflow-hidden flex flex-col justify-between group bg-[var(--card)]">
                <div className="relative h-52 overflow-hidden bg-[var(--muted)]">
                  <img
                    src={image}
                    alt={item.title}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute top-3 left-3 px-3 py-1 bg-[var(--card)]/90 backdrop-blur-md text-[var(--primary)] text-[10px] font-black rounded-full uppercase tracking-wider border border-[var(--border)]">
                    {item.transitInfo?.sportType || 'Sports'}
                  </div>
                </div>

                <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-xs text-[var(--muted-foreground)]">
                      <span className="flex items-center gap-1 font-semibold">
                        <MapPin className="w-3.5 h-3.5 text-[var(--primary)]" />
                        {item.location?.venue || item.location?.city || 'Stadium'}
                      </span>
                      <RatingStars rating={item.rating || 4.9} numReviews={item.numReviews || 800} />
                    </div>

                    <h3 className="font-black text-[var(--foreground)] text-lg line-clamp-1 group-hover:text-[var(--primary)] transition-colors">
                      {item.title}
                    </h3>

                    <p className="text-xs text-[var(--muted-foreground)] line-clamp-2 leading-relaxed">
                      {item.description}
                    </p>

                    <div className="flex items-center gap-3 text-xs text-[var(--muted-foreground)] pt-1 font-bold">
                      <span className="flex items-center gap-1 text-[var(--primary)]">
                        <CalendarIcon className="w-3.5 h-3.5" /> {matchDate}
                      </span>
                      <span>•</span>
                      <span>{item.transitInfo?.time || '07:00 PM'}</span>
                    </div>
                  </div>

                  <div className="pt-3 border-t border-[var(--border)] flex items-center justify-between">
                    <div>
                      <span className="text-[10px] uppercase font-bold text-[var(--muted-foreground)] block">Stand Passes From</span>
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
