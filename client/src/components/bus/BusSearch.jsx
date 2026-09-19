import React, { useState } from 'react';
import { ArrowLeftRight, Calendar, Search, Bus, MapPin, Sparkles, Star } from 'lucide-react';

const POPULAR_BUS_CITIES = [
  'Mumbai',
  'Goa',
  'Bengaluru',
  'Hyderabad',
  'Delhi',
  'Jaipur',
  'Chennai',
  'Pune',
  'Ahmedabad',
];

const POPULAR_BUS_ROUTES = [
  { from: 'Mumbai', to: 'Goa' },
  { from: 'Bengaluru', to: 'Hyderabad' },
  { from: 'Delhi', to: 'Jaipur' },
  { from: 'Chennai', to: 'Bengaluru' },
];

export default function BusSearch({ onSearch, initialFrom = 'Mumbai', initialTo = 'Goa' }) {
  const [fromCity, setFromCity] = useState(initialFrom);
  const [toCity, setToCity] = useState(initialTo);
  const [travelDate, setTravelDate] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() + 1);
    return d.toISOString().split('T')[0];
  });

  const handleSwap = () => {
    const temp = fromCity;
    setFromCity(toCity);
    setToCity(temp);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (onSearch) {
      onSearch({ from: fromCity, to: toCity, date: travelDate });
    }
  };

  const handleSelectRoutePill = (from, to) => {
    setFromCity(from);
    setToCity(to);
  };

  return (
    <div className="bg-white dark:bg-slate-800 rounded-3xl border border-slate-200 dark:border-slate-700 shadow-xl overflow-hidden">
      {/* Header bar inspired by redBus patterns */}
      <div className="bg-gradient-to-r from-red-600 via-rose-600 to-orange-600 text-white px-6 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-md">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-white text-red-600 rounded-2xl shadow-sm">
            <Bus className="w-6 h-6" />
          </div>
          <div>
            <h2 className="font-black text-lg tracking-wide flex items-center gap-2">
              Intercity Bus Ticket Booking
            </h2>
            <p className="text-xs text-red-100">
              redBus-Inspired Modern Bus Reservation • Instant Seat Lock
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 text-xs font-bold text-red-100">
          <span className="px-3 py-1 bg-white/20 rounded-full flex items-center gap-1 border border-white/20">
            <Star className="w-3.5 h-3.5 fill-amber-300 text-amber-300" /> Verified Bus Operators
          </span>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="p-6 space-y-6">
        {/* Popular Routes Quick Pills */}
        <div className="space-y-2">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
            Popular Bus Routes
          </span>
          <div className="flex flex-wrap gap-2">
            {POPULAR_BUS_ROUTES.map((rt, idx) => (
              <button
                type="button"
                key={idx}
                onClick={() => handleSelectRoutePill(rt.from, rt.to)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all border ${
                  fromCity === rt.from && toCity === rt.to
                    ? 'bg-red-500 text-white border-red-500 shadow-md'
                    : 'bg-slate-50 dark:bg-slate-700 text-slate-700 dark:text-slate-200 border-slate-200 dark:border-slate-600 hover:bg-red-50 hover:text-red-600'
                }`}
              >
                {rt.from} → {rt.to}
              </button>
            ))}
          </div>
        </div>

        {/* From / To & Swap Bar */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
          {/* From Location */}
          <div className="md:col-span-5 space-y-1">
            <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              From Location
            </label>
            <div className="relative">
              <MapPin className="w-5 h-5 text-red-500 absolute left-3.5 top-3.5" />
              <select
                value={fromCity}
                onChange={(e) => setFromCity(e.target.value)}
                className="w-full pl-10 pr-4 py-3.5 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-2xl text-sm font-black dark:text-white focus:outline-none focus:ring-2 focus:ring-red-500"
              >
                {POPULAR_BUS_CITIES.map((c) => (
                  <option key={c} value={c}>
                    {c} (Bus Terminal)
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Swap Button */}
          <div className="md:col-span-2 flex justify-center py-1 md:py-0">
            <button
              type="button"
              onClick={handleSwap}
              className="p-3.5 bg-red-50 dark:bg-slate-700 hover:bg-red-600 hover:text-white text-red-600 dark:text-red-400 rounded-full border border-red-200 dark:border-slate-600 shadow-md transition-all group"
              title="Swap From and To locations"
            >
              <ArrowLeftRight className="w-5 h-5 group-hover:rotate-180 transition-transform duration-300" />
            </button>
          </div>

          {/* To Location */}
          <div className="md:col-span-5 space-y-1">
            <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              To Location
            </label>
            <div className="relative">
              <MapPin className="w-5 h-5 text-orange-500 absolute left-3.5 top-3.5" />
              <select
                value={toCity}
                onChange={(e) => setToCity(e.target.value)}
                className="w-full pl-10 pr-4 py-3.5 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-2xl text-sm font-black dark:text-white focus:outline-none focus:ring-2 focus:ring-red-500"
              >
                {POPULAR_BUS_CITIES.map((c) => (
                  <option key={c} value={c}>
                    {c} (Bus Drop Point)
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Date Picker & Search Button */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 items-end">
          <div className="sm:col-span-2 space-y-1">
            <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              Date of Journey
            </label>
            <div className="relative">
              <Calendar className="w-4 h-4 text-red-500 absolute left-3.5 top-3.5 pointer-events-none" />
              <input
                type="date"
                value={travelDate}
                min={new Date().toISOString().split('T')[0]}
                onChange={(e) => setTravelDate(e.target.value)}
                className="w-full pl-10 pr-4 py-3.5 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-2xl text-xs font-bold dark:text-white focus:outline-none focus:ring-2 focus:ring-red-500"
              />
            </div>
          </div>

          <button
            type="submit"
            className="w-full py-4 bg-gradient-to-r from-red-600 via-rose-600 to-orange-600 hover:from-red-700 hover:to-orange-700 text-white font-black text-sm rounded-2xl shadow-xl hover:shadow-red-600/30 transition-all flex items-center justify-center gap-2"
          >
            <Search className="w-5 h-5 text-yellow-300" /> Search Buses
          </button>
        </div>
      </form>
    </div>
  );
}
