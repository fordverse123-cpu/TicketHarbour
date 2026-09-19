import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';
import FlipAuthCard from '../../components/common/FlipAuthCard';

export default function SuperAdminLogin() {
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleLogin = async (email, password) => {
    try {
      const res = await login(email, password);
      if (!res || !res.success) return;

      const userRole = loggedUser?.role ? loggedUser.role.toUpperCase() : '';
      if (userRole !== 'SUPER_ADMIN') {
        toast.error('Access Denied: Super Admin privileges required.');
        return;
      }

      navigate('/admin/super');
    } catch (err) {
      toast.error('Login error occurred.');
    }
  };

  return (
    <div className="flex items-center justify-center min-h-[75vh] py-8">
      <FlipAuthCard
        initialMode="login"
        onLogin={handleLogin}
        titleLogin="Super Admin Login"
        isSuperAdmin={true}
      />
    </div>
  );
}

