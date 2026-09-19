import dotenv from 'dotenv';
import mongoose from 'mongoose';
import User from '../models/User.js';
import { connectDB } from '../config/db.js';

dotenv.config();

export const seedSuperAdmin = async () => {
  try {
    const rawEmail = process.env.SUPER_ADMIN_EMAIL || 'admin@ticketharbour.com';
    const rawPassword = process.env.SUPER_ADMIN_PASSWORD || 'SuperAdminSecret123!';
    const rawName = process.env.SUPER_ADMIN_NAME || 'TicketHarbour Super Admin';

    // Strip any quotes if present in env strings
    const email = rawEmail.replace(/^["']|["']$/g, '').trim().toLowerCase();
    const password = rawPassword.replace(/^["']|["']$/g, '').trim();
    const name = rawName.replace(/^["']|["']$/g, '').trim();

    // Find superadmin user by exact email
    let superAdmin = await User.findOne({ email }).select('+password');

    if (!superAdmin) {
      // If superadmin with another email exists, promote/update this target email user
      superAdmin = await User.findOne({ role: 'superadmin' }).select('+password');
    }

    if (superAdmin) {
      superAdmin.name = name;
      superAdmin.email = email;
      superAdmin.role = 'SUPER_ADMIN';
      superAdmin.permissions = ['ALL'];
      superAdmin.status = 'active';
      superAdmin.isVerified = true;
      superAdmin.password = password; // Force set password so bcrypt pre-save rehashes it
      await superAdmin.save();
      console.log(`[SuperAdmin Seed] Super Admin account updated & password reset for: ${superAdmin.email}`);
      return superAdmin;
    }

    // Create single initial Super Admin
    superAdmin = await User.create({
      name,
      email,
      password,
      role: 'SUPER_ADMIN',
      permissions: ['ALL'],
      status: 'active',
      isVerified: true,
      phone: '+1 800-SUPERADMIN',
    });

    console.log(`[SuperAdmin Seed] Created Super Admin account successfully: ${superAdmin.email}`);
    return superAdmin;
  } catch (error) {
    console.error('[SuperAdmin Seed Error]:', error.message);
  }
};

// Execute if run directly via CLI (e.g. node scripts/seedSuperAdmin.js)
if (process.argv[1]?.includes('seedSuperAdmin.js')) {
  (async () => {
    await connectDB();
    await seedSuperAdmin();
    mongoose.connection.close();
    process.exit(0);
  })();
}
