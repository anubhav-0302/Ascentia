import React, { useState, useEffect, useRef } from 'react';
import { useDebounce } from '../hooks/useDebounce';

interface SearchResult {
  id: string;
  type: 'employee' | 'leave' | 'document' | 'action';
  title: string;
  description: string;
  metadata?: {
    department?: string;
    status?: string;
    date?: string;
    priority?: 'high' | 'medium' | 'low';
  };
  url: string;
  avatar?: string;
}

const GlobalSearch: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const searchRef = useRef<HTMLDivElement>(null);
  const debouncedQuery = useDebounce(query, 300);

  // Mock search data
  const mockData: SearchResult[] = [
    {
      id: '1',
      type: 'employee',
      title: 'Sarah Chen',
      description: 'Senior Frontend Developer • Engineering',
      metadata: {
        department: 'Engineering',
        status: 'Active'
      },
      url: '/profile/1',
      avatar: 'https://picsum.photos/seed/sarah/32/32.jpg'
    },
    {
      id: '2',
      type: 'employee',
      title: 'Michael Brown',
      description: 'Engineering Manager • Engineering',
      metadata: {
        department: 'Engineering',
        status: 'Active'
      },
      url: '/profile/2',
      avatar: 'https://picsum.photos/seed/michael/32/32.jpg'
    },
    {
      id: '3',
      type: 'leave',
      title: 'Vacation Request',
      description: 'Sarah Chen • Dec 25-30, 2024',
      metadata: {
        status: 'Pending',
        date: '2024-12-20',
        priority: 'medium'
      },
      url: '/leave-attendance'
    },
    {
      id: '4',
      type: 'document',
      title: 'Employment Contract',
      description: 'John Davis • Uploaded Jan 15, 2024',
      metadata: {
        date: '2024-01-15'
      },
      url: '/profile/john'
    },
    {
      id: '5',
      type: 'action',
      title: 'Performance Review',
      description: 'Complete Q4 reviews for Engineering team',
      metadata: {
        priority: 'high',
        date: '2024-12-15'
      },
      url: '/performance'
    },
    {
      id: '6',
      type: 'employee',
      title: 'Emma Wilson',
      description: 'Frontend Developer • Engineering',
      metadata: {
        department: 'Engineering',
        status: 'Active'
      },
      url: '/profile/3',
      avatar: 'https://picsum.photos/seed/emma/32/32.jpg'
    }
  ];

  useEffect(() => {
    // Load recent searches from localStorage
    const saved = localStorage.getItem('recentSearches');
    if (saved) {
      setRecentSearches(JSON.parse(saved));
    }
  }, []);

  useEffect(() => {
    if (debouncedQuery) {
      performSearch(debouncedQuery);
    } else {
      setResults([]);
    }
  }, [debouncedQuery]);

  useEffect(() => {
    // Close dropdown when clicking outside
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const performSearch = async (searchQuery: string) => {
    setLoading(true);
    
    // Simulate API call
    setTimeout(() => {
      const filtered = mockData.filter(item =>
        item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.metadata?.department?.toLowerCase().includes(searchQuery.toLowerCase())
      );
      
      setResults(filtered);
      setLoading(false);
    }, 300);
  };

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
    // In a real app, you'd navigate to the result URL
    console.log('Navigate to:', result.url);
  };

  const getSearchIcon = (type: SearchResult['type']) => {
    const iconClasses = 'w-4 h-4';
    
    switch (type) {
      case 'employee':
        return <i className={`fas fa-user text-blue-400 ${iconClasses}`}></i>;
      case 'leave':
        return <i className={`fas fa-calendar text-green-400 ${iconClasses}`}></i>;
      case 'document':
        return <i className={`fas fa-file text-purple-400 ${iconClasses}`}></i>;
      case 'action':
        return <i className={`fas fa-tasks text-orange-400 ${iconClasses}`}></i>;
      default:
        return <i className={`fas fa-search text-gray-400 ${iconClasses}`}></i>;
    }
  };

  const getPriorityColor = (priority?: string) => {
    switch (priority) {
      case 'high':
        return 'text-red-400 bg-red-400/10 border-red-400/30';
      case 'medium':
        return 'text-yellow-400 bg-yellow-400/10 border-yellow-400/30';
      case 'low':
        return 'text-green-400 bg-green-400/10 border-green-400/30';
      default:
        return '';
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
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onFocus={() => setIsOpen(true)}
            placeholder="Search employees, leaves, documents..."
            className="w-64 md:w-80 lg:w-96 px-4 py-2 pl-10 bg-slate-700/50 border border-slate-600/50 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all duration-200"
          />
          <i className="fas fa-search absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"></i>
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
                    <i className="fas fa-users text-blue-400 text-sm"></i>
                    <span className="text-sm">Employees</span>
                  </button>
                  <button
                    onClick={() => setQuery('leave')}
                    className="flex items-center space-x-2 p-2 text-left text-gray-300 hover:text-white hover:bg-slate-700/50 rounded-lg transition-all duration-200"
                  >
                    <i className="fas fa-calendar text-green-400 text-sm"></i>
                    <span className="text-sm">Leave Requests</span>
                  </button>
                  <button
                    onClick={() => setQuery('documents')}
                    className="flex items-center space-x-2 p-2 text-left text-gray-300 hover:text-white hover:bg-slate-700/50 rounded-lg transition-all duration-200"
                  >
                    <i className="fas fa-file text-purple-400 text-sm"></i>
                    <span className="text-sm">Documents</span>
                  </button>
                  <button
                    onClick={() => setQuery('actions')}
                    className="flex items-center space-x-2 p-2 text-left text-gray-300 hover:text-white hover:bg-slate-700/50 rounded-lg transition-all duration-200"
                  >
                    <i className="fas fa-tasks text-orange-400 text-sm"></i>
                    <span className="text-sm">Actions</span>
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
                      {/* Icon or Avatar */}
                      <div className="flex-shrink-0 mt-0.5">
                        {result.avatar ? (
                          <img
                            src={result.avatar}
                            alt={result.title}
                            className="w-8 h-8 rounded-full border border-slate-600"
                          />
                        ) : (
                          <div className="w-8 h-8 bg-slate-700/50 rounded-lg flex items-center justify-center">
                            {getSearchIcon(result.type)}
                          </div>
                        )}
                      </div>

                      {/* Content */}
                      <div className="flex-1 min-w-0 text-left">
                        <div className="flex items-center space-x-2 mb-1">
                          <h4 className="text-sm font-medium text-white truncate">
                            {result.title}
                          </h4>
                          {result.metadata?.priority && (
                            <span className={`px-1.5 py-0.5 text-xs rounded border ${getPriorityColor(result.metadata.priority)}`}>
                              {result.metadata.priority}
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-gray-400 mb-1">{result.description}</p>
                        
                        {/* Metadata */}
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
                          {result.metadata?.date && (
                            <span className="text-gray-500">
                              <i className="fas fa-calendar mr-1"></i>
                              {new Date(result.metadata.date).toLocaleDateString()}
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Type Badge */}
                      <div className="flex-shrink-0">
                        <span className="px-2 py-1 bg-slate-600/50 text-gray-300 text-xs rounded">
                          {result.type}
                        </span>
                      </div>
                    </button>
                  ))}
                </div>
              ) : (
                <div className="p-8 text-center">
                  <i className="fas fa-search text-gray-500 text-3xl mb-3"></i>
                  <p className="text-gray-400">No results found for "{query}"</p>
                  <p className="text-gray-500 text-sm mt-1">Try different keywords or check spelling</p>
                </div>
              )}
            </>
          )}

          {/* Footer */}
          {query && !loading && (
            <div className="p-3 border-t border-slate-700/50">
              <button className="w-full text-center text-sm text-teal-400 hover:text-teal-300 transition-colors duration-200">
                Advanced Search →
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default GlobalSearch;
