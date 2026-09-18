import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import API from '../services/api';
import RatingStars from '../components/common/RatingStars';
import SkeletonLoader from '../components/common/SkeletonLoader';
import {
  Film,
  Music,
  Trophy,
  Bus,
  Train,
  Plane,
  Ticket,
  Search,
  MapPin,
  Calendar,
  ChevronRight,
  Sparkles,
} from 'lucide-react';

const CATEGORY_TABS = [
  { key: 'all', label: 'All Categories', icon: Sparkles },
  { key: 'movie', label: 'Movies', icon: Film },
  { key: 'event', label: 'Concerts & Events', icon: Music },
  { key: 'sports', label: 'Sports Matches', icon: Trophy },
  { key: 'bus', label: 'Bus Sleepers', icon: Bus },
  { key: 'train', label: 'Express Trains', icon: Train },
  { key: 'flight', label: 'Flights', icon: Plane },
  { key: 'attraction', label: 'Attractions', icon: Ticket },
];

export default function Home() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('all');
  const [featuredListings, setFeaturedListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCity, setSelectedCity] = useState('');

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

  const handleHeroSearch = (e) => {
    e.preventDefault();
    let url = '/listings?';
    if (searchQuery) url += `search=${encodeURIComponent(searchQuery)}&`;
    if (selectedCity) url += `city=${encodeURIComponent(selectedCity)}&`;
    if (activeTab !== 'all') url += `categoryType=${activeTab}`;
    navigate(url);
  };

  return (
    <div className="space-y-16 pb-12">
      
      {/* Hero Banner Section */}
      <section className="relative rounded-3xl overflow-hidden bg-gradient-to-br from-slate-900 via-navy-800 to-teal-950 text-white py-16 px-6 sm:px-12 shadow-2xl">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_30%,rgba(20,184,166,0.15),transparent)] pointer-events-none" />
        
        <div className="relative z-10 max-w-4xl mx-auto text-center space-y-6">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-teal-500/20 border border-teal-500/30 text-teal-300 text-xs font-semibold backdrop-blur-md">
            <Sparkles className="w-4 h-4 text-teal-400" /> Multi-Category Booking Made Effortless
          </div>
          
          <h1 className="text-4xl sm:text-6xl font-black tracking-tight leading-tight">
            Book Tickets For <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-400 via-emerald-300 to-indigo-300">Every Experience</span>
          </h1>
          
          <p className="text-slate-300 text-base sm:text-lg max-w-2xl mx-auto">
            Movies, Stadium Matches, Live Concerts, Buses, Trains, Flights, and Amusement Parks — all reserved in seconds on <strong className="text-teal-400">TicketHarbor</strong>.
          </p>

          {/* Hero Search Box */}
          <form
            onSubmit={handleHeroSearch}
            className="bg-white dark:bg-slate-800 p-3 rounded-2xl sm:rounded-full shadow-2xl flex flex-col sm:flex-row items-center gap-3 text-slate-800 dark:text-white max-w-3xl mx-auto border border-slate-100 dark:border-slate-700"
          >
            <div className="flex items-center gap-2 flex-1 px-3 w-full">
              <Search className="w-5 h-5 text-teal-500" />
              <input
                type="text"
                placeholder="Movie, artist, match, or bus route..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full text-sm font-medium bg-transparent focus:outline-none dark:text-white placeholder:text-slate-400"
              />
            </div>

            <div className="hidden sm:block h-6 w-px bg-slate-200 dark:bg-slate-700" />

            <div className="flex items-center gap-2 px-3 w-full sm:w-44">
              <MapPin className="w-5 h-5 text-indigo-500" />
              <select
                value={selectedCity}
                onChange={(e) => setSelectedCity(e.target.value)}
                className="w-full text-sm font-medium bg-transparent focus:outline-none dark:text-white dark:bg-slate-800"
              >
                <option value="">All Cities</option>
                <option value="Mumbai">Mumbai</option>
                <option value="Bengaluru">Bengaluru</option>
                <option value="Delhi">Delhi</option>
                <option value="Goa">Goa</option>
              </select>
            </div>

            <button
              type="submit"
              className="w-full sm:w-auto px-8 py-3.5 bg-gradient-to-r from-teal-500 to-indigo-600 hover:from-teal-600 hover:to-indigo-700 text-white font-bold rounded-xl sm:rounded-full shadow-lg transition-all flex items-center justify-center gap-2"
            >
              Search <ChevronRight className="w-4 h-4" />
            </button>
          </form>
        </div>
      </section>

      {/* Category Selection Tabs */}
      <section className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Explore Categories</h2>
            <p className="text-sm text-slate-500">Pick a category to filter upcoming shows & trips</p>
          </div>
        </div>

        <div className="flex items-center gap-3 overflow-x-auto pb-2 no-scrollbar">
          {CATEGORY_TABS.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.key;
            return (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`flex items-center gap-2.5 px-5 py-3 rounded-2xl text-sm font-bold whitespace-nowrap transition-all ${
                  isActive
                    ? 'bg-teal-500 text-white shadow-lg shadow-teal-500/30 scale-105'
                    : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-750'
                }`}
              >
                <Icon className="w-4 h-4" />
                {tab.label}
              </button>
            );
          })}
        </div>
      </section>

      {/* Featured / Trending Listings Grid */}
      <section className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Trending & Featured</h2>
            <p className="text-sm text-slate-500">Hand-picked top bookings across India</p>
          </div>
          <Link
            to="/listings"
            className="text-sm font-bold text-teal-600 dark:text-teal-400 hover:underline flex items-center gap-1"
          >
            View All <ChevronRight className="w-4 h-4" />
          </Link>
        </div>

        {loading ? (
          <SkeletonLoader count={6} />
        ) : featuredListings.length === 0 ? (
          <div className="text-center py-16 bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700">
            <p className="text-slate-500">No listings found in this category.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {featuredListings.map((item) => {
              const image = item.bannerImage || item.images?.[0] || 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba';
              const startingPrice = item.pricingTiers?.[0]?.price || 100;

              return (
                <div
                  key={item._id}
                  className="group bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col"
                >
                  <div className="relative h-48 overflow-hidden bg-slate-100 dark:bg-slate-700">
                    <img
                      src={image}
                      alt={item.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute top-3 left-3 px-3 py-1 bg-slate-900/80 backdrop-blur-md text-teal-400 text-xs font-bold rounded-full uppercase tracking-wider">
                      {item.categoryType}
                    </div>
                  </div>

                  <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-slate-500 flex items-center gap-1 font-medium">
                          <MapPin className="w-3.5 h-3.5 text-teal-500" />
                          {item.transitInfo?.source
                            ? `${item.transitInfo.source} → ${item.transitInfo.destination}`
                            : item.location?.city}
                        </span>
                        <RatingStars rating={item.rating} numReviews={item.numReviews} />
                      </div>

                      <h3 className="font-bold text-slate-900 dark:text-white line-clamp-1 group-hover:text-teal-600 dark:group-hover:text-teal-400 transition-colors">
                        {item.title}
                      </h3>
                      
                      <p className="text-xs text-slate-500 line-clamp-2">
                        {item.description}
                      </p>
                    </div>

                    <div className="pt-3 border-t border-slate-100 dark:border-slate-700 flex items-center justify-between">
                      <div>
                        <span className="text-xs text-slate-400 block">Starting from</span>
                        <span className="text-lg font-black text-slate-900 dark:text-white">
                          ₹{startingPrice}
                        </span>
                      </div>

                      <Link
                        to={`/listings/${item.slug || item._id}`}
                        className="px-4 py-2 text-xs font-bold text-white bg-teal-600 hover:bg-teal-700 rounded-xl shadow transition-colors"
                      >
                        Book Now
                      </Link>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

    </div>
  );
}
