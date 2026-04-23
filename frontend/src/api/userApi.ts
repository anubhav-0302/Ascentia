import { apiClient, BASE_URL, getActiveOrgHeader } from "./apiClient";

export interface User {
  id: number;
  name: string;
  email: string;
  role: 'admin' | 'employee';
  status: 'active' | 'inactive';
  createdAt: string;
  updatedAt?: string;
  lastLogin?: string;
}

export interface CreateUserData {
  name: string;
  email: string;
  password: string;
  role?: 'admin' | 'employee';
}

export interface UpdateUserData {
  name?: string;
  email?: string;
  role?: 'admin' | 'employee';
  status?: 'active' | 'inactive';
}

export interface ResetPasswordData {
  newPassword: string;
}

export interface ChangePasswordData {
  currentPassword: string;
  newPassword: string;
}

// Get all users (admin only)
export const getAllUsers = async () => {
  const response = await apiClient.get('/users');
  return response;
};

// Get user by ID (admin only)
export const getUserById = async (id: number) => {
  const response = await apiClient.get(`/users/${id}`);
  return response;
};

// Create new user (admin only)
export const createUser = async (userData: CreateUserData) => {
  const response = await apiClient.post('/users', userData);
  return response;
};

// Update user (admin only)
export const updateUser = async (id: number, userData: UpdateUserData) => {
  const response = await apiClient.put(`/users/${id}`, userData);
  return response;
};

// Reset user password (admin only)
export const resetUserPassword = async (id: number, passwordData: ResetPasswordData) => {
  const response = await apiClient.put(`/users/${id}/password`, passwordData);
  return response;
};

// Change own password (authenticated user)
export const changePassword = async (data: ChangePasswordData) => {
  const response = await apiClient.put('/users/me/password', data);
  return response;
};

// Update own profile (authenticated user)
export const updateProfile = async (data: { name: string; email: string; phone?: string; address?: string }) => {
  const response = await apiClient.put('/users/me', data);
  return response;
};

// Setup 2FA (authenticated user)
export const setupTwoFactor = async () => {
  const response = await apiClient.post('/users/me/2fa/setup', {});
  return response;
};

// Disable 2FA (authenticated user)
export const disableTwoFactor = async () => {
  const response = await apiClient.post('/users/me/2fa/disable', {});
  return response;
};

// Upload profile picture (authenticated user)
// NOTE: token lives inside the Zustand persist blob "auth-storage", NOT a top-level
// "token" key. The original code read localStorage.getItem('token') which was always
// null, so this endpoint was silently broken. Fixed to parse auth-storage.
export const uploadProfilePicture = async (file: File) => {
  const formData = new FormData();
  formData.append('profilePicture', file);

  let token: string | null = null;
  try {
    const storage = localStorage.getItem('auth-storage');
    if (storage) token = JSON.parse(storage).state?.token ?? null;
  } catch { /* ignore */ }

  const response = await fetch(`${BASE_URL}/users/me/profile-picture`, {
    method: 'POST',
    headers: {
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...getActiveOrgHeader(),
    },
    body: formData,
  });

  if (!response.ok) {
    throw new Error('Failed to upload profile picture');
  }

  return response.json();
};

// Delete user (admin only)
export const deleteUser = async (id: number) => {
  const response = await apiClient.delete(`/users/${id}`);
  return response;
};
