import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Users, 
  Calendar, 
  DollarSign, 
  UserCheck, 
  FileText, 
  Settings, 
  Command,
  GitBranch,
  Building
} from 'lucide-react';

const Sidebar: React.FC = () => {
  const location = useLocation();

  const isActive = (path: string) => location.pathname === path;

  const navSections = [
    {
      title: 'MAIN',
      items: [
        { 
          name: 'Dashboard', 
          path: '/dashboard',
          icon: LayoutDashboard
        },
        { 
          name: 'Command Center', 
          path: '/command-center',
          icon: Command
        },
        { 
          name: 'Workflow Hub', 
          path: '/workflow-hub',
          icon: GitBranch
        }
      ]
    },
    {
      title: 'HR',
      items: [
        { 
          name: 'My Team', 
          path: '/my-team',
          icon: Users
        },
        { 
          name: 'Directory', 
          path: '/directory',
          icon: Building
        },
        { 
          name: 'Leave & Attendance', 
          path: '/leave-attendance',
          icon: Calendar
        },
        { 
          name: 'Payroll & Benefits', 
          path: '/payroll-benefits',
          icon: DollarSign
        },
        { 
          name: 'Recruiting', 
          path: '/recruiting',
          icon: UserCheck
        },
        { 
          name: 'Reports', 
          path: '/reports',
          icon: FileText
        }
      ]
    },
    {
      title: 'SETTINGS',
      items: [
        { 
          name: 'Settings', 
          path: '/settings',
          icon: Settings
        }
      ]
    }
  ];

  return (
    <div className="w-64 bg-slate-900 border-r border-slate-800/50 h-screen fixed left-0 top-0 flex flex-col">
      {/* Logo */}
      <div className="p-6 border-b border-slate-800/50">
        <h1 className="text-xl font-bold text-white flex items-center">
          <div className="w-8 h-8 bg-teal-500 rounded-lg flex items-center justify-center mr-3">
            <span className="text-white font-bold text-sm">A</span>
          </div>
          Ascentia
        </h1>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 overflow-y-auto">
        {navSections.map((section, sectionIndex) => (
          <div key={section.title} className={sectionIndex > 0 ? 'mt-8' : ''}>
            <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3 px-3">
              {section.title}
            </h3>
            <ul className="space-y-1">
              {section.items.map((item) => {
                const Icon = item.icon;
                const active = isActive(item.path);
                
                return (
                  <li key={item.path}>
                    <Link
                      to={item.path}
                      className={`flex items-center px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 group ${
                        active
                          ? 'bg-teal-500/10 text-teal-400 border-l-4 border-teal-500'
                          : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
                      }`}
                    >
                      <Icon 
                        className={`w-5 h-5 mr-3 transition-colors duration-200 ${
                          active ? 'text-teal-400' : 'text-slate-500 group-hover:text-slate-400'
                        }`} 
                      />
                      <span>{item.name}</span>
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-slate-800/50">
        <div className="flex items-center space-x-3 px-3 py-2">
          <div className="w-8 h-8 bg-slate-700 rounded-full flex items-center justify-center">
            <span className="text-slate-300 text-sm font-medium">JD</span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-white truncate">John Davis</p>
            <p className="text-xs text-slate-400 truncate">john@ascentia.com</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;