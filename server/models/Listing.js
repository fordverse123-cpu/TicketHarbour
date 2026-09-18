import mongoose from 'mongoose';

const pricingTierSchema = new mongoose.Schema({
  tierName: { type: String, required: true }, // e.g. "VIP", "Standard", "Sleeper", "3A", "2A", "Economy", "General Admission"
  price: { type: Number, required: true },
  description: String,
  totalCapacity: { type: Number, default: 50 },
  classType: String, // e.g. "SL", "3A", "2A", "1A", "Economy", "Business"
});

const listingSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Title is required'],
      trim: true,
    },
    slug: {
      type: String,
      lowercase: true,
      unique: true,
    },
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Category',
      required: [true, 'Category reference is required'],
    },
    categoryType: {
      type: String,
      required: true,
      enum: ['movie', 'event', 'sports', 'bus', 'train', 'flight', 'attraction'],
    },
    description: {
      type: String,
      required: [true, 'Description is required'],
    },
    images: [{ type: String }],
    bannerImage: { type: String },
    
    // Venue reference (Movies, Events, Sports)
    venue: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Venue',
    },

    // Transit Information (Bus, Train, Flights)
    transitInfo: {
      source: String, // e.g. "New York", "Mumbai", "London"
      destination: String, // e.g. "Boston", "Delhi", "Paris"
      departureTime: String,
      arrivalTime: String,
      duration: String,
      number: String, // Train number, Flight number, Bus registration
      operator: String, // Airline, Railway corp, Bus company
      busType: String, // e.g. "AC Sleeper (2+1)", "Volvo Multi-Axle"
    },

    // Attractions Information
    attractionInfo: {
      openingHours: String,
      includedServices: [String],
      validityDays: { type: Number, default: 1 },
    },

    // Dynamic Pricing Tiers per category
    pricingTiers: [pricingTierSchema],

    location: {
      city: { type: String, required: true, index: true },
      state: String,
      country: { type: String, default: 'India' },
    },

    rating: {
      type: Number,
      default: 4.5,
      min: 0,
      max: 5,
    },
    numReviews: {
      type: Number,
      default: 0,
    },
    isFeatured: {
      type: Boolean,
      default: false,
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

listingSchema.index({ title: 'text', description: 'text', 'location.city': 'text' });

listingSchema.pre('save', function (next) {
  if (this.isModified('title')) {
    this.slug = this.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '') + '-' + Date.now();
  }
  next();
});

export default mongoose.model('Listing', listingSchema);
