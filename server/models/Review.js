import mongoose from 'mongoose';

const reviewSchema = new mongoose.Schema(
  {
    listing: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Listing',
      required: true,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    booking: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Booking',
    },
    rating: {
      type: Number,
      required: true,
      min: 1,
      max: 5,
    },
    comment: {
      type: String,
      required: [true, 'Please provide review comment'],
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

reviewSchema.index({ listing: 1, user: 1 }, { unique: true });

export default mongoose.model('Review', reviewSchema);
