import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useDebounce } from '../hooks/useDebounce';
import { useNavigate } from 'react-router-dom';
import { employeeApi } from '../api/employeeApi';
import { Search, Users, Calendar, Settings, Home, UserPlus, BarChart3 } from 'lucide-react';

interface SearchResult {
  id: string;
  type: 'employee' | 'page' | 'action';
  title: string;
  description: string;
  metadata?: {
    department?: string;
    status?: string;
    email?: string;
    icon?: React.ReactNode;
  };
  url: string;
  action?: () => void;
}

const HeaderSearch: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const searchRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();
  const debouncedQuery = useDebounce(query, 300);

  useEffect(() => {
    const saved = localStorage.getItem('recentSearches');
    if (saved) setRecentSearches(JSON.parse(saved));
  }, []);

  useEffect(() => {
    if (debouncedQuery) performSearch(debouncedQuery);
    else setResults([]);
  }, [debouncedQuery]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const performSearch = useCallback(async (searchQuery: string) => {
    setLoading(true);
    try {
      const q = searchQuery.toLowerCase();
      const allResults: SearchResult[] = [];

      // Search employees
      const res = await employeeApi.getEmployees();
      const employees = res.data || [];
      const employeeResults = employees
        .filter((e: any) =>
          e.name?.toLowerCase().includes(q) ||
          e.email?.toLowerCase().includes(q) ||
          e.jobTitle?.toLowerCase().includes(q) ||
          e.department?.toLowerCase().includes(q) ||
          e.status?.toLowerCase().includes(q)
        )
        .slice(0, 6)
        .map((e: any) => ({
          id: `employee-${e.id}`,
          type: 'employee' as const,
          title: e.name,
          description: `${e.jobTitle} • ${e.department}`,
          metadata: { department: e.department, status: e.status, email: e.email },
          url: '/directory'
        }));

      // Search pages
      const pages = [
        { id: 'dashboard', title: 'Dashboard', description: 'Overview and analytics', url: '/dashboard', icon: <Home className="w-4 h-4" /> },
        { id: 'directory', title: 'Employee Directory', description: 'Browse all employees', url: '/directory', icon: <Users className="w-4 h-4" /> },
        { id: 'leave', title: 'Leave Management', description: 'Request and approve leave', url: '/leave-attendance', icon: <Calendar className="w-4 h-4" /> },
        { id: 'reports', title: 'Reports', description: 'View reports and analytics', url: '/reports', icon: <BarChart3 className="w-4 h-4" /> },
        { id: 'settings', title: 'Settings', description: 'Application settings', url: '/settings', icon: <Settings className="w-4 h-4" /> },
      ];

      const pageResults = pages
        .filter(page => 
          page.title.toLowerCase().includes(q) || 
          page.description.toLowerCase().includes(q)
        )
        .map(page => ({
          id: `page-${page.id}`,
          type: 'page' as const,
          title: page.title,
          description: page.description,
          metadata: { icon: page.icon },
          url: page.url
        }));

      // Add quick actions for common searches
      const actions = [];
      if (q.includes('add') || q.includes('employee')) {
        actions.push({
          id: 'action-add-employee',
          type: 'action' as const,
          title: 'Add Employee',
          description: 'Onboard new team member',
          metadata: { icon: <UserPlus className="w-4 h-4" /> },
          url: '/permission-management'
        });
      }

      allResults.push(...employeeResults, ...pageResults, ...actions);
      setResults(allResults.slice(0, 8));
    } catch {
      setResults([]);
    } finally {
      setLoading(false);
    }
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      // Add to recent searches
      const newRecent = [query, ...recentSearches.filter(s => s !== query)].slice(0, 5);
      setRecentSearches(newRecent);
      localStorage.setItem('recentSearches', JSON.stringify(newRecent));
    }
  };

  const handleResultClick = (result: SearchResult) => {
    setIsOpen(false);
    setQuery('');
    // Navigate to the result URL or execute action
    if (result.action) {
      result.action();
    } else {
      navigate(result.url);
    }
  };

  const getStatusColor = (status?: string) => {
    switch (status) {
      case 'Active':
        return 'text-green-400';
      case 'Pending':
        return 'text-yellow-400';
      case 'Approved':
        return 'text-blue-400';
      case 'Rejected':
        return 'text-red-400';
      default:
        return 'text-gray-400';
    }
  };

  return (
    <div className="relative" ref={searchRef}>
      {/* Search Input */}
      <form onSubmit={handleSearch} className="relative">
        <div className="relative">
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onFocus={() => setIsOpen(true)}
            placeholder="Search employees, pages..."
            className="w-64 md:w-80 lg:w-96 px-4 py-2 pl-10 bg-slate-700/50 border border-slate-600/50 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all duration-200"
          />
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          {query && (
            <button
              type="button"
              onClick={() => setQuery('')}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white transition-colors duration-200"
            >
              <i className="fas fa-times text-sm"></i>
            </button>
          )}
        </div>
      </form>

      {/* Search Dropdown */}
      {isOpen && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-slate-800/95 backdrop-blur-lg border border-slate-700/50 rounded-2xl shadow-2xl z-50 max-h-96 overflow-hidden animate-scaleIn">
          {/* Loading State */}
          {loading && (
            <div className="p-4 text-center">
              <i className="fas fa-spinner fa-spin text-teal-400 text-2xl mb-2"></i>
              <p className="text-gray-400 text-sm">Searching...</p>
            </div>
          )}

          {/* No Query State */}
          {!query && !loading && (
            <div className="p-4">
              <h3 className="text-sm font-semibold text-white mb-3">Recent Searches</h3>
              {recentSearches.length > 0 ? (
                <div className="space-y-2">
                  {recentSearches.map((search, index) => (
                    <button
                      key={index}
                      onClick={() => setQuery(search)}
                      className="flex items-center space-x-2 w-full p-2 text-left text-gray-300 hover:text-white hover:bg-slate-700/50 rounded-lg transition-all duration-200"
                    >
                      <i className="fas fa-history text-gray-500 text-sm"></i>
                      <span className="text-sm">{search}</span>
                    </button>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 text-sm">No recent searches</p>
              )}

              <div className="mt-4 pt-4 border-t border-slate-700/50">
                <h3 className="text-sm font-semibold text-white mb-2">Quick Access</h3>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => setQuery('employees')}
                    className="flex items-center space-x-2 p-2 text-left text-gray-300 hover:text-white hover:bg-slate-700/50 rounded-lg transition-all duration-200"
                  >
                    <Users className="w-4 h-4 text-blue-400" />
                    <span className="text-sm">Employees</span>
                  </button>
                  <button
                    onClick={() => setQuery('leave')}
                    className="flex items-center space-x-2 p-2 text-left text-gray-300 hover:text-white hover:bg-slate-700/50 rounded-lg transition-all duration-200"
                  >
                    <Calendar className="w-4 h-4 text-green-400" />
                    <span className="text-sm">Leave</span>
                  </button>
                  <button
                    onClick={() => setQuery('reports')}
                    className="flex items-center space-x-2 p-2 text-left text-gray-300 hover:text-white hover:bg-slate-700/50 rounded-lg transition-all duration-200"
                  >
                    <BarChart3 className="w-4 h-4 text-purple-400" />
                    <span className="text-sm">Reports</span>
                  </button>
                  <button
                    onClick={() => setQuery('add')}
                    className="flex items-center space-x-2 p-2 text-left text-gray-300 hover:text-white hover:bg-slate-700/50 rounded-lg transition-all duration-200"
                  >
                    <UserPlus className="w-4 h-4 text-orange-400" />
                    <span className="text-sm">Add</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Search Results */}
          {query && !loading && (
            <>
              {results.length > 0 ? (
                <div className="py-2">
                  <div className="px-4 py-2 text-xs text-gray-500 font-medium">
                    {results.length} {results.length === 1 ? 'result' : 'results'} found
                  </div>
                  {results.map((result) => (
                    <button
                      key={result.id}
                      onClick={() => handleResultClick(result)}
                      className="w-full px-4 py-3 flex items-start space-x-3 hover:bg-slate-700/50 transition-all duration-200"
                    >
                      {/* Icon */}
                      <div className="flex-shrink-0 mt-0.5">
                        {result.type === 'employee' ? (
                          <div className="w-8 h-8 bg-teal-500/20 rounded-full flex items-center justify-center">
                            <span className="text-sm font-bold text-teal-400">{result.title.charAt(0)}</span>
                          </div>
                        ) : (
                          <div className="w-8 h-8 bg-slate-600/50 rounded-lg flex items-center justify-center">
                            {result.metadata?.icon}
                          </div>
                        )}
                      </div>

                      {/* Content */}
                      <div className="flex-1 min-w-0 text-left">
                        <div className="flex items-center space-x-2 mb-1">
                          <h4 className="text-sm font-medium text-white truncate">
                            {result.title}
                          </h4>
                        </div>
                        <p className="text-xs text-gray-400 mb-1">{result.description}</p>
                        
                        {/* Metadata for employees */}
                        {result.type === 'employee' && (
                          <div className="flex items-center space-x-3 text-xs">
                            {result.metadata?.department && (
                              <span className="text-gray-500">
                                <i className="fas fa-building mr-1"></i>{result.metadata.department}
                              </span>
                            )}
                            {result.metadata?.status && (
                              <span className={getStatusColor(result.metadata.status)}>
                                <i className="fas fa-circle mr-1" style={{ fontSize: '6px' }}></i>
                                {result.metadata.status}
                              </span>
                            )}
                            {result.metadata?.email && (
                              <span className="text-gray-500">
                                <i className="fas fa-envelope mr-1"></i>
                                {result.metadata.email}
                              </span>
                            )}
                          </div>
                        )}
                      </div>

                      {/* Type Badge */}
                      <div className="flex-shrink-0">
                        <span className="px-2 py-1 bg-slate-600/50 text-gray-300 text-xs rounded capitalize">
                          {result.type}
                        </span>
                      </div>
                    </button>
                  ))}
                </div>
              ) : (
                <div className="p-8 text-center">
                  <Search className="w-12 h-12 text-gray-500 mx-auto mb-3" />
                  <p className="text-gray-400">No results found for "{query}"</p>
                  <p className="text-gray-500 text-sm mt-1">Try different keywords or check spelling</p>
                </div>
              )}
            </>
          )}

          {/* Footer */}
          {query && !loading && (
            <div className="p-3 border-t border-slate-700/50">
              <div className="text-center text-xs text-gray-500">
                Press <kbd className="px-1 py-0.5 bg-slate-700 rounded text-xs">⌘K</kbd> for Command Palette
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default HeaderSearch;
