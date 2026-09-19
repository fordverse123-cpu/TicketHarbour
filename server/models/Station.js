import mongoose from 'mongoose';

const stationSchema = new mongoose.Schema(
  {
    stationCode: {
      type: String,
      required: [true, 'Station code is required'],
      unique: true,
      uppercase: true,
      trim: true,
      index: true,
    },
    stationName: {
      type: String,
      required: [true, 'Station name is required'],
      trim: true,
      index: true,
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
    zone: {
      type: String,
      trim: true,
    },
    latitude: {
      type: Number,
    },
    longitude: {
      type: Number,
    },
    aliases: [
      {
        type: String,
        trim: true,
        index: true,
      },
    ],
    active: {
      type: Boolean,
      default: true,
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

// Compound text index for station searching
stationSchema.index({
  stationCode: 1,
  stationName: 1,
  city: 1,
  aliases: 1,
});

export default mongoose.model('Station', stationSchema);
