// Centralized menu items configuration
// This file serves as the single source of truth for all sidebar menu items
// Any changes here will automatically reflect in both Sidebar.tsx and PermissionMatrix.tsx

export interface MenuItemConfig {
  label: string;
  requiredRoles: string[];
  icon?: any; // Lucide icon component
}

export const SIDEBAR_MENU_ITEMS: { [key: string]: MenuItemConfig } = {
  'dashboard': { label: 'Dashboard', requiredRoles: ['admin', 'manager', 'employee'] },
  'command-center': { label: 'Command Center', requiredRoles: ['admin'] },
  'workflow-hub': { label: 'Workflow Hub', requiredRoles: ['admin'] },
  'my-team': { label: 'My Team', requiredRoles: ['admin', 'manager', 'teamlead'] },
  'directory': { label: 'Directory', requiredRoles: ['admin', 'hr'] },
  'leave-attendance': { label: 'Leave & Attendance', requiredRoles: ['admin', 'manager', 'employee', 'hr', 'teamlead'] },
  'timesheet-entry': { label: 'Timesheet Entry', requiredRoles: ['admin', 'manager', 'employee', 'hr', 'teamlead'] },
  'performance-goals': { label: 'Performance Goals', requiredRoles: ['admin', 'manager', 'employee', 'teamlead'] },
  'payroll-benefits': { label: 'Payroll & Benefits', requiredRoles: ['admin', 'employee', 'hr'] },
  'project-management': { label: 'Project Management', requiredRoles: ['admin', 'hr'] },
  'recruiting': { label: 'Recruiting', requiredRoles: ['admin'] },
  'reports': { label: 'Reports', requiredRoles: ['admin', 'manager', 'hr', 'teamlead'] },
  'audit-logs': { label: 'Audit Logs', requiredRoles: ['admin'] },
  'permission-management': { label: 'Permission Management', requiredRoles: ['admin'] },
  'role-management': { label: 'Role Management', requiredRoles: ['admin'] },
  'profile': { label: 'Profile', requiredRoles: ['admin', 'manager', 'employee', 'hr', 'teamlead'] },
  'settings': { label: 'Settings', requiredRoles: ['admin', 'manager', 'employee', 'hr', 'teamlead'] }
};

// Helper function to validate if a menu key is valid
export const isValidMenuKey = (key: string): boolean => {
  return key in SIDEBAR_MENU_ITEMS;
};

// Helper function to get all menu keys
export const getAllMenuKeys = (): string[] => {
  return Object.keys(SIDEBAR_MENU_ITEMS);
};

// Helper function to get menu configuration
export const getMenuConfig = (key: string): MenuItemConfig | null => {
  return SIDEBAR_MENU_ITEMS[key] || null;
};
