import React from 'react';
import { X, Train, Clock, MapPin, Utensils, ShieldCheck, CheckCircle2 } from 'lucide-react';

export default function TrainDetailsModal({ train, onClose }) {
  if (!train) return null;

  const {
    title = '12627 Karnataka Express',
    transitInfo = {},
    pricingTiers = [],
  } = train;

  const trainNo = transitInfo.number || '12627';
  const source = transitInfo.source || 'Bengaluru (SBC)';
  const destination = transitInfo.destination || 'New Delhi (NDLS)';
  const departureTime = transitInfo.departureTime || '20:20';
  const arrivalTime = transitInfo.arrivalTime || '05:30';
  const duration = transitInfo.duration || '33h 10m';

  const mockHalts = [
    { station: source, code: source.match(/\(([^)]+)\)/)?.[1] || 'SBC', arr: 'Starts', dep: departureTime, halt: '-', day: 'Day 1' },
    { station: 'Dharmavaram Jn', code: 'DMM', arr: '23:15', dep: '23:20', halt: '5 mins', day: 'Day 1' },
    { station: 'Guntakal Jn', code: 'GTL', arr: '01:25', dep: '01:30', halt: '5 mins', day: 'Day 2' },
    { station: 'Secunderabad Jn', code: 'SC', arr: '07:35', dep: '07:45', halt: '10 mins', day: 'Day 2' },
    { station: 'Nagpur Jn', code: 'NGP', arr: '16:00', dep: '16:05', halt: '5 mins', day: 'Day 2' },
    { station: 'Bhopal Jn', code: 'BPL', arr: '22:45', dep: '22:50', halt: '5 mins', day: 'Day 2' },
    { station: 'Jhansi Jn', code: 'VGLJ', arr: '02:30', dep: '02:35', halt: '5 mins', day: 'Day 3' },
    { station: destination, code: destination.match(/\(([^)]+)\)/)?.[1] || 'NDLS', arr: arrivalTime, dep: 'Ends', halt: '-', day: 'Day 3' },
  ];

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white dark:bg-slate-800 rounded-3xl p-6 sm:p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto space-y-6 shadow-2xl relative border border-slate-200 dark:border-slate-700">
        <button
          onClick={onClose}
          className="absolute top-5 right-5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-2 rounded-full bg-slate-100 dark:bg-slate-700"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="flex items-center gap-3">
          <div className="p-3 bg-blue-900 text-white rounded-2xl font-mono font-bold text-sm shadow-md">
            #{trainNo}
          </div>
          <div>
            <h3 className="font-black text-xl text-slate-900 dark:text-white">
              {title}
            </h3>
            <p className="text-xs text-slate-500 flex items-center gap-2 mt-0.5">
              <span>Superfast Express</span> • <span className="text-emerald-600 font-bold">Pantry Car Onboard</span>
            </p>
          </div>
        </div>

        {/* Journey Summary */}
        <div className="p-4 bg-slate-50 dark:bg-slate-700/50 rounded-2xl border border-slate-200 dark:border-slate-600 grid grid-cols-3 gap-2 text-center text-xs">
          <div>
            <span className="text-[10px] text-slate-400 font-semibold uppercase block">Departs</span>
            <span className="font-black text-slate-900 dark:text-white text-base block">{departureTime}</span>
            <span className="text-slate-600 dark:text-slate-300 font-medium truncate block">{source}</span>
          </div>

          <div className="flex flex-col items-center justify-center space-y-1">
            <span className="text-[11px] text-blue-600 font-bold">{duration}</span>
            <div className="relative flex items-center justify-center w-full max-w-[120px]">
              <div className="h-0.5 w-full bg-blue-300 dark:bg-slate-500 rounded"></div>
              <Train className="w-4 h-4 text-blue-900 dark:text-blue-400 absolute bg-slate-50 dark:bg-slate-700 px-0.5" />
            </div>
            <span className="text-[10px] text-slate-400">34 Halts Total</span>
          </div>

          <div>
            <span className="text-[10px] text-slate-400 font-semibold uppercase block">Arrives</span>
            <span className="font-black text-slate-900 dark:text-white text-base block">{arrivalTime}</span>
            <span className="text-slate-600 dark:text-slate-300 font-medium truncate block">{destination}</span>
          </div>
        </div>

        {/* Catering & Amenities */}
        <div className="grid grid-cols-2 gap-3 text-xs">
          <div className="p-3 bg-blue-50/60 dark:bg-blue-950/40 rounded-2xl border border-blue-200 dark:border-blue-900/60 flex items-center gap-2.5">
            <Utensils className="w-4 h-4 text-blue-600" />
            <div>
              <span className="font-bold text-slate-900 dark:text-white block">E-Catering Available</span>
              <span className="text-[11px] text-slate-500">Order hot meals directly to your berth</span>
            </div>
          </div>
          <div className="p-3 bg-emerald-50/60 dark:bg-emerald-950/40 rounded-2xl border border-emerald-200 dark:border-emerald-900/60 flex items-center gap-2.5">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <div>
              <span className="font-bold text-slate-900 dark:text-white block">Clean Train Scheme</span>
              <span className="text-[11px] text-slate-500">On-board housekeeping service</span>
            </div>
          </div>
        </div>

        {/* Route Station Timetable */}
        <div className="space-y-2">
          <h4 className="font-bold text-xs uppercase tracking-wider text-slate-500">Key Route Stations Schedule</h4>
          <div className="border border-slate-200 dark:border-slate-700 rounded-2xl overflow-hidden text-xs">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-100 dark:bg-slate-700/80 text-slate-600 dark:text-slate-300 font-bold border-b border-slate-200 dark:border-slate-600">
                  <th className="p-3">Station</th>
                  <th className="p-3">Arrival</th>
                  <th className="p-3">Departure</th>
                  <th className="p-3">Halt</th>
                  <th className="p-3 text-right">Day</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-700/60 text-slate-700 dark:text-slate-300">
                {mockHalts.map((h, i) => (
                  <tr key={i} className="hover:bg-slate-50 dark:hover:bg-slate-700/30">
                    <td className="p-3 font-semibold flex items-center gap-1.5">
                      <span className="px-1.5 py-0.5 bg-slate-200 dark:bg-slate-600 text-[10px] font-mono rounded">
                        {h.code}
                      </span>
                      <span>{h.station}</span>
                    </td>
                    <td className="p-3 font-mono">{h.arr}</td>
                    <td className="p-3 font-mono">{h.dep}</td>
                    <td className="p-3 text-slate-400">{h.halt}</td>
                    <td className="p-3 text-right font-semibold text-blue-600">{h.day}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Railway Cancellation Guarantee */}
        <div className="p-4 bg-slate-900 text-white rounded-2xl space-y-1">
          <span className="font-bold text-xs text-amber-400 flex items-center gap-1">
            <CheckCircle2 className="w-4 h-4" /> TicketHarbour Rail Cancellation Guarantee
          </span>
          <p className="text-[11px] text-slate-300">
            Full refund on train ticket cancellation up to 4 hours before chart preparation. Instant refund processing directly to your original payment method.
          </p>
        </div>
      </div>
    </div>
  );
}
