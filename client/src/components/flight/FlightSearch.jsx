import React, { useState } from 'react';
import { ArrowLeftRight, Calendar, Search, Plane, Users, ShieldCheck, Check, Info } from 'lucide-react';

const AIRPORTS = [
  { city: 'Vijayawada', code: 'VGA', airport: 'Vijayawada International Airport' },
  { city: 'Delhi', code: 'DEL', airport: 'Indira Gandhi International Airport' },
  { city: 'Mumbai', code: 'BOM', airport: 'Chhatrapati Shivaji Maharaj Airport' },
  { city: 'Bengaluru', code: 'BLR', airport: 'Kempegowda International Airport' },
  { city: 'Chennai', code: 'MAA', airport: 'Chennai International Airport' },
  { city: 'Kolkata', code: 'CCU', airport: 'Netaji Subhash Chandra Bose Airport' },
  { city: 'Hyderabad', code: 'HYD', airport: 'Rajiv Gandhi International Airport' },
  { city: 'Goa', code: 'GOI', airport: 'Dabolim Airport' },
];

const CABIN_CLASSES = [
  { key: 'Economy', label: 'Economy Class' },
  { key: 'Premium Economy', label: 'Premium Economy' },
  { key: 'Business', label: 'Business Class' },
  { key: 'First Class', label: 'First Class' },
];

export default function FlightSearch({ onSearch, initialFrom = 'VGA', initialTo = 'DEL' }) {
  const [tripType, setTripType] = useState('oneWay'); // 'oneWay', 'roundTrip', 'multiCity'
  const [fromAirport, setFromAirport] = useState(
    AIRPORTS.find((a) => a.code === initialFrom) || AIRPORTS[0]
  );
  const [toAirport, setToAirport] = useState(
    AIRPORTS.find((a) => a.code === initialTo) || AIRPORTS[1]
  );
  const [departureDate, setDepartureDate] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() + 1);
    return d.toISOString().split('T')[0];
  });
  const [returnDate, setReturnDate] = useState('');
  const [adults, setAdults] = useState(1);
  const [childrenCount, setChildrenCount] = useState(0);
  const [infants, setInfants] = useState(0);
  const [cabinClass, setCabinClass] = useState('Economy');
  const [showTravellersPopover, setShowTravellersPopover] = useState(false);

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

  return (
    <div className="bg-white dark:bg-slate-800 rounded-3xl border border-slate-200 dark:border-slate-700 shadow-xl overflow-hidden">
      {/* IRCTC Air Inspired Header Bar */}
      <div className="bg-gradient-to-r from-sky-600 via-blue-600 to-cyan-600 text-white px-6 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-md">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-white text-sky-600 rounded-2xl shadow-sm">
            <Plane className="w-6 h-6" />
          </div>
          <div>
            <h2 className="font-black text-lg tracking-wide flex items-center gap-2">
              IRCTC Air Inspired Flight Booking
            </h2>
            <p className="text-xs text-sky-100">
              Low Convenience Fees • Instant Air Ticket Confirmation
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 text-xs font-bold text-sky-100">
          <span className="px-3 py-1 bg-white/20 rounded-full flex items-center gap-1 border border-white/20">
            <ShieldCheck className="w-3.5 h-3.5 text-cyan-200" /> Free Cancellation Options
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
                  : 'bg-slate-50 dark:bg-slate-700 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-600'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* Airport Origin & Destination Bar */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
          {/* From Airport */}
          <div className="md:col-span-5 space-y-1">
            <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              From (Origin Airport)
            </label>
            <div className="p-3.5 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-2xl flex items-center gap-3">
              <Plane className="w-5 h-5 text-sky-600 shrink-0 rotate-45" />
              <select
                value={fromAirport.code}
                onChange={(e) =>
                  setFromAirport(AIRPORTS.find((a) => a.code === e.target.value) || AIRPORTS[0])
                }
                className="w-full text-sm font-black bg-transparent dark:text-white focus:outline-none"
              >
                {AIRPORTS.map((a) => (
                  <option key={a.code} value={a.code}>
                    {a.city} ({a.code}) - {a.airport}
                  </option>
                ))}
              </select>
            </div>
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
          <div className="md:col-span-5 space-y-1">
            <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              To (Destination Airport)
            </label>
            <div className="p-3.5 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-2xl flex items-center gap-3">
              <Plane className="w-5 h-5 text-cyan-600 shrink-0 rotate-135" />
              <select
                value={toAirport.code}
                onChange={(e) =>
                  setToAirport(AIRPORTS.find((a) => a.code === e.target.value) || AIRPORTS[1])
                }
                className="w-full text-sm font-black bg-transparent dark:text-white focus:outline-none"
              >
                {AIRPORTS.map((a) => (
                  <option key={a.code} value={a.code}>
                    {a.city} ({a.code}) - {a.airport}
                  </option>
                ))}
              </select>
            </div>
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

          {/* Travellers */}
          <div className="space-y-1 relative">
            <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              Travellers & Class
            </label>
            <button
              type="button"
              onClick={() => setShowTravellersPopover(!showTravellersPopover)}
              className="w-full p-3 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-2xl text-xs font-bold text-left dark:text-white flex items-center justify-between"
            >
              <span>{totalPassengers} Passenger(s), {cabinClass}</span>
              <Users className="w-4 h-4 text-sky-600" />
            </button>

            {/* Travellers Popover */}
            {showTravellersPopover && (
              <div className="absolute top-full left-0 right-0 mt-2 z-30 bg-white dark:bg-slate-800 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-700 p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold">Adults (12+ yrs)</span>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setAdults(Math.max(1, adults - 1))}
                      className="w-7 h-7 rounded-lg border border-slate-200 font-bold"
                    >
                      -
                    </button>
                    <span className="font-bold text-xs">{adults}</span>
                    <button
                      type="button"
                      onClick={() => setAdults(adults + 1)}
                      className="w-7 h-7 rounded-lg border border-slate-200 font-bold"
                    >
                      +
                    </button>
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-slate-400">Cabin Class</label>
                  <select
                    value={cabinClass}
                    onChange={(e) => setCabinClass(e.target.value)}
                    className="w-full p-2 bg-slate-50 dark:bg-slate-700 border border-slate-200 rounded-xl text-xs dark:text-white"
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
                  className="w-full py-2 bg-sky-600 text-white font-bold text-xs rounded-xl"
                >
                  Done
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
