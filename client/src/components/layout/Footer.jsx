import React from 'react';
import { Link } from 'react-router-dom';
import { Ticket, Mail, ShieldCheck, Headphones } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-slate-900 text-slate-400 text-sm border-t border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          
          {/* Brand Info */}
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="h-9 w-9 rounded-xl bg-gradient-to-tr from-teal-500 to-indigo-600 flex items-center justify-center text-white font-bold text-lg shadow-md">
                TH
              </div>
              <span className="text-xl font-black tracking-tight text-white">
                Ticket<span className="text-teal-400">Harbor</span>
              </span>
            </div>
            <p className="text-xs leading-relaxed text-slate-400">
              The premier all-in-one ticket reservation platform for movies, live concerts, stadium sports, buses, express trains, flights, and amusement parks.
            </p>
            <div className="flex items-center gap-3 pt-2 text-xs text-teal-400">
              <ShieldCheck className="w-4 h-4" /> 100% Verified Secure Booking
            </div>
          </div>

          {/* Quick Category Links */}
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-200 mb-4">Categories</h3>
            <ul className="space-y-2 text-xs">
              <li><Link to="/listings?category=movie" className="hover:text-teal-400 transition-colors">Movies & IMAX</Link></li>
              <li><Link to="/listings?category=event" className="hover:text-teal-400 transition-colors">Concerts & Festivals</Link></li>
              <li><Link to="/listings?category=sports" className="hover:text-teal-400 transition-colors">Sports & Stadiums</Link></li>
              <li><Link to="/listings?category=bus" className="hover:text-teal-400 transition-colors">Intercity Bus Sleepers</Link></li>
              <li><Link to="/listings?category=train" className="hover:text-teal-400 transition-colors">Train Reservations</Link></li>
              <li><Link to="/listings?category=flight" className="hover:text-teal-400 transition-colors">Domestic & Int. Flights</Link></li>
              <li><Link to="/listings?category=attraction" className="hover:text-teal-400 transition-colors">Amusement Parks & Passes</Link></li>
            </ul>
          </div>

          {/* User Links */}
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-200 mb-4">Account & Support</h3>
            <ul className="space-y-2 text-xs">
              <li><Link to="/my-bookings" className="hover:text-teal-400 transition-colors">My Bookings</Link></li>
              <li><Link to="/wishlist" className="hover:text-teal-400 transition-colors">My Favorites</Link></li>
              <li><Link to="/profile" className="hover:text-teal-400 transition-colors">Profile Settings</Link></li>
              <li><a href="#help" className="hover:text-teal-400 transition-colors">Help Center & FAQ</a></li>
              <li><a href="#terms" className="hover:text-teal-400 transition-colors">Terms of Service</a></li>
              <li><a href="#privacy" className="hover:text-teal-400 transition-colors">Privacy Policy</a></li>
            </ul>
          </div>

          {/* Contact & Newsletter */}
          <div className="space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-200 mb-2">Customer Care</h3>
            <p className="text-xs text-slate-400 flex items-center gap-2">
              <Headphones className="w-4 h-4 text-teal-400" /> 24/7 Dedicated Support Line
            </p>
            <p className="text-xs text-slate-400 flex items-center gap-2">
              <Mail className="w-4 h-4 text-teal-400" /> support@ticketharbor.com
            </p>

            <div className="pt-2">
              <p className="text-xs font-semibold text-slate-300 mb-2">Subscribe to Exclusive Ticket Deals</p>
              <div className="flex gap-2">
                <input
                  type="email"
                  placeholder="Enter email"
                  className="px-3 py-1.5 text-xs bg-slate-800 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-teal-500 w-full"
                />
                <button className="px-3 py-1.5 text-xs font-bold bg-teal-500 text-white rounded-lg hover:bg-teal-600 transition-colors">
                  Join
                </button>
              </div>
            </div>
          </div>

        </div>

        <div className="border-t border-slate-800 mt-12 pt-6 text-center text-xs text-slate-500">
          <p>© {new Date().getFullYear()} TicketHarbor. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
