import React, { useState, useEffect } from 'react';
import { StandardLayout } from './StandardLayout';
import { Settings as SettingsIcon, Bell, Shield, Palette, Database, Moon, Sun, Mail, Smartphone, Calendar, AlertCircle, Eye, BarChart3 } from 'lucide-react';
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
  
  const { settings, loading, fetchSettings, updateSetting, resetSettings, changePassword, setup2FA, verify2FA, deleteAccount, exportData } = useSettingsStore();

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
    
    if (passwordForm.newPassword.length < 8) {
      toast.error('Password must be at least 8 characters long');
      return;
    }
    
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }
    
    try {
      await changePassword(passwordForm.currentPassword, passwordForm.newPassword);
      toast.success('Password changed successfully');
      setShowPasswordModal(false);
      setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (error) {
      toast.error('Failed to change password');
    }
  };

  const handle2FASetup = async () => {
    try {
      const data = await setup2FA();
      setTwoFactorData(data);
      setShow2FAModal(true);
    } catch (error) {
      toast.error('Failed to setup 2FA');
    }
  };
  
  const handle2FAVerify = async () => {
    try {
      await verify2FA(twoFactorToken);
      toast.success('2FA enabled successfully');
      setShow2FAModal(false);
      setTwoFactorToken('');
      setTwoFactorData(null);
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
                              { value: 'UTC-5 (Eastern)', label: 'UTC-5 (Eastern)' },
                              { value: 'UTC-6 (Central)', label: 'UTC-6 (Central)' },
                              { value: 'UTC-7 (Mountain)', label: 'UTC-7 (Mountain)' },
                              { value: 'UTC-8 (Pacific)', label: 'UTC-8 (Pacific)' },
                              { value: 'UTC+0 (GMT)', label: 'UTC+0 (GMT)' },
                              { value: 'UTC+1 (CET)', label: 'UTC+1 (CET)' }
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
                              <p className="text-gray-300">Add an extra layer of security to your account</p>
                            </div>
                            <Button onClick={handle2FASetup} variant="secondary">
                              Enable 2FA
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
        <Modal isOpen={showPasswordModal} onClose={() => setShowPasswordModal(false)}>
          <h3 className="text-lg font-semibold text-white mb-4">Change Password</h3>
          <form onSubmit={handlePasswordSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Current Password
              </label>
              <Input
                type="password"
                value={passwordForm.currentPassword}
                onChange={(e) => setPasswordForm(prev => ({ ...prev, currentPassword: e.target.value }))}
                placeholder="Enter current password"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                New Password
              </label>
              <Input
                type="password"
                value={passwordForm.newPassword}
                onChange={(e) => setPasswordForm(prev => ({ ...prev, newPassword: e.target.value }))}
                placeholder="Enter new password (min 8 characters)"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Confirm New Password
              </label>
              <Input
                type="password"
                value={passwordForm.confirmPassword}
                onChange={(e) => setPasswordForm(prev => ({ ...prev, confirmPassword: e.target.value }))}
                placeholder="Confirm new password"
                required
              />
            </div>
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
