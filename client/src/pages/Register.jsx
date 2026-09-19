import React, { useState, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import AuthLayout from '../components/common/AuthLayout';
import GlassButton from '../components/ui/GlassButton';
import GlassInput from '../components/ui/GlassInput';
import { Mail, Lock, User as UserIcon, Phone, UserPlus } from 'lucide-react';
import toast from 'react-hot-toast';

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
  const isSubmittingRef = useRef(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isSubmittingRef.current) return;

    if (password !== confirmPassword) {
      const msg = 'Passwords do not match.';
      setError(msg);
      toast.error(msg);
      return;
    }

    if (password.length < 8) {
      const msg = 'Password must be at least 8 characters long.';
      setError(msg);
      toast.error(msg);
      return;
    }

    isSubmittingRef.current = true;
    setError('');
    setLoading(true);

    try {
      const fullName = `${firstName.trim()} ${lastName.trim()}`.trim();
      const result = await register({ name: fullName, email, phone, password });

      if (result?.success) {
        navigate('/');
        toast.success('Registration successful! Welcome to TicketHarbour.');
      } else {
        const msg = result?.message || 'Registration failed.';
        setError(msg);
        toast.error(msg);
      }
    } catch (err) {
      const msg = err?.response?.data?.message || 'Registration failed.';
      setError(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
      isSubmittingRef.current = false;
    }
  };

  return (
    <AuthLayout
      title="Create Account"
      subtitle="Join TicketHarbour and manage all your bookings"
      footerText="Already have an account?"
      footerLinkText="Log In"
      footerLinkTo="/login"
    >
      {error && (
        <div className="p-3.5 bg-rose-500/10 border border-rose-500/30 rounded-xl text-rose-400 text-xs text-center font-semibold">
          {error}
        </div>
      )}

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
          label="Password (min 8 chars)"
          type="password"
          icon={Lock}
          placeholder="Min 8 characters..."
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

        <GlassButton
          type="submit"
          variant="gradient"
          className="w-full py-3.5"
          icon={UserPlus}
          disabled={loading}
        >
          {loading ? 'Creating Account...' : 'Register'}
        </GlassButton>
      </form>
    </AuthLayout>
  );
}
