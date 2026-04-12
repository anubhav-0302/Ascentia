import { apiClient } from './apiClient';

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

// Delete user (admin only)
export const deleteUser = async (id: number) => {
  const response = await apiClient.delete(`/users/${id}`);
  return response;
};
