import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import API from '../services/api';
import GlassCard from '../components/ui/GlassCard';
import GlassButton from '../components/ui/GlassButton';
import GlassInput from '../components/ui/GlassInput';
import toast from 'react-hot-toast';
import { User, Lock, Mail, Phone } from 'lucide-react';

export default function Profile() {
  const { user, updateProfile } = useAuth();

  const [name, setName] = useState(user?.name || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [updatingProfile, setUpdatingProfile] = useState(false);

  // Password state
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [updatingPassword, setUpdatingPassword] = useState(false);

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    setUpdatingProfile(true);
    await updateProfile({ name, phone });
    setUpdatingProfile(false);
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    if (!currentPassword || !newPassword) {
      toast.error('Please enter current and new password');
      return;
    }
    setUpdatingPassword(true);
    try {
      const res = await API.put('/users/change-password', { currentPassword, newPassword });
      if (res.data.success) {
        toast.success('Password changed successfully!');
        setCurrentPassword('');
        setNewPassword('');
      }
    } catch (err) {
      const msg = err.response?.data?.message || 'Password update failed.';
      toast.error(msg);
    } finally {
      setUpdatingPassword(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-16">
      <div>
        <h1 className="text-3xl font-black text-white tracking-tight">Profile Settings</h1>
        <p className="text-xs text-slate-400">Manage your personal account details and security settings</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        
        {/* Personal Info Form */}
        <GlassCard className="space-y-4">
          <h2 className="text-lg font-black text-white flex items-center gap-2">
            <User className="w-5 h-5 text-cyanAccent-400" /> Account Details
          </h2>

          <form onSubmit={handleProfileSubmit} className="space-y-4 text-xs">
            <GlassInput
              label="Full Name"
              icon={User}
              value={name}
              onChange={(e) => setName(e.target.value)}
            />

            <GlassInput
              label="Email Address (Read only)"
              icon={Mail}
              disabled
              value={user?.email || ''}
            />

            <GlassInput
              label="Phone Number"
              icon={Phone}
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="+91 98765 43210"
            />

            <GlassButton
              type="submit"
              loading={updatingProfile}
              className="w-full py-3"
            >
              Save Changes
            </GlassButton>
          </form>
        </GlassCard>

        {/* Change Password Form */}
        <GlassCard className="space-y-4">
          <h2 className="text-lg font-black text-white flex items-center gap-2">
            <Lock className="w-5 h-5 text-indigoAccent-500" /> Change Password
          </h2>

          <form onSubmit={handlePasswordSubmit} className="space-y-4 text-xs">
            <GlassInput
              label="Current Password"
              type="password"
              icon={Lock}
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
            />

            <GlassInput
              label="New Password (min 6 chars)"
              type="password"
              icon={Lock}
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
            />

            <GlassButton
              type="submit"
              variant="secondary"
              loading={updatingPassword}
              className="w-full py-3"
            >
              Update Password
            </GlassButton>
          </form>
        </GlassCard>

      </div>
    </div>
  );
}

