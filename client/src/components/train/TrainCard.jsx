import React, { useState } from 'react';
import { Train, ArrowRight, Info, CheckCircle2 } from 'lucide-react';
import TrainDetailsModal from './TrainDetailsModal';
import BorderGlow from '../ui/BorderGlow';
import { useTheme } from '../../context/ThemeContext';

export default function TrainCard({ train, onBookNow }) {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  const [showDetailsModal, setShowDetailsModal] = useState(false);

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
    { tierName: 'Sleeper (SL)', price: 780, classType: 'SL', totalCapacity: 100, status: 'AVAILABLE 64' },
    { tierName: 'AC 3 Tier (3A)', price: 1850, classType: '3A', totalCapacity: 40, status: 'AVAILABLE 28' },
    { tierName: 'AC 2 Tier (2A)', price: 2750, classType: '2A', totalCapacity: 20, status: 'RAC 4' },
    { tierName: 'AC 1st Class (1A)', price: 4600, classType: '1A', totalCapacity: 10, status: 'AVAILABLE 2' },
  ];

  const activeTier = tiers.find((t) => t.classType === selectedClass) || tiers[0];

  const handleBooking = () => {
    if (onBookNow) {
      onBookNow(train, activeTier);
    }
  };

  return (
    <BorderGlow
      borderRadius={24}
      className="w-full h-full"
      backgroundColor={isDark ? '#151515' : '#FFFFFF'}
      colors={isDark ? ['#03B3C3', '#6750A2', '#D856BF'] : ['#0891B2', '#4F46E5', '#C026A3']}
      glowColor={isDark ? '185 80 65' : '200 65 50'}
      glowRadius={isDark ? 24 : 22}
      glowIntensity={isDark ? 0.50 : 0.35}
    >
      <div className="glass-card flex flex-col md:flex-row border border-[var(--border)] rounded-3xl overflow-hidden shadow-xl transition-all w-full bg-[var(--card)]">
        {/* Left Main Information Panel */}
        <div className="p-6 flex-1 space-y-5 text-[var(--foreground)]">
          {/* Train Header */}
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[var(--border)] pb-3">
            <div className="flex items-center gap-3">
              <span className="px-3 py-1 bg-blue-100 dark:bg-blue-950 text-[#1D4ED8] dark:text-[#60A5FA] border border-blue-200 dark:border-blue-800 font-mono font-bold text-xs rounded-xl shadow-sm">
                #{trainNo}
              </span>
              <h3 className="font-black text-[#111827] dark:text-[#FFFFFF] text-xl sm:text-2xl tracking-tight">
                {title}
              </h3>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-[11px] font-bold text-[#4B5563] dark:text-[#A1A1AA] bg-[var(--muted)] px-2.5 py-1 rounded-lg border border-[var(--border)]">
                Runs Daily
              </span>
              <span className="text-[11px] font-bold text-[#059669] dark:text-[#22C55E] bg-emerald-50 dark:bg-emerald-950/60 px-2.5 py-1 rounded-lg border border-emerald-200 dark:border-emerald-800">
                Pantry Car
              </span>
            </div>
          </div>

          {/* Departure -> Duration -> Arrival Timeline */}
          <div className="grid grid-cols-12 gap-2 items-center py-2 text-xs">
            {/* Departure */}
            <div className="col-span-4 space-y-1">
              <span className="text-2xl sm:text-4xl font-black text-[#111827] dark:text-[#FFFFFF] block tracking-tight">
                {departureTime}
              </span>
              <p className="font-bold text-sm text-[#374151] dark:text-[#D1D5DB] truncate">{source}</p>
            </div>

            {/* Duration Graphic */}
            <div className="col-span-4 text-center space-y-1.5">
              <span className="text-xs text-[#6B7280] dark:text-[#9CA3AF] font-semibold block">{duration}</span>
              <div className="relative flex items-center justify-center">
                <div className="h-0.5 w-full bg-[var(--border)] rounded"></div>
                <Train className="w-5 h-5 text-[var(--primary)] absolute bg-[var(--card)] px-0.5" />
              </div>
              <span className="text-[11px] font-bold text-[#6B7280] dark:text-[#9CA3AF] block">Superfast</span>
            </div>

            {/* Arrival */}
            <div className="col-span-4 text-right space-y-1">
              <span className="text-2xl sm:text-4xl font-black text-[#111827] dark:text-[#FFFFFF] block tracking-tight">
                {arrivalTime}
              </span>
              <p className="font-bold text-sm text-[#374151] dark:text-[#D1D5DB] truncate">{destination}</p>
            </div>
          </div>

          {/* Class Selection Chips & Availability Status */}
          <div className="space-y-2.5 pt-2 border-t border-[var(--border)]">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-[#6B7280] dark:text-[#9CA3AF] uppercase tracking-wider block">
                Select Class & Availability
              </span>
              <button
                type="button"
                onClick={() => setShowDetailsModal(true)}
                className="text-xs font-bold text-[var(--primary)] flex items-center gap-1 hover:underline cursor-pointer"
              >
                <Info className="w-4 h-4" /> Route Details
              </button>
            </div>

            <div className="flex flex-wrap gap-2.5">
              {tiers.map((t) => {
                const isSelected = selectedClass === (t.classType || t.tierName);
                const statusStr = t.status || `AVAILABLE ${t.totalCapacity || 50}`;
                const isAvailable = statusStr.includes('AVAILABLE');
                const isRAC = statusStr.includes('RAC');
                const isWL = statusStr.includes('WL') || statusStr.includes('WAIT');

                let statusColorClass = 'text-[#059669] dark:text-[#22C55E]';
                if (isRAC) statusColorClass = 'text-[var(--primary)]';
                else if (isWL) statusColorClass = 'text-[#D97706] dark:text-[#F59E0B]';
                else if (!isAvailable) statusColorClass = 'text-[#DC2626] dark:text-[#EF4444]';

                return (
                  <button
                    type="button"
                    key={t.tierName}
                    onClick={() => {
                      setSelectedClass(t.classType || t.tierName);
                    }}
                    className={`p-3 rounded-2xl border text-left transition-all min-w-[110px] cursor-pointer ${
                      isSelected
                        ? 'border-[var(--primary)] bg-[var(--primary)]/10 ring-2 ring-[var(--primary)]/30 shadow-md'
                        : 'border-[var(--border)] bg-[var(--muted)] hover:border-[var(--primary)]/50'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-black text-[#111827] dark:text-[#FFFFFF] text-sm">
                        {t.classType || t.tierName}
                      </span>
                      <span className="font-bold text-[#111827] dark:text-[#FFFFFF] text-xs">
                        ₹{t.price}
                      </span>
                    </div>

                    <div className="mt-1.5">
                      <span className={`text-[11px] font-black uppercase ${statusColorClass}`}>
                        {statusStr}
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right Pricing & Booking Panel */}
        <div className="bg-[var(--muted)] p-6 md:w-72 border-t md:border-t-0 md:border-l border-[var(--border)] flex flex-col justify-between space-y-4">
          <div className="space-y-1.5">
            <span className="text-xs text-[#4B5563] dark:text-[#A1A1AA] font-semibold uppercase tracking-wider block">
              Class Fare ({selectedClass})
            </span>
            <div className="text-3xl sm:text-4xl font-black text-[#111827] dark:text-[#FFFFFF] tracking-tight">
              ₹{activeTier?.price || 500}
            </div>
            <span className="text-xs text-[#059669] dark:text-[#22C55E] font-bold block flex items-center gap-1">
              <CheckCircle2 className="w-4 h-4" /> Free Cancellation Supported
            </span>
          </div>

          <div className="space-y-2.5">
            <button
              type="button"
              onClick={handleBooking}
              className="w-full h-14 bg-gradient-to-r from-[var(--primary)] to-[var(--secondary)] hover:opacity-95 text-white font-black text-sm rounded-2xl shadow-lg flex items-center justify-center gap-2 transition-all cursor-pointer"
            >
              Book Now <ArrowRight className="w-4 h-4" />
            </button>

            <button
              type="button"
              onClick={() => setShowDetailsModal(true)}
              className="w-full py-2.5 bg-[var(--card)] hover:bg-[var(--muted)] border border-[var(--border)] text-[var(--foreground)] font-semibold text-xs rounded-xl flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
            >
              <Info className="w-4 h-4 text-[var(--primary)]" /> Route Schedule
            </button>
          </div>
        </div>

        {/* Train Details Modal */}
        {showDetailsModal && (
          <TrainDetailsModal train={train} onClose={() => setShowDetailsModal(false)} />
        )}
      </div>
    </BorderGlow>
  );
}
