import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import API from '../services/api';
import toast from 'react-hot-toast';

export default function ResetPassword() {
  const { resetToken } = useParams();
  const navigate = useNavigate();
  const [password, setPassword] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await API.post(`/auth/reset-password/${resetToken}`, { password });
      if (res.data.success) {
        toast.success('Password reset successful! You are now logged in.');
        navigate('/');
      }
    } catch (err) {
      toast.error('Token expired or invalid.');
    }
  };

  return (
    <div className="max-w-md mx-auto py-12">
      <div className="bg-white dark:bg-slate-800 rounded-3xl border border-slate-200 dark:border-slate-700 p-8 shadow-xl space-y-6">
        <h1 className="text-2xl font-black text-slate-900 dark:text-white text-center">Reset Password</h1>
        
        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div className="space-y-1">
            <label className="font-semibold text-slate-600 dark:text-slate-300">Enter new password</label>
            <input
              type="password"
              required
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full p-3 bg-slate-50 dark:bg-slate-750 border border-slate-200 dark:border-slate-700 rounded-xl dark:text-white"
            />
          </div>

          <button
            type="submit"
            className="w-full py-3 bg-teal-600 text-white font-bold rounded-xl shadow hover:bg-teal-700 transition-colors text-sm"
          >
            Reset Password
          </button>
        </form>
      </div>
    </div>
  );
}
