import React, { useState } from 'react';
import API from '../services/api';
import toast from 'react-hot-toast';
import { Mail, Send } from 'lucide-react';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await API.post('/auth/forgot-password', { email });
      toast.success(res.data.message);
      setSubmitted(true);
    } catch (err) {
      toast.error('Failed to request password reset link.');
    }
  };

  return (
    <div className="max-w-md mx-auto py-12">
      <div className="bg-white dark:bg-slate-800 rounded-3xl border border-slate-200 dark:border-slate-700 p-8 shadow-xl space-y-6">
        <h1 className="text-2xl font-black text-slate-900 dark:text-white text-center">Forgot Password</h1>
        
        {submitted ? (
          <p className="text-xs text-center text-teal-600 dark:text-teal-400 font-medium">
            If an account exists with email <strong>{email}</strong>, a password reset link has been dispatched to your inbox.
          </p>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4 text-xs">
            <div className="space-y-1">
              <label className="font-semibold text-slate-600 dark:text-slate-300">Enter your email</label>
              <div className="relative">
                <input
                  type="email"
                  required
                  placeholder="name@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-9 pr-3 py-2.5 bg-slate-50 dark:bg-slate-750 border border-slate-200 dark:border-slate-700 rounded-xl dark:text-white"
                />
                <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-3 bg-teal-600 text-white font-bold rounded-xl shadow hover:bg-teal-700 transition-colors flex items-center justify-center gap-2 text-sm"
            >
              <Send className="w-4 h-4" /> Send Reset Link
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
