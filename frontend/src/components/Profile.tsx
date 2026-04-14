import React from 'react';
import { StandardLayout } from './StandardLayout';
import { User, Mail, Shield, Calendar, LogOut } from 'lucide-react';
import Card from './Card';
import { PageTransition, FadeIn } from './PageTransition';
import { useAuthStore } from '../store/useAuthStore';
import { useNavigate } from 'react-router-dom';

const Profile: React.FC = () => {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
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
                  <div className="w-20 h-20 bg-teal-500/20 rounded-full flex items-center justify-center">
                    <span className="text-2xl font-bold text-teal-400">
                      {user.name.split(' ').map(n => n[0]).join('')}
                    </span>
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

                <button
                  onClick={handleLogout}
                  className="flex items-center px-4 py-2 bg-red-600 hover:bg-red-500 text-white rounded-lg font-medium transition-colors"
                >
                  <LogOut className="w-4 h-4 mr-2" />
                  Logout
                </button>
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
                      <label className="block text-sm font-medium text-gray-400 mb-2">Join Date</label>
                      <p className="text-white flex items-center">
                        <Calendar className="w-4 h-4 mr-2 text-gray-400" />
                        {user.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'Not available'}
                      </p>
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
                        <p className="text-gray-400 text-sm">Last changed recently</p>
                      </div>
                      <button className="px-4 py-2 bg-slate-600 hover:bg-slate-500 text-white rounded-lg text-sm transition-colors">
                        Change
                      </button>
                    </div>
                    <div className="flex items-center justify-between p-4 bg-slate-700/30 rounded-lg">
                      <div>
                        <p className="text-white font-medium">Two-Factor Authentication</p>
                        <p className="text-gray-400 text-sm">Add an extra layer of security</p>
                      </div>
                      <button className="px-4 py-2 bg-teal-600 hover:bg-teal-500 text-white rounded-lg text-sm transition-colors">
                        Enable
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
        </FadeIn>
      </StandardLayout>
    </PageTransition>
  );
};

export default Profile;
