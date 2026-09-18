import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import API from '../../services/api';
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

  if (loading) {
    return (
      <div className="flex justify-center items-center py-32">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-16">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-slate-900 dark:text-white">Admin Control Dashboard</h1>
          <p className="text-sm text-slate-500">System revenue, booking analytics, and ticket verification</p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => {
              setQrInput('');
              setVerificationResult(null);
              setQrModalOpen(true);
            }}
            className="px-4 py-2 bg-gradient-to-r from-teal-500 to-indigo-600 text-white font-bold text-xs rounded-xl shadow flex items-center gap-2"
          >
            <QrCode className="w-4 h-4" /> Verify / Scan Ticket QR
          </button>
          
          <Link
            to="/admin/listings"
            className="px-4 py-2 bg-slate-900 text-white font-bold text-xs rounded-xl flex items-center gap-2 hover:bg-slate-800"
          >
            <PlusCircle className="w-4 h-4" /> Manage Listings
          </Link>
        </div>
      </div>

      {/* Stats Counters */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-6 space-y-2 shadow-sm">
          <span className="text-xs text-slate-400 font-semibold uppercase">Total Platform Revenue</span>
          <p className="text-3xl font-black text-teal-600 dark:text-teal-400">₹{stats?.totalRevenue || 0}</p>
          <div className="flex items-center gap-1 text-xs text-emerald-500 font-bold">
            <TrendingUp className="w-3.5 h-3.5" /> +100% Verified Sales
          </div>
        </div>

        <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-6 space-y-2 shadow-sm">
          <span className="text-xs text-slate-400 font-semibold uppercase">Confirmed Bookings</span>
          <p className="text-3xl font-black text-indigo-600 dark:text-indigo-400">{stats?.confirmedBookings || 0}</p>
          <p className="text-xs text-slate-500">Out of {stats?.totalBookings || 0} total attempts</p>
        </div>

        <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-6 space-y-2 shadow-sm">
          <span className="text-xs text-slate-400 font-semibold uppercase">Registered Users</span>
          <p className="text-3xl font-black text-slate-900 dark:text-white">{stats?.totalUsers || 0}</p>
          <p className="text-xs text-slate-500">Active customer accounts</p>
        </div>

        <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-6 space-y-2 shadow-sm">
          <span className="text-xs text-slate-400 font-semibold uppercase">Active Listings</span>
          <p className="text-3xl font-black text-amber-500">{stats?.totalListings || 0}</p>
          <p className="text-xs text-slate-500">Across 7 ticket categories</p>
        </div>
      </div>

      {/* Category Revenue Breakdown */}
      <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-6 space-y-4">
        <h2 className="text-lg font-bold text-slate-900 dark:text-white">Category Sales Distribution</h2>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {categoryStats.map((cat) => (
            <div key={cat._id} className="p-4 bg-slate-50 dark:bg-slate-700 rounded-xl border border-slate-100 dark:border-slate-600 space-y-1">
              <span className="text-xs uppercase font-bold text-teal-600 dark:text-teal-400">{cat._id}</span>
              <p className="text-lg font-black text-slate-900 dark:text-white">₹{cat.revenue}</p>
              <p className="text-xs text-slate-400">{cat.count} ticket(s) sold</p>
            </div>
          ))}
        </div>
      </div>

      {/* Recent Bookings Table */}
      <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-6 space-y-4 overflow-hidden">
        <h2 className="text-lg font-bold text-slate-900 dark:text-white">Recent Transactions</h2>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-600 dark:text-slate-300">
            <thead className="bg-slate-50 dark:bg-slate-700 uppercase text-slate-400 font-bold border-b border-slate-100 dark:border-slate-600">
              <tr>
                <th className="p-3">Ref</th>
                <th className="p-3">Customer</th>
                <th className="p-3">Listing</th>
                <th className="p-3">Amount</th>
                <th className="p-3">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
              {recentBookings.map((b) => (
                <tr key={b._id} className="hover:bg-slate-50 dark:hover:bg-slate-700/50">
                  <td className="p-3 font-bold text-teal-600">{b.bookingReference}</td>
                  <td className="p-3">{b.user?.name} ({b.user?.email})</td>
                  <td className="p-3 font-semibold">{b.listing?.title}</td>
                  <td className="p-3 font-bold text-slate-900 dark:text-white">₹{b.totalAmount}</td>
                  <td className="p-3">
                    <span className="px-2.5 py-1 bg-emerald-100 text-emerald-700 font-bold rounded-full uppercase text-[10px]">
                      {b.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* QR Code Verification Modal */}
      {qrModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-800 rounded-3xl p-6 max-w-md w-full space-y-4 shadow-2xl relative">
            <button
              onClick={() => setQrModalOpen(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600"
            >
              ✕
            </button>

            <h3 className="font-bold text-lg text-slate-900 dark:text-white flex items-center gap-2">
              <QrCode className="w-5 h-5 text-teal-500" /> Verify Gate Ticket QR
            </h3>
            
            <form onSubmit={handleVerifyQR} className="space-y-3 text-xs">
              <input
                type="text"
                placeholder="Scan QR string or enter TH-REF code..."
                value={qrInput}
                onChange={(e) => setQrInput(e.target.value)}
                className="w-full p-3 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl dark:text-white"
              />
              <button
                type="submit"
                disabled={verifying}
                className="w-full py-2.5 bg-teal-600 text-white font-bold rounded-xl shadow hover:bg-teal-700"
              >
                {verifying ? 'Verifying...' : 'Verify & Check-In Ticket'}
              </button>
            </form>

            {verificationResult && (
              <div className="p-4 bg-teal-50 dark:bg-teal-950/60 rounded-2xl border border-teal-200 dark:border-teal-800 text-xs space-y-2 text-left">
                <p className="font-bold text-teal-800 dark:text-teal-300 flex items-center gap-1.5">
                  <CheckCircle className="w-4 h-4 text-teal-500" /> Ticket Status: VALID
                </p>
                <p><strong>Customer:</strong> {verificationResult.booking?.user?.name}</p>
                <p><strong>Listing:</strong> {verificationResult.booking?.listing?.title}</p>
                <p><strong>Ref:</strong> {verificationResult.booking?.bookingReference}</p>
              </div>
            )}
          </div>
        </div>
      )}

    </div>
  );
}
