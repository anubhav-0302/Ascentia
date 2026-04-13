import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/useAuthStore';
import { User, Settings, LogOut, ChevronDown } from 'lucide-react';
import NotificationCenter from './NotificationCenter';
import HeaderSearch from './HeaderSearch';

interface HeaderProps {
  // No props needed since title/subtitle are handled by individual pages
}

const Header: React.FC<HeaderProps> = () => {
  const [showProfile, setShowProfile] = useState(false);
  const profileRef = useRef<HTMLDivElement>(null);
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();

  const handleProfileClick = () => {
    setShowProfile(false);
    navigate('/profile');
  };

  const handleSettingsClick = () => {
    setShowProfile(false);
    navigate('/settings');
  };

  const handleLogout = () => {
    logout();
    setShowProfile(false);
    navigate('/login');
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (profileRef.current && !profileRef.current.contains(event.target as Node)) {
        setShowProfile(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <header className="h-16 bg-slate-900/80 backdrop-blur-lg border-b border-slate-800/50 fixed top-0 right-0 left-64 z-40">
      <div className="h-full px-6 flex items-center justify-between">
        {/* Left Section - Visual balance with subtle accent */}
        <div className="flex-1 flex items-center">
          <div className="w-px h-8 bg-gradient-to-b from-transparent via-slate-700 to-transparent"></div>
        </div>

        {/* Center Divider */}
        <div className="h-8 w-px bg-gradient-to-b from-transparent via-slate-700 to-transparent mx-4"></div>

        {/* Right Section - Enhanced visual presentation */}
        <div className="flex items-center space-x-3">
          {/* Header Search */}
          <div className="relative">
            <HeaderSearch />
          </div>

          {/* Separator */}
          <div className="h-6 w-px bg-slate-700/50"></div>

          {/* Notification Bell */}
          <div className="relative">
            <NotificationCenter />
          </div>

          {/* Separator */}
          <div className="h-6 w-px bg-slate-700/50"></div>

          {/* User Dropdown */}
          <div ref={profileRef} className="relative">
            <button
              onClick={() => setShowProfile(!showProfile)}
              className="flex items-center space-x-3 p-2 rounded-lg hover:bg-slate-800/50 transition-all duration-200 border border-transparent hover:border-slate-700/50"
            >
              <div className="w-8 h-8 bg-gradient-to-br from-teal-500 to-teal-600 rounded-full flex items-center justify-center shadow-lg shadow-teal-500/20">
                <User className="w-5 h-5 text-white" />
              </div>
              <div className="hidden md:block text-left">
                <p className="text-sm font-medium text-white">{user?.name || 'John Davis'}</p>
                <p className="text-xs text-slate-400">{user?.role || 'Administrator'}</p>
              </div>
              <ChevronDown 
                className={`w-4 h-4 text-slate-400 transition-transform duration-200 ${
                  showProfile ? 'rotate-180' : ''
                }`} 
              />
            </button>

            {/* Enhanced Dropdown Menu */}
            {showProfile && (
              <div className="absolute right-0 mt-3 w-72 bg-slate-800/95 backdrop-blur-lg border border-slate-700/50 rounded-xl shadow-2xl z-50 overflow-hidden">
                {/* User Profile Section */}
                <div className="p-4 bg-gradient-to-r from-teal-600/20 to-blue-600/20 border-b border-slate-700/50">
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 bg-gradient-to-br from-teal-500 to-teal-600 rounded-full flex items-center justify-center shadow-lg shadow-teal-500/30">
                      <User className="w-6 h-6 text-white" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-semibold text-white">{user?.name || 'John Davis'}</p>
                      <p className="text-xs text-slate-300">{user?.email || 'john@ascentia.com'}</p>
                      <p className="text-xs text-teal-400 mt-1">{user?.role || 'Administrator'}</p>
                    </div>
                  </div>
                </div>

                {/* Menu Items */}
                <div className="py-2">
                  <button 
                    onClick={handleProfileClick}
                    className="w-full px-4 py-3 text-left text-sm text-slate-300 hover:text-white hover:bg-slate-700/50 transition-all duration-200 flex items-center space-x-3 group"
                  >
                    <div className="w-8 h-8 bg-slate-700/50 rounded-lg flex items-center justify-center group-hover:bg-teal-600/20 transition-colors duration-200">
                      <User className="w-4 h-4" />
                    </div>
                    <div className="flex-1">
                      <p className="font-medium">Profile</p>
                      <p className="text-xs text-slate-500">View your profile</p>
                    </div>
                  </button>
                  <button 
                    onClick={handleSettingsClick}
                    className="w-full px-4 py-3 text-left text-sm text-slate-300 hover:text-white hover:bg-slate-700/50 transition-all duration-200 flex items-center space-x-3 group"
                  >
                    <div className="w-8 h-8 bg-slate-700/50 rounded-lg flex items-center justify-center group-hover:bg-teal-600/20 transition-colors duration-200">
                      <Settings className="w-4 h-4" />
                    </div>
                    <div className="flex-1">
                      <p className="font-medium">Settings</p>
                      <p className="text-xs text-slate-500">App preferences</p>
                    </div>
                  </button>
                </div>

                {/* Logout Section */}
                <div className="border-t border-slate-700/50 p-2">
                  <button 
                    onClick={handleLogout}
                    className="w-full px-4 py-3 text-left text-sm text-red-400 hover:text-red-300 hover:bg-red-400/10 transition-all duration-200 flex items-center space-x-3 rounded-lg group"
                  >
                    <div className="w-8 h-8 bg-red-400/10 rounded-lg flex items-center justify-center group-hover:bg-red-400/20 transition-colors duration-200">
                      <LogOut className="w-4 h-4" />
                    </div>
                    <div className="flex-1">
                      <p className="font-medium">Sign out</p>
                      <p className="text-xs text-red-500/70">Logout from account</p>
                    </div>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;