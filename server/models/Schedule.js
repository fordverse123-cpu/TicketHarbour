import mongoose from 'mongoose';

const lockedSeatSchema = new mongoose.Schema({
  seatId: { type: String, required: true },
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  tierName: { type: String, required: true },
  price: { type: Number, required: true },
  expiresAt: { type: Date, required: true },
});

const scheduleSchema = new mongoose.Schema(
  {
    listing: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Listing',
      required: [true, 'Listing reference is required'],
    },
    venue: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Venue',
    },
    date: {
      type: Date,
      required: [true, 'Schedule date is required'],
      index: true,
    },
    startTime: {
      type: String,
      required: [true, 'Start time is required'],
    },
    endTime: {
      type: String,
    },
    pricing: [
      {
        tierName: { type: String, required: true },
        price: { type: Number, required: true },
        classType: String,
        availableSeats: { type: Number, default: 50 },
      },
    ],
    seatMap: {
      bookedSeats: [{ type: String }], // Array of seat strings e.g. ["VIP-A1", "ECON-B4"]
      lockedSeats: [lockedSeatSchema],
    },
    status: {
      type: String,
      enum: ['scheduled', 'ongoing', 'completed', 'cancelled'],
      default: 'scheduled',
    },
  },
  {
    timestamps: true,
  }
);

// Method to purge expired locked seats dynamically
scheduleSchema.methods.cleanExpiredLocks = function () {
  const now = new Date();
  if (this.seatMap && this.seatMap.lockedSeats) {
    this.seatMap.lockedSeats = this.seatMap.lockedSeats.filter(
      (lock) => lock.expiresAt > now
    );
  }
};

export default mongoose.model('Schedule', scheduleSchema);
