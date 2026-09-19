import React from 'react';
import { Link } from 'react-router-dom';
import { ShieldCheck, Mail, Headphones, Instagram, Twitter, Facebook, Youtube, Smartphone } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-harbour-darker/90 border-t border-white/10 mt-auto backdrop-blur-xl relative z-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          
          {/* Brand & Tagline */}
          <div className="space-y-4">
            <Link to="/" className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-gradient-to-tr from-cyanAccent-500 to-indigoAccent-600 flex items-center justify-center text-white font-black text-xl shadow-lg">
                TH
              </div>
              <span className="text-2xl font-black tracking-tight text-white">
                Ticket<span className="text-transparent bg-clip-text bg-gradient-to-r from-cyanAccent-400 to-indigoAccent-500">Harbour</span>
              </span>
            </Link>
            <p className="text-xs text-slate-400 leading-relaxed">
              Your one-stop destination for entertainment and travel bookings. Book movies, events, sports, buses, trains, flights, and attractions — all in one place.
            </p>
            <div className="flex items-center gap-2 text-xs text-cyanAccent-400 font-bold">
              <ShieldCheck className="w-4 h-4" /> 100% Verified Secure Booking
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-xs font-black uppercase tracking-wider text-white mb-4">
              Quick Links
            </h3>
            <ul className="space-y-2.5 text-xs font-medium text-slate-300">
              <li><Link to="/about" className="hover:text-cyanAccent-400 transition-colors">About Us</Link></li>
              <li><Link to="/contact" className="hover:text-cyanAccent-400 transition-colors">Contact Support</Link></li>
              <li><Link to="/terms" className="hover:text-cyanAccent-400 transition-colors">Terms of Service</Link></li>
              <li><Link to="/privacy" className="hover:text-cyanAccent-400 transition-colors">Privacy Policy</Link></li>
              <li><Link to="/help" className="hover:text-cyanAccent-400 transition-colors">Help Center & FAQ</Link></li>
            </ul>
          </div>

          {/* Booking Categories */}
          <div>
            <h3 className="text-xs font-black uppercase tracking-wider text-white mb-4">
              Booking Categories
            </h3>
            <ul className="space-y-2.5 text-xs font-medium text-slate-300">
              <li><Link to="/listings?category=movies" className="hover:text-cyanAccent-400 transition-colors">🎬 Movies</Link></li>
              <li><Link to="/listings?category=events" className="hover:text-cyanAccent-400 transition-colors">🎵 Events & Concerts</Link></li>
              <li><Link to="/listings?category=sports" className="hover:text-cyanAccent-400 transition-colors">🏆 Sports Matches</Link></li>
              <li><Link to="/buses" className="hover:text-cyanAccent-400 transition-colors">🚌 Intercity Bus</Link></li>
              <li><Link to="/trains" className="hover:text-cyanAccent-400 transition-colors">🚆 Express Trains</Link></li>
              <li><Link to="/flights" className="hover:text-cyanAccent-400 transition-colors">✈️ Flights</Link></li>
              <li><Link to="/listings?category=attractions" className="hover:text-cyanAccent-400 transition-colors">🎟️ Attractions</Link></li>
            </ul>
          </div>

          {/* Follow Us & Mobile Apps */}
          <div className="space-y-4">
            <h3 className="text-xs font-black uppercase tracking-wider text-white">
              Connect & Mobile App
            </h3>
            <p className="text-xs text-slate-400">Follow us on social media for exclusive discounts and ticket drops.</p>
            <div className="flex items-center gap-3">
              <a href="#instagram" className="p-2.5 rounded-xl bg-white/5 hover:bg-cyanAccent-500/20 text-slate-300 hover:text-cyanAccent-400 transition-colors border border-white/10">
                <Instagram className="w-4 h-4" />
              </a>
              <a href="#twitter" className="p-2.5 rounded-xl bg-white/5 hover:bg-cyanAccent-500/20 text-slate-300 hover:text-cyanAccent-400 transition-colors border border-white/10">
                <Twitter className="w-4 h-4" />
              </a>
              <a href="#facebook" className="p-2.5 rounded-xl bg-white/5 hover:bg-cyanAccent-500/20 text-slate-300 hover:text-cyanAccent-400 transition-colors border border-white/10">
                <Facebook className="w-4 h-4" />
              </a>
              <a href="#youtube" className="p-2.5 rounded-xl bg-white/5 hover:bg-cyanAccent-500/20 text-slate-300 hover:text-cyanAccent-400 transition-colors border border-white/10">
                <Youtube className="w-4 h-4" />
              </a>
            </div>

            <div className="pt-2 space-y-2">
              <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Download TicketHarbour App</p>
              <div className="flex gap-2">
                <button className="flex items-center gap-2 px-3 py-2 bg-white/10 hover:bg-white/15 border border-white/10 rounded-xl text-xs font-bold text-white transition-all">
                  <Smartphone className="w-4 h-4 text-cyanAccent-400" /> App Store
                </button>
                <button className="flex items-center gap-2 px-3 py-2 bg-white/10 hover:bg-white/15 border border-white/10 rounded-xl text-xs font-bold text-white transition-all">
                  <Smartphone className="w-4 h-4 text-indigoAccent-500" /> Google Play
                </button>
              </div>
            </div>
          </div>

        </div>

        <div className="border-t border-white/10 mt-12 pt-6 text-center text-xs text-slate-400 font-medium">
          <p>© 2026 TicketHarbour. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}

