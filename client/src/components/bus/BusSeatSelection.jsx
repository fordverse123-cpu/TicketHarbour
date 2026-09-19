import React, { useState } from 'react';
import { Disc, Check, ArrowRight, ShieldCheck, User } from 'lucide-react';

export default function BusSeatSelection({ pricingTiers = [], busTitle, onConfirm }) {
  const [deck, setDeck] = useState('lower');
  const [selectedSeats, setSelectedSeats] = useState(['L4']);

  const sleeperPrice = pricingTiers?.find((p) => p.tierName?.toLowerCase().includes('sleeper'))?.price || pricingTiers?.[0]?.price || 1250;
  const seaterPrice = pricingTiers?.find((p) => p.tierName?.toLowerCase().includes('seater'))?.price || pricingTiers?.[1]?.price || 850;

  const lowerDeckSeats = [
    { id: 'L1', name: 'L1', type: 'Seater', price: seaterPrice, status: 'available' },
    { id: 'L2', name: 'L2', type: 'Seater', price: seaterPrice, status: 'available' },
    { id: 'L3', name: 'L3', type: 'Seater', price: seaterPrice, status: 'booked' },
    { id: 'L4', name: 'L4', type: 'Seater', price: seaterPrice, status: 'selected' },
    { id: 'L5', name: 'L5', type: 'Seater', price: seaterPrice, status: 'available' },
    { id: 'L6', name: 'L6', type: 'Seater', price: seaterPrice, status: 'available' },
    { id: 'L7', name: 'L7', type: 'Seater', price: seaterPrice, status: 'booked' },
    { id: 'L8', name: 'L8', type: 'Seater', price: seaterPrice, status: 'available' },
    { id: 'L9', name: 'L9', type: 'Seater', price: seaterPrice, status: 'available' },
    { id: 'L10', name: 'L10', type: 'Seater', price: seaterPrice, status: 'available' },
  ];

  const upperDeckSeats = [
    { id: 'U1', name: 'U1 (Single Berth)', type: 'Sleeper', price: sleeperPrice, status: 'available' },
    { id: 'U2', name: 'U2 (Single Berth)', type: 'Sleeper', price: sleeperPrice, status: 'available' },
    { id: 'U3', name: 'U3 (Double Berth)', type: 'Sleeper', price: sleeperPrice, status: 'booked' },
    { id: 'U4', name: 'U4 (Double Berth)', type: 'Sleeper', price: sleeperPrice, status: 'available' },
    { id: 'U5', name: 'U5 (Single Berth)', type: 'Sleeper', price: sleeperPrice, status: 'available' },
    { id: 'U6', name: 'U6 (Single Berth)', type: 'Sleeper', price: sleeperPrice, status: 'available' },
    { id: 'U7', name: 'U7 (Double Berth)', type: 'Sleeper', price: sleeperPrice, status: 'available' },
    { id: 'U8', name: 'U8 (Double Berth)', type: 'Sleeper', price: sleeperPrice, status: 'booked' },
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
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-700 pb-3">
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

        <div className="flex items-center gap-3 text-xs font-semibold">
          <span className="flex items-center gap-1.5">
            <span className="w-3.5 h-3.5 rounded border border-slate-300 bg-white"></span> Available
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-3.5 h-3.5 rounded bg-emerald-600 text-white flex items-center justify-center text-[9px] font-bold">✓</span> Selected
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-3.5 h-3.5 rounded bg-slate-300 dark:bg-slate-600"></span> Booked
          </span>
        </div>
      </div>

      {/* Driver Position & Bus Layout Container */}
      <div className="bg-white dark:bg-slate-800 p-6 rounded-3xl border border-slate-200 dark:border-slate-700 space-y-4">
        {/* Driver position indicator */}
        <div className="flex justify-between items-center pb-3 border-b border-slate-100 dark:border-slate-700">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
            {deck === 'lower' ? 'Lower Deck Layout' : 'Upper Sleeper Deck Layout'}
          </span>
          <div className="flex items-center gap-1.5 px-3 py-1 bg-slate-100 dark:bg-slate-700 rounded-full text-[11px] font-bold text-slate-600 dark:text-slate-300">
            <Disc className="w-4 h-4 text-red-600" /> Driver Cabin Front
          </div>
        </div>

        {/* Seat Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
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
                    ? 'bg-slate-200 dark:bg-slate-700 border-slate-300 dark:border-slate-600 text-slate-400 cursor-not-allowed'
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
            <span className="text-2xl font-black text-slate-900 dark:text-white">₹{totalPrice}</span>
          </div>

          <button
            type="button"
            disabled={selectedSeats.length === 0}
            onClick={() => onConfirm && onConfirm(selectedSeats, totalPrice)}
            className="px-6 py-3 bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-700 hover:to-orange-700 disabled:opacity-50 text-white font-bold text-xs rounded-2xl shadow-lg flex items-center gap-1.5 transition-all"
          >
            Book Selected Seats <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
