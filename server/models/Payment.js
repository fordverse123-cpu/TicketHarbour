import mongoose from 'mongoose';

const paymentSchema = new mongoose.Schema(
  {
    booking: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Booking',
      required: true,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    paymentMethod: {
      type: String,
      default: 'stripe',
    },
    paymentIntentId: {
      type: String,
      required: true,
    },
    amount: {
      type: Number,
      required: true,
    },
    currency: {
      type: String,
      default: 'inr',
    },
    status: {
      type: String,
      enum: ['created', 'succeeded', 'failed', 'refunded'],
      default: 'created',
    },
    receiptUrl: String,
  },
  {
    timestamps: true,
  }
);

export default mongoose.model('Payment', paymentSchema);
