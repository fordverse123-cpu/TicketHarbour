import request from 'supertest';
import app from '../server.js';
import mongoose from 'mongoose';
import User from '../models/User.js';
import { generateAccessToken } from '../utils/jwt.js';

describe('Admin Creation & Validation Tests', () => {
  let superAdminToken = '';

  beforeAll(async () => {
    // Wait for DB connection if not ready
    if (mongoose.connection.readyState !== 1) {
      await new Promise((resolve) => mongoose.connection.once('open', resolve));
    }

    // Clean up test admins if exist
    await User.deleteMany({ email: { $in: ['testadmin@example.online', 'dupadmin@example.com', 'testsuperadmin@example.com'] } });

    // Find or seed a super admin user for auth headers
    let superAdmin = await User.findOne({ role: { $in: ['SUPER_ADMIN', 'superadmin'] } });
    if (!superAdmin) {
      superAdmin = await User.create({
        name: 'Test Super Admin',
        email: 'testsuperadmin@example.com',
        password: 'SuperAdminSecret123!',
        role: 'SUPER_ADMIN',
        permissions: ['ALL'],
        status: 'active',
        isVerified: true,
      });
    }

    superAdminToken = generateAccessToken(superAdmin);
  });

  afterAll(async () => {
    await User.deleteMany({ email: { $in: ['testadmin@example.online', 'dupadmin@example.com', 'testsuperadmin@example.com'] } });
    await mongoose.connection.close();
  });

  it('should successfully create an admin with a valid email (including modern TLDs like .online)', async () => {
    const res = await request(app)
      .post('/api/v1/super-admin/admins')
      .set('Authorization', `Bearer ${superAdminToken}`)
      .send({
        name: 'John Test Admin',
        email: 'testadmin@example.online',
        password: 'SecurePassword123!',
        phone: '+919876543210',
        permissions: ['MOVIES', 'EVENTS'],
      });

    expect(res.statusCode).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.admin.email).toBe('testadmin@example.online');
    expect(res.body.data.admin.role).toBe('ADMIN');
  });

  it('should reject admin creation when email format is invalid', async () => {
    const res = await request(app)
      .post('/api/v1/super-admin/admins')
      .set('Authorization', `Bearer ${superAdminToken}`)
      .send({
        name: 'Invalid Email Admin',
        email: 'invalid-email-format',
        password: 'SecurePassword123!',
        permissions: ['MOVIES'],
      });

    expect(res.statusCode).toBe(400);
    expect(res.body.success).toBe(false);
    expect(res.body.message).toMatch(/valid email/i);
  });

  it('should reject admin creation when password is too short (< 8 characters)', async () => {
    const res = await request(app)
      .post('/api/v1/super-admin/admins')
      .set('Authorization', `Bearer ${superAdminToken}`)
      .send({
        name: 'Short Pass Admin',
        email: 'shortpass@example.com',
        password: 'short',
        permissions: ['MOVIES'],
      });

    expect(res.statusCode).toBe(400);
    expect(res.body.success).toBe(false);
    expect(res.body.message).toMatch(/8 characters/i);
  });

  it('should reject admin creation when email already exists', async () => {
    const res = await request(app)
      .post('/api/v1/super-admin/admins')
      .set('Authorization', `Bearer ${superAdminToken}`)
      .send({
        name: 'Duplicate Admin',
        email: 'testadmin@example.online',
        password: 'SecurePassword123!',
        permissions: ['MOVIES'],
      });

    expect(res.statusCode).toBe(400);
    expect(res.body.success).toBe(false);
    expect(res.body.message).toMatch(/already exists/i);
  });

  it('should reject admin creation when name exceeds 50 characters', async () => {
    const res = await request(app)
      .post('/api/v1/super-admin/admins')
      .set('Authorization', `Bearer ${superAdminToken}`)
      .send({
        name: 'A'.repeat(55),
        email: 'longname@example.com',
        password: 'SecurePassword123!',
        permissions: ['MOVIES'],
      });

    expect(res.statusCode).toBe(400);
    expect(res.body.success).toBe(false);
    expect(res.body.message).toMatch(/50 characters/i);
  });
});
