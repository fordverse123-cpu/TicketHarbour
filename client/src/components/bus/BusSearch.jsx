import React, { useState } from 'react';
import { ArrowLeftRight, Calendar, Search, Bus, MapPin, Star, Check, Users } from 'lucide-react';
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
  const [passengers, setPassengers] = useState(1);

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
      onSearch({ from: fromCity, to: toCity, date: travelDate, passengers });
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
    <div className="bg-[#111111] rounded-3xl border border-white/10 shadow-2xl overflow-hidden transition-all">
      {/* Bus Search Header Banner */}
      <div className="bg-[#171717] text-white px-6 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/10">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-[#03B3C3]/15 text-[#03B3C3] rounded-2xl border border-[#03B3C3]/30">
            <Bus className="w-6 h-6" />
          </div>
          <div>
            <h2 className="font-black text-lg tracking-wide text-white flex items-center gap-2">
              Intercity Bus Ticket Booking
            </h2>
            <p className="text-xs text-[#9CA3AF]">
              TicketHarbour Bus Booking • Verified Primo Bus Operators • Instant Seat Lock
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 text-xs font-bold text-[#D1D5DB]">
          <span className="px-3 py-1 bg-white/5 rounded-full flex items-center gap-1 border border-white/10">
            <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" /> 4.8★ Rated Operators
          </span>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="p-6 space-y-6">
        {/* Popular Routes Quick Pills */}
        <div className="space-y-2">
          <span className="text-[11px] font-bold text-[#9CA3AF] uppercase tracking-wider block">
            Popular Indian Bus Routes
          </span>
          <div className="flex flex-wrap gap-2">
            {POPULAR_BUS_ROUTES.map((rt, idx) => {
              const active = fromCity.city === rt.from && toCity.city === rt.to;
              return (
                <button
                  type="button"
                  key={idx}
                  onClick={() => handleSelectRoutePill(rt.from, rt.to)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all border ${
                    active
                      ? 'bg-gradient-to-r from-[#03B3C3] to-[#6750A2] text-white border-[#03B3C3] shadow-md'
                      : 'bg-[#151515] text-[#D1D5DB] border-white/10 hover:border-[#03B3C3] hover:text-white'
                  }`}
                >
                  {rt.from} → {rt.to} ({rt.fare})
                </button>
              );
            })}
          </div>
        </div>

        {/* From / To & Swap Bar */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
          {/* From Location */}
          <div className="md:col-span-5 relative">
            <label className="block text-xs font-bold text-[#9CA3AF] uppercase tracking-wider mb-1">
              From Location (Boarding City)
            </label>
            <div
              onClick={() => {
                setShowFromDropdown(true);
                setShowToDropdown(false);
              }}
              className="p-3.5 bg-[#151515] border border-white/14 rounded-2xl cursor-pointer hover:border-[#03B3C3] transition-colors flex items-center gap-3"
            >
              <MapPin className="w-5 h-5 text-[#03B3C3] shrink-0" />
              <div className="flex-1 min-w-0">
                <span className="font-black text-white text-base block">
                  {fromCity.city}
                </span>
                <p className="text-xs text-[#9CA3AF] truncate">
                  {fromCity.terminals?.[0] || 'Major Bus Terminal'}
                </p>
              </div>
            </div>

            {/* From City Dropdown */}
            {showFromDropdown && (
              <div className="absolute top-full left-0 right-0 mt-2 z-30 bg-[#111111] rounded-2xl shadow-2xl border border-white/10 p-3 max-h-72 overflow-y-auto">
                <input
                  type="text"
                  placeholder="Search departure city..."
                  value={fromSearch}
                  onChange={(e) => setFromSearch(e.target.value)}
                  className="w-full p-2.5 mb-2 bg-[#151515] border border-white/10 rounded-xl text-xs text-white focus:outline-none focus:border-[#03B3C3]"
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
                      className="w-full p-2.5 text-left hover:bg-white/5 rounded-xl flex items-center justify-between text-xs transition-colors"
                    >
                      <div>
                        <span className="font-bold text-white">{c.city}</span>
                        <p className="text-[11px] text-[#9CA3AF]">{c.state} • {c.terminals?.join(', ')}</p>
                      </div>
                      {fromCity.city === c.city && <Check className="w-4 h-4 text-[#03B3C3]" />}
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
              className="p-3.5 bg-[#151515] hover:bg-[#03B3C3] hover:text-white text-[#03B3C3] rounded-full border border-white/10 shadow-md transition-all group"
              title="Swap From and To locations"
            >
              <ArrowLeftRight className="w-5 h-5 group-hover:rotate-180 transition-transform duration-300" />
            </button>
          </div>

          {/* To Location */}
          <div className="md:col-span-5 relative">
            <label className="block text-xs font-bold text-[#9CA3AF] uppercase tracking-wider mb-1">
              To Location (Dropping City)
            </label>
            <div
              onClick={() => {
                setShowToDropdown(true);
                setShowFromDropdown(false);
              }}
              className="p-3.5 bg-[#151515] border border-white/14 rounded-2xl cursor-pointer hover:border-[#03B3C3] transition-colors flex items-center gap-3"
            >
              <MapPin className="w-5 h-5 text-[#D856BF] shrink-0" />
              <div className="flex-1 min-w-0">
                <span className="font-black text-white text-base block">
                  {toCity.city}
                </span>
                <p className="text-xs text-[#9CA3AF] truncate">
                  {toCity.terminals?.[0] || 'Drop Point'}
                </p>
              </div>
            </div>

            {/* To City Dropdown */}
            {showToDropdown && (
              <div className="absolute top-full left-0 right-0 mt-2 z-30 bg-[#111111] rounded-2xl shadow-2xl border border-white/10 p-3 max-h-72 overflow-y-auto">
                <input
                  type="text"
                  placeholder="Search destination city..."
                  value={toSearch}
                  onChange={(e) => setToSearch(e.target.value)}
                  className="w-full p-2.5 mb-2 bg-[#151515] border border-white/10 rounded-xl text-xs text-white focus:outline-none focus:border-[#03B3C3]"
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
                      className="w-full p-2.5 text-left hover:bg-white/5 rounded-xl flex items-center justify-between text-xs transition-colors"
                    >
                      <div>
                        <span className="font-bold text-white">{c.city}</span>
                        <p className="text-[11px] text-[#9CA3AF]">{c.state} • {c.terminals?.join(', ')}</p>
                      </div>
                      {toCity.city === c.city && <Check className="w-4 h-4 text-[#03B3C3]" />}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Date Picker, Passengers & Search Button */}
        <div className="grid grid-cols-1 sm:grid-cols-12 gap-4 items-end">
          <div className="sm:col-span-5 space-y-1">
            <label className="block text-xs font-bold text-[#9CA3AF] uppercase tracking-wider">
              Date of Journey
            </label>
            <div className="relative">
              <Calendar className="w-4 h-4 text-[#03B3C3] absolute left-3.5 top-3.5 pointer-events-none" />
              <input
                type="date"
                value={travelDate}
                min={new Date().toISOString().split('T')[0]}
                onChange={(e) => setTravelDate(e.target.value)}
                className="w-full pl-10 pr-4 py-3.5 bg-[#151515] border border-white/14 rounded-2xl text-xs font-bold text-white focus:outline-none focus:border-[#03B3C3]"
              />
            </div>
          </div>

          <div className="sm:col-span-3 space-y-1">
            <label className="block text-xs font-bold text-[#9CA3AF] uppercase tracking-wider">
              Passengers
            </label>
            <div className="relative">
              <Users className="w-4 h-4 text-[#6750A2] absolute left-3.5 top-3.5 pointer-events-none" />
              <select
                value={passengers}
                onChange={(e) => setPassengers(Number(e.target.value))}
                className="w-full pl-10 pr-4 py-3.5 bg-[#151515] border border-white/14 rounded-2xl text-xs font-bold text-white focus:outline-none focus:border-[#03B3C3]"
              >
                {[1, 2, 3, 4, 5, 6].map((num) => (
                  <option key={num} value={num} className="bg-[#111111] text-white">
                    {num} Passenger{num > 1 ? 's' : ''}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="sm:col-span-4">
            <button
              type="submit"
              className="w-full py-3.5 bg-gradient-to-r from-[#03B3C3] to-[#6750A2] hover:opacity-90 text-white font-black text-sm rounded-2xl shadow-xl transition-all flex items-center justify-center gap-2"
            >
              <Search className="w-5 h-5 text-white" /> Search Buses
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
