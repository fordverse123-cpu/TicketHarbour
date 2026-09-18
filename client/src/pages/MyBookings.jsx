import React, { useState, useEffect } from 'react';
import API from '../services/api';
import toast from 'react-hot-toast';
import { Ticket, Download, XCircle, QrCode, MapPin, Calendar, CheckCircle, Clock } from 'lucide-react';

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
      link.setAttribute('download', `TicketHarbor_${booking.bookingReference}.pdf`);
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

  if (loading) {
    return (
      <div className="flex justify-center items-center py-32">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto space-y-8 pb-16">
      
      {/* Header */}
      <div>
        <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white">My Bookings</h1>
        <p className="text-sm text-slate-500">Manage your active reservations, tickets, and PDF downloads</p>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-3 border-b border-slate-200 dark:border-slate-700">
        <button
          onClick={() => setActiveTab('upcoming')}
          className={`pb-3 text-sm font-bold border-b-2 transition-colors ${
            activeTab === 'upcoming'
              ? 'border-teal-500 text-teal-600 dark:text-teal-400'
              : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
          }`}
        >
          Upcoming Bookings ({upcomingBookings.length})
        </button>
        <button
          onClick={() => setActiveTab('past')}
          className={`pb-3 text-sm font-bold border-b-2 transition-colors ${
            activeTab === 'past'
              ? 'border-teal-500 text-teal-600 dark:text-teal-400'
              : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
          }`}
        >
          Past & Cancelled ({pastOrCancelledBookings.length})
        </button>
      </div>

      {/* Bookings List */}
      {displayedBookings.length === 0 ? (
        <div className="text-center py-20 bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 space-y-3">
          <Ticket className="w-12 h-12 text-slate-300 mx-auto" />
          <p className="text-lg font-bold text-slate-700 dark:text-slate-200">No {activeTab} bookings found</p>
        </div>
      ) : (
        <div className="space-y-4">
          {displayedBookings.map((b) => {
            const isCancelled = b.status === 'cancelled';
            const listing = b.listing || {};
            const schedule = b.schedule || {};

            return (
              <div
                key={b._id}
                className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-6 flex flex-col md:flex-row md:items-center justify-between gap-6 shadow-sm hover:shadow-md transition-shadow"
              >
                {/* Details Left */}
                <div className="flex items-start gap-4">
                  <img
                    src={listing.bannerImage || listing.images?.[0] || 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba'}
                    alt={listing.title}
                    className="w-20 h-20 rounded-xl object-cover"
                  />
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-teal-600 dark:text-teal-400 uppercase">
                        {b.categoryType}
                      </span>
                      <span
                        className={`text-xs px-2.5 py-0.5 rounded-full font-bold uppercase ${
                          isCancelled
                            ? 'bg-rose-100 text-rose-700 dark:bg-rose-950/60 dark:text-rose-400'
                            : 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-400'
                        }`}
                      >
                        {b.status}
                      </span>
                    </div>

                    <h3 className="font-bold text-slate-900 dark:text-white text-base">{listing.title}</h3>
                    <p className="text-xs text-slate-500">Ref: <strong>{b.bookingReference}</strong></p>
                    <p className="text-xs text-slate-500 flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5 text-teal-500" />
                      {schedule.date ? new Date(schedule.date).toDateString() : ''} @ {schedule.startTime}
                    </p>
                    <p className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                      Seats: {b.seats && b.seats.length > 0 ? b.seats.map((s) => s.seatId).join(', ') : `${b.quantity} Ticket(s)`}
                    </p>
                  </div>
                </div>

                {/* Right Action Column */}
                <div className="flex flex-col sm:flex-row md:flex-col items-end justify-between gap-3 text-right">
                  <span className="text-xl font-black text-slate-900 dark:text-white">
                    ₹{b.totalAmount}
                  </span>

                  {!isCancelled && (
                    <div className="flex flex-wrap items-center gap-2">
                      <button
                        onClick={() => setSelectedQRBooking(b)}
                        className="px-3 py-1.5 bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-bold rounded-xl flex items-center gap-1 hover:bg-slate-200"
                      >
                        <QrCode className="w-4 h-4" /> View QR
                      </button>

                      <button
                        onClick={() => handleDownloadPDF(b)}
                        className="px-3 py-1.5 bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold rounded-xl flex items-center gap-1 shadow"
                      >
                        <Download className="w-4 h-4" /> PDF Ticket
                      </button>

                      {activeTab === 'upcoming' && (
                        <button
                          onClick={() => handleCancelBooking(b._id)}
                          className="px-3 py-1.5 bg-rose-50 text-rose-600 hover:bg-rose-100 text-xs font-bold rounded-xl"
                        >
                          Cancel
                        </button>
                      )}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* QR Code Popup Modal */}
      {selectedQRBooking && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-800 rounded-3xl p-6 max-w-sm w-full text-center space-y-4 shadow-2xl relative">
            <button
              onClick={() => setSelectedQRBooking(null)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600"
            >
              ✕
            </button>

            <h3 className="font-bold text-lg text-slate-900 dark:text-white">Entry Gate QR Ticket</h3>
            <p className="text-xs text-slate-500">Ref: {selectedQRBooking.bookingReference}</p>

            <div className="p-4 bg-white rounded-2xl border border-slate-200 inline-block mx-auto">
              <img
                src={`https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=${encodeURIComponent(
                  selectedQRBooking.qrCodeData || selectedQRBooking.bookingReference
                )}`}
                alt="Ticket QR Code"
                className="w-44 h-44 mx-auto"
              />
            </div>

            <p className="text-xs text-slate-400">Scan this QR code at venue check-in terminal</p>
          </div>
        </div>
      )}

    </div>
  );
}
