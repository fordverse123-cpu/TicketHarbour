import React from 'react';
import { X, Luggage, Plane, ShieldCheck, Clock, CheckCircle2, AlertCircle } from 'lucide-react';

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
      <div className="bg-white dark:bg-slate-800 rounded-3xl p-6 sm:p-8 max-w-xl w-full space-y-6 shadow-2xl relative border border-slate-200 dark:border-slate-700">
        <button
          onClick={onClose}
          className="absolute top-5 right-5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-2 rounded-full bg-slate-100 dark:bg-slate-700"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-sky-600 text-white flex items-center justify-center text-xl font-bold shadow-md">
            ✈️
          </div>
          <div>
            <h3 className="font-black text-xl text-slate-900 dark:text-white">
              {airline} ({flightNumber})
            </h3>
            <p className="text-xs text-slate-500">Airbus A320neo • Non-stop Direct Flight</p>
          </div>
        </div>

        {/* Flight Timeline */}
        <div className="p-4 bg-slate-50 dark:bg-slate-700/50 rounded-2xl border border-slate-200 dark:border-slate-600 space-y-3 text-xs">
          <div className="flex items-center justify-between font-bold text-slate-900 dark:text-white">
            <div>
              <span className="text-lg font-black block">{departureTime}</span>
              <span className="text-slate-600 dark:text-slate-300">{source}</span>
            </div>

            <div className="text-center">
              <span className="text-slate-400 block text-[11px] font-medium">{duration}</span>
              <Plane className="w-4 h-4 text-sky-600 inline-block rotate-45" />
              <span className="text-[10px] text-emerald-600 font-bold block">Direct</span>
            </div>

            <div className="text-right">
              <span className="text-lg font-black block">{arrivalTime}</span>
              <span className="text-slate-600 dark:text-slate-300">{destination}</span>
            </div>
          </div>
        </div>

        {/* Baggage Allowance */}
        <div className="space-y-2">
          <h4 className="font-bold text-xs uppercase tracking-wider text-slate-500">Standard Baggage Allowance</h4>
          <div className="grid grid-cols-2 gap-3 text-xs">
            <div className="p-3 bg-sky-50/60 dark:bg-sky-950/40 rounded-2xl border border-sky-200 dark:border-sky-900/60 flex items-center gap-2.5">
              <Luggage className="w-4 h-4 text-sky-600" />
              <div>
                <span className="font-bold text-slate-900 dark:text-white block">Cabin Baggage</span>
                <span className="text-[11px] text-slate-500">7 kg (1 Piece max)</span>
              </div>
            </div>
            <div className="p-3 bg-sky-50/60 dark:bg-sky-950/40 rounded-2xl border border-sky-200 dark:border-sky-900/60 flex items-center gap-2.5">
              <Luggage className="w-4 h-4 text-sky-600" />
              <div>
                <span className="font-bold text-slate-900 dark:text-white block">Check-in Baggage</span>
                <span className="text-[11px] text-slate-500">15 kg (1 Piece max)</span>
              </div>
            </div>
          </div>
        </div>

        {/* Fare Tiers Summary */}
        <div className="space-y-2">
          <h4 className="font-bold text-xs uppercase tracking-wider text-slate-500">Available Fare Tiers</h4>
          <div className="space-y-2 text-xs">
            {pricingTiers.map((t, idx) => (
              <div
                key={idx}
                className="p-3.5 bg-slate-50 dark:bg-slate-700/50 rounded-2xl border border-slate-200 dark:border-slate-600 flex items-center justify-between font-semibold"
              >
                <div>
                  <span className="font-bold text-slate-900 dark:text-white block">{t.tierName || 'Economy'}</span>
                  <span className="text-[10px] text-slate-400">Standard Seat • Free Snack</span>
                </div>
                <span className="font-black text-slate-900 dark:text-white text-base">₹{t.price}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Cancellation Policy */}
        <div className="p-4 bg-slate-900 text-white rounded-2xl space-y-1 text-xs">
          <span className="font-bold text-cyan-300 flex items-center gap-1">
            <CheckCircle2 className="w-4 h-4" /> Cancellation & Date Change Rules
          </span>
          <p className="text-[11px] text-slate-300">
            Cancellation fee of ₹3,000 applies up to 2 hours before scheduled departure. Date changes allowed with fare difference adjustment.
          </p>
        </div>
      </div>
    </div>
  );
}
