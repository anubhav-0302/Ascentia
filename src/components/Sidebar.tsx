import React from 'react';
import { Link, useLocation } from 'react-router-dom';

const Sidebar: React.FC = () => {
  const location = useLocation();

  const isActive = (path: string) => location.pathname === path;

  const navItems = [
    { name: 'Dashboard', path: '/dashboard' }, // ✅ FIXED
    { name: 'Command Center', path: '/command-center' },
    { name: 'Workflow Hub', path: '/workflow-hub' },
    { name: 'My Team', path: '/my-team' },
    { name: 'Directory', path: '/directory' },
    { name: 'Leave & Attendance', path: '/leave-attendance' },
    { name: 'Payroll & Benefits', path: '/payroll-benefits' },
    { name: 'Recruiting', path: '/recruiting' },
    { name: 'Reports', path: '/reports' },
  ];

  return (
    <div className="w-64 bg-gradient-to-b from-teal-600 to-black h-screen fixed left-0 top-0 flex flex-col border-r border-slate-700/50">
      
      <div className="p-6 border-b border-slate-700/50">
        <h1 className="text-2xl font-bold text-white">Ascentia</h1>
      </div>

      <nav className="flex-1 p-4">
        <ul className="space-y-2">
          {navItems.map((item) => (
            <li key={item.path}>
              <Link
                to={item.path}
                className={`flex items-center p-3 rounded-xl transition-all duration-300 ${
                  isActive(item.path)
                    ? 'bg-white/10 text-white border border-teal-500/30'
                    : 'text-gray-300 hover:text-white hover:bg-white/10'
                }`}
              >
                <span>{item.name}</span>
              </Link>
            </li>
          ))}
        </ul>
      </nav>
    </div>
  );
};

export default Sidebar;