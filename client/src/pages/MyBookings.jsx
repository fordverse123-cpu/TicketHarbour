import React, { useState, useEffect } from 'react';
import API from '../services/api';
import GlassCard from '../components/ui/GlassCard';
import GlassButton from '../components/ui/GlassButton';
import GlassModal from '../components/ui/GlassModal';
import Skeleton from '../components/ui/Skeleton';
import { CardSkeletonGrid, BookingCardSkeleton } from '../components/loading';
import toast from 'react-hot-toast';
import { Ticket, Download, QrCode, Calendar, Wallet, Heart, CheckCircle2, XCircle } from 'lucide-react';

export default function MyBookings() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('upcoming');
  const [selectedQRBooking, setSelectedQRBooking] = useState(null);

  useEffect(() => {
    fetchMyBookings();
  }, []);

  const fetchMyBookings = async () => {
    setLoading(true);
    try {
      const res = await API.get('/bookings/my-bookings');
      if (res.data.success) {
        setBookings(res.data.data.bookings);
      }
    } catch (err) {
      toast.error('Failed to load bookings.');
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadPDF = async (booking) => {
    try {
      const res = await API.get(`/bookings/${booking._id}/ticket-pdf`, {
        responseType: 'blob',
      });
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `TicketHarbour_${booking.bookingReference}.pdf`);
      document.body.appendChild(link);
      link.click();
    } catch (err) {
      toast.error('PDF download failed');
    }
  };

  const handleCancelBooking = async (bookingId) => {
    if (!window.confirm('Are you sure you want to cancel this booking? Refund will be processed.')) {
      return;
    }

    try {
      const res = await API.post(`/bookings/${bookingId}/cancel`);
      if (res.data.success) {
        toast.success('Booking cancelled and refund initiated.');
        fetchMyBookings();
      }
    } catch (err) {
      const msg = err.response?.data?.message || 'Cancellation failed.';
      toast.error(msg);
    }
  };

  const now = new Date();
  const upcomingBookings = bookings.filter(
    (b) => new Date(b.schedule?.date || b.createdAt) >= now && b.status !== 'cancelled'
  );
  const pastOrCancelledBookings = bookings.filter(
    (b) => new Date(b.schedule?.date || b.createdAt) < now || b.status === 'cancelled'
  );

  const displayedBookings = activeTab === 'upcoming' ? upcomingBookings : pastOrCancelledBookings;
  const totalAmountSpent = bookings.reduce((sum, b) => (b.status === 'confirmed' ? sum + b.totalAmount : sum), 0);

  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-16">
      
      {/* Header */}
      <div>
        <h1 className="text-3xl font-black text-white tracking-tight">User Dashboard</h1>
        <p className="text-xs text-slate-400">Manage your active reservations, tickets, wallet, and PDF downloads</p>
      </div>

      {/* DASHBOARD STATS WIDGETS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <GlassCard hover={false} className="space-y-2">
          <div className="flex items-center justify-between text-cyanAccent-400">
            <Ticket className="w-5 h-5" />
            <span className="text-[10px] uppercase font-bold text-slate-400">Total Bookings</span>
          </div>
          <p className="text-2xl font-black text-white">{bookings.length}</p>
        </GlassCard>

        <GlassCard hover={false} className="space-y-2">
          <div className="flex items-center justify-between text-indigoAccent-500">
            <Calendar className="w-5 h-5" />
            <span className="text-[10px] uppercase font-bold text-slate-400">Upcoming Trips</span>
          </div>
          <p className="text-2xl font-black text-white">{upcomingBookings.length}</p>
        </GlassCard>

        <GlassCard hover={false} className="space-y-2">
          <div className="flex items-center justify-between text-emerald-400">
            <Wallet className="w-5 h-5" />
            <span className="text-[10px] uppercase font-bold text-slate-400">Total Spend</span>
          </div>
          <p className="text-2xl font-black text-white">₹{totalAmountSpent}</p>
        </GlassCard>

        <GlassCard hover={false} className="space-y-2">
          <div className="flex items-center justify-between text-rose-400">
            <Heart className="w-5 h-5" />
            <span className="text-[10px] uppercase font-bold text-slate-400">Saved Items</span>
          </div>
          <p className="text-2xl font-black text-white">4</p>
        </GlassCard>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-3 border-b border-white/10 pb-2">
        <button
          onClick={() => setActiveTab('upcoming')}
          className={`pb-2.5 text-xs font-bold border-b-2 transition-colors cursor-pointer ${
            activeTab === 'upcoming'
              ? 'border-cyanAccent-400 text-cyanAccent-400'
              : 'border-transparent text-slate-400 hover:text-white'
          }`}
        >
          Upcoming Bookings ({upcomingBookings.length})
        </button>
        <button
          onClick={() => setActiveTab('past')}
          className={`pb-2.5 text-xs font-bold border-b-2 transition-colors cursor-pointer ${
            activeTab === 'past'
              ? 'border-cyanAccent-400 text-cyanAccent-400'
              : 'border-transparent text-slate-400 hover:text-white'
          }`}
        >
          Past & Cancelled ({pastOrCancelledBookings.length})
        </button>
      </div>

      {/* Bookings List */}
      {loading ? (
        <CardSkeletonGrid
          count={3}
          CardSkeletonComponent={BookingCardSkeleton}
          gridClassName="space-y-4"
          ariaLabel="Loading user bookings..."
        />
      ) : displayedBookings.length === 0 ? (
        <GlassCard className="text-center py-20 space-y-3">
          <Ticket className="w-12 h-12 text-slate-600 mx-auto" />
          <p className="text-base font-black text-white">No {activeTab} bookings found</p>
        </GlassCard>
      ) : (
        <div className="space-y-4">
          {displayedBookings.map((b) => {
            const isCancelled = b.status === 'cancelled';
            const listing = b.listing || {};
            const schedule = b.schedule || {};

            return (
              <GlassCard
                key={b._id}
                hover={false}
                className="flex flex-col md:flex-row md:items-center justify-between gap-6"
              >
                {/* Details Left */}
                <div className="flex items-start gap-4">
                  <img
                    src={listing.bannerImage || listing.images?.[0] || 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba'}
                    alt={listing.title}
                    className="w-20 h-20 rounded-xl object-cover border border-white/10"
                  />
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-black text-cyanAccent-400 uppercase tracking-wider">
                        {b.categoryType}
                      </span>
                      <span
                        className={`text-[9px] px-2 py-0.5 rounded-full font-black uppercase ${
                          isCancelled
                            ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                            : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                        }`}
                      >
                        {b.status}
                      </span>
                    </div>

                    <h3 className="font-black text-white text-base">{listing.title}</h3>
                    <p className="text-xs text-slate-400">Ref: <strong className="text-white font-mono">{b.bookingReference}</strong></p>
                    <p className="text-xs text-slate-400 flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5 text-cyanAccent-400" />
                      {schedule.date ? new Date(schedule.date).toDateString() : ''} @ {schedule.startTime}
                    </p>
                    <p className="text-xs font-bold text-slate-300">
                      Seats: {b.seats && b.seats.length > 0 ? b.seats.map((s) => s.seatId).join(', ') : `${b.quantity} Ticket(s)`}
                    </p>
                  </div>
                </div>

                {/* Right Action Column */}
                <div className="flex flex-col sm:flex-row md:flex-col items-end justify-between gap-3 text-right">
                  <span className="text-2xl font-black text-white">
                    ₹{b.totalAmount}
                  </span>

                  {!isCancelled && (
                    <div className="flex flex-wrap items-center gap-2">
                      <GlassButton
                        size="sm"
                        variant="secondary"
                        onClick={() => setSelectedQRBooking(b)}
                        icon={QrCode}
                      >
                        View QR
                      </GlassButton>

                      <GlassButton
                        size="sm"
                        variant="gradient"
                        onClick={() => handleDownloadPDF(b)}
                        icon={Download}
                      >
                        PDF Ticket
                      </GlassButton>

                      {activeTab === 'upcoming' && (
                        <GlassButton
                          size="sm"
                          variant="danger"
                          onClick={() => handleCancelBooking(b._id)}
                        >
                          Cancel
                        </GlassButton>
                      )}
                    </div>
                  )}
                </div>
              </GlassCard>
            );
          })}
        </div>
      )}

      {/* QR Code Popup Modal */}
      <GlassModal
        isOpen={!!selectedQRBooking}
        onClose={() => setSelectedQRBooking(null)}
        title="Entry Gate QR Ticket"
        maxWidth="max-w-sm"
      >
        {selectedQRBooking && (
          <div className="text-center space-y-4">
            <p className="text-xs text-slate-400">Ref: <span className="font-mono text-cyanAccent-400">{selectedQRBooking.bookingReference}</span></p>

            <div className="p-4 bg-white rounded-2xl border border-white/20 inline-block mx-auto shadow-xl">
              <img
                src={`https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=${encodeURIComponent(
                  selectedQRBooking.qrCodeData || selectedQRBooking.bookingReference
                )}`}
                alt="Ticket QR Code"
                className="w-44 h-44 mx-auto"
              />
            </div>

            <p className="text-xs text-slate-400">Scan this QR code at entry gate terminal</p>
          </div>
        )}
      </GlassModal>

    </div>
  );
}

