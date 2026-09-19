import mongoose from 'mongoose';

const routeStopSchema = new mongoose.Schema(
  {
    stationCode: {
      type: String,
      required: true,
      uppercase: true,
      trim: true,
    },
    stationName: {
      type: String,
      required: true,
      trim: true,
    },
    arrivalTime: {
      type: String,
      default: null, // "HH:MM" 24h format
    },
    departureTime: {
      type: String,
      default: null, // "HH:MM" 24h format
    },
    day: {
      type: Number,
      required: true,
      default: 1,
    },
    haltMinutes: {
      type: Number,
      default: 0,
    },
    distance: {
      type: Number,
      default: 0,
    },
  },
  { _id: false }
);

const trainSchema = new mongoose.Schema(
  {
    trainNumber: {
      type: String,
      required: [true, 'Train number is required'],
      unique: true,
      trim: true,
      index: true,
    },
    trainName: {
      type: String,
      required: [true, 'Train name is required'],
      trim: true,
    },
    trainType: {
      type: String,
      required: [true, 'Train type is required'],
      enum: [
        'Express',
        'Superfast',
        'Rajdhani',
        'Shatabdi',
        'Duronto',
        'Vande Bharat',
        'Intercity',
        'Passenger',
        'Other',
      ],
      default: 'Express',
    },
    zone: {
      type: String,
      trim: true,
    },
    source: {
      type: String,
      required: true,
      index: true,
    },
    destination: {
      type: String,
      required: true,
      index: true,
    },
    runningDays: [
      {
        type: String,
        enum: ['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN'],
      },
    ],
    classes: [
      {
        type: String,
        enum: ['1A', '2A', '3A', 'SL', 'CC', 'EC', '2S'],
      },
    ],
    route: [routeStopSchema],
    amenities: [
      {
        type: String,
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

// Indexes for fast searching
trainSchema.index({ trainNumber: 1, source: 1, destination: 1, active: 1 });
trainSchema.index({ 'route.stationCode': 1, active: 1 });

export default mongoose.model('Train', trainSchema);
