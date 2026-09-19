import React, { useState } from 'react';
import { ArrowLeftRight, Calendar, Search, Train, ShieldCheck, MapPin, Check, Sparkles } from 'lucide-react';
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
    <div className="bg-white dark:bg-slate-800 rounded-3xl border border-slate-200 dark:border-slate-700 shadow-xl overflow-hidden transition-all">
      {/* Header bar inspired by Indian Railway Booking patterns */}
      <div className="bg-gradient-to-r from-blue-950 via-slate-900 to-indigo-950 text-white px-6 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-blue-900/50">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-red-600 rounded-2xl shadow-md">
            <Train className="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 className="font-black text-lg tracking-wide flex items-center gap-2 text-white">
              IRCTC-Inspired Train Reservation
            </h2>
            <p className="text-xs text-blue-200">
              Smart Rail Booking • Tatkal & Premium Quota Supported • TicketHarbour
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 text-xs text-blue-200">
          <span className="px-3 py-1 bg-white/10 rounded-full font-bold flex items-center gap-1 border border-white/10 text-emerald-300">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" /> Authorized Railway Partner
          </span>
        </div>
      </div>

      {/* Main Search Form */}
      <form onSubmit={handleSearchSubmit} className="p-6 space-y-6">
        {/* From & To Station Pickers with Swap */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
          {/* From Station */}
          <div className="md:col-span-5 relative">
            <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">
              From Station
            </label>
            <div
              onClick={() => {
                setShowFromDropdown(true);
                setShowToDropdown(false);
              }}
              className="p-3.5 bg-slate-50 dark:bg-slate-700/60 border border-slate-200 dark:border-slate-600 rounded-2xl cursor-pointer hover:border-blue-600 dark:hover:border-blue-500 transition-colors flex items-center gap-3"
            >
              <MapPin className="w-5 h-5 text-blue-600 shrink-0" />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="font-black text-slate-900 dark:text-white text-base">
                    {fromStation.city}
                  </span>
                  <span className="px-2 py-0.5 bg-blue-100 dark:bg-blue-950 text-blue-800 dark:text-blue-300 font-mono font-bold text-xs rounded-md">
                    {fromStation.code}
                  </span>
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400 truncate">{fromStation.name}</p>
              </div>
            </div>

            {/* From Station Dropdown */}
            {showFromDropdown && (
              <div className="absolute top-full left-0 right-0 mt-2 z-30 bg-white dark:bg-slate-800 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-700 p-3 max-h-72 overflow-y-auto">
                <input
                  type="text"
                  placeholder="Type city or station code (e.g. SBC, NDLS)..."
                  value={fromSearchText}
                  onChange={(e) => setFromSearchText(e.target.value)}
                  className="w-full p-2.5 mb-2 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl text-xs dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-600"
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
                      className="w-full p-2.5 text-left hover:bg-blue-50 dark:hover:bg-slate-700 rounded-xl flex items-center justify-between text-xs transition-colors"
                    >
                      <div>
                        <span className="font-bold text-slate-900 dark:text-white">
                          {st.city} ({st.code})
                        </span>
                        <p className="text-[11px] text-slate-400">{st.name}</p>
                      </div>
                      {fromStation.code === st.code && <Check className="w-4 h-4 text-blue-600" />}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Swap Button */}
          <div className="md:col-span-2 flex justify-center py-2 md:py-0">
            <button
              type="button"
              onClick={handleSwap}
              className="p-3.5 bg-blue-50 dark:bg-slate-700 hover:bg-blue-600 hover:text-white text-blue-700 dark:text-blue-300 rounded-full border border-blue-200 dark:border-slate-600 shadow-md transition-all group"
              title="Swap From and To stations"
            >
              <ArrowLeftRight className="w-5 h-5 group-hover:rotate-180 transition-transform duration-300" />
            </button>
          </div>

          {/* To Station */}
          <div className="md:col-span-5 relative">
            <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">
              To Station
            </label>
            <div
              onClick={() => {
                setShowToDropdown(true);
                setShowFromDropdown(false);
              }}
              className="p-3.5 bg-slate-50 dark:bg-slate-700/60 border border-slate-200 dark:border-slate-600 rounded-2xl cursor-pointer hover:border-blue-600 dark:hover:border-blue-500 transition-colors flex items-center gap-3"
            >
              <MapPin className="w-5 h-5 text-red-600 shrink-0" />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="font-black text-slate-900 dark:text-white text-base">
                    {toStation.city}
                  </span>
                  <span className="px-2 py-0.5 bg-red-100 dark:bg-red-950 text-red-800 dark:text-red-300 font-mono font-bold text-xs rounded-md">
                    {toStation.code}
                  </span>
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400 truncate">{toStation.name}</p>
              </div>
            </div>

            {/* To Station Dropdown */}
            {showToDropdown && (
              <div className="absolute top-full left-0 right-0 mt-2 z-30 bg-white dark:bg-slate-800 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-700 p-3 max-h-72 overflow-y-auto">
                <input
                  type="text"
                  placeholder="Type city or station code..."
                  value={toSearchText}
                  onChange={(e) => setToSearchText(e.target.value)}
                  className="w-full p-2.5 mb-2 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl text-xs dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-600"
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
                      className="w-full p-2.5 text-left hover:bg-blue-50 dark:hover:bg-slate-700 rounded-xl flex items-center justify-between text-xs transition-colors"
                    >
                      <div>
                        <span className="font-bold text-slate-900 dark:text-white">
                          {st.city} ({st.code})
                        </span>
                        <p className="text-[11px] text-slate-400">{st.name}</p>
                      </div>
                      {toStation.code === st.code && <Check className="w-4 h-4 text-blue-600" />}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Date, Class, Quota Bar */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {/* Journey Date */}
          <div className="space-y-1">
            <div className="flex items-center justify-between">
              <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                Journey Date
              </label>
              <div className="flex gap-1 text-[10px] font-bold">
                <button
                  type="button"
                  onClick={() => setQuickDate(0)}
                  className="text-blue-600 hover:underline px-1"
                >
                  Today
                </button>
                <span>•</span>
                <button
                  type="button"
                  onClick={() => setQuickDate(1)}
                  className="text-blue-600 hover:underline px-1"
                >
                  Tomorrow
                </button>
              </div>
            </div>
            <div className="relative">
              <Calendar className="w-4 h-4 text-blue-600 absolute left-3.5 top-3.5 pointer-events-none" />
              <input
                type="date"
                value={travelDate}
                min={new Date().toISOString().split('T')[0]}
                onChange={(e) => setTravelDate(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-2xl text-xs font-bold dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-600"
              />
            </div>
          </div>

          {/* Class Selector */}
          <div className="space-y-1">
            <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              Class
            </label>
            <select
              value={selectedClass}
              onChange={(e) => setSelectedClass(e.target.value)}
              className="w-full p-3 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-2xl text-xs font-bold dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-600"
            >
              {TRAIN_CLASSES.map((c) => (
                <option key={c.code} value={c.code}>
                  {c.label}
                </option>
              ))}
            </select>
          </div>

          {/* Quota Selector */}
          <div className="space-y-1">
            <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              Quota
            </label>
            <select
              value={selectedQuota}
              onChange={(e) => setSelectedQuota(e.target.value)}
              className="w-full p-3 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-2xl text-xs font-bold dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-600"
            >
              {QUOTAS.map((q) => (
                <option key={q.code} value={q.code}>
                  {q.label} Quota ({q.code})
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Submit Search Button */}
        <button
          type="submit"
          className="w-full py-4 bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 hover:from-blue-800 hover:to-indigo-800 text-white font-black text-sm rounded-2xl shadow-xl hover:shadow-blue-900/30 transition-all flex items-center justify-center gap-2"
        >
          <Search className="w-5 h-5 text-red-400" /> Search Trains
        </button>
      </form>
    </div>
  );
}
