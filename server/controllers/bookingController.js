import crypto from 'crypto';
import mongoose from 'mongoose';
import Booking from '../models/Booking.js';
import Schedule from '../models/Schedule.js';
import Listing from '../models/Listing.js';
import Coupon from '../models/Coupon.js';
import User from '../models/User.js';
import Category from '../models/Category.js';
import { successResponse, errorResponse } from '../utils/apiResponse.js';
import { generatePDFTicket } from '../utils/pdfGenerator.js';
import { sendEmail } from '../utils/sendEmail.js';
import { syncBookingTransaction, resolveAdminId } from '../services/revenueService.js';

// @desc    Lock seats temporarily for 5 minutes to prevent double booking
// @route   POST /api/v1/bookings/lock-seats
// @access  Private
export const lockSeats = async (req, res, next) => {
  try {
    const { scheduleId, seatIds, tierName, price } = req.body;

    if (!scheduleId || !seatIds || !Array.isArray(seatIds) || seatIds.length === 0) {
      return errorResponse(res, 400, 'Please provide scheduleId and seatIds array');
    }

    const schedule = await Schedule.findById(scheduleId);
    if (!schedule) {
      return errorResponse(res, 404, 'Schedule not found');
    }

    // Clean expired locks
    schedule.cleanExpiredLocks();

    const bookedSeats = schedule.seatMap?.bookedSeats || [];
    const lockedSeats = schedule.seatMap?.lockedSeats || [];

    // Check if any requested seat is already booked
    const alreadyBooked = seatIds.filter((seatId) => bookedSeats.includes(seatId));
    if (alreadyBooked.length > 0) {
      return errorResponse(res, 400, `Seat(s) ${alreadyBooked.join(', ')} are already booked.`);
    }

    // Check if any requested seat is locked by another user
    const alreadyLocked = lockedSeats.filter(
      (lock) => seatIds.includes(lock.seatId) && lock.user.toString() !== req.user.id
    );
    if (alreadyLocked.length > 0) {
      const lockedIds = alreadyLocked.map((l) => l.seatId).join(', ');
      return errorResponse(res, 400, `Seat(s) ${lockedIds} are currently held by another user. Try again shortly.`);
    }

    // Lock seats for 5 minutes (300,000 ms)
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000);

    // Filter out existing locks by this user for the same seats
    const otherLocks = lockedSeats.filter(
      (lock) => !seatIds.includes(lock.seatId) || lock.user.toString() !== req.user.id
    );

    const newLocks = seatIds.map((seatId) => ({
      seatId,
      user: req.user.id,
      tierName: tierName || 'Standard',
      price: price || 0,
      expiresAt,
    }));

    schedule.seatMap.lockedSeats = [...otherLocks, ...newLocks];
    await schedule.save();

    return successResponse(res, 200, 'Seats held for 5 minutes', {
      scheduleId,
      lockedSeats: newLocks,
      expiresAt,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Unlock seats (if user navigates away or cancels selection)
// @route   POST /api/v1/bookings/unlock-seats
// @access  Private
export const unlockSeats = async (req, res, next) => {
  try {
    const { scheduleId, seatIds } = req.body;
    const schedule = await Schedule.findById(scheduleId);

    if (schedule && schedule.seatMap?.lockedSeats) {
      schedule.seatMap.lockedSeats = schedule.seatMap.lockedSeats.filter(
        (lock) => !(seatIds.includes(lock.seatId) && lock.user.toString() === req.user.id)
      );
      await schedule.save();
    }

    return successResponse(res, 200, 'Seats unlocked successfully');
  } catch (error) {
    next(error);
  }
};

// @desc    Create new booking order
// @route   POST /api/v1/bookings
// @access  Private
export const createBooking = async (req, res, next) => {
  try {
    const { scheduleId, listingId, seats, quantity = 1, couponCode, passengerInfo, customPrice } = req.body;

    let schedule = null;

    if (scheduleId && mongoose.Types.ObjectId.isValid(scheduleId)) {
      schedule = await Schedule.findById(scheduleId).populate('listing');
    }

    // Fallback: If synthetic ID or schedule not found in DB, resolve or create real Listing & Schedule
    if (!schedule) {
      let listingDoc = null;
      if (listingId && mongoose.Types.ObjectId.isValid(listingId)) {
        listingDoc = await Listing.findById(listingId);
      }
      if (!listingDoc) {
        // Try finding existing Flight/Transit listing or create standard default
        listingDoc = await Listing.findOne({ categoryType: 'flight' });
      }
      if (!listingDoc) {
        let cat = await Category.findOne({ type: 'flight' });
        if (!cat) {
          cat = await Category.create({ name: 'Flights', type: 'flight', slug: 'flight', icon: 'Plane', description: 'Domestic & International Flights' });
        }
        listingDoc = await Listing.create({
          title: 'Direct Flight Ticket',
          slug: 'direct-flight-ticket-' + Date.now(),
          category: cat._id,
          categoryType: 'flight',
          description: 'Standard Flight Reservation',
          images: ['https://images.unsplash.com/photo-1436491865332-7a61a109cc05?auto=format&fit=crop&w=800&q=80'],
          pricingTiers: [{ tierName: 'Economy Standard', price: customPrice || 5499, totalCapacity: 100 }],
        });
      }

      // Find or create dynamic schedule
      schedule = await Schedule.findOne({ listing: listingDoc._id, status: { $ne: 'cancelled' } }).populate('listing');

      if (!schedule) {
        schedule = await Schedule.create({
          listing: listingDoc._id,
          date: new Date(),
          startTime: '10:30',
          pricing: listingDoc.pricingTiers,
          seatMap: { bookedSeats: [], lockedSeats: [] },
        });
        schedule = await Schedule.findById(schedule._id).populate('listing');
      }
    }

    if (schedule.cleanExpiredLocks) {
      schedule.cleanExpiredLocks();
    }

    const listing = schedule.listing;
    let baseAmount = 0;
    let seatItems = [];

    if (seats && Array.isArray(seats) && seats.length > 0) {
      // Seat-map based booking (Movies, Events, Sports, Bus)
      seatItems = seats;
      baseAmount = seats.reduce((sum, item) => sum + item.price, 0);
    } else {
      // Quantity-based booking (Attractions, Flight, Train class, General admission)
      const defaultPrice = customPrice || schedule.pricing?.[0]?.price || listing.pricingTiers?.[0]?.price || 5499;
      baseAmount = defaultPrice * quantity;
    }

    // Apply Coupon if provided
    let discountAmount = 0;
    if (couponCode) {
      const coupon = await Coupon.findOne({
        code: couponCode.toUpperCase(),
        isActive: true,
        validTill: { $gt: new Date() },
      });

      if (coupon && baseAmount >= coupon.minBookingAmount) {
        const calculatedDiscount = (baseAmount * coupon.discountPercent) / 100;
        discountAmount = Math.min(calculatedDiscount, coupon.maxDiscount);
      }
    }

    const taxAmount = Math.round(baseAmount * 0.18 * 100) / 100; // 18% GST / Service Tax
    const totalAmount = Math.max(0, Math.round((baseAmount - discountAmount + taxAmount) * 100) / 100);

    // Generate unique booking reference
    const bookingReference = 'TH-' + Date.now().toString(36).toUpperCase() + '-' + crypto.randomBytes(2).toString('hex').toUpperCase();
    const qrCodeData = `TICKETHARBOR:REF=${bookingReference}:USER=${req.user.id}:DATE=${schedule.date}`;

    // Resolve admin ownership for this booking
    const adminId = await resolveAdminId(listing.createdBy);

    const booking = await Booking.create({
      bookingReference,
      user: req.user.id,
      listing: listing._id,
      schedule: schedule._id,
      categoryType: listing.categoryType,
      seats: seatItems,
      quantity: seatItems.length > 0 ? seatItems.length : quantity,
      baseAmount,
      discountAmount,
      taxAmount,
      totalAmount,
      couponCode: couponCode || '',
      status: 'pending',
      paymentStatus: 'pending',
      qrCodeData,
      passengerInfo: passengerInfo || {},
      adminId,
    });

    // Create initial pending transaction snapshot
    await syncBookingTransaction(booking, listing, 'pending');

    return successResponse(res, 201, 'Booking created', { booking });
  } catch (error) {
    next(error);
  }
};

// @desc    Confirm booking after successful payment
// @route   POST /api/v1/bookings/:id/confirm
// @access  Private
export const confirmBooking = async (req, res, next) => {
  try {
    const { paymentIntentId } = req.body;
    const booking = await Booking.findById(req.params.id)
      .populate('listing')
      .populate('schedule')
      .populate('user');

    if (!booking) {
      return errorResponse(res, 404, 'Booking not found');
    }

    booking.status = 'confirmed';
    booking.paymentStatus = 'paid';
    if (paymentIntentId) booking.paymentIntentId = paymentIntentId;
    await booking.save();

    // Sync paid transaction
    await syncBookingTransaction(booking, booking.listing, 'paid');

    // Mark seats as permanently booked on the schedule
    const schedule = await Schedule.findById(booking.schedule._id);
    if (schedule) {
      if (booking.seats && booking.seats.length > 0) {
        const seatIdsToBook = booking.seats.map((s) => s.seatId);
        schedule.seatMap.bookedSeats = [
          ...new Set([...(schedule.seatMap.bookedSeats || []), ...seatIdsToBook]),
        ];
        // Remove locked seats
        schedule.seatMap.lockedSeats = (schedule.seatMap.lockedSeats || []).filter(
          (lock) => !seatIdsToBook.includes(lock.seatId)
        );
      }
      await schedule.save();
    }

    // Generate PDF Ticket attachment
    let pdfBuffer = null;
    try {
      pdfBuffer = await generatePDFTicket(booking);
    } catch (pdfErr) {
      console.error('PDF ticket generation error:', pdfErr);
    }

    // Send Confirmation Email
    const userEmail = booking.user.email;
    const messageText = `Thank you for booking with TicketHarbor! Your booking reference is ${booking.bookingReference}. Total Paid: ₹${booking.totalAmount}.`;
    const htmlContent = `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 8px;">
        <h2 style="color: #0d9488;">Booking Confirmed! - TicketHarbor</h2>
        <p>Hi ${booking.user.name},</p>
        <p>Your booking for <strong>${booking.listing.title}</strong> has been successfully confirmed.</p>
        <div style="background-color: #f8fafc; padding: 15px; border-radius: 6px; margin: 20px 0;">
          <p><strong>Booking Reference:</strong> ${booking.bookingReference}</p>
          <p><strong>Total Amount Paid:</strong> ₹${booking.totalAmount}</p>
          <p><strong>Category:</strong> ${(booking.categoryType || '').toUpperCase()}</p>
        </div>
        <p>Your PDF ticket with QR code is attached to this email. You can also view and download it anytime from your TicketHarbor profile.</p>
      </div>
    `;

    try {
      await sendEmail({
        email: userEmail,
        subject: `TicketHarbor Booking Confirmation [Ref: ${booking.bookingReference}]`,
        message: messageText,
        html: htmlContent,
        attachments: pdfBuffer
          ? [
              {
                filename: `TicketHarbor_${booking.bookingReference}.pdf`,
                content: pdfBuffer,
              },
            ]
          : [],
      });
    } catch (emailErr) {
      console.error('Email confirmation error:', emailErr);
    }

    return successResponse(res, 200, 'Booking confirmed successfully', { booking });
  } catch (error) {
    next(error);
  }
};

/**
 * Helper to compute departure date & time for a booking
 */
export const getDepartureDateTime = (booking) => {
  const scheduleDate = booking.schedule?.date ? new Date(booking.schedule.date) : new Date(booking.createdAt);
  const timeStr = booking.schedule?.startTime || booking.listing?.transitInfo?.departureTime || '00:00';

  const year = scheduleDate.getFullYear();
  const month = String(scheduleDate.getMonth() + 1).padStart(2, '0');
  const day = String(scheduleDate.getDate()).padStart(2, '0');

  let hours = 0;
  let minutes = 0;
  const match12 = timeStr.match(/(\d{1,2}):(\d{2})\s*(AM|PM)?/i);
  if (match12) {
    hours = parseInt(match12[1], 10);
    minutes = parseInt(match12[2], 10);
    const ampm = match12[3];
    if (ampm) {
      if (ampm.toUpperCase() === 'PM' && hours < 12) hours += 12;
      if (ampm.toUpperCase() === 'AM' && hours === 12) hours = 0;
    }
  }

  return new Date(`${year}-${month}-${day}T${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:00`);
};

/**
 * Automatically determine and persist booking lifecycle status
 */
export const syncBookingLifecycleStatus = async (booking) => {
  if (booking.status === 'cancelled') return 'CANCELLED';
  if (booking.status === 'failed') return 'FAILED';

  const departureDateTime = getDepartureDateTime(booking);
  const now = new Date();

  if (now > departureDateTime) {
    if (booking.status !== 'completed' && booking.status !== 'cancelled') {
      booking.status = 'completed';
      try {
        await booking.save();
      } catch (err) {}
    }
    return 'COMPLETED';
  } else {
    if (booking.status === 'confirmed' || booking.status === 'pending') {
      return 'UPCOMING';
    }
    return (booking.status || 'UPCOMING').toUpperCase();
  }
};

// @desc    Get user's bookings with optional filtering (Upcoming, Completed, Cancelled)
// @route   GET /api/v1/bookings/my-bookings
// @access  Private
export const getMyBookings = async (req, res, next) => {
  try {
    const { status, categoryType } = req.query;

    const bookings = await Booking.find({ user: req.user.id })
      .populate('listing', 'title categoryType images bannerImage location transitInfo attractionInfo')
      .populate('schedule', 'date startTime endTime venue')
      .sort('-createdAt');

    const updatedBookings = await Promise.all(
      bookings.map(async (b) => {
        const computedStatus = await syncBookingLifecycleStatus(b);
        const bObj = b.toObject();
        bObj.computedStatus = computedStatus;
        return bObj;
      })
    );

    let filtered = updatedBookings;

    if (status) {
      const s = status.toLowerCase();
      if (s === 'upcoming') {
        filtered = filtered.filter((b) => b.computedStatus === 'UPCOMING' || b.computedStatus === 'CONFIRMED');
      } else if (s === 'completed') {
        filtered = filtered.filter((b) => b.computedStatus === 'COMPLETED');
      } else if (s === 'cancelled') {
        filtered = filtered.filter((b) => b.computedStatus === 'CANCELLED');
      }
    }

    if (categoryType) {
      filtered = filtered.filter((b) => (b.categoryType || '').toLowerCase() === categoryType.toLowerCase());
    }

    const upcomingCount = updatedBookings.filter(
      (b) => b.computedStatus === 'UPCOMING' || b.computedStatus === 'CONFIRMED'
    ).length;
    const completedCount = updatedBookings.filter((b) => b.computedStatus === 'COMPLETED').length;
    const cancelledCount = updatedBookings.filter((b) => b.computedStatus === 'CANCELLED').length;

    return successResponse(res, 200, 'User bookings retrieved', {
      bookings: filtered,
      allBookings: updatedBookings,
      counts: {
        total: updatedBookings.length,
        upcoming: upcomingCount,
        completed: completedCount,
        cancelled: cancelledCount,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const getUpcomingBookings = async (req, res, next) => {
  req.query.status = 'upcoming';
  return getMyBookings(req, res, next);
};

export const getCompletedBookings = async (req, res, next) => {
  req.query.status = 'completed';
  return getMyBookings(req, res, next);
};

export const getCancelledBookings = async (req, res, next) => {
  req.query.status = 'cancelled';
  return getMyBookings(req, res, next);
};

export const getUpcomingCount = async (req, res, next) => {
  try {
    const bookings = await Booking.find({ user: req.user.id })
      .populate('listing', 'transitInfo')
      .populate('schedule', 'date startTime');

    let count = 0;
    const now = new Date();

    for (const b of bookings) {
      if (b.status === 'cancelled' || b.status === 'failed') continue;
      const depDate = getDepartureDateTime(b);
      if (now <= depDate) {
        count++;
      } else if (b.status !== 'completed') {
        b.status = 'completed';
        try {
          await b.save();
        } catch (e) {}
      }
    }

    return successResponse(res, 200, 'Upcoming count retrieved', { upcomingCount: count });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single booking details
// @route   GET /api/v1/bookings/:id
// @access  Private
export const getBookingById = async (req, res, next) => {
  try {
    const booking = await Booking.findById(req.params.id)
      .populate('listing')
      .populate('schedule')
      .populate('user', 'name email phone');

    if (!booking) {
      return errorResponse(res, 404, 'Booking not found');
    }

    const userRole = req.user.role ? req.user.role.toUpperCase() : '';
    if (booking.user._id.toString() !== req.user.id && userRole !== 'ADMIN' && userRole !== 'SUPER_ADMIN') {
      return errorResponse(res, 403, 'Not authorized to view this booking');
    }

    return successResponse(res, 200, 'Booking details', { booking });
  } catch (error) {
    next(error);
  }
};

// @desc    Cancel booking (with refund logic)
// @route   POST /api/v1/bookings/:id/cancel
// @access  Private
export const cancelBooking = async (req, res, next) => {
  try {
    const booking = await Booking.findById(req.params.id);

    if (!booking) {
      return errorResponse(res, 404, 'Booking not found');
    }

    const userRole = req.user.role ? req.user.role.toUpperCase() : '';
    if (booking.user.toString() !== req.user.id && userRole !== 'ADMIN' && userRole !== 'SUPER_ADMIN') {
      return errorResponse(res, 403, 'Not authorized to cancel this booking');
    }

    if (booking.status === 'cancelled') {
      return errorResponse(res, 400, 'Booking is already cancelled');
    }

    booking.status = 'cancelled';
    booking.paymentStatus = 'refunded';
    await booking.save();

    // Sync refunded transaction
    const listingObj = await Listing.findById(booking.listing);
    if (listingObj) {
      await syncBookingTransaction(booking, listingObj, 'refunded');
    }

    // Release seats on schedule
    const schedule = await Schedule.findById(booking.schedule);
    if (schedule && booking.seats && booking.seats.length > 0) {
      const cancelledSeatIds = booking.seats.map((s) => s.seatId);
      schedule.seatMap.bookedSeats = (schedule.seatMap.bookedSeats || []).filter(
        (seatId) => !cancelledSeatIds.includes(seatId)
      );
      await schedule.save();
    }

    return successResponse(res, 200, 'Booking cancelled successfully. Refund processed according to rules.', {
      booking,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Download PDF ticket with QR code
// @route   GET /api/v1/bookings/:id/ticket-pdf
// @access  Private
export const downloadPDFTicket = async (req, res, next) => {
  try {
    const booking = await Booking.findById(req.params.id)
      .populate('listing')
      .populate('schedule')
      .populate('user', 'name email');

    if (!booking) {
      return errorResponse(res, 404, 'Booking not found');
    }

    const userRole = req.user.role ? req.user.role.toUpperCase() : '';
    if (booking.user._id.toString() !== req.user.id && userRole !== 'ADMIN' && userRole !== 'SUPER_ADMIN') {
      return errorResponse(res, 403, 'Not authorized to download this ticket');
    }

    const pdfBuffer = await generatePDFTicket(booking);

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader(
      'Content-Disposition',
      `attachment; filename=TicketHarbor_${booking.bookingReference}.pdf`
    );
    return res.send(pdfBuffer);
  } catch (error) {
    next(error);
  }
};

// @desc    Admin verify ticket by scanning/entering QR code
// @route   POST /api/v1/bookings/verify-qr
// @access  Private/Admin
export const verifyQRTicket = async (req, res, next) => {
  try {
    const { qrData, bookingReference } = req.body;

    let searchRef = bookingReference;
    if (!searchRef && qrData) {
      const match = qrData.match(/REF=([A-Z0-9-]+)/);
      if (match) searchRef = match[1];
    }

    if (!searchRef) {
      return errorResponse(res, 400, 'Please provide valid QR data or Booking Reference');
    }

    const booking = await Booking.findOne({ bookingReference: searchRef })
      .populate('listing', 'title categoryType')
      .populate('schedule', 'date startTime')
      .populate('user', 'name email phone');

    if (!booking) {
      return errorResponse(res, 404, 'Invalid Ticket. No booking found with this reference.');
    }

    if (booking.status !== 'confirmed') {
      return errorResponse(res, 400, `Ticket invalid: Booking status is '${booking.status}'`);
    }

    // Check-in ticket
    const alreadyCheckedIn = booking.checkedIn;
    booking.checkedIn = true;
    booking.checkedInAt = new Date();
    await booking.save();

    return successResponse(
      res,
      200,
      alreadyCheckedIn ? 'Ticket ALREADY checked-in previously!' : 'Ticket VERIFIED & Checked-In successfully!',
      {
        verified: true,
        alreadyCheckedIn,
        booking,
      }
    );
  } catch (error) {
    next(error);
  }
};
