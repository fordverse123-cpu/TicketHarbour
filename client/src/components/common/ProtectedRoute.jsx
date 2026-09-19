import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import PageLoader from './PageLoader';

export const PrivateRoute = () => {
  const { user, loading } = useAuth();

  if (loading) {
    return <PageLoader text="Verifying authentication..." />;
  }

  return user ? <Outlet /> : <Navigate to="/login" replace />;
};

export const AdminRoute = () => {
  const { user, loading } = useAuth();

  if (loading) {
    return <PageLoader text="Verifying admin credentials..." />;
  }

  const role = user?.role ? user.role.toUpperCase() : '';
  const isAdmin = user && (role === 'ADMIN' || role === 'SUPER_ADMIN');

  return isAdmin ? <Outlet /> : <Navigate to="/admin/login" replace />;
};

export const SuperAdminRoute = () => {
  const { user, loading } = useAuth();

  if (loading) {
    return <PageLoader text="Verifying Super Admin clearance..." />;
  }

  const role = user?.role ? user.role.toUpperCase() : '';
  const isSuper = user && role === 'SUPER_ADMIN';

  return isSuper ? <Outlet /> : <Navigate to="/super-admin/login" replace />;
};

export const PermissionRoute = ({ category }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return <PageLoader text="Verifying category permissions..." />;
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
