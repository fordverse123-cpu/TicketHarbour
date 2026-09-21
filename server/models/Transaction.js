import mongoose from 'mongoose';

const transactionSchema = new mongoose.Schema(
  {
    booking: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Booking',
      required: true,
      unique: true,
      index: true,
    },
    bookingReference: {
      type: String,
      required: true,
      index: true,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    adminId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    listing: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Listing',
      required: true,
      index: true,
    },
    itemName: {
      type: String,
      required: true,
    },
    categoryType: {
      type: String,
      required: true,
      index: true,
    },
    quantity: {
      type: Number,
      required: true,
      default: 1,
    },
    unitPrice: {
      type: Number,
      required: true,
    },
    grossRevenue: {
      type: Number,
      required: true,
    },
    platformFeePercentage: {
      type: Number,
      required: true,
      default: 5,
    },
    platformFee: {
      type: Number,
      required: true,
    },
    adminRevenue: {
      type: Number,
      required: true,
    },
    paymentMethod: {
      type: String,
      default: 'stripe',
    },
    paymentIntentId: {
      type: String,
      default: '',
    },
    status: {
      type: String,
      enum: ['pending', 'paid', 'cancelled', 'refunded', 'failed'],
      default: 'pending',
      index: true,
    },
    paidAt: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
);

transactionSchema.index({ adminId: 1, status: 1, createdAt: -1 });
transactionSchema.index({ listing: 1, status: 1 });

export default mongoose.model('Transaction', transactionSchema);
