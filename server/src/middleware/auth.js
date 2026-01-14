import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import Role from '../models/Role.js';

const JWT_SECRET = process.env.JWT_SECRET || 'dev_secret_change_me';

export const authenticate = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, JWT_SECRET);
    const userId = decoded?.uid || decoded?.userId;
    
    if (!userId) {
      return res.status(401).json({ error: 'Invalid token' });
    }

    const user = await User.findById(userId).select('-passwordHash -pinHash');
    
    if (!user) {
      return res.status(401).json({ error: 'User not found' });
    }

    req.user = user;
    next();
  } catch (err) {
    console.error('Auth middleware error:', err);
    if (err.name === 'JsonWebTokenError') {
      return res.status(401).json({ error: 'Invalid token' });
    }
    if (err.name === 'TokenExpiredError') {
      return res.status(401).json({ error: 'Token expired' });
    }
    res.status(500).json({ error: 'Authentication failed' });
  }
};

export const isAdmin = (req, res, next) => {
  if (req.user && req.user.role === 'admin') {
    return next();
  }
  res.status(403).json({ error: 'Admin access required' });
};

// RBAC Permission Middleware
export const requirePermission = (permission) => {
  return async (req, res, next) => {
    try {
      if (!req.user) {
        return res.status(401).json({ error: 'Authentication required' });
      }

      const user = req.user;
      
      // Admin has all permissions
      if (user.role === 'admin') {
        return next();
      }

      // Check user permissions array
      if (user.permissions && Array.isArray(user.permissions)) {
        if (user.permissions.includes(permission) || user.permissions.includes('*')) {
          return next();
        }
      }

      // Role-based permission mapping
      const rolePermissions = {
        'marketing_manager': [
          'leads.read', 'leads.update', 'leads.assign',
          'pipeline.manage', 'team.manage', 'reports.view'
        ],
        'marketer': [
          'leads.read', 'leads.update', 'leads.create',
          'pipeline.view', 'reports.view_limited'
        ],
        'sales': [
          'leads.read', 'leads.update', 'leads.create',
          'pipeline.manage', 'reports.view_limited'
        ],
        'staff': [
          'leads.read', 'pipeline.view'
        ]
      };

      const userRolePermissions = rolePermissions[user.role] || [];
      
      if (userRolePermissions.includes(permission) || userRolePermissions.includes('*')) {
        return next();
      }

      res.status(403).json({ 
        error: 'Insufficient permissions',
        required: permission,
        userRole: user.role
      });
    } catch (error) {
      console.error('Permission middleware error:', error);
      res.status(500).json({ error: 'Permission check failed' });
    }
  };
};

// Data scope middleware for filtering results based on user role
export const applyDataScope = (req, res, next) => {
  try {
    if (!req.user) {
      return next();
    }

    const user = req.user;
    
    // Admin sees all data
    if (user.role === 'admin') {
      req.dataScope = 'all';
      return next();
    }

    // Marketing Manager sees team data
    if (user.role === 'marketing_manager') {
      req.dataScope = 'team';
      return next();
    }

    // Marketer and staff see assigned data only
    if (user.role === 'marketer' || user.role === 'staff') {
      req.dataScope = 'assigned';
      return next();
    }

    // Default scope for other roles
    req.dataScope = 'assigned';
    next();
  } catch (error) {
    console.error('Data scope middleware error:', error);
    req.dataScope = 'assigned';
    next();
  }
};

// Lead ownership middleware
export const requireLeadOwnership = async (req, res, next) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    const user = req.user;
    const leadId = req.params.id || req.body.leadId;

    // Admin can access any lead
    if (user.role === 'admin') {
      return next();
    }

    // Marketing Manager can access team leads
    if (user.role === 'marketing_manager') {
      return next();
    }

    // For marketers and staff, check if lead is assigned to them
    // This would typically check against a database
    // For now, we'll allow access but log the attempt
    console.log(`Lead access attempt: User ${user._id} (${user.role}) accessing lead ${leadId}`);
    
    next();
  } catch (error) {
    console.error('Lead ownership middleware error:', error);
    res.status(500).json({ error: 'Lead access check failed' });
  }
};
