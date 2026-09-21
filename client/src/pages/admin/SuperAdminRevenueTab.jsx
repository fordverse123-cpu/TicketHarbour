import React, { useState, useEffect } from 'react';
import API from '../../services/api';
import toast from 'react-hot-toast';
import GlassCard from '../../components/ui/GlassCard';
import Skeleton from '../../components/ui/Skeleton';
import {
  DollarSign,
  TrendingUp,
  Users,
  Percent,
  ShieldCheck,
  ShoppingBag,
  RefreshCw,
  Building,
} from 'lucide-react';

export default function SuperAdminRevenueTab() {
  const [globalStats, setGlobalStats] = useState(null);
  const [breakdown, setBreakdown] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchGlobalRevenue();
  }, []);

  const fetchGlobalRevenue = async () => {
    setLoading(true);
    try {
      const [summaryRes, breakdownRes] = await Promise.all([
        API.get('/super-admin/revenue/summary'),
        API.get('/super-admin/revenue/breakdown'),
      ]);

      if (summaryRes.data?.success) {
        setGlobalStats(summaryRes.data.data.global);
      }

      if (breakdownRes.data?.success) {
        setBreakdown(breakdownRes.data.data.breakdown || []);
      }
    } catch (err) {
      toast.error('Failed to load global revenue breakdown.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* Overview Cards */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <Skeleton className="h-32" count={4} />
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <GlassCard hover={false} className="space-y-2 border-l-4 border-l-[#03B3C3]">
            <span className="text-[10px] text-[#A0A0A0] font-bold uppercase tracking-wider flex items-center gap-1">
              <DollarSign className="w-3.5 h-3.5 text-[#03B3C3]" /> Total Platform Gross
            </span>
            <p className="text-3xl font-black text-white">₹{globalStats?.totalGrossRevenue?.toLocaleString() || 0}</p>
            <p className="text-xs text-[#777777]">Combined GMV across all listings</p>
          </GlassCard>

          <GlassCard hover={false} className="space-y-2 border-l-4 border-l-emerald-400">
            <span className="text-[10px] text-[#A0A0A0] font-bold uppercase tracking-wider flex items-center gap-1">
              <Percent className="w-3.5 h-3.5 text-emerald-400" /> Platform Fee Earnings
            </span>
            <p className="text-3xl font-black text-emerald-400">₹{globalStats?.totalPlatformFees?.toLocaleString() || 0}</p>
            <p className="text-xs text-[#777777]">Configured Rate: {globalStats?.configuredPlatformFeePercent}%</p>
          </GlassCard>

          <GlassCard hover={false} className="space-y-2 border-l-4 border-l-[#6750A2]">
            <span className="text-[10px] text-[#A0A0A0] font-bold uppercase tracking-wider flex items-center gap-1">
              <TrendingUp className="w-3.5 h-3.5 text-[#6750A2]" /> Total Admin Payouts
            </span>
            <p className="text-3xl font-black text-[#03B3C3]">₹{globalStats?.totalAdminRevenue?.toLocaleString() || 0}</p>
            <p className="text-xs text-[#777777]">Net earnings distributed to admins</p>
          </GlassCard>

          <GlassCard hover={false} className="space-y-2 border-l-4 border-l-amber-400">
            <span className="text-[10px] text-[#A0A0A0] font-bold uppercase tracking-wider flex items-center gap-1">
              <ShoppingBag className="w-3.5 h-3.5 text-amber-400" /> Tickets & Orders
            </span>
            <p className="text-3xl font-black text-white">{globalStats?.totalTicketsSold || 0} Tickets</p>
            <p className="text-xs text-[#777777]">Out of {globalStats?.totalPaidTransactions || 0} paid transaction(s)</p>
          </GlassCard>
        </div>
      )}

      {/* Per-Admin Revenue Breakdown Table */}
      <GlassCard hover={false} className="space-y-6">
        <div className="flex items-center justify-between border-b border-white/10 pb-4">
          <div>
            <h2 className="text-xl font-black text-white flex items-center gap-2">
              <Users className="w-5 h-5 text-[#03B3C3]" /> Admin-Wise Revenue Breakdown
            </h2>
            <p className="text-xs text-[#B5B5B5]">
              Real-time audit table showing individual admin created item counts, tickets sold, gross revenue, platform fees, and net admin revenue.
            </p>
          </div>

          <button
            onClick={fetchGlobalRevenue}
            className="p-2 bg-white/5 hover:bg-white/10 rounded-xl text-xs font-bold text-white transition-all flex items-center gap-1.5 cursor-pointer"
          >
            <RefreshCw className="w-3.5 h-3.5" /> Refresh
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-[#B5B5B5]">
            <thead className="bg-[#111111] uppercase text-[#777777] font-bold border-b border-white/10">
              <tr>
                <th className="p-3.5">Administrator</th>
                <th className="p-3.5">Role</th>
                <th className="p-3.5 text-center">Items Owned</th>
                <th className="p-3.5 text-right">Tickets Sold</th>
                <th className="p-3.5 text-right">Gross Sales</th>
                <th className="p-3.5 text-right">Platform Fee ({globalStats?.configuredPlatformFeePercent}%)</th>
                <th className="p-3.5 text-right">Net Admin Revenue</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/10">
              {breakdown.length > 0 ? (
                breakdown.map((admin) => (
                  <tr key={admin._id} className="hover:bg-white/5 transition-colors">
                    <td className="p-3.5">
                      <p className="font-bold text-white">{admin.name}</p>
                      <p className="text-[10px] text-slate-500">{admin.email}</p>
                    </td>

                    <td className="p-3.5 font-bold uppercase text-[10px]">
                      <span className={`px-2.5 py-1 rounded-full border ${
                        admin.role?.toUpperCase().includes('SUPER')
                          ? 'bg-[#03B3C3]/15 text-[#03B3C3] border-[#03B3C3]/30'
                          : 'bg-[#6750A2]/15 text-[#6750A2] border-[#6750A2]/30'
                      }`}>
                        {admin.role}
                      </span>
                    </td>

                    <td className="p-3.5 text-center font-mono font-bold text-white">
                      {admin.itemsCount} item(s)
                    </td>

                    <td className="p-3.5 text-right font-mono font-bold text-white">
                      {admin.ticketsSold}
                    </td>

                    <td className="p-3.5 text-right font-mono font-bold text-white">
                      ₹{admin.grossRevenue.toLocaleString()}
                    </td>

                    <td className="p-3.5 text-right font-mono text-emerald-400 font-bold">
                      ₹{admin.platformFees.toLocaleString()}
                    </td>

                    <td className="p-3.5 text-right font-mono font-black text-[#03B3C3]">
                      ₹{admin.adminRevenue.toLocaleString()}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="7" className="p-8 text-center text-xs text-slate-500">
                    No admin accounts found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </GlassCard>
    </div>
  );
}
