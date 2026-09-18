import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import API from '../services/api';
import RatingStars from '../components/common/RatingStars';
import toast from 'react-hot-toast';
import { Heart, MapPin, Trash2 } from 'lucide-react';

export default function WishlistPage() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchWishlist();
  }, []);

  const fetchWishlist = async () => {
    setLoading(true);
    try {
      const res = await API.get('/wishlist');
      if (res.data.success) {
        setItems(res.data.data.wishlist);
      }
    } catch (err) {
      toast.error('Failed to load wishlist');
    } finally {
      setLoading(false);
    }
  };

  const handleRemove = async (listingId) => {
    try {
      const res = await API.post('/wishlist/toggle', { listingId });
      if (res.data.success) {
        toast.success('Removed from favorites');
        setItems(items.filter((item) => item.listing?._id !== listingId));
      }
    } catch (err) {
      toast.error('Could not remove item');
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-32">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto space-y-8 pb-16">
      <div>
        <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
          <Heart className="w-7 h-7 text-rose-500 fill-rose-500" /> Saved Favorites
        </h1>
        <p className="text-sm text-slate-500">Bookings you have saved for later</p>
      </div>

      {items.length === 0 ? (
        <div className="text-center py-20 bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 space-y-3">
          <Heart className="w-12 h-12 text-slate-300 mx-auto" />
          <p className="text-lg font-bold text-slate-700 dark:text-slate-200">Your wishlist is empty</p>
          <Link to="/listings" className="inline-block px-4 py-2 bg-teal-600 text-white font-bold text-xs rounded-xl">
            Browse Ticket Listings
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {items.map((item) => {
            const listing = item.listing;
            if (!listing) return null;
            const image = listing.bannerImage || listing.images?.[0];

            return (
              <div
                key={item._id}
                className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 overflow-hidden shadow-sm flex flex-col justify-between"
              >
                <div className="relative h-44">
                  <img src={image} alt={listing.title} className="w-full h-full object-cover" />
                  <button
                    onClick={() => handleRemove(listing._id)}
                    className="absolute top-3 right-3 p-2 bg-slate-900/80 text-rose-400 rounded-full hover:bg-slate-900"
                    title="Remove"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                <div className="p-4 space-y-3 flex-1 flex flex-col justify-between">
                  <div>
                    <h3 className="font-bold text-slate-900 dark:text-white text-sm line-clamp-1">{listing.title}</h3>
                    <p className="text-xs text-slate-500 flex items-center gap-1 mt-1">
                      <MapPin className="w-3.5 h-3.5 text-teal-500" /> {listing.location?.city}
                    </p>
                  </div>

                  <Link
                    to={`/listings/${listing.slug || listing._id}`}
                    className="w-full py-2 bg-teal-600 text-white font-bold text-xs rounded-xl text-center shadow"
                  >
                    Book Tickets
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
