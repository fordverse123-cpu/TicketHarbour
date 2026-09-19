import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import API from '../../services/api';
import toast from 'react-hot-toast';
import {
  Users,
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
  X,
  CheckCircle,
  AlertTriangle,
} from 'lucide-react';

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

  // Filter admins
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
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-16">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-slate-900 dark:text-white flex items-center gap-3">
            <ShieldCheck className="w-8 h-8 text-purple-600" /> Super Admin Dashboard
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            System governance, Admin account creation, and security management
          </p>
        </div>

        <Link
          to="/admin/super/admins/create"
          className="px-5 py-2.5 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white font-bold text-xs rounded-2xl shadow-lg hover:shadow-purple-500/20 transition-all flex items-center gap-2 w-fit"
        >
          <PlusCircle className="w-4 h-4" /> + Create Admin
        </Link>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <div className="bg-white dark:bg-slate-800 rounded-3xl border border-slate-200 dark:border-slate-700 p-6 space-y-2 shadow-sm">
          <span className="text-xs text-slate-400 font-bold uppercase tracking-wider">Total Admin Accounts</span>
          <p className="text-3xl font-black text-purple-600 dark:text-purple-400">{stats?.totalAdmins || 0}</p>
          <p className="text-xs text-slate-500">Authorized system administrators</p>
        </div>

        <div className="bg-white dark:bg-slate-800 rounded-3xl border border-slate-200 dark:border-slate-700 p-6 space-y-2 shadow-sm">
          <span className="text-xs text-slate-400 font-bold uppercase tracking-wider">Active Admins</span>
          <p className="text-3xl font-black text-emerald-600 dark:text-emerald-400">{stats?.activeAdmins || 0}</p>
          <p className="text-xs text-emerald-500 font-semibold flex items-center gap-1">
            <UserCheck className="w-3.5 h-3.5" /> Ready for platform operations
          </p>
        </div>

        <div className="bg-white dark:bg-slate-800 rounded-3xl border border-slate-200 dark:border-slate-700 p-6 space-y-2 shadow-sm">
          <span className="text-xs text-slate-400 font-bold uppercase tracking-wider">Inactive / Disabled Admins</span>
          <p className="text-3xl font-black text-rose-500">{stats?.inactiveAdmins || 0}</p>
          <p className="text-xs text-slate-500 flex items-center gap-1">
            <UserX className="w-3.5 h-3.5 text-rose-400" /> Access revoked
          </p>
        </div>
      </div>

      {/* Admin Management Section */}
      <div className="bg-white dark:bg-slate-800 rounded-3xl border border-slate-200 dark:border-slate-700 p-6 space-y-6 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-lg font-black text-slate-900 dark:text-white">Admin Management</h2>
            <p className="text-xs text-slate-500">View and manage administrator privileges</p>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-3">
            {/* Search */}
            <div className="relative w-full sm:w-64">
              <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
              <input
                type="text"
                placeholder="Search admins by name, email..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl text-xs dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>

            {/* Status Filter */}
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full sm:w-auto p-2 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl text-xs dark:text-white"
            >
              <option value="all">All Statuses</option>
              <option value="active">Active Only</option>
              <option value="inactive">Inactive Only</option>
            </select>
          </div>
        </div>

        {/* Admins Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-600 dark:text-slate-300">
            <thead className="bg-slate-50 dark:bg-slate-700/60 uppercase text-slate-400 font-bold border-b border-slate-100 dark:border-slate-700">
              <tr>
                <th className="p-4">Administrator</th>
                <th className="p-4">Email</th>
                <th className="p-4">Phone</th>
                <th className="p-4">Status</th>
                <th className="p-4">Created By</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-700/60">
              {filteredAdmins.length === 0 ? (
                <tr>
                  <td colSpan="6" className="p-12 text-center text-slate-400">
                    No admin accounts found.
                  </td>
                </tr>
              ) : (
                filteredAdmins.map((admin) => (
                  <tr key={admin._id} className="hover:bg-slate-50/80 dark:hover:bg-slate-700/40 transition-colors">
                    {/* Name */}
                    <td className="p-4">
                      <div className="font-bold text-slate-900 dark:text-white text-sm">
                        {admin.name}
                      </div>
                      <span className="text-[10px] text-purple-600 dark:text-purple-400 uppercase font-bold tracking-wider">
                        Role: {admin.role}
                      </span>
                    </td>

                    {/* Email */}
                    <td className="p-4 font-mono">{admin.email}</td>

                    {/* Phone */}
                    <td className="p-4">{admin.phone || 'N/A'}</td>

                    {/* Status Badge */}
                    <td className="p-4">
                      <span
                        className={`px-3 py-1 rounded-xl font-bold text-[10px] uppercase ${
                          admin.status === 'active'
                            ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300'
                            : 'bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-300'
                        }`}
                      >
                        {admin.status}
                      </span>
                    </td>

                    {/* Created By */}
                    <td className="p-4 text-slate-400">
                      {admin.createdBy?.name || 'Super Admin'}
                    </td>

                    {/* Actions */}
                    <td className="p-4 text-right space-x-1">
                      <button
                        onClick={() => handleToggleStatus(admin)}
                        className={`p-2 rounded-xl transition-colors ${
                          admin.status === 'active'
                            ? 'text-amber-600 hover:bg-amber-50 dark:hover:bg-amber-950/50'
                            : 'text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-950/50'
                        }`}
                        title={admin.status === 'active' ? 'Deactivate Admin' : 'Activate Admin'}
                      >
                        {admin.status === 'active' ? (
                          <ToggleRight className="w-5 h-5 text-emerald-500" />
                        ) : (
                          <ToggleLeft className="w-5 h-5 text-rose-400" />
                        )}
                      </button>

                      <button
                        onClick={() => openEditModal(admin)}
                        className="p-2 text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-950/50 rounded-xl transition-colors"
                        title="Edit Admin Info"
                      >
                        <Edit className="w-4 h-4" />
                      </button>

                      <button
                        onClick={() => openResetModal(admin)}
                        className="p-2 text-purple-600 hover:bg-purple-50 dark:hover:bg-purple-950/50 rounded-xl transition-colors"
                        title="Reset Password"
                      >
                        <Key className="w-4 h-4" />
                      </button>

                      <button
                        onClick={() => handleDeleteAdmin(admin)}
                        className="p-2 text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/50 rounded-xl transition-colors"
                        title="Delete Admin Account"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Edit Admin Modal */}
      {editModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-800 rounded-3xl p-6 max-w-md w-full space-y-4 shadow-2xl relative">
            <button
              onClick={() => setEditModalOpen(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="font-black text-lg text-slate-900 dark:text-white">Edit Admin Information</h3>

            <form onSubmit={handleSaveEdit} className="space-y-3 text-xs">
              <div className="space-y-1">
                <label className="font-semibold text-slate-600 dark:text-slate-300">Full Name</label>
                <input
                  type="text"
                  required
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="w-full p-3 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl dark:text-white"
                />
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-slate-600 dark:text-slate-300">Email Address</label>
                <input
                  type="email"
                  required
                  value={editEmail}
                  onChange={(e) => setEditEmail(e.target.value)}
                  className="w-full p-3 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl dark:text-white"
                />
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-slate-600 dark:text-slate-300">Phone Number</label>
                <input
                  type="text"
                  value={editPhone}
                  onChange={(e) => setEditPhone(e.target.value)}
                  className="w-full p-3 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl dark:text-white"
                />
              </div>

              <button
                type="submit"
                disabled={savingEdit}
                className="w-full py-3 bg-purple-600 text-white font-bold rounded-xl shadow hover:bg-purple-700"
              >
                {savingEdit ? 'Saving...' : 'Save Changes'}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Reset Password Modal */}
      {resetModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-800 rounded-3xl p-6 max-w-md w-full space-y-4 shadow-2xl relative">
            <button
              onClick={() => setResetModalOpen(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="font-black text-lg text-slate-900 dark:text-white flex items-center gap-2">
              <Key className="w-5 h-5 text-purple-600" /> Reset Password for {selectedAdmin?.name}
            </h3>

            <form onSubmit={handleResetPassword} className="space-y-3 text-xs">
              <div className="space-y-1">
                <label className="font-semibold text-slate-600 dark:text-slate-300">New Password</label>
                <input
                  type="password"
                  required
                  placeholder="Enter at least 6 characters..."
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full p-3 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl dark:text-white"
                />
              </div>

              <button
                type="submit"
                disabled={resettingPassword}
                className="w-full py-3 bg-purple-600 text-white font-bold rounded-xl shadow hover:bg-purple-700"
              >
                {resettingPassword ? 'Resetting...' : 'Set New Admin Password'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
