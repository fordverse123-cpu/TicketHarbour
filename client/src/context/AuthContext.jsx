import React, { createContext, useContext, useState, useEffect } from 'react';
import API from '../services/api';
import toast from 'react-hot-toast';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Check current user status on mount
  useEffect(() => {
    checkUser();
  }, []);

  const checkUser = async () => {
    try {
      const res = await API.get('/auth/me');
      if (res.data.success) {
        setUser(res.data.data.user);
      }
    } catch (err) {
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  const login = async (email, password) => {
    try {
      const res = await API.post('/auth/login', { email, password });
      if (res.data.success) {
        const { user: userData, accessToken } = res.data.data;
        setUser(userData);
        if (accessToken) {
          localStorage.setItem('accessToken', accessToken);
        }
        return { success: true, user: userData };
      }
      return { success: false, message: res.data.message || 'Login error occurred.' };
    } catch (err) {
      const status = err.response?.status;
      let msg = err.response?.data?.message;

      if (!msg) {
        if (status === 401) {
          msg = 'Invalid email or password.';
        } else if (status === 403) {
          msg = 'You are not authorized to access this portal.';
        } else if (status === 422) {
          msg = 'Validation error occurred.';
        } else if (status === 500) {
          msg = 'Server error. Please try again.';
        } else if (err.code === 'ERR_NETWORK' || (typeof navigator !== 'undefined' && !navigator.onLine)) {
          msg = 'Unable to reach the server. Please check your connection.';
        } else {
          msg = 'Login error occurred.';
        }
      }

      return { success: false, message: msg, status };
    }
  };

  const register = async (userData) => {
    try {
      const res = await API.post('/auth/register', userData);
      if (res.data.success) {
        const { user: newUser, accessToken } = res.data.data;
        setUser(newUser);
        if (accessToken) {
          localStorage.setItem('accessToken', accessToken);
        }
        return { success: true, user: newUser };
      }
      return { success: false, message: res.data.message || 'Registration failed.' };
    } catch (err) {
      const msg = err.response?.data?.message || 'Registration failed.';
      return { success: false, message: msg };
    }
  };

  const logout = async () => {
    try {
      await API.post('/auth/logout');
    } catch (err) {
      // Ignore error on logout
    } finally {
      setUser(null);
      localStorage.removeItem('accessToken');
      toast.success('Logged out successfully');
    }
  };

  const updateProfile = async (data) => {
    try {
      const res = await API.put('/users/profile', data);
      if (res.data.success) {
        setUser(res.data.data.user);
        toast.success('Profile updated successfully!');
        return { success: true };
      }
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to update profile.';
      toast.error(msg);
      return { success: false, message: msg };
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        register,
        logout,
        updateProfile,
        checkUser,
        isAdmin: user?.role?.toUpperCase() === 'ADMIN' || user?.role?.toUpperCase() === 'SUPER_ADMIN',
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
