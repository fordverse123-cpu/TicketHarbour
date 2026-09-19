import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import FlipAuthCard from '../components/common/FlipAuthCard';

export default function Register() {
  const { login, register } = useAuth();
  const navigate = useNavigate();

  const handleLogin = async (email, password) => {
    const result = await login(email, password);
    if (result?.success) {
      navigate('/');
    }
  };

  const handleRegister = async (data) => {
    const result = await register(data);
    if (result?.success) {
      navigate('/');
    }
  };

  return (
    <div className="flex items-center justify-center min-h-[75vh] py-8">
      <FlipAuthCard
        initialMode="signup"
        onLogin={handleLogin}
        onRegister={handleRegister}
        titleLogin="Login"
        titleSignup="SignUp"
      />
    </div>
  );
}

