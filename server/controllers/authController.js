import crypto from 'crypto';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import RefreshToken from '../models/RefreshToken.js';
import { successResponse, errorResponse } from '../utils/apiResponse.js';
import { generateAccessToken, generateRefreshToken, setTokenCookies, clearTokenCookies } from '../utils/jwt.js';
import { sendEmail } from '../utils/sendEmail.js';

// @desc    Register new user
// @route   POST /api/v1/auth/register
// @access  Public
export const register = async (req, res, next) => {
  try {
    const { name, email, password, phone } = req.body;

    if (!name || !email || !password) {
      return errorResponse(res, 400, 'Please provide name, email and password');
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return errorResponse(res, 400, 'Email address already registered');
    }

    const user = new User({
      name,
      email,
      password,
      phone: phone || '',
      role: 'user', // Explicitly force role to user (prevent privilege escalation)
      status: 'active',
    });

    const verificationToken = user.getVerificationToken();
    await user.save();

    // Verification URL
    const verifyUrl = `${process.env.CLIENT_URL || 'https://ticket-harbour.vercel.app'}/verify-email/${verificationToken}`;

    const message = `Welcome to TicketHarbor! Please verify your email by clicking the link: \n\n ${verifyUrl}`;
    const html = `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 8px;">
        <h2 style="color: #0d9488;">Welcome to TicketHarbor</h2>
        <p>Hi ${user.name},</p>
        <p>Thank you for creating an account with TicketHarbor. Please verify your email address to complete your registration.</p>
        <div style="margin: 30px 0;">
          <a href="${verifyUrl}" style="background-color: #0d9488; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold;">Verify Email Address</a>
        </div>
        <p style="color: #64748b; font-size: 14px;">If you did not request this, please ignore this email.</p>
      </div>
    `;

    try {
      await sendEmail({
        email: user.email,
        subject: 'TicketHarbor - Account Email Verification',
        message,
        html,
      });
    } catch (err) {
      console.error('Email send failure:', err);
    }

    const accessToken = generateAccessToken(user);
    const refreshToken = await generateRefreshToken(user, req.ip);
    setTokenCookies(res, accessToken, refreshToken);

    return successResponse(res, 201, 'Registration successful. Verification email sent.', {
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        permissions: user.permissions || [],
        status: user.status,
        isVerified: user.isVerified,
      },
      accessToken,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Login user & get tokens
// @route   POST /api/v1/auth/login
// @access  Public
export const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return errorResponse(res, 400, 'Please provide email and password');
    }

    const cleanEmail = email.trim().toLowerCase();
    const user = await User.findOne({ email: cleanEmail }).select('+password');
    if (!user) {
      return errorResponse(res, 401, 'Invalid email or password');
    }

    if (user.status === 'inactive' || user.status === 'suspended') {
      return errorResponse(res, 403, 'Your account has been deactivated or suspended. Please contact Super Admin.');
    }

    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      return errorResponse(res, 401, 'Invalid email or password');
    }

    user.lastLogin = new Date();
    await user.save({ validateBeforeSave: false });

    const accessToken = generateAccessToken(user);
    const refreshToken = await generateRefreshToken(user, req.ip);
    setTokenCookies(res, accessToken, refreshToken);

    return successResponse(res, 200, 'Login successful', {
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        permissions: user.permissions || [],
        status: user.status,
        phone: user.phone,
        isVerified: user.isVerified,
      },
      accessToken,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Logout user & revoke refresh token
// @route   POST /api/v1/auth/logout
// @access  Private
export const logout = async (req, res, next) => {
  try {
    const token = req.cookies?.refreshToken;
    if (token) {
      await RefreshToken.findOneAndUpdate(
        { token },
        { revoked: new Date(), revokedByIp: req.ip }
      );
    }
    clearTokenCookies(res);
    return successResponse(res, 200, 'Logged out successfully');
  } catch (error) {
    next(error);
  }
};

// @desc    Refresh access token & rotate refresh token
// @route   POST /api/v1/auth/refresh
// @access  Public (via Refresh Token Cookie/Body)
export const refreshToken = async (req, res, next) => {
  try {
    const token = req.cookies?.refreshToken || req.body.refreshToken;

    if (!token) {
      return errorResponse(res, 401, 'Refresh token required');
    }

    const existingRefreshToken = await RefreshToken.findOne({ token });

    if (!existingRefreshToken || !existingRefreshToken.isActive) {
      clearTokenCookies(res);
      return errorResponse(res, 401, 'Invalid or expired refresh token');
    }

    // Revoke old refresh token (Rotation)
    existingRefreshToken.revoked = new Date();
    existingRefreshToken.revokedByIp = req.ip;

    const user = await User.findById(existingRefreshToken.user);
    if (!user) {
      clearTokenCookies(res);
      return errorResponse(res, 401, 'User associated with refresh token not found');
    }

    // Create new tokens
    const newAccessToken = generateAccessToken(user);
    const newRefreshToken = await generateRefreshToken(user, req.ip);
    existingRefreshToken.replacedByToken = newRefreshToken;
    await existingRefreshToken.save();

    setTokenCookies(res, newAccessToken, newRefreshToken);

    return successResponse(res, 200, 'Token refreshed successfully', {
      accessToken: newAccessToken,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get logged in user details
// @route   GET /api/v1/auth/me
// @access  Private
export const getMe = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);
    return successResponse(res, 200, 'Current user profile', { user });
  } catch (error) {
    next(error);
  }
};

// @desc    Forgot Password
// @route   POST /api/v1/auth/forgot-password
// @access  Public
export const forgotPassword = async (req, res, next) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });

    if (!user) {
      // Return success to avoid email enumeration
      return successResponse(
        res,
        200,
        'If an account exists with that email, a password reset link has been sent.'
      );
    }

    const resetToken = user.getResetPasswordToken();
    await user.save({ validateBeforeSave: false });

    const resetUrl = `${process.env.CLIENT_URL || 'https://ticket-harbour.vercel.app'}/reset-password/${resetToken}`;

    const message = `You requested a password reset on TicketHarbor. Please use the following link to reset your password:\n\n${resetUrl}`;
    const html = `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 8px;">
        <h2 style="color: #0d9488;">TicketHarbor Password Reset</h2>
        <p>Hi ${user.name},</p>
        <p>We received a request to reset your password. Click the button below to choose a new password (valid for 10 minutes):</p>
        <div style="margin: 30px 0;">
          <a href="${resetUrl}" style="background-color: #4f46e5; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold;">Reset Password</a>
        </div>
        <p style="color: #64748b; font-size: 14px;">If you did not request this reset, please ignore this email.</p>
      </div>
    `;

    try {
      await sendEmail({
        email: user.email,
        subject: 'TicketHarbor - Password Reset Request',
        message,
        html,
      });
      return successResponse(res, 200, 'Password reset link sent to your email.');
    } catch (err) {
      user.resetPasswordToken = undefined;
      user.resetPasswordExpire = undefined;
      await user.save({ validateBeforeSave: false });
      return errorResponse(res, 500, 'Email could not be sent. Please try again.');
    }
  } catch (error) {
    next(error);
  }
};

