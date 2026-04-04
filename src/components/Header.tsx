import React, { useState, useEffect, useRef } from 'react';

const Header: React.FC = () => {
  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const notificationsRef = useRef<HTMLDivElement>(null);
  const profileRef = useRef<HTMLDivElement>(null);

  // Mock notifications data
  const notifications = [
    {
      id: 1,
      title: 'New leave request',
      message: 'Sarah Johnson submitted a leave request',
      time: '5 minutes ago',
      read: false
    },
    {
      id: 2,
      title: 'Task completed',
      message: 'Michael Chen completed the onboarding task',
      time: '1 hour ago',
      read: false
    },
    {
      id: 3,
      title: 'System update',
      message: 'HR system will be updated tonight at 11 PM',
      time: '3 hours ago',
      read: true
    },
    {
      id: 4,
      title: 'New employee',
      message: 'Emily Davis joined the team',
      time: '1 day ago',
      read: true
    }
  ];

  // Close dropdowns when clicking outside
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
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleNotifications = () => {
    console.log("Toggle notifications");
    setShowNotifications(!showNotifications);
    setShowProfile(false); // Close profile if open
  };

  const handleProfile = () => {
    console.log("Toggle profile menu");
    setShowProfile(!showProfile);
    setShowNotifications(false); // Close notifications if open
  };

  const handleNotificationClick = (id: number) => {
    console.log(`Clicked notification ${id}`);
  };

  const handleProfileOption = (option: string) => {
    console.log(`Profile option: ${option}`);
    setShowProfile(false);
  };

  return (
    <header className="fixed top-0 left-64 right-0 bg-slate-800/40 backdrop-blur-xl border-b border-slate-700/50 z-10">
      <div className="px-6 py-4 flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <h2 className="text-xl font-semibold text-white">Dashboard</h2>
        </div>
        
        {/* Right Side Actions */}
        <div className="flex items-center space-x-4">
          {/* Notifications Dropdown */}
          <div ref={notificationsRef} className="relative">
            <button 
              onClick={handleNotifications}
              className="relative p-2 text-gray-300 hover:text-white transition-colors duration-200"
            >
              <i className="fas fa-bell text-xl"></i>
              <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
            </button>
            
            {/* Notifications Dropdown */}
            <div className={`absolute right-0 mt-2 w-80 bg-slate-800/95 backdrop-blur-xl rounded-xl border border-slate-700/50 shadow-xl transition-all duration-200 origin-top-right ${
              showNotifications 
                ? 'opacity-100 scale-100 visible' 
                : 'opacity-0 scale-95 invisible'
            }`}>
              <div className="p-4 border-b border-slate-700/50">
                <h3 className="text-white font-semibold">Notifications</h3>
                <p className="text-gray-400 text-sm">You have {notifications.filter(n => !n.read).length} new notifications</p>
              </div>
              
              <div className="max-h-96 overflow-y-auto">
                {notifications.map((notification) => (
                  <div
                    key={notification.id}
                    onClick={() => handleNotificationClick(notification.id)}
                    className={`p-4 border-b border-slate-700/30 hover:bg-slate-700/50 transition-colors duration-200 cursor-pointer ${
                      !notification.read ? 'bg-slate-700/20' : ''
                    }`}
                  >
                    <div className="flex items-start space-x-3">
                      <div className={`w-2 h-2 rounded-full mt-2 ${
                        !notification.read ? 'bg-blue-400' : 'bg-transparent'
                      }`}></div>
                      <div className="flex-1">
                        <p className="text-white font-medium text-sm">{notification.title}</p>
                        <p className="text-gray-300 text-sm mt-1">{notification.message}</p>
                        <p className="text-gray-500 text-xs mt-2">{notification.time}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              
              <div className="p-3 border-t border-slate-700/50">
                <button 
                  onClick={() => console.log("Mark all as read")}
                  className="w-full text-center text-blue-400 hover:text-blue-300 text-sm transition-colors duration-200"
                >
                  Mark all as read
                </button>
              </div>
            </div>
          </div>
          
          {/* Profile Dropdown */}
          <div ref={profileRef} className="relative">
            <button 
              onClick={handleProfile}
              className="flex items-center space-x-3 hover:opacity-80 transition-opacity duration-200"
            >
              <img 
                src="https://picsum.photos/seed/user-avatar/40/40.jpg" 
                alt="User Avatar" 
                className="w-10 h-10 rounded-full border-2 border-slate-600"
              />
              <div className="hidden md:block">
                <p className="text-sm font-medium text-white">John Doe</p>
                <p className="text-xs text-gray-400">Administrator</p>
              </div>
            </button>
            
            {/* Profile Dropdown */}
            <div className={`absolute right-0 mt-2 w-56 bg-slate-800/95 backdrop-blur-xl rounded-xl border border-slate-700/50 shadow-xl transition-all duration-200 origin-top-right ${
              showProfile 
                ? 'opacity-100 scale-100 visible' 
                : 'opacity-0 scale-95 invisible'
            }`}>
              <div className="p-2">
                <button
                  onClick={() => handleProfileOption('Profile')}
                  className="w-full text-left px-4 py-3 text-gray-300 hover:text-white hover:bg-slate-700/50 rounded-lg transition-all duration-200 flex items-center space-x-3"
                >
                  <i className="fas fa-user w-4"></i>
                  <span>Profile</span>
                </button>
                
                <button
                  onClick={() => handleProfileOption('Settings')}
                  className="w-full text-left px-4 py-3 text-gray-300 hover:text-white hover:bg-slate-700/50 rounded-lg transition-all duration-200 flex items-center space-x-3"
                >
                  <i className="fas fa-cog w-4"></i>
                  <span>Settings</span>
                </button>
                
                <div className="border-t border-slate-700/50 my-2"></div>
                
                <button
                  onClick={() => handleProfileOption('Logout')}
                  className="w-full text-left px-4 py-3 text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-lg transition-all duration-200 flex items-center space-x-3"
                >
                  <i className="fas fa-sign-out-alt w-4"></i>
                  <span>Logout</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
