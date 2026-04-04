import React from 'react';

const Header: React.FC = () => {
  return (
    <header className="fixed top-0 left-64 right-0 bg-slate-800/40 backdrop-blur-xl border-b border-slate-700/50 z-10">
      <div className="px-6 py-4 flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <h2 className="text-xl font-semibold text-white">Dashboard</h2>
        </div>
        
        {/* Right Side Actions */}
        <div className="flex items-center space-x-4">
          {/* Notifications */}
          <button className="relative p-2 text-gray-300 hover:text-white transition-colors duration-200">
            <i className="fas fa-bell text-xl"></i>
            <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
          </button>
          
          {/* User Avatar */}
          <div className="flex items-center space-x-3">
            <img 
              src="https://picsum.photos/seed/user-avatar/40/40.jpg" 
              alt="User Avatar" 
              className="w-10 h-10 rounded-full border-2 border-slate-600"
            />
            <div className="hidden md:block">
              <p className="text-sm font-medium text-white">John Doe</p>
              <p className="text-xs text-gray-400">Administrator</p>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
