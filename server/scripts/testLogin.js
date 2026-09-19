import dotenv from 'dotenv';
import mongoose from 'mongoose';
import User from '../models/User.js';
import { connectDB } from '../config/db.js';

dotenv.config();

const test = async () => {
  await connectDB();
  
  const rawEmail = process.env.SUPER_ADMIN_EMAIL || 'jaswanth@gmail.com';
  const rawPassword = process.env.SUPER_ADMIN_PASSWORD || '11223344@Jj#';
  const email = rawEmail.replace(/^["']|["']$/g, '').trim().toLowerCase();
  const password = rawPassword.replace(/^["']|["']$/g, '').trim();

  console.log('Testing email:', email);
  console.log('Testing password length:', password.length);

  // Test lowercased query
  const userLower = await User.findOne({ email }).select('+password');
  console.log('Found with lowercased email?:', !!userLower, userLower ? { id: userLower._id, email: userLower.email, role: userLower.role, status: userLower.status } : null);

  if (userLower) {
    const isMatch = await userLower.matchPassword(password);
    console.log('Password match test result:', isMatch);
  }

  // Also check if any user exists with Jaswanth (case insensitive)
  const allUsers = await User.find({ email: { $regex: 'jaswanth', $options: 'i' } });
  console.log('Users matching jaswanth regex:', allUsers.map(u => ({ id: u._id, email: u.email, role: u.role })));

  mongoose.connection.close();
  process.exit(0);
};

test();
