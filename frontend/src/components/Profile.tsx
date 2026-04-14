import React, { useState, useRef } from 'react';
import { StandardLayout } from './StandardLayout';
import { User, Mail, Shield, Calendar, LogOut, Edit2, X, Camera, Upload } from 'lucide-react';
import Card from './Card';
import Input from './Input';
import Button from './Button';
import Modal from './Modal';
import { PageTransition, FadeIn } from './PageTransition';
import { useAuthStore } from '../store/useAuthStore';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { changePassword, uploadProfilePicture, updateProfile, setupTwoFactor, disableTwoFactor } from '../api/userApi';

const Profile: React.FC = () => {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();
  
  // Refs
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // Modal states
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [showProfileEditModal, setShowProfileEditModal] = useState(false);
  const [show2FAModal, setShow2FAModal] = useState(false);
  
  // Form states
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [profileForm, setProfileForm] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: user?.phone || '',
    address: user?.address || ''
  });
  const [loading, setLoading] = useState(false);
  const [uploadingPicture, setUploadingPicture] = useState(false);
  const [twoFactorSetupData, setTwoFactorSetupData] = useState<any>(null);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      toast.error('New passwords do not match');
      return;
    }
    
    if (passwordForm.newPassword.length < 6) {
      toast.error('Password must be at least 6 characters long');
      return;
    }
    
    if (!passwordForm.currentPassword) {
      toast.error('Current password is required');
      return;
    }
    
    setLoading(true);
    try {
      await changePassword({
        currentPassword: passwordForm.currentPassword,
        newPassword: passwordForm.newPassword
      });
      toast.success('Password changed successfully');
      setShowPasswordModal(false);
      setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (error: any) {
      console.error('Password change error:', error);
      const errorMessage = error.response?.data?.message || error.message || 'Failed to change password';
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleProfileEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!profileForm.name || !profileForm.email) {
      toast.error('Name and email are required');
      return;
    }
    
    setLoading(true);
    try {
      const response = await updateProfile({
        name: profileForm.name,
        email: profileForm.email,
        phone: profileForm.phone,
        address: profileForm.address
      });
      
      toast.success('Profile updated successfully');
      setShowProfileEditModal(false);
      
      // Update user state with new profile data
      if (user) {
        user.name = response.data.name;
        user.email = response.data.email;
        user.phone = response.data.phone;
        user.address = response.data.address;
      }
    } catch (error: any) {
      console.error('Profile update error:', error);
      const errorMessage = error.response?.data?.message || error.message || 'Failed to update profile';
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handle2FASetup = async () => {
    if (user?.twoFactorEnabled) {
      // Disable 2FA
      try {
        await disableTwoFactor();
        toast.success('Two-factor authentication disabled');
        if (user) {
          user.twoFactorEnabled = false;
        }
        setShow2FAModal(false);
      } catch (error: any) {
        console.error('2FA disable error:', error);
        const errorMessage = error.response?.data?.message || error.message || 'Failed to disable 2FA';
        toast.error(errorMessage);
      }
    } else {
      // Setup 2FA
      try {
        const response = await setupTwoFactor();
        setTwoFactorSetupData(response.data);
        setShow2FAModal(true);
      } catch (error: any) {
        console.error('2FA setup error:', error);
        const errorMessage = error.response?.data?.message || error.message || 'Failed to setup 2FA';
        toast.error(errorMessage);
      }
    }
  };

  const handleProfilePictureUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      toast.error('Only image files are allowed (JPEG, JPG, PNG, GIF, WebP)');
      return;
    }

    // Validate file size (5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('File size must be less than 5MB');
      return;
    }

    setUploadingPicture(true);
    try {
      const response = await uploadProfilePicture(file);
      toast.success('Profile picture uploaded successfully');
      // Update user state with new profile picture
      if (user) {
        user.profilePicture = response.data.profilePicture;
      }
    } catch (error: any) {
      console.error('Profile picture upload error:', error);
      const errorMessage = error.response?.data?.message || error.message || 'Failed to upload profile picture';
      toast.error(errorMessage);
    } finally {
      setUploadingPicture(false);
      // Clear the file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleProfilePictureClick = () => {
    fileInputRef.current?.click();
  };

  if (!user) {
    return (
      <PageTransition>
        <StandardLayout 
          title="Profile"
          description="View and manage your personal information"
        >
          <div className="text-center py-12">
            <p className="text-gray-400">Loading user information...</p>
          </div>
        </StandardLayout>
      </PageTransition>
    );
  }

  return (
    <PageTransition>
      <StandardLayout 
        title="My Profile"
        description="View and manage your personal information"
      >
        <FadeIn delay={100}>
          <div className="space-y-6">
            {/* Header Section */}
            <Card className="bg-slate-800/60 rounded-2xl p-6 shadow-lg">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-6">
                  <div className="relative">
                    <div className="w-20 h-20 bg-teal-500/20 rounded-full flex items-center justify-center relative group overflow-hidden">
                      {user.profilePicture ? (
                        <img 
                          src={`http://localhost:5000${user.profilePicture}`} 
                          alt={user.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <span className="text-2xl font-bold text-teal-400">
                          {user.name.split(' ').map(n => n[0]).join('')}
                        </span>
                      )}
                      <button
                        onClick={handleProfilePictureClick}
                        className="absolute inset-0 bg-black/50 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                        disabled={uploadingPicture}
                      >
                        {uploadingPicture ? (
                          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white"></div>
                        ) : (
                          <Camera className="w-6 h-6 text-white" />
                        )}
                      </button>
                    </div>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/jpeg,image/jpg,image/png,image/gif,image/webp"
                      onChange={handleProfilePictureUpload}
                      className="hidden"
                    />
                  </div>
                  
                  <div>
                    <h1 className="text-2xl font-bold text-white">{user.name}</h1>
                    <p className="text-teal-400 font-medium">{user.role}</p>
                    <div className="flex items-center space-x-4 mt-2">
                      <span className="px-2 py-1 bg-green-500/20 text-green-400 text-xs font-medium rounded-full">Active</span>
                      <span className="text-gray-400 text-sm">{user.role}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center space-x-3">
                  <button
                    onClick={() => setShowProfileEditModal(true)}
                    className="flex items-center px-4 py-2 bg-teal-600 hover:bg-teal-500 text-white rounded-lg font-medium transition-colors"
                  >
                    <Edit2 className="w-4 h-4 mr-2" />
                    Edit Profile
                  </button>
                  <button
                    onClick={handleLogout}
                    className="flex items-center px-4 py-2 bg-red-600 hover:bg-red-500 text-white rounded-lg font-medium transition-colors"
                  >
                    <LogOut className="w-4 h-4 mr-2" />
                    Logout
                  </button>
                </div>
              </div>
            </Card>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Basic Info Section */}
              <div className="lg:col-span-2 space-y-6">
                <Card className="bg-slate-800/60 rounded-2xl p-6 shadow-lg">
                  <h2 className="text-lg font-semibold text-white mb-4 flex items-center">
                    <User className="w-5 h-5 mr-2 text-teal-400" />
                    Basic Information
                  </h2>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-400 mb-2">Full Name</label>
                      <p className="text-white">{user.name || 'Not available'}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-400 mb-2">Email Address</label>
                      <p className="text-white flex items-center">
                        <Mail className="w-4 h-4 mr-2 text-gray-400" />
                        {user.email || 'Not available'}
                      </p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-400 mb-2">Role</label>
                      <p className="text-white">{user.role || 'Not available'}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-400 mb-2">User ID</label>
                      <p className="text-white">#{user.id}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-400 mb-2">Department</label>
                      <p className="text-white">{user.department || 'Not available'}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-400 mb-2">Job Title</label>
                      <p className="text-white">{user.jobTitle || 'Not available'}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-400 mb-2">Manager</label>
                      <p className="text-white">{user.manager?.name || 'No manager assigned'}</p>
                      {user.manager && (
                        <p className="text-gray-400 text-sm">{user.manager.role} • {user.manager.department}</p>
                      )}
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-400 mb-2">Join Date</label>
                      <p className="text-white flex items-center">
                        <Calendar className="w-4 h-4 mr-2 text-gray-400" />
                        {user.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'Not available'}
                      </p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-400 mb-2">Phone Number</label>
                      <p className="text-white">{user.phone || 'Not available'}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-400 mb-2">Address</label>
                      <p className="text-white">{user.address || 'Not available'}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-400 mb-2">Account Status</label>
                      <span className="px-2 py-1 bg-green-500/20 text-green-400 text-xs font-medium rounded-full">Active</span>
                    </div>
                  </div>
                </Card>

                {/* Work Info Section */}
                <Card className="bg-slate-800/60 rounded-2xl p-6 shadow-lg">
                  <h2 className="text-lg font-semibold text-white mb-4 flex items-center">
                    <Shield className="w-5 h-5 mr-2 text-teal-400" />
                    Account Security
                  </h2>
                  
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-4 bg-slate-700/30 rounded-lg">
                      <div>
                        <p className="text-white font-medium">Password</p>
                        <p className="text-gray-400 text-sm">
                          {user.lastPasswordChange 
                            ? `Last changed ${new Date(user.lastPasswordChange).toLocaleDateString()}`
                            : 'Never changed'
                          }
                        </p>
                      </div>
                      <button 
                        onClick={() => setShowPasswordModal(true)}
                        className="px-4 py-2 bg-slate-600 hover:bg-slate-500 text-white rounded-lg text-sm transition-colors"
                      >
                        Change
                      </button>
                    </div>
                    <div className="flex items-center justify-between p-4 bg-slate-700/30 rounded-lg">
                      <div>
                        <p className="text-white font-medium">Two-Factor Authentication</p>
                        <p className="text-gray-400 text-sm">
                          {user?.twoFactorEnabled ? 'Enabled - Extra security active' : 'Add an extra layer of security'}
                        </p>
                      </div>
                      <button 
                        onClick={handle2FASetup}
                        className={`px-4 py-2 rounded-lg text-sm transition-colors ${
                          user?.twoFactorEnabled 
                            ? 'bg-red-600 hover:bg-red-500 text-white' 
                            : 'bg-teal-600 hover:bg-teal-500 text-white'
                        }`}
                      >
                        {user?.twoFactorEnabled ? 'Disable' : 'Enable'}
                      </button>
                    </div>
                  </div>
                </Card>
              </div>

              {/* Quick Stats Section */}
              <div className="space-y-6">
                <Card className="bg-slate-800/60 rounded-2xl p-6 shadow-lg">
                  <h2 className="text-lg font-semibold text-white mb-4 flex items-center">
                    <Calendar className="w-5 h-5 mr-2 text-teal-400" />
                    Quick Stats
                  </h2>
                  
                  <div className="space-y-4">
                    <div className="text-center p-3 bg-slate-700/30 rounded-lg">
                      <p className="text-2xl font-bold text-teal-400">{user.id}</p>
                      <p className="text-gray-400 text-sm">Employee ID</p>
                    </div>
                    <div className="text-center p-3 bg-slate-700/30 rounded-lg">
                      <p className="text-2xl font-bold text-green-400">Active</p>
                      <p className="text-gray-400 text-sm">Status</p>
                    </div>
                    <div className="text-center p-3 bg-slate-700/30 rounded-lg">
                      <p className="text-2xl font-bold text-blue-400">
                        {user.createdAt ? Math.floor((Date.now() - new Date(user.createdAt).getTime()) / (1000 * 60 * 60 * 24)) : 0}
                      </p>
                      <p className="text-gray-400 text-sm">Days Active</p>
                    </div>
                  </div>
                </Card>
              </div>
            </div>
          </div>

        {/* Password Change Modal */}
        <Modal
          isOpen={showPasswordModal}
          onClose={() => setShowPasswordModal(false)}
          title="Change Password"
        >
          <form onSubmit={handlePasswordChange} className="space-y-4">
            <Input
              name="currentPassword"
              type="password"
              value={passwordForm.currentPassword}
              onChange={(e) => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })}
              placeholder="Current Password"
              required
            />
            <Input
              name="newPassword"
              type="password"
              value={passwordForm.newPassword}
              onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
              placeholder="New Password"
              required
            />
            <Input
              name="confirmPassword"
              type="password"
              value={passwordForm.confirmPassword}
              onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
              placeholder="Confirm New Password"
              required
            />
            <div className="flex gap-2">
              <Button 
                type="button" 
                onClick={() => setShowPasswordModal(false)}
                variant="secondary"
                className="flex-1"
              >
                Cancel
              </Button>
              <Button 
                type="submit" 
                loading={loading}
                className="flex-1"
                loadingText="Changing..."
              >
                Change Password
              </Button>
            </div>
          </form>
        </Modal>

        {/* Profile Edit Modal */}
        <Modal
          isOpen={showProfileEditModal}
          onClose={() => setShowProfileEditModal(false)}
          title="Edit Profile"
        >
          <form onSubmit={handleProfileEdit} className="space-y-4">
            <Input
              name="name"
              value={profileForm.name}
              onChange={(e) => setProfileForm({ ...profileForm, name: e.target.value })}
              placeholder="Full Name"
              required
            />
            <Input
              name="email"
              type="email"
              value={profileForm.email}
              onChange={(e) => setProfileForm({ ...profileForm, email: e.target.value })}
              placeholder="Email Address"
              required
            />
            <Input
              name="phone"
              value={profileForm.phone}
              onChange={(e) => setProfileForm({ ...profileForm, phone: e.target.value })}
              placeholder="Phone Number"
            />
            <Input
              name="address"
              value={profileForm.address}
              onChange={(e) => setProfileForm({ ...profileForm, address: e.target.value })}
              placeholder="Address"
            />
            <div className="flex gap-2">
              <Button 
                type="button" 
                onClick={() => setShowProfileEditModal(false)}
                variant="secondary"
                className="flex-1"
              >
                Cancel
              </Button>
              <Button 
                type="submit" 
                loading={loading}
                className="flex-1"
                loadingText="Saving..."
              >
                Save Changes
              </Button>
            </div>
          </form>
        </Modal>

        {/* 2FA Setup Modal */}
        <Modal
          isOpen={show2FAModal}
          onClose={() => setShow2FAModal(false)}
          title={user?.twoFactorEnabled ? "Disable Two-Factor Authentication" : "Two-Factor Authentication Setup"}
        >
          <div className="space-y-4">
            {user?.twoFactorEnabled ? (
              // Disable 2FA view
              <div className="text-center p-6 bg-slate-700/30 rounded-lg">
                <Shield className="w-12 h-12 text-red-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-white mb-2">Disable 2FA</h3>
                <p className="text-gray-400 text-sm mb-4">
                  Are you sure you want to disable two-factor authentication? This will make your account less secure.
                </p>
              </div>
            ) : (
              // Setup 2FA view
              <div className="text-center p-6 bg-slate-700/30 rounded-lg">
                <Shield className="w-12 h-12 text-teal-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-white mb-2">Enhance Your Security</h3>
                <p className="text-gray-400 text-sm mb-4">
                  Two-factor authentication is now enabled for your account.
                </p>
                {twoFactorSetupData && (
                  <div className="bg-slate-800/50 p-4 rounded-lg mb-4">
                    <p className="text-sm text-gray-300 mb-2">Setup Information:</p>
                    <div className="text-xs text-gray-400 space-y-1">
                      <p><strong>Secret Key:</strong> {twoFactorSetupData.secret}</p>
                      <p><strong>QR Code URL:</strong></p>
                      <p className="break-all text-blue-400">{twoFactorSetupData.qrCode}</p>
                    </div>
                    <p className="text-xs text-gray-400 mt-2">
                      In production, this would show a QR code to scan with your authenticator app.
                    </p>
                  </div>
                )}
              </div>
            )}
            <div className="flex gap-2">
              <Button 
                onClick={() => {
                  setShow2FAModal(false);
                  setTwoFactorSetupData(null);
                }}
                variant="secondary"
                className="flex-1"
              >
                Cancel
              </Button>
              <Button 
                onClick={() => {
                  if (user?.twoFactorEnabled) {
                    // Handle disable confirmation
                    handle2FASetup();
                  } else {
                    toast.success('2FA enabled successfully!');
                    setShow2FAModal(false);
                    setTwoFactorSetupData(null);
                    if (user) {
                      user.twoFactorEnabled = true;
                    }
                  }
                }}
                className="flex-1"
              >
                {user?.twoFactorEnabled ? 'Disable 2FA' : 'Complete Setup'}
              </Button>
            </div>
          </div>
        </Modal>
        </FadeIn>
      </StandardLayout>
    </PageTransition>
  );
};

export default Profile;
