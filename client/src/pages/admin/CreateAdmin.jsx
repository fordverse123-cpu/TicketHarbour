import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import API from '../../services/api';
import toast from 'react-hot-toast';
import GlassCard from '../../components/ui/GlassCard';
import GlassButton from '../../components/ui/GlassButton';
import GlassInput from '../../components/ui/GlassInput';
import { UserPlus, ArrowLeft, Lock, Mail, Phone, User, CheckCircle, Shield } from 'lucide-react';

const CATEGORIES = [
  { code: 'MOVIES', label: 'Movies' },
  { code: 'EVENTS', label: 'Events' },
  { code: 'SPORTS', label: 'Sports' },
  { code: 'BUS', label: 'Bus' },
  { code: 'TRAIN', label: 'Train' },
  { code: 'FLIGHTS', label: 'Flights' },
  { code: 'ATTRACTIONS', label: 'Attractions' },
];

export default function CreateAdmin() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [selectedPermissions, setSelectedPermissions] = useState([
    'MOVIES', 'EVENTS', 'SPORTS', 'BUS', 'TRAIN', 'FLIGHTS', 'ATTRACTIONS'
  ]);
  const [submitting, setSubmitting] = useState(false);

  const navigate = useNavigate();

  const togglePermission = (code) => {
    if (selectedPermissions.includes(code)) {
      setSelectedPermissions(selectedPermissions.filter((p) => p !== code));
    } else {
      setSelectedPermissions([...selectedPermissions, code]);
    }
  };

  const handleCreateAdmin = async (e) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }

    if (password.length < 6) {
      toast.error('Password must be at least 6 characters long');
      return;
    }

    if (selectedPermissions.length === 0) {
      toast.error('Please assign at least one category permission.');
      return;
    }

    setSubmitting(true);
    try {
      const res = await API.post('/super-admin/admins', {
        name,
        email,
        phone,
        password,
        permissions: selectedPermissions,
      });

      if (res.data.success) {
        toast.success(`Admin account for ${name} created successfully!`);
        navigate('/admin/super');
      }
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to create Admin account.';
      toast.error(msg);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-8 pb-16">
      <Link
        to="/admin/super"
        className="inline-flex items-center gap-2 text-xs font-bold text-[#A0A0A0] hover:text-white transition-colors"
      >
        <ArrowLeft className="w-4 h-4" /> Back to Super Admin Dashboard
      </Link>

      <GlassCard className="p-8 space-y-6">
        <div className="flex items-center gap-3 border-b border-white/10 pb-4">
          <div className="p-3 bg-[#6750A2]/20 text-[#03B3C3] rounded-2xl border border-[#6750A2]/30">
            <UserPlus className="w-7 h-7" />
          </div>
          <div>
            <h1 className="text-2xl font-black text-white">Create New Admin Account</h1>
            <p className="text-xs text-[#B5B5B5]">
              Provision new administrator credentials and assign category management permissions.
            </p>
          </div>
        </div>

        <form onSubmit={handleCreateAdmin} className="space-y-4 text-xs">
          <GlassInput
            label="Full Name *"
            icon={User}
            required
            placeholder="e.g. John Doe"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <GlassInput
              label="Email Address *"
              type="email"
              icon={Mail}
              required
              placeholder="admin.john@ticketharbour.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <GlassInput
              label="Phone Number"
              icon={Phone}
              placeholder="+91 98765 43210"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <GlassInput
              label="Password *"
              type="password"
              icon={Lock}
              required
              placeholder="Min 6 characters..."
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <GlassInput
              label="Confirm Password *"
              type="password"
              icon={Lock}
              required
              placeholder="Re-enter password..."
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
            />
          </div>

          {/* Assign Permissions Selector Checkboxes */}
          <div className="space-y-2 pt-2">
            <label className="font-bold text-white uppercase tracking-wider block flex items-center gap-1.5">
              <Shield className="w-4 h-4 text-[#03B3C3]" /> Assign Category Permissions *
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 p-4 bg-[#111111] rounded-2xl border border-white/10">
              {CATEGORIES.map((cat) => {
                const checked = selectedPermissions.includes(cat.code);
                return (
                  <label
                    key={cat.code}
                    className={`flex items-center gap-2 p-2.5 rounded-xl border text-xs font-bold cursor-pointer select-none transition-all ${
                      checked
                        ? 'bg-[#03B3C3]/20 border-[#03B3C3] text-white shadow-md'
                        : 'bg-white/5 border-white/10 text-[#A0A0A0] hover:text-white'
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={checked}
                      onChange={() => togglePermission(cat.code)}
                      className="hidden"
                    />
                    <CheckCircle className={`w-4 h-4 ${checked ? 'text-[#03B3C3]' : 'text-slate-600'}`} />
                    <span>{cat.label}</span>
                  </label>
                );
              })}
            </div>
          </div>

          <GlassButton type="submit" variant="gradient" disabled={submitting} className="w-full py-3.5 mt-4">
            {submitting ? 'Creating Admin Account...' : 'Create Admin Account'}
          </GlassButton>
        </form>
      </GlassCard>
    </div>
  );
}
