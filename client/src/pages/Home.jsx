import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import API from '../services/api';
import GlassCard from '../components/ui/GlassCard';
import GlassButton from '../components/ui/GlassButton';
import RatingStars from '../components/common/RatingStars';
import { CardSkeletonGrid, EventCardSkeleton } from '../components/loading';
import {
  Film,
  Calendar,
  Trophy,
  Bus,
  Train,
  Plane,
  Ticket,
  Search,
  MapPin,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Zap,
  Clock,
  Globe,
  Layers,
  CheckCircle,
} from 'lucide-react';
import { getRecentlyViewed } from '../utils/recentlyViewed';

const CATEGORY_TABS = [
  { key: 'all', label: 'All', icon: Sparkles },
  { key: 'movies', label: 'Movies', icon: Film },
  { key: 'events', label: 'Events', icon: Calendar },
  { key: 'sports', label: 'Sports', icon: Trophy },
  { key: 'bus', label: 'Bus', icon: Bus },
  { key: 'train', label: 'Train', icon: Train },
  { key: 'flight', label: 'Flights', icon: Plane },
  { key: 'attractions', label: 'Attractions', icon: Ticket },
];

const CATEGORY_CARDS = [
  { id: 'movies', title: 'Movies', icon: Film, emoji: '🎬', desc: 'Book latest blockbuster movies & IMAX seats', link: '/movies' },
  { id: 'events', title: 'Events', icon: Calendar, emoji: '🎵', desc: 'Live concerts, music festivals & standup comedy', link: '/events' },
  { id: 'sports', title: 'Sports', icon: Trophy, emoji: '🏆', desc: 'Cricket, football, IPL & stadium matches', link: '/sports' },
  { id: 'bus', title: 'Bus', icon: Bus, emoji: '🚌', desc: 'Intercity AC sleeper & Volvo bus tickets', link: '/bus' },
  { id: 'train', title: 'Train', icon: Train, emoji: '🚆', desc: 'Indian Railways train schedule & ticket reservation', link: '/train' },
  { id: 'flight', title: 'Flights', icon: Plane, emoji: '✈️', desc: 'Domestic & international cheap flight tickets', link: '/flights' },
  { id: 'attractions', title: 'Attractions', icon: Ticket, emoji: '🎟️', desc: 'Amusement parks, water parks & city passes', link: '/attractions' },
];

const WHY_US_CARDS = [
  {
    title: 'Secure Booking',
    desc: 'Encrypted checkout, instant ticket confirmation & 100% verified gate entry QR codes.',
    icon: ShieldCheck,
    color: 'from-cyanAccent-500/20 to-cyanAccent-600/10 text-cyanAccent-400 border-cyanAccent-500/30',
  },
  {
    title: 'Fast Booking',
    desc: 'Reserve tickets in under 30 seconds with 1-click seating, coupons & instant PDF downloads.',
    icon: Zap,
    color: 'from-amber-500/20 to-amber-600/10 text-amber-400 border-amber-500/30',
  },
  {
    title: 'Multiple Ticket Categories',
    desc: 'Access Movies, Events, Sports, Trains, Buses & Flights seamlessly on a single platform.',
    icon: Layers,
    color: 'from-indigoAccent-500/20 to-indigoAccent-600/10 text-indigoAccent-400 border-indigoAccent-500/30',
  },
  {
    title: 'Book Anywhere',
    desc: 'Fully mobile-optimized web app accessible anytime from your phone, tablet, or laptop.',
    icon: Globe,
    color: 'from-emerald-500/20 to-emerald-600/10 text-emerald-400 border-emerald-500/30',
  },
];

