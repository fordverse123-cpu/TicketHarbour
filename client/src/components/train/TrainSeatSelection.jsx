import React, { useState } from 'react';
import { Check, ShieldCheck, User } from 'lucide-react';

const BERTH_TYPES = [
  { code: 'LB', label: 'Lower Berth (LB)' },
  { code: 'MB', label: 'Middle Berth (MB)' },
  { code: 'UB', label: 'Upper Berth (UB)' },
  { code: 'SL', label: 'Side Lower (SL)' },
  { code: 'SU', label: 'Side Upper (SU)' },
];

export default function TrainSeatSelection({ selectedClass = '3A', price = 1450, onConfirmSeats }) {
  const [selectedBerths, setSelectedBerths] = useState(['LB-12']);

  const coachBerths = [
    { id: 'LB-12', number: 12, type: 'Lower Berth', status: 'selected' },
    { id: 'MB-13', number: 13, type: 'Middle Berth', status: 'available' },
    { id: 'UB-14', number: 14, type: 'Upper Berth', status: 'available' },
    { id: 'LB-15', number: 15, type: 'Lower Berth', status: 'booked' },
    { id: 'MB-16', number: 16, type: 'Middle Berth', status: 'available' },
    { id: 'UB-17', number: 17, type: 'Upper Berth', status: 'booked' },
    { id: 'SL-18', number: 18, type: 'Side Lower', status: 'available' },
    { id: 'SU-19', number: 19, type: 'Side Upper', status: 'available' },
  ];

  const toggleBerth = (id, status) => {
    if (status === 'booked') return;
    if (selectedBerths.includes(id)) {
      setSelectedBerths(selectedBerths.filter((b) => b !== id));
    } else {
      setSelectedBerths([...selectedBerths, id]);
    }
  };

  const totalPrice = selectedBerths.length * price;

  return (
    <div className="bg-white dark:bg-slate-800 p-6 rounded-3xl border border-slate-200 dark:border-slate-700 space-y-6 shadow-xl">
      <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-700">
        <div>
          <h3 className="font-black text-slate-900 dark:text-white text-base">
            Select Coach Berth ({selectedClass})
          </h3>
          <p className="text-xs text-slate-500">
            Pick your preferred berths in Coach B4
          </p>
        </div>
        <span className="px-3 py-1 bg-blue-100 text-blue-800 font-bold text-xs rounded-full">
          Coach B4 (AC 3 Tier)
        </span>
      </div>

      {/* Legend */}
      <div className="flex items-center gap-4 text-xs font-semibold">
        <div className="flex items-center gap-1.5">
          <div className="w-4 h-4 rounded border border-slate-300 bg-white"></div>
          <span>Available</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-4 h-4 rounded bg-blue-900 text-white flex items-center justify-center text-[10px]">✓</div>
          <span>Selected</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-4 h-4 rounded bg-slate-300 dark:bg-slate-600"></div>
          <span>Booked</span>
        </div>
      </div>

      {/* Berth Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-4 bg-slate-50 dark:bg-slate-700/40 rounded-2xl border border-slate-200 dark:border-slate-600">
        {coachBerths.map((b) => {
          const isSelected = selectedBerths.includes(b.id);
          const isBooked = b.status === 'booked';

          return (
            <button
              type="button"
              key={b.id}
              disabled={isBooked}
              onClick={() => toggleBerth(b.id, b.status)}
              className={`p-3 rounded-2xl border text-center transition-all ${
                isBooked
                  ? 'bg-slate-200 dark:bg-slate-600 border-slate-300 cursor-not-allowed text-slate-400'
                  : isSelected
                  ? 'bg-blue-900 text-white border-blue-900 shadow-md ring-2 ring-blue-500/40'
                  : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-600 hover:border-blue-600 text-slate-800 dark:text-slate-200'
              }`}
            >
              <span className="font-mono font-black text-sm block">#{b.number}</span>
              <span className="text-[10px] block opacity-80">{b.type}</span>
            </button>
          );
        })}
      </div>

      {/* Booking Summary */}
      <div className="p-4 bg-blue-50 dark:bg-blue-950/60 rounded-2xl border border-blue-200 dark:border-blue-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs text-slate-500 block">Selected Berths ({selectedBerths.length})</span>
          <p className="font-bold text-blue-900 dark:text-blue-200 text-sm">
            {selectedBerths.join(', ') || 'None selected'}
          </p>
        </div>

        <div className="flex items-center gap-4">
          <div className="text-right">
            <span className="text-xs text-slate-400 block">Total Fare</span>
            <span className="text-xl font-black text-slate-900 dark:text-white">₹{totalPrice}</span>
          </div>

          <button
            type="button"
            onClick={() => onConfirmSeats && onConfirmSeats(selectedBerths, totalPrice)}
            disabled={selectedBerths.length === 0}
            className="px-6 py-3 bg-blue-900 hover:bg-blue-800 disabled:opacity-50 text-white font-bold text-xs rounded-xl shadow-lg transition-all"
          >
            Confirm & Proceed
          </button>
        </div>
      </div>
    </div>
  );
}
