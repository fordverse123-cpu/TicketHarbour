import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import API from '../services/api';
import toast from 'react-hot-toast';
import { User, Lock, Mail, Phone, ShieldCheck } from 'lucide-react';

export default function Profile() {
  const { user, updateProfile } = useAuth();

  const [name, setName] = useState(user?.name || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [updatingProfile, setUpdatingProfile] = useState(false);

  // Password state
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [updatingPassword, setUpdatingPassword] = useState(false);

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    setUpdatingProfile(true);
    await updateProfile({ name, phone });
    setUpdatingProfile(false);
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    if (!currentPassword || !newPassword) {
      toast.error('Please enter current and new password');
      return;
    }
    setUpdatingPassword(true);
    try {
      const res = await API.put('/users/change-password', { currentPassword, newPassword });
      if (res.data.success) {
        toast.success('Password changed successfully!');
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

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-16">
      <div>
        <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white">Profile Settings</h1>
        <p className="text-sm text-slate-500 dark:text-slate-400">Manage your personal account details and security settings</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        
        {/* Personal Info Form */}
        <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-6 space-y-4">
          <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <User className="w-5 h-5 text-teal-500" /> Account Details
          </h2>

          <form onSubmit={handleProfileSubmit} className="space-y-4 text-xs">
            <div className="space-y-1">
              <label className="font-semibold text-slate-600 dark:text-slate-300">Full Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full p-2.5 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl dark:text-white"
              />
            </div>

            <div className="space-y-1">
              <label className="font-semibold text-slate-600 dark:text-slate-300">Email Address (Read only)</label>
              <input
                type="email"
                disabled
                value={user?.email || ''}
                className="w-full p-2.5 bg-slate-100 dark:bg-slate-700/80 border border-slate-200 dark:border-slate-600 rounded-xl text-slate-500 dark:text-slate-300"
              />
            </div>

            <div className="space-y-1">
              <label className="font-semibold text-slate-600 dark:text-slate-300">Phone Number</label>
              <input
                type="text"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+1 800 000 0000"
                className="w-full p-2.5 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl dark:text-white"
              />
            </div>

            <button
              type="submit"
              disabled={updatingProfile}
              className="w-full py-2.5 bg-teal-600 text-white font-bold rounded-xl shadow hover:bg-teal-700 transition-colors"
            >
              {updatingProfile ? 'Saving...' : 'Save Changes'}
            </button>
          </form>
        </div>

        {/* Change Password Form */}
        <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-6 space-y-4">
          <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Lock className="w-5 h-5 text-indigo-500" /> Change Password
          </h2>

          <form onSubmit={handlePasswordSubmit} className="space-y-4 text-xs">
            <div className="space-y-1">
              <label className="font-semibold text-slate-600 dark:text-slate-300">Current Password</label>
              <input
                type="password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                className="w-full p-2.5 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl dark:text-white"
              />
            </div>

            <div className="space-y-1">
              <label className="font-semibold text-slate-600 dark:text-slate-300">New Password (min 6 chars)</label>
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="w-full p-2.5 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl dark:text-white"
              />
            </div>

            <button
              type="submit"
              disabled={updatingPassword}
              className="w-full py-2.5 bg-indigo-600 text-white font-bold rounded-xl shadow hover:bg-indigo-700 transition-colors"
            >
              {updatingPassword ? 'Updating...' : 'Update Password'}
            </button>
          </form>
        </div>

      </div>
    </div>
  );
}