export default function Home() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('all');
  const [searchCategory, setSearchCategory] = useState('movies');
  const [featuredListings, setFeaturedListings] = useState([]);
  const [recentlyViewedItems, setRecentlyViewedItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setRecentlyViewedItems(getRecentlyViewed());
  }, []);

  // Search Fields State
  const [keyword, setKeyword] = useState('');
  const [fromCity, setFromCity] = useState('');
  const [toCity, setToCity] = useState('');
  const [travelDate, setTravelDate] = useState('');
  const [trainClass, setTrainClass] = useState('All');
  const [travellers, setTravellers] = useState('1');

  useEffect(() => {
    fetchFeatured();
  }, [activeTab]);

  const fetchFeatured = async () => {
    setLoading(true);
    try {
      const categoryParam = activeTab !== 'all' ? `&categoryType=${activeTab}` : '';
      const res = await API.get(`/listings?featured=true${categoryParam}&limit=6`);
      if (res.data.success) {
        setFeaturedListings(res.data.data.listings);
      }
    } catch (err) {
      console.error('Error fetching listings:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleUnifiedSearch = (e) => {
    e.preventDefault();
    if (searchCategory === 'train') {
      let url = `/train?`;
      if (fromCity) url += `from=${encodeURIComponent(fromCity)}&`;
      if (toCity) url += `to=${encodeURIComponent(toCity)}&`;
      if (travelDate) url += `date=${encodeURIComponent(travelDate)}&`;
      if (trainClass) url += `journeyClass=${encodeURIComponent(trainClass)}`;
      navigate(url);
    } else if (searchCategory === 'bus') {
      let url = `/bus?`;
      if (fromCity) url += `from=${encodeURIComponent(fromCity)}&`;
      if (toCity) url += `to=${encodeURIComponent(toCity)}&`;
      if (travelDate) url += `date=${encodeURIComponent(travelDate)}`;
      navigate(url);
    } else if (searchCategory === 'flight') {
      let url = `/flights?`;
      if (fromCity) url += `from=${encodeURIComponent(fromCity)}&`;
      if (toCity) url += `to=${encodeURIComponent(toCity)}&`;
      if (travelDate) url += `date=${encodeURIComponent(travelDate)}&`;
      if (travellers) url += `passengers=${encodeURIComponent(travellers)}`;
      navigate(url);
    } else {
      let url = `/listings?categoryType=${searchCategory}&`;
      if (keyword) url += `search=${encodeURIComponent(keyword)}&`;
      if (fromCity) url += `location=${encodeURIComponent(fromCity)}`;
      navigate(url);
    }
  };

  return (
    <div className="space-y-16 pb-16">
      
      {/* GLOSSY HERO SECTION */}
      <section className="relative rounded-3xl overflow-hidden bg-[var(--card)] border border-[var(--border)] p-8 sm:p-14 shadow-2xl backdrop-blur-2xl">
        <div className="absolute top-0 right-0 w-96 h-96 bg-[var(--primary)]/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-[var(--secondary)]/15 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 max-w-4xl mx-auto text-center space-y-6">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[var(--primary)]/10 border border-[var(--primary)]/30 text-[var(--primary)] text-xs font-bold backdrop-blur-md">
            <Zap className="w-4 h-4 text-[var(--primary)]" /> Unified Booking Platform
          </div>

          <h1 className="text-4xl sm:text-6xl font-black tracking-tight leading-tight text-[var(--foreground)]">
            Your Tickets. Your Journey. <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[var(--primary)] via-[var(--secondary)] to-[var(--accent)]">
              One Harbour.
            </span>
          </h1>

          <p className="text-[var(--muted-foreground)] text-sm sm:text-base max-w-2xl mx-auto leading-relaxed">
            Book movies, events, sports, buses, trains, flights and attractions — all in one place.
          </p>

          {/* LARGE GLOSSY SEARCH PANEL */}
          <div className="pt-4 max-w-4xl mx-auto">
            <div className="bg-[var(--card)] border border-[var(--border)] rounded-3xl p-4 sm:p-6 shadow-2xl backdrop-blur-2xl space-y-4">
              
              {/* Category Search Tabs */}
              <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none border-b border-[var(--border)]">
                {CATEGORY_CARDS.map((cat) => {
                  const Icon = cat.icon;
                  const isSel = searchCategory === cat.id;
                  return (
                    <button
                      key={cat.id}
                      type="button"
                      onClick={() => setSearchCategory(cat.id)}
                      className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                        isSel
                          ? 'bg-gradient-to-r from-[var(--primary)] to-[var(--secondary)] text-white shadow-lg'
                          : 'text-[var(--muted-foreground)] hover:text-[var(--foreground)] hover:bg-[var(--muted)]'
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                      <span>{cat.title}</span>
                    </button>
                  );
                })}
              </div>

              {/* Dynamic Inputs Form */}
              <form onSubmit={handleUnifiedSearch} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-left pt-2">
                {searchCategory === 'train' ? (
                  <>
                    <div className="space-y-1">
                      <label className="text-[11px] font-bold uppercase text-[var(--muted-foreground)]">From Station</label>
                      <input
                        type="text"
                        placeholder="e.g. Vijayawada (BZA)"
                        value={fromCity}
                        onChange={(e) => setFromCity(e.target.value)}
                        className="w-full bg-[var(--input)] border border-[var(--border)] rounded-xl px-3.5 py-2.5 text-xs text-[var(--foreground)] placeholder-[var(--muted-foreground)] focus:outline-none focus:border-[var(--primary)]"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[11px] font-bold uppercase text-[var(--muted-foreground)]">To Station</label>
                      <input
                        type="text"
                        placeholder="e.g. Hyderabad (SC)"
                        value={toCity}
                        onChange={(e) => setToCity(e.target.value)}
                        className="w-full bg-[var(--input)] border border-[var(--border)] rounded-xl px-3.5 py-2.5 text-xs text-[var(--foreground)] placeholder-[var(--muted-foreground)] focus:outline-none focus:border-[var(--primary)]"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[11px] font-bold uppercase text-[var(--muted-foreground)]">Date</label>
                      <input
                        type="date"
                        value={travelDate}
                        onChange={(e) => setTravelDate(e.target.value)}
                        className="w-full bg-[var(--input)] border border-[var(--border)] rounded-xl px-3.5 py-2.5 text-xs text-[var(--foreground)] focus:outline-none focus:border-[var(--primary)]"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[11px] font-bold uppercase text-[var(--muted-foreground)]">Class</label>
                      <select
                        value={trainClass}
                        onChange={(e) => setTrainClass(e.target.value)}
                        className="w-full bg-[var(--input)] border border-[var(--border)] rounded-xl px-3.5 py-2.5 text-xs text-[var(--foreground)] focus:outline-none focus:border-[var(--primary)]"
                      >
                        <option value="All" className="bg-[var(--card)] text-[var(--foreground)]">All Classes</option>
                        <option value="1A" className="bg-[var(--card)] text-[var(--foreground)]">First AC (1A)</option>
                        <option value="2A" className="bg-[var(--card)] text-[var(--foreground)]">2 Tier AC (2A)</option>
                        <option value="3A" className="bg-[var(--card)] text-[var(--foreground)]">3 Tier AC (3A)</option>
                        <option value="SL" className="bg-[var(--card)] text-[var(--foreground)]">Sleeper (SL)</option>
                      </select>
                    </div>
                  </>
                ) : searchCategory === 'bus' ? (
                  <>
                    <div className="space-y-1">
                      <label className="text-[11px] font-bold uppercase text-[var(--muted-foreground)]">From City</label>
                      <input
                        type="text"
                        placeholder="e.g. Hyderabad"
                        value={fromCity}
                        onChange={(e) => setFromCity(e.target.value)}
                        className="w-full bg-[var(--input)] border border-[var(--border)] rounded-xl px-3.5 py-2.5 text-xs text-[var(--foreground)] placeholder-[var(--muted-foreground)] focus:outline-none focus:border-[var(--primary)]"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[11px] font-bold uppercase text-[var(--muted-foreground)]">To City</label>
                      <input
                        type="text"
                        placeholder="e.g. Bengaluru"
                        value={toCity}
                        onChange={(e) => setToCity(e.target.value)}
                        className="w-full bg-[var(--input)] border border-[var(--border)] rounded-xl px-3.5 py-2.5 text-xs text-[var(--foreground)] placeholder-[var(--muted-foreground)] focus:outline-none focus:border-[var(--primary)]"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[11px] font-bold uppercase text-[var(--muted-foreground)]">Travel Date</label>
                      <input
                        type="date"
                        value={travelDate}
                        onChange={(e) => setTravelDate(e.target.value)}
                        className="w-full bg-[var(--input)] border border-[var(--border)] rounded-xl px-3.5 py-2.5 text-xs text-[var(--foreground)] focus:outline-none focus:border-[var(--primary)]"
                      />
                    </div>
                    <div className="flex items-end">
                      <GlassButton type="submit" className="w-full py-2.5" icon={Search}>
                        Search Buses
                      </GlassButton>
                    </div>
                  </>
                ) : searchCategory === 'flight' ? (
                  <>
                    <div className="space-y-1">
                      <label className="text-[11px] font-bold uppercase text-[var(--muted-foreground)]">Departure Airport</label>
                      <input
                        type="text"
                        placeholder="e.g. DEL (Delhi)"
                        value={fromCity}
                        onChange={(e) => setFromCity(e.target.value)}
                        className="w-full bg-[var(--input)] border border-[var(--border)] rounded-xl px-3.5 py-2.5 text-xs text-[var(--foreground)] placeholder-[var(--muted-foreground)] focus:outline-none focus:border-[var(--primary)]"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[11px] font-bold uppercase text-[var(--muted-foreground)]">Arrival Airport</label>
                      <input
                        type="text"
                        placeholder="e.g. BOM (Mumbai)"
                        value={toCity}
                        onChange={(e) => setToCity(e.target.value)}
                        className="w-full bg-[var(--input)] border border-[var(--border)] rounded-xl px-3.5 py-2.5 text-xs text-[var(--foreground)] placeholder-[var(--muted-foreground)] focus:outline-none focus:border-[var(--primary)]"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[11px] font-bold uppercase text-[var(--muted-foreground)]">Departure Date</label>
                      <input
                        type="date"
                        value={travelDate}
                        onChange={(e) => setTravelDate(e.target.value)}
                        className="w-full bg-[var(--input)] border border-[var(--border)] rounded-xl px-3.5 py-2.5 text-xs text-[var(--foreground)] focus:outline-none focus:border-[var(--primary)]"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[11px] font-bold uppercase text-[var(--muted-foreground)]">Passengers</label>
                      <select
                        value={travellers}
                        onChange={(e) => setTravellers(e.target.value)}
                        className="w-full bg-[var(--input)] border border-[var(--border)] rounded-xl px-3.5 py-2.5 text-xs text-[var(--foreground)] focus:outline-none focus:border-[var(--primary)]"
                      >
                        <option value="1" className="bg-[var(--card)] text-[var(--foreground)]">1 Passenger</option>
                        <option value="2" className="bg-[var(--card)] text-[var(--foreground)]">2 Passengers</option>
                        <option value="3" className="bg-[var(--card)] text-[var(--foreground)]">3 Passengers</option>
                        <option value="4+" className="bg-[var(--card)] text-[var(--foreground)]">4+ Passengers</option>
                      </select>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="space-y-1 lg:col-span-2">
                      <label className="text-[11px] font-bold uppercase text-[var(--muted-foreground)]">Search Keywords</label>
                      <input
                        type="text"
                        placeholder="Movie name, concert artist, match..."
                        value={keyword}
                        onChange={(e) => setKeyword(e.target.value)}
                        className="w-full bg-[var(--input)] border border-[var(--border)] rounded-xl px-3.5 py-2.5 text-xs text-[var(--foreground)] placeholder-[var(--muted-foreground)] focus:outline-none focus:border-[var(--primary)]"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[11px] font-bold uppercase text-[var(--muted-foreground)]">City</label>
                      <input
                        type="text"
                        placeholder="e.g. Mumbai"
                        value={fromCity}
                        onChange={(e) => setFromCity(e.target.value)}
                        className="w-full bg-[var(--input)] border border-[var(--border)] rounded-xl px-3.5 py-2.5 text-xs text-[var(--foreground)] placeholder-[var(--muted-foreground)] focus:outline-none focus:border-[var(--primary)]"
                      />
                    </div>
                    <div className="flex items-end">
                      <GlassButton type="submit" className="w-full py-2.5" icon={Search}>
                        Search {searchCategory.toUpperCase()}
                      </GlassButton>
                    </div>
                  </>
                )}
              </form>

              {(searchCategory === 'train' || searchCategory === 'flight') && (
                <div className="pt-2">
                  <GlassButton type="submit" onClick={handleUnifiedSearch} className="w-full py-3" icon={Search}>
                    Search {searchCategory.toUpperCase()}
                  </GlassButton>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* CATEGORY CARDS SECTION */}
      <section className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-black text-[var(--foreground)] tracking-tight">Explore Booking Categories</h2>
            <p className="text-xs text-[var(--muted-foreground)]">Instant reservation for entertainment, transit & travel</p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {CATEGORY_CARDS.map((cat) => (
            <GlassCard key={cat.id} hover={true} className="flex flex-col justify-between space-y-4 group bg-[var(--card)]">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-3xl">{cat.emoji}</span>
                  <div className="p-2 rounded-xl bg-[var(--muted)] border border-[var(--border)] group-hover:border-[var(--primary)]/40 transition-colors">
                    <cat.icon className="w-5 h-5 text-[var(--primary)]" />
                  </div>
                </div>

                <h3 className="text-lg font-black text-[var(--foreground)] group-hover:text-[var(--primary)] transition-colors">
                  {cat.title}
                </h3>
                <p className="text-xs text-[var(--muted-foreground)] leading-relaxed">
                  {cat.desc}
                </p>
              </div>

              <Link
                to={cat.link}
                className="flex items-center gap-2 text-xs font-bold text-[var(--primary)]"
              >
                <span>Book Now</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </GlassCard>
          ))}
        </div>
      </section>

      {/* FEATURED / TRENDING SHOWCASE */}
      <section className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-black text-[var(--foreground)] tracking-tight">Featured & Trending Bookings</h2>
            <p className="text-xs text-[var(--muted-foreground)]">Handpicked movies, events, sports matches & journeys</p>
          </div>
          <Link
            to="/listings"
            className="text-xs font-bold text-[var(--primary)] hover:underline flex items-center gap-1"
          >
            <span>View All</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {/* Category Filter Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
          {CATEGORY_TABS.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.key;
            return (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                  isActive
                    ? 'bg-gradient-to-r from-[var(--primary)] to-[var(--secondary)] text-white shadow-md'
                    : 'bg-[var(--card)] text-[var(--muted-foreground)] hover:text-[var(--foreground)] border border-[var(--border)]'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {loading ? (
          <CardSkeletonGrid
            count={6}
            CardSkeletonComponent={EventCardSkeleton}
            gridClassName="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
            ariaLabel="Loading featured listings..."
          />
        ) : featuredListings.length === 0 ? (
          <GlassCard className="text-center py-16 bg-[var(--card)]">
            <p className="text-sm text-[var(--muted-foreground)]">No listings found in this category.</p>
          </GlassCard>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {featuredListings.map((item) => {
              const image = item.bannerImage || item.images?.[0] || 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba';
              const startingPrice = item.pricingTiers?.[0]?.price || 150;

              return (
                <GlassCard key={item._id} className="p-0 overflow-hidden flex flex-col justify-between group bg-[var(--card)]">
                  <div className="relative h-48 overflow-hidden bg-[var(--muted)]">
                    <img
                      src={image}
                      alt={item.title}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute top-3 left-3 px-3 py-1 bg-[var(--card)]/90 backdrop-blur-md text-[var(--primary)] text-[10px] font-black rounded-full uppercase tracking-wider border border-[var(--border)]">
                      {item.categoryType}
                    </div>
                  </div>

                  <div className="p-5 space-y-4 flex-1 flex flex-col justify-between">
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-xs text-[var(--muted-foreground)]">
                        <span className="flex items-center gap-1 font-semibold">
                          <MapPin className="w-3.5 h-3.5 text-[var(--primary)]" />
                          {item.location?.city || 'All Cities'}
                        </span>
                        <RatingStars rating={item.rating} numReviews={item.numReviews} />
                      </div>

                      <h3 className="font-black text-[var(--foreground)] text-base line-clamp-1 group-hover:text-[var(--primary)] transition-colors">
                        {item.title}
                      </h3>
                      
                      <p className="text-xs text-[var(--muted-foreground)] line-clamp-2 leading-relaxed">
                        {item.description}
                      </p>
                    </div>

                    <div className="pt-3 border-t border-[var(--border)] flex items-center justify-between">
                      <div>
                        <span className="text-[10px] uppercase font-bold text-[var(--muted-foreground)] block">Starting from</span>
                        <span className="text-lg font-black text-[var(--foreground)]">
                          ₹{startingPrice}
                        </span>
                      </div>

                      <Link to={`/listings/${item.slug || item._id}`}>
                        <GlassButton size="sm" variant="gradient">
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
      </section>

      {/* RECENTLY VIEWED LISTINGS (IF ANY) */}
      {recentlyViewedItems.length > 0 && (
        <section className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigoAccent-500/15 text-[#03B3C3] border border-indigoAccent-500/30 text-[10px] font-black uppercase tracking-wider">
                <Clock className="w-3 h-3" /> Quick Access
              </span>
              <h2 className="text-2xl font-black text-white tracking-tight">Recently Viewed Tickets</h2>
            </div>
            <button
              onClick={() => {
                localStorage.removeItem('ticketharbour_recently_viewed');
                setRecentlyViewedItems([]);
              }}
              className="text-xs font-bold text-slate-400 hover:text-rose-400 hover:underline"
            >
              Clear History
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {recentlyViewedItems.map((item) => (
              <GlassCard key={item._id} className="p-0 overflow-hidden flex flex-col justify-between group bg-[#151515]">
                <div className="relative h-44 overflow-hidden bg-harbour-darker">
                  <img src={item.bannerImage} alt={item.title} className="w-full h-full object-cover" />
                  <div className="absolute top-3 left-3 px-3 py-1 bg-black/75 backdrop-blur-md text-[#03B3C3] text-[10px] font-black rounded-full uppercase border border-white/10">
                    {item.categoryType}
                  </div>
                </div>

                <div className="p-4 space-y-3 flex-1 flex flex-col justify-between">
                  <div className="space-y-1">
                    <h3 className="font-black text-white text-sm line-clamp-1 group-hover:text-[#03B3C3] transition-colors">
                      {item.title}
                    </h3>
                    <p className="text-xs text-slate-400 flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5 text-[#03B3C3]" /> {item.city}
                    </p>
                  </div>

                  <div className="pt-2 border-t border-white/10 flex items-center justify-between">
                    <span className="text-sm font-black text-white">₹{item.price}</span>
                    <Link to={`/listings/${item.slug || item._id}`}>
                      <GlassButton size="sm" variant="gradient">
                        Book Again
                      </GlassButton>
                    </Link>
                  </div>
                </div>
              </GlassCard>
            ))}
          </div>
        </section>
      )}

      {/* WHY TICKETHARBOUR? FEATURE CARDS */}
      <section className="space-y-6">
        <div className="text-center max-w-2xl mx-auto space-y-2">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#03B3C3]/15 text-[#03B3C3] border border-[#03B3C3]/30 text-[10px] font-black uppercase tracking-wider">
            <CheckCircle className="w-3 h-3" /> Trusted Ticket Platform
          </span>
          <h2 className="text-3xl font-black text-white tracking-tight">Why TicketHarbour?</h2>
          <p className="text-xs sm:text-sm text-slate-400">
            Engineered for high-speed ticket reservation, transparent pricing, and instant entry verification.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {WHY_US_CARDS.map((card, idx) => {
            const Icon = card.icon;
            return (
              <GlassCard key={idx} hover={true} className="p-6 space-y-4 text-left border border-white/10 flex flex-col justify-between">
                <div className="space-y-3">
                  <div className={`p-3 rounded-2xl bg-gradient-to-br ${card.color} w-fit border`}>
                    <Icon className="w-6 h-6" />
                  </div>
                  <h3 className="text-lg font-black text-white">{card.title}</h3>
                  <p className="text-xs text-slate-400 leading-relaxed">{card.desc}</p>
                </div>
              </GlassCard>
            );
          })}
        </div>
      </section>

    </div>
  );
}
