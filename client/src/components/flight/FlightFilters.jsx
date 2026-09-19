import React from 'react';
import { SlidersHorizontal, Plane, Clock, ShieldCheck, Luggage } from 'lucide-react';

export default function FlightFilters({
  filters = {},
  onFilterChange,
  resetFilters,
}) {
  const airlinesList = ['IndiGo', 'Air India', 'SpiceJet', 'Vistara', 'Akasa Air'];

  const selectedStops = filters.stops || 'ALL';
  const selectedAirlines = filters.airlines || [];

  const toggleAirline = (al) => {
    const updated = selectedAirlines.includes(al)
      ? selectedAirlines.filter((a) => a !== al)
      : [...selectedAirlines, al];
    if (onFilterChange) onFilterChange({ ...filters, airlines: updated });
  };

  const handleStopsClick = (stopKey) => {
    if (onFilterChange) onFilterChange({ ...filters, stops: stopKey });
  };

  return (
    <div className="bg-white dark:bg-slate-800 p-6 rounded-3xl border border-slate-200 dark:border-slate-700 space-y-6 shadow-sm">
      <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-700">
        <h3 className="font-bold text-slate-900 dark:text-white text-sm flex items-center gap-2">
          <SlidersHorizontal className="w-4 h-4 text-sky-600" /> Flight Filters
        </h3>
        {(selectedStops !== 'ALL' || selectedAirlines.length > 0) && (
          <button
            onClick={() => {
              if (onFilterChange) onFilterChange({ stops: 'ALL', airlines: [] });
              if (resetFilters) resetFilters();
            }}
            className="text-xs font-semibold text-sky-600 hover:underline"
          >
            Reset
          </button>
        )}
      </div>

      {/* Stops Filter */}
      <div className="space-y-2">
        <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider block">
          Flight Stops
        </label>
        <div className="grid grid-cols-3 gap-2">
          {[
            { key: 'ALL', label: 'All Flights' },
            { key: 'NONSTOP', label: 'Non-stop' },
            { key: '1STOP', label: '1 Stop' },
          ].map((st) => (
            <button
              type="button"
              key={st.key}
              onClick={() => handleStopsClick(st.key)}
              className={`py-2 px-2.5 rounded-xl text-xs font-bold border transition-all ${
                selectedStops === st.key
                  ? 'bg-sky-600 text-white border-sky-600 shadow-md'
                  : 'bg-slate-50 dark:bg-slate-700 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-600 hover:border-sky-500'
              }`}
            >
              {st.label}
            </button>
          ))}
        </div>
      </div>

      {/* Airlines Checklist */}
      <div className="space-y-2">
        <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider block flex items-center gap-1">
          <Plane className="w-3.5 h-3.5 text-sky-600 rotate-45" /> Preferred Airlines
        </label>
        <div className="space-y-2">
          {airlinesList.map((al) => {
            const isChecked = selectedAirlines.includes(al);
            return (
              <label
                key={al}
                className="flex items-center gap-2.5 text-xs font-semibold text-slate-700 dark:text-slate-300 cursor-pointer p-1.5 hover:bg-slate-50 dark:hover:bg-slate-700 rounded-xl transition-colors"
              >
                <input
                  type="checkbox"
                  checked={isChecked}
                  onChange={() => toggleAirline(al)}
                  className="w-4 h-4 accent-sky-600 rounded cursor-pointer"
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
