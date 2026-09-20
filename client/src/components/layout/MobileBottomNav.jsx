import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Home, Search, Ticket, Heart, User } from 'lucide-react';

export default function MobileBottomNav() {
  const { user } = useAuth();
  const location = useLocation();

  // Hide on admin routes or if user is logged out
  if (!user || location.pathname.startsWith('/admin') || location.pathname.startsWith('/super-admin')) {
    return null;
  }

  const navItems = [
    { label: 'Home', path: '/', icon: Home },
    { label: 'Search', path: '/listings', icon: Search },
    { label: 'Bookings', path: '/my-bookings', icon: Ticket },
    { label: 'Wishlist', path: '/wishlist', icon: Heart },
    { label: 'Profile', path: '/profile', icon: User },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-[#050505]/95 backdrop-blur-xl border-t border-white/10 py-2 px-3 lg:hidden shadow-2xl">
      <div className="flex items-center justify-around max-w-md mx-auto">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.path || (item.path !== '/' && location.pathname.startsWith(item.path));

          return (
            <NavLink
              key={item.label}
              to={item.path}
              className={({ isActive: linkActive }) =>
                `flex flex-col items-center justify-center gap-1 min-w-[56px] py-1 px-2 rounded-xl transition-all cursor-pointer ${
                  linkActive || isActive
                    ? 'text-[#03B3C3] font-black'
                    : 'text-slate-400 hover:text-white font-medium'
                }`
              }
            >
              <Icon className={`w-5 h-5 ${isActive ? 'scale-110 text-[#03B3C3]' : ''}`} />
              <span className="text-[10px] tracking-tight">{item.label}</span>
            </NavLink>
          );
        })}
      </div>
    </nav>
  );
}
