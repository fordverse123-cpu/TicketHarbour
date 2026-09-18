import React, { useState } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import API from '../services/api';
import toast from 'react-hot-toast';
import { Ticket, ShieldCheck, Tag, CheckCircle2, Download, ArrowLeft } from 'lucide-react';

export default function Checkout() {
  const { state } = useLocation();
  const navigate = useNavigate();

  const listing = state?.listing;
  const schedule = state?.schedule;
  const seats = state?.seats || [];
  const quantity = state?.quantity || 1;

  const [couponInput, setCouponInput] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState(null);
  const [discountAmount, setDiscountAmount] = useState(0);
  const [processing, setProcessing] = useState(false);
  const [confirmedBooking, setConfirmedBooking] = useState(null);

  if (!listing || !schedule) {
    return (
      <div className="text-center py-20 space-y-4">
        <p className="text-lg font-bold">No active checkout session</p>
        <Link to="/listings" className="px-4 py-2 bg-teal-600 text-white font-bold rounded-xl">
          Browse Listings
        </Link>
      </div>
    );
  }

  const baseAmount = seats.length > 0
    ? seats.reduce((sum, s) => sum + s.price, 0)
    : (schedule.pricing?.[0]?.price || listing.pricingTiers?.[0]?.price || 100) * quantity;

  const taxAmount = Math.round(baseAmount * 0.18 * 100) / 100;
  const finalAmount = Math.max(0, baseAmount - discountAmount + taxAmount);

  const handleApplyCoupon = async (e) => {
    e.preventDefault();
    if (!couponInput.trim()) return;

    try {
      const res = await API.post('/coupons/validate', {
        code: couponInput.trim(),
        bookingAmount: baseAmount,
      });

      if (res.data.success) {
        setAppliedCoupon(res.data.data.code);
        setDiscountAmount(res.data.data.discountAmount);
        toast.success(`Coupon ${res.data.data.code} applied! Discount: ₹${res.data.data.discountAmount}`);
      }
    } catch (err) {
      const msg = err.response?.data?.message || 'Invalid coupon code.';
      toast.error(msg);
    }
  };

  const handlePayAndConfirm = async () => {
    setProcessing(true);
    try {
      // 1. Create Booking Order
      const bookingRes = await API.post('/bookings', {
        scheduleId: schedule._id,
        seats,
        quantity,
        couponCode: appliedCoupon || '',
      });

      if (!bookingRes.data.success) {
        throw new Error('Failed to create booking order');
      }

      const booking = bookingRes.data.data.booking;

      // 2. Create Payment Intent
      const paymentRes = await API.post('/payments/create-intent', {
        bookingId: booking._id,
      });

      const paymentIntentId = paymentRes.data.data.paymentIntentId;

      // 3. Confirm Booking
      const confirmRes = await API.post(`/bookings/${booking._id}/confirm`, {
        paymentIntentId,
      });

      if (confirmRes.data.success) {
        setConfirmedBooking(confirmRes.data.data.booking);
        toast.success('Payment successful! Booking confirmed.');
      }
    } catch (err) {
      const msg = err.response?.data?.message || 'Checkout failed. Please try again.';
      toast.error(msg);
    } finally {
      setProcessing(false);
    }
  };

  const handleDownloadPDF = async () => {
    try {
      const res = await API.get(`/bookings/${confirmedBooking._id}/ticket-pdf`, {
        responseType: 'blob',
      });
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `TicketHarbor_${confirmedBooking.bookingReference}.pdf`);
      document.body.appendChild(link);
      link.click();
    } catch (err) {
      toast.error('Download failed.');
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-16">
      
      {/* Back Button */}
      <button
        onClick={() => navigate(-1)}
        className="flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-slate-900 dark:hover:text-white"
      >
        <ArrowLeft className="w-4 h-4" /> Back to details
      </button>

      {/* Confirmation Modal overlay when payment succeeds */}
      {confirmedBooking ? (
        <div className="bg-white dark:bg-slate-800 rounded-3xl border border-slate-200 dark:border-slate-700 p-8 text-center space-y-6 shadow-2xl">
          <div className="h-16 w-16 bg-teal-100 dark:bg-teal-950 text-teal-600 dark:text-teal-400 rounded-full flex items-center justify-center mx-auto shadow-inner">
            <CheckCircle2 className="w-10 h-10" />
          </div>

          <div className="space-y-2">
            <h2 className="text-3xl font-black text-slate-900 dark:text-white">Booking Confirmed!</h2>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Reference: <strong className="text-teal-600 dark:text-teal-400">{confirmedBooking.bookingReference}</strong>
            </p>
          </div>

          <div className="p-4 bg-slate-50 dark:bg-slate-700 rounded-2xl border border-slate-200 dark:border-slate-600 max-w-md mx-auto text-left text-xs space-y-2 text-slate-700 dark:text-slate-200">
            <p><strong>Item:</strong> {listing.title}</p>
            <p><strong>Schedule:</strong> {new Date(schedule.date).toDateString()} at {schedule.startTime}</p>
            <p><strong>Seats/Qty:</strong> {seats.length > 0 ? seats.map((s) => s.seatId).join(', ') : quantity}</p>
            <p><strong>Total Paid:</strong> ₹{confirmedBooking.totalAmount}</p>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-4 pt-4">
            <button
              onClick={handleDownloadPDF}
              className="px-6 py-3 bg-teal-600 hover:bg-teal-700 text-white font-bold rounded-xl shadow-lg transition-all text-sm flex items-center gap-2"
            >
              <Download className="w-4 h-4" /> Download PDF Ticket with QR
            </button>
            <Link
              to="/my-bookings"
              className="px-6 py-3 bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-200 font-bold rounded-xl text-sm"
            >
              Go to My Bookings
            </Link>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          
          {/* Order Details */}
          <div className="md:col-span-2 space-y-6">
            <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-6 space-y-4">
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">Review Booking Order</h2>

              <div className="flex items-center gap-4 pb-4 border-b border-slate-100 dark:border-slate-700">
                <img
                  src={listing.bannerImage || listing.images?.[0]}
                  alt={listing.title}
                  className="w-20 h-20 rounded-xl object-cover"
                />
                <div>
                  <h3 className="font-bold text-slate-900 dark:text-white">{listing.title}</h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">{listing.location?.city}</p>
                  <p className="text-xs text-teal-600 dark:text-teal-400 font-semibold mt-1">
                    {new Date(schedule.date).toDateString()} @ {schedule.startTime}
                  </p>
                </div>
              </div>

              <div className="space-y-2 text-xs text-slate-600 dark:text-slate-300">
                <p><strong>Selected Seats:</strong> {seats.length > 0 ? seats.map((s) => s.seatId).join(', ') : `${quantity} Ticket(s)`}</p>
                <p><strong>Ticket Category:</strong> {listing.categoryType.toUpperCase()}</p>
              </div>
            </div>

            {/* Coupon Promo Code Box */}
            <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-6 space-y-3">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Tag className="w-4 h-4 text-teal-500" /> Apply Coupon Code
              </h3>

              <form onSubmit={handleApplyCoupon} className="flex gap-2">
                <input
                  type="text"
                  placeholder="Try HARBOR20"
                  value={couponInput}
                  onChange={(e) => setCouponInput(e.target.value)}
                  className="flex-1 px-3 py-2 text-xs bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl uppercase font-bold dark:text-white"
                />
                <button
                  type="submit"
                  className="px-4 py-2 bg-slate-900 dark:bg-slate-700 text-white font-bold text-xs rounded-xl hover:bg-slate-800 dark:hover:bg-slate-600"
                >
                  Apply
                </button>
              </form>

              {appliedCoupon && (
                <p className="text-xs font-bold text-emerald-600 dark:text-emerald-400">✓ Coupon '{appliedCoupon}' applied successfully!</p>
              )}
            </div>
          </div>

          {/* Payment Summary Box */}
          <div className="md:col-span-1">
            <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-6 space-y-6 sticky top-24 shadow-lg">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white border-b border-slate-100 dark:border-slate-700 pb-3">
                Payment Breakdown
              </h3>

              <div className="space-y-3 text-xs">
                <div className="flex items-center justify-between">
                  <span className="text-slate-500 dark:text-slate-400">Subtotal</span>
                  <span className="font-bold text-slate-900 dark:text-white">₹{baseAmount}</span>
                </div>

                {discountAmount > 0 && (
                  <div className="flex items-center justify-between text-emerald-600 dark:text-emerald-400 font-bold">
                    <span>Coupon Discount</span>
                    <span>-₹{discountAmount}</span>
                  </div>
                )}

                <div className="flex items-center justify-between">
                  <span className="text-slate-500 dark:text-slate-400">Service Tax (18%)</span>
                  <span className="font-bold text-slate-900 dark:text-white">₹{taxAmount}</span>
                </div>

                <div className="pt-3 border-t border-slate-100 dark:border-slate-700 flex items-center justify-between text-base">
                  <span className="font-bold text-slate-900 dark:text-white">Total Pay</span>
                  <span className="font-black text-teal-600 dark:text-teal-400">₹{finalAmount}</span>
                </div>
              </div>

              <button
                onClick={handlePayAndConfirm}
                disabled={processing}
                className="w-full py-3.5 bg-gradient-to-r from-teal-500 to-indigo-600 hover:from-teal-600 hover:to-indigo-700 text-white font-bold rounded-xl shadow-lg transition-all text-sm flex items-center justify-center gap-2"
              >
                <ShieldCheck className="w-5 h-5" />
                {processing ? 'Processing Payment...' : `Pay ₹${finalAmount} & Confirm`}
              </button>
            </div>
          </div>

        </div>
      )}

    </div>
  );
}
