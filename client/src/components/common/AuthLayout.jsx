import React from 'react';
import { Link } from 'react-router-dom';
import SpotlightCard from '../SpotlightCard';

export default function AuthLayout({
  title = 'Welcome to TicketHarbour',
  subtitle = 'Sign in to access your account',
  badge = null,
  children,
  footerText = null,
  footerLinkText = null,
  footerLinkTo = null,
}) {
  return (
    <div className="min-h-[calc(100dvh-120px)] w-full flex items-center justify-center py-8 px-4">
      <div className="w-full max-w-[480px]">
        <SpotlightCard
          showOnFocus={false}
          className="w-full bg-[#111111] border border-white/10 rounded-3xl p-6 sm:p-10 shadow-[0_20px_60px_rgba(0,0,0,0.45)] relative z-10"
          contentClassName="space-y-6"
        >
          {/* Header Branding */}
          <div className="text-center space-y-3">
            <Link to="/" className="inline-flex items-center gap-2.5">
              <div className="h-10 w-10 rounded-xl bg-gradient-to-tr from-[#03B3C3] to-[#6750A2] flex items-center justify-center text-white font-black text-xl shadow-lg">
                TH
              </div>
              <span className="text-2xl font-black tracking-tight text-white">
                Ticket<span className="text-[#03B3C3]">Harbour</span>
              </span>
            </Link>

            {badge && (
              <div className="flex justify-center">
                <span className="px-3 py-1 bg-[#03B3C3]/15 text-[#03B3C3] border border-[#03B3C3]/30 rounded-xl text-[10px] font-black uppercase tracking-wider">
                  {badge}
                </span>
              </div>
            )}

            <div>
              <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight">
                {title}
              </h1>
              <p className="text-xs text-[#9CA3AF] mt-1">{subtitle}</p>
            </div>
          </div>

          {/* Main Form & Body */}
          {children}

          {/* Optional Card Footer Link */}
          {footerText && footerLinkText && footerLinkTo && (
            <div className="text-center pt-3 text-xs text-[#9CA3AF] border-t border-white/10">
              {footerText}{' '}
              <Link to={footerLinkTo} className="text-[#03B3C3] font-bold hover:underline ml-1">
                {footerLinkText}
              </Link>
            </div>
          )}
        </SpotlightCard>
      </div>
    </div>
  );
}
