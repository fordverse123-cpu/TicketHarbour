import React from 'react';
import GlassCard from '../ui/GlassCard';
import GlassButton from '../ui/GlassButton';
import { AlertTriangle, Lock, ShieldAlert, RefreshCw, Home, LogIn } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';

const ERROR_CONFIGS = {
  401: {
    title: 'Session Expired',
    message: 'Your authentication session has expired. Please log in again to access your ticket account.',
    icon: Lock,
    actionType: 'LOGIN',
  },
  403: {
    title: 'Access Restricted',
    message: 'You do not have administrative permission to view this portal.',
    icon: ShieldAlert,
    actionType: 'HOME',
  },
  404: {
    title: 'Resource Not Found',
    message: 'The ticket listing or page you requested could not be located.',
    icon: AlertTriangle,
    actionType: 'HOME',
  },
  500: {
    title: 'TicketHarbour System Error',
    message: 'An internal server issue occurred. Our engineering team has been notified.',
    icon: AlertTriangle,
    actionType: 'RETRY',
  },
  NETWORK: {
    title: 'Connection Issue',
    message: 'Unable to reach TicketHarbour API servers. Please check your internet connection.',
    icon: AlertTriangle,
    actionType: 'RETRY',
  },
};

export default function ErrorState({
  code = 500,
  title,
  message,
  onRetry,
  className = '',
}) {
  const navigate = useNavigate();
  const config = ERROR_CONFIGS[code] || ERROR_CONFIGS[500];

  const displayTitle = title || config.title;
  const displayMessage = message || config.message;
  const Icon = config.icon;

  return (
    <GlassCard className={`text-center py-16 px-6 space-y-5 max-w-md mx-auto ${className}`}>
      <div className="w-16 h-16 rounded-full bg-rose-500/10 text-rose-400 border border-rose-500/20 flex items-center justify-center mx-auto shadow-inner">
        <Icon className="w-8 h-8" />
      </div>

      <div className="space-y-1.5">
        <h3 className="text-xl font-black text-white">{displayTitle}</h3>
        <p className="text-xs text-slate-400 max-w-sm mx-auto leading-relaxed">{displayMessage}</p>
      </div>

      <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
        {config.actionType === 'LOGIN' && (
          <Link to="/login">
            <GlassButton variant="gradient" size="sm" icon={LogIn}>
              Log In Now
            </GlassButton>
          </Link>
        )}

        {config.actionType === 'HOME' && (
          <Link to="/">
            <GlassButton variant="secondary" size="sm" icon={Home}>
              Go to Homepage
            </GlassButton>
          </Link>
        )}

        {onRetry && (
          <GlassButton variant="gradient" size="sm" icon={RefreshCw} onClick={onRetry}>
            Try Again
          </GlassButton>
        )}

        <GlassButton variant="secondary" size="sm" onClick={() => navigate(-1)}>
          Go Back
        </GlassButton>
      </div>
    </GlassCard>
  );
}
