import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
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
  Building,
  User,
  Clock,
  Target,
  Database,
  Shield
} from 'lucide-react';
import { useAuthStore } from '../store/useAuthStore';

const Sidebar: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const userRole = user?.role?.toLowerCase() || 'employee';

  const isActive = (path: string) => location.pathname === path;

  const handleProfileClick = () => {
    navigate('/profile');
  };

  const handleSettingsClick = () => {
    navigate('/settings');
  };

  interface NavItem {
    name: string;
    path: string;
    icon: any;
    onClick?: () => void;
    requiredRoles?: string[]; // 'admin', 'manager', 'employee'
  }

  interface NavSection {
    title: string;
    items: NavItem[];
  }

  // Check if user has access to a nav item
  const hasAccess = (item: NavItem): boolean => {
    if (!item.requiredRoles) return true; // No role restriction
    return item.requiredRoles.includes(userRole);
  };

  const navSections: NavSection[] = [
    {
      title: 'MAIN',
      items: [
        { 
          name: 'Dashboard', 
          path: '/dashboard',
          icon: LayoutDashboard,
          requiredRoles: ['admin', 'manager', 'employee']
        },
        { 
          name: 'Command Center', 
          path: '/command-center',
          icon: Command,
          requiredRoles: ['admin', 'manager']
        },
        { 
          name: 'Workflow Hub', 
          path: '/workflow-hub',
          icon: GitBranch,
          requiredRoles: ['admin', 'manager']
        }
      ]
    },
    {
      title: 'HR',
      items: [
        { 
          name: 'My Team', 
          path: '/my-team',
          icon: Users,
          requiredRoles: ['admin', 'manager']
        },
        { 
          name: 'Directory', 
          path: '/directory',
          icon: Building,
          requiredRoles: ['admin']
        },
        { 
          name: 'Leave & Attendance', 
          path: '/leave-attendance',
          icon: Calendar,
          requiredRoles: ['admin', 'manager', 'employee']
        },
        { 
          name: 'Timesheet Entry', 
          path: '/timesheet-entry',
          icon: Clock,
          requiredRoles: ['admin', 'manager', 'employee']
        },
        { 
          name: 'Performance Goals', 
          path: '/performance-goals',
          icon: Target,
          requiredRoles: ['admin', 'manager', 'employee']
        },
        { 
          name: 'Payroll & Benefits', 
          path: '/payroll-benefits',
          icon: DollarSign,
          requiredRoles: ['admin', 'employee']
        },
        { 
          name: 'Recruiting', 
          path: '/recruiting',
          icon: UserCheck,
          requiredRoles: ['admin']
        },
        { 
          name: 'Reports', 
          path: '/reports',
          icon: FileText,
          requiredRoles: ['admin', 'manager']
        }
      ]
    },
    {
      title: 'CONFIGURE',
      items: [
        { 
          name: 'Audit Logs', 
          path: '/audit-logs',
          icon: Database,
          requiredRoles: ['admin']
        },
        { 
          name: 'Permission Management', 
          path: '/permission-management',
          icon: Users,
          requiredRoles: ['admin']
        },
        { 
          name: 'Role Management', 
          path: '/role-management',
          icon: Shield,
          requiredRoles: ['admin']
        },
        { 
          name: 'Profile', 
          path: '/profile',
          icon: User,
          onClick: handleProfileClick,
          requiredRoles: ['admin', 'manager', 'employee']
        },
        { 
          name: 'Settings', 
          path: '/settings',
          icon: Settings,
          onClick: handleSettingsClick,
          requiredRoles: ['admin', 'manager', 'employee']
        }
      ]
    }
  ];

  return (
    <div className="w-64 bg-slate-900 border-r border-slate-800/50 h-screen fixed left-0 top-0 flex flex-col">
      {/* Logo */}
      <div className="p-6 border-b border-slate-800/50">
        <h1 className="text-xl font-bold text-white flex items-center">
          <div className="w-8 h-8 bg-gradient-to-br from-teal-500 to-teal-600 rounded-lg flex items-center justify-center mr-3 shadow-lg shadow-teal-500/30">
            <span className="text-white font-bold text-sm">A</span>
          </div>
          Ascentia
        </h1>
      </div>

      {/* Navigation */}
      <nav className="flex-1 py-4 overflow-y-auto scrollbar-hide">
        {navSections.map((section, index) => {
          // Filter items based on user role access
          const accessibleItems = section.items.filter(hasAccess);
          
          // Don't render section if no items are accessible
          if (accessibleItems.length === 0) return null;
          
          return (
            <div key={index} className="mb-8">
              <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3 px-3">
                {section.title}
              </h3>
              <ul className="space-y-1">
                {accessibleItems.map((item) => {
                  const Icon = item.icon;
                  const active = isActive(item.path);
                  
                  return (
                    <li key={item.path}>
                      {item.onClick ? (
                        <button
                          onClick={item.onClick}
                          className={`w-full flex items-center px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 group relative ${
                            active
                              ? 'bg-teal-500/10 text-teal-400 border-l-4 border-teal-500 shadow-lg shadow-teal-500/10'
                              : 'text-slate-400 hover:text-white hover:bg-slate-800/50 hover:translate-x-1'
                          }`}
                        >
                          <div className={`absolute inset-0 bg-gradient-to-r from-transparent to-teal-500/5 rounded-lg transition-opacity duration-300 ${
                            active ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'
                          }`} />
                          <Icon 
                            className={`w-5 h-5 mr-3 transition-all duration-200 relative z-10 ${
                              active ? 'text-teal-400 scale-110' : 'text-slate-500 group-hover:text-slate-400 group-hover:scale-110'
                            }`} 
                          />
                          <span className="relative z-10">{item.name}</span>
                          <div className={`absolute right-3 opacity-0 transition-all duration-300 ${
                            active ? 'opacity-100' : 'group-hover:opacity-30'
                          }`}>
                            <div className="w-1 h-1 bg-teal-400 rounded-full" />
                          </div>
                        </button>
                      ) : (
                        <Link
                          to={item.path}
                          className={`flex items-center px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 group relative ${
                            active
                              ? 'bg-teal-500/10 text-teal-400 border-l-4 border-teal-500 shadow-lg shadow-teal-500/10'
                              : 'text-slate-400 hover:text-white hover:bg-slate-800/50 hover:translate-x-1'
                          }`}
                        >
                          <div className={`absolute inset-0 bg-gradient-to-r from-transparent to-teal-500/5 rounded-lg transition-opacity duration-300 ${
                            active ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'
                          }`} />
                          <Icon 
                            className={`w-5 h-5 mr-3 transition-all duration-200 relative z-10 ${
                              active ? 'text-teal-400 scale-110' : 'text-slate-500 group-hover:text-slate-400 group-hover:scale-110'
                            }`} 
                          />
                          <span className="relative z-10">{item.name}</span>
                          <div className={`absolute right-3 opacity-0 transition-all duration-300 ${
                            active ? 'opacity-100' : 'group-hover:opacity-30'
                          }`}>
                            <div className="w-1 h-1 bg-teal-400 rounded-full" />
                          </div>
                        </Link>
                      )}
                    </li>
                  );
                })}
              </ul>
            </div>
          );
        })}
      </nav>

          </div>
  );
};

export default Sidebar;