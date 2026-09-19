import { errorResponse } from '../utils/apiResponse.js';

export const requirePermission = (category) => {
  return (req, res, next) => {
    if (!req.user) {
      return errorResponse(res, 401, 'Authentication required.');
    }

    const role = req.user.role ? req.user.role.toUpperCase() : 'USER';
    const permissions = req.user.permissions || [];

    // Super Admin has access to everything
    if (role === 'SUPER_ADMIN' || permissions.includes('ALL')) {
      return next();
    }

    // Admin must have specific category permission
    if (role === 'ADMIN') {
      const targetCategory = category.toUpperCase();
      if (permissions.includes(targetCategory)) {
        return next();
      }
      return errorResponse(
        res,
        403,
        `Access denied. Your admin account does not have permission for '${targetCategory}'.`
      );
    }

    return errorResponse(res, 403, 'Access denied. Admin permissions required.');
  };
};

export const requireRole = (...allowedRoles) => {
  const normalized = allowedRoles.map((r) => r.toUpperCase());
  return (req, res, next) => {
    if (!req.user) {
      return errorResponse(res, 401, 'Authentication required.');
    }
    const userRole = req.user.role ? req.user.role.toUpperCase() : 'USER';
    if (!normalized.includes(userRole)) {
      return errorResponse(
        res,
        403,
        `Forbidden. Role '${userRole}' is not authorized to access this resource.`
      );
    }
    next();
  };
};
