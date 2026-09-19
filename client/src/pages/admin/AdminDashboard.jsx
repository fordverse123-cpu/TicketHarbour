import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import API from '../../services/api';
import GlassCard from '../../components/ui/GlassCard';
import GlassButton from '../../components/ui/GlassButton';
import GlassModal from '../../components/ui/GlassModal';
import Skeleton from '../../components/ui/Skeleton';
import toast from 'react-hot-toast';
import {
  TrendingUp,
  Ticket,
  Users,
  Film,
  QrCode,
  ShieldCheck,
  CheckCircle,
  PlusCircle,
} from 'lucide-react';

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [categoryStats, setCategoryStats] = useState([]);
  const [recentBookings, setRecentBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  // QR Scanner Modal
  const [qrModalOpen, setQrModalOpen] = useState(false);
  const [qrInput, setQrInput] = useState('');
  const [verifying, setVerifying] = useState(false);
  const [verificationResult, setVerificationResult] = useState(null);

  useEffect(() => {
    fetchAdminStats();
  }, []);

  const fetchAdminStats = async () => {
    setLoading(true);
    try {
      const res = await API.get('/admin/stats');
      if (res.data.success) {
        setStats(res.data.data.stats);
        setCategoryStats(res.data.data.categoryStats);
        setRecentBookings(res.data.data.recentBookings);
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

  return (
    <div className="space-y-8 pb-16">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-white tracking-tight">Admin Control Dashboard</h1>
          <p className="text-xs text-slate-400">System revenue, booking analytics, and ticket verification</p>
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
            Verify / Scan Ticket QR
          </GlassButton>
          
          <Link to="/admin/listings">
            <GlassButton variant="secondary" icon={PlusCircle}>
              Manage Listings
            </GlassButton>
          </Link>
        </div>
      </div>

      {/* Stats Counters */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <Skeleton className="h-32" count={4} />
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <GlassCard hover={false} className="space-y-2">
            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Total Platform Revenue</span>
            <p className="text-3xl font-black text-cyanAccent-400">₹{stats?.totalRevenue || 0}</p>
            <div className="flex items-center gap-1 text-xs text-emerald-400 font-bold">
              <TrendingUp className="w-3.5 h-3.5" /> +100% Verified Sales
            </div>
          </GlassCard>

          <GlassCard hover={false} className="space-y-2">
            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Confirmed Bookings</span>
            <p className="text-3xl font-black text-indigoAccent-400">{stats?.confirmedBookings || 0}</p>
            <p className="text-xs text-slate-400">Out of {stats?.totalBookings || 0} total attempts</p>
          </GlassCard>

          <GlassCard hover={false} className="space-y-2">
            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Registered Users</span>
            <p className="text-3xl font-black text-white">{stats?.totalUsers || 0}</p>
            <p className="text-xs text-slate-400">Active customer accounts</p>
          </GlassCard>

          <GlassCard hover={false} className="space-y-2">
            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Active Listings</span>
            <p className="text-3xl font-black text-amber-400">{stats?.totalListings || 0}</p>
            <p className="text-xs text-slate-400">Across 7 ticket categories</p>
          </GlassCard>
        </div>
      )}

      {/* Category Revenue Breakdown */}
      <GlassCard hover={false} className="space-y-4">
        <h2 className="text-lg font-black text-white">Category Sales Distribution</h2>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {categoryStats.map((cat) => (
            <div key={cat._id} className="p-4 bg-harbour-darker/80 rounded-2xl border border-white/10 space-y-1">
              <span className="text-[10px] uppercase font-bold text-cyanAccent-400">{cat._id}</span>
              <p className="text-lg font-black text-white">₹{cat.revenue}</p>
              <p className="text-xs text-slate-400">{cat.count} ticket(s) sold</p>
            </div>
          ))}
        </div>
      </GlassCard>

      {/* Recent Bookings Table */}
      <GlassCard hover={false} className="space-y-4 p-0 overflow-hidden">
        <div className="p-6 pb-2 border-b border-white/10">
          <h2 className="text-lg font-black text-white">Recent Transactions</h2>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-harbour-darker/80 uppercase text-slate-400 font-bold border-b border-white/10">
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
                  <td className="p-4 font-mono font-bold text-cyanAccent-400">{b.bookingReference}</td>
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
            className="w-full p-3.5 bg-harbour-darker border border-white/15 rounded-xl text-white focus:outline-none focus:border-cyanAccent-500"
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
            <p className="text-slate-300"><strong>Customer:</strong> {verificationResult.booking?.user?.name}</p>
            <p className="text-slate-300"><strong>Listing:</strong> {verificationResult.booking?.listing?.title}</p>
            <p className="text-slate-300"><strong>Ref:</strong> {verificationResult.booking?.bookingReference}</p>
          </div>
        )}
      </GlassModal>

    </div>
  );
}

