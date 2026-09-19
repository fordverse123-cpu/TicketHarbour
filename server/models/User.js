import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Please provide your full name'],
      trim: true,
      maxlength: [50, 'Name cannot exceed 50 characters'],
    },
    email: {
      type: String,
      required: [true, 'Please provide your email address'],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please provide a valid email address'],
    },
    password: {
      type: String,
      required: [true, 'Please provide a password'],
      minlength: [6, 'Password must be at least 6 characters long'],
      select: false,
    },
    role: {
      type: String,
      enum: ['USER', 'ADMIN', 'SUPER_ADMIN', 'user', 'admin', 'superadmin'],
      default: 'USER',
      set: (val) => (val ? val.toUpperCase() : 'USER'),
    },
    permissions: [
      {
        type: String,
        enum: ['MOVIES', 'EVENTS', 'SPORTS', 'BUS', 'TRAIN', 'FLIGHTS', 'ATTRACTIONS', 'ALL'],
      },
    ],
    status: {
      type: String,
      enum: ['active', 'inactive', 'suspended'],
      default: 'active',
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    lastLogin: {
      type: Date,
    },
    phone: {
      type: String,
      trim: true,
      default: '',
    },
    isVerified: {
      type: Boolean,
      default: false,
    },
    verificationToken: String,
    verificationTokenExpire: Date,
    resetPasswordToken: String,
    resetPasswordExpire: Date,
  },
  {
    timestamps: true,
  }
);

// Normalize role & permissions on save
userSchema.pre('save', async function (next) {
  if (this.role) {
    this.role = this.role.toUpperCase();
  }
  if (this.role === 'SUPER_ADMIN') {
    this.permissions = ['ALL'];
  } else if (this.role === 'ADMIN' && (!this.permissions || this.permissions.length === 0)) {
    this.permissions = ['MOVIES', 'EVENTS', 'SPORTS', 'BUS', 'TRAIN', 'FLIGHTS', 'ATTRACTIONS'];
  } else if (this.role === 'USER') {
    this.permissions = [];
  }

  if (!this.isModified('password')) {
    return next();
  }
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Compare entered password with hashed password
userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

// Generate and hash password reset token
userSchema.methods.getResetPasswordToken = function () {
  const resetToken = crypto.randomBytes(20).toString('hex');
  this.resetPasswordToken = crypto
    .createHash('sha256')
    .update(resetToken)
    .digest('hex');

  this.resetPasswordExpire = Date.now() + 10 * 60 * 1000; // 10 minutes
  return resetToken;
};

// Generate email verification token
userSchema.methods.getVerificationToken = function () {
  const verifyToken = crypto.randomBytes(20).toString('hex');
  this.verificationToken = crypto
    .createHash('sha256')
    .update(verifyToken)
    .digest('hex');

  this.verificationTokenExpire = Date.now() + 24 * 60 * 60 * 1000; // 24 hours
  return verifyToken;
};

export default mongoose.model('User', userSchema);
