import React, { useState } from 'react';
import { Check, ShieldCheck, User, X, Train } from 'lucide-react';

export default function TrainSeatSelection({
  train,
  selectedClass = '3A',
  price = 1850,
  onClose,
  onConfirmBerths,
}) {
  const [selectedBerths, setSelectedBerths] = useState(['LB-12']);

  const coachBerths = [
    { id: 'LB-12', number: 12, type: 'Lower Berth (LB)', status: 'selected' },
    { id: 'MB-13', number: 13, type: 'Middle Berth (MB)', status: 'available' },
    { id: 'UB-14', number: 14, type: 'Upper Berth (UB)', status: 'available' },
    { id: 'LB-15', number: 15, type: 'Lower Berth (LB)', status: 'booked' },
    { id: 'MB-16', number: 16, type: 'Middle Berth (MB)', status: 'available' },
    { id: 'UB-17', number: 17, type: 'Upper Berth (UB)', status: 'booked' },
    { id: 'SL-18', number: 18, type: 'Side Lower (SL)', status: 'available' },
    { id: 'SU-19', number: 19, type: 'Side Upper (SU)', status: 'available' },
    { id: 'LB-20', number: 20, type: 'Lower Berth (LB)', status: 'available' },
    { id: 'MB-21', number: 21, type: 'Middle Berth (MB)', status: 'available' },
    { id: 'UB-22', number: 22, type: 'Upper Berth (UB)', status: 'booked' },
    { id: 'SL-23', number: 23, type: 'Side Lower (SL)', status: 'available' },
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
    <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white dark:bg-slate-800 p-6 sm:p-8 rounded-3xl border border-slate-200 dark:border-slate-700 max-w-2xl w-full space-y-6 shadow-2xl relative">
        {onClose && (
          <button
            onClick={onClose}
            className="absolute top-5 right-5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-2 rounded-full bg-slate-100 dark:bg-slate-700"
          >
            <X className="w-5 h-5" />
          </button>
        )}

        <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-700 pr-10">
          <div>
            <h3 className="font-black text-slate-900 dark:text-white text-lg flex items-center gap-2">
              <Train className="w-5 h-5 text-blue-900 dark:text-blue-400" /> Select Berth ({selectedClass})
            </h3>
            <p className="text-xs text-slate-500">
              {train?.title || '12627 Karnataka Express'} • Preferred Coach B4
            </p>
          </div>
          <span className="px-3 py-1.5 bg-blue-100 dark:bg-blue-950 text-blue-900 dark:text-blue-200 font-black text-xs rounded-xl border border-blue-200 dark:border-blue-800">
            Coach B4
          </span>
        </div>

        {/* Legend */}
        <div className="flex flex-wrap items-center gap-4 text-xs font-semibold bg-slate-50 dark:bg-slate-700/50 p-3 rounded-2xl border border-slate-200 dark:border-slate-600">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded-lg border border-slate-300 bg-white dark:bg-slate-800"></div>
            <span className="text-slate-700 dark:text-slate-300">Available</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded-lg bg-blue-900 text-white flex items-center justify-center text-[10px] font-bold">
              ✓
            </div>
            <span className="text-slate-700 dark:text-slate-300">Selected</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded-lg bg-slate-300 dark:bg-slate-600"></div>
            <span className="text-slate-700 dark:text-slate-300">Booked</span>
          </div>
        </div>

        {/* Berth Layout Grid */}
        <div className="space-y-2">
          <div className="w-full py-2 bg-blue-900/10 dark:bg-blue-900/40 text-center text-xs font-bold text-blue-900 dark:text-blue-300 rounded-xl tracking-wider uppercase">
            COACH B4 BERTH COMPARTMENT LAYOUT
          </div>

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
                  className={`p-3.5 rounded-2xl border text-center transition-all ${
                    isBooked
                      ? 'bg-slate-200 dark:bg-slate-700 border-slate-300 dark:border-slate-600 cursor-not-allowed text-slate-400 dark:text-slate-500'
                      : isSelected
                      ? 'bg-blue-900 text-white border-blue-900 shadow-md ring-2 ring-blue-500/40'
                      : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-600 hover:border-blue-600 text-slate-800 dark:text-slate-200'
                  }`}
                >
                  <span className="font-mono font-black text-sm block">#{b.number}</span>
                  <span className="text-[10px] block opacity-80 mt-0.5">{b.type}</span>
                </button>
              );
            })}
          </div>
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
              <span className="text-2xl font-black text-slate-900 dark:text-white">₹{totalPrice}</span>
            </div>

            <button
              type="button"
              onClick={() => {
                if (onConfirmBerths) onConfirmBerths(selectedBerths, totalPrice);
                if (onClose) onClose();
              }}
              disabled={selectedBerths.length === 0}
              className="px-6 py-3 bg-blue-900 hover:bg-blue-800 disabled:opacity-50 text-white font-bold text-xs rounded-2xl shadow-lg transition-all"
            >
              Confirm & Book
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
