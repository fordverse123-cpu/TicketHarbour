import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import API from '../services/api';
import GlassCard from '../components/ui/GlassCard';
import GlassButton from '../components/ui/GlassButton';
import RatingStars from '../components/common/RatingStars';
import Skeleton from '../components/ui/Skeleton';
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
} from 'lucide-react';

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
  { id: 'train', title: 'Train', icon: Train, emoji: '🚆', desc: 'Indian Railways train schedule & seat reservation', link: '/train' },
  { id: 'flight', title: 'Flights', icon: Plane, emoji: '✈️', desc: 'Domestic & international cheap flight tickets', link: '/flights' },
  { id: 'attractions', title: 'Attractions', icon: Ticket, emoji: '🎟️', desc: 'Amusement parks, water parks & city passes', link: '/attractions' },
];

export default function Home() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('all');
  const [searchCategory, setSearchCategory] = useState('movies');
  const [featuredListings, setFeaturedListings] = useState([]);
  const [loading, setLoading] = useState(true);

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
      let url = `/trains?`;
      if (fromCity) url += `from=${encodeURIComponent(fromCity)}&`;
      if (toCity) url += `to=${encodeURIComponent(toCity)}&`;
      if (travelDate) url += `date=${encodeURIComponent(travelDate)}&`;
      if (trainClass) url += `journeyClass=${encodeURIComponent(trainClass)}`;
      navigate(url);
    } else if (searchCategory === 'bus') {
      let url = `/buses?`;
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
      let url = `/listings?category=${searchCategory}&`;
      if (keyword) url += `search=${encodeURIComponent(keyword)}&`;
      if (fromCity) url += `city=${encodeURIComponent(fromCity)}`;
      navigate(url);
    }
  };

  return (
    <div className="space-y-16 pb-16">
      
      {/* GLOSSY HERO SECTION */}
      <section className="relative rounded-3xl overflow-hidden bg-harbour-card/90 border border-white/10 p-8 sm:p-14 shadow-2xl backdrop-blur-2xl">
        <div className="absolute top-0 right-0 w-96 h-96 bg-cyanAccent-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-indigoAccent-600/15 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 max-w-4xl mx-auto text-center space-y-6">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-cyanAccent-500/10 border border-cyanAccent-500/30 text-cyanAccent-400 text-xs font-bold backdrop-blur-md">
            <Zap className="w-4 h-4 text-cyanAccent-400" /> Unified Booking Platform
          </div>

          <h1 className="text-4xl sm:text-6xl font-black tracking-tight leading-tight text-white">
            Your Tickets. Your Journey. <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyanAccent-400 via-indigoAccent-400 to-indigoAccent-600">
              One Harbour.
            </span>
          </h1>

          <p className="text-slate-300 text-sm sm:text-base max-w-2xl mx-auto leading-relaxed">
            Book movies, events, sports, buses, trains, flights and attractions — all in one place.
          </p>

          {/* LARGE GLOSSY SEARCH PANEL */}
          <div className="pt-4 max-w-4xl mx-auto">
            <div className="bg-harbour-dark/90 border border-white/15 rounded-3xl p-4 sm:p-6 shadow-2xl backdrop-blur-2xl space-y-4">
              
              {/* Category Search Tabs */}
              <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none border-b border-white/10">
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
                          ? 'bg-gradient-to-r from-cyanAccent-500 to-indigoAccent-600 text-white shadow-lg'
                          : 'text-slate-400 hover:text-white hover:bg-white/5'
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
                      <label className="text-[11px] font-bold uppercase text-slate-400">From Station</label>
                      <input
                        type="text"
                        placeholder="e.g. Vijayawada (BZA)"
                        value={fromCity}
                        onChange={(e) => setFromCity(e.target.value)}
                        className="w-full bg-harbour-darker border border-white/15 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyanAccent-500"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[11px] font-bold uppercase text-slate-400">To Station</label>
                      <input
                        type="text"
                        placeholder="e.g. Hyderabad (SC)"
                        value={toCity}
                        onChange={(e) => setToCity(e.target.value)}
                        className="w-full bg-harbour-darker border border-white/15 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyanAccent-500"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[11px] font-bold uppercase text-slate-400">Date</label>
                      <input
                        type="date"
                        value={travelDate}
                        onChange={(e) => setTravelDate(e.target.value)}
                        className="w-full bg-harbour-darker border border-white/15 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-cyanAccent-500"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[11px] font-bold uppercase text-slate-400">Class</label>
                      <select
                        value={trainClass}
                        onChange={(e) => setTrainClass(e.target.value)}
                        className="w-full bg-harbour-darker border border-white/15 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-cyanAccent-500"
                      >
                        <option value="All">All Classes</option>
                        <option value="1A">First AC (1A)</option>
                        <option value="2A">2 Tier AC (2A)</option>
                        <option value="3A">3 Tier AC (3A)</option>
                        <option value="SL">Sleeper (SL)</option>
                      </select>
                    </div>
                  </>
                ) : searchCategory === 'bus' ? (
                  <>
                    <div className="space-y-1">
                      <label className="text-[11px] font-bold uppercase text-slate-400">From City</label>
                      <input
                        type="text"
                        placeholder="e.g. Hyderabad"
                        value={fromCity}
                        onChange={(e) => setFromCity(e.target.value)}
                        className="w-full bg-harbour-darker border border-white/15 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyanAccent-500"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[11px] font-bold uppercase text-slate-400">To City</label>
                      <input
                        type="text"
                        placeholder="e.g. Bengaluru"
                        value={toCity}
                        onChange={(e) => setToCity(e.target.value)}
                        className="w-full bg-harbour-darker border border-white/15 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyanAccent-500"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[11px] font-bold uppercase text-slate-400">Travel Date</label>
                      <input
                        type="date"
                        value={travelDate}
                        onChange={(e) => setTravelDate(e.target.value)}
                        className="w-full bg-harbour-darker border border-white/15 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-cyanAccent-500"
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
                      <label className="text-[11px] font-bold uppercase text-slate-400">Departure Airport</label>
                      <input
                        type="text"
                        placeholder="e.g. DEL (Delhi)"
                        value={fromCity}
                        onChange={(e) => setFromCity(e.target.value)}
                        className="w-full bg-harbour-darker border border-white/15 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyanAccent-500"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[11px] font-bold uppercase text-slate-400">Arrival Airport</label>
                      <input
                        type="text"
                        placeholder="e.g. BOM (Mumbai)"
                        value={toCity}
                        onChange={(e) => setToCity(e.target.value)}
                        className="w-full bg-harbour-darker border border-white/15 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyanAccent-500"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[11px] font-bold uppercase text-slate-400">Departure Date</label>
                      <input
                        type="date"
                        value={travelDate}
                        onChange={(e) => setTravelDate(e.target.value)}
                        className="w-full bg-harbour-darker border border-white/15 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-cyanAccent-500"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[11px] font-bold uppercase text-slate-400">Passengers</label>
                      <select
                        value={travellers}
                        onChange={(e) => setTravellers(e.target.value)}
                        className="w-full bg-harbour-darker border border-white/15 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-cyanAccent-500"
                      >
                        <option value="1">1 Passenger</option>
                        <option value="2">2 Passengers</option>
                        <option value="3">3 Passengers</option>
                        <option value="4+">4+ Passengers</option>
                      </select>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="space-y-1 lg:col-span-2">
                      <label className="text-[11px] font-bold uppercase text-slate-400">Search Keywords</label>
                      <input
                        type="text"
                        placeholder="Movie name, concert artist, match..."
                        value={keyword}
                        onChange={(e) => setKeyword(e.target.value)}
                        className="w-full bg-harbour-darker border border-white/15 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyanAccent-500"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[11px] font-bold uppercase text-slate-400">City</label>
                      <input
                        type="text"
                        placeholder="e.g. Mumbai"
                        value={fromCity}
                        onChange={(e) => setFromCity(e.target.value)}
                        className="w-full bg-harbour-darker border border-white/15 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyanAccent-500"
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
            <h2 className="text-2xl font-black text-white tracking-tight">Explore Booking Categories</h2>
            <p className="text-xs text-slate-400">Instant reservation for entertainment, transit & travel</p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {CATEGORY_CARDS.map((cat) => (
            <GlassCard key={cat.id} hover={true} className="flex flex-col justify-between space-y-4 group">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-3xl">{cat.emoji}</span>
                  <div className="p-2 rounded-xl bg-white/5 border border-white/10 group-hover:border-cyanAccent-500/40 transition-colors">
                    <cat.icon className="w-5 h-5 text-cyanAccent-400" />
                  </div>
                </div>

                <h3 className="text-lg font-black text-white group-hover:text-cyanAccent-400 transition-colors">
                  {cat.title}
                </h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  {cat.desc}
                </p>
              </div>

              <Link
                to={cat.link}
                className="flex items-center gap-2 text-xs font-bold text-cyanAccent-400 group-hover:translate-x-1 transition-transform"
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
            <h2 className="text-2xl font-black text-white tracking-tight">Featured & Trending Bookings</h2>
            <p className="text-xs text-slate-400">Handpicked movies, events, sports matches & journeys</p>
          </div>
          <Link
            to="/listings"
            className="text-xs font-bold text-cyanAccent-400 hover:underline flex items-center gap-1"
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
                    ? 'bg-gradient-to-r from-cyanAccent-500 to-indigoAccent-600 text-white shadow-md'
                    : 'bg-white/5 text-slate-400 hover:text-white border border-white/10'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            <Skeleton className="h-64" count={6} />
          </div>
        ) : featuredListings.length === 0 ? (
          <GlassCard className="text-center py-16">
            <p className="text-sm text-slate-400">No listings found in this category.</p>
          </GlassCard>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {featuredListings.map((item) => {
              const image = item.bannerImage || item.images?.[0] || 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba';
              const startingPrice = item.pricingTiers?.[0]?.price || 150;

              return (
                <GlassCard key={item._id} className="p-0 overflow-hidden flex flex-col justify-between group">
                  <div className="relative h-48 overflow-hidden bg-harbour-darker">
                    <img
                      src={image}
                      alt={item.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute top-3 left-3 px-3 py-1 bg-black/75 backdrop-blur-md text-cyanAccent-400 text-[10px] font-black rounded-full uppercase tracking-wider border border-white/10">
                      {item.categoryType}
                    </div>
                  </div>

                  <div className="p-5 space-y-4 flex-1 flex flex-col justify-between">
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-xs text-slate-400">
                        <span className="flex items-center gap-1 font-semibold">
                          <MapPin className="w-3.5 h-3.5 text-cyanAccent-400" />
                          {item.location?.city || 'All Cities'}
                        </span>
                        <RatingStars rating={item.rating} numReviews={item.numReviews} />
                      </div>

                      <h3 className="font-black text-white text-base line-clamp-1 group-hover:text-cyanAccent-400 transition-colors">
                        {item.title}
                      </h3>
                      
                      <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed">
                        {item.description}
                      </p>
                    </div>

                    <div className="pt-3 border-t border-white/10 flex items-center justify-between">
                      <div>
                        <span className="text-[10px] uppercase font-bold text-slate-400 block">Starting from</span>
                        <span className="text-lg font-black text-white">
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

    </div>
  );
}

