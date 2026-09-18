import mongoose from 'mongoose';

const refreshTokenSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    token: {
      type: String,
      required: true,
      unique: true,
    },
    expiresAt: {
      type: Date,
      required: true,
    },
    createdByIp: String,
    revoked: Date,
    revokedByIp: String,
    replacedByToken: String,
  },
  {
    timestamps: true,
  }
);

refreshTokenSchema.virtual('isExpired').get(function () {
  return Date.now() >= this.expiresAt;
});

refreshTokenSchema.virtual('isActive').get(function () {
  return !this.revoked && !this.isExpired;
});

// TTL index to automatically clear expired refresh tokens after 7 days
refreshTokenSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

export default mongoose.model('RefreshToken', refreshTokenSchema);
