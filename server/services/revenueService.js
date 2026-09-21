import Transaction from '../models/Transaction.js';
import User from '../models/User.js';

export const getPlatformFeePercentage = () => {
  const envFee = process.env.PLATFORM_FEE_PERCENT;
  const parsed = parseFloat(envFee);
  return !isNaN(parsed) && parsed >= 0 ? parsed : 5; // Default 5%
};

/**
 * Calculates financial breakdown for a transaction amount.
 */
export const calculateRevenueBreakdown = (grossAmount, feePercentage = getPlatformFeePercentage()) => {
  const gross = Math.max(0, Number(grossAmount) || 0);
  const feePct = Math.max(0, Number(feePercentage) || 0);
  const platformFee = Math.round((gross * feePct / 100) * 100) / 100;
  const adminRevenue = Math.max(0, Math.round((gross - platformFee) * 100) / 100);

  return {
    grossRevenue: gross,
    platformFeePercentage: feePct,
    platformFee,
    adminRevenue,
  };
};

/**
 * Helper to ensure an Admin ID is valid. If unassigned, defaults to Super Admin ID.
 */
export const resolveAdminId = async (candidateAdminId) => {
  if (candidateAdminId) {
    const admin = await User.findById(candidateAdminId);
    if (admin) return admin._id;
  }
  // Fallback to first Super Admin user
  const superAdmin = await User.findOne({ role: { $in: ['SUPER_ADMIN', 'superadmin'] } });
  if (superAdmin) return superAdmin._id;

  // Fallback to first Admin
  const anyAdmin = await User.findOne({ role: { $in: ['ADMIN', 'admin'] } });
  return anyAdmin ? anyAdmin._id : candidateAdminId;
};

/**
 * Create or sync transaction snapshot record for a booking.
 */
export const syncBookingTransaction = async (bookingDoc, listingDoc, targetStatus = null) => {
  try {
    if (!bookingDoc || !listingDoc) return null;

    const status = targetStatus || (bookingDoc.paymentStatus === 'paid' ? 'paid' : bookingDoc.status === 'cancelled' ? 'refunded' : 'pending');
    const adminId = await resolveAdminId(listingDoc.createdBy || bookingDoc.adminId);

    const unitPrice = bookingDoc.quantity > 0 ? Math.round((bookingDoc.totalAmount / bookingDoc.quantity) * 100) / 100 : bookingDoc.totalAmount;
    const breakdown = calculateRevenueBreakdown(bookingDoc.totalAmount);

    const transactionData = {
      booking: bookingDoc._id,
      bookingReference: bookingDoc.bookingReference,
      user: bookingDoc.user._id || bookingDoc.user,
      adminId,
      listing: listingDoc._id,
      itemName: listingDoc.title || 'Ticket Item',
      categoryType: listingDoc.categoryType || bookingDoc.categoryType || 'event',
      quantity: bookingDoc.quantity || 1,
      unitPrice,
      grossRevenue: breakdown.grossRevenue,
      platformFeePercentage: breakdown.platformFeePercentage,
      platformFee: breakdown.platformFee,
      adminRevenue: breakdown.adminRevenue,
      paymentIntentId: bookingDoc.paymentIntentId || '',
      status,
      ...(status === 'paid' && { paidAt: bookingDoc.updatedAt || new Date() }),
    };

    const transaction = await Transaction.findOneAndUpdate(
      { booking: bookingDoc._id },
      { $set: transactionData },
      { upsert: true, new: true, runValidators: true }
    );

    // Sync adminId back to booking doc if missing
    if (!bookingDoc.adminId || bookingDoc.adminId.toString() !== adminId.toString()) {
      bookingDoc.adminId = adminId;
      await bookingDoc.save({ validateBeforeSave: false });
    }

    return transaction;
  } catch (err) {
    console.error('[Revenue Service Error] Failed to sync transaction:', err);
    return null;
  }
};
