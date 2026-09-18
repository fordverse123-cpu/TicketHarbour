import React, { useState, useEffect } from 'react';
import { Clock, ShieldAlert, CheckCircle } from 'lucide-react';
import API from '../../services/api';
import toast from 'react-hot-toast';

export default function SeatSelector({ schedule, listing, onSeatsSelected }) {
  const [selectedSeats, setSelectedSeats] = useState([]);
  const [locking, setLocking] = useState(false);
  const [lockExpiresAt, setLockExpiresAt] = useState(null);
  const [timeLeft, setTimeLeft] = useState(300); // 5 minutes (300s) hold countdown

  const bookedSeats = schedule?.seatMap?.bookedSeats || [];
  const lockedSeats = schedule?.seatMap?.lockedSeats?.map((l) => l.seatId) || [];

  // Seat map dimensions based on category type
  const isTransit = ['bus', 'train', 'flight'].includes(listing?.categoryType);
  const rows = ['A', 'B', 'C', 'D', 'E', 'F'];
  const cols = [1, 2, 3, 4, 5, 6, 7, 8];

  const defaultPrice = schedule?.pricing?.[0]?.price || listing?.pricingTiers?.[0]?.price || 300;
  const defaultTier = schedule?.pricing?.[0]?.tierName || listing?.pricingTiers?.[0]?.tierName || 'Standard';

  // Lock countdown timer hook
  useEffect(() => {
    let timer;
    if (lockExpiresAt) {
      timer = setInterval(() => {
        const remaining = Math.max(0, Math.floor((new Date(lockExpiresAt) - new Date()) / 1000));
        setTimeLeft(remaining);
        if (remaining === 0) {
          clearInterval(timer);
          setLockExpiresAt(null);
          setSelectedSeats([]);
          toast.error('Seat hold expired. Please re-select your seats.');
        }
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [lockExpiresAt]);

  const toggleSeat = (seatId) => {
    if (bookedSeats.includes(seatId) || lockedSeats.includes(seatId)) {
      return;
    }

    if (selectedSeats.find((s) => s.seatId === seatId)) {
      const updated = selectedSeats.filter((s) => s.seatId !== seatId);
      setSelectedSeats(updated);
      onSeatsSelected(updated);
    } else {
      if (selectedSeats.length >= 6) {
        toast.error('You can select a maximum of 6 seats per booking.');
        return;
      }
      const updated = [...selectedSeats, { seatId, tierName: defaultTier, price: defaultPrice }];
      setSelectedSeats(updated);
      onSeatsSelected(updated);
    }
  };

  const handleLockSeats = async () => {
    if (selectedSeats.length === 0) {
      toast.error('Please select at least one seat');
      return;
    }

    setLocking(true);
    try {
      const seatIds = selectedSeats.map((s) => s.seatId);
      const res = await API.post('/bookings/lock-seats', {
        scheduleId: schedule._id,
        seatIds,
        tierName: defaultTier,
        price: defaultPrice,
      });

      if (res.data.success) {
        setLockExpiresAt(res.data.data.expiresAt);
        toast.success('Seats locked for 5 minutes!');
      }
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to lock seats.';
      toast.error(msg);
    } finally {
      setLocking(false);
    }
  };

  const formatTimer = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  return (
    <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-6 space-y-6">
      
      {/* Header Banner */}
      <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-slate-100 dark:border-slate-700">
        <div>
          <h3 className="text-lg font-bold text-slate-900 dark:text-white">
            {isTransit ? 'Vehicle Seat Layout' : 'Venue Seat Layout'}
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Click on available seats to reserve. Max 6 seats.
          </p>
        </div>

        {/* 5-Min Seat Hold Countdown Indicator */}
        {lockExpiresAt && (
          <div className="flex items-center gap-2 px-3 py-1.5 bg-amber-50 dark:bg-amber-950/60 border border-amber-300 dark:border-amber-800 rounded-full text-amber-700 dark:text-amber-400 text-xs font-bold animate-pulse">
            <Clock className="w-4 h-4" />
            <span>Held for: {formatTimer(timeLeft)}</span>
          </div>
        )}
      </div>

      {/* Screen / Driver Direction Indicator */}
      <div className="w-full py-2 bg-slate-100 dark:bg-slate-700/60 rounded-lg text-center text-xs font-bold text-slate-500 dark:text-slate-300 tracking-widest uppercase shadow-inner">
        {isTransit ? 'FRONT / DRIVER CABIN' : 'SCREEN / STAGE THIS WAY'}
      </div>

      {/* Seat Grid Map */}
      <div className="overflow-x-auto py-4">
        <div className="min-w-[320px] max-w-lg mx-auto space-y-3">
          {rows.map((row) => (
            <div key={row} className="flex items-center justify-center gap-2">
              <span className="w-6 text-xs font-bold text-slate-400 text-center">{row}</span>
              <div className="flex items-center gap-2">
                {cols.map((col) => {
                  const seatId = `${row}${col}`;
                  const isBooked = bookedSeats.includes(seatId);
                  const isLocked = lockedSeats.includes(seatId);
                  const isSelected = selectedSeats.some((s) => s.seatId === seatId);

                  let seatStyle = 'bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 hover:border-teal-500';

                  if (isBooked) {
                    seatStyle = 'bg-slate-300 dark:bg-slate-700 text-slate-500 dark:text-slate-400 border-transparent cursor-not-allowed';
                  } else if (isLocked) {
                    seatStyle = 'bg-amber-200 dark:bg-amber-900/60 text-amber-700 dark:text-amber-300 border-amber-400 cursor-not-allowed';
                  } else if (isSelected) {
                    seatStyle = 'bg-teal-500 text-white border-teal-600 shadow-md font-bold scale-105';
                  }

                  return (
                    <button
                      key={seatId}
                      disabled={isBooked || isLocked}
                      onClick={() => toggleSeat(seatId)}
                      className={`h-9 w-9 rounded-lg text-xs flex items-center justify-center transition-all ${seatStyle}`}
                      title={`Seat ${seatId} - ₹${defaultPrice}`}
                    >
                      {col}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Legend & Seat Selection Summary */}
      <div className="flex flex-wrap items-center justify-between gap-4 pt-4 border-t border-slate-100 dark:border-slate-700 text-xs">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1.5">
            <span className="w-3.5 h-3.5 rounded border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800"></span>
            <span className="text-slate-600 dark:text-slate-300">Available</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3.5 h-3.5 rounded bg-teal-500"></span>
            <span className="text-slate-600 dark:text-slate-300">Selected</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3.5 h-3.5 rounded bg-slate-300 dark:bg-slate-700"></span>
            <span className="text-slate-600 dark:text-slate-300">Booked</span>
          </div>
        </div>

        {/* Lock Action Button */}
        {selectedSeats.length > 0 && !lockExpiresAt && (
          <button
            onClick={handleLockSeats}
            disabled={locking}
            className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-white font-bold rounded-xl shadow transition-colors flex items-center gap-1.5"
          >
            <Clock className="w-4 h-4" />
            {locking ? 'Holding...' : `Hold ${selectedSeats.length} Seat(s) (5 Mins)`}
          </button>
        )}
      </div>

    </div>
  );
}
