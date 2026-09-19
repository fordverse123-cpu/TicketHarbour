import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';
import { Lock, Mail, ShieldCheck, ArrowRight } from 'lucide-react';

export default function AdminLogin() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await login(email, password);
      const user = res.user;

      if (user?.role !== 'admin' && user?.role !== 'superadmin') {
        toast.error('Access Denied: Admin privileges required.');
        setLoading(false);
        return;
      }

      toast.success(`Welcome back, ${user.name}!`);
      navigate('/admin');
    } catch (err) {
      const msg = err.response?.data?.message || 'Invalid email or password.';
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-3xl p-8 shadow-xl relative overflow-hidden">
        {/* Header */}
        <div className="text-center space-y-3">
          <div className="inline-flex p-3 bg-teal-50 dark:bg-teal-950/60 text-teal-600 rounded-2xl border border-teal-200 dark:border-teal-800 mb-2">
            <ShieldCheck className="w-8 h-8" />
          </div>
          <h2 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
            TicketHarbour Admin Portal
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Sign in to manage listings, bookings, and ticket verifications
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleLogin} className="mt-8 space-y-5">
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                Admin Email Address
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 absolute left-3.5 top-3.5 text-slate-400" />
                <input
                  type="email"
                  required
                  placeholder="admin@ticketharbour.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl text-xs dark:text-white focus:outline-none focus:ring-2 focus:ring-teal-500 transition-all"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 absolute left-3.5 top-3.5 text-slate-400" />
                <input
                  type="password"
                  required
                  placeholder="••••••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl text-xs dark:text-white focus:outline-none focus:ring-2 focus:ring-teal-500 transition-all"
                />
              </div>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs rounded-xl shadow-lg hover:shadow-teal-600/25 transition-all flex items-center justify-center gap-2 group"
          >
            {loading ? (
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
            ) : (
              <>
                Sign In to Admin Dashboard
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </>
            )}
          </button>
        </form>

        <div className="text-center pt-2">
          <span className="text-[11px] text-slate-400 font-mono">
            Admin Accounts are Created & Managed by Super Admin
          </span>
        </div>
      </div>
    </div>
  );
}
