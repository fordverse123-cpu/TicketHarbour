import mongoose from 'mongoose';

const searchLogSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
      index: true,
    },
    categoryType: {
      type: String,
      required: true,
      enum: ['train', 'bus', 'flight', 'movie', 'event', 'sports', 'attraction', 'general'],
      default: 'train',
      index: true,
    },
    from: {
      type: String,
      required: true,
      trim: true,
      index: true,
    },
    to: {
      type: String,
      required: true,
      trim: true,
      index: true,
    },
    fromCode: {
      type: String,
      trim: true,
      uppercase: true,
    },
    toCode: {
      type: String,
      trim: true,
      uppercase: true,
    },
    travelDate: {
      type: String,
      trim: true,
    },
    searchParams: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
    resultsCount: {
      type: Number,
      default: 0,
    },
    ipAddress: {
      type: String,
      trim: true,
    },
    userAgent: {
      type: String,
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes for fast recent searches and popular route aggregation
searchLogSchema.index({ user: 1, categoryType: 1, createdAt: -1 });
searchLogSchema.index({ categoryType: 1, from: 1, to: 1, createdAt: -1 });

export default mongoose.model('SearchLog', searchLogSchema);
