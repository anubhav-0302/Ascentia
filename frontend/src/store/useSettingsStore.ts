import { create } from 'zustand';
import { settingsApi } from '../api/settingsApi';
import toast from 'react-hot-toast';

export interface UserSettings {
  // General Settings
  language: string;
  timezone: string;
  dateFormat: string;
  
  // Appearance Settings
  darkMode: boolean;
  compactView: boolean;
  
  // Notification Settings
  emailNotifications: boolean;
  pushNotifications: boolean;
  weeklyDigest: boolean;
  projectUpdates: boolean;
  systemAlerts: boolean;
  
  // Privacy Settings
  profileVisibility: 'public' | 'private' | 'team';
  shareAnalytics: boolean;
  marketingEmails: boolean;
}

interface SettingsStore {
  settings: UserSettings;
  loading: boolean;
  error: string | null;
  fetchSettings: () => Promise<void>;
  updateSetting: <K extends keyof UserSettings>(key: K, value: UserSettings[K]) => Promise<void>;
  updateMultipleSettings: (updates: Partial<UserSettings>) => Promise<void>;
  resetSettings: () => Promise<void>;
  changePassword: (currentPassword: string, newPassword: string) => Promise<void>;
  setup2FA: () => Promise<{ secret: string; qrCode: string }>;
  verify2FA: (token: string) => Promise<void>;
  disable2FA: () => Promise<void>;
  deleteAccount: (password: string) => Promise<void>;
  exportData: () => Promise<any>;
}

const defaultSettings: UserSettings = {
  // General Settings
  language: 'English (US)',
  timezone: 'UTC-5 (Eastern)',
  dateFormat: 'MM/DD/YYYY',
  
  // Appearance Settings
  darkMode: true,
  compactView: false,
  
  // Notification Settings
  emailNotifications: true,
  pushNotifications: true,
  weeklyDigest: false,
  projectUpdates: true,
  systemAlerts: true,
  
  // Privacy Settings
  profileVisibility: 'public',
  shareAnalytics: true,
  marketingEmails: false,
};

export const useSettingsStore = create<SettingsStore>((set, get) => ({
  settings: defaultSettings,
  loading: false,
  error: null,
  
  fetchSettings: async () => {
    try {
      set({ loading: true, error: null });
      const response = await settingsApi.getSettings();
      set({ settings: response.data, loading: false });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      set({ error: errorMessage, loading: false });
      toast.error('Failed to load settings');
    }
  },
  
  updateSetting: async (key, value) => {
    const previousSettings = get().settings;
    const newSettings = { ...previousSettings, [key]: value };
    
    // Optimistic update
    set({ settings: newSettings, error: null });
    
    try {
      await settingsApi.updateSettings(newSettings);
    } catch (error) {
      // Revert on error
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      set({ settings: previousSettings, error: errorMessage });
      toast.error(`Failed to update ${key}: ${errorMessage}`);
    }
  },
  
  updateMultipleSettings: async (updates) => {
    const previousSettings = get().settings;
    const newSettings = { ...previousSettings, ...updates };
    
    // Optimistic update
    set({ settings: newSettings, error: null });
    
    try {
      await settingsApi.updateSettings(newSettings);
    } catch (error) {
      // Revert on error
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      set({ settings: previousSettings, error: errorMessage });
      toast.error(`Failed to update settings: ${errorMessage}`);
    }
  },
  
  resetSettings: async () => {
    const previousSettings = get().settings;
    
    // Optimistic update
    set({ settings: defaultSettings, error: null });
    
    try {
      await settingsApi.updateSettings(defaultSettings);
    } catch (error) {
      // Revert on error
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      set({ settings: previousSettings, error: errorMessage });
      toast.error(`Failed to reset settings: ${errorMessage}`);
    }
  },
  
  changePassword: async (currentPassword, newPassword) => {
    try {
      set({ error: null });
      await settingsApi.changePassword(currentPassword, newPassword);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      set({ error: errorMessage });
      throw error;
    }
  },
  
  setup2FA: async () => {
    try {
      set({ error: null });
      const response = await settingsApi.setup2FA();
      return response.data;
    } catch (error) {
      set({ error: error instanceof Error ? error.message : 'An error occurred' });
      throw error;
    }
  },
  
  verify2FA: async (token) => {
    try {
      set({ error: null });
      await settingsApi.verify2FA(token);
    } catch (error) {
      set({ error: error instanceof Error ? error.message : 'An error occurred' });
      throw error;
    }
  },
  
  disable2FA: async () => {
    try {
      set({ error: null });
      await settingsApi.disable2FA();
    } catch (error) {
      set({ error: error instanceof Error ? error.message : 'An error occurred' });
      throw error;
    }
  },
  
  deleteAccount: async (password) => {
    try {
      set({ error: null });
      await settingsApi.deleteAccount(password);
    } catch (error) {
      set({ error: error instanceof Error ? error.message : 'An error occurred' });
      throw error;
    }
  },
  
  exportData: async () => {
    try {
      set({ error: null });
      const response = await settingsApi.exportData();
      return response.data;
    } catch (error) {
      set({ error: error instanceof Error ? error.message : 'An error occurred' });
      throw error;
    }
  },
}));
