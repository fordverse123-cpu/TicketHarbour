import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Plane, ArrowRight, Info, Luggage } from 'lucide-react';
import FlightDetails from './FlightDetails';
import SpotlightCard from '../SpotlightCard';

export default function FlightCard({ flight, onSelect }) {
  const [showDetailsModal, setShowDetailsModal] = useState(false);

  const {
    _id,
    title = 'IndiGo Flight 6E 1234',
    slug,
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

  const lowestPrice = pricingTiers?.reduce(
    (min, p) => (p.price < min ? p.price : min),
    pricingTiers[0]?.price || 5499
  );

  const getAirlineColor = (name) => {
    if (name.includes('IndiGo')) return 'bg-indigo-600 text-white';
    if (name.includes('Air India')) return 'bg-red-700 text-white';
    if (name.includes('Akasa')) return 'bg-orange-600 text-white';
    if (name.includes('SpiceJet')) return 'bg-amber-600 text-white';
    if (name.includes('Vistara')) return 'bg-purple-900 text-white';
    return 'bg-[#03B3C3] text-white';
  };

  return (
    <SpotlightCard className="w-full h-full rounded-3xl overflow-hidden border border-white/10 bg-[#111111]">
      <div className="bg-[#111111] overflow-hidden space-y-0 h-full">
        <div className="p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          {/* Airline Logo & Name */}
          <div className="flex items-center gap-3.5 max-w-sm">
            <div className={`w-12 h-12 rounded-2xl ${getAirlineColor(airline)} shadow-md flex items-center justify-center font-black text-lg shrink-0`}>
              ✈️
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-black text-white text-base sm:text-lg">
                  {airline}
                </h3>
                <span className="px-2 py-0.5 bg-[#03B3C3]/15 text-[#03B3C3] border border-[#03B3C3]/30 font-mono font-bold text-xs rounded-md">
                  {flightNumber}
                </span>
              </div>
              <p className="text-xs text-[#9CA3AF]">
                Airbus A320neo • Economy & Business
              </p>
            </div>
          </div>

          {/* Flight Route Timeline */}
          <div className="flex-1 space-y-1 text-xs">
            <div className="flex items-center justify-between font-bold text-white text-base">
              <div>
                <span className="text-xl font-black block text-white">{departureTime}</span>
                <p className="text-xs font-semibold text-[#D1D5DB]">{source}</p>
              </div>

              <div className="text-center px-4 space-y-1">
                <span className="text-[11px] text-[#9CA3AF] font-medium">{duration}</span>
                <div className="relative flex items-center justify-center w-28 sm:w-36">
                  <div className="h-0.5 w-full bg-white/10 rounded"></div>
                  <Plane className="w-4 h-4 text-[#03B3C3] absolute bg-[#111111] px-0.5 rotate-45" />
                </div>
                <span className="text-[10px] text-emerald-400 font-bold block">Non-stop</span>
              </div>

              <div className="text-right">
                <span className="text-xl font-black block text-white">{arrivalTime}</span>
                <p className="text-xs font-semibold text-[#D1D5DB]">{destination}</p>
              </div>
            </div>
          </div>

          {/* Baggage & Refundable Badges */}
          <div className="hidden lg:flex flex-col gap-1 text-[11px] text-[#9CA3AF]">
            <span className="flex items-center gap-1 font-semibold text-[#D1D5DB]">
              <Luggage className="w-3.5 h-3.5 text-[#03B3C3]" /> 15 kg Check-in / 7 kg Cabin
            </span>
            <span className="px-2.5 py-0.5 bg-emerald-500/15 text-emerald-400 font-bold rounded-md w-fit border border-emerald-500/30">
              Partially Refundable
            </span>
          </div>

          {/* Fare & Actions */}
          <div className="flex md:flex-col items-center md:items-end justify-between w-full md:w-auto pt-4 md:pt-0 border-t md:border-t-0 border-white/10 gap-3">
            <div className="text-right">
              <span className="text-[10px] text-[#9CA3AF] font-semibold block uppercase tracking-wider">Fare per passenger</span>
              <span className="text-2xl font-black text-white">
                ₹{lowestPrice}
              </span>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setShowDetailsModal(true)}
                className="p-2.5 bg-[#151515] border border-white/10 text-[#D1D5DB] rounded-xl text-xs font-bold hover:bg-white/5 transition-colors cursor-pointer"
                title="Flight Details & Baggage Policy"
              >
                <Info className="w-4 h-4 text-[#03B3C3]" />
              </button>

              <Link
                to={`/listings/${slug || _id}`}
                className="px-5 py-3 bg-gradient-to-r from-[#03B3C3] to-[#6750A2] hover:opacity-90 text-white font-bold text-xs rounded-2xl shadow-lg flex items-center gap-1.5 transition-all"
              >
                Select Flight <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </div>

        {/* Flight Details Modal */}
        {showDetailsModal && (
          <FlightDetails
            flight={flight}
            onClose={() => setShowDetailsModal(false)}
          />
        )}
      </div>
    </SpotlightCard>
  );
}
