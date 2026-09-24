import React from 'react';
import { SlidersHorizontal, Plane, Clock, DollarSign, RotateCcw } from 'lucide-react';

export default function FlightFilters({
  filters = {},
  onFilterChange,
  resetFilters,
}) {
  const airlinesList = ['IndiGo', 'Air India', 'SpiceJet', 'Vistara', 'Akasa Air'];

  const selectedStops = filters.stops || 'ALL';
  const selectedAirlines = filters.airlines || [];
  const selectedTimeSlot = filters.timeSlot || 'ALL';
  const maxPrice = filters.maxPrice || 50000;

  const toggleAirline = (al) => {
    const updated = selectedAirlines.includes(al)
      ? selectedAirlines.filter((a) => a !== al)
      : [...selectedAirlines, al];
    if (onFilterChange) onFilterChange({ ...filters, airlines: updated });
  };

  const handleStopsClick = (stopKey) => {
    if (onFilterChange) onFilterChange({ ...filters, stops: stopKey });
  };

  const handleTimeSlotClick = (slotKey) => {
    if (onFilterChange) onFilterChange({ ...filters, timeSlot: slotKey });
  };

  const handlePriceChange = (val) => {
    if (onFilterChange) onFilterChange({ ...filters, maxPrice: Number(val) });
  };

  const isFilterActive =
    selectedStops !== 'ALL' ||
    selectedAirlines.length > 0 ||
    selectedTimeSlot !== 'ALL' ||
    maxPrice < 50000;

  return (
    <div className="bg-[#111111] p-6 rounded-3xl border border-white/10 space-y-6 shadow-xl">
      <div className="flex items-center justify-between pb-3 border-b border-white/10">
        <h3 className="font-bold text-white text-sm flex items-center gap-2">
          <SlidersHorizontal className="w-4 h-4 text-[#03B3C3]" /> Flight Filters
        </h3>
        {isFilterActive && (
          <button
            onClick={() => {
              if (onFilterChange)
                onFilterChange({ stops: 'ALL', airlines: [], timeSlot: 'ALL', maxPrice: 50000 });
              if (resetFilters) resetFilters();
            }}
            className="text-xs font-semibold text-[#03B3C3] hover:underline flex items-center gap-1"
          >
            <RotateCcw className="w-3 h-3" /> Reset
          </button>
        )}
      </div>

      {/* Price Range */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-xs">
          <span className="font-bold text-slate-300 uppercase tracking-wider">Max Price</span>
          <span className="font-mono font-bold text-[#03B3C3]">₹{maxPrice.toLocaleString()}</span>
        </div>
        <input
          type="range"
          min="2000"
          max="50000"
          step="1000"
          value={maxPrice}
          onChange={(e) => handlePriceChange(e.target.value)}
          className="w-full accent-[#03B3C3] bg-white/10 rounded-lg cursor-pointer h-2"
        />
        <div className="flex justify-between text-[10px] text-slate-500 font-mono">
          <span>₹2,000</span>
          <span>₹50,000</span>
        </div>
      </div>

      {/* Flight Stops */}
      <div className="space-y-2">
        <label className="text-xs font-bold text-slate-300 uppercase tracking-wider block">
          Flight Stops
        </label>
        <div className="grid grid-cols-2 gap-2">
          {[
            { key: 'ALL', label: 'Any Stops' },
            { key: 'NONSTOP', label: 'Non-stop' },
            { key: '1STOP', label: '1 Stop' },
            { key: '2STOP', label: '2+ Stops' },
          ].map((st) => (
            <button
              type="button"
              key={st.key}
              onClick={() => handleStopsClick(st.key)}
              className={`py-2 px-2.5 rounded-xl text-xs font-bold border transition-all ${
                selectedStops === st.key
                  ? 'bg-[#03B3C3] text-white border-[#03B3C3] shadow-md'
                  : 'bg-[#181818] text-slate-300 border-white/10 hover:border-[#03B3C3]/50'
              }`}
            >
              {st.label}
            </button>
          ))}
        </div>
      </div>

      {/* Departure Time */}
      <div className="space-y-2">
        <label className="text-xs font-bold text-slate-300 uppercase tracking-wider block flex items-center gap-1">
          <Clock className="w-3.5 h-3.5 text-[#03B3C3]" /> Departure Time
        </label>
        <div className="grid grid-cols-2 gap-2 text-xs font-semibold">
          {[
            { key: 'ALL', label: 'Any Time' },
            { key: 'MORNING', label: 'Morning (6am - 12pm)' },
            { key: 'AFTERNOON', label: 'Afternoon (12pm - 6pm)' },
            { key: 'EVENING', label: 'Evening (6pm - 12am)' },
            { key: 'NIGHT', label: 'Night (12am - 6am)' },
          ].map((ts) => (
            <button
              type="button"
              key={ts.key}
              onClick={() => handleTimeSlotClick(ts.key)}
              className={`p-2 rounded-xl border text-left text-[11px] transition-all ${
                selectedTimeSlot === ts.key
                  ? 'bg-[#03B3C3]/20 border-[#03B3C3] text-[#03B3C3] font-bold'
                  : 'bg-[#181818] border-white/10 text-slate-400 hover:text-white'
              }`}
            >
              {ts.label}
            </button>
          ))}
        </div>
      </div>

      {/* Preferred Airlines */}
      <div className="space-y-2">
        <label className="text-xs font-bold text-slate-300 uppercase tracking-wider block flex items-center gap-1">
          <Plane className="w-3.5 h-3.5 text-[#03B3C3] rotate-45" /> Preferred Airlines
        </label>
        <div className="space-y-1.5">
          {airlinesList.map((al) => {
            const isChecked = selectedAirlines.includes(al);
            return (
              <label
                key={al}
                className="flex items-center gap-2.5 text-xs font-semibold text-slate-300 cursor-pointer p-1.5 hover:bg-white/5 rounded-xl transition-colors"
              >
                <input
                  type="checkbox"
                  checked={isChecked}
                  onChange={() => toggleAirline(al)}
                  className="w-4 h-4 accent-[#03B3C3] rounded cursor-pointer"
                />
                <span>{al}</span>
              </label>
            );
          })}
        </div>
      </div>
    </div>
  );
}
