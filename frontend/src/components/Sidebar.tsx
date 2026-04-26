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
  Building2,
  User,
  Clock,
  Target,
  Database,
  Shield,
  Crown,
  HardDrive,
  FolderKanban
} from 'lucide-react';
import { useAuthStore } from '../store/useAuthStore';
import { getSidebarPermissions } from '../api/roleManagementApi';
import { SIDEBAR_MENU_ITEMS } from '../constants/menuItems';

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
  // Skip for SuperAdmin - they have access to everything
  useEffect(() => {
    const loadSidebarPermissions = async () => {
      // SuperAdmin doesn't need permission checks
      if (userRole === 'superadmin') {
        setSidebarPermissions({}); // Empty object means all items accessible
        return;
      }
      
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
  }, [token, location.pathname, userRole]);

  const handleProfileClick = () => {
    navigate('/profile');
  };

  const handleSettingsClick = () => {
    navigate('/settings');
  };

  // Check if user has access to a nav item
  const hasAccess = (item: NavItem): boolean => {
    // SuperAdmin has access to everything - no permission checks needed
    if (userRole === 'superadmin') {
      return true;
    }

    // If permissions loaded and item has menuKey, check database.
    // If the key is missing from DB (undefined), fall back to hardcoded
    // requiredRoles so the sidebar still shows items based on role.
    if (sidebarPermissions !== null && item.menuKey) {
      const dbValue = sidebarPermissions[item.menuKey];
      // Explicit false in DB = hidden; undefined/null = fall back to hardcoded roles
      if (dbValue === false) return false;
      if (dbValue === true) return true;
      // Undefined: use hardcoded requiredRoles as fallback
      return item.requiredRoles ? item.requiredRoles.includes(userRole) : false;
    }

    // While loading (sidebarPermissions is null), show based on hardcoded rules temporarily
    if (sidebarPermissions === null && item.requiredRoles) {
      return item.requiredRoles.includes(userRole);
    }

    return false;
  };

  // Icon mapping for menu items
  const iconMap: { [key: string]: any } = {
    'dashboard': LayoutDashboard,
    'command-center': Command,
    'workflow-hub': GitBranch,
    'my-team': Users,
    'directory': Building,
    'leave-attendance': Calendar,
    'timesheet-entry': Clock,
    'performance-goals': Target,
    'payroll-benefits': DollarSign,
    'project-management': FolderKanban,
    'recruiting': UserCheck,
    'reports': FileText,
    'audit-logs': Database,
    'permission-management': Users,
    'role-management': Shield,
    'profile': User,
    'settings': Settings
  };

  // Path mapping for menu items
  const pathMap: { [key: string]: string } = {
    'dashboard': '/dashboard',
    'command-center': '/command-center',
    'workflow-hub': '/workflow-hub',
    'my-team': '/my-team',
    'directory': '/directory',
    'leave-attendance': '/leave-attendance',
    'timesheet-entry': '/timesheet-entry',
    'performance-goals': '/performance-goals',
    'payroll-benefits': '/payroll-benefits',
    'project-management': '/project-management',
    'recruiting': '/recruiting',
    'reports': '/reports',
    'audit-logs': '/audit-logs',
    'permission-management': '/permission-management',
    'role-management': '/role-management',
    'profile': '/profile',
    'settings': '/settings'
  };

  // Build navigation sections from centralized config
  const navSections: NavSection[] = [
    {
      title: 'MAIN',
      items: ['dashboard', 'command-center', 'workflow-hub'].map(key => ({
        name: SIDEBAR_MENU_ITEMS[key].label,
        path: pathMap[key],
        icon: iconMap[key],
        menuKey: key,
        requiredRoles: SIDEBAR_MENU_ITEMS[key].requiredRoles
      }))
    },
    {
      title: 'HR',
      items: ['my-team', 'directory', 'leave-attendance', 'timesheet-entry', 'performance-goals', 'payroll-benefits', 'project-management', 'recruiting', 'reports'].map(key => ({
        name: SIDEBAR_MENU_ITEMS[key].label,
        path: pathMap[key],
        icon: iconMap[key],
        menuKey: key,
        requiredRoles: SIDEBAR_MENU_ITEMS[key].requiredRoles
      }))
    },
    {
      title: 'CONFIGURE',
      items: ['audit-logs', 'permission-management', 'role-management', 'profile', 'settings'].map(key => {
        const item = {
          name: SIDEBAR_MENU_ITEMS[key].label,
          path: pathMap[key],
          icon: iconMap[key],
          menuKey: key,
          requiredRoles: SIDEBAR_MENU_ITEMS[key].requiredRoles
        };
        if (key === 'profile') {
          (item as any).onClick = handleProfileClick;
        }
        if (key === 'settings') {
          (item as any).onClick = handleSettingsClick;
        }
        return item;
      })
    }
  ];

  // Platform-owner focused nav for SuperAdmin. Intentionally does NOT include
  // org-scoped HR screens (timesheet, leaves, payroll, etc.). SuperAdmin
  // operates at the platform level; to see org-scoped data they use the
  // org switcher in the header (sets X-Organization-Id and navigates in).
  const superAdminSections: NavSection[] = [
    {
      title: 'PLATFORM',
      items: [
        { name: 'Platform Dashboard', path: '/superadmin',        icon: Crown },
        { name: 'Organizations',      path: '/organizations',     icon: Building2 },
        { name: 'Org Admins',         path: '/superadmin/admins', icon: Shield },
        { name: 'Platform Audit Logs',path: '/audit-logs',        icon: Database },
        { name: 'Data Protection',    path: '/data-protection',   icon: HardDrive },
      ],
    },
    {
      title: 'ACCOUNT',
      items: [
        { name: 'Profile',  path: '/profile',  icon: User,     onClick: handleProfileClick },
        { name: 'Settings', path: '/settings', icon: Settings, onClick: handleSettingsClick },
      ],
    },
  ];

  // Decide which nav the user sees. SuperAdmin gets its own focused tree.
  const sectionsToRender = userRole === 'superadmin' ? superAdminSections : navSections;

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
            {sectionsToRender.map((section, index) => {
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