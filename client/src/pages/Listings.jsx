import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import API from '../services/api';
import RatingStars from '../components/common/RatingStars';
import SkeletonLoader from '../components/common/SkeletonLoader';
import { Filter, Search, MapPin, SlidersHorizontal, ChevronLeft, ChevronRight } from 'lucide-react';

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
  const [page, setPage] = useState(Number(searchParams.get('page')) || 1);

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
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white">
            Explore All Ticket Listings
          </h1>
          <p className="text-sm text-slate-500">
            Found {meta.total || 0} active shows, trips, and events
          </p>
        </div>

        {/* Sort Controls */}
        <div className="flex items-center gap-3">
          <label className="text-xs font-semibold text-slate-500">Sort by:</label>
          <select
            value={sort}
            onChange={(e) => {
              setSort(e.target.value);
              const params = new URLSearchParams(searchParams);
              params.set('sort', e.target.value);
              setSearchParams(params);
            }}
            className="px-3 py-2 text-sm bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none dark:text-white"
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
        <aside className="lg:col-span-1 space-y-6 bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-200 dark:border-slate-700 h-fit">
          <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-700">
            <h2 className="font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <SlidersHorizontal className="w-4 h-4 text-teal-500" /> Filters
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
              className="text-xs font-semibold text-teal-600 dark:text-teal-400 hover:underline"
            >
              Reset All
            </button>
          </div>

          <form onSubmit={applyFilters} className="space-y-4 text-sm">
            {/* Search Input */}
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-600 dark:text-slate-300">Keyword Search</label>
              <div className="relative">
                <input
                  type="text"
                  placeholder="Title, artist, location..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 bg-slate-50 dark:bg-slate-750 border border-slate-200 dark:border-slate-700 rounded-xl text-xs dark:text-white"
                />
                <Search className="w-4 h-4 text-slate-400 absolute left-2.5 top-2.5" />
              </div>
            </div>

            {/* Category Dropdown */}
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-600 dark:text-slate-300">Category</label>
              <select
                value={categoryType}
                onChange={(e) => setCategoryType(e.target.value)}
                className="w-full p-2 bg-slate-50 dark:bg-slate-750 border border-slate-200 dark:border-slate-700 rounded-xl text-xs dark:text-white"
              >
                <option value="">All Categories</option>
                <option value="movie">Movies</option>
                <option value="event">Events & Concerts</option>
                <option value="sports">Sports Matches</option>
                <option value="bus">Bus Sleepers</option>
                <option value="train">Train Express</option>
                <option value="flight">Flights</option>
                <option value="attraction">Attractions</option>
              </select>
            </div>

            {/* City Dropdown */}
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-600 dark:text-slate-300">City / Location</label>
              <select
                value={city}
                onChange={(e) => setCity(e.target.value)}
                className="w-full p-2 bg-slate-50 dark:bg-slate-750 border border-slate-200 dark:border-slate-700 rounded-xl text-xs dark:text-white"
              >
                <option value="">All Cities</option>
                <option value="Mumbai">Mumbai</option>
                <option value="Bengaluru">Bengaluru</option>
                <option value="Delhi">Delhi</option>
                <option value="Goa">Goa</option>
              </select>
            </div>

            {/* Price Range */}
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-600 dark:text-slate-300">Price Range (₹)</label>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  placeholder="Min"
                  value={minPrice}
                  onChange={(e) => setMinPrice(e.target.value)}
                  className="w-full p-2 bg-slate-50 dark:bg-slate-750 border border-slate-200 dark:border-slate-700 rounded-xl text-xs dark:text-white"
                />
                <span className="text-slate-400">-</span>
                <input
                  type="number"
                  placeholder="Max"
                  value={maxPrice}
                  onChange={(e) => setMaxPrice(e.target.value)}
                  className="w-full p-2 bg-slate-50 dark:bg-slate-750 border border-slate-200 dark:border-slate-700 rounded-xl text-xs dark:text-white"
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-2.5 bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs rounded-xl shadow transition-colors"
            >
              Apply Filters
            </button>
          </form>
        </aside>

        {/* Listings Grid */}
        <main className="lg:col-span-3 space-y-6">
          {loading ? (
            <SkeletonLoader count={6} />
          ) : listings.length === 0 ? (
            <div className="text-center py-20 bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 space-y-3">
              <p className="text-lg font-bold text-slate-700 dark:text-slate-200">No ticket listings found</p>
              <p className="text-xs text-slate-400">Try adjusting your filters or search keywords.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {listings.map((item) => {
                const image = item.bannerImage || item.images?.[0] || 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba';
                const startingPrice = item.pricingTiers?.[0]?.price || 100;

                return (
                  <div
                    key={item._id}
                    className="group bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col"
                  >
                    <div className="relative h-44 overflow-hidden bg-slate-100 dark:bg-slate-700">
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
                          <span className="text-xs text-slate-400 block">From</span>
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

          {/* Pagination Controls */}
          {meta.totalPages > 1 && (
            <div className="flex items-center justify-center gap-3 pt-6">
              <button
                disabled={meta.page <= 1}
                onClick={() => handlePageChange(meta.page - 1)}
                className="p-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 disabled:opacity-40 text-slate-700 dark:text-slate-200"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <span className="text-xs font-bold text-slate-600 dark:text-slate-300">
                Page {meta.page} of {meta.totalPages}
              </span>
              <button
                disabled={meta.page >= meta.totalPages}
                onClick={() => handlePageChange(meta.page + 1)}
                className="p-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 disabled:opacity-40 text-slate-700 dark:text-slate-200"
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
