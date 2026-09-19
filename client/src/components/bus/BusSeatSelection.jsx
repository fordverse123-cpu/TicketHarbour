import React, { useState } from 'react';
import { Disc, Check, ArrowRight } from 'lucide-react';

export default function BusSeatSelection({ pricingTiers = [], busTitle, onConfirm }) {
  const [deck, setDeck] = useState('lower');
  const [selectedSeats, setSelectedSeats] = useState(['L4']);

  const sleeperPrice = pricingTiers?.[0]?.price || 950;
  const seaterPrice = pricingTiers?.[1]?.price || 650;

  const lowerDeckSeats = [
    { id: 'L1', name: 'L1', price: seaterPrice, status: 'available' },
    { id: 'L2', name: 'L2', price: seaterPrice, status: 'available' },
    { id: 'L3', name: 'L3', price: seaterPrice, status: 'booked' },
    { id: 'L4', name: 'L4', price: seaterPrice, status: 'selected' },
    { id: 'L5', name: 'L5', price: seaterPrice, status: 'available' },
    { id: 'L6', name: 'L6', price: seaterPrice, status: 'available' },
    { id: 'L7', name: 'L7', price: seaterPrice, status: 'booked' },
    { id: 'L8', name: 'L8', price: seaterPrice, status: 'available' },
  ];

  const upperDeckSeats = [
    { id: 'U1', name: 'U1 (Sleeper)', price: sleeperPrice, status: 'available' },
    { id: 'U2', name: 'U2 (Sleeper)', price: sleeperPrice, status: 'available' },
    { id: 'U3', name: 'U3 (Sleeper)', price: sleeperPrice, status: 'booked' },
    { id: 'U4', name: 'U4 (Sleeper)', price: sleeperPrice, status: 'available' },
    { id: 'U5', name: 'U5 (Sleeper)', price: sleeperPrice, status: 'available' },
    { id: 'U6', name: 'U6 (Sleeper)', price: sleeperPrice, status: 'available' },
  ];

  const currentSeats = deck === 'lower' ? lowerDeckSeats : upperDeckSeats;

  const toggleSeat = (id, status) => {
    if (status === 'booked') return;
    if (selectedSeats.includes(id)) {
      setSelectedSeats(selectedSeats.filter((s) => s !== id));
    } else {
      setSelectedSeats([...selectedSeats, id]);
    }
  };

  const totalPrice = selectedSeats.reduce((sum, seatId) => {
    const isUpper = seatId.startsWith('U');
    return sum + (isUpper ? sleeperPrice : seaterPrice);
  }, 0);

  return (
    <div className="space-y-6">
      {/* Deck Tabs */}
      <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-700 pb-3">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setDeck('lower')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              deck === 'lower'
                ? 'bg-red-600 text-white shadow-md'
                : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700'
            }`}
          >
            Lower Deck (Seater)
          </button>
          <button
            type="button"
            onClick={() => setDeck('upper')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              deck === 'upper'
                ? 'bg-red-600 text-white shadow-md'
                : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700'
            }`}
          >
            Upper Deck (Sleeper Berths)
          </button>
        </div>

        <div className="flex items-center gap-3 text-xs">
          <span className="flex items-center gap-1 font-semibold">
            <span className="w-3.5 h-3.5 rounded border border-slate-300 bg-white"></span> Available
          </span>
          <span className="flex items-center gap-1 font-semibold">
            <span className="w-3.5 h-3.5 rounded bg-emerald-500 text-white flex items-center justify-center text-[9px]">✓</span> Selected
          </span>
          <span className="flex items-center gap-1 font-semibold">
            <span className="w-3.5 h-3.5 rounded bg-slate-400"></span> Booked
          </span>
        </div>
      </div>

      {/* Driver Icon & Bus Layout Container */}
      <div className="bg-white dark:bg-slate-800 p-6 rounded-3xl border border-slate-200 dark:border-slate-700 space-y-4">
        {/* Driver position indicator */}
        <div className="flex justify-end pb-3 border-b border-slate-100 dark:border-slate-700">
          <div className="flex items-center gap-1.5 px-3 py-1 bg-slate-100 dark:bg-slate-700 rounded-full text-[11px] font-bold text-slate-500">
            <Disc className="w-4 h-4 text-slate-400" /> Driver Position
          </div>
        </div>

        {/* Seat Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {currentSeats.map((s) => {
            const isSelected = selectedSeats.includes(s.id);
            const isBooked = s.status === 'booked';

            return (
              <button
                type="button"
                key={s.id}
                disabled={isBooked}
                onClick={() => toggleSeat(s.id, s.status)}
                className={`p-4 rounded-2xl border text-center transition-all ${
                  isBooked
                    ? 'bg-slate-200 dark:bg-slate-700 border-slate-300 text-slate-400 cursor-not-allowed'
                    : isSelected
                    ? 'bg-emerald-600 text-white border-emerald-600 shadow-md ring-2 ring-emerald-500/30'
                    : 'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-600 hover:border-red-500 text-slate-800 dark:text-slate-200'
                }`}
              >
                <span className="font-mono font-black text-sm block">{s.name}</span>
                <span className="text-[11px] font-bold block opacity-90 mt-0.5">₹{s.price}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Summary Footer */}
      <div className="p-4 bg-red-50 dark:bg-red-950/40 rounded-2xl border border-red-200 dark:border-red-800 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div>
          <span className="text-xs text-slate-500 block">Selected Seats ({selectedSeats.length})</span>
          <p className="font-bold text-red-900 dark:text-red-200 text-sm">
            {selectedSeats.join(', ') || 'No seats selected'}
          </p>
        </div>

        <div className="flex items-center gap-4">
          <div className="text-right">
            <span className="text-xs text-slate-400 block">Total Amount</span>
            <span className="text-xl font-black text-slate-900 dark:text-white">₹{totalPrice}</span>
          </div>

          <button
            type="button"
            disabled={selectedSeats.length === 0}
            onClick={() => onConfirm && onConfirm(selectedSeats, totalPrice)}
            className="px-6 py-3 bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white font-bold text-xs rounded-xl shadow-lg flex items-center gap-1.5 transition-all"
          >
            Book Seats <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
