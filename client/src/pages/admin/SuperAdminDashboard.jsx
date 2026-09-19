import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import API from '../../services/api';
import toast from 'react-hot-toast';
import GlassCard from '../../components/ui/GlassCard';
import GlassButton from '../../components/ui/GlassButton';
import GlassModal from '../../components/ui/GlassModal';
import GlassInput from '../../components/ui/GlassInput';
import {
  ShieldCheck,
  UserCheck,
  UserX,
  PlusCircle,
  Search,
  Edit,
  Trash2,
  Key,
  ToggleLeft,
  ToggleRight,
  Shield,
  CheckCircle,
} from 'lucide-react';

const CATEGORIES = ['MOVIES', 'EVENTS', 'SPORTS', 'BUS', 'TRAIN', 'FLIGHTS', 'ATTRACTIONS'];

export default function SuperAdminDashboard() {
  const [stats, setStats] = useState(null);
  const [admins, setAdmins] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  // Edit Modal State
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [selectedAdmin, setSelectedAdmin] = useState(null);
  const [editName, setEditName] = useState('');
  const [editEmail, setEditEmail] = useState('');
  const [editPhone, setEditPhone] = useState('');
  const [savingEdit, setSavingEdit] = useState(false);

  // Permissions Modal State
  const [permModalOpen, setPermModalOpen] = useState(false);
  const [adminPermissions, setAdminPermissions] = useState([]);
  const [savingPerms, setSavingPerms] = useState(false);

  // Reset Password Modal State
  const [resetModalOpen, setResetModalOpen] = useState(false);
  const [newPassword, setNewPassword] = useState('');
  const [resettingPassword, setResettingPassword] = useState(false);

  useEffect(() => {
    fetchSuperAdminData();
  }, []);

  const fetchSuperAdminData = async () => {
    setLoading(true);
    try {
      const [statsRes, adminsRes] = await Promise.all([
        API.get('/super-admin/stats'),
        API.get('/super-admin/admins'),
      ]);

      if (statsRes.data.success) setStats(statsRes.data.data.stats);
      if (adminsRes.data.success) setAdmins(adminsRes.data.data.admins);
    } catch (err) {
      toast.error('Failed to load Super Admin dashboard data.');
    } finally {
      setLoading(false);
    }
  };

  const handleToggleStatus = async (admin) => {
    const newStatus = admin.status === 'active' ? 'inactive' : 'active';
    const actionName = newStatus === 'active' ? 'activate' : 'deactivate';

    if (!window.confirm(`Are you sure you want to ${actionName} admin ${admin.name}?`)) return;

    try {
      const res = await API.put(`/super-admin/admins/${admin._id}/status`, { status: newStatus });
      if (res.data.success) {
        toast.success(`Admin ${admin.name} is now ${newStatus}`);
        fetchSuperAdminData();
      }
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to update admin status.';
      toast.error(msg);
    }
  };

  const openEditModal = (admin) => {
    setSelectedAdmin(admin);
    setEditName(admin.name);
    setEditEmail(admin.email);
    setEditPhone(admin.phone || '');
    setEditModalOpen(true);
  };

  const handleSaveEdit = async (e) => {
    e.preventDefault();
    setSavingEdit(true);

    try {
      const res = await API.put(`/super-admin/admins/${selectedAdmin._id}`, {
        name: editName,
        email: editEmail,
        phone: editPhone,
      });

      if (res.data.success) {
        toast.success('Admin details updated successfully');
        setEditModalOpen(false);
        fetchSuperAdminData();
      }
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to update admin details.';
      toast.error(msg);
    } finally {
      setSavingEdit(false);
    }
  };

  const openPermissionsModal = (admin) => {
    setSelectedAdmin(admin);
    setAdminPermissions(admin.permissions || ['MOVIES', 'EVENTS', 'SPORTS', 'BUS', 'TRAIN', 'FLIGHTS', 'ATTRACTIONS']);
    setPermModalOpen(true);
  };

  const toggleCategoryPerm = (cat) => {
    if (adminPermissions.includes(cat)) {
      setAdminPermissions(adminPermissions.filter((p) => p !== cat));
    } else {
      setAdminPermissions([...adminPermissions, cat]);
    }
  };

  const handleSavePermissions = async (e) => {
    e.preventDefault();
    setSavingPerms(true);

    try {
      const res = await API.patch(`/super-admin/admins/${selectedAdmin._id}/permissions`, {
        permissions: adminPermissions,
      });

      if (res.data.success) {
        toast.success(`Permissions updated for ${selectedAdmin.name}`);
        setPermModalOpen(false);
        fetchSuperAdminData();
      }
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to update permissions.';
      toast.error(msg);
    } finally {
      setSavingPerms(false);
    }
  };

  const openResetModal = (admin) => {
    setSelectedAdmin(admin);
    setNewPassword('');
    setResetModalOpen(true);
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    if (!newPassword || newPassword.length < 6) {
      toast.error('Password must be at least 6 characters long');
      return;
    }

    setResettingPassword(true);
    try {
      const res = await API.put(`/super-admin/admins/${selectedAdmin._id}/reset-password`, {
        newPassword,
      });

      if (res.data.success) {
        toast.success(`Password reset successfully for ${selectedAdmin.name}`);
        setResetModalOpen(false);
      }
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to reset admin password.';
      toast.error(msg);
    } finally {
      setResettingPassword(false);
    }
  };

  const handleDeleteAdmin = async (admin) => {
    if (!window.confirm(`Are you sure you want to permanently delete Admin ${admin.name}? This action cannot be undone.`)) return;

    try {
      const res = await API.delete(`/super-admin/admins/${admin._id}`);
      if (res.data.success) {
        toast.success(`Admin ${admin.name} deleted.`);
        fetchSuperAdminData();
      }
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to delete admin.';
      toast.error(msg);
    }
  };

  const filteredAdmins = admins.filter((a) => {
    const matchStatus = statusFilter === 'all' || a.status === statusFilter;
    const matchSearch =
      !searchQuery ||
      a.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      a.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (a.phone && a.phone.toLowerCase().includes(searchQuery.toLowerCase()));

    return matchStatus && matchSearch;
  });

  if (loading) {
    return (
      <div className="flex justify-center items-center py-32">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[#03B3C3]"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-16">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-white flex items-center gap-3">
            <ShieldCheck className="w-8 h-8 text-[#03B3C3]" /> Super Admin Dashboard
          </h1>
          <p className="text-xs text-[#B5B5B5]">
            System governance, Admin account creation, and Category Permission Management
          </p>
        </div>

        <Link to="/admin/super/admins/create">
          <GlassButton variant="gradient" icon={PlusCircle}>
            Create Admin
          </GlassButton>
        </Link>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <GlassCard hover={false} className="space-y-2">
          <span className="text-[10px] text-[#A0A0A0] font-bold uppercase tracking-wider">Total Admins</span>
          <p className="text-3xl font-black text-[#03B3C3]">{stats?.totalAdmins || 0}</p>
          <p className="text-xs text-[#777777]">Authorized administrators</p>
        </GlassCard>

        <GlassCard hover={false} className="space-y-2">
          <span className="text-[10px] text-[#A0A0A0] font-bold uppercase tracking-wider">Active Admins</span>
          <p className="text-3xl font-black text-emerald-400">{stats?.activeAdmins || 0}</p>
          <p className="text-xs text-emerald-400 font-semibold flex items-center gap-1">
            <UserCheck className="w-3.5 h-3.5" /> Operational
          </p>
        </GlassCard>

        <GlassCard hover={false} className="space-y-2">
          <span className="text-[10px] text-[#A0A0A0] font-bold uppercase tracking-wider">Disabled Admins</span>
          <p className="text-3xl font-black text-rose-500">{stats?.inactiveAdmins || 0}</p>
          <p className="text-xs text-slate-500 flex items-center gap-1">
            <UserX className="w-3.5 h-3.5 text-rose-400" /> Access revoked
          </p>
        </GlassCard>
      </div>

      {/* Admin Management Section */}
      <GlassCard hover={false} className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-lg font-black text-white">Admin Management</h2>
            <p className="text-xs text-[#B5B5B5]">View and manage administrator privileges</p>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-3">
            <div className="w-full sm:w-64">
              <GlassInput
                icon={Search}
                placeholder="Search name, email..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full sm:w-auto p-2.5 bg-[#111111] border border-white/10 rounded-xl text-xs text-white"
            >
              <option value="all">All Statuses</option>
              <option value="active">Active Only</option>
              <option value="inactive">Inactive Only</option>
            </select>
          </div>
        </div>

        {/* Admins Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-[#B5B5B5]">
            <thead className="bg-[#111111] uppercase text-[#777777] font-bold border-b border-white/10">
              <tr>
                <th className="p-4">Administrator</th>
                <th className="p-4">Email</th>
                <th className="p-4">Assigned Categories</th>
                <th className="p-4">Status</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/10">
              {filteredAdmins.length === 0 ? (
                <tr>
                  <td colSpan="5" className="p-12 text-center text-[#777777]">
                    No admin accounts found.
                  </td>
                </tr>
              ) : (
                filteredAdmins.map((admin) => {
                  const perms = admin.permissions || ['MOVIES', 'EVENTS', 'SPORTS', 'BUS', 'TRAIN', 'FLIGHTS', 'ATTRACTIONS'];
                  return (
                    <tr key={admin._id} className="hover:bg-white/5 transition-colors">
                      <td className="p-4">
                        <div className="font-bold text-white text-sm">{admin.name}</div>
                        <span className="text-[10px] text-[#03B3C3] uppercase font-bold">Role: {admin.role}</span>
                      </td>

                      <td className="p-4 font-mono">{admin.email}</td>

                      <td className="p-4">
                        <div className="flex flex-wrap gap-1 max-w-xs">
                          {perms.map((p) => (
                            <span key={p} className="px-2 py-0.5 bg-[#03B3C3]/15 text-[#03B3C3] border border-[#03B3C3]/30 font-bold rounded-md text-[9px]">
                              {p}
                            </span>
                          ))}
                        </div>
                      </td>

                      <td className="p-4">
                        <span
                          className={`px-3 py-1 rounded-xl font-bold text-[10px] uppercase ${
                            admin.status === 'active'
                              ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                              : 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                          }`}
                        >
                          {admin.status}
                        </span>
                      </td>

                      <td className="p-4 text-right space-x-1">
                        <button
                          onClick={() => openPermissionsModal(admin)}
                          className="p-2 text-[#03B3C3] hover:bg-white/10 rounded-xl"
                          title="Manage Category Permissions"
                        >
                          <Shield className="w-4 h-4" />
                        </button>

                        <button
                          onClick={() => handleToggleStatus(admin)}
                          className="p-2 text-[#A0A0A0] hover:bg-white/10 rounded-xl"
                          title={admin.status === 'active' ? 'Deactivate Admin' : 'Activate Admin'}
                        >
                          {admin.status === 'active' ? (
                            <ToggleRight className="w-5 h-5 text-emerald-400" />
                          ) : (
                            <ToggleLeft className="w-5 h-5 text-rose-400" />
                          )}
                        </button>

                        <button
                          onClick={() => openEditModal(admin)}
                          className="p-2 text-[#6750A2] hover:bg-white/10 rounded-xl"
                          title="Edit Admin Info"
                        >
                          <Edit className="w-4 h-4" />
                        </button>

                        <button
                          onClick={() => openResetModal(admin)}
                          className="p-2 text-[#03B3C3] hover:bg-white/10 rounded-xl"
                          title="Reset Password"
                        >
                          <Key className="w-4 h-4" />
                        </button>

                        <button
                          onClick={() => handleDeleteAdmin(admin)}
                          className="p-2 text-rose-400 hover:bg-rose-500/20 rounded-xl"
                          title="Delete Admin Account"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </GlassCard>

      {/* Permissions Edit Modal */}
      <GlassModal
        isOpen={permModalOpen}
        onClose={() => setPermModalOpen(false)}
        title={`Category Permissions - ${selectedAdmin?.name}`}
        maxWidth="max-w-md"
      >
        <form onSubmit={handleSavePermissions} className="space-y-4 text-xs">
          <p className="text-[#B5B5B5]">Toggle assigned category management permissions for this Admin:</p>
          <div className="grid grid-cols-2 gap-2 p-3 bg-[#111111] rounded-2xl border border-white/10">
            {CATEGORIES.map((cat) => {
              const checked = adminPermissions.includes(cat);
              return (
                <label
                  key={cat}
                  className={`flex items-center gap-2 p-2.5 rounded-xl border text-xs font-bold cursor-pointer transition-all ${
                    checked
                      ? 'bg-[#03B3C3]/20 border-[#03B3C3] text-white'
                      : 'bg-white/5 border-white/10 text-[#777777]'
                  }`}
                >
                  <input type="checkbox" checked={checked} onChange={() => toggleCategoryPerm(cat)} className="hidden" />
                  <CheckCircle className={`w-4 h-4 ${checked ? 'text-[#03B3C3]' : 'text-slate-600'}`} />
                  <span>{cat}</span>
                </label>
              );
            })}
          </div>

          <GlassButton type="submit" variant="gradient" loading={savingPerms} className="w-full">
            Save Permissions
          </GlassButton>
        </form>
      </GlassModal>

      {/* Edit Admin Modal */}
      <GlassModal
        isOpen={editModalOpen}
        onClose={() => setEditModalOpen(false)}
        title="Edit Admin Details"
        maxWidth="max-w-md"
      >
        <form onSubmit={handleSaveEdit} className="space-y-3 text-xs">
          <GlassInput label="Full Name" value={editName} onChange={(e) => setEditName(e.target.value)} required />
          <GlassInput label="Email Address" type="email" value={editEmail} onChange={(e) => setEditEmail(e.target.value)} required />
          <GlassInput label="Phone Number" value={editPhone} onChange={(e) => setEditPhone(e.target.value)} />
          <GlassButton type="submit" variant="gradient" loading={savingEdit} className="w-full">
            Save Changes
          </GlassButton>
        </form>
      </GlassModal>

      {/* Reset Password Modal */}
      <GlassModal
        isOpen={resetModalOpen}
        onClose={() => setResetModalOpen(false)}
        title={`Reset Password - ${selectedAdmin?.name}`}
        maxWidth="max-w-md"
      >
        <form onSubmit={handleResetPassword} className="space-y-3 text-xs">
          <GlassInput label="New Password" type="password" placeholder="Min 6 characters..." value={newPassword} onChange={(e) => setNewPassword(e.target.value)} required />
          <GlassButton type="submit" variant="gradient" loading={resettingPassword} className="w-full">
            Reset Admin Password
          </GlassButton>
        </form>
      </GlassModal>
    </div>
  );
}
