import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Search, User, Heart, LogOut, ShieldAlert, Menu, Ticket } from 'lucide-react';
import MobileMenu from './MobileMenu';
import CategoryNav from '../navigation/CategoryNav';

export default function Navbar() {
  const { user, logout, isAdmin } = useAuth();
  const navigate = useNavigate();
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
      <header className="sticky top-0 z-40 bg-[#050505]/95 backdrop-blur-xl border-b border-white/10 shadow-2xl transition-colors duration-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Top Row: Logo, Global Search, Auth Controls */}
          <div className="flex items-center justify-between h-16 sm:h-18 py-3 gap-3 md:gap-6">
            
            {/* Logo */}
            <Link to="/" className="flex items-center gap-2.5 shrink-0 group">
              <div className="h-9 w-9 rounded-xl bg-gradient-to-tr from-[#03B3C3] to-[#6750A2] flex items-center justify-center text-white font-black text-lg shadow-lg group-hover:scale-105 transition-transform">
                TH
              </div>
              <span className="text-xl sm:text-2xl font-black tracking-tight text-white">
                Ticket<span className="text-[#03B3C3]">Harbour</span>
              </span>
            </Link>

            {/* Global Search Bar (Desktop & Tablet) */}
            <form onSubmit={handleSearchSubmit} className="hidden md:flex flex-1 max-w-md relative">
              <input
                type="text"
                placeholder="Search movies, concerts, buses, flights..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 text-xs lg:text-sm bg-[#111111] border border-white/10 rounded-full text-white placeholder-[#9CA3AF] focus:outline-none focus:border-[#03B3C3] focus:ring-2 focus:ring-[#03B3C3]/20 transition-all shadow-inner"
              />
              <Search className="w-4 h-4 text-[#03B3C3] absolute left-3.5 top-2.5 pointer-events-none" />
            </form>

            {/* Right Side Actions */}
            <div className="flex items-center gap-2 sm:gap-3 shrink-0">
              {user ? (
                <div className="relative">
                  <button
                    onClick={() => setDropdownOpen(!dropdownOpen)}
                    className="flex items-center gap-2 p-1.5 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 transition-colors cursor-pointer"
                  >
                    <div className="h-8 w-8 rounded-full bg-gradient-to-tr from-[#03B3C3] to-[#6750A2] text-white flex items-center justify-center font-black text-sm shadow-md">
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
                      className="absolute right-0 mt-2 w-56 bg-[#151515] border border-white/10 rounded-2xl shadow-2xl py-2 z-50 divide-y divide-white/10 backdrop-blur-2xl"
                    >
                      <div className="px-4 py-3">
                        <p className="text-sm font-bold text-white">{user.name}</p>
                        <p className="text-xs text-[#B8B8B8] truncate">{user.email}</p>
                      </div>

                      <div className="py-1">
                        {isAdmin && (
                          <Link
                            to="/admin"
                            onClick={() => setDropdownOpen(false)}
                            className="flex items-center gap-2.5 px-4 py-2 text-xs font-bold text-[#19D3D3] hover:bg-white/5"
                          >
                            <ShieldAlert className="w-4 h-4" /> Admin Dashboard
                          </Link>
                        )}
                        <Link
                          to="/my-bookings"
                          onClick={() => setDropdownOpen(false)}
                          className="flex items-center gap-2.5 px-4 py-2 text-xs font-semibold text-[#B8B8B8] hover:text-white hover:bg-white/5"
                        >
                          <Ticket className="w-4 h-4 text-[#19D3D3]" /> My Bookings
                        </Link>
                        <Link
                          to="/wishlist"
                          onClick={() => setDropdownOpen(false)}
                          className="flex items-center gap-2.5 px-4 py-2 text-xs font-semibold text-[#B8B8B8] hover:text-white hover:bg-white/5"
                        >
                          <Heart className="w-4 h-4 text-rose-400" /> Wishlist
                        </Link>
                        <Link
                          to="/profile"
                          onClick={() => setDropdownOpen(false)}
                          className="flex items-center gap-2.5 px-4 py-2 text-xs font-semibold text-[#B8B8B8] hover:text-white hover:bg-white/5"
                        >
                          <User className="w-4 h-4 text-[#4F46E5]" /> Profile Settings
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
                    className="px-3.5 py-1.5 text-xs font-bold text-white hover:text-[#03B3C3] transition-colors"
                  >
                    Login
                  </Link>
                  <Link
                    to="/register"
                    className="px-4 py-1.5 text-xs font-bold text-white bg-gradient-to-r from-[#03B3C3] to-[#6750A2] rounded-xl shadow-lg hover:shadow-[#03B3C3]/25 hover:-translate-y-0.5 transition-all"
                  >
                    Register
                  </Link>
                </div>
              )}

              {/* Mobile Drawer Trigger */}
              <button
                onClick={() => setMobileMenuOpen(true)}
                className="lg:hidden p-2 text-[#B8B8B8] hover:text-white bg-white/5 rounded-xl border border-white/10"
              >
                <Menu className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Signature Second Row: CategoryNav with GooeyNav */}
          <div className="border-t border-white/10 py-2">
            <CategoryNav />
          </div>
        </div>
      </header>

      {/* Responsive Mobile Drawer */}
      <MobileMenu isOpen={mobileMenuOpen} onClose={() => setMobileMenuOpen(false)} />
    </>
  );
}


