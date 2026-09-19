import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import GlassCard from '../components/ui/GlassCard';
import GlassButton from '../components/ui/GlassButton';
import GlassInput from '../components/ui/GlassInput';
import { Mail, Lock, User as UserIcon, Phone, UserPlus } from 'lucide-react';

export default function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();

  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }
    setError('');
    setLoading(true);
    try {
      const fullName = `${firstName.trim()} ${lastName.trim()}`.trim();
      const result = await register({ name: fullName, email, phone, password });
      if (result?.success) {
        navigate('/');
      } else {
        setError(result?.error || 'Failed to create account.');
      }
    } catch (err) {
      setError(err?.response?.data?.message || 'Registration failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-[80vh] py-8">
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
              Create Your TicketHarbour Account
            </h1>
            <p className="text-xs text-[#B5B5B5] mt-1">
              Join TicketHarbour and manage all your bookings in one place.
            </p>
          </div>
        </div>

        {error && (
          <div className="p-3.5 bg-rose-500/10 border border-rose-500/30 rounded-xl text-rose-400 text-xs text-center font-semibold">
            {error}
          </div>
        )}

        {/* Register Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <GlassInput
              label="First Name"
              type="text"
              icon={UserIcon}
              placeholder="First name..."
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              required
            />
            <GlassInput
              label="Last Name"
              type="text"
              icon={UserIcon}
              placeholder="Last name..."
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              required
            />
          </div>

          <GlassInput
            label="Email Address"
            type="email"
            icon={Mail}
            placeholder="name@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />

          <GlassInput
            label="Phone Number"
            type="tel"
            icon={Phone}
            placeholder="+91 98765 43210"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
          />

          <GlassInput
            label="Password"
            type="password"
            icon={Lock}
            placeholder="Min 6 characters..."
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />

          <GlassInput
            label="Confirm Password"
            type="password"
            icon={Lock}
            placeholder="Re-enter password..."
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
          />

          <GlassButton type="submit" variant="gradient" className="w-full py-3.5" icon={UserPlus} disabled={loading}>
            {loading ? 'Creating Account...' : 'Create Account'}
          </GlassButton>
        </form>

        {/* Footer */}
        <div className="text-center pt-2 text-xs text-[#B5B5B5] border-t border-white/10">
          Already have an account?{' '}
          <Link to="/login" className="text-[#03B3C3] font-bold hover:underline ml-1">
            Log In
          </Link>
        </div>
      </GlassCard>
    </div>
  );
}
