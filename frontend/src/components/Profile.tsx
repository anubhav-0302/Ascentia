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
        title="Profile"
        description="View and manage your personal information"
      >
        <FadeIn delay={100}>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Profile Card */}
            <div className="lg:col-span-1">
              <Card className="p-6 text-center">
                <div className="w-24 h-24 bg-teal-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl font-bold text-teal-400">
                    {user.name.split(' ').map(n => n[0]).join('')}
                  </span>
                </div>
                
                <h2 className="text-xl font-semibold text-white mb-2">{user.name}</h2>
                <p className="text-teal-400 text-sm mb-4">{user.role}</p>
                
                <div className="space-y-3 text-left">
                  <div className="flex items-center text-sm">
                    <Mail className="w-4 h-4 mr-3 text-gray-400" />
                    <span className="text-gray-300">{user.email}</span>
                  </div>
                  <div className="flex items-center text-sm">
                    <Shield className="w-4 h-4 mr-3 text-gray-400" />
                    <span className="text-gray-300">{user.role}</span>
                  </div>
                  <div className="flex items-center text-sm">
                    <Calendar className="w-4 h-4 mr-3 text-gray-400" />
                    <span className="text-gray-300">Joined {new Date(user.createdAt).toLocaleDateString()}</span>
                  </div>
                </div>

                <button
                  onClick={handleLogout}
                  className="w-full mt-6 flex items-center justify-center px-4 py-2 bg-red-600 hover:bg-red-500 text-white rounded-lg font-medium transition-colors"
                >
                  <LogOut className="w-4 h-4 mr-2" />
                  Logout
                </button>
              </Card>
            </div>

            {/* Details Section */}
            <div className="lg:col-span-2 space-y-6">
              <Card className="p-6">
                <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
                  <User className="w-5 h-5 mr-2 text-teal-400" />
                  Account Information
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-2">Full Name</label>
                    <p className="text-white">{user.name}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-2">Email Address</label>
                    <p className="text-white">{user.email}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-2">Role</label>
                    <p className="text-white">{user.role}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-2">User ID</label>
                    <p className="text-white">#{user.id}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-2">Join Date</label>
                    <p className="text-white">{new Date(user.createdAt).toLocaleDateString()}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-2">Account Status</label>
                    <p className="text-green-400">Active</p>
                  </div>
                </div>
              </Card>

              <Card className="p-6">
                <h3 className="text-lg font-semibold text-white mb-4">Security</h3>
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
          </div>
        </FadeIn>
      </StandardLayout>
    </PageTransition>
  );
};

export default Profile;
