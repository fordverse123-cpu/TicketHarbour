import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import API from '../services/api';
import { CheckCircle2, XCircle } from 'lucide-react';

export default function VerifyEmail() {
  const { verifyToken } = useParams();
  const [status, setStatus] = useState('verifying');

  useEffect(() => {
    verify();
  }, [verifyToken]);

  const verify = async () => {
    try {
      const res = await API.get(`/auth/verify-email/${verifyToken}`);
      if (res.data.success) {
        setStatus('success');
      }
    } catch (err) {
      setStatus('error');
    }
  };

  return (
    <div className="max-w-md mx-auto py-20 text-center space-y-6">
      {status === 'verifying' && (
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600 mx-auto" />
      )}

      {status === 'success' && (
        <div className="bg-white dark:bg-slate-800 p-8 rounded-3xl border border-slate-200 dark:border-slate-700 space-y-4 shadow-xl">
          <CheckCircle2 className="w-16 h-16 text-teal-500 mx-auto" />
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Email Verified!</h2>
          <p className="text-xs text-slate-500">Your TicketHarbor account has been successfully verified.</p>
          <Link to="/" className="inline-block px-6 py-2.5 bg-teal-600 text-white font-bold text-xs rounded-xl shadow">
            Go to Home
          </Link>
        </div>
      )}

      {status === 'error' && (
        <div className="bg-white dark:bg-slate-800 p-8 rounded-3xl border border-slate-200 dark:border-slate-700 space-y-4 shadow-xl">
          <XCircle className="w-16 h-16 text-rose-500 mx-auto" />
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Verification Failed</h2>
          <p className="text-xs text-slate-500">Token is invalid or has expired.</p>
        </div>
      )}
    </div>
  );
}
