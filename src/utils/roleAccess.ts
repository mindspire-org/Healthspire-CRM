// Enhanced Role-based access control utility for CRM
export type UserRole =
  | 'admin'
  | 'marketing_manager'
  | 'marketer'
  | 'sales'
  | 'finance'
  | 'finance manager'
  | 'finance_manager'
  | 'developer'
  | 'manager'
  | 'staff'
  | 'client'
  | 'core'
  | 'main team member'
  | 'main_team_member';

export interface User {
  id: string;
  email: string;
  role: UserRole;
  name?: string;
  permissions?: string[];
  access?: {
    dataScope?: 'assigned' | 'team' | 'all';
    canView?: boolean;
    canEdit?: boolean;
    canDelete?: boolean;
    canSeePrices?: boolean;
    canSeeFinance?: boolean;
  };
}

function normalizeRole(input: any): UserRole {
  const raw = String(input || "").trim().toLowerCase();
  if (!raw) return 'staff';
  if (raw === 'finance manager' || raw === 'finance_manager') return 'finance';
  if (raw === 'main team member' || raw === 'main_team_member') return 'core';
  if (raw === 'marketing manager') return 'marketing_manager';
  return raw as UserRole;
}

// Permission levels for different data types
export enum PermissionLevel {
  FULL_ACCESS = 'full',      // Can see everything including financial data
  LIMITED_ACCESS = 'limited', // Can see project details but no financial data
  NO_ACCESS = 'none'         // Cannot access
}

// Enhanced Role permissions mapping for CRM
export const ROLE_PERMISSIONS: Record<UserRole, PermissionLevel> = {
  admin: PermissionLevel.FULL_ACCESS,
  marketing_manager: PermissionLevel.FULL_ACCESS,
  finance: PermissionLevel.FULL_ACCESS,
  'finance manager': PermissionLevel.FULL_ACCESS,
  finance_manager: PermissionLevel.FULL_ACCESS,
  core: PermissionLevel.FULL_ACCESS,
  'main team member': PermissionLevel.FULL_ACCESS,
  main_team_member: PermissionLevel.FULL_ACCESS,
  marketer: PermissionLevel.LIMITED_ACCESS, // Can see assigned leads only
  sales: PermissionLevel.LIMITED_ACCESS,
  manager: PermissionLevel.LIMITED_ACCESS,
  developer: PermissionLevel.LIMITED_ACCESS,
  staff: PermissionLevel.LIMITED_ACCESS,
  client: PermissionLevel.NO_ACCESS
};

// Permission constants for CRM
export const PERMISSIONS = {
  // Lead management
  LEADS_READ: 'leads.read',
  LEADS_CREATE: 'leads.create',
  LEADS_UPDATE: 'leads.update',
  LEADS_DELETE: 'leads.delete',
  LEADS_ASSIGN: 'leads.assign',
  
  // Pipeline management
  PIPELINE_MANAGE: 'pipeline.manage',
  PIPELINE_VIEW: 'pipeline.view',
  
  // Team management
  TEAM_MANAGE: 'team.manage',
  TEAM_VIEW: 'team.view',
  
  // Reports
  REPORTS_VIEW: 'reports.view',
  REPORTS_VIEW_LIMITED: 'reports.view_limited',
  
  // Finance
  FINANCE_VIEW: 'finance.view',
  FINANCE_MANAGE: 'finance.manage',
  
  // User management
  USERS_MANAGE: 'users.manage',
  ROLES_MANAGE: 'roles.manage',
  
  // System
  SYSTEM_SETTINGS: 'system.settings'
} as const;

// Role-based permission mapping
export const ROLE_PERMISSION_MAP: Record<UserRole, string[]> = {
  admin: Object.values(PERMISSIONS),
  marketing_manager: [
    PERMISSIONS.LEADS_READ, PERMISSIONS.LEADS_UPDATE, PERMISSIONS.LEADS_ASSIGN,
    PERMISSIONS.PIPELINE_MANAGE, PERMISSIONS.TEAM_MANAGE, PERMISSIONS.REPORTS_VIEW,
    PERMISSIONS.FINANCE_VIEW, PERMISSIONS.USERS_MANAGE
  ],
  marketer: [
    PERMISSIONS.LEADS_READ, PERMISSIONS.LEADS_UPDATE, PERMISSIONS.LEADS_CREATE,
    PERMISSIONS.PIPELINE_VIEW, PERMISSIONS.REPORTS_VIEW_LIMITED
  ],
  sales: [
    PERMISSIONS.LEADS_READ, PERMISSIONS.LEADS_UPDATE, PERMISSIONS.LEADS_CREATE,
    PERMISSIONS.PIPELINE_MANAGE, PERMISSIONS.REPORTS_VIEW_LIMITED
  ],
  finance: [
    PERMISSIONS.LEADS_READ, PERMISSIONS.PIPELINE_VIEW, PERMISSIONS.FINANCE_VIEW,
    PERMISSIONS.FINANCE_MANAGE, PERMISSIONS.REPORTS_VIEW
  ],
  'finance manager': [
    PERMISSIONS.LEADS_READ, PERMISSIONS.PIPELINE_VIEW, PERMISSIONS.FINANCE_VIEW,
    PERMISSIONS.FINANCE_MANAGE, PERMISSIONS.REPORTS_VIEW
  ],
  finance_manager: [
    PERMISSIONS.LEADS_READ, PERMISSIONS.PIPELINE_VIEW, PERMISSIONS.FINANCE_VIEW,
    PERMISSIONS.FINANCE_MANAGE, PERMISSIONS.REPORTS_VIEW
  ],
  core: Object.values(PERMISSIONS),
  'main team member': Object.values(PERMISSIONS),
  main_team_member: Object.values(PERMISSIONS),
  manager: [
    PERMISSIONS.LEADS_READ, PERMISSIONS.LEADS_UPDATE, PERMISSIONS.LEADS_ASSIGN,
    PERMISSIONS.PIPELINE_MANAGE, PERMISSIONS.TEAM_VIEW, PERMISSIONS.REPORTS_VIEW
  ],
  developer: [
    PERMISSIONS.LEADS_READ, PERMISSIONS.PIPELINE_VIEW, PERMISSIONS.REPORTS_VIEW_LIMITED
  ],
  staff: [
    PERMISSIONS.LEADS_READ, PERMISSIONS.PIPELINE_VIEW
  ],
  client: []
};

