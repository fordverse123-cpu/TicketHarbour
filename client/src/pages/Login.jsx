import React, { useState, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import AuthLayout from '../components/common/AuthLayout';
import GlassButton from '../components/ui/GlassButton';
import GlassInput from '../components/ui/GlassInput';
import { Mail, Lock, LogIn as LogInIcon } from 'lucide-react';
import toast from 'react-hot-toast';

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
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
      if (result?.success) {
        const role = result.user?.role?.toUpperCase();
        let targetPath = location.state?.from?.pathname;
        if (!targetPath || targetPath === '/login') {
          if (role === 'SUPER_ADMIN') targetPath = '/admin/super';
          else if (role === 'ADMIN') targetPath = '/admin';
          else targetPath = '/';
        }
        navigate(targetPath, { replace: true });
        toast.success(`Welcome back, ${result.user?.name || 'User'}!`);
      } else {
        const msg = result?.message || 'Invalid email or password.';
        setError(msg);
        toast.error(msg);
      }
    } catch (err) {
      const msg = err?.response?.data?.message || 'Login error occurred.';
      setError(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
      isSubmittingRef.current = false;
    }
  };

  return (
    <AuthLayout
      title="Welcome Back"
      subtitle="Sign in to your TicketHarbour account"
      footerText="Don't have an account?"
      footerLinkText="Register"
      footerLinkTo="/register"
    >
      {error && (
        <div className="p-3.5 bg-rose-500/10 border border-rose-500/30 rounded-xl text-rose-400 text-xs text-center font-semibold">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <GlassInput
          label="Email or Username"
          type="text"
          icon={Mail}
          placeholder="Enter your email or username..."
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

        <div className="flex items-center justify-between text-xs pt-1">
          <label className="flex items-center gap-2 cursor-pointer text-[#9CA3AF] hover:text-white select-none">
            <input
              type="checkbox"
              checked={rememberMe}
              onChange={(e) => setRememberMe(e.target.checked)}
              className="rounded border-white/10 bg-[#151515] text-[#03B3C3] focus:ring-0"
            />
            <span>Remember me</span>
          </label>

          <Link to="/forgot-password" className="text-[#03B3C3] font-bold hover:underline">
            Forgot password?
          </Link>
        </div>

        <GlassButton
          type="submit"
          variant="gradient"
          className="w-full py-3.5"
          icon={LogInIcon}
          disabled={loading}
        >
          {loading ? 'Logging in...' : 'Log In'}
        </GlassButton>
      </form>
    </AuthLayout>
  );
}
