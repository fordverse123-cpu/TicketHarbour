import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import API from '../../services/api';
import toast from 'react-hot-toast';
import GlassCard from '../../components/ui/GlassCard';
import GlassButton from '../../components/ui/GlassButton';
import GlassModal from '../../components/ui/GlassModal';
import Skeleton from '../../components/ui/Skeleton';
import {
  DollarSign,
  TrendingUp,
  Ticket,
  ShoppingBag,
  Download,
  Calendar,
  Filter,
  Search,
  ArrowLeft,
  PieChart,
  Clock,
  RefreshCw,
  Eye,
  CheckCircle,
  XCircle,
  AlertCircle,
  Percent,
} from 'lucide-react';

export default function AdminRevenuePage() {
  const [summary, setSummary] = useState(null);
  const [itemBreakdown, setItemBreakdown] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Filters
  const [timeframe, setTimeframe] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // Modal State for Single Item Revenue Details
  const [itemModalOpen, setItemModalOpen] = useState(false);
  const [selectedItemDetails, setSelectedItemDetails] = useState(null);
  const [loadingItemDetails, setLoadingItemDetails] = useState(false);

  useEffect(() => {
    fetchRevenueData();
  }, [timeframe, statusFilter, searchQuery, selectedCategory, page]);

  const fetchRevenueData = async () => {
    if (!refreshing) setLoading(true);
    try {
      const queryParams = new URLSearchParams();
      if (timeframe !== 'all') queryParams.append('timeframe', timeframe);
      if (statusFilter !== 'all') queryParams.append('status', statusFilter);
      if (searchQuery.trim()) queryParams.append('search', searchQuery.trim());
      queryParams.append('page', page);
      queryParams.append('limit', 10);

      const [summaryRes, itemsRes, txRes] = await Promise.all([
        API.get(`/admin/revenue/summary?${queryParams.toString()}`),
        API.get('/admin/revenue/items'),
        API.get(`/admin/revenue/transactions?${queryParams.toString()}`),
      ]);

      if (summaryRes.data?.success) {
        setSummary(summaryRes.data.data.summary);
      }
      if (itemsRes.data?.success) {
        setItemBreakdown(itemsRes.data.data.items || []);
      }
      if (txRes.data?.success) {
        setTransactions(txRes.data.data.transactions || []);
        setTotalPages(txRes.data.meta?.totalPages || 1);
      }
    } catch (err) {
      toast.error('Failed to load revenue data.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleManualRefresh = () => {
    setRefreshing(true);
    fetchRevenueData();
  };

  const handleExportCSV = async () => {
    try {
      const response = await API.get('/admin/revenue/export', { responseType: 'blob' });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `Admin_Revenue_${Date.now()}.csv`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      toast.success('Revenue report exported to CSV successfully!');
    } catch (err) {
      toast.error('Failed to export CSV report.');
    }
  };

  const handleViewItemDetails = async (itemId) => {
    setItemModalOpen(true);
    setLoadingItemDetails(true);
    try {
      const res = await API.get(`/admin/revenue/items/${itemId}`);
      if (res.data?.success) {
        setSelectedItemDetails(res.data.data);
      }
    } catch (err) {
      toast.error('Could not retrieve item details.');
      setItemModalOpen(false);
    } finally {
      setLoadingItemDetails(false);
    }
  };

  const filteredItems = itemBreakdown.filter((item) => {
    const matchesCategory = selectedCategory === 'all' || item.categoryType?.toLowerCase() === selectedCategory.toLowerCase();
    const matchesSearch = !searchQuery || item.title?.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="max-w-7xl mx-auto space-y-8 pb-16">
      
      {/* Top Breadcrumb & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <Link
            to="/admin"
            className="inline-flex items-center gap-1.5 text-xs font-bold text-[#A0A0A0] hover:text-white mb-2 transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" /> Back to Admin Control Dashboard
          </Link>
          <h1 className="text-3xl font-black text-white tracking-tight flex items-center gap-2.5">
            <DollarSign className="w-8 h-8 text-[#03B3C3]" /> Revenue & Financial Analytics
          </h1>
          <p className="text-xs text-[#B5B5B5]">
            Isolated per-admin revenue tracking, item sales breakdown, platform fee calculations & transaction audit log.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <GlassButton
            onClick={handleManualRefresh}
            variant="secondary"
            icon={RefreshCw}
            loading={refreshing}
          >
            Refresh Data
          </GlassButton>

          <GlassButton
            onClick={handleExportCSV}
            variant="gradient"
            icon={Download}
          >
            Export CSV Report
          </GlassButton>
        </div>
      </div>

      {/* Date Range Quick Selector Pills */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
        <span className="text-xs font-bold uppercase text-[#777777] pr-2 flex items-center gap-1">
          <Calendar className="w-3.5 h-3.5" /> Timeframe:
        </span>
        {[
          { key: 'all', label: 'All Time' },
          { key: 'today', label: 'Today' },
          { key: 'week', label: 'This Week' },
          { key: 'month', label: 'This Month' },
        ].map((tf) => (
          <button
            key={tf.key}
            onClick={() => {
              setTimeframe(tf.key);
              setPage(1);
            }}
            className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all ${
              timeframe === tf.key
                ? 'bg-[#03B3C3] text-black shadow-lg font-black'
                : 'bg-white/5 text-[#A0A0A0] hover:bg-white/10 hover:text-white border border-white/10'
            }`}
          >
            {tf.label}
          </button>
        ))}

        {summary?.configuredPlatformFeePercent && (
          <div className="ml-auto flex items-center gap-1.5 px-3 py-1 bg-[#6750A2]/20 border border-[#6750A2]/40 rounded-full text-xs font-bold text-[#03B3C3]">
            <Percent className="w-3.5 h-3.5" /> Platform Fee: {summary.configuredPlatformFeePercent}%
          </div>
        )}
      </div>

      {/* Executive Summary Cards */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <Skeleton className="h-32" count={4} />
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <GlassCard hover={false} className="space-y-2 border-l-4 border-l-[#03B3C3]">
            <span className="text-[10px] text-[#A0A0A0] font-bold uppercase tracking-wider flex items-center gap-1">
              <TrendingUp className="w-3.5 h-3.5 text-[#03B3C3]" /> Net Admin Revenue
            </span>
            <p className="text-3xl font-black text-[#03B3C3]">₹{summary?.totalAdminRevenue?.toLocaleString() || 0}</p>
            <p className="text-xs text-[#777777]">
              Credited directly to your account
            </p>
          </GlassCard>

          <GlassCard hover={false} className="space-y-2 border-l-4 border-l-emerald-400">
            <span className="text-[10px] text-[#A0A0A0] font-bold uppercase tracking-wider flex items-center gap-1">
              <DollarSign className="w-3.5 h-3.5 text-emerald-400" /> Gross Customer Sales
            </span>
            <p className="text-3xl font-black text-white">₹{summary?.totalGrossRevenue?.toLocaleString() || 0}</p>
            <p className="text-xs text-[#777777]">
              Platform Fee ({summary?.configuredPlatformFeePercent}%): ₹{summary?.totalPlatformFees?.toLocaleString() || 0}
            </p>
          </GlassCard>

          <GlassCard hover={false} className="space-y-2 border-l-4 border-l-[#6750A2]">
            <span className="text-[10px] text-[#A0A0A0] font-bold uppercase tracking-wider flex items-center gap-1">
              <Ticket className="w-3.5 h-3.5 text-[#6750A2]" /> Tickets Sold
            </span>
            <p className="text-3xl font-black text-[#6750A2]">{summary?.totalTicketsSold || 0}</p>
            <p className="text-xs text-[#777777]">Across {summary?.totalOrders || 0} completed order(s)</p>
          </GlassCard>

          <GlassCard hover={false} className="space-y-2 border-l-4 border-l-amber-400">
            <span className="text-[10px] text-[#A0A0A0] font-bold uppercase tracking-wider flex items-center gap-1">
              <Clock className="w-3.5 h-3.5 text-amber-400" /> Pending & Refunded
            </span>
            <div className="flex items-baseline gap-3">
              <p className="text-xl font-black text-amber-400">{summary?.pendingPaymentsCount || 0} Pending</p>
              <p className="text-xs font-bold text-rose-400">{summary?.refundedCount || 0} Refunded</p>
            </div>
            <p className="text-xs text-[#777777]">
              Pending Gross: ₹{summary?.pendingPaymentsAmount?.toLocaleString() || 0}
            </p>
          </GlassCard>
        </div>
      )}

      {/* Revenue Breakdown by Item/Event Table */}
      <GlassCard hover={false} className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/10 pb-4">
          <div>
            <h2 className="text-xl font-black text-white flex items-center gap-2">
              <PieChart className="w-5 h-5 text-[#03B3C3]" /> Revenue Breakdown by Created Item
            </h2>
            <p className="text-xs text-[#B5B5B5]">
              Performance breakdown of all Movie, Event, Sports, Transit, or Attraction listings created by you.
            </p>
          </div>

          {/* Category Filter */}
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-[#A0A0A0]" />
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="bg-[#111111] text-xs font-bold text-white border border-white/15 rounded-xl px-3 py-2 focus:outline-none focus:border-[#03B3C3]"
            >
              <option value="all">All Categories</option>
              <option value="movie">Movies</option>
              <option value="event">Events</option>
              <option value="sports">Sports</option>
              <option value="bus">Bus</option>
              <option value="train">Train</option>
              <option value="flight">Flights</option>
              <option value="attraction">Attractions</option>
            </select>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-[#B5B5B5]">
            <thead className="bg-[#111111] uppercase text-[#777777] font-bold border-b border-white/10">
              <tr>
                <th className="p-3.5">Item / Listing</th>
                <th className="p-3.5">Category</th>
                <th className="p-3.5 text-right">Tickets Sold</th>
                <th className="p-3.5 text-right">Gross Revenue</th>
                <th className="p-3.5 text-right">Platform Fee</th>
                <th className="p-3.5 text-right">Net Admin Revenue</th>
                <th className="p-3.5 text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/10">
              {filteredItems.length > 0 ? (
                filteredItems.map((item) => (
                  <tr key={item._id} className="hover:bg-white/5 transition-colors">
                    <td className="p-3.5 font-bold text-white flex items-center gap-3">
                      {item.images?.[0] ? (
                        <img
                          src={item.images[0]}
                          alt={item.title}
                          className="w-9 h-9 object-cover rounded-lg border border-white/10"
                        />
                      ) : (
                        <div className="w-9 h-9 bg-white/5 rounded-lg flex items-center justify-center font-black text-white/40">
                          TH
                        </div>
                      )}
                      <div>
                        <p className="font-bold text-white">{item.title}</p>
                        <p className="text-[10px] text-[#777777]">{item.location?.city || 'Global'}</p>
                      </div>
                    </td>

                    <td className="p-3.5 uppercase font-bold text-[#03B3C3]">
                      <span className="px-2.5 py-1 bg-[#03B3C3]/10 border border-[#03B3C3]/20 rounded-full text-[10px]">
                        {item.categoryType}
                      </span>
                    </td>

                    <td className="p-3.5 text-right font-mono font-bold text-white">
                      {item.ticketsSold} ticket(s)
                    </td>

                    <td className="p-3.5 text-right font-mono font-bold text-white">
                      ₹{item.grossRevenue.toLocaleString()}
                    </td>

                    <td className="p-3.5 text-right font-mono text-slate-400">
                      ₹{item.platformFee.toLocaleString()}
                    </td>

                    <td className="p-3.5 text-right font-mono font-black text-[#03B3C3]">
                      ₹{item.adminRevenue.toLocaleString()}
                    </td>

                    <td className="p-3.5 text-center">
                      <button
                        onClick={() => handleViewItemDetails(item._id)}
                        className="inline-flex items-center gap-1 px-3 py-1 bg-white/5 hover:bg-[#03B3C3]/20 text-[#03B3C3] border border-white/10 rounded-lg text-xs font-bold transition-all cursor-pointer"
                      >
                        <Eye className="w-3.5 h-3.5" /> Details
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="7" className="p-8 text-center text-xs text-slate-500">
                    No items found matching the selected filter.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </GlassCard>

      {/* Audit Log Transactions Table */}
      <GlassCard hover={false} className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/10 pb-4">
          <div>
            <h2 className="text-xl font-black text-white flex items-center gap-2">
              <ShoppingBag className="w-5 h-5 text-[#6750A2]" /> Transaction Audit Log
            </h2>
            <p className="text-xs text-[#B5B5B5]">
              Real-time ledger of completed, pending, and refunded customer ticket purchases for your items.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {/* Search Box */}
            <div className="relative">
              <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Search reference or item..."
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setPage(1);
                }}
                className="pl-8 pr-3 py-1.5 bg-[#111111] border border-white/15 rounded-xl text-xs text-white focus:outline-none focus:border-[#03B3C3]"
              />
            </div>

            {/* Status Filter */}
            <select
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                setPage(1);
              }}
              className="bg-[#111111] text-xs font-bold text-white border border-white/15 rounded-xl px-3 py-1.5 focus:outline-none focus:border-[#03B3C3]"
            >
              <option value="all">All Statuses</option>
              <option value="paid">Paid</option>
              <option value="pending">Pending</option>
              <option value="refunded">Refunded</option>
              <option value="failed">Failed</option>
            </select>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-[#B5B5B5]">
            <thead className="bg-[#111111] uppercase text-[#777777] font-bold border-b border-white/10">
              <tr>
                <th className="p-3.5">Ref Code</th>
                <th className="p-3.5">Customer</th>
                <th className="p-3.5">Item Purchased</th>
                <th className="p-3.5 text-center">Qty</th>
                <th className="p-3.5 text-right">Gross Total</th>
                <th className="p-3.5 text-right">Fee ({summary?.configuredPlatformFeePercent}%)</th>
                <th className="p-3.5 text-right">Your Revenue</th>
                <th className="p-3.5 text-center">Status</th>
                <th className="p-3.5">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/10">
              {transactions.length > 0 ? (
                transactions.map((tx) => (
                  <tr key={tx._id} className="hover:bg-white/5 transition-colors">
                    <td className="p-3.5 font-mono font-bold text-[#03B3C3]">
                      {tx.bookingReference}
                    </td>

                    <td className="p-3.5">
                      <p className="font-bold text-white">{tx.user?.name || 'Customer'}</p>
                      <p className="text-[10px] text-slate-500">{tx.user?.email}</p>
                    </td>

                    <td className="p-3.5 font-bold text-white">
                      {tx.itemName}
                    </td>

                    <td className="p-3.5 text-center font-mono font-bold">
                      {tx.quantity}
                    </td>

                    <td className="p-3.5 text-right font-mono font-bold text-white">
                      ₹{tx.grossRevenue}
                    </td>

                    <td className="p-3.5 text-right font-mono text-slate-400">
                      ₹{tx.platformFee}
                    </td>

                    <td className="p-3.5 text-right font-mono font-black text-[#03B3C3]">
                      ₹{tx.adminRevenue}
                    </td>

                    <td className="p-3.5 text-center">
                      <span
                        className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase border ${
                          tx.status === 'paid'
                            ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30'
                            : tx.status === 'refunded'
                            ? 'bg-rose-500/20 text-rose-400 border-rose-500/30'
                            : tx.status === 'pending'
                            ? 'bg-amber-500/20 text-amber-400 border-amber-500/30'
                            : 'bg-slate-500/20 text-slate-400 border-slate-500/30'
                        }`}
                      >
                        {tx.status === 'paid' && <CheckCircle className="w-3 h-3" />}
                        {tx.status === 'refunded' && <XCircle className="w-3 h-3" />}
                        {tx.status === 'pending' && <AlertCircle className="w-3 h-3" />}
                        {tx.status}
                      </span>
                    </td>

                    <td className="p-3.5 text-slate-400 text-[10px]">
                      {new Date(tx.createdAt).toLocaleDateString()} {new Date(tx.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="9" className="p-8 text-center text-xs text-slate-500">
                    No transaction audit logs found matching your criteria.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Controls */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between pt-4 border-t border-white/10 text-xs">
            <span className="text-slate-400 font-bold">
              Page {page} of {totalPages}
            </span>

            <div className="flex items-center gap-2">
              <button
                disabled={page <= 1}
                onClick={() => setPage(page - 1)}
                className="px-3 py-1.5 bg-white/5 border border-white/10 rounded-lg text-white disabled:opacity-30 disabled:cursor-not-allowed hover:bg-white/10 transition-all font-bold"
              >
                Previous
              </button>

              <button
                disabled={page >= totalPages}
                onClick={() => setPage(page + 1)}
                className="px-3 py-1.5 bg-white/5 border border-white/10 rounded-lg text-white disabled:opacity-30 disabled:cursor-not-allowed hover:bg-white/10 transition-all font-bold"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </GlassCard>

      {/* Single Item Detailed Modal */}
      <GlassModal
        isOpen={itemModalOpen}
        onClose={() => setItemModalOpen(false)}
        title={selectedItemDetails?.item?.title || 'Item Revenue Audit Details'}
        maxWidth="max-w-2xl"
      >
        {loadingItemDetails ? (
          <Skeleton className="h-48" count={1} />
        ) : selectedItemDetails ? (
          <div className="space-y-6 text-xs text-left">
            {/* Quick Metrics */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-4 bg-[#111111] rounded-2xl border border-white/10">
              <div>
                <span className="text-[10px] text-[#A0A0A0] font-bold uppercase">Tickets Sold</span>
                <p className="text-lg font-black text-white">{selectedItemDetails.metrics?.ticketsSold || 0}</p>
              </div>

              <div>
                <span className="text-[10px] text-[#A0A0A0] font-bold uppercase">Gross Revenue</span>
                <p className="text-lg font-black text-white">₹{selectedItemDetails.metrics?.grossRevenue || 0}</p>
              </div>

              <div>
                <span className="text-[10px] text-[#A0A0A0] font-bold uppercase">Platform Fee</span>
                <p className="text-lg font-bold text-slate-400">₹{selectedItemDetails.metrics?.platformFee || 0}</p>
              </div>

              <div>
                <span className="text-[10px] text-[#A0A0A0] font-bold uppercase">Net Admin Revenue</span>
                <p className="text-lg font-black text-[#03B3C3]">₹{selectedItemDetails.metrics?.adminRevenue || 0}</p>
              </div>
            </div>

            {/* Transactions for this item */}
            <div className="space-y-3">
              <h3 className="font-bold text-white uppercase text-xs">Item Transactions List</h3>
              <div className="max-h-60 overflow-y-auto space-y-2 pr-1 scrollbar-none">
                {selectedItemDetails.transactions?.map((t) => (
                  <div key={t._id} className="p-3 bg-white/5 rounded-xl border border-white/10 flex items-center justify-between text-xs">
                    <div>
                      <p className="font-bold text-white font-mono">{t.bookingReference}</p>
                      <p className="text-[10px] text-slate-400">{t.user?.name} ({t.user?.email})</p>
                    </div>

                    <div className="text-right">
                      <p className="font-black text-[#03B3C3]">₹{t.adminRevenue} <span className="text-[10px] text-slate-400">(Gross ₹{t.grossRevenue})</span></p>
                      <span className="text-[9px] uppercase font-bold text-emerald-400">{t.status}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ) : null}
      </GlassModal>

    </div>
  );
}
