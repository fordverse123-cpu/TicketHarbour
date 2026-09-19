import React, { useState } from 'react';
import SpeederLoader from './SpeederLoader';

export default function FlipAuthCard({
  initialMode = 'login',
  onLogin,
  onRegister,
  titleLogin = 'Login',
  titleSignup = 'SignUp',
  isAdmin = false,
  isSuperAdmin = false,
}) {
  const [isChecked, setIsChecked] = useState(initialMode === 'signup');

  // Login form state
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');

  // Signup form state
  const [signupFirstName, setSignupFirstName] = useState('');
  const [signupEmail, setSignupEmail] = useState('');
  const [signupPassword, setSignupPassword] = useState('');
  const [signupConfirmPassword, setSignupConfirmPassword] = useState('');
  const [passwordError, setPasswordError] = useState('');

  // Loading state
  const [submitting, setSubmitting] = useState(false);
  const [submittingText, setSubmittingText] = useState('Authenticating...');

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setSubmittingText('Authenticating & Signing In...');
    try {
      if (onLogin) await onLogin(loginEmail, loginPassword);
    } finally {
      setSubmitting(false);
    }
  };

  const handleSignupSubmit = async (e) => {
    e.preventDefault();
    if (signupPassword !== signupConfirmPassword) {
      setPasswordError('Passwords do not match');
      return;
    }
    setPasswordError('');
    setSubmitting(true);
    setSubmittingText('Creating Your Account...');
    try {
      if (onRegister) {
        await onRegister({
          name: signupFirstName,
          email: signupEmail,
          password: signupPassword,
        });
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="styled-auth-wrapper flex items-center justify-center min-h-[480px] w-full">
      <style>{`
        .styled-auth-wrapper {
          display: flex;
          justify-content: center;
          align-items: center;
          min-height: 480px;
          width: 100%;
        }

        .styled-auth-wrapper .container {
          display: flex;
          justify-content: center;
          align-items: center;
          position: relative;
          width: 320px;
          height: 480px;
        }

        .styled-auth-wrapper .form {
          display: flex;
          justify-content: center;
          align-items: center;
          transform-style: preserve-3d;
          transition: all 1s ease;
          width: 100%;
          height: 100%;
          position: relative;
        }

        .styled-auth-wrapper .form .form_front {
          display: flex;
          flex-direction: column;
          justify-content: center;
          align-items: center;
          gap: 20px;
          position: absolute;
          width: 100%;
          min-height: 440px;
          backface-visibility: hidden;
          padding: 45px 35px;
          border-radius: 15px;
          background-color: #212121;
          box-shadow: inset 2px 2px 10px rgba(0, 0, 0, 1),
            inset -1px -1px 5px rgba(255, 255, 255, 0.6);
        }

        .styled-auth-wrapper .form .form_back {
          display: flex;
          flex-direction: column;
          justify-content: center;
          align-items: center;
          gap: 16px;
          position: absolute;
          width: 100%;
          min-height: 440px;
          backface-visibility: hidden;
          transform: rotateY(-180deg);
          padding: 45px 35px;
          border-radius: 15px;
          background-color: #212121;
          box-shadow: inset 2px 2px 10px rgba(0, 0, 0, 1),
            inset -1px -1px 5px rgba(255, 255, 255, 0.6);
        }

        .styled-auth-wrapper .form_details {
          font-size: 25px;
          font-weight: 600;
          padding-bottom: 10px;
          color: white;
        }

        .styled-auth-wrapper .input {
          width: 245px;
          min-height: 45px;
          color: #fff;
          outline: none;
          transition: 0.35s;
          padding: 0px 12px;
          background-color: #212121;
          border-radius: 6px;
          border: 2px solid #212121;
          box-shadow: 6px 6px 10px rgba(0, 0, 0, 1),
            1px 1px 10px rgba(255, 255, 255, 0.6);
        }

        .styled-auth-wrapper .input::placeholder {
          color: #999;
        }

        .styled-auth-wrapper .input:focus.input::placeholder {
          transition: 0.3s;
          opacity: 0;
        }

        .styled-auth-wrapper .input:focus {
          transform: scale(1.05);
          box-shadow: 6px 6px 10px rgba(0, 0, 0, 1),
            1px 1px 10px rgba(255, 255, 255, 0.6),
            inset 2px 2px 10px rgba(0, 0, 0, 1),
            inset -1px -1px 5px rgba(255, 255, 255, 0.6);
        }

        .styled-auth-wrapper .btn {
          padding: 10px 35px;
          cursor: pointer;
          background-color: #212121;
          border-radius: 6px;
          border: 2px solid #212121;
          box-shadow: 6px 6px 10px rgba(0, 0, 0, 1),
            1px 1px 10px rgba(255, 255, 255, 0.6);
          color: #fff;
          font-size: 15px;
          font-weight: bold;
          transition: 0.35s;
        }

        .styled-auth-wrapper .btn:hover {
          transform: scale(1.05);
          box-shadow: 6px 6px 10px rgba(0, 0, 0, 1),
            1px 1px 10px rgba(255, 255, 255, 0.6),
            inset 2px 2px 10px rgba(0, 0, 0, 1),
            inset -1px -1px 5px rgba(255, 255, 255, 0.6);
        }

        .styled-auth-wrapper .btn:focus {
          transform: scale(1.05);
          box-shadow: 6px 6px 10px rgba(0, 0, 0, 1),
            1px 1px 10px rgba(255, 255, 255, 0.6),
            inset 2px 2px 10px rgba(0, 0, 0, 1),
            inset -1px -1px 5px rgba(255, 255, 255, 0.6);
        }

        .styled-auth-wrapper .form .switch {
          font-size: 13px;
          color: white;
        }

        .styled-auth-wrapper .form .switch .signup_tog {
          font-weight: 700;
          cursor: pointer;
          text-decoration: underline;
        }

        .styled-auth-wrapper .container #signup_toggle {
          display: none;
        }

        .styled-auth-wrapper .container #signup_toggle:checked + .form {
          transform: rotateY(-180deg);
        }
      `}</style>

      <div className="container relative">
        {submitting && (
          <div className="absolute inset-0 z-50 bg-black/80 backdrop-blur-md rounded-[15px] flex items-center justify-center p-4">
            <SpeederLoader text={submittingText} color="#00ffcc" />
          </div>
        )}

        <input
          id="signup_toggle"
          type="checkbox"
          checked={isChecked}
          onChange={(e) => setIsChecked(e.target.checked)}
        />
        <div className="form">
          {/* FRONT FORM - LOGIN */}
          <form className="form_front" onSubmit={handleLoginSubmit}>
            <div className="form_details">{titleLogin}</div>

            <input
              type="text"
              className="input"
              placeholder="Username / Email"
              value={loginEmail}
              onChange={(e) => setLoginEmail(e.target.value)}
              required
            />
            <input
              type="password"
              className="input"
              placeholder="Password"
              value={loginPassword}
              onChange={(e) => setLoginPassword(e.target.value)}
              required
            />

            <button type="submit" className="btn" disabled={submitting}>
              {submitting ? 'Authenticating...' : 'Login'}
            </button>

            {!isAdmin && !isSuperAdmin && (
              <span className="switch">
                Don't have an account?{' '}
                <label htmlFor="signup_toggle" className="signup_tog">
                  Sign Up
                </label>
              </span>
            )}
          </form>

          {/* BACK FORM - SIGNUP */}
          {!isAdmin && !isSuperAdmin && (
            <form className="form_back" onSubmit={handleSignupSubmit}>
              <div className="form_details">{titleSignup}</div>

              <input
                type="text"
                className="input"
                placeholder="Firstname"
                value={signupFirstName}
                onChange={(e) => setSignupFirstName(e.target.value)}
                required
              />
              <input
                type="text"
                className="input"
                placeholder="Username / Email"
                value={signupEmail}
                onChange={(e) => setSignupEmail(e.target.value)}
                required
              />
              <input
                type="password"
                className="input"
                placeholder="Password"
                value={signupPassword}
                onChange={(e) => setSignupPassword(e.target.value)}
                required
              />
              <input
                type="password"
                className="input"
                placeholder="Confirm Password"
                value={signupConfirmPassword}
                onChange={(e) => setSignupConfirmPassword(e.target.value)}
                required
              />

              {passwordError && (
                <span className="text-red-400 text-xs font-semibold">{passwordError}</span>
              )}

              <button type="submit" className="btn" disabled={submitting}>
                {submitting ? 'Registering...' : 'Signup'}
              </button>

              <span className="switch">
                Already have an account?{' '}
                <label htmlFor="signup_toggle" className="signup_tog">
                  Sign In
                </label>
              </span>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}


