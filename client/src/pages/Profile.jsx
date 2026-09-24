import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import API from '../services/api';
import GlassCard from '../components/ui/GlassCard';
import GlassButton from '../components/ui/GlassButton';
import GlassModal from '../components/ui/GlassModal';
import GlassInput from '../components/ui/GlassInput';
import { CardSkeletonGrid, BookingCardSkeleton } from '../components/loading';
import toast from 'react-hot-toast';
import {
  User,
  Lock,
  Mail,
  Phone,
  Ticket,
  Calendar,
  Wallet,
  Clock,
  Download,
  QrCode,
  CheckCircle2,
  XCircle,
  Bus,
  Train,
  Plane,
  Film,
  Search,
  AlertCircle,
  ShieldCheck,
} from 'lucide-react';

export default function Profile() {
  const { user, updateProfile } = useAuth();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  const tabParam = searchParams.get('tab') || 'upcoming';
  const [activeTab, setActiveTab] = useState(tabParam);

  useEffect(() => {
    if (searchParams.get('tab')) {
      setActiveTab(searchParams.get('tab'));
    }
  }, [searchParams]);

  // Bookings state
  const [bookings, setBookings] = useState([]);
  const [counts, setCounts] = useState({ upcoming: 0, completed: 0, cancelled: 0, total: 0 });
  const [loadingBookings, setLoadingBookings] = useState(true);
  const [selectedQRBooking, setSelectedQRBooking] = useState(null);
  const [selectedDetailBooking, setSelectedDetailBooking] = useState(null);

  // Profile Edit State
  const [name, setName] = useState(user?.name || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [updatingProfile, setUpdatingProfile] = useState(false);

  // Password State
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [updatingPassword, setUpdatingPassword] = useState(false);

  useEffect(() => {
    if (user) {
      fetchUserBookings();
    }
  }, [user]);

  const fetchUserBookings = async () => {
    setLoadingBookings(true);
    try {
      const res = await API.get('/bookings/my-bookings');
      if (res.data.success) {
        setBookings(res.data.data.allBookings || res.data.data.bookings || []);
        if (res.data.data.counts) {
          setCounts(res.data.data.counts);
        }
      }
    } catch (err) {
      toast.error('Failed to load booking history.');
    } finally {
      setLoadingBookings(false);
    }
  };

  const handleTabChange = (tabKey) => {
    setActiveTab(tabKey);
    setSearchParams({ tab: tabKey });
  };

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    setUpdatingProfile(true);
    await updateProfile({ name, phone });
    setUpdatingProfile(false);
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    if (!currentPassword || !newPassword) {
      toast.error('Please enter current and new password.');
      return;
    }
    setUpdatingPassword(true);
    try {
      const res = await API.put('/users/change-password', { currentPassword, newPassword });
      if (res.data.success) {
        toast.success('Password updated successfully!');
        setCurrentPassword('');
        setNewPassword('');
      }
    } catch (err) {
      const msg = err.response?.data?.message || 'Password update failed.';
      toast.error(msg);
    } finally {
      setUpdatingPassword(false);
    }
  };

  const handleDownloadPDF = async (b) => {
    try {
      const res = await API.get(`/bookings/${b._id}/ticket-pdf`, { responseType: 'blob' });
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `TicketHarbour_${b.bookingReference}.pdf`);
      document.body.appendChild(link);
      link.click();
    } catch (err) {
      toast.error('PDF download failed.');
    }
  };

  const handleCancelBooking = async (bId) => {
    if (!window.confirm('Are you sure you want to cancel this booking? Refund will be initiated according to policy.')) {
      return;
    }
    try {
      const res = await API.post(`/bookings/${bId}/cancel`);
      if (res.data.success) {
        toast.success('Booking cancelled successfully.');
        fetchUserBookings();
      }
    } catch (err) {
      const msg = err.response?.data?.message || 'Cancellation failed.';
      toast.error(msg);
    }
  };

  const getTransportIcon = (categoryType) => {
    const c = (categoryType || '').toLowerCase();
    if (c === 'bus') return <Bus className="w-5 h-5 text-[#03B3C3]" />;
    if (c === 'train') return <Train className="w-5 h-5 text-emerald-400" />;
    if (c === 'flight') return <Plane className="w-5 h-5 text-[#03B3C3] rotate-45" />;
    return <Film className="w-5 h-5 text-indigo-400" />;
  };

  // Filtered booking lists based on computed status
  const upcomingBookings = bookings.filter((b) => b.computedStatus === 'UPCOMING' || b.computedStatus === 'CONFIRMED');
  const completedBookings = bookings.filter((b) => b.computedStatus === 'COMPLETED');
  const cancelledBookings = bookings.filter((b) => b.computedStatus === 'CANCELLED');

  const totalSpend = bookings.reduce((sum, b) => (b.computedStatus !== 'CANCELLED' ? sum + (b.totalAmount || 0) : sum), 0);

  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-16">
      
      {/* Header Profile Dashboard */}
      <div className="bg-[#111111] border border-white/10 p-6 rounded-3xl backdrop-blur-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-[#03B3C3] to-[#6750A2] text-white flex items-center justify-center font-black text-2xl shadow-xl">
            {user?.name?.charAt(0).toUpperCase() || 'U'}
          </div>
          <div>
            <h1 className="text-2xl font-black text-white">{user?.name}</h1>
            <p className="text-xs text-slate-400 flex items-center gap-1.5 pt-0.5">
              <Mail className="w-3.5 h-3.5 text-[#03B3C3]" /> {user?.email}
            </p>
            <p className="text-[11px] text-emerald-400 font-bold flex items-center gap-1 pt-1">
              <ShieldCheck className="w-3.5 h-3.5" /> Verified TicketHarbour Account
            </p>
          </div>
        </div>

        {/* Quick Stats Badges */}
        <div className="grid grid-cols-3 gap-3 w-full md:w-auto text-center">
          <div className="p-3 bg-[#181818] border border-white/10 rounded-2xl">
            <span className="text-[10px] text-slate-400 font-bold block uppercase">Upcoming</span>
            <span className="text-lg font-black text-[#03B3C3]">{upcomingBookings.length}</span>
          </div>
          <div className="p-3 bg-[#181818] border border-white/10 rounded-2xl">
            <span className="text-[10px] text-slate-400 font-bold block uppercase">Completed</span>
            <span className="text-lg font-black text-emerald-400">{completedBookings.length}</span>
          </div>
          <div className="p-3 bg-[#181818] border border-white/10 rounded-2xl">
            <span className="text-[10px] text-slate-400 font-bold block uppercase">Total Spend</span>
            <span className="text-lg font-black text-white">₹{totalSpend}</span>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex items-center gap-2 border-b border-white/10 pb-3 overflow-x-auto scrollbar-none">
        {[
          { key: 'upcoming', label: `Upcoming Bookings (${upcomingBookings.length})`, icon: Calendar },
          { key: 'completed', label: `Completed Bookings (${completedBookings.length})`, icon: CheckCircle2 },
          { key: 'cancelled', label: `Cancelled Bookings (${cancelledBookings.length})`, icon: XCircle },
          { key: 'settings', label: 'Personal Details & Settings', icon: User },
        ].map((tab) => {
          const IconComponent = tab.icon;
          const isActive = activeTab === tab.key;
          return (
            <button
              key={tab.key}
              type="button"
              onClick={() => handleTabChange(tab.key)}
              className={`px-4 py-2.5 rounded-2xl text-xs font-bold flex items-center gap-2 transition-all cursor-pointer whitespace-nowrap ${
                isActive
                  ? 'bg-gradient-to-r from-[#03B3C3] to-[#6750A2] text-white shadow-lg shadow-[#03B3C3]/20'
                  : 'bg-[#111111] text-slate-400 hover:text-white border border-white/10'
              }`}
            >
              <IconComponent className="w-4 h-4" /> {tab.label}
            </button>
          );
        })}
      </div>

      {/* Tab Content 1: UPCOMING BOOKINGS */}
      {activeTab === 'upcoming' && (
        <div className="space-y-4">
          {loadingBookings ? (
            <CardSkeletonGrid count={2} CardSkeletonComponent={BookingCardSkeleton} gridClassName="space-y-4" />
          ) : upcomingBookings.length === 0 ? (
            <GlassCard className="text-center py-16 space-y-4">
              <Calendar className="w-12 h-12 text-slate-600 mx-auto" />
              <div className="space-y-1">
                <p className="text-lg font-black text-white">No upcoming bookings</p>
                <p className="text-xs text-slate-400">Book your next bus, train, or flight journey with TicketHarbour.</p>
              </div>
              <Link to="/">
                <GlassButton variant="gradient" icon={Search}>
                  Search Tickets Now
                </GlassButton>
              </Link>
            </GlassCard>
          ) : (
            upcomingBookings.map((b) => {
              const listing = b.listing || {};
              const schedule = b.schedule || {};
              const passengerName = b.passengerInfo?.firstName
                ? `${b.passengerInfo.firstName} ${b.passengerInfo.lastName}`
                : user?.name || 'Valued Guest';

              return (
                <GlassCard key={b._id} hover={false} className="space-y-4">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/10 pb-4">
                    <div className="flex items-center gap-3">
                      <div className="p-3 bg-[#181818] border border-white/10 rounded-2xl">
                        {getTransportIcon(b.categoryType)}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] font-black text-[#03B3C3] uppercase tracking-wider">
                            {b.categoryType}
                          </span>
                          <span className="px-2 py-0.5 bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 rounded-full font-bold text-[10px]">
                            CONFIRMED
                          </span>
                        </div>
                        <h3 className="font-black text-white text-base sm:text-lg">
                          {listing.transitInfo?.source || listing.location?.city || 'Origin'} → {listing.transitInfo?.destination || 'Destination'}
                        </h3>
                        <p className="text-xs text-slate-400">{listing.title}</p>
                      </div>
                    </div>

                    <div className="text-right">
                      <span className="text-xs text-slate-400 block font-semibold">Booking Reference</span>
                      <span className="text-base font-mono font-black text-[#03B3C3]">{b.bookingReference}</span>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs text-slate-300">
                    <div>
                      <span className="text-slate-500 font-bold block">Travel Date</span>
                      <span className="text-white font-bold">{new Date(schedule.date || b.createdAt).toDateString()}</span>
                    </div>
                    <div>
                      <span className="text-slate-500 font-bold block">Departure Time</span>
                      <span className="text-white font-bold">{schedule.startTime || listing.transitInfo?.departureTime || '10:30'}</span>
                    </div>
                    <div>
                      <span className="text-slate-500 font-bold block">Passenger Name</span>
                      <span className="text-white font-bold">{passengerName}</span>
                    </div>
                    <div>
                      <span className="text-slate-500 font-bold block">Fare Paid</span>
                      <span className="text-white font-black text-base">₹{b.totalAmount}</span>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center justify-end gap-2 pt-2 border-t border-white/10">
                    <GlassButton size="sm" variant="secondary" onClick={() => setSelectedDetailBooking(b)}>
                      View Details
                    </GlassButton>
                    <GlassButton size="sm" variant="secondary" onClick={() => setSelectedQRBooking(b)} icon={QrCode}>
                      View QR
                    </GlassButton>
                    <GlassButton size="sm" variant="gradient" onClick={() => handleDownloadPDF(b)} icon={Download}>
                      PDF Ticket
                    </GlassButton>
                    <GlassButton size="sm" variant="danger" onClick={() => handleCancelBooking(b._id)}>
                      Cancel Booking
                    </GlassButton>
                  </div>
                </GlassCard>
              );
            })
          )}
        </div>
      )}

      {/* Tab Content 2: COMPLETED BOOKINGS */}
      {activeTab === 'completed' && (
        <div className="space-y-4">
          {loadingBookings ? (
            <CardSkeletonGrid count={2} CardSkeletonComponent={BookingCardSkeleton} gridClassName="space-y-4" />
          ) : completedBookings.length === 0 ? (
            <GlassCard className="text-center py-16 space-y-2">
              <CheckCircle2 className="w-12 h-12 text-slate-600 mx-auto" />
              <p className="text-lg font-black text-white">No completed bookings yet</p>
              <p className="text-xs text-slate-400">Completed journeys will automatically appear here once departure time passes.</p>
            </GlassCard>
          ) : (
            completedBookings.map((b) => {
              const listing = b.listing || {};
              const schedule = b.schedule || {};
              const passengerName = b.passengerInfo?.firstName
                ? `${b.passengerInfo.firstName} ${b.passengerInfo.lastName}`
                : user?.name || 'Valued Guest';

              return (
                <GlassCard key={b._id} hover={false} className="space-y-4 border-emerald-500/20">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/10 pb-4">
                    <div className="flex items-center gap-3">
                      <div className="p-3 bg-[#181818] border border-white/10 rounded-2xl">
                        {getTransportIcon(b.categoryType)}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] font-black text-emerald-400 uppercase tracking-wider">
                            {b.categoryType}
                          </span>
                          <span className="px-2 py-0.5 bg-purple-500/20 text-purple-300 border border-purple-500/30 rounded-full font-bold text-[10px]">
                            COMPLETED
                          </span>
                        </div>
                        <h3 className="font-black text-white text-base sm:text-lg">
                          {listing.transitInfo?.source || listing.location?.city || 'Origin'} → {listing.transitInfo?.destination || 'Destination'}
                        </h3>
                        <p className="text-xs text-slate-400">{listing.title}</p>
                      </div>
                    </div>

                    <div className="text-right">
                      <span className="text-xs text-slate-400 block font-semibold">Booking Reference</span>
                      <span className="text-base font-mono font-black text-white">{b.bookingReference}</span>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs text-slate-300">
                    <div>
                      <span className="text-slate-500 font-bold block">Travel Date</span>
                      <span className="text-white font-bold">{new Date(schedule.date || b.createdAt).toDateString()}</span>
                    </div>
                    <div>
                      <span className="text-slate-500 font-bold block">Departure</span>
                      <span className="text-white font-bold">{schedule.startTime || listing.transitInfo?.departureTime || '10:30'}</span>
                    </div>
                    <div>
                      <span className="text-slate-500 font-bold block">Passenger</span>
                      <span className="text-white font-bold">{passengerName}</span>
                    </div>
                    <div>
                      <span className="text-slate-500 font-bold block">Total Paid</span>
                      <span className="text-emerald-400 font-black text-base">₹{b.totalAmount}</span>
                    </div>
                  </div>

                  {/* NO CANCEL BUTTON FOR COMPLETED JOURNEYS */}
                  <div className="flex flex-wrap items-center justify-end gap-2 pt-2 border-t border-white/10">
                    <GlassButton size="sm" variant="secondary" onClick={() => setSelectedDetailBooking(b)}>
                      View Details
                    </GlassButton>
                    <GlassButton size="sm" variant="secondary" onClick={() => setSelectedQRBooking(b)} icon={QrCode}>
                      View QR Pass
                    </GlassButton>
                    <GlassButton size="sm" variant="gradient" onClick={() => handleDownloadPDF(b)} icon={Download}>
                      Download Ticket PDF
                    </GlassButton>
                  </div>
                </GlassCard>
              );
            })
          )}
        </div>
      )}

      {/* Tab Content 3: CANCELLED BOOKINGS */}
      {activeTab === 'cancelled' && (
        <div className="space-y-4">
          {loadingBookings ? (
            <CardSkeletonGrid count={2} CardSkeletonComponent={BookingCardSkeleton} gridClassName="space-y-4" />
          ) : cancelledBookings.length === 0 ? (
            <GlassCard className="text-center py-16 space-y-2">
              <XCircle className="w-12 h-12 text-slate-600 mx-auto" />
              <p className="text-lg font-black text-white">No cancelled bookings</p>
            </GlassCard>
          ) : (
            cancelledBookings.map((b) => {
              const listing = b.listing || {};
              const schedule = b.schedule || {};

              return (
                <GlassCard key={b._id} hover={false} className="space-y-4 border-rose-500/20 opacity-85">
                  <div className="flex items-center justify-between border-b border-white/10 pb-3">
                    <div className="flex items-center gap-3">
                      <div className="p-2.5 bg-rose-500/10 rounded-xl">
                        {getTransportIcon(b.categoryType)}
                      </div>
                      <div>
                        <span className="px-2 py-0.5 bg-rose-500/20 text-rose-400 border border-rose-500/30 rounded-full font-bold text-[10px]">
                          CANCELLED
                        </span>
                        <h3 className="font-bold text-white text-sm pt-1">
                          {listing.transitInfo?.source || listing.location?.city || 'Origin'} → {listing.transitInfo?.destination || 'Destination'}
                        </h3>
                      </div>
                    </div>
                    <span className="text-xs font-mono text-slate-400">{b.bookingReference}</span>
                  </div>

                  <div className="flex items-center justify-between text-xs text-slate-400">
                    <span>Travel Date: <strong className="text-white">{new Date(schedule.date || b.createdAt).toDateString()}</strong></span>
                    <span>Refunded Amount: <strong className="text-rose-400 font-bold">₹{b.totalAmount}</strong></span>
                  </div>
                </GlassCard>
              );
            })
          )}
        </div>
      )}

      {/* Tab Content 4: PERSONAL DETAILS & SECURITY SETTINGS */}
      {activeTab === 'settings' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <GlassCard className="space-y-4">
            <h2 className="text-lg font-black text-white flex items-center gap-2">
              <User className="w-5 h-5 text-[#03B3C3]" /> Personal Information
            </h2>

            <form onSubmit={handleProfileSubmit} className="space-y-4 text-xs">
              <GlassInput
                label="Full Name"
                icon={User}
                value={name}
                onChange={(e) => setName(e.target.value)}
              />

              <GlassInput
                label="Email Address (Verified)"
                icon={Mail}
                disabled
                value={user?.email || ''}
              />

              <GlassInput
                label="Phone Number"
                icon={Phone}
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+91 98765 43210"
              />

              <GlassButton type="submit" loading={updatingProfile} className="w-full py-3" variant="gradient">
                Save Personal Details
              </GlassButton>
            </form>
          </GlassCard>

          <GlassCard className="space-y-4">
            <h2 className="text-lg font-black text-white flex items-center gap-2">
              <Lock className="w-5 h-5 text-indigo-400" /> Account Security
            </h2>

            <form onSubmit={handlePasswordSubmit} className="space-y-4 text-xs">
              <GlassInput
                label="Current Password"
                type="password"
                icon={Lock}
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
              />

              <GlassInput
                label="New Password (min 6 chars)"
                type="password"
                icon={Lock}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
              />

              <GlassButton type="submit" variant="secondary" loading={updatingPassword} className="w-full py-3">
                Update Password
              </GlassButton>
            </form>
          </GlassCard>
        </div>
      )}

      {/* QR Code Popup Modal */}
      <GlassModal
        isOpen={!!selectedQRBooking}
        onClose={() => setSelectedQRBooking(null)}
        title="Boarding Gate QR Ticket"
        maxWidth="max-w-sm"
      >
        {selectedQRBooking && (
          <div className="text-center space-y-4">
            <p className="text-xs text-slate-400">
              Ref: <span className="font-mono text-[#03B3C3] font-bold">{selectedQRBooking.bookingReference}</span>
            </p>

            <div className="p-4 bg-white rounded-2xl border border-white/20 inline-block mx-auto shadow-xl">
              <img
                src={`https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=${encodeURIComponent(
                  selectedQRBooking.qrCodeData || selectedQRBooking.bookingReference
                )}`}
                alt="Ticket QR Code"
                className="w-44 h-44 mx-auto"
              />
            </div>

            <p className="text-xs text-slate-400">Present this QR code at terminal entry gate for instant check-in</p>
          </div>
        )}
      </GlassModal>

      {/* Full Booking Details Modal */}
      <GlassModal
        isOpen={!!selectedDetailBooking}
        onClose={() => setSelectedDetailBooking(null)}
        title="Complete Ticket Booking Details"
        maxWidth="max-w-md"
      >
        {selectedDetailBooking && (
          <div className="space-y-4 text-xs text-slate-300">
            <div className="p-3 bg-[#181818] border border-white/10 rounded-2xl flex items-center justify-between">
              <span className="font-bold text-white uppercase">{selectedDetailBooking.categoryType} Ticket</span>
              <span className="font-mono text-[#03B3C3] font-bold">{selectedDetailBooking.bookingReference}</span>
            </div>

            <div className="space-y-2">
              <p><strong>Item / Route:</strong> {selectedDetailBooking.listing?.title}</p>
              <p>
                <strong>Date & Time:</strong>{' '}
                {new Date(selectedDetailBooking.schedule?.date || selectedDetailBooking.createdAt).toDateString()} @{' '}
                {selectedDetailBooking.schedule?.startTime || '10:30'}
              </p>
              <p>
                <strong>Passenger:</strong>{' '}
                {selectedDetailBooking.passengerInfo?.firstName
                  ? `${selectedDetailBooking.passengerInfo.firstName} ${selectedDetailBooking.passengerInfo.lastName}`
                  : user?.name}
              </p>
              <p><strong>Passenger Contact:</strong> {selectedDetailBooking.passengerInfo?.email || user?.email}</p>
              <p><strong>Seats / Qty:</strong> {selectedDetailBooking.seats?.length > 0 ? selectedDetailBooking.seats.map((s) => s.seatId).join(', ') : `${selectedDetailBooking.quantity} Ticket(s)`}</p>
              <p><strong>Fare Amount Paid:</strong> ₹{selectedDetailBooking.totalAmount}</p>
              <p>
                <strong>Booking Status:</strong>{' '}
                <span className="text-emerald-400 font-bold uppercase">{selectedDetailBooking.computedStatus || selectedDetailBooking.status}</span>
              </p>
            </div>

            <div className="pt-2 flex justify-end">
              <GlassButton variant="gradient" size="sm" onClick={() => handleDownloadPDF(selectedDetailBooking)} icon={Download}>
                Download PDF
              </GlassButton>
            </div>
          </div>
        )}
      </GlassModal>

    </div>
  );
}
