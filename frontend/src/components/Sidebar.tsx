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
  Database
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
          <div className="w-8 h-8 bg-teal-500 rounded-lg flex items-center justify-center mr-3">
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
                          className={`w-full flex items-center px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 group ${
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
                        </button>
                      ) : (
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