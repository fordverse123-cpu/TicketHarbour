import jwt from 'jsonwebtoken';
import RefreshToken from '../models/RefreshToken.js';

// Generate Access Token (15 minutes expiry)
export const generateAccessToken = (user) => {
  return jwt.sign(
    { id: user._id, role: user.role, email: user.email },
    process.env.JWT_ACCESS_SECRET || 'ticketharbor_access_secret_key_32bytes_min_secure',
    { expiresIn: process.env.JWT_ACCESS_EXPIRE || '15m' }
  );
};

// Generate Refresh Token (7 days expiry)
export const generateRefreshToken = async (user, ipAddress = '') => {
  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days
  const tokenString = jwt.sign(
    { id: user._id },
    process.env.JWT_REFRESH_SECRET || 'ticketharbor_refresh_secret_key_32bytes_min_secure',
    { expiresIn: process.env.JWT_REFRESH_EXPIRE || '7d' }
  );

  const refreshToken = await RefreshToken.create({
    user: user._id,
    token: tokenString,
    expiresAt,
    createdByIp: ipAddress,
  });

  return refreshToken.token;
};

// Set Access and Refresh Token Cookies in HTTP response
export const setTokenCookies = (res, accessToken, refreshToken) => {
  const isProduction = process.env.NODE_ENV === 'production';

  // Access Token Cookie (15 min)
  res.cookie('accessToken', accessToken, {
    httpOnly: true,
    secure: isProduction,
    sameSite: isProduction ? 'strict' : 'lax',
    maxAge: 15 * 60 * 1000,
  });

  // Refresh Token Cookie (7 days)
  if (refreshToken) {
    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: isProduction,
      sameSite: isProduction ? 'strict' : 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });
  }
};

// Clear Token Cookies on logout
export const clearTokenCookies = (res) => {
  res.cookie('accessToken', '', {
    httpOnly: true,
    expires: new Date(0),
  });
  res.cookie('refreshToken', '', {
    httpOnly: true,
    expires: new Date(0),
  });
};
