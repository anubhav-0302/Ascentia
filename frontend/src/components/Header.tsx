import React, { useState, useEffect, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/useAuthStore';
import { User, Settings, LogOut, ChevronDown } from 'lucide-react';
import NotificationCenter from './NotificationCenter';
import GlobalSearch from './GlobalSearch';

interface HeaderProps {
  title?: string;
  subtitle?: string;
}

const Header: React.FC<HeaderProps> = ({ title, subtitle }) => {
  const [pageTitle, setPageTitle] = useState("Dashboard");
  const [pageSubtitle, setPageSubtitle] = useState("");
  const [showProfile, setShowProfile] = useState(false);
  const profileRef = useRef<HTMLDivElement>(null);
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const path = location.pathname;
    
    // Use custom title/subtitle if provided, otherwise use defaults
    if (title && subtitle) {
      setPageTitle(title);
      setPageSubtitle(subtitle);
      return;
    }

    const pageInfo: { [key: string]: { title: string; subtitle: string } } = {
      "/": { title: "Dashboard", subtitle: "Overview of your HR metrics and employee data" },
      "/dashboard": { title: "Dashboard", subtitle: "Overview of your HR metrics and employee data" },
      "/directory": { title: "Directory", subtitle: "Browse and manage employee information" },
      "/command-center": { title: "Command Center", subtitle: "Central hub for HR operations and management" },
      "/workflow-hub": { title: "Workflow Hub", subtitle: "Manage and automate HR workflows" },
      "/my-team": { title: "My Team", subtitle: "Manage your team members and performance" },
      "/leave-attendance": { title: "Leave & Attendance", subtitle: "Manage time off and attendance records" },
      "/payroll-benefits": { title: "Payroll & Benefits", subtitle: "Compensation and benefits administration" },
      "/recruiting": { title: "Recruiting", subtitle: "Manage job postings and candidate pipeline" },
      "/reports": { title: "Reports", subtitle: "Generate and view HR analytics reports" },
      "/profile": { title: "Employee Profile", subtitle: "Comprehensive employee information and history" },
      "/team-view": { title: "Team View", subtitle: "Organization hierarchy and team analytics" },
      "/calendar": { title: "Team Calendar", subtitle: "Visualize team leave schedules and manage time off" },
    };
    
    const info = pageInfo[path] || { title: "Dashboard", subtitle: "Overview of your HR metrics and employee data" };
    setPageTitle(info.title);
    setPageSubtitle(info.subtitle);
  }, [location.pathname, title, subtitle]);

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
        {/* Left Section - Page Title */}
        <div className="flex-1">
          <h1 className="text-xl font-semibold text-white">
            {pageTitle}
          </h1>
          {pageSubtitle && (
            <p className="text-sm text-slate-400">
              {pageSubtitle}
            </p>
          )}
        </div>

        {/* Right Section */}
        <div className="flex items-center space-x-4">
          {/* Global Search */}
          <GlobalSearch />

          {/* Notification Bell */}
          <NotificationCenter />

          {/* User Dropdown */}
          <div ref={profileRef} className="relative">
            <button
              onClick={() => setShowProfile(!showProfile)}
              className="flex items-center space-x-3 p-2 rounded-lg hover:bg-slate-800/50 transition-colors duration-200"
            >
              <div className="w-8 h-8 bg-teal-500 rounded-full flex items-center justify-center">
                <User className="w-5 h-5 text-white" />
              </div>
              <ChevronDown 
                className={`w-4 h-4 text-slate-400 transition-transform duration-200 ${
                  showProfile ? 'rotate-180' : ''
                }`} 
              />
            </button>

            {/* Dropdown Menu */}
            {showProfile && (
              <div className="absolute right-0 mt-2 w-56 bg-slate-800/95 backdrop-blur-lg border border-slate-700/50 rounded-xl shadow-xl z-50">
                <div className="p-4 border-b border-slate-700/50">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-teal-500 rounded-full flex items-center justify-center">
                      <User className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-white">{user?.name || 'John Davis'}</p>
                      <p className="text-xs text-slate-400">{user?.email || 'john@ascentia.com'}</p>
                    </div>
                  </div>
                </div>

                <div className="py-2">
                  <button className="w-full px-4 py-2 text-left text-sm text-slate-300 hover:text-white hover:bg-slate-700/50 transition-colors duration-200 flex items-center space-x-3">
                    <User className="w-4 h-4" />
                    <span>Profile</span>
                  </button>
                  <button className="w-full px-4 py-2 text-left text-sm text-slate-300 hover:text-white hover:bg-slate-700/50 transition-colors duration-200 flex items-center space-x-3">
                    <Settings className="w-4 h-4" />
                    <span>Settings</span>
                  </button>
                </div>

                <div className="border-t border-slate-700/50 py-2">
                  <button 
                    onClick={handleLogout}
                    className="w-full px-4 py-2 text-left text-sm text-red-400 hover:text-red-300 hover:bg-red-400/10 transition-colors duration-200 flex items-center space-x-3"
                  >
                    <LogOut className="w-4 h-4" />
                    <span>Sign out</span>
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