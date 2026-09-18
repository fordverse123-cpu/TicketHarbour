import mongoose from 'mongoose';

const seatBlockSchema = new mongoose.Schema({
  name: { type: String, required: true }, // e.g. "VIP", "Executive", "Economy", "Lower Tier", "Upper Stand"
  rows: { type: Number, required: true, default: 5 },
  cols: { type: Number, required: true, default: 10 },
  priceMultiplier: { type: Number, default: 1.0 },
});

const venueSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Venue name is required'],
      trim: true,
    },
    city: {
      type: String,
      required: [true, 'City is required'],
      trim: true,
      index: true,
    },
    state: {
      type: String,
      trim: true,
    },
    address: {
      type: String,
      required: [true, 'Address is required'],
    },
    capacity: {
      type: Number,
      default: 100,
    },
    seatConfig: {
      blocks: [seatBlockSchema],
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model('Venue', venueSchema);
