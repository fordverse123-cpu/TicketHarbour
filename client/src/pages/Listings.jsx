import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import API from '../services/api';
import GlassCard from '../components/ui/GlassCard';
import GlassButton from '../components/ui/GlassButton';
import GlassInput from '../components/ui/GlassInput';
import RatingStars from '../components/common/RatingStars';
import Skeleton from '../components/ui/Skeleton';
import { Search, MapPin, SlidersHorizontal, ChevronLeft, ChevronRight, Filter } from 'lucide-react';

export default function Listings() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [meta, setMeta] = useState({ page: 1, totalPages: 1, total: 0 });

  // Filters state initialized from URL
  const [search, setSearch] = useState(searchParams.get('search') || '');
  const [categoryType, setCategoryType] = useState(searchParams.get('categoryType') || searchParams.get('category') || '');
  const [city, setCity] = useState(searchParams.get('city') || '');
  const [sort, setSort] = useState(searchParams.get('sort') || '-createdAt');
  const [minPrice, setMinPrice] = useState(searchParams.get('minPrice') || '');
  const [maxPrice, setMaxPrice] = useState(searchParams.get('maxPrice') || '');

  useEffect(() => {
    fetchListings();
  }, [searchParams]);

  const fetchListings = async () => {
    setLoading(true);
    try {
      const queryStr = searchParams.toString();
      const res = await API.get(`/listings?${queryStr}`);
      if (res.data.success) {
        setListings(res.data.data.listings);
        setMeta(res.data.meta);
      }
    } catch (err) {
      console.error('Error fetching listings:', err);
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = (e) => {
    if (e) e.preventDefault();
    const params = new URLSearchParams();
    if (search) params.set('search', search);
    if (categoryType) params.set('categoryType', categoryType);
    if (city) params.set('city', city);
    if (sort) params.set('sort', sort);
    if (minPrice) params.set('minPrice', minPrice);
    if (maxPrice) params.set('maxPrice', maxPrice);
    params.set('page', '1');
    setSearchParams(params);
  };

  const handlePageChange = (newPage) => {
    const params = new URLSearchParams(searchParams);
    params.set('page', newPage.toString());
    setSearchParams(params);
  };

  return (
    <div className="space-y-8 pb-12">
      
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/10 pb-6">
        <div>
          <h1 className="text-3xl font-black text-white tracking-tight">
            Explore Booking Listings
          </h1>
          <p className="text-xs text-slate-400">
            Found {meta.total || 0} active shows, trips, and events
          </p>
        </div>

        {/* Sort Controls */}
        <div className="flex items-center gap-3">
          <label className="text-xs font-bold text-slate-400 uppercase">Sort by:</label>
          <select
            value={sort}
            onChange={(e) => {
              setSort(e.target.value);
              const params = new URLSearchParams(searchParams);
              params.set('sort', e.target.value);
              setSearchParams(params);
            }}
            className="px-3.5 py-2 text-xs bg-harbour-dark border border-white/15 rounded-xl text-white focus:outline-none focus:border-cyanAccent-500"
          >
            <option value="-createdAt">Newest First</option>
            <option value="price-asc">Price: Low to High</option>
            <option value="price-desc">Price: High to Low</option>
            <option value="rating">Top Rated</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        
        {/* Sidebar Filters */}
        <aside className="lg:col-span-1 space-y-6 bg-harbour-card/90 backdrop-blur-xl p-6 rounded-3xl border border-white/10 h-fit shadow-xl">
          <div className="flex items-center justify-between pb-4 border-b border-white/10">
            <h2 className="font-black text-white text-sm flex items-center gap-2">
              <SlidersHorizontal className="w-4 h-4 text-cyanAccent-400" /> Filters
            </h2>
            <button
              onClick={() => {
                setSearch('');
                setCategoryType('');
                setCity('');
                setMinPrice('');
                setMaxPrice('');
                setSearchParams(new URLSearchParams());
              }}
              className="text-xs font-bold text-cyanAccent-400 hover:underline"
            >
              Reset All
            </button>
          </div>

          <form onSubmit={applyFilters} className="space-y-4 text-xs">
            <GlassInput
              label="Keyword Search"
              icon={Search}
              placeholder="Title, artist, city..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />

            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-slate-300 uppercase">Category</label>
              <select
                value={categoryType}
                onChange={(e) => setCategoryType(e.target.value)}
                className="w-full p-3 bg-harbour-dark border border-white/15 rounded-xl text-xs text-white focus:outline-none focus:border-cyanAccent-500"
              >
                <option value="">All Categories</option>
                <option value="movies">Movies</option>
                <option value="events">Events & Concerts</option>
                <option value="sports">Sports Matches</option>
                <option value="bus">Bus Sleepers</option>
                <option value="train">Train Express</option>
                <option value="flight">Flights</option>
                <option value="attractions">Attractions</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-slate-300 uppercase">City / Location</label>
              <select
                value={city}
                onChange={(e) => setCity(e.target.value)}
                className="w-full p-3 bg-harbour-dark border border-white/15 rounded-xl text-xs text-white focus:outline-none focus:border-cyanAccent-500"
              >
                <option value="">All Cities</option>
                <option value="Mumbai">Mumbai</option>
                <option value="Bengaluru">Bengaluru</option>
                <option value="Delhi">Delhi</option>
                <option value="Goa">Goa</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-slate-300 uppercase">Price Range (₹)</label>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  placeholder="Min"
                  value={minPrice}
                  onChange={(e) => setMinPrice(e.target.value)}
                  className="w-full p-2.5 bg-harbour-dark border border-white/15 rounded-xl text-xs text-white focus:outline-none focus:border-cyanAccent-500"
                />
                <span className="text-slate-500">-</span>
                <input
                  type="number"
                  placeholder="Max"
                  value={maxPrice}
                  onChange={(e) => setMaxPrice(e.target.value)}
                  className="w-full p-2.5 bg-harbour-dark border border-white/15 rounded-xl text-xs text-white focus:outline-none focus:border-cyanAccent-500"
                />
              </div>
            </div>

            <GlassButton type="submit" className="w-full py-3" icon={Filter}>
              Apply Filters
            </GlassButton>
          </form>
        </aside>

        {/* Listings Grid */}
        <main className="lg:col-span-3 space-y-6">
          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              <Skeleton className="h-64" count={6} />
            </div>
          ) : listings.length === 0 ? (
            <GlassCard className="text-center py-20 space-y-3">
              <p className="text-lg font-black text-white">No ticket listings found</p>
              <p className="text-xs text-slate-400">Try adjusting your filters or search keywords.</p>
            </GlassCard>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {listings.map((item) => {
                const image = item.bannerImage || item.images?.[0] || 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba';
                const startingPrice = item.pricingTiers?.[0]?.price || 150;

                return (
                  <GlassCard key={item._id} className="p-0 overflow-hidden flex flex-col justify-between group">
                    <div className="relative h-44 overflow-hidden bg-harbour-darker">
                      <img
                        src={image}
                        alt={item.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                      <div className="absolute top-3 left-3 px-3 py-1 bg-black/75 backdrop-blur-md text-cyanAccent-400 text-[10px] font-black rounded-full uppercase tracking-wider border border-white/10">
                        {item.categoryType}
                      </div>
                    </div>

                    <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
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
                          <span className="text-[10px] uppercase font-bold text-slate-400 block">From</span>
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

          {/* Pagination Controls */}
          {meta.totalPages > 1 && (
            <div className="flex items-center justify-center gap-3 pt-6">
              <button
                disabled={meta.page <= 1}
                onClick={() => handlePageChange(meta.page - 1)}
                className="p-2.5 rounded-xl bg-harbour-card border border-white/10 disabled:opacity-40 text-slate-200 hover:text-white"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <span className="text-xs font-bold text-slate-300">
                Page {meta.page} of {meta.totalPages}
              </span>
              <button
                disabled={meta.page >= meta.totalPages}
                onClick={() => handlePageChange(meta.page + 1)}
                className="p-2.5 rounded-xl bg-harbour-card border border-white/10 disabled:opacity-40 text-slate-200 hover:text-white"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          )}
        </main>
      </div>

    </div>
  );
}

