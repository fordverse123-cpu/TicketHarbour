import React, { useState } from 'react';
import { ArrowLeftRight, Calendar, Search, Bus, MapPin, Sparkles, Star, Check } from 'lucide-react';
import { BUS_CITIES, POPULAR_BUS_ROUTES } from '../../data/locationData';

export default function BusSearch({ onSearch, initialFrom = 'Mumbai', initialTo = 'Goa' }) {
  const [fromCity, setFromCity] = useState(
    BUS_CITIES.find((c) => c.city === initialFrom) || BUS_CITIES[0]
  );
  const [toCity, setToCity] = useState(
    BUS_CITIES.find((c) => c.city === initialTo) || BUS_CITIES[1]
  );
  const [travelDate, setTravelDate] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() + 1);
    return d.toISOString().split('T')[0];
  });

  // Dropdown toggles
  const [showFromDropdown, setShowFromDropdown] = useState(false);
  const [showToDropdown, setShowToDropdown] = useState(false);
  const [fromSearch, setFromSearch] = useState('');
  const [toSearch, setToSearch] = useState('');

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

  const handleSelectRoutePill = (fromName, toName) => {
    const foundFrom = BUS_CITIES.find((c) => c.city === fromName) || { city: fromName };
    const foundTo = BUS_CITIES.find((c) => c.city === toName) || { city: toName };
    setFromCity(foundFrom);
    setToCity(foundTo);
  };

  const filteredFromCities = BUS_CITIES.filter(
    (c) =>
      c.city.toLowerCase().includes(fromSearch.toLowerCase()) ||
      c.state.toLowerCase().includes(fromSearch.toLowerCase())
  );

  const filteredToCities = BUS_CITIES.filter(
    (c) =>
      c.city.toLowerCase().includes(toSearch.toLowerCase()) ||
      c.state.toLowerCase().includes(toSearch.toLowerCase())
  );

  return (
    <div className="bg-white dark:bg-slate-800 rounded-3xl border border-slate-200 dark:border-slate-700 shadow-xl overflow-hidden transition-all">
      {/* redBus-inspired Header Banner */}
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
              redBus-Inspired Smart Booking • Verified Primo Bus Operators • Instant Seat Lock
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 text-xs font-bold text-red-100">
          <span className="px-3 py-1 bg-white/20 rounded-full flex items-center gap-1 border border-white/20">
            <Star className="w-3.5 h-3.5 fill-amber-300 text-amber-300" /> 4.8★ Rated Operators
          </span>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="p-6 space-y-6">
        {/* Popular Routes Quick Pills */}
        <div className="space-y-2">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
            Popular Indian Bus Routes
          </span>
          <div className="flex flex-wrap gap-2">
            {POPULAR_BUS_ROUTES.map((rt, idx) => (
              <button
                type="button"
                key={idx}
                onClick={() => handleSelectRoutePill(rt.from, rt.to)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all border ${
                  fromCity.city === rt.from && toCity.city === rt.to
                    ? 'bg-red-600 text-white border-red-600 shadow-md'
                    : 'bg-slate-50 dark:bg-slate-700 text-slate-700 dark:text-slate-200 border-slate-200 dark:border-slate-600 hover:bg-red-50 hover:text-red-600'
                }`}
              >
                {rt.from} → {rt.to} ({rt.fare})
              </button>
            ))}
          </div>
        </div>

        {/* From / To & Swap Bar */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
          {/* From Location */}
          <div className="md:col-span-5 relative">
            <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">
              From Location (Boarding City)
            </label>
            <div
              onClick={() => {
                setShowFromDropdown(true);
                setShowToDropdown(false);
              }}
              className="p-3.5 bg-slate-50 dark:bg-slate-700/60 border border-slate-200 dark:border-slate-600 rounded-2xl cursor-pointer hover:border-red-500 transition-colors flex items-center gap-3"
            >
              <MapPin className="w-5 h-5 text-red-600 shrink-0" />
              <div className="flex-1 min-w-0">
                <span className="font-black text-slate-900 dark:text-white text-base block">
                  {fromCity.city}
                </span>
                <p className="text-xs text-slate-500 dark:text-slate-400 truncate">
                  {fromCity.terminals?.[0] || 'Major Bus Terminal'}
                </p>
              </div>
            </div>

            {/* From City Dropdown */}
            {showFromDropdown && (
              <div className="absolute top-full left-0 right-0 mt-2 z-30 bg-white dark:bg-slate-800 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-700 p-3 max-h-72 overflow-y-auto">
                <input
                  type="text"
                  placeholder="Search departure city or terminal..."
                  value={fromSearch}
                  onChange={(e) => setFromSearch(e.target.value)}
                  className="w-full p-2.5 mb-2 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl text-xs dark:text-white focus:outline-none focus:ring-2 focus:ring-red-500"
                  autoFocus
                />
                <div className="space-y-1">
                  {filteredFromCities.map((c) => (
                    <button
                      type="button"
                      key={c.city}
                      onClick={() => {
                        setFromCity(c);
                        setShowFromDropdown(false);
                      }}
                      className="w-full p-2.5 text-left hover:bg-red-50 dark:hover:bg-slate-700 rounded-xl flex items-center justify-between text-xs transition-colors"
                    >
                      <div>
                        <span className="font-bold text-slate-900 dark:text-white">{c.city}</span>
                        <p className="text-[11px] text-slate-400">{c.state} • {c.terminals?.join(', ')}</p>
                      </div>
                      {fromCity.city === c.city && <Check className="w-4 h-4 text-red-600" />}
                    </button>
                  ))}
                </div>
              </div>
            )}
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
          <div className="md:col-span-5 relative">
            <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">
              To Location (Dropping City)
            </label>
            <div
              onClick={() => {
                setShowToDropdown(true);
                setShowFromDropdown(false);
              }}
              className="p-3.5 bg-slate-50 dark:bg-slate-700/60 border border-slate-200 dark:border-slate-600 rounded-2xl cursor-pointer hover:border-red-500 transition-colors flex items-center gap-3"
            >
              <MapPin className="w-5 h-5 text-orange-500 shrink-0" />
              <div className="flex-1 min-w-0">
                <span className="font-black text-slate-900 dark:text-white text-base block">
                  {toCity.city}
                </span>
                <p className="text-xs text-slate-500 dark:text-slate-400 truncate">
                  {toCity.terminals?.[0] || 'Drop Point'}
                </p>
              </div>
            </div>

            {/* To City Dropdown */}
            {showToDropdown && (
              <div className="absolute top-full left-0 right-0 mt-2 z-30 bg-white dark:bg-slate-800 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-700 p-3 max-h-72 overflow-y-auto">
                <input
                  type="text"
                  placeholder="Search destination city or terminal..."
                  value={toSearch}
                  onChange={(e) => setToSearch(e.target.value)}
                  className="w-full p-2.5 mb-2 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl text-xs dark:text-white focus:outline-none focus:ring-2 focus:ring-red-500"
                  autoFocus
                />
                <div className="space-y-1">
                  {filteredToCities.map((c) => (
                    <button
                      type="button"
                      key={c.city}
                      onClick={() => {
                        setToCity(c);
                        setShowToDropdown(false);
                      }}
                      className="w-full p-2.5 text-left hover:bg-red-50 dark:hover:bg-slate-700 rounded-xl flex items-center justify-between text-xs transition-colors"
                    >
                      <div>
                        <span className="font-bold text-slate-900 dark:text-white">{c.city}</span>
                        <p className="text-[11px] text-slate-400">{c.state} • {c.terminals?.join(', ')}</p>
                      </div>
                      {toCity.city === c.city && <Check className="w-4 h-4 text-red-600" />}
                    </button>
                  ))}
                </div>
              </div>
            )}
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
