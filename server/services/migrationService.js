import Listing from '../models/Listing.js';
import Booking from '../models/Booking.js';
import User from '../models/User.js';
import { resolveAdminId, syncBookingTransaction } from './revenueService.js';

export const runRevenueMigration = async () => {
  try {
    console.log('[Revenue Migration] Starting safe legacy data backfill...');

    // 1. Find default admin for legacy listings/bookings if unassigned
    const defaultAdminId = await resolveAdminId(null);
    if (!defaultAdminId) {
      console.warn('[Revenue Migration Warning] No Super Admin or Admin user found for fallback.');
      return;
    }

    // 2. Backfill createdBy on Listings
    const listingsWithoutAdmin = await Listing.find({
      $or: [{ createdBy: { $exists: false } }, { createdBy: null }],
    });

    if (listingsWithoutAdmin.length > 0) {
      await Listing.updateMany(
        { $or: [{ createdBy: { $exists: false } }, { createdBy: null }] },
        { $set: { createdBy: defaultAdminId } }
      );
      console.log(`[Revenue Migration] Updated ${listingsWithoutAdmin.length} legacy listing(s) with fallback admin ${defaultAdminId}`);
    }

    // 3. Backfill adminId and create Transaction records for Bookings
    const bookingsToSync = await Booking.find()
      .populate('listing')
      .populate('user');

    let syncCount = 0;
    for (const booking of bookingsToSync) {
      if (!booking.listing) continue;

      const listingAdmin = booking.listing.createdBy || defaultAdminId;

      if (!booking.adminId || booking.adminId.toString() !== listingAdmin.toString()) {
        booking.adminId = listingAdmin;
        await booking.save({ validateBeforeSave: false });
      }

      await syncBookingTransaction(booking, booking.listing);
      syncCount++;
    }

    console.log(`[Revenue Migration] Successfully synchronized ${syncCount} booking transaction snapshot(s).`);
  } catch (err) {
    console.error('[Revenue Migration Error]:', err.message);
  }
};
