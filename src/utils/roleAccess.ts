// Role-based access control utility for project dashboard
export type UserRole =
  | 'admin'
  | 'finance'
  | 'finance manager'
  | 'finance_manager'
  | 'marketer'
  | 'developer'
  | 'manager'
  | 'staff'
  | 'core'
  | 'main team member'
  | 'main_team_member';

export interface User {
  id: string;
  email: string;
  role: UserRole;
  name?: string;
}

function normalizeRole(input: any): UserRole {
  const raw = String(input || "").trim().toLowerCase();
  if (!raw) return 'staff';
  if (raw === 'finance manager' || raw === 'finance_manager') return 'finance';
  if (raw === 'main team member' || raw === 'main_team_member') return 'core';
  return raw as UserRole;
}

// Permission levels for different data types
export enum PermissionLevel {
  FULL_ACCESS = 'full',      // Can see everything including financial data
  LIMITED_ACCESS = 'limited', // Can see project details but no financial data
  NO_ACCESS = 'none'         // Cannot access
}

// Role permissions mapping
export const ROLE_PERMISSIONS: Record<UserRole, PermissionLevel> = {
  admin: PermissionLevel.FULL_ACCESS,
  finance: PermissionLevel.FULL_ACCESS,
  'finance manager': PermissionLevel.FULL_ACCESS,
  finance_manager: PermissionLevel.FULL_ACCESS,
  core: PermissionLevel.FULL_ACCESS,
  'main team member': PermissionLevel.FULL_ACCESS,
  main_team_member: PermissionLevel.FULL_ACCESS,
  marketer: PermissionLevel.LIMITED_ACCESS, // Can see related projects only
  manager: PermissionLevel.LIMITED_ACCESS,
  developer: PermissionLevel.LIMITED_ACCESS,
  staff: PermissionLevel.LIMITED_ACCESS
};

/**
 * Check if user has permission to view financial data
 */
export function canViewFinancialData(user: User): boolean {
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
