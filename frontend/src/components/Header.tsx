import React, { useState, useEffect, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/useAuthStore';

const Header: React.FC = () => {
  const [pageTitle, setPageTitle] = useState("Dashboard");
  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const notificationsRef = useRef<HTMLDivElement>(null);
  const profileRef = useRef<HTMLDivElement>(null);
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const path = location.pathname;
    const titles: { [key: string]: string } = {
      "/": "Dashboard",
      "/dashboard": "Dashboard",
      "/directory": "Employee Directory",
      "/command-center": "Command Center",
      "/workflow-hub": "Workflow Hub",
      "/my-team": "My Team",
      "/leave-attendance": "Leave & Attendance",
      "/payroll-benefits": "Payroll & Benefits",
      "/recruiting": "Recruiting",
      "/reports": "Reports",
    };
    setPageTitle(titles[path] || "Dashboard");
  }, [location.pathname]);

  const notifications = [
    { id: 1, title: 'New leave request', message: 'Sarah Johnson submitted a leave request' },
    { id: 2, title: 'Task completed', message: 'Michael Chen completed onboarding' }
  ];

  const handleLogout = () => {
    logout();
    setShowProfile(false);
    navigate('/login');
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (notificationsRef.current && !notificationsRef.current.contains(event.target as Node)) {
        setShowNotifications(false);
      }
      if (profileRef.current && !profileRef.current.contains(event.target as Node)) {
        setShowProfile(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <header className="fixed top-0 left-64 right-0 bg-slate-800/40 backdrop-blur-xl border-b border-slate-700/50 z-10">
      <div className="px-6 py-4 flex items-center justify-between">
        
        {/* Dynamic Title */}
        <h2 className="text-xl font-semibold text-white">{pageTitle}</h2>

        <div className="flex items-center space-x-4">
          
          {/* Notifications */}
          <div ref={notificationsRef} className="relative">
            <button onClick={() => setShowNotifications(!showNotifications)} className="p-2 text-gray-300 hover:text-white">
              <i className="fas fa-bell text-xl"></i>
            </button>

            {showNotifications && (
              <div className="absolute right-0 mt-2 w-72 bg-slate-800 rounded-xl border border-slate-700 shadow-xl">
                {notifications.map(n => (
                  <div key={n.id} className="p-3 hover:bg-slate-700 cursor-pointer">
                    <p className="text-white text-sm">{n.title}</p>
                    <p className="text-gray-400 text-xs">{n.message}</p>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Profile */}
          <div ref={profileRef} className="relative">
            <button onClick={() => setShowProfile(!showProfile)} className="flex items-center space-x-2">
              <img src={`https://picsum.photos/seed/${user?.id || 'default'}/40`} className="w-8 h-8 rounded-full" />
              <span className="text-white hidden md:block">{user?.name || 'User'}</span>
            </button>

            {showProfile && (
              <div className="absolute right-0 mt-2 w-48 bg-slate-800 rounded-xl border border-slate-700 shadow-xl">
                <button className="block w-full text-left px-4 py-2 hover:bg-slate-700 text-white">Profile</button>
                <button className="block w-full text-left px-4 py-2 hover:bg-slate-700 text-white">Settings</button>
                <button 
                  onClick={handleLogout}
                  className="block w-full text-left px-4 py-2 hover:bg-red-500/20 text-red-400">Logout</button>
              </div>
            )}
          </div>

        </div>
      </div>
    </header>
  );
};

export default Header;