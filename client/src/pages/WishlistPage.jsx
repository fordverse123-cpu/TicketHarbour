import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import API from '../services/api';
import GlassCard from '../components/ui/GlassCard';
import GlassButton from '../components/ui/GlassButton';
import Skeleton from '../components/ui/Skeleton';
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

  return (
    <div className="max-w-5xl mx-auto space-y-8 pb-16">
      <div>
        <h1 className="text-3xl font-black text-white flex items-center gap-2 tracking-tight">
          <Heart className="w-7 h-7 text-rose-500 fill-rose-500" /> Saved Favorites
        </h1>
        <p className="text-xs text-slate-400">Bookings you have saved for later</p>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          <Skeleton className="h-64" count={3} />
        </div>
      ) : items.length === 0 ? (
        <GlassCard className="text-center py-20 space-y-3">
          <Heart className="w-12 h-12 text-slate-600 mx-auto" />
          <p className="text-base font-black text-white">Your wishlist is empty</p>
          <Link to="/listings">
            <GlassButton size="sm">Browse Ticket Listings</GlassButton>
          </Link>
        </GlassCard>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {items.map((item) => {
            const listing = item.listing;
            if (!listing) return null;
            const image = listing.bannerImage || listing.images?.[0];

            return (
              <GlassCard
                key={item._id}
                className="p-0 overflow-hidden flex flex-col justify-between group"
              >
                <div className="relative h-44 bg-harbour-darker">
                  <img src={image} alt={listing.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                  <button
                    onClick={() => handleRemove(listing._id)}
                    className="absolute top-3 right-3 p-2 bg-black/80 text-rose-400 rounded-full hover:bg-black border border-white/10"
                    title="Remove"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                <div className="p-4 space-y-3 flex-1 flex flex-col justify-between">
                  <div className="space-y-1">
                    <h3 className="font-black text-white text-sm line-clamp-1 group-hover:text-cyanAccent-400 transition-colors">{listing.title}</h3>
                    <p className="text-xs text-slate-400 flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5 text-cyanAccent-400" /> {listing.location?.city || 'All Cities'}
                    </p>
                  </div>

                  <Link to={`/listings/${listing.slug || listing._id}`}>
                    <GlassButton size="sm" className="w-full">
                      Book Tickets
                    </GlassButton>
                  </Link>
                </div>
              </GlassCard>
            );
          })}
        </div>
      )}
    </div>
  );
}