/**
 * Check if user has permission to view financial data (legacy compatibility)
 */
export function canViewFinancialDataLegacy(user: User): boolean {
  return ROLE_PERMISSIONS[user.role] === PermissionLevel.FULL_ACCESS;
}

/**
 * Check if user has permission to view project details
 */
export function canViewProjectDetails(user: User): boolean {
  return ROLE_PERMISSIONS[user.role] !== PermissionLevel.NO_ACCESS;
}

/**
 * Check if marketer can access specific project (related projects only)
 */
export function canMarketerAccessProject(user: User, projectId: string, userProjectIds: string[]): boolean {
  if (user.role !== 'marketer') return true; // Non-marketers can access all projects
  return userProjectIds.includes(projectId);
}

/**
 * Get masked financial data for users without permission
 */
export function maskFinancialData(amount: number): string {
  return '••••••'; // Masked display for unauthorized users
}

/**
 * Filter project data based on user permissions
 */
export function filterProjectData<T extends { price?: number; budget?: number; invoiceAmount?: number }>(
  data: T,
  user: User
): T {
  if (canViewFinancialData(user)) {
    return data;
  }

  // Create a copy and mask financial fields
  const filtered = { ...data };
  
  if ('price' in filtered) {
    filtered.price = undefined;
  }
  if ('budget' in filtered) {
    filtered.budget = undefined;
  }
  if ('invoiceAmount' in filtered) {
    filtered.invoiceAmount = undefined;
  }

  return filtered;
}

/**
 * Get user from localStorage/sessionStorage
 */
export function getCurrentUser(): User | null {
  try {
    const userStr = localStorage.getItem('auth_user') || sessionStorage.getItem('auth_user');
    if (userStr) {
      const user = JSON.parse(userStr);
      return {
        id: user.id || user._id,
        email: user.email,
        role: normalizeRole(user.role || user?.user?.role),
        name: user.name
      };
    }
  } catch (error) {
    console.error('Error parsing user data:', error);
  }
  return null;
}

/**
 * Check if current user has permission
 */
export function hasPermission(permission: PermissionLevel): boolean {
  const user = getCurrentUser();
  if (!user) return false;

  const userPermission = ROLE_PERMISSIONS[user.role];
  return userPermission === permission || 
         (permission === PermissionLevel.LIMITED_ACCESS && userPermission === PermissionLevel.FULL_ACCESS);
}

/**
 * Check if current user has specific CRM permission
 */
export function hasCrmPermission(permission: string): boolean {
  const user = getCurrentUser();
  if (!user) return false;
  
  // Admin has all permissions
  if (user.role === 'admin') return true;
  
  // Check user permissions array
  if (user.permissions && Array.isArray(user.permissions)) {
    if (user.permissions.includes(permission) || user.permissions.includes('*')) {
      return true;
    }
  }
  
  // Check role-based permissions
  const rolePermissions = ROLE_PERMISSION_MAP[user.role] || [];
  return rolePermissions.includes(permission);
}

/**
 * Check if current user can access leads based on data scope
 */
export function canAccessLeads(): boolean {
  const user = getCurrentUser();
  if (!user) return false;
  
  return ['admin', 'marketing_manager', 'marketer', 'sales', 'finance', 'manager'].includes(user.role);
}

/**
 * Check if current user can see financial data
 */
export function canViewFinancialData(user?: User): boolean {
  const currentUser = user || getCurrentUser();
  if (!currentUser) return false;
  
  return ['admin', 'marketing_manager', 'finance', 'finance_manager'].includes(currentUser.role);
}

/**
 * Get user's data scope for filtering
 */
export function getUserDataScope(): 'assigned' | 'team' | 'all' {
  const user = getCurrentUser();
  if (!user) return 'assigned';
  
  if (user.role === 'admin') return 'all';
  if (user.role === 'marketing_manager') return 'team';
  return 'assigned';
}

/**
 * Check if user can perform action on resource
 */
export function canPerformAction(action: string, resource: string): boolean {
  const user = getCurrentUser();
  if (!user) return false;
  
  // Admin can do everything
  if (user.role === 'admin') return true;
  
  // Check specific permissions
  const permission = `${resource}.${action}`;
  return hasCrmPermission(permission);
}

/**
 * Filter leads based on user permissions and data scope
 */
export function filterLeadsForUser<T extends { ownerId?: string; assignedTo?: string }>(leads: T[]): T[] {
  const user = getCurrentUser();
  if (!user) return [];
  
  const dataScope = getUserDataScope();
  
  if (dataScope === 'all') return leads;
  if (dataScope === 'team') return leads; // Team leads - would filter by team in real implementation
  
  // Assigned leads only
  // In real implementation, this would check against assigned leads
  return leads;
}
