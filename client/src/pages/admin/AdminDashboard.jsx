import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import API from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import GlassCard from '../../components/ui/GlassCard';
import GlassButton from '../../components/ui/GlassButton';
import GlassModal from '../../components/ui/GlassModal';
import Skeleton from '../../components/ui/Skeleton';
import toast from 'react-hot-toast';
import {
  TrendingUp,
  Ticket,
  Film,
  QrCode,
  ShieldCheck,
  CheckCircle,
  PlusCircle,
  Bus,
  Train,
  Plane,
  Calendar,
  Trophy,
  Compass,
} from 'lucide-react';

const CATEGORY_MAP = {
  MOVIES: { label: 'Movies', icon: Film, link: '/movies' },
  EVENTS: { label: 'Events', icon: Calendar, link: '/events' },
  SPORTS: { label: 'Sports', icon: Trophy, link: '/sports' },
  BUS: { label: 'Bus', icon: Bus, link: '/bus' },
  TRAIN: { label: 'Train', icon: Train, link: '/train' },
  FLIGHTS: { label: 'Flights', icon: Plane, link: '/flights' },
  ATTRACTIONS: { label: 'Attractions', icon: Compass, link: '/attractions' },
};

export default function AdminDashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [categoryStats, setCategoryStats] = useState([]);
  const [recentBookings, setRecentBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  // QR Scanner Modal
  const [qrModalOpen, setQrModalOpen] = useState(false);
  const [qrInput, setQrInput] = useState('');
  const [verifying, setVerifying] = useState(false);
  const [verificationResult, setVerificationResult] = useState(null);

  const permissions = user?.permissions || ['MOVIES', 'EVENTS', 'SPORTS', 'BUS', 'TRAIN', 'FLIGHTS', 'ATTRACTIONS'];
  const isSuperAdmin = user?.role?.toUpperCase() === 'SUPER_ADMIN' || permissions.includes('ALL');

  const allowedCategories = isSuperAdmin
    ? Object.keys(CATEGORY_MAP)
    : permissions.map((p) => p.toUpperCase());

  const [searchAnalytics, setSearchAnalytics] = useState(null);

  useEffect(() => {
    fetchAdminStats();
  }, []);

  const fetchAdminStats = async () => {
    setLoading(true);
    try {
      const [res, searchRes] = await Promise.all([
        API.get('/admin/stats'),
        API.get('/searches/analytics').catch(() => null),
      ]);

      if (res.data?.success) {
        setStats(res.data.data.stats);
        setCategoryStats(res.data.data.categoryStats);
        setRecentBookings(res.data.data.recentBookings);
      }

      if (searchRes?.data?.success) {
        setSearchAnalytics(searchRes.data.data);
      }
    } catch (err) {
      toast.error('Failed to load admin stats');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyQR = async (e) => {
    e.preventDefault();
    if (!qrInput.trim()) return;

    setVerifying(true);
    try {
      const res = await API.post('/bookings/verify-qr', {
        qrData: qrInput.trim(),
        bookingReference: qrInput.trim(),
      });

      if (res.data.success) {
        setVerificationResult(res.data.data);
        toast.success(res.data.message);
      }
    } catch (err) {
      const msg = err.response?.data?.message || 'Invalid or unconfirmed ticket.';
      toast.error(msg);
      setVerificationResult(null);
    } finally {
      setVerifying(false);
    }
  };

  // Filter category stats based on allowed permissions
  const filteredCategoryStats = categoryStats.filter((cat) =>
    allowedCategories.includes(cat._id?.toUpperCase())
  );

  return (
    <div className="space-y-8 pb-16">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-white tracking-tight flex items-center gap-2.5">
            <ShieldCheck className="w-8 h-8 text-[#03B3C3]" /> Admin Control Dashboard
          </h1>
          <p className="text-xs text-[#B5B5B5]">
            Manage assigned booking categories: {allowedCategories.join(', ')}
          </p>
        </div>

        <div className="flex items-center gap-3">
          <GlassButton
            onClick={() => {
              setQrInput('');
              setVerificationResult(null);
              setQrModalOpen(true);
            }}
            icon={QrCode}
          >
            Verify Ticket QR
          </GlassButton>
          
          <Link to="/admin/listings">
            <GlassButton variant="secondary" icon={PlusCircle}>
              Manage Listings
            </GlassButton>
          </Link>
        </div>
      </div>

      {/* Allowed Category Shortcut Pills */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
        <span className="text-xs font-bold uppercase text-[#777777] pr-2">Your Permitted Modules:</span>
        {allowedCategories.map((catKey) => {
          const config = CATEGORY_MAP[catKey];
          if (!config) return null;
          const Icon = config.icon;
          return (
            <Link
              key={catKey}
              to={config.link}
              className="flex items-center gap-2 px-3.5 py-1.5 bg-[#03B3C3]/15 text-[#03B3C3] border border-[#03B3C3]/30 rounded-full text-xs font-bold hover:bg-[#03B3C3]/25 transition-all"
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{config.label}</span>
            </Link>
          );
        })}
      </div>

      {/* Stats Counters */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <Skeleton className="h-32" count={4} />
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <GlassCard hover={false} className="space-y-2">
            <span className="text-[10px] text-[#A0A0A0] font-bold uppercase tracking-wider">Total Revenue</span>
            <p className="text-3xl font-black text-[#03B3C3]">₹{stats?.totalRevenue || 0}</p>
            <div className="flex items-center gap-1 text-xs text-emerald-400 font-bold">
              <TrendingUp className="w-3.5 h-3.5" /> Verified Sales
            </div>
          </GlassCard>

          <GlassCard hover={false} className="space-y-2">
            <span className="text-[10px] text-[#A0A0A0] font-bold uppercase tracking-wider">Confirmed Bookings</span>
            <p className="text-3xl font-black text-[#6750A2]">{stats?.confirmedBookings || 0}</p>
            <p className="text-xs text-[#777777]">Out of {stats?.totalBookings || 0} attempts</p>
          </GlassCard>

          <GlassCard hover={false} className="space-y-2">
            <span className="text-[10px] text-[#A0A0A0] font-bold uppercase tracking-wider">Registered Users</span>
            <p className="text-3xl font-black text-white">{stats?.totalUsers || 0}</p>
            <p className="text-xs text-[#777777]">Platform accounts</p>
          </GlassCard>

          <GlassCard hover={false} className="space-y-2">
            <span className="text-[10px] text-[#A0A0A0] font-bold uppercase tracking-wider">Active Listings</span>
            <p className="text-3xl font-black text-[#D856BF]">{stats?.totalListings || 0}</p>
            <p className="text-xs text-[#777777]">Permitted modules</p>
          </GlassCard>
        </div>
      )}

      {/* Permitted Category Breakdown */}
      <GlassCard hover={false} className="space-y-4">
        <h2 className="text-lg font-black text-white">Permitted Category Sales Distribution</h2>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {filteredCategoryStats.map((cat) => (
            <div key={cat._id} className="p-4 bg-[#111111] rounded-2xl border border-white/10 space-y-1">
              <span className="text-[10px] uppercase font-bold text-[#03B3C3]">{cat._id}</span>
              <p className="text-lg font-black text-white">₹{cat.revenue}</p>
              <p className="text-xs text-[#777777]">{cat.count} ticket(s) sold</p>
            </div>
          ))}
        </div>
      </GlassCard>

      {/* Search Analytics Card */}
      {searchAnalytics && (
        <GlassCard hover={false} className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-black text-white">Search Analytics & Trending Routes</h2>
            <span className="text-xs font-bold text-[#03B3C3] bg-[#03B3C3]/15 px-3 py-1 rounded-full border border-[#03B3C3]/30">
              Total Queries: {searchAnalytics.totalSearches || 0}
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <h3 className="text-xs font-bold uppercase text-slate-400">Popular Search Routes</h3>
              {searchAnalytics.topRoutes && searchAnalytics.topRoutes.length > 0 ? (
                <div className="space-y-2">
                  {searchAnalytics.topRoutes.map((route, idx) => (
                    <div key={idx} className="flex items-center justify-between p-3 bg-[#111111] rounded-xl border border-white/10 text-xs">
                      <span className="font-bold text-white uppercase">{route.category}: {route.from} → {route.to}</span>
                      <span className="font-black text-[#03B3C3]">{route.count} search(es)</span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-slate-500 py-4">No route analytics recorded yet.</p>
              )}
            </div>

            <div className="space-y-2">
              <h3 className="text-xs font-bold uppercase text-slate-400">Searches by Category</h3>
              {searchAnalytics.searchesByCategory && searchAnalytics.searchesByCategory.length > 0 ? (
                <div className="grid grid-cols-2 gap-3">
                  {searchAnalytics.searchesByCategory.map((cat, idx) => (
                    <div key={idx} className="p-3 bg-[#111111] rounded-xl border border-white/10 text-xs space-y-1">
                      <span className="text-[10px] uppercase font-bold text-[#03B3C3]">{cat._id}</span>
                      <p className="text-base font-black text-white">{cat.count} queries</p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-slate-500 py-4">No search activity recorded.</p>
              )}
            </div>
          </div>
        </GlassCard>
      )}

      {/* Recent Bookings Table */}
      <GlassCard hover={false} className="space-y-4 p-0 overflow-hidden">
        <div className="p-6 pb-2 border-b border-white/10">
          <h2 className="text-lg font-black text-white">Recent Transactions</h2>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-[#B5B5B5]">
            <thead className="bg-[#111111] uppercase text-[#777777] font-bold border-b border-white/10">
              <tr>
                <th className="p-4">Ref</th>
                <th className="p-4">Customer</th>
                <th className="p-4">Listing</th>
                <th className="p-4">Amount</th>
                <th className="p-4">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/10">
              {recentBookings.map((b) => (
                <tr key={b._id} className="hover:bg-white/5 transition-colors">
                  <td className="p-4 font-mono font-bold text-[#03B3C3]">{b.bookingReference}</td>
                  <td className="p-4">{b.user?.name} ({b.user?.email})</td>
                  <td className="p-4 font-bold text-white">{b.listing?.title}</td>
                  <td className="p-4 font-black text-white">₹{b.totalAmount}</td>
                  <td className="p-4">
                    <span className="px-2.5 py-1 bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 font-bold rounded-full uppercase text-[9px]">
                      {b.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </GlassCard>

      {/* QR Code Verification Modal */}
      <GlassModal
        isOpen={qrModalOpen}
        onClose={() => setQrModalOpen(false)}
        title="Verify Gate Ticket QR"
        maxWidth="max-w-md"
      >
        <form onSubmit={handleVerifyQR} className="space-y-4 text-xs">
          <input
            type="text"
            placeholder="Scan QR string or enter TH-REF code..."
            value={qrInput}
            onChange={(e) => setQrInput(e.target.value)}
            className="w-full p-3.5 bg-[#111111] border border-white/15 rounded-xl text-white focus:outline-none focus:border-[#03B3C3]"
          />
          <GlassButton type="submit" loading={verifying} className="w-full">
            Verify & Check-In Ticket
          </GlassButton>
        </form>

        {verificationResult && (
          <div className="mt-4 p-4 bg-emerald-500/10 rounded-2xl border border-emerald-500/30 text-xs space-y-2 text-left">
            <p className="font-bold text-emerald-400 flex items-center gap-1.5">
              <CheckCircle className="w-4 h-4 text-emerald-400" /> Ticket Status: VALID
            </p>
            <p className="text-[#B5B5B5]"><strong>Customer:</strong> {verificationResult.booking?.user?.name}</p>
            <p className="text-[#B5B5B5]"><strong>Listing:</strong> {verificationResult.booking?.listing?.title}</p>
            <p className="text-[#B5B5B5]"><strong>Ref:</strong> {verificationResult.booking?.bookingReference}</p>
          </div>
        )}
      </GlassModal>

    </div>
  );
}
