import mongoose from 'mongoose';

const categorySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Category name is required'],
      unique: true,
      trim: true,
    },
    type: {
      type: String,
      required: [true, 'Category type key is required'],
      unique: true,
      enum: ['movie', 'event', 'sports', 'bus', 'train', 'flight', 'attraction'],
      lowercase: true,
    },
    slug: {
      type: String,
      lowercase: true,
      required: true,
    },
    icon: {
      type: String,
      default: 'Ticket',
    },
    description: {
      type: String,
      trim: true,
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

categorySchema.pre('validate', function (next) {
  if (this.name && !this.slug) {
    this.slug = this.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
  }
  next();
});

export default mongoose.model('Category', categorySchema);
