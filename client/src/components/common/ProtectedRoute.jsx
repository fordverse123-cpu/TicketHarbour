import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

export const PrivateRoute = () => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex justify-center items-center py-24">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[#03B3C3]"></div>
      </div>
    );
  }

  return user ? <Outlet /> : <Navigate to="/login" replace />;
};

export const AdminRoute = () => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex justify-center items-center py-24">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[#03B3C3]"></div>
      </div>
    );
  }

  const role = user?.role ? user.role.toUpperCase() : '';
  const isAdmin = user && (role === 'ADMIN' || role === 'SUPER_ADMIN' || user.role === 'admin' || user.role === 'superadmin');

  return isAdmin ? <Outlet /> : <Navigate to="/admin/login" replace />;
};

export const SuperAdminRoute = () => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex justify-center items-center py-24">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[#6750A2]"></div>
      </div>
    );
  }

  const role = user?.role ? user.role.toUpperCase() : '';
  const isSuper = user && (role === 'SUPER_ADMIN' || user.role === 'superadmin');

  return isSuper ? <Outlet /> : <Navigate to="/super-admin/login" replace />;
};

export const PermissionRoute = ({ category }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex justify-center items-center py-24">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[#03B3C3]"></div>
      </div>
    );
  }

  const role = user?.role ? user.role.toUpperCase() : '';
  const permissions = user?.permissions || [];
  const targetCategory = category.toUpperCase();

  const hasAccess =
    user &&
    (role === 'SUPER_ADMIN' ||
      permissions.includes('ALL') ||
      (role === 'ADMIN' && permissions.includes(targetCategory)));

  return hasAccess ? <Outlet /> : <Navigate to="/admin/dashboard" replace />;
};
