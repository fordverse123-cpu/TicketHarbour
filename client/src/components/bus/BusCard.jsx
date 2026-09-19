import React, { useState } from 'react';
import { Bus, Star, MapPin, Clock, ChevronDown, ChevronUp, ShieldCheck, Sparkles } from 'lucide-react';
import BusSeatSelection from './BusSeatSelection';

export default function BusCard({ bus, onBookSeat }) {
  const [showSeatView, setShowSeatView] = useState(false);

  const {
    _id,
    title = 'IntrCity SmartBus AC Sleeper',
    slug,
    rating = 4.8,
    numReviews = 420,
    transitInfo = {},
    pricingTiers = [],
  } = bus;

  const operator = transitInfo.operator || 'IntrCity SmartBus';
  const busType = transitInfo.busType || 'Volvo Multi-Axle AC Sleeper (2+1)';
  const source = transitInfo.source || 'Mumbai';
  const destination = transitInfo.destination || 'Goa';
  const departureTime = transitInfo.departureTime || '21:00';
  const arrivalTime = transitInfo.arrivalTime || '07:30';
  const duration = transitInfo.duration || '10h 30m';

  const lowestPrice = pricingTiers?.reduce(
    (min, p) => (p.price < min ? p.price : min),
    pricingTiers[0]?.price || 1250
  );

  return (
    <div className="bg-white dark:bg-slate-800 rounded-3xl border border-slate-200 dark:border-slate-700 shadow-sm hover:shadow-xl transition-all overflow-hidden space-y-0">
      {/* Top Main Bus Info Card */}
      <div className="p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        {/* Left Operator & Spec Info */}
        <div className="space-y-2 max-w-sm">
          <div className="flex items-center gap-2 flex-wrap">
            <h3 className="font-black text-slate-900 dark:text-white text-base sm:text-lg">
              {operator}
            </h3>
            <span className="px-2 py-0.5 bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300 font-bold text-xs rounded-md flex items-center gap-1 border border-amber-300/40">
              <Star className="w-3.5 h-3.5 fill-amber-500 text-amber-500" /> {rating} ({numReviews})
            </span>
          </div>

          <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">
            {busType}
          </p>

          <div className="flex items-center gap-2 text-[11px] text-slate-400 flex-wrap">
            <span className="px-2.5 py-0.5 bg-red-50 dark:bg-red-950 text-red-700 dark:text-red-300 font-bold rounded-full border border-red-200 dark:border-red-800">
              Primo Operator
            </span>
            <span className="px-2.5 py-0.5 bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 font-bold rounded-full">
              Live GPS Tracking
            </span>
          </div>
        </div>

        {/* Center Route Timeline */}
        <div className="flex-1 space-y-1 text-xs">
          <div className="flex items-center justify-between font-bold text-slate-900 dark:text-white text-base">
            <div>
              <span className="text-xl font-black block">{departureTime}</span>
              <p className="text-xs font-semibold text-slate-600 dark:text-slate-300">{source}</p>
              <span className="text-[10px] text-slate-400 font-medium">Borivali Terminal</span>
            </div>

            <div className="text-center px-4 space-y-1">
              <span className="text-[11px] text-slate-400 font-medium">{duration}</span>
              <div className="relative flex items-center justify-center w-28 sm:w-36">
                <div className="h-0.5 w-full bg-red-200 dark:bg-slate-600 rounded"></div>
                <Bus className="w-4 h-4 text-red-600 absolute bg-white dark:bg-slate-800 px-0.5" />
              </div>
              <span className="text-[10px] text-emerald-600 font-bold block">14 Seats Left</span>
            </div>

            <div className="text-right">
              <span className="text-xl font-black block">{arrivalTime}</span>
              <p className="text-xs font-semibold text-slate-600 dark:text-slate-300">{destination}</p>
              <span className="text-[10px] text-slate-400 font-medium">Mapusa Terminal</span>
            </div>
          </div>
        </div>

        {/* Right Fare & View Seats Toggle */}
        <div className="flex md:flex-col items-center md:items-end justify-between w-full md:w-auto pt-4 md:pt-0 border-t md:border-t-0 border-slate-100 dark:border-slate-700 gap-3">
          <div className="text-right">
            <span className="text-[10px] text-slate-400 font-semibold block">Starts From</span>
            <span className="text-2xl font-black text-slate-900 dark:text-white">
              ₹{lowestPrice}
            </span>
            <span className="text-[10px] text-emerald-600 font-bold block">On-Time Guarantee</span>
          </div>

          <button
            type="button"
            onClick={() => setShowSeatView(!showSeatView)}
            className="px-6 py-3 bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-700 hover:to-orange-700 text-white font-bold text-xs rounded-2xl shadow-lg flex items-center gap-2 transition-all"
          >
            {showSeatView ? 'Hide Seat Map' : 'Select Seats'}
            {showSeatView ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Expandable Seat Selection Grid */}
      {showSeatView && (
        <div className="p-6 bg-slate-50 dark:bg-slate-900/60 border-t border-slate-200 dark:border-slate-700">
          <BusSeatSelection
            pricingTiers={pricingTiers}
            busTitle={title}
            onConfirm={(selectedSeats, total) => {
              if (onBookSeat) onBookSeat(selectedSeats, total);
            }}
          />
        </div>
      )}
    </div>
  );
}
