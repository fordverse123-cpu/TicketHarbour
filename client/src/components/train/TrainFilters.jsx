import React from 'react';
import { Filter, SlidersHorizontal, Train, Clock, ShieldCheck } from 'lucide-react';

export default function TrainFilters({
  selectedClasses = [],
  onToggleClass,
  selectedSlot = 'ALL',
  onSelectSlot,
  resetFilters,
}) {
  const classesList = ['1A', '2A', '3A', 'SL', 'CC', '2S'];

  const slots = [
    { key: 'ALL', label: 'All Times' },
    { key: 'EARLY_MORNING', label: 'Early Morning (00:00 - 06:00)' },
    { key: 'MORNING', label: 'Morning (06:00 - 12:00)' },
    { key: 'AFTERNOON', label: 'Afternoon (12:00 - 18:00)' },
    { key: 'NIGHT', label: 'Night (18:00 - 24:00)' },
  ];

  return (
    <div className="bg-white dark:bg-slate-800 p-6 rounded-3xl border border-slate-200 dark:border-slate-700 space-y-6 shadow-sm">
      <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-700">
        <h3 className="font-bold text-slate-900 dark:text-white text-sm flex items-center gap-2">
          <SlidersHorizontal className="w-4 h-4 text-blue-600" /> Train Filters
        </h3>
        {resetFilters && (
          <button
            onClick={resetFilters}
            className="text-xs font-semibold text-blue-600 hover:underline"
          >
            Reset
          </button>
        )}
      </div>

      {/* Class Filter */}
      <div className="space-y-2">
        <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider block">
          Journey Class
        </label>
        <div className="grid grid-cols-3 gap-2">
          {classesList.map((cls) => {
            const isChecked = selectedClasses.includes(cls);
            return (
              <button
                type="button"
                key={cls}
                onClick={() => onToggleClass && onToggleClass(cls)}
                className={`py-2 px-3 rounded-xl text-xs font-bold border transition-all ${
                  isChecked
                    ? 'bg-blue-900 text-white border-blue-900 shadow-md'
                    : 'bg-slate-50 dark:bg-slate-700 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-600'
                }`}
              >
                {cls}
              </button>
            );
          })}
        </div>
      </div>

      {/* Departure Time Slots */}
      <div className="space-y-2">
        <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider block flex items-center gap-1">
          <Clock className="w-3.5 h-3.5 text-blue-600" /> Departure Time
        </label>
        <div className="space-y-1.5">
          {slots.map((s) => (
            <button
              type="button"
              key={s.key}
              onClick={() => onSelectSlot && onSelectSlot(s.key)}
              className={`w-full text-left p-2.5 rounded-xl text-xs font-medium border transition-colors ${
                selectedSlot === s.key
                  ? 'bg-blue-50 dark:bg-blue-950 border-blue-600 text-blue-900 dark:text-blue-200 font-bold'
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
