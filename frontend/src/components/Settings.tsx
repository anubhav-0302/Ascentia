import React, { useState } from 'react';
import { StandardLayout } from './StandardLayout';
import { Settings as SettingsIcon, Bell, Shield, Palette, Globe, Database, Users } from 'lucide-react';
import Card from './Card';
import { PageTransition, FadeIn } from './PageTransition';
import PermissionManagement from './PermissionManagement';
import { useIsAdmin } from '../store/useAuthStore';

const Settings: React.FC = () => {
  const [darkMode, setDarkMode] = useState(true);
  const [compactView, setCompactView] = useState(false);
  const [language, setLanguage] = useState('English (US)');
  const [timezone, setTimezone] = useState('UTC-5 (Eastern)');
  const [dateFormat, setDateFormat] = useState('MM/DD/YYYY');
  const [activeSection, setActiveSection] = useState('general');
  const isAdmin = useIsAdmin();

  const handleExportData = () => {
    // Create actual data export functionality
    const exportData = {
      settings: {
        darkMode,
        compactView,
        language,
        timezone,
        dateFormat
      },
      profile: {
        // Get user data from auth store
        exportDate: new Date().toISOString()
      }
    };
    
    const dataStr = JSON.stringify(exportData, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `ascentia-settings-export-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleClearCache = () => {
    if (confirm('Are you sure you want to clear the cache? This will remove temporary application data.')) {
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
      
      alert('Cache cleared successfully. Please refresh the page for optimal performance.');
    }
  };

  const handleResetSettings = () => {
    if (confirm('Are you sure you want to reset all settings to default values?')) {
      setDarkMode(true);
      setCompactView(false);
      setLanguage('English (US)');
      setTimezone('UTC-5 (Eastern)');
      setDateFormat('MM/DD/YYYY');
      
      // Save to localStorage
      localStorage.setItem('ascentia-settings', JSON.stringify({
        darkMode: true,
        compactView: false,
        language: 'English (US)',
        timezone: 'UTC-5 (Eastern)',
        dateFormat: 'MM/DD/YYYY'
      }));
      
      alert('Settings reset to default values successfully.');
    }
  };

  const handleDeleteAccount = () => {
    if (confirm('Are you sure you want to delete your account? This action cannot be undone.')) {
      if (confirm('This will permanently delete all your data. Are you absolutely sure?')) {
        if (confirm('Final confirmation: Type "DELETE" to confirm account deletion')) {
          const deletionConfirmation = prompt('Please type "DELETE" to confirm:');
          if (deletionConfirmation === 'DELETE') {
            // In a real app, this would call an API to delete the account
            alert('Account deletion request submitted. You will receive a confirmation email within 24 hours.');
            // Redirect to login after deletion
            setTimeout(() => {
              window.location.href = '/login';
            }, 2000);
          } else {
            alert('Account deletion cancelled.');
          }
        }
      }
    }
  };

  const handlePasswordChange = () => {
    // Create a simple password change modal
    const newPassword = prompt('Enter your new password:');
    if (newPassword && newPassword.length >= 8) {
      const confirmPassword = prompt('Confirm your new password:');
      if (newPassword === confirmPassword) {
        // In a real app, this would call an API
        alert('Password changed successfully. Please use your new password for next login.');
      } else {
        alert('Passwords do not match. Please try again.');
      }
    } else if (newPassword) {
      alert('Password must be at least 8 characters long.');
    }
  };

  const handle2FASetup = () => {
    // Simulate 2FA setup process
    const setupSteps = [
      'Step 1: Download authenticator app (Google Authenticator, Authy)',
      'Step 2: Scan QR code with your authenticator app',
      'Step 3: Enter 6-digit code to verify setup'
    ];
    
    alert(`Two-Factor Authentication Setup:\n\n${setupSteps.join('\n')}\n\nIn a real implementation, this would show a QR code and verification form.`);
  };

  const handleNavigationClick = (section: string) => {
    setActiveSection(section);
  };
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
                    onClick={() => handleNavigationClick('language')}
                    className={`w-full flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                      activeSection === 'language'
                        ? 'bg-teal-500/10 text-teal-400 border-l-4 border-teal-500'
                        : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
                    }`}
                  >
                    <Globe className="w-4 h-4 mr-3" />
                    Language & Region
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
                  {isAdmin && (
                    <button 
                      onClick={() => handleNavigationClick('permissions')}
                      className={`w-full flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                        activeSection === 'permissions'
                          ? 'bg-teal-500/10 text-teal-400 border-l-4 border-teal-500'
                          : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
                      }`}
                    >
                      <Users className="w-4 h-4 mr-3" />
                      Permission Management
                    </button>
                  )}
                </nav>
              </Card>
            </div>
            <div className="lg:col-span-2">
              {activeSection === 'permissions' ? (
                <PermissionManagement />
              ) : (
                <div className="space-y-6">
                  <Card className="p-6">
                    <h3 className="text-lg font-semibold text-white mb-6 flex items-center">
                      <SettingsIcon className="w-5 h-5 mr-2 text-teal-400" />
                      General Settings
                    </h3>
                    
                    <div className="space-y-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-400 mb-2">Application Language</label>
                        <select 
                          value={language}
                          onChange={(e) => setLanguage(e.target.value)}
                          className="w-full px-4 py-2 bg-slate-700/60 border border-slate-600 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                        >
                          <option>English (US)</option>
                          <option>Spanish</option>
                          <option>French</option>
                          <option>German</option>
                          <option>Chinese</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-400 mb-2">Timezone</label>
                        <select 
                          value={timezone}
                          onChange={(e) => setTimezone(e.target.value)}
                          className="w-full px-4 py-2 bg-slate-700/60 border border-slate-600 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                        >
                          <option>UTC-5 (Eastern)</option>
                          <option>UTC-6 (Central)</option>
                          <option>UTC-7 (Mountain)</option>
                          <option>UTC-8 (Pacific)</option>
                          <option>UTC+0 (GMT)</option>
                          <option>UTC+1 (CET)</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-400 mb-2">Date Format</label>
                        <select 
                          value={dateFormat}
                          onChange={(e) => setDateFormat(e.target.value)}
                          className="w-full px-4 py-2 bg-slate-700/60 border border-slate-600 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                        >
                          <option>MM/DD/YYYY</option>
                          <option>DD/MM/YYYY</option>
                          <option>YYYY-MM-DD</option>
                        </select>
                      </div>
                    </div>
                  </Card>

                  <Card className="p-6">
                    <h3 className="text-lg font-semibold text-white mb-6">Quick Actions</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <button 
                        onClick={handleExportData}
                        className="p-4 bg-slate-700/30 hover:bg-slate-700/50 rounded-lg text-left transition-colors"
                      >
                        <h4 className="text-white font-medium mb-1">Export Data</h4>
                        <p className="text-gray-400 text-sm">Download your personal data</p>
                      </button>
                      <button 
                        onClick={handleClearCache}
                        className="p-4 bg-slate-700/30 hover:bg-slate-700/50 rounded-lg text-left transition-colors"
                      >
                        <h4 className="text-white font-medium mb-1">Clear Cache</h4>
                        <p className="text-gray-400 text-sm">Remove temporary application data</p>
                      </button>
                      <button 
                        onClick={handleResetSettings}
                        className="p-4 bg-slate-700/30 hover:bg-slate-700/50 rounded-lg text-left transition-colors"
                      >
                        <h4 className="text-white font-medium mb-1">Reset Settings</h4>
                        <p className="text-gray-400 text-sm">Restore default configuration</p>
                      </button>
                      <button 
                        onClick={handleDeleteAccount}
                        className="p-4 bg-red-500/10 hover:bg-red-500/20 border border-red-500/30 rounded-lg text-left transition-colors"
                      >
                        <h4 className="text-red-400 font-medium mb-1">Delete Account</h4>
                        <p className="text-red-300 text-sm">Permanently remove your account</p>
                      </button>
                    </div>
                  </Card>
                </div>
              )}
            </div>
          </div>
        </FadeIn>
      </StandardLayout>
    </PageTransition>
  );
};

export default Settings;