// @desc    Reset Password
// @route   POST /api/v1/auth/reset-password/:resetToken
// @access  Public
export const resetPassword = async (req, res, next) => {
  try {
    const { password } = req.body;
    if (!password || password.length < 6) {
      return errorResponse(res, 400, 'Password must be at least 6 characters long');
    }

    const resetPasswordToken = crypto
      .createHash('sha256')
      .update(req.params.resetToken)
      .digest('hex');

    const user = await User.findOne({
      resetPasswordToken,
      resetPasswordExpire: { $gt: Date.now() },
    });

    if (!user) {
      return errorResponse(res, 400, 'Invalid or expired password reset token');
    }

    user.password = password;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;
    await user.save();

    const accessToken = generateAccessToken(user);
    const refreshToken = await generateRefreshToken(user, req.ip);
    setTokenCookies(res, accessToken, refreshToken);

    return successResponse(res, 200, 'Password reset successful. You are now logged in.', {
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
      accessToken,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Verify Email Token
// @route   GET /api/v1/auth/verify-email/:verifyToken
// @access  Public
export const verifyEmail = async (req, res, next) => {
  try {
    const verificationToken = crypto
      .createHash('sha256')
      .update(req.params.verifyToken)
      .digest('hex');

    const user = await User.findOne({
      verificationToken,
      verificationTokenExpire: { $gt: Date.now() },
    });

    if (!user) {
      return errorResponse(res, 400, 'Invalid or expired email verification token');
    }

    user.isVerified = true;
    user.verificationToken = undefined;
    user.verificationTokenExpire = undefined;
    await user.save();

    return successResponse(res, 200, 'Email successfully verified!');
  } catch (error) {
    next(error);
  }
};
