import React, { useState } from 'react';
import { Bus, Star, ChevronDown, ChevronUp, ShieldCheck, Wifi, Power } from 'lucide-react';
import BusSeatSelection from './BusSeatSelection';
import SpotlightCard from '../SpotlightCard';

export default function BusCard({ bus, onBookSeat }) {
  const [showSeatView, setShowSeatView] = useState(false);

  const {
    title = 'IntrCity SmartBus AC Sleeper',
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
    <SpotlightCard className="w-full h-full rounded-3xl border border-white/10 bg-[#111111] overflow-hidden">
      <div className="space-y-0">
        {/* Top Main Bus Info Card */}
        <div className="p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          {/* Left Operator & Spec Info */}
          <div className="space-y-2 max-w-sm">
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="font-black text-white text-base sm:text-lg">
                {operator}
              </h3>
              <span className="px-2 py-0.5 bg-amber-500/15 text-amber-400 font-bold text-xs rounded-md flex items-center gap-1 border border-amber-500/30">
                <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" /> {rating} ({numReviews})
              </span>
            </div>

            <p className="text-xs font-semibold text-[#A1A1AA]">
              {busType}
            </p>

            {/* Amenities & Badges */}
            <div className="flex items-center gap-2 text-[11px] text-[#A1A1AA] flex-wrap pt-1">
              <span className="px-2.5 py-0.5 bg-[#03B3C3]/15 text-[#03B3C3] font-bold rounded-full border border-[#03B3C3]/30 flex items-center gap-1">
                <ShieldCheck className="w-3 h-3" /> Primo Operator
              </span>
              <span className="px-2.5 py-0.5 bg-emerald-500/15 text-emerald-400 font-bold rounded-full border border-emerald-500/30 flex items-center gap-1">
                <Wifi className="w-3 h-3" /> Free Wi-Fi
              </span>
              <span className="px-2.5 py-0.5 bg-purple-500/15 text-purple-400 font-bold rounded-full border border-purple-500/30 flex items-center gap-1">
                <Power className="w-3 h-3" /> Charging Point
              </span>
            </div>
          </div>

          {/* Center Route Timeline */}
          <div className="flex-1 space-y-1 text-xs">
            <div className="flex items-center justify-between font-bold text-white text-base">
              <div>
                <span className="text-xl font-black block text-white">{departureTime}</span>
                <p className="text-xs font-semibold text-[#D1D5DB]">{source}</p>
                <span className="text-[10px] text-[#9CA3AF] font-medium">Boarding Terminal</span>
              </div>

              <div className="text-center px-4 space-y-1">
                <span className="text-[11px] text-[#9CA3AF] font-medium">{duration}</span>
                <div className="relative flex items-center justify-center w-28 sm:w-36">
                  <div className="h-0.5 w-full bg-white/20 rounded"></div>
                  <Bus className="w-4 h-4 text-[#03B3C3] absolute bg-[#111111] px-0.5" />
                </div>
                <span className="text-[10px] text-emerald-400 font-bold block">14 Seats Left</span>
              </div>

              <div className="text-right">
                <span className="text-xl font-black block text-white">{arrivalTime}</span>
                <p className="text-xs font-semibold text-[#D1D5DB]">{destination}</p>
                <span className="text-[10px] text-[#9CA3AF] font-medium">Drop Terminal</span>
              </div>
            </div>
          </div>

          {/* Right Fare & View Seats Toggle */}
          <div className="flex md:flex-col items-center md:items-end justify-between w-full md:w-auto pt-4 md:pt-0 border-t md:border-t-0 border-white/10 gap-3">
            <div className="text-right">
              <span className="text-[10px] text-[#9CA3AF] font-semibold block uppercase tracking-wider">Starts From</span>
              <span className="text-2xl font-black text-white">
                ₹{lowestPrice}
              </span>
              <span className="text-[10px] text-emerald-400 font-bold block">On-Time Guarantee</span>
            </div>

            <button
              type="button"
              onClick={() => setShowSeatView(!showSeatView)}
              className="px-6 py-3 bg-gradient-to-r from-[#03B3C3] to-[#6750A2] hover:opacity-90 text-white font-bold text-xs rounded-2xl shadow-lg flex items-center gap-2 transition-all"
            >
              {showSeatView ? 'Hide Seat Map' : 'Select Seats'}
              {showSeatView ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* Expandable Seat Selection Grid */}
        {showSeatView && (
          <div className="p-6 bg-[#171717] border-t border-white/10">
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
    </SpotlightCard>
  );
}
