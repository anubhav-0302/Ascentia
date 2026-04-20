import React, { useState, useEffect } from 'react';
import { StandardLayout } from './StandardLayout';
import { Settings as SettingsIcon, Bell, Shield, Palette, Database, Moon, Sun, Mail, Smartphone, Calendar, AlertCircle, Eye, BarChart3 } from 'lucide-react';
import { setupTwoFactor, disableTwoFactor } from '../api/userApi';
import { useAuthStore } from '../store/useAuthStore';
import Card from './Card';
import UnifiedDropdown from './UnifiedDropdown';
import Button from './Button';
import Modal from './Modal';
import Input from './Input';
import ToggleSwitch from './ToggleSwitch';
import { PageTransition, FadeIn } from './PageTransition';
import type { UserSettings } from '../store/useSettingsStore';
import { useSettingsStore } from '../store/useSettingsStore';
import toast from 'react-hot-toast';

const Settings: React.FC = () => {
  const [activeSection, setActiveSection] = useState('general');
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [show2FAModal, setShow2FAModal] = useState(false);
  const [twoFactorData, setTwoFactorData] = useState<{ secret: string; qrCode: string } | null>(null);
  const [twoFactorToken, setTwoFactorToken] = useState('');
  const [passwordForm, setPasswordForm] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
  const [deletePassword, setDeletePassword] = useState('');
  const [authLoading, setAuthLoading] = useState(false);
  const [passwordErrors, setPasswordErrors] = useState<{ currentPassword?: string; newPassword?: string; general?: string }>({});
  
  const { settings, loading, fetchSettings, updateSetting, resetSettings, changePassword, verify2FA: storeVerify2FA, deleteAccount, exportData } = useSettingsStore();
  const { user } = useAuthStore();

  // Helper to safely get setting values
  function getSetting<T>(key: keyof UserSettings, defaultValue: T): T {
    return (settings?.[key] as T) ?? defaultValue;
  }

  // Fetch settings on component mount
  useEffect(() => {
    fetchSettings();
  }, [fetchSettings]);

  const handleExportData = async () => {
    try {
      const data = await exportData();
      const dataStr = JSON.stringify(data, null, 2);
      const dataBlob = new Blob([dataStr], { type: 'application/json' });
      const url = URL.createObjectURL(dataBlob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `ascentia-data-export-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      toast.success('Data exported successfully');
    } catch (error) {
      toast.error('Failed to export data');
    }
  };

  const handleClearCache = () => {
    // Clear localStorage and sessionStorage
    localStorage.clear();
    sessionStorage.clear();
    
    // Clear any application caches
    if ('caches' in window) {
      caches.keys().then(names => {
        names.forEach(name => {
          caches.delete(name);
        });
      });
    }
    
    toast.success('Cache cleared successfully. Please refresh the page for optimal performance.');
  };

  const handleResetSettings = async () => {
    try {
      await resetSettings();
      toast.success('Settings reset to default values successfully');
    } catch (error) {
      toast.error('Failed to reset settings');
    }
  };

  const handleDeleteAccount = () => {
    setShowDeleteModal(true);
  };
  
  const handleConfirmDeleteAccount = async () => {
    try {
      await deleteAccount(deletePassword);
      toast.success('Account deleted successfully');
      setShowDeleteModal(false);
      // Redirect to login after deletion
      setTimeout(() => {
        window.location.href = '/login';
      }, 2000);
    } catch (error) {
      toast.error('Failed to delete account');
    }
  };

  const handlePasswordChange = () => {
    setShowPasswordModal(true);
  };
  
  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Clear previous errors
    setPasswordErrors({});
    
    // Validate new password length
    if (passwordForm.newPassword.length < 6) {
      setPasswordErrors({ newPassword: 'Password must be at least 6 characters long' });
      return;
    }
    
    // Validate passwords match
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setPasswordErrors({ newPassword: 'New passwords do not match' });
      return;
    }
    
    setAuthLoading(true);
    try {
      await changePassword(passwordForm.currentPassword, passwordForm.newPassword);
      toast.success('Password changed successfully');
      setShowPasswordModal(false);
      setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
      setPasswordErrors({});
    } catch (error: any) {
      // Set specific error based on the message
      if (error.message === 'Current password is incorrect') {
        setPasswordErrors({ currentPassword: error.message });
      } else {
        setPasswordErrors({ general: error.message || 'Failed to change password' });
      }
    } finally {
      setAuthLoading(false);
    }
  };

  const handle2FASetup = async () => {
    if (user?.twoFactorEnabled) {
      // Disable 2FA
      setAuthLoading(true);
      try {
        await disableTwoFactor();
        toast.success('2FA disabled successfully');
        // Update user state
        const updatedUser = { ...user, twoFactorEnabled: false };
        useAuthStore.setState({ user: updatedUser });
      } catch (error: any) {
        toast.error(error.message || 'Failed to disable 2FA');
      } finally {
        setAuthLoading(false);
      }
    } else {
      // Enable 2FA
      setAuthLoading(true);
      try {
        const response = await setupTwoFactor();
        setTwoFactorData(response);
        setShow2FAModal(true);
      } catch (error: any) {
        toast.error(error.message || 'Failed to setup 2FA');
      } finally {
        setAuthLoading(false);
      }
    }
  };
  
  const handle2FAVerify = async () => {
    try {
      await storeVerify2FA(twoFactorToken);
      toast.success('2FA enabled successfully');
      setShow2FAModal(false);
      setTwoFactorToken('');
      setTwoFactorData(null);
      // Update user state
      if (user) {
        const updatedUser = { ...user, twoFactorEnabled: true };
        useAuthStore.setState({ user: updatedUser });
      }
    } catch (error) {
      toast.error('Invalid verification code');
    }
  };

  const handleNavigationClick = (section: string) => {
    setActiveSection(section);
  };
  if (loading && !settings) {
    return (
      <StandardLayout 
        title="Settings"
        description="Manage your application preferences and configuration"
      >
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-500"></div>
        </div>
      </StandardLayout>
    );
  }

  return (
    <PageTransition>
      <StandardLayout 
        title="Settings"
        description="Manage your application preferences and configuration"
      >
        <FadeIn delay={100}>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Settings Navigation */}
            <div className="lg:col-span-1">
              <Card className="p-4">
                <nav className="space-y-1">
                  <button 
                    onClick={() => handleNavigationClick('general')}
                    className={`w-full flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                      activeSection === 'general'
                        ? 'bg-teal-500/10 text-teal-400 border-l-4 border-teal-500'
                        : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
                    }`}
                  >
                    <SettingsIcon className="w-4 h-4 mr-3" />
                    General
                  </button>
                  <button 
                    onClick={() => handleNavigationClick('notifications')}
                    className={`w-full flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                      activeSection === 'notifications'
                        ? 'bg-teal-500/10 text-teal-400 border-l-4 border-teal-500'
                        : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
                    }`}
                  >
                    <Bell className="w-4 h-4 mr-3" />
                    Notifications
                  </button>
                  <button 
                    onClick={() => handleNavigationClick('security')}
                    className={`w-full flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                      activeSection === 'security'
                        ? 'bg-teal-500/10 text-teal-400 border-l-4 border-teal-500'
                        : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
                    }`}
                  >
                    <Shield className="w-4 h-4 mr-3" />
                    Security
                  </button>
                  <button 
                    onClick={() => handleNavigationClick('appearance')}
                    className={`w-full flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                      activeSection === 'appearance'
                        ? 'bg-teal-500/10 text-teal-400 border-l-4 border-teal-500'
                        : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
                    }`}
                  >
                    <Palette className="w-4 h-4 mr-3" />
                    Appearance
                  </button>
                                    <button 
                    onClick={() => handleNavigationClick('privacy')}
                    className={`w-full flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                      activeSection === 'privacy'
                        ? 'bg-teal-500/10 text-teal-400 border-l-4 border-teal-500'
                        : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
                    }`}
                  >
                    <Database className="w-4 h-4 mr-3" />
                    Data & Privacy
                  </button>
                                  </nav>
              </Card>
            </div>
            <div className="lg:col-span-2">
              <div className="space-y-6">
                {/* General Settings Section */}
                {activeSection === 'general' && (
                  <FadeIn>
                    <Card className="p-6">
                      <h3 className="text-lg font-semibold text-white mb-6 flex items-center">
                        <SettingsIcon className="w-5 h-5 mr-2 text-teal-400" />
                        General Settings
                      </h3>
                      
                      <div className="space-y-6">
                        <div>
                          <label className="block text-sm font-medium text-gray-400 mb-2">Application Language</label>
                          <UnifiedDropdown
                            value={getSetting('language', 'English (US)')}
                            onChange={(value) => updateSetting('language', value as string)}
                            options={[
                              { value: 'English (US)', label: 'English (US)' },
                              { value: 'Spanish', label: 'Spanish' },
                              { value: 'French', label: 'French' },
                              { value: 'German', label: 'German' },
                              { value: 'Chinese', label: 'Chinese' }
                            ]}
                            showLabel={false}
                            size="md"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-400 mb-2">Timezone</label>
                          <UnifiedDropdown
                            value={getSetting('timezone', 'UTC-5 (Eastern)')}
                            onChange={(value) => updateSetting('timezone', value as string)}
                            options={[
                              { value: 'UTC-12 (Baker Island)', label: 'UTC-12 (Baker Island)' },
                              { value: 'UTC-11 (Samoa)', label: 'UTC-11 (Samoa)' },
                              { value: 'UTC-10 (Hawaii)', label: 'UTC-10 (Hawaii)' },
                              { value: 'UTC-9 (Alaska)', label: 'UTC-9 (Alaska)' },
                              { value: 'UTC-8 (Pacific)', label: 'UTC-8 (Pacific)' },
                              { value: 'UTC-7 (Mountain)', label: 'UTC-7 (Mountain)' },
                              { value: 'UTC-6 (Central)', label: 'UTC-6 (Central)' },
                              { value: 'UTC-5 (Eastern)', label: 'UTC-5 (Eastern)' },
                              { value: 'UTC-4 (Atlantic)', label: 'UTC-4 (Atlantic)' },
                              { value: 'UTC-3 (Brazil)', label: 'UTC-3 (Brazil)' },
                              { value: 'UTC-2 (Mid-Atlantic)', label: 'UTC-2 (Mid-Atlantic)' },
                              { value: 'UTC-1 (Azores)', label: 'UTC-1 (Azores)' },
                              { value: 'UTC+0 (GMT)', label: 'UTC+0 (GMT)' },
                              { value: 'UTC+1 (CET)', label: 'UTC+1 (CET)' },
                              { value: 'UTC+2 (EET)', label: 'UTC+2 (EET)' },
                              { value: 'UTC+3 (MSK)', label: 'UTC+3 (Moscow)' },
                              { value: 'UTC+4 (Dubai)', label: 'UTC+4 (Dubai)' },
                              { value: 'UTC+5 (Pakistan)', label: 'UTC+5 (Pakistan)' },
                              { value: 'UTC+5:30 (India)', label: 'UTC+5:30 (India - IST)' },
                              { value: 'UTC+6 (Bangladesh)', label: 'UTC+6 (Bangladesh)' },
                              { value: 'UTC+7 (Bangkok)', label: 'UTC+7 (Bangkok)' },
                              { value: 'UTC+8 (Singapore)', label: 'UTC+8 (Singapore)' },
                              { value: 'UTC+9 (Tokyo)', label: 'UTC+9 (Tokyo)' },
                              { value: 'UTC+10 (Sydney)', label: 'UTC+10 (Sydney)' },
                              { value: 'UTC+11 (Solomon Islands)', label: 'UTC+11 (Solomon Islands)' },
                              { value: 'UTC+12 (Fiji)', label: 'UTC+12 (Fiji)' }
                            ]}
                            showLabel={false}
                            size="md"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-400 mb-2">Date Format</label>
                          <UnifiedDropdown
                            value={getSetting('dateFormat', 'MM/DD/YYYY')}
                            onChange={(value) => updateSetting('dateFormat', value as string)}
                            options={[
                              { value: 'MM/DD/YYYY', label: 'MM/DD/YYYY' },
                              { value: 'DD/MM/YYYY', label: 'DD/MM/YYYY' },
                              { value: 'YYYY-MM-DD', label: 'YYYY-MM-DD' }
                            ]}
                            showLabel={false}
                            size="md"
                          />
                        </div>
                      </div>
                    </Card>
                  </FadeIn>
                )}

                {/* Notifications Section */}
                {activeSection === 'notifications' && (
                  <FadeIn>
                    <Card className="p-6">
                      <h3 className="text-lg font-semibold text-white mb-6 flex items-center">
                        <Bell className="w-5 h-5 mr-2 text-teal-400" />
                        Notification Preferences
                      </h3>
                      
                      <div className="space-y-4">
                        <div className="flex items-center justify-between py-3 border-b border-slate-700">
                          <div className="flex items-center">
                            <Mail className="w-5 h-5 text-gray-400 mr-3" />
                            <div>
                              <p className="text-white font-medium">Email Notifications</p>
                              <p className="text-gray-400 text-sm">Receive notifications via email</p>
                            </div>
                          </div>
                          <ToggleSwitch
                            checked={getSetting('emailNotifications', true)}
                            onChange={(checked) => updateSetting('emailNotifications', checked)}
                          />
                        </div>

                        <div className="flex items-center justify-between py-3 border-b border-slate-700">
                          <div className="flex items-center">
                            <Smartphone className="w-5 h-5 text-gray-400 mr-3" />
                            <div>
                              <p className="text-white font-medium">Push Notifications</p>
                              <p className="text-gray-400 text-sm">Receive push notifications in browser</p>
                            </div>
                          </div>
                          <ToggleSwitch
                            checked={getSetting('pushNotifications', true)}
                            onChange={(checked) => updateSetting('pushNotifications', checked)}
                          />
                        </div>

                        <div className="flex items-center justify-between py-3 border-b border-slate-700">
                          <div className="flex items-center">
                            <Calendar className="w-5 h-5 text-gray-400 mr-3" />
                            <div>
                              <p className="text-white font-medium">Weekly Digest</p>
                              <p className="text-gray-400 text-sm">Receive weekly summary of activities</p>
                            </div>
                          </div>
                          <ToggleSwitch
                            checked={getSetting('weeklyDigest', false)}
                            onChange={(checked) => updateSetting('weeklyDigest', checked)}
                          />
                        </div>

                        <div className="flex items-center justify-between py-3 border-b border-slate-700">
                          <div className="flex items-center">
                            <AlertCircle className="w-5 h-5 text-gray-400 mr-3" />
                            <div>
                              <p className="text-white font-medium">System Alerts</p>
                              <p className="text-gray-400 text-sm">Important system notifications</p>
                            </div>
                          </div>
                          <ToggleSwitch
                            checked={getSetting('systemAlerts', true)}
                            onChange={(checked) => updateSetting('systemAlerts', checked)}
                          />
                        </div>

                        <div className="flex items-center justify-between py-3">
                          <div className="flex items-center">
                            <Calendar className="w-5 h-5 text-gray-400 mr-3" />
                            <div>
                              <p className="text-white font-medium">Project Updates</p>
                              <p className="text-gray-400 text-sm">Notifications about project changes</p>
                            </div>
                          </div>
                          <ToggleSwitch
                            checked={getSetting('projectUpdates', true)}
                            onChange={(checked) => updateSetting('projectUpdates', checked)}
                          />
                        </div>
                      </div>
                    </Card>
                  </FadeIn>
                )}

                {/* Security Section */}
                {activeSection === 'security' && (
                  <FadeIn>
                    <Card className="p-6">
                      <h3 className="text-lg font-semibold text-white mb-6 flex items-center">
                        <Shield className="w-5 h-5 mr-2 text-teal-400" />
                        Security Settings
                      </h3>
                      
                      <div className="space-y-6">
                        <div>
                          <h4 className="text-white font-medium mb-4">Password</h4>
                          <Button onClick={handlePasswordChange} variant="secondary">
                            Change Password
                          </Button>
                        </div>

                        <div className="border-t border-slate-700 pt-6">
                          <h4 className="text-white font-medium mb-4">Two-Factor Authentication</h4>
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="text-gray-300">
                                {user?.twoFactorEnabled ? 'Enabled - Extra security active' : 'Add an extra layer of security to your account'}
                              </p>
                            </div>
                            <Button 
                              onClick={handle2FASetup}
                              disabled={authLoading}
                              className={`${
                                user?.twoFactorEnabled 
                                  ? 'bg-red-600 hover:bg-red-500 text-white' 
                                  : 'bg-teal-600 hover:bg-teal-500 text-white'
                              } ${authLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
                            >
                              {authLoading ? 'Processing...' : (user?.twoFactorEnabled ? 'Disable' : 'Enable')}
                            </Button>
                          </div>
                        </div>
                      </div>
                    </Card>
                  </FadeIn>
                )}

                {/* Appearance Section */}
                {activeSection === 'appearance' && (
                  <FadeIn>
                    <Card className="p-6">
                      <h3 className="text-lg font-semibold text-white mb-6 flex items-center">
                        <Palette className="w-5 h-5 mr-2 text-teal-400" />
                        Appearance Settings
                      </h3>
                      
                      <div className="space-y-6">
                        <div className="flex items-center justify-between py-3 border-b border-slate-700">
                          <div className="flex items-center">
                            {getSetting('darkMode', true) ? <Moon className="w-5 h-5 text-gray-400 mr-3" /> : <Sun className="w-5 h-5 text-gray-400 mr-3" />}
                            <div>
                              <p className="text-white font-medium">Dark Mode</p>
                              <p className="text-gray-400 text-sm">Toggle dark/light theme</p>
                            </div>
                          </div>
                          <ToggleSwitch
                            checked={getSetting('darkMode', true)}
                            onChange={(checked) => updateSetting('darkMode', checked)}
                          />
                        </div>

                        <div className="flex items-center justify-between py-3">
                          <div className="flex items-center">
                            <BarChart3 className="w-5 h-5 text-gray-400 mr-3" />
                            <div>
                              <p className="text-white font-medium">Compact View</p>
                              <p className="text-gray-400 text-sm">Use more compact layout</p>
                            </div>
                          </div>
                          <ToggleSwitch
                            checked={getSetting('compactView', false)}
                            onChange={(checked) => updateSetting('compactView', checked)}
                          />
                        </div>
                      </div>
                    </Card>
                  </FadeIn>
                )}

                {/* Data & Privacy Section */}
                {activeSection === 'privacy' && (
                  <FadeIn>
                    <Card className="p-6">
                      <h3 className="text-lg font-semibold text-white mb-6 flex items-center">
                        <Database className="w-5 h-5 mr-2 text-teal-400" />
                        Data & Privacy
                      </h3>
                      
                      <div className="space-y-6">
                        <div className="space-y-4">
                          <div className="flex items-center justify-between py-3 border-b border-slate-700">
                            <div className="flex items-center">
                              <Eye className="w-5 h-5 text-gray-400 mr-3" />
                              <div>
                                <p className="text-white font-medium">Profile Visibility</p>
                                <p className="text-gray-400 text-sm">Control who can see your profile</p>
                              </div>
                            </div>
                            <UnifiedDropdown
                              value={getSetting('profileVisibility', 'public')}
                              onChange={(value) => updateSetting('profileVisibility', value as 'public' | 'private' | 'team')}
                              options={[
                                { value: 'public', label: 'Public' },
                                { value: 'team', label: 'Team Only' },
                                { value: 'private', label: 'Private' }
                              ]}
                              showLabel={false}
                              size="sm"
                            />
                          </div>

                          <div className="flex items-center justify-between py-3 border-b border-slate-700">
                            <div className="flex items-center">
                              <BarChart3 className="w-5 h-5 text-gray-400 mr-3" />
                              <div>
                                <p className="text-white font-medium">Share Analytics</p>
                                <p className="text-gray-400 text-sm">Help improve the product with usage data</p>
                              </div>
                            </div>
                            <ToggleSwitch
                              checked={getSetting('shareAnalytics', true)}
                              onChange={(checked) => updateSetting('shareAnalytics', checked)}
                            />
                          </div>

                          <div className="flex items-center justify-between py-3">
                            <div className="flex items-center">
                              <Mail className="w-5 h-5 text-gray-400 mr-3" />
                              <div>
                                <p className="text-white font-medium">Marketing Emails</p>
                                <p className="text-gray-400 text-sm">Receive product updates and newsletters</p>
                              </div>
                            </div>
                            <ToggleSwitch
                              checked={getSetting('marketingEmails', false)}
                              onChange={(checked) => updateSetting('marketingEmails', checked)}
                            />
                          </div>
                        </div>

                        <div className="border-t border-slate-700 pt-6">
                          <h4 className="text-white font-medium mb-4">Data Management</h4>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <Button onClick={handleExportData} variant="secondary">
                              Export Data
                            </Button>
                            <Button onClick={handleClearCache} variant="secondary">
                              Clear Cache
                            </Button>
                            <Button onClick={handleResetSettings} variant="secondary">
                              Reset Settings
                            </Button>
                            <Button onClick={handleDeleteAccount} variant="danger">
                              Delete Account
                            </Button>
                          </div>
                        </div>
                      </div>
                    </Card>
                  </FadeIn>
                )}

              </div>
            </div>
          </div>
        </FadeIn>
      </StandardLayout>

      {/* Password Change Modal */}
      {showPasswordModal && (
        <Modal isOpen={showPasswordModal} onClose={() => {
          setShowPasswordModal(false);
          setPasswordErrors({});
        }}>
          <h3 className="text-lg font-semibold text-white mb-4">Change Password</h3>
          <form onSubmit={handlePasswordSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Current Password
              </label>
              <Input
                type="password"
                value={passwordForm.currentPassword}
                onChange={(e) => {
                  setPasswordForm(prev => ({ ...prev, currentPassword: e.target.value }));
                  // Clear error when user starts typing
                  if (passwordErrors.currentPassword) {
                    setPasswordErrors(prev => ({ ...prev, currentPassword: undefined }));
                  }
                }}
                placeholder="Enter current password"
                required
                className={passwordErrors.currentPassword ? 'border-red-500' : ''}
              />
              {passwordErrors.currentPassword && (
                <p className="mt-1 text-sm text-red-400">{passwordErrors.currentPassword}</p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                New Password
              </label>
              <Input
                type="password"
                value={passwordForm.newPassword}
                onChange={(e) => {
                  setPasswordForm(prev => ({ ...prev, newPassword: e.target.value }));
                  // Clear error when user starts typing
                  if (passwordErrors.newPassword) {
                    setPasswordErrors(prev => ({ ...prev, newPassword: undefined }));
                  }
                }}
                placeholder="Enter new password (min 6 characters)"
                required
                className={passwordErrors.newPassword ? 'border-red-500' : ''}
              />
              {passwordErrors.newPassword && (
                <p className="mt-1 text-sm text-red-400">{passwordErrors.newPassword}</p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Confirm New Password
              </label>
              <Input
                type="password"
                value={passwordForm.confirmPassword}
                onChange={(e) => {
                  setPasswordForm(prev => ({ ...prev, confirmPassword: e.target.value }));
                  // Clear error when user starts typing
                  if (passwordErrors.newPassword) {
                    setPasswordErrors(prev => ({ ...prev, newPassword: undefined }));
                  }
                }}
                placeholder="Confirm new password"
                required
                className={passwordErrors.newPassword ? 'border-red-500' : ''}
              />
            </div>
            {passwordErrors.general && (
              <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-3">
                <p className="text-red-300 text-sm">{passwordErrors.general}</p>
              </div>
            )}
            <div className="flex justify-end space-x-3 pt-4">
              <Button
                type="button"
                variant="secondary"
                onClick={() => {
                  setShowPasswordModal(false);
                  setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
                }}
              >
                Cancel
              </Button>
              <Button type="submit">
                Change Password
              </Button>
            </div>
          </form>
        </Modal>
      )}

      {/* Delete Account Modal */}
      {showDeleteModal && (
        <Modal isOpen={showDeleteModal} onClose={() => setShowDeleteModal(false)}>
          <h3 className="text-lg font-semibold text-white mb-4 text-red-400">Delete Account</h3>
          <div className="space-y-4">
            <p className="text-gray-300">
              Are you sure you want to delete your account? This action cannot be undone and will permanently remove all your data.
            </p>
            <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4">
              <p className="text-red-300 text-sm">
                <strong>Warning:</strong> This will permanently delete:
              </p>
              <ul className="text-red-300 text-sm mt-2 list-disc list-inside">
                <li>Your profile information</li>
                <li>All your settings and preferences</li>
                <li>Your activity history</li>
                <li>Any associated data</li>
              </ul>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Enter your password to confirm
              </label>
              <Input
                type="password"
                value={deletePassword}
                onChange={(e) => setDeletePassword(e.target.value)}
                placeholder="Enter your password"
                required
              />
            </div>
            <div className="flex justify-end space-x-3 pt-4">
              <Button
                variant="secondary"
                onClick={() => {
                  setShowDeleteModal(false);
                  setDeletePassword('');
                }}
              >
                Cancel
              </Button>
              <Button
                variant="danger"
                onClick={handleConfirmDeleteAccount}
                disabled={!deletePassword}
              >
                Delete Account
              </Button>
            </div>
          </div>
        </Modal>
      )}

      {/* 2FA Setup Modal */}
      {show2FAModal && twoFactorData && (
        <Modal isOpen={show2FAModal} onClose={() => setShow2FAModal(false)}>
          <h3 className="text-lg font-semibold text-white mb-4">Setup Two-Factor Authentication</h3>
          <div className="space-y-4">
            <div>
              <p className="text-gray-300 mb-4">Scan the QR code below with your authenticator app:</p>
              <div className="flex justify-center mb-4">
                <img src={twoFactorData.qrCode} alt="2FA QR Code" className="w-48 h-48" />
              </div>
            </div>
            
            <div>
              <p className="text-gray-300 text-sm mb-2">Or enter this code manually:</p>
              <code className="block p-2 bg-slate-700 rounded text-teal-400 text-sm">
                {twoFactorData.secret}
              </code>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Enter 6-digit verification code
              </label>
              <Input
                type="text"
                value={twoFactorToken}
                onChange={(e) => setTwoFactorToken(e.target.value)}
                placeholder="000000"
                maxLength={6}
                pattern="[0-9]{6}"
              />
            </div>
            
            <div className="flex justify-end space-x-3 pt-4">
              <Button
                variant="secondary"
                onClick={() => {
                  setShow2FAModal(false);
                  setTwoFactorToken('');
                  setTwoFactorData(null);
                }}
              >
                Cancel
              </Button>
              <Button
                onClick={handle2FAVerify}
                disabled={twoFactorToken.length !== 6}
              >
                Verify & Enable
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </PageTransition>
  );
};

export default Settings;
