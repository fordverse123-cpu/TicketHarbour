import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import API from '../../services/api';
import toast from 'react-hot-toast';
import { UserPlus, ArrowLeft, Lock, Mail, Phone, User, CheckCircle } from 'lucide-react';

export default function CreateAdmin() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const navigate = useNavigate();

  const handleCreateAdmin = async (e) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }

    if (password.length < 6) {
      toast.error('Password must be at least 6 characters long');
      return;
    }

    setSubmitting(true);
    try {
      const res = await API.post('/super-admin/admins', {
        name,
        email,
        phone,
        password,
      });

      if (res.data.success) {
        toast.success(`Admin account for ${name} created successfully!`);
        navigate('/admin/super');
      }
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to create Admin account.';
      toast.error(msg);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-8 pb-16">
      {/* Back Button */}
      <Link
        to="/admin/super"
        className="inline-flex items-center gap-2 text-xs font-bold text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" /> Back to Super Admin Dashboard
      </Link>

      {/* Main Form Container */}
      <div className="bg-white dark:bg-slate-800 rounded-3xl p-8 border border-slate-200 dark:border-slate-700 shadow-xl space-y-6">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-purple-100 dark:bg-purple-950 text-purple-600 rounded-2xl">
            <UserPlus className="w-7 h-7" />
          </div>
          <div>
            <h1 className="text-2xl font-black text-slate-900 dark:text-white">Create New Admin Account</h1>
            <p className="text-xs text-slate-500">
              Only Super Admin can provision new administrator credentials
            </p>
          </div>
        </div>

        <form onSubmit={handleCreateAdmin} className="space-y-4 text-xs">
          {/* Full Name */}
          <div className="space-y-1">
            <label className="font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
              Full Name *
            </label>
            <div className="relative">
              <User className="w-4 h-4 absolute left-3.5 top-3.5 text-slate-400" />
              <input
                type="text"
                required
                placeholder="e.g. John Doe"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl dark:text-white"
              />
            </div>
          </div>

          {/* Email & Phone */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                Email Address *
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 absolute left-3.5 top-3.5 text-slate-400" />
                <input
                  type="email"
                  required
                  placeholder="admin.john@ticketharbour.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl dark:text-white"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                Phone Number
              </label>
              <div className="relative">
                <Phone className="w-4 h-4 absolute left-3.5 top-3.5 text-slate-400" />
                <input
                  type="text"
                  placeholder="+91 9876543210"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl dark:text-white"
                />
              </div>
            </div>
          </div>

          {/* Password & Confirm Password */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                Password *
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 absolute left-3.5 top-3.5 text-slate-400" />
                <input
                  type="password"
                  required
                  placeholder="At least 6 characters..."
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl dark:text-white"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                Confirm Password *
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 absolute left-3.5 top-3.5 text-slate-400" />
                <input
                  type="password"
                  required
                  placeholder="Re-enter password..."
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl dark:text-white"
                />
              </div>
            </div>
          </div>

          <div className="p-4 bg-purple-50 dark:bg-purple-950/40 rounded-2xl border border-purple-200 dark:border-purple-800 text-[11px] text-purple-700 dark:text-purple-300 space-y-1">
            <p className="font-bold flex items-center gap-1.5">
              <CheckCircle className="w-3.5 h-3.5 text-purple-600" /> Security Guarantee:
            </p>
            <p>
              Account role will be forced to <strong>admin</strong> and status set to <strong>active</strong>. This account will be recorded as created by your Super Admin ID.
            </p>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={submitting}
            className="w-full py-4 bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-bold text-xs rounded-2xl shadow-lg hover:shadow-purple-500/20 transition-all flex items-center justify-center gap-2"
          >
            {submitting ? 'Creating Admin Account...' : 'Create Admin Account'}
          </button>
        </form>
      </div>
    </div>
  );
}
