import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  Film,
  Calendar,
  Trophy,
  Bus,
  Train,
  Plane,
  Ticket,
  Search,
  User,
  Heart,
  LogOut,
  ShieldAlert,
  Menu,
} from 'lucide-react';
import MobileMenu from './MobileMenu';

const CATEGORIES = [
  { label: 'Movies', path: '/listings?category=movies', icon: Film },
  { label: 'Events', path: '/listings?category=events', icon: Calendar },
  { label: 'Sports', path: '/listings?category=sports', icon: Trophy },
  { label: 'Bus', path: '/buses', icon: Bus },
  { label: 'Train', path: '/trains', icon: Train },
  { label: 'Flights', path: '/flights', icon: Plane },
  { label: 'Attractions', path: '/listings?category=attractions', icon: Ticket },
];

export default function Navbar() {
  const { user, logout, isAdmin } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/listings?search=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  return (
    <>
      <header className="sticky top-0 z-40 bg-harbour-darker/90 backdrop-blur-xl border-b border-white/10 shadow-2xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Top Row: Logo, Global Search, Auth Controls */}
          <div className="flex items-center justify-between h-18 py-3 gap-4">
            
            {/* Logo */}
            <Link to="/" className="flex items-center gap-3 group">
              <div className="h-10 w-10 rounded-xl bg-gradient-to-tr from-cyanAccent-500 to-indigoAccent-600 flex items-center justify-center text-white font-black text-xl shadow-lg group-hover:scale-105 transition-transform">
                TH
              </div>
              <span className="text-2xl font-black tracking-tight text-white">
                Ticket<span className="text-transparent bg-clip-text bg-gradient-to-r from-cyanAccent-400 to-indigoAccent-500">Harbour</span>
              </span>
            </Link>

            {/* Global Search Bar */}
            <form onSubmit={handleSearchSubmit} className="hidden md:flex flex-1 max-w-md relative">
              <input
                type="text"
                placeholder="Search movies, concerts, buses, flights..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 text-xs lg:text-sm bg-harbour-dark/80 border border-white/15 rounded-full text-white placeholder-slate-400 focus:outline-none focus:border-cyanAccent-500 focus:ring-2 focus:ring-cyanAccent-500/20 transition-all shadow-inner"
              />
              <Search className="w-4 h-4 text-cyanAccent-400 absolute left-3.5 top-3 pointer-events-none" />
            </form>

            {/* Right Side Actions */}
            <div className="flex items-center gap-3">
              {user ? (
                <div className="relative">
                  <button
                    onClick={() => setDropdownOpen(!dropdownOpen)}
                    className="flex items-center gap-2 p-1.5 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 transition-colors"
                  >
                    <div className="h-8 w-8 rounded-full bg-gradient-to-tr from-cyanAccent-500 to-indigoAccent-600 text-white flex items-center justify-center font-black text-sm shadow-md">
                      {user.name?.charAt(0).toUpperCase() || 'U'}
                    </div>
                    <span className="hidden sm:inline font-bold text-xs text-white pr-2">
                      {user.name?.split(' ')[0]}
                    </span>
                  </button>

                  {/* Dropdown Menu */}
                  {dropdownOpen && (
                    <div
                      onMouseLeave={() => setDropdownOpen(false)}
                      className="absolute right-0 mt-2 w-56 bg-harbour-card border border-white/15 rounded-2xl shadow-2xl py-2 z-50 divide-y divide-white/10 backdrop-blur-2xl"
                    >
                      <div className="px-4 py-3">
                        <p className="text-sm font-bold text-white">{user.name}</p>
                        <p className="text-xs text-slate-400 truncate">{user.email}</p>
                      </div>

                      <div className="py-1">
                        {isAdmin && (
                          <Link
                            to="/admin"
                            onClick={() => setDropdownOpen(false)}
                            className="flex items-center gap-2.5 px-4 py-2 text-xs font-bold text-cyanAccent-400 hover:bg-white/5"
                          >
                            <ShieldAlert className="w-4 h-4" /> Admin Dashboard
                          </Link>
                        )}
                        <Link
                          to="/my-bookings"
                          onClick={() => setDropdownOpen(false)}
                          className="flex items-center gap-2.5 px-4 py-2 text-xs font-semibold text-slate-200 hover:bg-white/5"
                        >
                          <Ticket className="w-4 h-4 text-cyanAccent-400" /> My Bookings
                        </Link>
                        <Link
                          to="/wishlist"
                          onClick={() => setDropdownOpen(false)}
                          className="flex items-center gap-2.5 px-4 py-2 text-xs font-semibold text-slate-200 hover:bg-white/5"
                        >
                          <Heart className="w-4 h-4 text-rose-400" /> Wishlist
                        </Link>
                        <Link
                          to="/profile"
                          onClick={() => setDropdownOpen(false)}
                          className="flex items-center gap-2.5 px-4 py-2 text-xs font-semibold text-slate-200 hover:bg-white/5"
                        >
                          <User className="w-4 h-4 text-indigoAccent-500" /> Profile Settings
                        </Link>
                      </div>

                      <div className="py-1">
                        <button
                          onClick={() => {
                            setDropdownOpen(false);
                            logout();
                            navigate('/');
                          }}
                          className="w-full flex items-center gap-2.5 px-4 py-2 text-xs font-bold text-rose-400 hover:bg-rose-500/10"
                        >
                          <LogOut className="w-4 h-4" /> Sign Out
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <Link
                    to="/login"
                    className="px-4 py-2 text-xs font-bold text-slate-300 hover:text-white transition-colors"
                  >
                    Login
                  </Link>
                  <Link
                    to="/register"
                    className="px-4 py-2 text-xs font-bold text-white bg-gradient-to-r from-cyanAccent-500 to-indigoAccent-600 rounded-xl shadow-lg hover:shadow-cyanAccent-500/20 hover:-translate-y-0.5 transition-all"
                  >
                    Register
                  </Link>
                </div>
              )}

              {/* Mobile Drawer Trigger */}
              <button
                onClick={() => setMobileMenuOpen(true)}
                className="lg:hidden p-2.5 text-slate-300 hover:text-white bg-white/5 rounded-xl border border-white/10"
              >
                <Menu className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Second Navigation Ribbon */}
          <nav className="hidden lg:flex items-center justify-between border-t border-white/10 py-2.5">
            <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none">
              {CATEGORIES.map((cat) => {
                const Icon = cat.icon;
                const isActive =
                  location.pathname === cat.path ||
                  (cat.path.includes('?') && location.search.includes(cat.path.split('?')[1]));
                return (
                  <Link
                    key={cat.label}
                    to={cat.path}
                    className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                      isActive
                        ? 'bg-gradient-to-r from-cyanAccent-500 to-indigoAccent-600 text-white shadow-lg shadow-cyanAccent-500/20 scale-105'
                        : 'text-slate-300 hover:text-white hover:bg-white/5'
                    }`}
                  >
                    <Icon className="w-3.5 h-3.5" />
                    {cat.label}
                  </Link>
                );
              })}
            </div>
          </nav>
        </div>
      </header>

      {/* Responsive Mobile Drawer */}
      <MobileMenu isOpen={mobileMenuOpen} onClose={() => setMobileMenuOpen(false)} />
    </>
  );
}

