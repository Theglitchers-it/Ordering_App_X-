const logger = require('../utils/logger');

// Role definitions
const ROLES = {
  SUPER_ADMIN: 'super_admin',
  ADMIN_OPS: 'admin_ops',
  MERCHANT_ADMIN: 'merchant_admin',
  SUPPORT_AGENT: 'support_agent',
  FINANCE: 'finance',
  LOGISTICS: 'logistics',
  USER: 'user'
};

// Permission matrix
const PERMISSIONS = {
  [ROLES.SUPER_ADMIN]: ['*'], // All permissions

  [ROLES.ADMIN_OPS]: [
    'orders:read', 'orders:update',
    'users:read', 'users:update',
    'coupons:create', 'coupons:read', 'coupons:update',
    'reports:read'
  ],

  [ROLES.MERCHANT_ADMIN]: [
    'products:create', 'products:read', 'products:update', 'products:delete',
    'categories:create', 'categories:read', 'categories:update', 'categories:delete',
    'tables:create', 'tables:read', 'tables:update', 'tables:delete',
    'orders:read', 'orders:update',
    'merchant:read', 'merchant:update'
  ],

  [ROLES.SUPPORT_AGENT]: [
    'orders:read', 'orders:update',
    'users:read',
    'tickets:create', 'tickets:read', 'tickets:update'
  ],

  [ROLES.FINANCE]: [
    'transactions:read',
    'payouts:read', 'payouts:create', 'payouts:approve',
    'reports:read'
  ],

  [ROLES.LOGISTICS]: [
    'orders:read', 'orders:update',
    'drivers:read', 'drivers:update'
  ],

  [ROLES.USER]: [
    'orders:create', 'orders:read',
    'profile:read', 'profile:update'
  ]
};

/**
 * Check if role has permission
 */
const hasPermission = (role, permission) => {
  if (!role || !permission) return false;

  const rolePermissions = PERMISSIONS[role];
  if (!rolePermissions) return false;

  // Super admin has all permissions
  if (rolePermissions.includes('*')) return true;

  // Check specific permission
  return rolePermissions.includes(permission);
};

/**
 * RBAC Middleware
 * Checks if user has required permission
 * Usage: checkPermission('orders:update')
 */
const checkPermission = (requiredPermission) => {
  return (req, res, next) => {
    if (!req.user || !req.userRole) {
      return res.status(401).json({
        error: 'Unauthorized',
        message: 'Authentication required'
      });
    }

    const allowed = hasPermission(req.userRole, requiredPermission);

    if (!allowed) {
      logger.warn(`Permission denied: ${req.userRole} attempted ${requiredPermission}`);

      return res.status(403).json({
        error: 'Forbidden',
        message: `You don't have permission to perform this action`
      });
    }

    next();
  };
};

/**
 * Check if user has ANY of the required permissions
 */
const checkAnyPermission = (requiredPermissions) => {
  return (req, res, next) => {
    if (!req.user || !req.userRole) {
      return res.status(401).json({
        error: 'Unauthorized',
        message: 'Authentication required'
      });
    }

    const allowed = requiredPermissions.some(permission =>
      hasPermission(req.userRole, permission)
    );

    if (!allowed) {
      return res.status(403).json({
        error: 'Forbidden',
        message: `You don't have permission to perform this action`
      });
    }

    next();
  };
};

/**
 * Check if user has specific role(s)
 */
const checkRole = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user || !req.userRole) {
      return res.status(401).json({
        error: 'Unauthorized',
        message: 'Authentication required'
      });
    }

    if (!allowedRoles.includes(req.userRole)) {
      return res.status(403).json({
        error: 'Forbidden',
        message: 'Access denied'
      });
    }

    next();
  };
};

/**
 * Check if user is admin (any admin role)
 */
const isAdmin = () => {
  return checkRole(
    ROLES.SUPER_ADMIN,
    ROLES.ADMIN_OPS,
    ROLES.MERCHANT_ADMIN
  );
};

module.exports = {
  ROLES,
  PERMISSIONS,
  hasPermission,
  checkPermission,
  checkAnyPermission,
  checkRole,
  isAdmin
};
