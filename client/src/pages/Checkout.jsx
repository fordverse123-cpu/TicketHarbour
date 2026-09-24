import React, { useState } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import API from '../services/api';
import GlassCard from '../components/ui/GlassCard';
import GlassButton from '../components/ui/GlassButton';
import GlassInput from '../components/ui/GlassInput';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';
import {
  Ticket,
  ShieldCheck,
  Tag,
  CheckCircle2,
  Download,
  ArrowLeft,
  Search,
  Check,
  CreditCard,
  User,
  Layers,
  Plane,
  Luggage,
} from 'lucide-react';

import AppLoader from '../components/AppLoader';

export default function Checkout() {
  const { state } = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [checkoutSession] = useState(() => {
    if (state?.listing && state?.schedule) {
      const data = {
        listing: state.listing,
        schedule: state.schedule,
        seats: state.seats || [],
        quantity: state.quantity || 1,
      };
      try {
        sessionStorage.setItem('tixora_checkout_session', JSON.stringify(data));
      } catch (e) {}
      return data;
    }
    try {
      const stored = sessionStorage.getItem('tixora_checkout_session');
      if (stored) return JSON.parse(stored);
    } catch (e) {}
    return null;
  });

  const listing = checkoutSession?.listing;
  const schedule = checkoutSession?.schedule;
  const seats = checkoutSession?.seats || [];
  const quantity = checkoutSession?.quantity || 1;

  const [passenger, setPassenger] = useState({
    firstName: user?.name ? user.name.split(' ')[0] : 'Jaya Sai',
    lastName: user?.name ? user.name.split(' ').slice(1).join(' ') || 'Jaswanth' : 'Jaswanth',
    gender: 'Male',
    dob: '1998-08-14',
    email: user?.email || 'jaswanth@gmail.com',
    phone: user?.phone || '+91 9876543210',
    idNumber: '',
  });

  const [couponInput, setCouponInput] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState(null);
  const [discountAmount, setDiscountAmount] = useState(0);
  const [processing, setProcessing] = useState(false);
  const [confirmedBooking, setConfirmedBooking] = useState(null);

  if (!listing || !schedule) {
    return (
      <GlassCard className="text-center py-20 space-y-4 max-w-lg mx-auto">
        <p className="text-base font-bold text-white">Please select a ticket before proceeding to checkout.</p>
        <Link to="/listings">
          <GlassButton variant="gradient">Browse Listings</GlassButton>
        </Link>
      </GlassCard>
    );
  }

  const baseAmount = seats.length > 0
    ? seats.reduce((sum, s) => sum + s.price, 0)
    : (schedule.price || schedule.pricing?.[0]?.price || listing.pricingTiers?.[0]?.price || 150) * quantity;

  const taxAmount = Math.round(baseAmount * 0.18 * 100) / 100;
  const finalAmount = Math.max(0, baseAmount - discountAmount + taxAmount);

  const isPassengerValid =
    passenger.firstName.trim() &&
    passenger.lastName.trim() &&
    passenger.email.trim() &&
    passenger.phone.trim();

  const steps = [
    { num: 1, label: 'Search', done: true },
    { num: 2, label: 'Select', done: true },
    { num: 3, label: 'Passenger', done: true, active: !confirmedBooking },
    { num: 4, label: 'Payment', done: !confirmedBooking },
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
    if (!passenger.firstName.trim() || !passenger.lastName.trim()) {
      toast.error('Please enter Passenger First and Last Name.');
      return;
    }
    if (!passenger.email.trim() || !passenger.phone.trim()) {
      toast.error('Please enter Passenger Contact Email and Phone number.');
      return;
    }

    setProcessing(true);
    try {
      const bookingRes = await API.post('/bookings', {
        scheduleId: schedule._id,
        listingId: listing._id,
        seats,
        quantity,
        couponCode: appliedCoupon || '',
        passengerInfo: passenger,
        customPrice: schedule.price || baseAmount,
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
        setConfirmedBooking({
          ...confirmRes.data.data.booking,
          passengerInfo: passenger,
        });
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
      <AppLoader visible={processing} mode="fullscreen" text="Processing Payment & Confirming Ticket..." />
      
      {/* Back Button */}
      <button
        onClick={() => navigate(-1)}
        className="flex items-center gap-1.5 text-xs font-bold text-slate-400 hover:text-white transition-colors cursor-pointer"
      >
        <ArrowLeft className="w-4 h-4" /> Back to search
      </button>

      {/* 5-STEP GLOWING PROGRESS INDICATOR */}
      <div className="bg-[#111111] border border-white/10 rounded-2xl p-4 backdrop-blur-xl">
        <div className="flex items-center justify-between relative">
          <div className="absolute left-0 right-0 top-1/2 -translate-y-1/2 h-[2px] bg-white/10 z-0" />
          {steps.map((step) => (
            <div key={step.num} className="relative z-10 flex flex-col items-center gap-1">
              <div
                className={`w-9 h-9 rounded-xl flex items-center justify-center font-black text-xs transition-all duration-300 ${
                  step.active
                    ? 'bg-gradient-to-r from-[#03B3C3] to-[#6750A2] text-white shadow-lg shadow-[#03B3C3]/40 scale-110 ring-4 ring-[#03B3C3]/20'
                    : step.done
                    ? 'bg-[#03B3C3]/20 text-[#03B3C3] border border-[#03B3C3]/40'
                    : 'bg-[#181818] text-slate-500 border border-white/10'
                }`}
              >
                {step.done && !step.active ? <Check className="w-4 h-4" /> : step.num}
              </div>
              <span className={`text-[10px] font-bold ${step.active ? 'text-[#03B3C3]' : 'text-slate-400'}`}>
                {step.label}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Confirmation View when payment succeeds */}
      {confirmedBooking ? (
        <GlassCard className="text-center p-8 space-y-6">
          <div className="h-16 w-16 bg-[#03B3C3]/20 border border-[#03B3C3]/30 text-[#03B3C3] rounded-full flex items-center justify-center mx-auto shadow-lg">
            <CheckCircle2 className="w-10 h-10" />
          </div>

          <div className="space-y-2">
            <span className="px-3 py-1 bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 rounded-full font-bold text-xs">
              BOOKING CONFIRMED ✓
            </span>
            <h2 className="text-3xl font-black text-white pt-2">Ticket Booked Successfully!</h2>
            <p className="text-xs text-slate-400">
              Booking ID / Reference: <strong className="text-[#03B3C3] font-mono text-sm">{confirmedBooking.bookingReference}</strong>
            </p>
          </div>

          <div className="p-6 bg-[#181818] rounded-3xl border border-white/10 max-w-lg mx-auto text-left text-xs space-y-3 text-slate-300">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <div>
                <span className="font-black text-white text-base block">{listing.title}</span>
                <span className="text-[11px] text-[#03B3C3] font-bold">
                  {listing.transitInfo?.source || listing.location?.city} → {listing.transitInfo?.destination || 'Destination'}
                </span>
              </div>
              <span className="px-2.5 py-1 bg-[#03B3C3]/20 text-[#03B3C3] font-mono font-bold rounded-lg text-xs">
                {listing.transitInfo?.number || 'TH-RES'}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-3 pt-1">
              <div>
                <span className="text-slate-500 font-bold block">Passenger Name</span>
                <span className="text-white font-bold text-sm">
                  {passenger.firstName} {passenger.lastName}
                </span>
              </div>
              <div>
                <span className="text-slate-500 font-bold block">Contact Email</span>
                <span className="text-white font-medium">{passenger.email}</span>
              </div>
              <div>
                <span className="text-slate-500 font-bold block">Travel Date & Time</span>
                <span className="text-white font-bold">
                  {new Date(schedule.date).toDateString()} @ {schedule.startTime}
                </span>
              </div>
              <div>
                <span className="text-slate-500 font-bold block">Status</span>
                <span className="text-emerald-400 font-bold">Confirmed</span>
              </div>
            </div>

            <div className="border-t border-white/10 pt-3 flex items-center justify-between">
              <span className="font-bold text-slate-400">Total Amount Paid</span>
              <span className="text-xl font-black text-white">₹{confirmedBooking.totalAmount}</span>
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-4 pt-4">
            <GlassButton onClick={handleDownloadPDF} icon={Download} variant="gradient">
              Download PDF Ticket with QR
            </GlassButton>
            <Link to="/my-bookings">
              <GlassButton variant="secondary">Go to My Bookings</GlassButton>
            </Link>
          </div>
        </GlassCard>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-start">
          
          {/* Main Details & Passenger Form Column */}
          <div className="md:col-span-2 space-y-6">
            {/* Ticket Summary Card */}
            <GlassCard className="space-y-4">
              <h2 className="text-lg font-black text-white flex items-center gap-2">
                <Plane className="w-5 h-5 text-[#03B3C3] rotate-45" /> Review Ticket Order
              </h2>

              <div className="flex items-center gap-4 pb-4 border-b border-white/10">
                <img
                  src={listing.bannerImage || listing.images?.[0] || 'https://images.unsplash.com/photo-1436491865332-7a61a109cc05?auto=format&fit=crop&w=400&q=80'}
                  alt={listing.title}
                  className="w-20 h-20 rounded-xl object-cover border border-white/10"
                />
                <div className="space-y-1">
                  <h3 className="font-black text-white text-base">{listing.title}</h3>
                  <p className="text-xs text-[#03B3C3] font-bold">
                    {listing.transitInfo?.source || listing.location?.city} → {listing.transitInfo?.destination || 'Destination'}
                  </p>
                  <p className="text-xs text-slate-400">
                    Departure: <strong>{new Date(schedule.date).toDateString()} @ {schedule.startTime}</strong>
                  </p>
                </div>
              </div>

              <div className="space-y-2 text-xs text-slate-300">
                <p><strong>Selected Seats/Tier:</strong> {seats.length > 0 ? seats.map((s) => s.seatId).join(', ') : `${quantity} Passenger Ticket(s)`}</p>
                <p><strong>Ticket Category:</strong> {(listing.categoryType || 'booking').toUpperCase()}</p>
              </div>
            </GlassCard>

            {/* Passenger Details Form Card */}
            <GlassCard className="space-y-4">
              <div className="flex items-center justify-between border-b border-white/10 pb-3">
                <h3 className="text-base font-black text-white flex items-center gap-2">
                  <User className="w-5 h-5 text-[#03B3C3]" /> Passenger Details
                </h3>
                <span className="text-[11px] text-slate-400 font-semibold">* All fields required</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div>
                  <label className="block text-slate-400 font-bold mb-1">First Name *</label>
                  <input
                    type="text"
                    required
                    value={passenger.firstName}
                    onChange={(e) => setPassenger({ ...passenger, firstName: e.target.value })}
                    placeholder="Enter first name"
                    className="w-full p-3 bg-[#181818] border border-white/15 rounded-xl text-white font-semibold focus:outline-none focus:border-[#03B3C3]"
                  />
                </div>

                <div>
                  <label className="block text-slate-400 font-bold mb-1">Last Name *</label>
                  <input
                    type="text"
                    required
                    value={passenger.lastName}
                    onChange={(e) => setPassenger({ ...passenger, lastName: e.target.value })}
                    placeholder="Enter last name"
                    className="w-full p-3 bg-[#181818] border border-white/15 rounded-xl text-white font-semibold focus:outline-none focus:border-[#03B3C3]"
                  />
                </div>

                <div>
                  <label className="block text-slate-400 font-bold mb-1">Gender *</label>
                  <select
                    value={passenger.gender}
                    onChange={(e) => setPassenger({ ...passenger, gender: e.target.value })}
                    className="w-full p-3 bg-[#181818] border border-white/15 rounded-xl text-white font-semibold focus:outline-none focus:border-[#03B3C3]"
                  >
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-400 font-bold mb-1">Date of Birth *</label>
                  <input
                    type="date"
                    required
                    value={passenger.dob}
                    onChange={(e) => setPassenger({ ...passenger, dob: e.target.value })}
                    className="w-full p-3 bg-[#181818] border border-white/15 rounded-xl text-white font-semibold focus:outline-none focus:border-[#03B3C3]"
                  />
                </div>

                <div>
                  <label className="block text-slate-400 font-bold mb-1">Email Address *</label>
                  <input
                    type="email"
                    required
                    value={passenger.email}
                    onChange={(e) => setPassenger({ ...passenger, email: e.target.value })}
                    placeholder="name@domain.com"
                    className="w-full p-3 bg-[#181818] border border-white/15 rounded-xl text-white font-semibold focus:outline-none focus:border-[#03B3C3]"
                  />
                </div>

                <div>
                  <label className="block text-slate-400 font-bold mb-1">Mobile Phone *</label>
                  <input
                    type="tel"
                    required
                    value={passenger.phone}
                    onChange={(e) => setPassenger({ ...passenger, phone: e.target.value })}
                    placeholder="+91 9876543210"
                    className="w-full p-3 bg-[#181818] border border-white/15 rounded-xl text-white font-semibold focus:outline-none focus:border-[#03B3C3]"
                  />
                </div>
              </div>
            </GlassCard>
          </div>

          {/* Payment Summary & Breakdown Box */}
          <div className="md:col-span-1">
            <GlassCard className="space-y-5 lg:sticky lg:top-24 self-start">
              <h3 className="text-lg font-black text-white border-b border-white/10 pb-3 uppercase tracking-tight">
                Payment Breakdown
              </h3>

              {/* Fare Details */}
              <div className="space-y-2.5 text-xs">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                  Fare Details
                </span>
                <div className="flex items-center justify-between text-slate-300">
                  <span>Base Fare ({quantity} Ticket{quantity > 1 ? 's' : ''})</span>
                  <span className="font-bold text-white">₹{baseAmount}</span>
                </div>
                <div className="flex items-center justify-between text-slate-300">
                  <span>Convenience Fee & Taxes (18%)</span>
                  <span className="font-bold text-white">₹{taxAmount}</span>
                </div>
              </div>

              <div className="pt-3 border-t border-white/10 flex items-center justify-between text-xs font-bold text-slate-200">
                <span>Total</span>
                <span>₹{Math.round((baseAmount + taxAmount) * 100) / 100}</span>
              </div>

              {/* Subsection: APPLY COUPON CODE */}
              <div className="pt-3 border-t border-white/10 space-y-2.5">
                <div className="flex items-center gap-1.5 text-xs font-bold text-white uppercase tracking-wide">
                  <Tag className="w-3.5 h-3.5 text-[#03B3C3]" />
                  <span>Apply Coupon Code</span>
                </div>

                <form onSubmit={handleApplyCoupon} className="flex gap-2 flex-wrap sm:flex-nowrap">
                  <input
                    type="text"
                    placeholder="Try HARBOR20"
                    value={couponInput}
                    onChange={(e) => setCouponInput(e.target.value)}
                    className="min-w-0 flex-1 px-3 py-2 text-xs bg-[#181818] border border-white/15 rounded-xl uppercase font-bold text-white focus:outline-none focus:border-[#03B3C3]"
                  />
                  <GlassButton type="submit" size="sm" variant="secondary" className="shrink-0">
                    Apply
                  </GlassButton>
                </form>

                {discountAmount > 0 && (
                  <div className="flex items-center justify-between text-xs font-bold text-emerald-400 pt-1">
                    <span>Discount</span>
                    <span>−₹{discountAmount}</span>
                  </div>
                )}

                {appliedCoupon && (
                  <p className="text-[11px] text-emerald-400 font-medium">
                    ✓ Coupon '{appliedCoupon}' applied successfully!
                  </p>
                )}
              </div>

              {/* Total Payable */}
              <div className="pt-3 border-t border-white/10 flex items-center justify-between">
                <span className="text-sm font-black text-white">Total Payable</span>
                <span className="text-xl font-black text-[#03B3C3]">₹{finalAmount}</span>
              </div>

              {/* Book Ticket Button */}
              <GlassButton
                onClick={handlePayAndConfirm}
                loading={processing}
                disabled={processing}
                className="w-full py-3.5 mt-5"
                variant="gradient"
                icon={ShieldCheck}
              >
                {processing ? 'Booking Ticket...' : 'Book Ticket →'}
              </GlassButton>
            </GlassCard>
          </div>

        </div>
      )}

    </div>
  );
}
