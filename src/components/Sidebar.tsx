import React from 'react';

const Sidebar: React.FC = () => {
  return (
    <div className="w-64 bg-gradient-to-b from-teal-600 to-black h-screen fixed left-0 top-0 flex flex-col border-r border-slate-700/50 backdrop-blur-sm">
      {/* Logo */}
      <div className="p-6 border-b border-slate-700/50 backdrop-blur-sm">
        <h1 className="text-2xl font-bold text-white">Ascentia</h1>
      </div>
      
      {/* Navigation Menu */}
      <nav className="flex-1 p-4">
        <ul className="space-y-2">
          <li>
            <a href="#" className="flex items-center p-3 rounded-xl hover:bg-white/10 backdrop-blur-sm transition-all duration-300 text-gray-300 hover:text-white hover:shadow-lg hover:shadow-teal-500/20 border border-transparent hover:border-slate-600/50">
              <i className="fas fa-home w-5 mr-3"></i>
              <span>Dashboard</span>
            </a>
          </li>
          <li>
            <a href="#" className="flex items-center p-3 rounded-xl hover:bg-white/10 backdrop-blur-sm transition-all duration-300 text-gray-300 hover:text-white hover:shadow-lg hover:shadow-teal-500/20 border border-transparent hover:border-slate-600/50">
              <i className="fas fa-tachometer-alt w-5 mr-3"></i>
              <span>Command Center</span>
            </a>
          </li>
          <li>
            <a href="#" className="flex items-center p-3 rounded-xl hover:bg-white/10 backdrop-blur-sm transition-all duration-300 text-gray-300 hover:text-white hover:shadow-lg hover:shadow-teal-500/20 border border-transparent hover:border-slate-600/50">
              <i className="fas fa-tasks w-5 mr-3"></i>
              <span>Workflow Hub</span>
            </a>
          </li>
          <li>
            <a href="#" className="flex items-center p-3 rounded-xl hover:bg-white/10 backdrop-blur-sm transition-all duration-300 text-gray-300 hover:text-white hover:shadow-lg hover:shadow-teal-500/20 border border-transparent hover:border-slate-600/50">
              <i className="fas fa-users w-5 mr-3"></i>
              <span>My Team</span>
            </a>
          </li>
          <li>
            <a href="#" className="flex items-center p-3 rounded-xl hover:bg-white/10 backdrop-blur-sm transition-all duration-300 text-gray-300 hover:text-white hover:shadow-lg hover:shadow-teal-500/20 border border-transparent hover:border-slate-600/50">
              <i className="fas fa-address-book w-5 mr-3"></i>
              <span>Directory</span>
            </a>
          </li>
          <li>
            <a href="#" className="flex items-center p-3 rounded-xl hover:bg-white/10 backdrop-blur-sm transition-all duration-300 text-gray-300 hover:text-white hover:shadow-lg hover:shadow-teal-500/20 border border-transparent hover:border-slate-600/50">
              <i className="fas fa-calendar-alt w-5 mr-3"></i>
              <span>Leave & Attendance</span>
            </a>
          </li>
          <li>
            <a href="#" className="flex items-center p-3 rounded-xl hover:bg-white/10 backdrop-blur-sm transition-all duration-300 text-gray-300 hover:text-white hover:shadow-lg hover:shadow-teal-500/20 border border-transparent hover:border-slate-600/50">
              <i className="fas fa-dollar-sign w-5 mr-3"></i>
              <span>Payroll & Benefits</span>
            </a>
          </li>
          <li>
            <a href="#" className="flex items-center p-3 rounded-xl hover:bg-white/10 backdrop-blur-sm transition-all duration-300 text-gray-300 hover:text-white hover:shadow-lg hover:shadow-teal-500/20 border border-transparent hover:border-slate-600/50">
              <i className="fas fa-user-tie w-5 mr-3"></i>
              <span>Recruiting</span>
            </a>
          </li>
          <li>
            <a href="#" className="flex items-center p-3 rounded-xl hover:bg-white/10 backdrop-blur-sm transition-all duration-300 text-gray-300 hover:text-white hover:shadow-lg hover:shadow-teal-500/20 border border-transparent hover:border-slate-600/50">
              <i className="fas fa-chart-bar w-5 mr-3"></i>
              <span>Reports</span>
            </a>
          </li>
        </ul>
      </nav>
    </div>
  );
};

export default Sidebar;
