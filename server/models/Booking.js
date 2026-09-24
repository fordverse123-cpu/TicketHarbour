import mongoose from 'mongoose';

const bookedSeatItemSchema = new mongoose.Schema({
  seatId: { type: String, required: true },
  tierName: { type: String, required: true },
  price: { type: Number, required: true },
});

const bookingSchema = new mongoose.Schema(
  {
    bookingReference: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    listing: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Listing',
      required: true,
    },
    schedule: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Schedule',
      required: true,
    },
    categoryType: {
      type: String,
      required: true,
    },
    seats: [bookedSeatItemSchema],
    quantity: {
      type: Number,
      required: true,
      default: 1,
    },
    baseAmount: {
      type: Number,
      required: true,
    },
    discountAmount: {
      type: Number,
      default: 0,
    },
    taxAmount: {
      type: Number,
      default: 0,
    },
    totalAmount: {
      type: Number,
      required: true,
    },
    couponCode: {
      type: String,
      default: '',
    },
    status: {
      type: String,
      enum: ['pending', 'confirmed', 'cancelled'],
      default: 'pending',
    },
    paymentStatus: {
      type: String,
      enum: ['pending', 'paid', 'failed', 'refunded'],
      default: 'pending',
    },
    paymentIntentId: {
      type: String,
      default: '',
    },
    qrCodeData: {
      type: String,
      default: '',
    },
    checkedIn: {
      type: Boolean,
      default: false,
    },
    checkedInAt: Date,
    passengerInfo: {
      firstName: { type: String, default: '' },
      lastName: { type: String, default: '' },
      gender: { type: String, default: '' },
      dob: { type: String, default: '' },
      email: { type: String, default: '' },
      phone: { type: String, default: '' },
      idNumber: { type: String, default: '' },
    },
    adminId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model('Booking', bookingSchema);
