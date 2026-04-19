import axios from 'axios';

const API_BASE_URL = 'http://localhost:5000/api';

export interface Role {
  id: number;
  name: string;
  description?: string;
  isCustom: boolean;
  isActive: boolean;
  permissionCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface Permission {
  id: number;
  action: string;
  isEnabled: boolean;
}

export interface RolePermissions {
  id: number;
  name: string;
  description?: string;
  isCustom: boolean;
  isActive: boolean;
  permissionsByModule: {
    [module: string]: Permission[];
  };
}

export interface PermissionUpdate {
  module: string;
  action: string;
  isEnabled: boolean;
}

export interface AuditLog {
  id: number;
  roleName: string;
  module: string;
  action: string;
  previousValue: boolean;
  newValue: boolean;
  changedBy: string;
  changedByEmail: string;
  reason?: string;
  changedAt: string;
}

export interface AuditLogResponse {
  logs: AuditLog[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

// Get all roles
export const getRoles = async (token: string): Promise<Role[]> => {
  try {
    const response = await axios.get(`${API_BASE_URL}/admin/roles`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data.data;
  } catch (error) {
    console.error('Error fetching roles:', error);
    throw error;
  }
};

// Get role with permissions
export const getRolePermissions = async (roleId: number, token: string): Promise<RolePermissions> => {
  try {
    const response = await axios.get(`${API_BASE_URL}/admin/roles/${roleId}`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data.data;
  } catch (error) {
    console.error('Error fetching role permissions:', error);
    throw error;
  }
};

// Update role permissions
export const updateRolePermissions = async (
  roleId: number,
  permissions: PermissionUpdate[],
  reason: string,
  token: string
): Promise<{ roleId: number; changesCount: number }> => {
  try {
    const response = await axios.put(
      `${API_BASE_URL}/admin/roles/${roleId}/permissions`,
      { permissions, reason },
      { headers: { Authorization: `Bearer ${token}` } }
    );
    return response.data.data;
  } catch (error) {
    console.error('Error updating role permissions:', error);
    throw error;
  }
};

// Create custom role
export const createCustomRole = async (
  name: string,
  description: string,
  token: string
): Promise<Role> => {
  try {
    const response = await axios.post(
      `${API_BASE_URL}/admin/roles`,
      { name, description },
      { headers: { Authorization: `Bearer ${token}` } }
    );
    return response.data.data;
  } catch (error) {
    console.error('Error creating custom role:', error);
    throw error;
  }
};

// Get sidebar permissions for current user
export const getSidebarPermissions = async (token: string): Promise<{ [key: string]: boolean }> => {
  try {
    const response = await axios.get(`${API_BASE_URL}/admin/roles/sidebar/permissions`, {
      headers: { 
        Authorization: `Bearer ${token}`,
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0'
      },
      params: { t: Date.now() } // Add timestamp to prevent caching
    });
    return response.data.data;
  } catch (error) {
    console.error('Error fetching sidebar permissions:', error);
    // Return empty object on error - sidebar will use hardcoded fallback
    return {};
  }
};

// Delete custom role
export const deleteCustomRole = async (roleId: number, token: string): Promise<void> => {
  try {
    await axios.delete(`${API_BASE_URL}/admin/roles/${roleId}`, {
      headers: { Authorization: `Bearer ${token}` }
    });
  } catch (error) {
    console.error('Error deleting custom role:', error);
    throw error;
  }
};

// Get permission audit log
export const getPermissionAuditLog = async (
  page: number = 1,
  limit: number = 50,
  roleId?: number,
  token?: string
): Promise<AuditLogResponse> => {
  try {
    let url = `${API_BASE_URL}/admin/roles/audit/logs?page=${page}&limit=${limit}`;
    if (roleId) {
      url += `&roleId=${roleId}`;
    }

    const response = await axios.get(url, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data.data;
  } catch (error) {
    console.error('Error fetching audit log:', error);
    throw error;
  }
};

// Check user permission
export const checkUserPermission = async (
  module: string,
  action: string,
  token: string
): Promise<{ module: string; action: string; hasPermission: boolean; userRole: string }> => {
  try {
    const response = await axios.get(
      `${API_BASE_URL}/admin/permissions/check?module=${module}&action=${action}`,
      { headers: { Authorization: `Bearer ${token}` } }
    );
    return response.data.data;
  } catch (error) {
    console.error('Error checking permission:', error);
    throw error;
  }
};
