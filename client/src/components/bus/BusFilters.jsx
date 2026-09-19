import React from 'react';
import { SlidersHorizontal, Bus, Clock, Star, Sparkles } from 'lucide-react';

export default function BusFilters({
  busTypes = [],
  onToggleBusType,
  selectedAC = 'ALL',
  onSelectAC,
  selectedSlot = 'ALL',
  onSelectSlot,
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

  return (
    <div className="bg-white dark:bg-slate-800 p-6 rounded-3xl border border-slate-200 dark:border-slate-700 space-y-6 shadow-sm">
      <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-700">
        <h3 className="font-bold text-slate-900 dark:text-white text-sm flex items-center gap-2">
          <SlidersHorizontal className="w-4 h-4 text-red-600" /> Bus Filters
        </h3>
        {resetFilters && (
          <button
            onClick={resetFilters}
            className="text-xs font-semibold text-red-600 hover:underline"
          >
            Reset
          </button>
        )}
      </div>

      {/* Bus Types */}
      <div className="space-y-2">
        <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider block">
          Bus Type
        </label>
        <div className="flex flex-wrap gap-2">
          {typeList.map((t) => {
            const isChecked = busTypes.includes(t);
            return (
              <button
                type="button"
                key={t}
                onClick={() => onToggleBusType && onToggleBusType(t)}
                className={`py-2 px-3 rounded-xl text-xs font-bold border transition-all ${
                  isChecked
                    ? 'bg-red-600 text-white border-red-600 shadow-md'
                    : 'bg-slate-50 dark:bg-slate-700 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-600'
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
        <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider block">
          AC Category
        </label>
        <div className="grid grid-cols-3 gap-2">
          {['ALL', 'AC', 'NON_AC'].map((opt) => (
            <button
              type="button"
              key={opt}
              onClick={() => onSelectAC && onSelectAC(opt)}
              className={`py-2 px-3 rounded-xl text-xs font-bold border transition-all ${
                selectedAC === opt
                  ? 'bg-red-600 text-white border-red-600 shadow-md'
                  : 'bg-slate-50 dark:bg-slate-700 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-600'
              }`}
            >
              {opt === 'ALL' ? 'All' : opt === 'AC' ? 'AC Only' : 'Non-AC'}
            </button>
          ))}
        </div>
      </div>

      {/* Departure Time */}
      <div className="space-y-2">
        <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider block flex items-center gap-1">
          <Clock className="w-3.5 h-3.5 text-red-600" /> Departure Time
        </label>
        <div className="space-y-1.5">
          {slots.map((s) => (
            <button
              type="button"
              key={s.key}
              onClick={() => onSelectSlot && onSelectSlot(s.key)}
              className={`w-full text-left p-2.5 rounded-xl text-xs font-medium border transition-colors ${
                selectedSlot === s.key
                  ? 'bg-red-50 dark:bg-red-950 border-red-600 text-red-900 dark:text-red-200 font-bold'
                  : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-50'
              }`}
            >
              {s.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
