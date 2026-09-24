import React, { useState, useEffect } from 'react';
import { ArrowLeftRight, Calendar, Search, Plane, Users, ShieldCheck, Check, Info } from 'lucide-react';
import { AIRPORTS, findAirportByInput } from '../../data/locationData';

const CABIN_CLASSES = [
  { key: 'Economy', label: 'Economy Class' },
  { key: 'Premium Economy', label: 'Premium Economy' },
  { key: 'Business', label: 'Business Class' },
  { key: 'First Class', label: 'First Class' },
];

export default function FlightSearch({ onSearch, initialFrom = 'VGA', initialTo = 'DEL', initialDate = '' }) {
  const [tripType, setTripType] = useState('oneWay'); // 'oneWay', 'roundTrip', 'multiCity'
  const [fromAirport, setFromAirport] = useState(
    findAirportByInput(initialFrom) || AIRPORTS[0]
  );
  const [toAirport, setToAirport] = useState(
    findAirportByInput(initialTo) || AIRPORTS[1]
  );
  const [departureDate, setDepartureDate] = useState(() => {
    if (initialDate) return initialDate;
    const d = new Date();
    d.setDate(d.getDate() + 1);
    return d.toISOString().split('T')[0];
  });
  const [returnDate, setReturnDate] = useState('');
  const [adults, setAdults] = useState(1);
  const [childrenCount, setChildrenCount] = useState(0);
  const [infants, setInfants] = useState(0);
  const [cabinClass, setCabinClass] = useState('Economy');

  useEffect(() => {
    if (initialFrom) {
      setFromAirport(findAirportByInput(initialFrom) || AIRPORTS[0]);
    }
    if (initialTo) {
      setToAirport(findAirportByInput(initialTo) || AIRPORTS[1]);
    }
    if (initialDate) {
      setDepartureDate(initialDate);
    }
  }, [initialFrom, initialTo, initialDate]);

  // Autocomplete & popover toggles
  const [showFromDropdown, setShowFromDropdown] = useState(false);
  const [showToDropdown, setShowToDropdown] = useState(false);
  const [showTravellersPopover, setShowTravellersPopover] = useState(false);
  const [fromSearchText, setFromSearchText] = useState('');
  const [toSearchText, setToSearchText] = useState('');

  const handleSwap = () => {
    const temp = fromAirport;
    setFromAirport(toAirport);
    setToAirport(temp);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (onSearch) {
      onSearch({
        tripType,
        from: fromAirport,
        to: toAirport,
        departureDate,
        returnDate,
        passengers: { adults, children: childrenCount, infants },
        cabinClass,
      });
    }
  };

  const totalPassengers = adults + childrenCount + infants;

  const filteredFromAirports = AIRPORTS.filter(
    (a) =>
      a.city.toLowerCase().includes(fromSearchText.toLowerCase()) ||
      a.code.toLowerCase().includes(fromSearchText.toLowerCase()) ||
      a.airport.toLowerCase().includes(fromSearchText.toLowerCase())
  );

  const filteredToAirports = AIRPORTS.filter(
    (a) =>
      a.city.toLowerCase().includes(toSearchText.toLowerCase()) ||
      a.code.toLowerCase().includes(toSearchText.toLowerCase()) ||
      a.airport.toLowerCase().includes(toSearchText.toLowerCase())
  );

  return (
    <div className="bg-white dark:bg-slate-800 rounded-3xl border border-slate-200 dark:border-slate-700 shadow-xl overflow-hidden transition-all">
      {/* Flight Search Header Bar */}
      <div className="bg-gradient-to-r from-sky-600 via-blue-600 to-cyan-600 text-white px-6 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-md">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-white text-sky-600 rounded-2xl shadow-sm">
            <Plane className="w-6 h-6" />
          </div>
          <div>
            <h2 className="font-black text-lg tracking-wide flex items-center gap-2">
              TicketHarbour Flight Reservation
            </h2>
            <p className="text-xs text-sky-100">
              Low Convenience Fees • Instant Air Ticket Confirmation • TicketHarbour Price Lock
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 text-xs font-bold text-sky-100">
          <span className="px-3 py-1 bg-white/20 rounded-full flex items-center gap-1 border border-white/20">
            <ShieldCheck className="w-3.5 h-3.5 text-cyan-200" /> Free Flight Cancellation Options
          </span>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="p-6 space-y-6">
        {/* Trip Type Tabs */}
        <div className="flex items-center gap-2">
          {[
            { key: 'oneWay', label: 'One Way' },
            { key: 'roundTrip', label: 'Round Trip' },
            { key: 'multiCity', label: 'Multi-City' },
          ].map((t) => (
            <button
              type="button"
              key={t.key}
              onClick={() => setTripType(t.key)}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                tripType === t.key
                  ? 'bg-sky-600 text-white shadow-md'
                  : 'bg-slate-50 dark:bg-slate-700 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-600 hover:bg-sky-50'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* Airport Origin & Destination Bar */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
          {/* From Airport */}
          <div className="md:col-span-5 relative">
            <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">
              From (Origin Airport)
            </label>
            <div
              onClick={() => {
                setShowFromDropdown(true);
                setShowToDropdown(false);
              }}
              className="p-3.5 bg-slate-50 dark:bg-slate-700/60 border border-slate-200 dark:border-slate-600 rounded-2xl cursor-pointer hover:border-sky-500 transition-colors flex items-center gap-3"
            >
              <Plane className="w-5 h-5 text-sky-600 shrink-0 rotate-45" />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="font-black text-slate-900 dark:text-white text-base">
                    {fromAirport.city}
                  </span>
                  <span className="px-2 py-0.5 bg-sky-100 dark:bg-sky-950 text-sky-700 dark:text-sky-300 font-mono font-bold text-xs rounded-md">
                    {fromAirport.code}
                  </span>
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400 truncate">{fromAirport.airport}</p>
              </div>
            </div>

            {/* From Airport Dropdown */}
            {showFromDropdown && (
              <div className="absolute top-full left-0 right-0 mt-2 z-30 bg-white dark:bg-slate-800 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-700 p-3 max-h-72 overflow-y-auto">
                <input
                  type="text"
                  placeholder="Type city or airport code (e.g., VGA, DEL, BOM)..."
                  value={fromSearchText}
                  onChange={(e) => setFromSearchText(e.target.value)}
                  className="w-full p-2.5 mb-2 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl text-xs dark:text-white focus:outline-none focus:ring-2 focus:ring-sky-500"
                  autoFocus
                />
                <div className="space-y-1">
                  {filteredFromAirports.map((ap) => (
                    <button
                      type="button"
                      key={ap.code}
                      onClick={() => {
                        setFromAirport(ap);
                        setShowFromDropdown(false);
                      }}
                      className="w-full p-2.5 text-left hover:bg-sky-50 dark:hover:bg-slate-700 rounded-xl flex items-center justify-between text-xs transition-colors"
                    >
                      <div>
                        <span className="font-bold text-slate-900 dark:text-white">
                          {ap.city} ({ap.code})
                        </span>
                        <p className="text-[11px] text-slate-400">{ap.airport}</p>
                      </div>
                      {fromAirport.code === ap.code && <Check className="w-4 h-4 text-sky-600" />}
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
              className="p-3.5 bg-sky-50 dark:bg-slate-700 hover:bg-sky-600 hover:text-white text-sky-600 dark:text-sky-400 rounded-full border border-sky-200 dark:border-slate-600 shadow-md transition-all group"
              title="Swap Origin and Destination Airports"
            >
              <ArrowLeftRight className="w-5 h-5 group-hover:rotate-180 transition-transform duration-300" />
            </button>
          </div>

          {/* To Airport */}
          <div className="md:col-span-5 relative">
            <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">
              To (Destination Airport)
            </label>
            <div
              onClick={() => {
                setShowToDropdown(true);
                setShowFromDropdown(false);
              }}
              className="p-3.5 bg-slate-50 dark:bg-slate-700/60 border border-slate-200 dark:border-slate-600 rounded-2xl cursor-pointer hover:border-sky-500 transition-colors flex items-center gap-3"
            >
              <Plane className="w-5 h-5 text-cyan-600 shrink-0 rotate-135" />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="font-black text-slate-900 dark:text-white text-base">
                    {toAirport.city}
                  </span>
                  <span className="px-2 py-0.5 bg-cyan-100 dark:bg-cyan-950 text-cyan-700 dark:text-cyan-300 font-mono font-bold text-xs rounded-md">
                    {toAirport.code}
                  </span>
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400 truncate">{toAirport.airport}</p>
              </div>
            </div>

            {/* To Airport Dropdown */}
            {showToDropdown && (
              <div className="absolute top-full left-0 right-0 mt-2 z-30 bg-white dark:bg-slate-800 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-700 p-3 max-h-72 overflow-y-auto">
                <input
                  type="text"
                  placeholder="Type city or airport code..."
                  value={toSearchText}
                  onChange={(e) => setToSearchText(e.target.value)}
                  className="w-full p-2.5 mb-2 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl text-xs dark:text-white focus:outline-none focus:ring-2 focus:ring-sky-500"
                  autoFocus
                />
                <div className="space-y-1">
                  {filteredToAirports.map((ap) => (
                    <button
                      type="button"
                      key={ap.code}
                      onClick={() => {
                        setToAirport(ap);
                        setShowToDropdown(false);
                      }}
                      className="w-full p-2.5 text-left hover:bg-sky-50 dark:hover:bg-slate-700 rounded-xl flex items-center justify-between text-xs transition-colors"
                    >
                      <div>
                        <span className="font-bold text-slate-900 dark:text-white">
                          {ap.city} ({ap.code})
                        </span>
                        <p className="text-[11px] text-slate-400">{ap.airport}</p>
                      </div>
                      {toAirport.code === ap.code && <Check className="w-4 h-4 text-sky-600" />}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Departure Date, Return Date, Passengers & Class Bar */}
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 items-end">
          {/* Departure Date */}
          <div className="space-y-1">
            <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              Departure Date
            </label>
            <div className="relative">
              <Calendar className="w-4 h-4 text-sky-600 absolute left-3.5 top-3.5 pointer-events-none" />
              <input
                type="date"
                value={departureDate}
                min={new Date().toISOString().split('T')[0]}
                onChange={(e) => setDepartureDate(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-2xl text-xs font-bold dark:text-white focus:outline-none focus:ring-2 focus:ring-sky-600"
              />
            </div>
          </div>

          {/* Return Date (if Round Trip) */}
          <div className="space-y-1">
            <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              Return Date
            </label>
            <div className="relative">
              <Calendar className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5 pointer-events-none" />
              <input
                type="date"
                disabled={tripType === 'oneWay'}
                value={returnDate}
                min={departureDate}
                onChange={(e) => setReturnDate(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-2xl text-xs font-bold dark:text-white focus:outline-none focus:ring-2 focus:ring-sky-600 disabled:opacity-40"
              />
            </div>
          </div>

          {/* Travellers & Class Popover Trigger */}
          <div className="space-y-1 relative">
            <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              Travellers & Class
            </label>
            <button
              type="button"
              onClick={() => setShowTravellersPopover(!showTravellersPopover)}
              className="w-full p-3 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-2xl text-xs font-bold text-left dark:text-white flex items-center justify-between"
            >
              <span className="truncate">{totalPassengers} Passenger(s), {cabinClass}</span>
              <Users className="w-4 h-4 text-sky-600 shrink-0" />
            </button>

            {/* Travellers Popover */}
            {showTravellersPopover && (
              <div className="absolute top-full left-0 right-0 mt-2 z-30 bg-white dark:bg-slate-800 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-700 p-4 space-y-4">
                <div className="space-y-2 text-xs">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="font-bold text-slate-900 dark:text-white block">Adults</span>
                      <span className="text-[10px] text-slate-400">12+ yrs</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => setAdults(Math.max(1, adults - 1))}
                        className="w-7 h-7 rounded-lg border border-slate-200 font-bold hover:bg-slate-100 dark:hover:bg-slate-700"
                      >
                        -
                      </button>
                      <span className="font-bold text-xs">{adults}</span>
                      <button
                        type="button"
                        onClick={() => setAdults(adults + 1)}
                        className="w-7 h-7 rounded-lg border border-slate-200 font-bold hover:bg-slate-100 dark:hover:bg-slate-700"
                      >
                        +
                      </button>
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <span className="font-bold text-slate-900 dark:text-white block">Children</span>
                      <span className="text-[10px] text-slate-400">2 - 12 yrs</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => setChildrenCount(Math.max(0, childrenCount - 1))}
                        className="w-7 h-7 rounded-lg border border-slate-200 font-bold hover:bg-slate-100 dark:hover:bg-slate-700"
                      >
                        -
                      </button>
                      <span className="font-bold text-xs">{childrenCount}</span>
                      <button
                        type="button"
                        onClick={() => setChildrenCount(childrenCount + 1)}
                        className="w-7 h-7 rounded-lg border border-slate-200 font-bold hover:bg-slate-100 dark:hover:bg-slate-700"
                      >
                        +
                      </button>
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <span className="font-bold text-slate-900 dark:text-white block">Infants</span>
                      <span className="text-[10px] text-slate-400">Below 2 yrs</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => setInfants(Math.max(0, infants - 1))}
                        className="w-7 h-7 rounded-lg border border-slate-200 font-bold hover:bg-slate-100 dark:hover:bg-slate-700"
                      >
                        -
                      </button>
                      <span className="font-bold text-xs">{infants}</span>
                      <button
                        type="button"
                        onClick={() => setInfants(infants + 1)}
                        className="w-7 h-7 rounded-lg border border-slate-200 font-bold hover:bg-slate-100 dark:hover:bg-slate-700"
                      >
                        +
                      </button>
                    </div>
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Cabin Class</label>
                  <select
                    value={cabinClass}
                    onChange={(e) => setCabinClass(e.target.value)}
                    className="w-full p-2.5 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl text-xs font-bold dark:text-white focus:outline-none focus:ring-2 focus:ring-sky-500"
                  >
                    {CABIN_CLASSES.map((c) => (
                      <option key={c.key} value={c.key}>
                        {c.label}
                      </option>
                    ))}
                  </select>
                </div>

                <button
                  type="button"
                  onClick={() => setShowTravellersPopover(false)}
                  className="w-full py-2 bg-sky-600 hover:bg-sky-700 text-white font-bold text-xs rounded-xl shadow-md transition-all"
                >
                  Apply & Close
                </button>
              </div>
            )}
          </div>

          {/* Search Button */}
          <button
            type="submit"
            className="w-full py-3.5 bg-gradient-to-r from-sky-600 via-blue-600 to-cyan-600 hover:from-sky-700 hover:to-blue-700 text-white font-black text-sm rounded-2xl shadow-xl hover:shadow-sky-600/30 transition-all flex items-center justify-center gap-2"
          >
            <Search className="w-5 h-5 text-cyan-200" /> Search Flights
          </button>
        </div>
      </form>
    </div>
  );
}
