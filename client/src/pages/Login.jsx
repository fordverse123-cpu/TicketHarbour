import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import GlassCard from '../components/ui/GlassCard';
import GlassButton from '../components/ui/GlassButton';
import GlassInput from '../components/ui/GlassInput';
import { Mail, Lock, LogIn as LogInIcon } from 'lucide-react';

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const result = await login(email, password);
      if (result?.success) {
        const from = location.state?.from?.pathname || '/';
        navigate(from, { replace: true });
      } else {
        setError(result?.error || 'Invalid email or password.');
      }
    } catch (err) {
      setError(err?.response?.data?.message || 'Failed to authenticate.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-[75vh] py-8">
      <GlassCard className="max-w-md w-full p-8 sm:p-10 space-y-6">
        {/* Logo & Header */}
        <div className="text-center space-y-3">
          <Link to="/" className="inline-flex items-center gap-2.5 group">
            <div className="h-10 w-10 rounded-xl bg-gradient-to-tr from-[#03B3C3] to-[#6750A2] flex items-center justify-center text-white font-black text-xl shadow-lg group-hover:scale-105 transition-transform">
              TH
            </div>
            <span className="text-2xl font-black tracking-tight text-white">
              Ticket<span className="text-transparent bg-clip-text bg-gradient-to-r from-[#03B3C3] to-[#6750A2]">Harbour</span>
            </span>
          </Link>

          <div>
            <h1 className="text-2xl font-black text-white tracking-tight">
              Welcome Back to TicketHarbour
            </h1>
            <p className="text-xs text-[#B5B5B5] mt-1">
              Sign in to continue to TicketHarbour
            </p>
          </div>
        </div>

        {error && (
          <div className="p-3.5 bg-rose-500/10 border border-rose-500/30 rounded-xl text-rose-400 text-xs text-center font-semibold">
            {error}
          </div>
        )}

        {/* Login Form */}
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
            <label className="flex items-center gap-2 cursor-pointer text-[#B5B5B5] hover:text-white select-none">
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="rounded border-white/10 bg-[#111111] text-[#03B3C3] focus:ring-0"
              />
              <span>Remember me</span>
            </label>

            <Link to="/forgot-password" className="text-[#03B3C3] font-bold hover:underline">
              Forgot password?
            </Link>
          </div>

          <GlassButton type="submit" variant="gradient" className="w-full py-3.5" icon={LogInIcon} disabled={loading}>
            {loading ? 'Logging In...' : 'Log In'}
          </GlassButton>
        </form>

        {/* Footer */}
        <div className="text-center pt-2 text-xs text-[#B5B5B5] border-t border-white/10">
          Don't have an account?{' '}
          <Link to="/register" className="text-[#03B3C3] font-bold hover:underline ml-1">
            Register
          </Link>
        </div>
      </GlassCard>
    </div>
  );
}
