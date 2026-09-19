import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Train, Clock, ArrowRight, ShieldCheck, Info } from 'lucide-react';

export default function TrainCard({ train, onSelectClass }) {
  const {
    _id,
    title = '12627 Karnataka Express',
    slug,
    transitInfo = {},
    pricingTiers = [],
  } = train;

  const trainNo = transitInfo.number || '12627';
  const source = transitInfo.source || 'Bengaluru (SBC)';
  const destination = transitInfo.destination || 'New Delhi (NDLS)';
  const departureTime = transitInfo.departureTime || '20:20';
  const arrivalTime = transitInfo.arrivalTime || '05:30';
  const duration = transitInfo.duration || '33h 10m';

  const [selectedClass, setSelectedClass] = useState(pricingTiers[0]?.classType || '3A');

  // Default tiers fallback
  const tiers = pricingTiers.length > 0 ? pricingTiers : [
    { tierName: 'Sleeper (SL)', price: 520, classType: 'SL', totalCapacity: 100, status: 'AVAILABLE 84' },
    { tierName: 'AC 3 Tier (3A)', price: 1450, classType: '3A', totalCapacity: 40, status: 'AVAILABLE 42' },
    { tierName: 'AC 2 Tier (2A)', price: 2250, classType: '2A', totalCapacity: 20, status: 'RAC 6' },
  ];

  const activeTier = tiers.find((t) => t.classType === selectedClass) || tiers[0];

  return (
    <div className="bg-white dark:bg-slate-800 rounded-3xl border border-slate-200 dark:border-slate-700 shadow-sm hover:shadow-xl transition-all overflow-hidden flex flex-col md:flex-row">
      {/* Left Main Information Panel */}
      <div className="p-6 flex-1 space-y-4">
        {/* Train Header */}
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 dark:border-slate-700 pb-3">
          <div className="flex items-center gap-2">
            <span className="px-3 py-1 bg-blue-900 text-white font-mono font-bold text-xs rounded-xl shadow-sm">
              #{trainNo}
            </span>
            <h3 className="font-black text-slate-900 dark:text-white text-base">
              {title}
            </h3>
          </div>

          <span className="text-[11px] font-bold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950 px-2.5 py-1 rounded-lg border border-blue-200/60 dark:border-blue-800">
            Runs Daily
          </span>
        </div>

        {/* Departure -> Duration -> Arrival Timeline */}
        <div className="grid grid-cols-12 gap-2 items-center text-xs py-2">
          {/* Departure */}
          <div className="col-span-4 space-y-0.5">
            <span className="text-xl font-black text-slate-900 dark:text-white">
              {departureTime}
            </span>
            <p className="font-bold text-slate-700 dark:text-slate-300">{source}</p>
          </div>

          {/* Duration Graphic */}
          <div className="col-span-4 text-center space-y-1">
            <span className="text-[11px] text-slate-400 font-medium">{duration}</span>
            <div className="relative flex items-center justify-center">
              <div className="h-0.5 w-full bg-blue-200 dark:bg-slate-600 rounded"></div>
              <Train className="w-4 h-4 text-blue-900 dark:text-blue-400 absolute bg-white dark:bg-slate-800 px-0.5" />
            </div>
          </div>

          {/* Arrival */}
          <div className="col-span-4 text-right space-y-0.5">
            <span className="text-xl font-black text-slate-900 dark:text-white">
              {arrivalTime}
            </span>
            <p className="font-bold text-slate-700 dark:text-slate-300">{destination}</p>
          </div>
        </div>

        {/* Class Selection Chips (3A, 2A, SL, etc.) */}
        <div className="space-y-2 pt-2">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
            Select Class & View Availability
          </span>

          <div className="flex flex-wrap gap-2">
            {tiers.map((t) => {
              const isSelected = selectedClass === (t.classType || t.tierName);
              const isAvailable = !(t.status && t.status.includes('WL'));

              return (
                <button
                  type="button"
                  key={t.tierName}
                  onClick={() => {
                    setSelectedClass(t.classType || t.tierName);
                    if (onSelectClass) onSelectClass(t);
                  }}
                  className={`p-3 rounded-2xl border text-left transition-all ${
                    isSelected
                      ? 'border-blue-600 bg-blue-50/80 dark:bg-blue-950/60 shadow-md ring-2 ring-blue-600/30'
                      : 'border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700/50'
                  }`}
                >
                  <div className="flex items-center justify-between gap-4">
                    <span className="font-black text-slate-900 dark:text-white text-xs">
                      {t.classType || t.tierName}
                    </span>
                    <span className="font-bold text-slate-900 dark:text-white text-xs">
                      ₹{t.price}
                    </span>
                  </div>

                  <div className="mt-1">
                    <span
                      className={`text-[10px] font-bold uppercase ${
                        isAvailable
                          ? 'text-emerald-600 dark:text-emerald-400'
                          : 'text-amber-600 dark:text-amber-400'
                      }`}
                    >
                      {t.status || `AVAILABLE ${t.totalCapacity || 50}`}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Right Pricing & Booking Panel */}
      <div className="bg-slate-50 dark:bg-slate-700/30 p-6 md:w-64 border-t md:border-t-0 md:border-l border-slate-200 dark:border-slate-700 flex flex-col justify-between space-y-4">
        <div className="space-y-1">
          <span className="text-xs text-slate-400 font-medium">Selected Class Fare</span>
          <div className="text-2xl font-black text-slate-900 dark:text-white">
            ₹{activeTier?.price || 500}
          </div>
          <span className="text-[11px] text-emerald-600 font-bold block">
            ✓ Free Cancellation Available
          </span>
        </div>

        <div className="space-y-2">
          <Link
            to={`/listings/${slug || _id}?class=${selectedClass}`}
            className="w-full py-3 bg-gradient-to-r from-blue-900 to-indigo-900 hover:from-blue-800 hover:to-indigo-800 text-white font-bold text-xs rounded-2xl shadow-lg flex items-center justify-center gap-2 transition-all"
          >
            Select Berth / Book Now <ArrowRight className="w-4 h-4" />
          </Link>

          <Link
            to={`/listings/${slug || _id}`}
            className="w-full py-2 bg-white dark:bg-slate-800 hover:bg-slate-100 border border-slate-200 dark:border-slate-600 text-slate-700 dark:text-slate-200 font-semibold text-xs rounded-xl flex items-center justify-center gap-1 transition-colors"
          >
            <Info className="w-3.5 h-3.5 text-blue-600" /> Route Details
          </Link>
        </div>
      </div>
    </div>
  );
}
