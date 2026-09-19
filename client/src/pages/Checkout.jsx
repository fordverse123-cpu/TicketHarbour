import React, { useState } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import API from '../services/api';
import GlassCard from '../components/ui/GlassCard';
import GlassButton from '../components/ui/GlassButton';
import GlassInput from '../components/ui/GlassInput';
import toast from 'react-hot-toast';
import { Ticket, ShieldCheck, Tag, CheckCircle2, Download, ArrowLeft, Search, Check, CreditCard, User, Layers } from 'lucide-react';

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
      <GlassCard className="text-center py-20 space-y-4 max-w-lg mx-auto">
        <p className="text-base font-bold text-white">No active checkout session</p>
        <Link to="/listings">
          <GlassButton variant="gradient">Browse Listings</GlassButton>
        </Link>
      </GlassCard>
    );
  }

  const baseAmount = seats.length > 0
    ? seats.reduce((sum, s) => sum + s.price, 0)
    : (schedule.pricing?.[0]?.price || listing.pricingTiers?.[0]?.price || 150) * quantity;

  const taxAmount = Math.round(baseAmount * 0.18 * 100) / 100;
  const finalAmount = Math.max(0, baseAmount - discountAmount + taxAmount);

  const steps = [
    { num: 1, label: 'Search', done: true },
    { num: 2, label: 'Select', done: true },
    { num: 3, label: 'Passenger', done: true },
    { num: 4, label: 'Payment', done: !confirmedBooking, active: !confirmedBooking },
    { num: 5, label: 'Confirmation', done: !!confirmedBooking, active: !!confirmedBooking },
  ];

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

      const paymentRes = await API.post('/payments/create-intent', {
        bookingId: booking._id,
      });

      const paymentIntentId = paymentRes.data.data.paymentIntentId;

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
      link.setAttribute('download', `TicketHarbour_${confirmedBooking.bookingReference}.pdf`);
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
        className="flex items-center gap-1.5 text-xs font-bold text-slate-400 hover:text-white transition-colors cursor-pointer"
      >
        <ArrowLeft className="w-4 h-4" /> Back to details
      </button>

      {/* 5-STEP GLOWING PROGRESS INDICATOR */}
      <div className="bg-harbour-card/80 border border-white/10 rounded-2xl p-4 backdrop-blur-xl">
        <div className="flex items-center justify-between relative">
          <div className="absolute left-0 right-0 top-1/2 -translate-y-1/2 h-[2px] bg-white/10 z-0" />
          {steps.map((step) => (
            <div key={step.num} className="relative z-10 flex flex-col items-center gap-1">
              <div
                className={`w-9 h-9 rounded-xl flex items-center justify-center font-black text-xs transition-all duration-300 ${
                  step.active
                    ? 'bg-gradient-to-r from-cyanAccent-500 to-indigoAccent-600 text-white shadow-lg shadow-cyanAccent-500/40 scale-110 ring-4 ring-cyanAccent-500/20'
                    : step.done
                    ? 'bg-cyanAccent-500/20 text-cyanAccent-400 border border-cyanAccent-500/40'
                    : 'bg-harbour-darker text-slate-500 border border-white/10'
                }`}
              >
                {step.done && !step.active ? <Check className="w-4 h-4" /> : step.num}
              </div>
              <span className={`text-[10px] font-bold ${step.active ? 'text-cyanAccent-400' : 'text-slate-400'}`}>
                {step.label}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Confirmation View when payment succeeds */}
      {confirmedBooking ? (
        <GlassCard className="text-center p-8 space-y-6">
          <div className="h-16 w-16 bg-cyanAccent-500/20 border border-cyanAccent-500/30 text-cyanAccent-400 rounded-full flex items-center justify-center mx-auto shadow-lg">
            <CheckCircle2 className="w-10 h-10" />
          </div>

          <div className="space-y-2">
            <h2 className="text-3xl font-black text-white">Booking Confirmed!</h2>
            <p className="text-xs text-slate-400">
              Reference: <strong className="text-cyanAccent-400 font-mono">{confirmedBooking.bookingReference}</strong>
            </p>
          </div>

          <div className="p-4 bg-harbour-darker/80 rounded-2xl border border-white/10 max-w-md mx-auto text-left text-xs space-y-2 text-slate-300">
            <p><strong>Item:</strong> {listing.title}</p>
            <p><strong>Schedule:</strong> {new Date(schedule.date).toDateString()} at {schedule.startTime}</p>
            <p><strong>Seats/Qty:</strong> {seats.length > 0 ? seats.map((s) => s.seatId).join(', ') : quantity}</p>
            <p><strong>Total Paid:</strong> ₹{confirmedBooking.totalAmount}</p>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-4 pt-4">
            <GlassButton onClick={handleDownloadPDF} icon={Download}>
              Download PDF Ticket with QR
            </GlassButton>
            <Link to="/my-bookings">
              <GlassButton variant="secondary">Go to My Bookings</GlassButton>
            </Link>
          </div>
        </GlassCard>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          
          {/* Order Details */}
          <div className="md:col-span-2 space-y-6">
            <GlassCard className="space-y-4">
              <h2 className="text-lg font-black text-white">Review Booking Order</h2>

              <div className="flex items-center gap-4 pb-4 border-b border-white/10">
                <img
                  src={listing.bannerImage || listing.images?.[0]}
                  alt={listing.title}
                  className="w-20 h-20 rounded-xl object-cover border border-white/10"
                />
                <div className="space-y-1">
                  <h3 className="font-black text-white text-base">{listing.title}</h3>
                  <p className="text-xs text-slate-400">{listing.location?.city}</p>
                  <p className="text-xs text-cyanAccent-400 font-bold">
                    {new Date(schedule.date).toDateString()} @ {schedule.startTime}
                  </p>
                </div>
              </div>

              <div className="space-y-2 text-xs text-slate-300">
                <p><strong>Selected Seats:</strong> {seats.length > 0 ? seats.map((s) => s.seatId).join(', ') : `${quantity} Ticket(s)`}</p>
                <p><strong>Ticket Category:</strong> {listing.categoryType.toUpperCase()}</p>
              </div>
            </GlassCard>

            {/* Coupon Promo Code Box */}
            <GlassCard className="space-y-3">
              <h3 className="text-xs font-black uppercase text-white flex items-center gap-2">
                <Tag className="w-4 h-4 text-cyanAccent-400" /> Apply Coupon Code
              </h3>

              <form onSubmit={handleApplyCoupon} className="flex gap-2">
                <input
                  type="text"
                  placeholder="Try HARBOR20"
                  value={couponInput}
                  onChange={(e) => setCouponInput(e.target.value)}
                  className="flex-1 px-3.5 py-2.5 text-xs bg-harbour-darker border border-white/15 rounded-xl uppercase font-bold text-white focus:outline-none focus:border-cyanAccent-500"
                />
                <GlassButton type="submit" size="sm" variant="secondary">
                  Apply
                </GlassButton>
              </form>

              {appliedCoupon && (
                <p className="text-xs font-bold text-emerald-400">✓ Coupon '{appliedCoupon}' applied successfully!</p>
              )}
            </GlassCard>
          </div>

          {/* Payment Summary Box */}
          <div className="md:col-span-1">
            <GlassCard className="space-y-6 sticky top-24">
              <h3 className="text-lg font-black text-white border-b border-white/10 pb-3">
                Payment Breakdown
              </h3>

              <div className="space-y-3 text-xs">
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">Subtotal</span>
                  <span className="font-bold text-white">₹{baseAmount}</span>
                </div>

                {discountAmount > 0 && (
                  <div className="flex items-center justify-between text-emerald-400 font-bold">
                    <span>Coupon Discount</span>
                    <span>-₹{discountAmount}</span>
                  </div>
                )}

                <div className="flex items-center justify-between text-slate-400">
                  <span>Service Tax (18%)</span>
                  <span className="font-bold text-white">₹{taxAmount}</span>
                </div>

                <div className="pt-3 border-t border-white/10 flex items-center justify-between text-base">
                  <span className="font-black text-white">Total Pay</span>
                  <span className="font-black text-cyanAccent-400">₹{finalAmount}</span>
                </div>
              </div>

              <GlassButton
                onClick={handlePayAndConfirm}
                loading={processing}
                className="w-full py-3.5"
                icon={ShieldCheck}
              >
                {processing ? 'Processing Payment...' : `Pay ₹${finalAmount} & Confirm`}
              </GlassButton>
            </GlassCard>
          </div>

        </div>
      )}

    </div>
  );
}

