import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { X } from 'lucide-react';
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
import { getSidebarPermissions } from '../api/roleManagementApi';

// Type definitions
interface NavItem {
  name: string;
  path?: string;
  icon: any;
  menuKey?: string;
  requiredRoles?: string[];
  onClick?: () => void;
}

interface NavSection {
  title: string;
  items: NavItem[];
}

interface SidebarProps {
  isOpen?: boolean;
  onClose?: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ isOpen = false, onClose }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, token } = useAuthStore();
  const userRole = user?.role?.toLowerCase() || 'employee';
  const [sidebarPermissions, setSidebarPermissions] = useState<{ [key: string]: boolean } | null>(null);

  const isActive = (path: string) => location.pathname === path;

  // Load sidebar permissions from database on every render
  // This ensures users always see the latest permissions
  useEffect(() => {
    const loadSidebarPermissions = async () => {
      if (token) {
        try {
          const permissions = await getSidebarPermissions(token);
          setSidebarPermissions(permissions);
        } catch (error) {
          console.error('Error loading sidebar permissions:', error);
          // On error, use null to trigger fallback to hardcoded roles
          setSidebarPermissions(null);
        }
      }
    };
    
    loadSidebarPermissions();
  }, [token, location.pathname]);

  const handleProfileClick = () => {
    navigate('/profile');
  };

  const handleSettingsClick = () => {
    navigate('/settings');
  };

  // Check if user has access to a nav item
  // ONLY use database permissions - no fallback
  const hasAccess = (item: NavItem): boolean => {
    // If permissions loaded and item has menuKey, check database
    if (sidebarPermissions !== null && item.menuKey) {
      return sidebarPermissions[item.menuKey] === true;
    }
    
    // While loading (sidebarPermissions is null), show based on hardcoded rules temporarily
    // Once loaded, ONLY database permissions matter
    if (sidebarPermissions === null && item.requiredRoles) {
      return item.requiredRoles.includes(userRole);
    }
    
    return false;
  };

  const navSections: NavSection[] = [
    {
      title: 'MAIN',
      items: [
        { 
          name: 'Dashboard', 
          path: '/dashboard',
          icon: LayoutDashboard,
          menuKey: 'dashboard',
          requiredRoles: ['admin', 'manager', 'employee']
        },
        { 
          name: 'Command Center', 
          path: '/command-center',
          icon: Command,
          menuKey: 'command-center',
          requiredRoles: ['admin']
        },
        { 
          name: 'Workflow Hub', 
          path: '/workflow-hub',
          icon: GitBranch,
          menuKey: 'workflow-hub',
          requiredRoles: ['admin']
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
          menuKey: 'my-team',
          requiredRoles: ['admin', 'manager', 'teamlead']
        },
        { 
          name: 'Directory', 
          path: '/directory',
          icon: Building,
          menuKey: 'directory',
          requiredRoles: ['admin', 'hr']
        },
        { 
          name: 'Leave & Attendance', 
          path: '/leave-attendance',
          icon: Calendar,
          menuKey: 'leave-attendance',
          requiredRoles: ['admin', 'manager', 'employee', 'hr', 'teamlead']
        },
        { 
          name: 'Timesheet Entry', 
          path: '/timesheet-entry',
          icon: Clock,
          menuKey: 'timesheet-entry',
          requiredRoles: ['admin', 'manager', 'employee', 'hr', 'teamlead']
        },
        { 
          name: 'Performance Goals', 
          path: '/performance-goals',
          icon: Target,
          menuKey: 'performance-goals',
          requiredRoles: ['admin', 'manager', 'employee', 'teamlead']
        },
        { 
          name: 'Payroll & Benefits', 
          path: '/payroll-benefits',
          icon: DollarSign,
          menuKey: 'payroll-benefits',
          requiredRoles: ['admin', 'employee', 'hr']
        },
        { 
          name: 'Recruiting', 
          path: '/recruiting',
          icon: UserCheck,
          menuKey: 'recruiting',
          requiredRoles: ['admin']
        },
        { 
          name: 'Reports', 
          path: '/reports',
          icon: FileText,
          menuKey: 'reports',
          requiredRoles: ['admin', 'manager', 'hr', 'teamlead']
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
          menuKey: 'audit-logs',
          requiredRoles: ['admin']
        },
        { 
          name: 'Permission Management', 
          path: '/permission-management',
          icon: Users,
          menuKey: 'permission-management',
          requiredRoles: ['admin']
        },
        { 
          name: 'Role Management', 
          path: '/role-management',
          icon: Shield,
          menuKey: 'role-management',
          requiredRoles: ['admin']
        },
        { 
          name: 'Profile', 
          path: '/profile',
          icon: User,
          menuKey: 'profile',
          onClick: handleProfileClick,
          requiredRoles: ['admin', 'manager', 'employee', 'hr', 'teamlead']
        },
        { 
          name: 'Settings', 
          path: '/settings',
          icon: Settings,
          menuKey: 'settings',
          onClick: handleSettingsClick,
          requiredRoles: ['admin', 'manager', 'employee', 'hr', 'teamlead']
        }
      ]
    }
  ];

  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && (
        <div 
          className="lg:hidden fixed inset-0 bg-black/50 z-40"
          onClick={onClose}
        />
      )}
      
      {/* Sidebar */}
      <div className={`fixed inset-y-0 left-0 z-50 w-64 bg-slate-900/95 backdrop-blur-xl border-r border-slate-700/50 shadow-2xl overflow-hidden transform transition-transform duration-300 ease-in-out lg:translate-x-0 ${
        isOpen ? 'translate-x-0' : '-translate-x-full'
      }`}>
        <div className="flex flex-col h-full">
          {/* Logo/Brand Section */}
          <div className="p-6 border-b border-slate-700/50 flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-br from-teal-500 to-teal-600 rounded-xl flex items-center justify-center shadow-lg">
                <span className="text-white font-bold text-xl">A</span>
              </div>
              <div>
                <h1 className="text-xl font-bold text-white">Ascentia</h1>
                <p className="text-xs text-slate-400">HR Management System</p>
              </div>
            </div>
            {/* Mobile Close Button */}
            <button
              onClick={onClose}
              className="lg:hidden p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-slate-700 scrollbar-track-slate-900 py-4">
            {navSections.map((section, index) => {
              const accessibleItems = section.items.filter(hasAccess);
              
              if (accessibleItems.length === 0) return null;
              
              return (
                <div key={index} className="mb-8">
                  <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3 px-3">
                    {section.title}
                  </h3>
                  <ul className="space-y-1">
                {accessibleItems.map((item) => {
                  const Icon = item.icon;
                  const active = item.path ? isActive(item.path) : false;
                  
                  return (
                    <li key={item.path || item.name}>
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
                          to={item.path || '#'}
                          onClick={() => {
                            if (onClose) onClose();
                          }}
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
      </div>
    </>
  );
};

export default Sidebar;