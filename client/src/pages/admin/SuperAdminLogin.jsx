import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import AuthLayout from '../../components/common/AuthLayout';
import GlassButton from '../../components/ui/GlassButton';
import GlassInput from '../../components/ui/GlassInput';
import { Mail, Lock, ShieldCheck } from 'lucide-react';
import toast from 'react-hot-toast';

export default function SuperAdminLogin() {
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
        const msg = result?.message || 'Invalid Super Admin credentials.';
        setError(msg);
        toast.error(msg);
        return;
      }

      const role = result.user?.role ? result.user.role.toUpperCase() : '';

      if (role !== 'SUPER_ADMIN') {
        const msg = 'Access Denied: Super Admin privileges required.';
        setError(msg);
        toast.error(msg);
        return;
      }

      navigate('/admin/super', { replace: true });
      toast.success(`Welcome back, ${result.user?.name || 'Super Admin'}!`);
    } catch (err) {
      const msg = err?.response?.data?.message || 'Super Admin authentication failed.';
      setError(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
      isSubmittingRef.current = false;
    }
  };

  return (
    <AuthLayout
      title="Super Admin Login"
      subtitle="Sign in to access system governance and administrator management"
      badge="SUPER ADMIN"
    >
      {error && (
        <div className="p-3.5 bg-rose-500/10 border border-rose-500/30 rounded-xl text-rose-400 text-xs text-center font-semibold">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <GlassInput
          label="Super Admin Email / Username"
          type="text"
          icon={Mail}
          placeholder="superadmin@ticketharbour.com"
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
          {loading ? 'Logging in...' : 'Log In as Super Admin'}
        </GlassButton>
      </form>
    </AuthLayout>
  );
}
