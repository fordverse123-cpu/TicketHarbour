import User from '../models/User.js';
import { successResponse, errorResponse } from '../utils/apiResponse.js';

// @desc    Get Super Admin System Overview Stats
// @route   GET /api/v1/super-admin/stats
// @access  Private/SuperAdmin
export const getSuperAdminStats = async (req, res, next) => {
  try {
    const totalAdmins = await User.countDocuments({ role: 'admin' });
    const activeAdmins = await User.countDocuments({ role: 'admin', status: 'active' });
    const inactiveAdmins = await User.countDocuments({ role: 'admin', status: { $ne: 'active' } });
    const totalUsers = await User.countDocuments({ role: 'user' });

    return successResponse(res, 200, 'Super Admin Statistics', {
      stats: {
        totalAdmins,
        activeAdmins,
        inactiveAdmins,
        totalUsers,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get All Admin Accounts with Search & Filtering
// @route   GET /api/v1/super-admin/admins
// @access  Private/SuperAdmin
export const getAdmins = async (req, res, next) => {
  try {
    const { search, status } = req.query;

    const query = { role: 'admin' };

    if (status && status !== 'all') {
      query.status = status;
    }

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { phone: { $regex: search, $options: 'i' } },
      ];
    }

    const admins = await User.find(query)
      .select('-password')
      .populate('createdBy', 'name email')
      .sort('-createdAt');

    return successResponse(res, 200, 'Admin accounts retrieved', { admins });
  } catch (error) {
    next(error);
  }
};

// @desc    Create New Admin Account (Super Admin Only)
// @route   POST /api/v1/super-admin/admins
// @access  Private/SuperAdmin
export const createAdmin = async (req, res, next) => {
  try {
    const { name, email, phone, password, permissions } = req.body;

    if (!name || !email || !password) {
      return errorResponse(res, 400, 'Please provide name, email, and password');
    }

    if (password.length < 6) {
      return errorResponse(res, 400, 'Password must be at least 6 characters long');
    }

    // Check duplicate email
    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return errorResponse(res, 400, 'User with this email already exists');
    }

    // Assign permissions cleanly
    const assignedPermissions = Array.isArray(permissions) && permissions.length > 0
      ? permissions.map((p) => p.toUpperCase())
      : ['MOVIES', 'EVENTS', 'SPORTS', 'BUS', 'TRAIN', 'FLIGHTS', 'ATTRACTIONS'];

    const admin = await User.create({
      name,
      email: email.toLowerCase(),
      phone: phone || '',
      password,
      role: 'ADMIN',
      permissions: assignedPermissions,
      status: 'active',
      createdBy: req.user._id,
      isVerified: true,
    });

    const adminResponse = admin.toObject();
    delete adminResponse.password;

    return successResponse(res, 201, 'Admin account created successfully', {
      admin: adminResponse,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update Admin Category Permissions
// @route   PATCH /api/v1/super-admin/admins/:id/permissions
// @access  Private/SuperAdmin
export const updateAdminPermissions = async (req, res, next) => {
  try {
    const { permissions } = req.body;
    if (!Array.isArray(permissions)) {
      return errorResponse(res, 400, 'Permissions must be an array of category names.');
    }

    const admin = await User.findById(req.params.id);
    if (!admin) {
      return errorResponse(res, 404, 'Admin account not found');
    }

    if (admin.role === 'SUPER_ADMIN' || admin.role === 'superadmin') {
      return errorResponse(res, 403, 'Super Admin permissions cannot be restricted.');
    }

    admin.permissions = permissions.map((p) => p.toUpperCase());
    await admin.save();

    return successResponse(res, 200, 'Admin permissions updated successfully', {
      admin: {
        id: admin._id,
        name: admin.name,
        email: admin.email,
        permissions: admin.permissions,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Toggle or Update Admin Account Status (Activate/Deactivate)
// @route   PUT /api/v1/super-admin/admins/:id/status
// @access  Private/SuperAdmin
export const updateAdminStatus = async (req, res, next) => {
  try {
    const { status } = req.body;
    if (!['active', 'inactive', 'suspended'].includes(status)) {
      return errorResponse(res, 400, 'Invalid status value');
    }

    const admin = await User.findById(req.params.id);
    if (!admin) {
      return errorResponse(res, 404, 'Admin account not found');
    }

    if (admin.role === 'superadmin') {
      return errorResponse(res, 403, 'Super Admin status cannot be altered');
    }

    admin.status = status;
    await admin.save();

    return successResponse(res, 200, `Admin status updated to ${status}`, {
      admin: {
        id: admin._id,
        name: admin.name,
        email: admin.email,
        status: admin.status,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Reset Admin Password (Super Admin Only)
// @route   PUT /api/v1/super-admin/admins/:id/reset-password
// @access  Private/SuperAdmin
export const resetAdminPassword = async (req, res, next) => {
  try {
    const { newPassword } = req.body;
    if (!newPassword || newPassword.length < 6) {
      return errorResponse(res, 400, 'New password must be at least 6 characters long');
    }

    const admin = await User.findById(req.params.id);
    if (!admin) {
      return errorResponse(res, 404, 'Admin account not found');
    }

    if (admin.role === 'superadmin') {
      return errorResponse(res, 403, 'Cannot reset Super Admin password via this endpoint');
    }

    admin.password = newPassword;
    await admin.save();

    return successResponse(res, 200, 'Admin password reset successfully');
  } catch (error) {
    next(error);
  }
};

// @desc    Edit Admin Details
// @route   PUT /api/v1/super-admin/admins/:id
// @access  Private/SuperAdmin
export const updateAdmin = async (req, res, next) => {
  try {
    const { name, phone, email } = req.body;

    const admin = await User.findById(req.params.id);
    if (!admin) {
      return errorResponse(res, 404, 'Admin account not found');
    }

    if (admin.role === 'superadmin') {
      return errorResponse(res, 403, 'Super Admin account cannot be modified via this endpoint');
    }

    if (name) admin.name = name;
    if (phone !== undefined) admin.phone = phone;
    if (email && email.toLowerCase() !== admin.email) {
      const emailExists = await User.findOne({ email: email.toLowerCase() });
      if (emailExists) {
        return errorResponse(res, 400, 'Email address already in use');
      }
      admin.email = email.toLowerCase();
    }

    await admin.save();

    const adminObj = admin.toObject();
    delete adminObj.password;

    return successResponse(res, 200, 'Admin details updated successfully', { admin: adminObj });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete Admin Account
// @route   DELETE /api/v1/super-admin/admins/:id
// @access  Private/SuperAdmin
export const deleteAdmin = async (req, res, next) => {
  try {
    const admin = await User.findById(req.params.id);
    if (!admin) {
      return errorResponse(res, 404, 'Admin account not found');
    }

    if (admin.role === 'superadmin') {
      return errorResponse(res, 403, 'Cannot delete Super Admin account');
    }

    await User.findByIdAndDelete(req.params.id);
    return successResponse(res, 200, 'Admin account deleted successfully');
  } catch (error) {
    next(error);
  }
};
