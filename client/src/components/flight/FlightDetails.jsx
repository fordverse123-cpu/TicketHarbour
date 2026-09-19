import React from 'react';
import { X, Luggage, Plane, ShieldCheck, Clock, CheckCircle } from 'lucide-react';

export default function FlightDetails({ flight, onClose }) {
  if (!flight) return null;

  const {
    title = 'IndiGo Flight 6E 1234',
    transitInfo = {},
    pricingTiers = [],
  } = flight;

  const airline = transitInfo.operator || 'IndiGo';
  const flightNumber = transitInfo.number || '6E 1234';
  const source = transitInfo.source || 'Vijayawada (VGA)';
  const destination = transitInfo.destination || 'Delhi (DEL)';
  const departureTime = transitInfo.departureTime || '10:30';
  const arrivalTime = transitInfo.arrivalTime || '13:05';
  const duration = transitInfo.duration || '2h 35m';

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white dark:bg-slate-800 rounded-3xl p-6 sm:p-8 max-w-lg w-full space-y-6 shadow-2xl relative">
        <button
          onClick={onClose}
          className="absolute top-5 right-5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-sky-500/10 text-sky-600 flex items-center justify-center text-xl font-bold">
            ✈️
          </div>
          <div>
            <h3 className="font-black text-lg text-slate-900 dark:text-white">
              {airline} ({flightNumber})
            </h3>
            <p className="text-xs text-slate-500">Airbus A320neo • Non-stop</p>
          </div>
        </div>

        {/* Flight Timeline */}
        <div className="p-4 bg-slate-50 dark:bg-slate-700/50 rounded-2xl border border-slate-200 dark:border-slate-600 space-y-3 text-xs">
          <div className="flex items-center justify-between font-bold text-slate-900 dark:text-white">
            <div>
              <span className="text-base block">{departureTime}</span>
              <span className="text-slate-500">{source}</span>
            </div>

            <div className="text-center">
              <span className="text-slate-400 block">{duration}</span>
              <Plane className="w-4 h-4 text-sky-600 inline-block rotate-45" />
            </div>

            <div className="text-right">
              <span className="text-base block">{arrivalTime}</span>
              <span className="text-slate-500">{destination}</span>
            </div>
          </div>
        </div>

        {/* Baggage Policy */}
        <div className="space-y-2">
          <h4 className="font-bold text-xs uppercase tracking-wider text-slate-500">Baggage Allowance</h4>
          <div className="grid grid-cols-2 gap-3 text-xs">
            <div className="p-3 bg-slate-50 dark:bg-slate-700 rounded-xl flex items-center gap-2">
              <Luggage className="w-4 h-4 text-sky-600" />
              <div>
                <span className="font-bold block">Cabin Baggage</span>
                <span className="text-[11px] text-slate-400">7 kg (1 Piece)</span>
              </div>
            </div>
            <div className="p-3 bg-slate-50 dark:bg-slate-700 rounded-xl flex items-center gap-2">
              <Luggage className="w-4 h-4 text-sky-600" />
              <div>
                <span className="font-bold block">Check-in Baggage</span>
                <span className="text-[11px] text-slate-400">15 kg (1 Piece)</span>
              </div>
            </div>
          </div>
        </div>

        {/* Fare Tiers Summary */}
        <div className="space-y-2">
          <h4 className="font-bold text-xs uppercase tracking-wider text-slate-500">Fare Classes</h4>
          <div className="space-y-1.5 text-xs">
            {pricingTiers.map((t, idx) => (
              <div
                key={idx}
                className="p-3 bg-slate-50 dark:bg-slate-700/50 rounded-xl border border-slate-200 dark:border-slate-600 flex items-center justify-between font-semibold"
              >
                <span>{t.tierName || 'Economy'}</span>
                <span className="font-black text-slate-900 dark:text-white">₹{t.price}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
