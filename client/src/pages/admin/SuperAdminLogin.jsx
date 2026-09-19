import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';
import { ShieldAlert, Lock, Mail, ArrowRight } from 'lucide-react';

export default function SuperAdminLogin() {
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

      if (user?.role !== 'superadmin') {
        toast.error('Access Denied: Super Admin privileges required.');
        setLoading(false);
        return;
      }

      toast.success(`Welcome back, ${user.name || 'Super Admin'}!`);
      navigate('/admin/super');
    } catch (err) {
      const msg = err.response?.data?.message || 'Invalid email or password.';
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 bg-slate-900 border border-purple-500/20 rounded-3xl p-8 shadow-2xl relative overflow-hidden">
        {/* Background Subtle Gradient Glow */}
        <div className="absolute -top-24 -right-24 w-48 h-48 bg-purple-600/20 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute -bottom-24 -left-24 w-48 h-48 bg-indigo-600/20 rounded-full blur-3xl pointer-events-none"></div>

        {/* Header */}
        <div className="text-center space-y-3">
          <div className="inline-flex p-3 bg-purple-500/10 text-purple-400 rounded-2xl border border-purple-500/20 mb-2">
            <ShieldAlert className="w-8 h-8" />
          </div>
          <h2 className="text-2xl font-black text-white tracking-tight">
            TicketHarbour Super Admin
          </h2>
          <p className="text-xs text-slate-400">
            Private Authentication Portal for Platform Governance
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleLogin} className="mt-8 space-y-5">
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                Super Admin Email
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 absolute left-3.5 top-3.5 text-slate-400" />
                <input
                  type="email"
                  required
                  placeholder="superadmin@ticketharbour.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-slate-800/80 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
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
                  className="w-full pl-10 pr-4 py-3 bg-slate-800/80 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                />
              </div>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-bold text-xs rounded-xl shadow-lg hover:shadow-purple-500/25 hover:from-purple-500 hover:to-indigo-500 transition-all flex items-center justify-center gap-2 group"
          >
            {loading ? (
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
            ) : (
              <>
                Authenticate Super Admin Access
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </>
            )}
          </button>
        </form>

        <div className="text-center pt-2">
          <span className="text-[11px] text-slate-500 font-mono">
            Authorized Personnel Only • IP Address Logged
          </span>
        </div>
      </div>
    </div>
  );
}
