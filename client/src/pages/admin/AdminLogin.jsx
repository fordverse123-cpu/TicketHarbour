import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import AuthLayout from '../../components/common/AuthLayout';
import GlassButton from '../../components/ui/GlassButton';
import GlassInput from '../../components/ui/GlassInput';
import { Mail, Lock, ShieldCheck } from 'lucide-react';
import toast from 'react-hot-toast';

export default function AdminLogin() {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const isSubmittingRef = useRef(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isSubmittingRef.current) return;

    isSubmittingRef.current = true;
    setLoading(true);
    setError('');

    try {
      const result = await login(email, password);

      if (!result || !result.success) {
        const msg = result?.message || 'Invalid administrator credentials.';
        setError(msg);
        toast.error(msg);
        return;
      }

      const role = result.user?.role ? result.user.role.toUpperCase() : '';

      if (role !== 'ADMIN' && role !== 'SUPER_ADMIN') {
        const msg = 'Access Denied: Administrator privileges required.';
        setError(msg);
        toast.error(msg);
        return;
      }

      const targetPath = role === 'SUPER_ADMIN' ? '/admin/super' : '/admin';
      navigate(targetPath, { replace: true });
      toast.success(`Welcome back, ${result.user?.name || 'Admin'}!`);
    } catch (err) {
      const msg = err?.response?.data?.message || 'Admin authentication failed.';
      setError(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
      isSubmittingRef.current = false;
    }
  };

  return (
    <AuthLayout
      title="Admin Portal Login"
      subtitle="Sign in to access administrator management controls"
      badge="ADMIN PORTAL"
    >
      {error && (
        <div className="p-3.5 bg-rose-500/10 border border-rose-500/30 rounded-xl text-rose-400 text-xs text-center font-semibold">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <GlassInput
          label="Administrator Email / Username"
          type="text"
          icon={Mail}
          placeholder="admin@ticketharbour.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />

        <GlassInput
          label="Password"
          type="password"
          icon={Lock}
          placeholder="Enter password..."
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />

        <GlassButton
          type="submit"
          variant="gradient"
          className="w-full py-3.5"
          icon={ShieldCheck}
          disabled={loading}
        >
          {loading ? 'Authenticating Admin...' : 'Log In to Admin Portal'}
        </GlassButton>
      </form>
    </AuthLayout>
  );
}
