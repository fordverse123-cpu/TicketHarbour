import React, { useState } from 'react';
import { ArrowLeftRight, Calendar, Search, Train, ShieldCheck, MapPin, Check } from 'lucide-react';
import { TRAIN_STATIONS } from '../../data/locationData';

const TRAIN_CLASSES = [
  { code: 'ALL', label: 'All Classes' },
  { code: '1A', label: 'AC 1st Class (1A)' },
  { code: '2A', label: 'AC 2 Tier (2A)' },
  { code: '3A', label: 'AC 3 Tier (3A)' },
  { code: 'SL', label: 'Sleeper (SL)' },
  { code: 'CC', label: 'AC Chair Car (CC)' },
  { code: '2S', label: 'Second Seating (2S)' },
  { code: 'EC', label: 'Executive Chair (EC)' },
];

const QUOTAS = [
  { code: 'GN', label: 'General' },
  { code: 'TQ', label: 'Tatkal' },
  { code: 'PT', label: 'Premium Tatkal' },
  { code: 'LD', label: 'Ladies' },
  { code: 'SS', label: 'Senior Citizen' },
];

export default function TrainSearch({ onSearch, initialFrom = 'SBC', initialTo = 'NDLS' }) {
  const [fromStation, setFromStation] = useState(
    TRAIN_STATIONS.find((s) => s.code === initialFrom) || TRAIN_STATIONS[0]
  );
  const [toStation, setToStation] = useState(
    TRAIN_STATIONS.find((s) => s.code === initialTo) || TRAIN_STATIONS[1]
  );
  const [travelDate, setTravelDate] = useState(() => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return tomorrow.toISOString().split('T')[0];
  });
  const [quickDateState, setQuickDateState] = useState(1); // 0 = Today, 1 = Tomorrow
  const [selectedClass, setSelectedClass] = useState('ALL');
  const [selectedQuota, setSelectedQuota] = useState('GN');

  // Autocomplete dropdown toggles & search text
  const [showFromDropdown, setShowFromDropdown] = useState(false);
  const [showToDropdown, setShowToDropdown] = useState(false);
  const [fromSearchText, setFromSearchText] = useState('');
  const [toSearchText, setToSearchText] = useState('');

  const handleSwap = () => {
    const temp = fromStation;
    setFromStation(toStation);
    setToStation(temp);
  };

  const setQuickDate = (daysFromToday) => {
    const d = new Date();
    d.setDate(d.getDate() + daysFromToday);
    setTravelDate(d.toISOString().split('T')[0]);
    setQuickDateState(daysFromToday);
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (onSearch) {
      onSearch({
        from: fromStation,
        to: toStation,
        date: travelDate,
        trainClass: selectedClass,
        quota: selectedQuota,
      });
    }
  };

  const filteredFromStations = TRAIN_STATIONS.filter(
    (s) =>
      s.city.toLowerCase().includes(fromSearchText.toLowerCase()) ||
      s.code.toLowerCase().includes(fromSearchText.toLowerCase()) ||
      s.name.toLowerCase().includes(fromSearchText.toLowerCase())
  );

  const filteredToStations = TRAIN_STATIONS.filter(
    (s) =>
      s.city.toLowerCase().includes(toSearchText.toLowerCase()) ||
      s.code.toLowerCase().includes(toSearchText.toLowerCase()) ||
      s.name.toLowerCase().includes(toSearchText.toLowerCase())
  );

  return (
    <div className="glass-panel rounded-3xl border border-[var(--th-border)] shadow-2xl overflow-hidden transition-all">
      {/* Header bar */}
      <div className="bg-gradient-to-r from-[var(--th-accent-2)]/30 via-[var(--th-accent)]/20 to-transparent px-6 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[var(--th-border)]">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-gradient-to-r from-[var(--th-accent)] to-[var(--th-accent-2)] rounded-2xl shadow-md">
            <Train className="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 className="font-black text-lg sm:text-xl tracking-wide text-[var(--th-text)]">
              Indian Railways Train Reservation
            </h2>
            <p className="text-xs text-[var(--th-text-secondary)]">
              IRCTC Authorized • Tatkal & Premium Quota Supported • TicketHarbour
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 text-xs">
          <span className="px-3 py-1 bg-[var(--th-surface-2)] rounded-full font-bold flex items-center gap-1.5 border border-[var(--th-border)] text-[var(--th-success)]">
            <ShieldCheck className="w-4 h-4 text-[var(--th-success)]" /> Authorized Railway Partner
          </span>
        </div>
      </div>

      {/* Main Search Form */}
      <form onSubmit={handleSearchSubmit} className="p-6 space-y-6">
        {/* Row 1: From Station ⇄ Swap ⇄ To Station */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
          {/* From Station */}
          <div className="md:col-span-5 relative">
            <label className="block text-xs font-bold text-[var(--th-text-secondary)] uppercase tracking-wider mb-1.5">
              From Station
            </label>
            <div
              onClick={() => {
                setShowFromDropdown(true);
                setShowToDropdown(false);
              }}
              className="p-4 bg-[var(--th-surface-2)] border border-[var(--th-border)] rounded-2xl cursor-pointer hover:border-[var(--th-accent)] transition-all flex items-center gap-3 shadow-sm"
            >
              <MapPin className="w-6 h-6 text-[var(--th-accent)] shrink-0" />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="font-black text-slate-900 dark:text-white text-xl sm:text-2xl leading-tight truncate">
                    {fromStation.city}
                  </span>
                  <span className="px-2 py-0.5 bg-[var(--th-accent)]/20 text-[var(--th-accent)] font-mono font-bold text-xs rounded-md border border-[var(--th-accent)]/30">
                    {fromStation.code}
                  </span>
                </div>
                <p className="text-xs text-[var(--th-text-secondary)] truncate">{fromStation.name}</p>
              </div>
            </div>

            {/* From Station Dropdown */}
            {showFromDropdown && (
              <div className="absolute top-full left-0 right-0 mt-2 z-50 bg-[var(--th-card)] rounded-2xl shadow-2xl border border-[var(--th-border)] p-3 max-h-72 overflow-y-auto">
                <input
                  type="text"
                  placeholder="Type city or station code (e.g. SBC, NDLS)..."
                  value={fromSearchText}
                  onChange={(e) => setFromSearchText(e.target.value)}
                  className="w-full p-3 mb-2 bg-[var(--th-surface-2)] border border-[var(--th-border)] rounded-xl text-xs text-[var(--th-text)] placeholder-[var(--th-muted)] focus:outline-none focus:border-[var(--th-accent)]"
                  autoFocus
                />
                <div className="space-y-1">
                  {filteredFromStations.map((st) => (
                    <button
                      type="button"
                      key={st.code}
                      onClick={() => {
                        setFromStation(st);
                        setShowFromDropdown(false);
                      }}
                      className="w-full p-2.5 text-left hover:bg-[var(--th-surface-2)] rounded-xl flex items-center justify-between text-xs transition-colors"
                    >
                      <div>
                        <span className="font-bold text-[var(--th-text)]">
                          {st.city} ({st.code})
                        </span>
                        <p className="text-[11px] text-[var(--th-text-secondary)]">{st.name}</p>
                      </div>
                      {fromStation.code === st.code && <Check className="w-4 h-4 text-[var(--th-accent)]" />}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Swap Button */}
          <div className="md:col-span-2 flex justify-center py-1 md:py-0">
            <button
              type="button"
              onClick={handleSwap}
              aria-label="Swap stations"
              className="p-3.5 bg-[var(--th-surface-2)] hover:bg-[var(--th-accent)] hover:text-white text-[var(--th-text)] rounded-full border border-[var(--th-border)] shadow-md transition-all cursor-pointer hover:scale-105 active:scale-95"
              title="Swap From and To stations"
            >
              <ArrowLeftRight className="w-5 h-5" />
            </button>
          </div>

          {/* To Station */}
          <div className="md:col-span-5 relative">
            <label className="block text-xs font-bold text-[var(--th-text-secondary)] uppercase tracking-wider mb-1.5">
              To Station
            </label>
            <div
              onClick={() => {
                setShowToDropdown(true);
                setShowFromDropdown(false);
              }}
              className="p-4 bg-[var(--th-surface-2)] border border-[var(--th-border)] rounded-2xl cursor-pointer hover:border-[var(--th-accent)] transition-all flex items-center gap-3 shadow-sm"
            >
              <MapPin className="w-6 h-6 text-rose-500 shrink-0" />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="font-black text-slate-900 dark:text-white text-xl sm:text-2xl leading-tight truncate">
                    {toStation.city}
                  </span>
                  <span className="px-2 py-0.5 bg-rose-500/20 text-rose-400 font-mono font-bold text-xs rounded-md border border-rose-500/30">
                    {toStation.code}
                  </span>
                </div>
                <p className="text-xs text-[var(--th-text-secondary)] truncate">{toStation.name}</p>
              </div>
            </div>

            {/* To Station Dropdown */}
            {showToDropdown && (
              <div className="absolute top-full left-0 right-0 mt-2 z-50 bg-[var(--th-card)] rounded-2xl shadow-2xl border border-[var(--th-border)] p-3 max-h-72 overflow-y-auto">
                <input
                  type="text"
                  placeholder="Type city or station code..."
                  value={toSearchText}
                  onChange={(e) => setToSearchText(e.target.value)}
                  className="w-full p-3 mb-2 bg-[var(--th-surface-2)] border border-[var(--th-border)] rounded-xl text-xs text-[var(--th-text)] placeholder-[var(--th-muted)] focus:outline-none focus:border-[var(--th-accent)]"
                  autoFocus
                />
                <div className="space-y-1">
                  {filteredToStations.map((st) => (
                    <button
                      type="button"
                      key={st.code}
                      onClick={() => {
                        setToStation(st);
                        setShowToDropdown(false);
                      }}
                      className="w-full p-2.5 text-left hover:bg-[var(--th-surface-2)] rounded-xl flex items-center justify-between text-xs transition-colors"
                    >
                      <div>
                        <span className="font-bold text-[var(--th-text)]">
                          {st.city} ({st.code})
                        </span>
                        <p className="text-[11px] text-[var(--th-text-secondary)]">{st.name}</p>
                      </div>
                      {toStation.code === st.code && <Check className="w-4 h-4 text-[var(--th-accent)]" />}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Row 2: Date | Class | Quota */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {/* Journey Date */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="block text-xs font-bold text-[var(--th-text-secondary)] uppercase tracking-wider">
                Journey Date
              </label>
              <div className="flex gap-1.5 text-[10px] font-bold">
                <button
                  type="button"
                  onClick={() => setQuickDate(0)}
                  className={`px-2 py-0.5 rounded-full transition-all cursor-pointer ${
                    quickDateState === 0
                      ? 'bg-[var(--th-accent)] text-white shadow-sm'
                      : 'text-[var(--th-accent)] hover:underline'
                  }`}
                >
                  Today
                </button>
                <button
                  type="button"
                  onClick={() => setQuickDate(1)}
                  className={`px-2 py-0.5 rounded-full transition-all cursor-pointer ${
                    quickDateState === 1
                      ? 'bg-[var(--th-accent)] text-white shadow-sm'
                      : 'text-[var(--th-accent)] hover:underline'
                  }`}
                >
                  Tomorrow
                </button>
              </div>
            </div>
            <div className="relative">
              <Calendar className="w-5 h-5 text-[var(--th-accent)] absolute left-3.5 top-3.5 pointer-events-none" />
              <input
                type="date"
                value={travelDate}
                min={new Date().toISOString().split('T')[0]}
                onChange={(e) => {
                  setTravelDate(e.target.value);
                  setQuickDateState(-1);
                }}
                className="w-full pl-11 pr-4 py-3 bg-[var(--th-surface-2)] border border-[var(--th-border)] rounded-2xl text-xs font-bold text-[var(--th-text)] focus:outline-none focus:border-[var(--th-accent)]"
              />
            </div>
          </div>

          {/* Class Selector */}
          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-[var(--th-text-secondary)] uppercase tracking-wider">
              Class
            </label>
            <select
              value={selectedClass}
              onChange={(e) => setSelectedClass(e.target.value)}
              className="w-full p-3 bg-[var(--th-surface-2)] border border-[var(--th-border)] rounded-2xl text-xs font-bold text-[var(--th-text)] focus:outline-none focus:border-[var(--th-accent)]"
            >
              {TRAIN_CLASSES.map((c) => (
                <option
                  key={c.code}
                  value={c.code}
                  className="bg-[var(--th-card)] text-[var(--th-text)] py-1"
                >
                  {c.label}
                </option>
              ))}
            </select>
          </div>

          {/* Quota Selector */}
          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-[var(--th-text-secondary)] uppercase tracking-wider">
              Quota
            </label>
            <select
              value={selectedQuota}
              onChange={(e) => setSelectedQuota(e.target.value)}
              className="w-full p-3 bg-[var(--th-surface-2)] border border-[var(--th-border)] rounded-2xl text-xs font-bold text-[var(--th-text)] focus:outline-none focus:border-[var(--th-accent)]"
            >
              {QUOTAS.map((q) => (
                <option
                  key={q.code}
                  value={q.code}
                  className="bg-[var(--th-card)] text-[var(--th-text)] py-1"
                >
                  {q.label} Quota ({q.code})
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Submit Search Button */}
        <button
          type="submit"
          className="w-full h-14 bg-gradient-to-r from-[var(--th-accent)] to-[var(--th-accent-2)] hover:opacity-95 text-white font-black text-base rounded-2xl shadow-xl transition-all flex items-center justify-center gap-2 cursor-pointer"
        >
          <Search className="w-5 h-5 text-white" /> Search Trains
        </button>
      </form>
    </div>
  );
}
