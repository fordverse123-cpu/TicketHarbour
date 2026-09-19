import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import FlipAuthCard from '../components/common/FlipAuthCard';

export default function Login() {
  const { login, register } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogin = async (email, password) => {
    const result = await login(email, password);
    if (result?.success) {
      const from = location.state?.from?.pathname || '/';
      navigate(from, { replace: true });
    }
  };

  const handleRegister = async (data) => {
    const result = await register(data);
    if (result?.success) {
      navigate('/');
    }
  };

  return (
    <div className="max-w-md mx-auto py-8">
      <FlipAuthCard
        initialMode="login"
        onLogin={handleLogin}
        onRegister={handleRegister}
        titleLogin="Login"
        titleSignup="SignUp"
      />
    </div>
  );
}
