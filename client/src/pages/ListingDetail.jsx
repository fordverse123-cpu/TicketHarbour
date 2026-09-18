import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import API from '../services/api';
import { useAuth } from '../context/AuthContext';
import RatingStars from '../components/common/RatingStars';
import SeatSelector from '../components/seatmap/SeatSelector';
import toast from 'react-hot-toast';
import {
  MapPin,
  Calendar,
  Clock,
  Heart,
  Ticket,
  ShieldCheck,
  Star,
  MessageSquare,
  Bus,
  Train,
  Plane,
} from 'lucide-react';

export default function ListingDetail() {
  const { identifier } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [listing, setListing] = useState(null);
  const [schedules, setSchedules] = useState([]);
  const [selectedSchedule, setSelectedSchedule] = useState(null);
  const [selectedSeats, setSelectedSeats] = useState([]);
  const [quantity, setQuantity] = useState(1);
  const [isFavorite, setIsFavorite] = useState(false);
  const [loading, setLoading] = useState(true);

  // Review states
  const [reviews, setReviews] = useState([]);
  const [newRating, setNewRating] = useState(5);
  const [newComment, setNewComment] = useState('');
  const [submittingReview, setSubmittingReview] = useState(false);

  useEffect(() => {
    fetchListingAndSchedules();
  }, [identifier]);

  const fetchListingAndSchedules = async () => {
    setLoading(true);
    try {
      const res = await API.get(`/listings/${identifier}`);
      if (res.data.success) {
        const item = res.data.data.listing;
        setListing(item);

        // Fetch schedules for listing
        const schRes = await API.get(`/schedules?listing=${item._id}`);
        if (schRes.data.success) {
          const list = schRes.data.data.schedules;
          setSchedules(list);
          if (list.length > 0) setSelectedSchedule(list[0]);
        }

        // Fetch reviews
        const revRes = await API.get(`/reviews/listing/${item._id}`);
        if (revRes.data.success) {
          setReviews(revRes.data.data.reviews);
        }
      }
    } catch (err) {
      toast.error('Failed to load listing details.');
    } finally {
      setLoading(false);
    }
  };

  const handleToggleFavorite = async () => {
    if (!user) {
      toast.error('Please log in to save favorites');
      return;
    }
    try {
      const res = await API.post('/wishlist/toggle', { listingId: listing._id });
      if (res.data.success) {
        setIsFavorite(res.data.data.isFavorite);
        toast.success(res.data.message);
      }
    } catch (err) {
      toast.error('Could not update favorites');
    }
  };

  const handleAddReview = async (e) => {
    e.preventDefault();
    if (!user) {
      toast.error('Please log in to leave a review');
      return;
    }
    if (!newComment.trim()) return;

    setSubmittingReview(true);
    try {
      const res = await API.post('/reviews', {
        listingId: listing._id,
        rating: newRating,
        comment: newComment,
      });

      if (res.data.success) {
        toast.success('Review published!');
        setNewComment('');
        // Refresh reviews
        const revRes = await API.get(`/reviews/listing/${listing._id}`);
        if (revRes.data.success) setReviews(revRes.data.data.reviews);
      }
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to publish review.';
      toast.error(msg);
    } finally {
      setSubmittingReview(false);
    }
  };

  const handleProceedToCheckout = () => {
    if (!user) {
      toast.error('Please log in to proceed with booking');
      navigate('/login');
      return;
    }

    if (!selectedSchedule) {
      toast.error('Please select a date and showtime/trip schedule');
      return;
    }

    const hasSeatMap = ['movie', 'event', 'sports', 'bus'].includes(listing.categoryType);

    if (hasSeatMap && selectedSeats.length === 0) {
      toast.error('Please select at least one seat on the seat map');
      return;
    }

    navigate('/checkout', {
      state: {
        listing,
        schedule: selectedSchedule,
        seats: selectedSeats,
        quantity: hasSeatMap ? selectedSeats.length : quantity,
      },
    });
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-32">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600"></div>
      </div>
    );
  }

  if (!listing) {
    return (
      <div className="text-center py-20">
        <h2 className="text-2xl font-bold">Listing not found</h2>
      </div>
    );
  }

  const isTransit = ['bus', 'train', 'flight'].includes(listing.categoryType);
  const defaultPrice = selectedSchedule?.pricing?.[0]?.price || listing.pricingTiers?.[0]?.price || 100;
  const totalPrice = selectedSeats.length > 0
    ? selectedSeats.reduce((sum, s) => sum + s.price, 0)
    : defaultPrice * quantity;

  return (
    <div className="space-y-8 pb-16">
      
      {/* Banner Header Image */}
      <div className="relative h-64 sm:h-96 rounded-3xl overflow-hidden shadow-xl bg-slate-900">
        <img
          src={listing.bannerImage || listing.images?.[0] || 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba'}
          alt={listing.title}
          className="w-full h-full object-cover opacity-80"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent" />

        <div className="absolute bottom-6 left-6 right-6 text-white space-y-2 flex flex-col sm:flex-row sm:items-end justify-between">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="px-3 py-1 bg-teal-500 text-white text-xs font-bold rounded-full uppercase">
                {listing.categoryType}
              </span>
              <RatingStars rating={listing.rating} numReviews={listing.numReviews} />
            </div>
            
            <h1 className="text-2xl sm:text-4xl font-black">{listing.title}</h1>
            
            <p className="text-xs sm:text-sm text-slate-300 flex items-center gap-1.5">
              <MapPin className="w-4 h-4 text-teal-400" />
              {isTransit && listing.transitInfo
                ? `${listing.transitInfo.source} → ${listing.transitInfo.destination} (${listing.transitInfo.operator || ''})`
                : listing.venue?.name
                ? `${listing.venue.name}, ${listing.location.city}`
                : listing.location.city}
            </p>
          </div>

          <button
            onClick={handleToggleFavorite}
            className={`p-3 rounded-full backdrop-blur-md border border-white/20 transition-all ${
              isFavorite ? 'bg-rose-500 text-white' : 'bg-white/20 text-white hover:bg-white/30'
            }`}
            title="Save to favorites"
          >
            <Heart className="w-5 h-5 fill-current" />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Column: Description & Schedules / Seat Map */}
        <div className="lg:col-span-2 space-y-8">
          
          {/* Description Card */}
          <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-6 space-y-4">
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">About Experience</h2>
            <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
              {listing.description}
            </p>

            {/* Transit Route details if applicable */}
            {isTransit && listing.transitInfo && (
              <div className="pt-4 border-t border-slate-100 dark:border-slate-700 grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
                <div>
                  <span className="text-slate-400 block">Operator</span>
                  <span className="font-bold text-slate-900 dark:text-white">{listing.transitInfo.operator}</span>
                </div>
                <div>
                  <span className="text-slate-400 block">Departure</span>
                  <span className="font-bold text-teal-600 dark:text-teal-400">{listing.transitInfo.departureTime}</span>
                </div>
                <div>
                  <span className="text-slate-400 block">Arrival</span>
                  <span className="font-bold text-slate-900 dark:text-white">{listing.transitInfo.arrivalTime}</span>
                </div>
                <div>
                  <span className="text-slate-400 block">Duration</span>
                  <span className="font-bold text-slate-900 dark:text-white">{listing.transitInfo.duration}</span>
                </div>
              </div>
            )}
          </div>

          {/* Schedule Selection */}
          <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-6 space-y-4">
            <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Calendar className="w-5 h-5 text-teal-500" /> Select Date & Showtime / Departure
            </h2>

            {schedules.length === 0 ? (
              <p className="text-xs text-slate-400">No upcoming schedules available for this listing.</p>
            ) : (
              <div className="flex items-center gap-3 overflow-x-auto pb-2">
                {schedules.map((sch) => {
                  const isSelected = selectedSchedule?._id === sch._id;
                  const schDate = new Date(sch.date).toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric',
                    weekday: 'short',
                  });

                  return (
                    <button
                      key={sch._id}
                      onClick={() => {
                        setSelectedSchedule(sch);
                        setSelectedSeats([]);
                      }}
                      className={`px-4 py-3 rounded-2xl border text-xs text-left transition-all ${
                        isSelected
                          ? 'border-teal-500 bg-teal-50 dark:bg-teal-950/60 font-bold text-teal-700 dark:text-teal-300 shadow'
                          : 'border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:border-slate-300'
                      }`}
                    >
                      <span className="block text-slate-400">{schDate}</span>
                      <span className="block text-sm font-bold mt-0.5">{sch.startTime}</span>
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* Dynamic Seat Map / Quantity Selector */}
          {selectedSchedule && (
            ['movie', 'event', 'sports', 'bus'].includes(listing.categoryType) ? (
              <SeatSelector
                schedule={selectedSchedule}
                listing={listing}
                onSeatsSelected={(seats) => setSelectedSeats(seats)}
              />
            ) : (
              <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-6 space-y-4">
                <h2 className="text-lg font-bold text-slate-900 dark:text-white">Ticket Quantity</h2>
                <div className="flex items-center gap-4">
                  <button
                    disabled={quantity <= 1}
                    onClick={() => setQuantity(quantity - 1)}
                    className="h-10 w-10 rounded-xl bg-slate-100 dark:bg-slate-700 text-lg font-bold disabled:opacity-40"
                  >
                    -
                  </button>
                  <span className="text-xl font-bold text-slate-900 dark:text-white">{quantity}</span>
                  <button
                    disabled={quantity >= 10}
                    onClick={() => setQuantity(quantity + 1)}
                    className="h-10 w-10 rounded-xl bg-slate-100 dark:bg-slate-700 text-lg font-bold"
                  >
                    +
                  </button>
                </div>
              </div>
            )
          )}

          {/* User Reviews Section */}
          <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-6 space-y-6">
            <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <MessageSquare className="w-5 h-5 text-indigo-500" /> Reviews & Ratings ({reviews.length})
            </h2>

            {/* Add Review Form */}
            {user && (
              <form onSubmit={handleAddReview} className="space-y-3 p-4 bg-slate-50 dark:bg-slate-750 rounded-xl border border-slate-200 dark:border-slate-700">
                <p className="text-xs font-bold text-slate-700 dark:text-slate-200">Leave a Review</p>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-slate-500">Rating:</span>
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setNewRating(star)}
                      className={`p-1 ${star <= newRating ? 'text-amber-400' : 'text-slate-300'}`}
                    >
                      <Star className="w-4 h-4 fill-current" />
                    </button>
                  ))}
                </div>
                <textarea
                  rows="2"
                  placeholder="Share your experience..."
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  className="w-full p-3 text-xs bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none dark:text-white"
                />
                <button
                  type="submit"
                  disabled={submittingReview}
                  className="px-4 py-2 bg-indigo-600 text-white font-bold text-xs rounded-xl shadow hover:bg-indigo-700 transition-colors"
                >
                  {submittingReview ? 'Submitting...' : 'Post Review'}
                </button>
              </form>
            )}

            {/* Review List */}
            <div className="space-y-4 divide-y divide-slate-100 dark:divide-slate-700">
              {reviews.map((rev) => (
                <div key={rev._id} className="pt-4 first:pt-0 space-y-1 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-900 dark:text-white">{rev.user?.name || 'User'}</span>
                    <RatingStars rating={rev.rating} />
                  </div>
                  <p className="text-slate-600 dark:text-slate-300">{rev.comment}</p>
                </div>
              ))}
            </div>
          </div>

        </div>

        {/* Right Column: Checkout Summary Box */}
        <div className="lg:col-span-1">
          <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-6 space-y-6 sticky top-24 shadow-lg">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white border-b border-slate-100 dark:border-slate-700 pb-3">
              Booking Summary
            </h3>

            <div className="space-y-3 text-sm">
              <div className="flex items-center justify-between">
                <span className="text-slate-500">Selected Seats/Qty</span>
                <span className="font-bold text-slate-900 dark:text-white">
                  {selectedSeats.length > 0
                    ? selectedSeats.map((s) => s.seatId).join(', ')
                    : `${quantity} Ticket(s)`}
                </span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-slate-500">Price Subtotal</span>
                <span className="font-bold text-slate-900 dark:text-white">₹{totalPrice}</span>
              </div>

              <div className="flex items-center justify-between text-xs text-slate-400">
                <span>Estimated Tax (18%)</span>
                <span>₹{Math.round(totalPrice * 0.18)}</span>
              </div>

              <div className="pt-3 border-t border-slate-100 dark:border-slate-700 flex items-center justify-between text-lg">
                <span className="font-bold text-slate-900 dark:text-white">Total</span>
                <span className="font-black text-teal-600 dark:text-teal-400">
                  ₹{totalPrice + Math.round(totalPrice * 0.18)}
                </span>
              </div>
            </div>

            <button
              onClick={handleProceedToCheckout}
              className="w-full py-3.5 bg-gradient-to-r from-teal-500 to-indigo-600 hover:from-teal-600 hover:to-indigo-700 text-white font-bold rounded-xl shadow-lg transition-all text-sm flex items-center justify-center gap-2"
            >
              <Ticket className="w-5 h-5" /> Proceed to Checkout
            </button>

            <div className="text-center text-xs text-slate-400 flex items-center justify-center gap-1">
              <ShieldCheck className="w-4 h-4 text-teal-500" /> Instant Confirmation & PDF QR Ticket
            </div>
          </div>
        </div>

      </div>

    </div>
  );
}
