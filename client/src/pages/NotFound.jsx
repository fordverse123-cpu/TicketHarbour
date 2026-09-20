import React from 'react';
import { Link } from 'react-router-dom';
import GlassCard from '../components/ui/GlassCard';
import GlassButton from '../components/ui/GlassButton';
import { Ticket, Home, Search } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="min-h-[70vh] flex items-center justify-center p-4">
      <GlassCard className="text-center p-8 sm:p-14 space-y-6 max-w-lg w-full border border-white/10 shadow-2xl relative overflow-hidden">
        <div className="absolute -top-12 -right-12 w-40 h-40 bg-[#03B3C3]/10 rounded-full blur-2xl pointer-events-none" />
        <div className="absolute -bottom-12 -left-12 w-40 h-40 bg-[#6750A2]/15 rounded-full blur-2xl pointer-events-none" />

        <div className="relative z-10 space-y-6">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-3xl bg-gradient-to-tr from-[#03B3C3]/20 to-[#6750A2]/30 border border-[#03B3C3]/30 text-[#03B3C3] shadow-lg">
            <Ticket className="w-10 h-10 rotate-45" />
          </div>

          <div className="space-y-2">
            <span className="text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-[#03B3C3] to-[#6750A2]">
              404
            </span>
            <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
              Looks like this ticket got lost.
            </h1>
            <p className="text-xs sm:text-sm text-slate-400 max-w-sm mx-auto leading-relaxed">
              The page or ticket listing you are looking for might have been moved, renamed, or no longer exists.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-4">
            <Link to="/" className="w-full sm:w-auto">
              <GlassButton variant="gradient" className="w-full" icon={Home}>
                Go Home
              </GlassButton>
            </Link>
            <Link to="/listings" className="w-full sm:w-auto">
              <GlassButton variant="secondary" className="w-full" icon={Search}>
                Browse Tickets
              </GlassButton>
            </Link>
          </div>
        </div>
      </GlassCard>
    </div>
  );
}
