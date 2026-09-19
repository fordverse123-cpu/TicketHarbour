import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { X, Film, Calendar, Trophy, Bus, Train, Plane, Ticket, LogIn, UserPlus, LogOut, User } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export default function MobileMenu({ isOpen, onClose }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  if (!isOpen) return null;

  const categories = [
    { label: 'Movies', path: '/listings?category=movies', icon: Film },
    { label: 'Events', path: '/listings?category=events', icon: Calendar },
    { label: 'Sports', path: '/listings?category=sports', icon: Trophy },
    { label: 'Bus', path: '/buses', icon: Bus },
    { label: 'Train', path: '/trains', icon: Train },
    { label: 'Flights', path: '/flights', icon: Plane },
    { label: 'Attractions', path: '/listings?category=attractions', icon: Ticket },
  ];

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-xl flex flex-col p-6 animate-fadeIn lg:hidden">
      {/* Header bar */}
      <div className="flex items-center justify-between pb-6 border-b border-white/10">
        <Link to="/" onClick={onClose} className="flex items-center gap-2">
          <div className="h-10 w-10 rounded-xl bg-gradient-to-tr from-cyanAccent-500 to-indigoAccent-600 flex items-center justify-center text-white font-black text-lg shadow-lg">
            TH
          </div>
          <span className="text-xl font-black tracking-tight text-white">TicketHarbour</span>
        </Link>
        <button
          onClick={onClose}
          className="p-2 rounded-xl bg-white/10 text-slate-300 hover:text-white"
        >
          <X className="w-6 h-6" />
        </button>
      </div>

      {/* Categories Links */}
      <div className="flex-1 overflow-y-auto py-6 space-y-2">
        <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
          Booking Categories
        </p>
        {categories.map((cat) => {
          const Icon = cat.icon;
          return (
            <Link
              key={cat.label}
              to={cat.path}
              onClick={onClose}
              className="flex items-center gap-3 px-4 py-3 rounded-xl bg-white/5 hover:bg-white/10 text-white font-bold transition-all"
            >
              <Icon className="w-5 h-5 text-cyanAccent-400" />
              <span>{cat.label}</span>
            </Link>
          );
        })}
      </div>

      {/* Auth Actions */}
      <div className="pt-6 border-t border-white/10 space-y-3">
        {user ? (
          <>
            <div className="flex items-center gap-3 px-4 py-2">
              <User className="w-5 h-5 text-cyanAccent-400" />
              <div>
                <p className="text-sm font-bold text-white">{user.name}</p>
                <p className="text-xs text-slate-400">{user.email}</p>
              </div>
            </div>
            <Link
              to="/my-bookings"
              onClick={onClose}
              className="block w-full py-3 text-center bg-white/10 hover:bg-white/15 text-white font-bold rounded-xl text-sm"
            >
              My Bookings
            </Link>
            <button
              onClick={() => {
                logout();
                onClose();
                navigate('/login');
              }}
              className="flex items-center justify-center gap-2 w-full py-3 bg-rose-600/80 hover:bg-rose-600 text-white font-bold rounded-xl text-sm"
            >
              <LogOut className="w-4 h-4" />
              Sign Out
            </button>
          </>
        ) : (
          <div className="grid grid-cols-2 gap-3">
            <Link
              to="/login"
              onClick={onClose}
              className="flex items-center justify-center gap-2 py-3 bg-white/10 hover:bg-white/15 text-white font-bold rounded-xl text-sm"
            >
              <LogIn className="w-4 h-4" />
              Login
            </Link>
            <Link
              to="/register"
              onClick={onClose}
              className="flex items-center justify-center gap-2 py-3 bg-gradient-to-r from-cyanAccent-500 to-indigoAccent-600 text-white font-bold rounded-xl text-sm shadow-lg"
            >
              <UserPlus className="w-4 h-4" />
              Register
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
