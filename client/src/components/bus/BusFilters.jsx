import React from 'react';
import { SlidersHorizontal, Clock, Star } from 'lucide-react';

export default function BusFilters({
  filters = {},
  onFilterChange,
  resetFilters,
}) {
  const typeList = ['AC Sleeper', 'Non-AC Sleeper', 'AC Seater', 'Volvo', 'Multi-Axle'];

  const slots = [
    { key: 'ALL', label: 'All Departure Times' },
    { key: 'BEFORE_6AM', label: 'Before 06:00 AM' },
    { key: '6AM_12PM', label: '06:00 AM - 12:00 PM' },
    { key: '12PM_6PM', label: '12:00 PM - 06:00 PM' },
    { key: 'AFTER_6PM', label: 'After 06:00 PM' },
  ];

  const currentBusTypes = filters.busTypes || [];
  const currentAC = filters.acType || 'ALL';
  const currentSlot = filters.timeSlot || 'ALL';
  const currentRating = filters.minRating || 0;

  const toggleBusType = (type) => {
    const updated = currentBusTypes.includes(type)
      ? currentBusTypes.filter((t) => t !== type)
      : [...currentBusTypes, type];
    if (onFilterChange) onFilterChange({ ...filters, busTypes: updated });
  };

  return (
    <div className="bg-[#111111] p-6 rounded-3xl border border-white/10 space-y-6 shadow-xl">
      <div className="flex items-center justify-between pb-3 border-b border-white/10">
        <h3 className="font-bold text-white text-sm flex items-center gap-2">
          <SlidersHorizontal className="w-4 h-4 text-[#03B3C3]" /> Bus Filters
        </h3>
        {resetFilters && (
          <button
            onClick={resetFilters}
            className="text-xs font-semibold text-[#03B3C3] hover:underline"
          >
            Reset
          </button>
        )}
      </div>

      {/* Bus Types */}
      <div className="space-y-2">
        <label className="text-xs font-bold text-[#9CA3AF] uppercase tracking-wider block">
          Bus Specification
        </label>
        <div className="flex flex-wrap gap-2">
          {typeList.map((t) => {
            const isChecked = currentBusTypes.includes(t);
            return (
              <button
                type="button"
                key={t}
                onClick={() => toggleBusType(t)}
                className={`py-2 px-3 rounded-xl text-xs font-bold border transition-all ${
                  isChecked
                    ? 'bg-gradient-to-r from-[#03B3C3] to-[#6750A2] text-white border-[#03B3C3] shadow-md'
                    : 'bg-[#151515] text-[#D1D5DB] border-white/10 hover:border-[#03B3C3]'
                }`}
              >
                {t}
              </button>
            );
          })}
        </div>
      </div>

      {/* AC / Non-AC */}
      <div className="space-y-2">
        <label className="text-xs font-bold text-[#9CA3AF] uppercase tracking-wider block">
          AC Category
        </label>
        <div className="grid grid-cols-3 gap-2">
          {[
            { key: 'ALL', label: 'All' },
            { key: 'AC', label: 'AC Only' },
            { key: 'NON_AC', label: 'Non-AC' },
          ].map((opt) => (
            <button
              type="button"
              key={opt.key}
              onClick={() => onFilterChange && onFilterChange({ ...filters, acType: opt.key })}
              className={`py-2 px-3 rounded-xl text-xs font-bold border transition-all ${
                currentAC === opt.key
                  ? 'bg-gradient-to-r from-[#03B3C3] to-[#6750A2] text-white border-[#03B3C3] shadow-md'
                  : 'bg-[#151515] text-[#D1D5DB] border-white/10 hover:border-[#03B3C3]'
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {/* Departure Time */}
      <div className="space-y-2">
        <label className="text-xs font-bold text-[#9CA3AF] uppercase tracking-wider block flex items-center gap-1">
          <Clock className="w-3.5 h-3.5 text-[#03B3C3]" /> Departure Time
        </label>
        <div className="space-y-1.5">
          {slots.map((s) => (
            <button
              type="button"
              key={s.key}
              onClick={() => onFilterChange && onFilterChange({ ...filters, timeSlot: s.key })}
              className={`w-full text-left p-2.5 rounded-xl text-xs font-medium border transition-colors ${
                currentSlot === s.key
                  ? 'bg-[#03B3C3]/15 border-[#03B3C3] text-white font-bold'
                  : 'bg-[#151515] border-white/10 text-[#D1D5DB] hover:border-white/20'
              }`}
            >
              {s.label}
            </button>
          ))}
        </div>
      </div>

      {/* Minimum Rating */}
      <div className="space-y-2">
        <label className="text-xs font-bold text-[#9CA3AF] uppercase tracking-wider block flex items-center gap-1">
          <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" /> Minimum Rating
        </label>
        <div className="grid grid-cols-4 gap-2 text-xs font-bold">
          {[0, 4.0, 4.5, 4.8].map((r) => (
            <button
              type="button"
              key={r}
              onClick={() => onFilterChange && onFilterChange({ ...filters, minRating: r })}
              className={`py-2 rounded-xl border text-center transition-all ${
                currentRating === r
                  ? 'bg-[#03B3C3] text-white border-[#03B3C3] shadow-md'
                  : 'bg-[#151515] border-white/10 text-[#D1D5DB] hover:border-white/20'
              }`}
            >
              {r === 0 ? 'Any' : `${r}★+`}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
