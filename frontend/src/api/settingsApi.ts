import { apiClient } from './apiClient';

export const settingsApi = {
  // Get user settings
  getSettings: async () => {
    const response = await apiClient.get('/settings');
    return response.data;
  },

  // Update user settings
  updateSettings: async (settings: any) => {
    const response = await apiClient.put('/settings', { settings });
    return response.data;
  },

  // Change password
  changePassword: async (currentPassword: string, newPassword: string) => {
    const response = await apiClient.post('/settings/change-password', {
      currentPassword,
      newPassword
    });
    return response.data;
  },

  // Setup 2FA
  setup2FA: async () => {
    const response = await apiClient.post('/settings/2fa/setup', {});
    return response.data;
  },

  // Verify and enable 2FA
  verify2FA: async (token: string) => {
    const response = await apiClient.post('/settings/2fa/verify', { token });
    return response.data;
  },

  // Disable 2FA
  disable2FA: async () => {
    const response = await apiClient.delete('/settings/2fa');
    return response.data;
  },

  // Delete account
  deleteAccount: async (_password: string) => {
    const response = await apiClient.delete('/settings/account');
    return response.data;
  },

  // Export user data
  exportData: async () => {
    const response = await apiClient.get('/settings/export');
    return response.data;
  }
};
