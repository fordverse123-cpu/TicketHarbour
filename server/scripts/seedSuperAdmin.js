import dotenv from 'dotenv';
import mongoose from 'mongoose';
import User from '../models/User.js';
import { connectDB } from '../config/db.js';

dotenv.config();

export const seedSuperAdmin = async () => {
  try {
    const email = process.env.SUPER_ADMIN_EMAIL || 'admin@ticketharbour.com';
    const password = process.env.SUPER_ADMIN_PASSWORD || 'SuperAdminSecret123!';
    const name = process.env.SUPER_ADMIN_NAME || 'TicketHarbour Super Admin';

    // Check if Super Admin already exists by role or email
    let superAdmin = await User.findOne({
      $or: [{ role: 'superadmin' }, { email: email.toLowerCase() }],
    }).select('+password');

    if (superAdmin) {
      // Ensure role is superadmin and status is active
      superAdmin.role = 'superadmin';
      superAdmin.status = 'active';
      superAdmin.isVerified = true;
      if (password && !(await superAdmin.matchPassword(password))) {
        superAdmin.password = password;
      }
      await superAdmin.save();
      console.log(`[SuperAdmin Seed] Super Admin account ready: ${superAdmin.email}`);
      return superAdmin;
    }

    // Create single initial Super Admin
    superAdmin = await User.create({
      name,
      email: email.toLowerCase(),
      password,
      role: 'superadmin',
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
