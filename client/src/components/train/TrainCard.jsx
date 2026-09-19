import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Train, ArrowRight, Info, CheckCircle2, ShieldCheck } from 'lucide-react';
import TrainDetailsModal from './TrainDetailsModal';
import BorderGlow from '../ui/BorderGlow';
import { useTheme } from '../../context/ThemeContext';

export default function TrainCard({ train, onSelectClass }) {
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

  return (
    <BorderGlow
      borderRadius={24}
      className="w-full h-full"
      backgroundColor={isDark ? '#151515' : '#FFFFFF'}
      glowIntensity={isDark ? 0.50 : 0.35}
    >
      <div className="glass-card flex flex-col md:flex-row border border-[var(--th-border)] rounded-3xl overflow-hidden shadow-xl transition-all w-full">
        {/* Left Main Information Panel (~65-70%) */}
        <div className="p-6 flex-1 space-y-5 bg-[var(--th-card)] text-[var(--th-text)]">
          {/* Train Header */}
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[var(--th-border)] pb-3">
            <div className="flex items-center gap-3">
              <span className="px-3 py-1 bg-[var(--th-accent)]/20 text-[var(--th-accent)] border border-[var(--th-accent)]/30 font-mono font-bold text-xs rounded-xl shadow-sm">
                #{trainNo}
              </span>
              <h3 className="font-black text-[var(--th-text)] text-xl sm:text-2xl tracking-tight">
                {title}
              </h3>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-[11px] font-bold text-[var(--th-text-secondary)] bg-[var(--th-surface-2)] px-2.5 py-1 rounded-lg border border-[var(--th-border)]">
                Runs Daily
              </span>
              <span className="text-[11px] font-bold text-[var(--th-success)] bg-[var(--th-success)]/10 px-2.5 py-1 rounded-lg border border-[var(--th-success)]/20">
                Pantry Car
              </span>
            </div>
          </div>

          {/* Departure -> Duration -> Arrival Timeline */}
          <div className="grid grid-cols-12 gap-2 items-center py-2 text-xs">
            {/* Departure */}
            <div className="col-span-4 space-y-1">
              <span className="text-2xl sm:text-4xl font-black text-[var(--th-text)] block tracking-tight">
                {departureTime}
              </span>
              <p className="font-bold text-sm text-[var(--th-text-secondary)] truncate">{source}</p>
            </div>

            {/* Duration Graphic */}
            <div className="col-span-4 text-center space-y-1.5">
              <span className="text-xs text-[var(--th-muted)] font-semibold block">{duration}</span>
              <div className="relative flex items-center justify-center">
                <div className="h-0.5 w-full bg-[var(--th-border)] rounded"></div>
                <Train className="w-5 h-5 text-[var(--th-accent)] absolute bg-[var(--th-card)] px-0.5" />
              </div>
              <span className="text-[11px] font-bold text-[var(--th-muted)] block">Superfast</span>
            </div>

            {/* Arrival */}
            <div className="col-span-4 text-right space-y-1">
              <span className="text-2xl sm:text-4xl font-black text-[var(--th-text)] block tracking-tight">
                {arrivalTime}
              </span>
              <p className="font-bold text-sm text-[var(--th-text-secondary)] truncate">{destination}</p>
            </div>
          </div>

          {/* Class Selection Chips & Availability Status */}
          <div className="space-y-2.5 pt-2 border-t border-[var(--th-border)]">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-[var(--th-muted)] uppercase tracking-wider block">
                Select Class & Availability
              </span>
              <button
                type="button"
                onClick={() => setShowDetailsModal(true)}
                className="text-xs font-bold text-[var(--th-accent)] flex items-center gap-1 hover:underline cursor-pointer"
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

                let statusColorClass = 'text-[var(--th-success)]';
                if (isRAC) statusColorClass = 'text-[var(--th-accent)]';
                else if (isWL) statusColorClass = 'text-[var(--th-warning)]';
                else if (!isAvailable) statusColorClass = 'text-[var(--th-danger)]';

                return (
                  <button
                    type="button"
                    key={t.tierName}
                    onClick={() => {
                      setSelectedClass(t.classType || t.tierName);
                      if (onSelectClass) onSelectClass(t);
                    }}
                    className={`p-3 rounded-2xl border text-left transition-all min-w-[110px] cursor-pointer ${
                      isSelected
                        ? 'border-[var(--th-accent)] bg-[var(--th-accent)]/15 ring-2 ring-[var(--th-accent)]/30 shadow-md'
                        : 'border-[var(--th-border)] bg-[var(--th-surface-2)] hover:border-[var(--th-accent)]/50'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-black text-[var(--th-text)] text-sm">
                        {t.classType || t.tierName}
                      </span>
                      <span className="font-bold text-[var(--th-text)] text-xs">
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

        {/* Right Pricing & Booking Panel (~30-35%) */}
        <div className="bg-[var(--th-surface-2)] p-6 md:w-72 border-t md:border-t-0 md:border-l border-[var(--th-border)] flex flex-col justify-between space-y-4">
          <div className="space-y-1.5">
            <span className="text-xs text-[var(--th-muted)] font-semibold uppercase tracking-wider block">
              Class Fare ({selectedClass})
            </span>
            <div className="text-3xl sm:text-4xl font-black text-[var(--th-text)] tracking-tight">
              ₹{activeTier?.price || 500}
            </div>
            <span className="text-xs text-[var(--th-success)] font-bold block flex items-center gap-1">
              <CheckCircle2 className="w-4 h-4" /> Free Cancellation Supported
            </span>
          </div>

          <div className="space-y-2.5">
            <button
              type="button"
              onClick={() => onSelectClass && onSelectClass(activeTier)}
              className="w-full h-14 bg-gradient-to-r from-[var(--th-accent)] to-[var(--th-accent-2)] hover:opacity-95 text-white font-black text-sm rounded-2xl shadow-lg flex items-center justify-center gap-2 transition-all cursor-pointer"
            >
              Select Berth / Book Now <ArrowRight className="w-4 h-4" />
            </button>

            <button
              type="button"
              onClick={() => setShowDetailsModal(true)}
              className="w-full py-2.5 bg-[var(--th-card)] hover:bg-[var(--th-surface-2)] border border-[var(--th-border)] text-[var(--th-text)] font-semibold text-xs rounded-xl flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
            >
              <Info className="w-4 h-4 text-[var(--th-accent)]" /> Route Schedule
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
