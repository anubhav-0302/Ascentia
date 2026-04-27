import React, { useState, useRef, useEffect } from 'react';
import { useFilters } from '../contexts/FilterContext';
import { Search, Filter as FilterIcon, X, ChevronDown } from 'lucide-react';

interface FilterProps {
  showDepartment?: boolean;
  showStatus?: boolean;
  showDateRange?: boolean;
  showReportType?: boolean;
  showEmploymentType?: boolean;
  showLocation?: boolean;
  showSortOptions?: boolean;
  compact?: boolean;
}

const Filter: React.FC<FilterProps> = ({
  showDepartment = true,
  showStatus = true,
  showDateRange = false,
  showReportType = false,
  showEmploymentType = false,
  showLocation = false,
  showSortOptions = true,
  compact = true
}) => {
  const { filters, updateFilter, clearFilters, getActiveFilterCount } = useFilters();
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const [dropUpMap, setDropUpMap] = useState<{ [key: string]: boolean }>({});
  const dropdownRefs = useRef<{ [key: string]: HTMLDivElement | null }>({});

  const activeFilterCount = getActiveFilterCount();

  // Check if dropdown should open upward based on available viewport space
  useEffect(() => {
    if (openDropdown) {
      const el = dropdownRefs.current[openDropdown];
      if (el) {
        const rect = el.getBoundingClientRect();
        const spaceBelow = window.innerHeight - rect.bottom;
        // Estimate dropdown height: ~36px per option, max 240px (max-h-60)
        const estimatedHeight = Math.min(240, el.querySelectorAll('button').length * 36 || 150);
        setDropUpMap(prev => ({
          ...prev,
          [openDropdown]: spaceBelow < estimatedHeight && rect.top > estimatedHeight
        }));
      }
    }
  }, [openDropdown]);

  const departments = [
    { value: 'all', label: 'All Departments' },
    { value: 'engineering', label: 'Engineering' },
    { value: 'sales', label: 'Sales' },
    { value: 'marketing', label: 'Marketing' },
    { value: 'hr', label: 'HR' },
    { value: 'finance', label: 'Finance' },
    { value: 'operations', label: 'Operations' }
  ];

  const statuses = [
    { value: 'all', label: 'All Statuses' },
    { value: 'Active', label: 'Active' },
    { value: 'Onboarding', label: 'Onboarding' },
    { value: 'Remote', label: 'Remote' }
  ];

  const employmentTypes = [
    { value: 'all', label: 'All Types' },
    { value: 'full-time', label: 'Full Time' },
    { value: 'part-time', label: 'Part Time' },
    { value: 'contract', label: 'Contract' },
    { value: 'remote', label: 'Remote' }
  ];

  const locations = [
    { value: 'all', label: 'All Locations' },
    { value: 'new-york', label: 'New York' },
    { value: 'san-francisco', label: 'San Francisco' },
    { value: 'london', label: 'London' },
    { value: 'remote', label: 'Remote' }
  ];

  const dateRanges = [
    { value: 'all', label: 'All Time' },
    { value: 'today', label: 'Today' },
    { value: 'last-7-days', label: 'Last 7 Days' },
    { value: 'last-30-days', label: 'Last 30 Days' },
    { value: 'last-3-months', label: 'Last 3 Months' }
  ];

  const reportTypes = [
    { value: 'all', label: 'All Reports' },
    { value: 'performance', label: 'Performance' },
    { value: 'attendance', label: 'Attendance' },
    { value: 'financial', label: 'Financial' },
    { value: 'recruitment', label: 'Recruitment' }
  ];

  const sortOptions = [
    { value: 'name', label: 'Name' },
    { value: 'date', label: 'Date' },
    { value: 'status', label: 'Status' },
    { value: 'department', label: 'Department' }
  ];

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (openDropdown) {
        const dropdown = dropdownRefs.current[openDropdown];
        if (dropdown && !dropdown.contains(event.target as Node)) {
          setOpenDropdown(null);
        }
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [openDropdown]);

  // Handle dropdown toggle
  const handleDropdownToggle = (filterType: string) => {
    setOpenDropdown(openDropdown === filterType ? null : filterType);
  };

  const getFilterPills = () => {
    const pills = [];

    if (filters.search && filters.search.trim()) {
      pills.push({
        key: 'search',
        label: `Search: ${filters.search}`,
        onRemove: () => updateFilter('search', '')
      });
    }

    return pills;
  };

  const getActiveFilterLabel = (filterType: string) => {
    switch (filterType) {
      case 'department':
        if (filters.department && filters.department !== 'all') {
          const dept = departments.find(d => d.value === filters.department);
          return dept?.label || filters.department;
        }
        return 'Department';
      case 'status':
        if (filters.status && filters.status !== 'all') {
          const status = statuses.find(s => s.value === filters.status);
          return status?.label || filters.status;
        }
        return 'Status';
      case 'employmentType':
        if (filters.employmentType && filters.employmentType !== 'all') {
          const empType = employmentTypes.find(e => e.value === filters.employmentType);
          return empType?.label || filters.employmentType;
        }
        return 'Employment Type';
      case 'location':
        if (filters.location && filters.location !== 'all') {
          const location = locations.find(l => l.value === filters.location);
          return location?.label || filters.location;
        }
        return 'Location';
      case 'dateRange':
        if (filters.dateRange && filters.dateRange !== 'all') {
          const dateRange = dateRanges.find(d => d.value === filters.dateRange);
          return dateRange?.label || filters.dateRange;
        }
        return 'Date Range';
      case 'reportType':
        if (filters.reportType && filters.reportType !== 'all') {
          const reportType = reportTypes.find(r => r.value === filters.reportType);
          return reportType?.label || filters.reportType;
        }
        return 'Report Type';
      case 'sortBy':
        if (filters.sortBy && filters.sortBy !== 'name') {
          const sortOption = sortOptions.find(s => s.value === filters.sortBy);
          return sortOption?.label || filters.sortBy;
        }
        return 'Sort';
      default:
        return filterType;
    }
  };

  const isFilterActive = (filterType: string) => {
    switch (filterType) {
      case 'department':
        return filters.department && filters.department !== 'all';
      case 'status':
        return filters.status && filters.status !== 'all';
      case 'employmentType':
        return filters.employmentType && filters.employmentType !== 'all';
      case 'location':
        return filters.location && filters.location !== 'all';
      case 'dateRange':
        return filters.dateRange && filters.dateRange !== 'all';
      case 'reportType':
        return filters.reportType && filters.reportType !== 'all';
      case 'sortBy':
        return filters.sortBy && filters.sortBy !== 'name';
      default:
        return false;
    }
  };

  const getCurrentValue = (filterType: string) => {
    switch (filterType) {
      case 'department':
        return filters.department || 'all';
      case 'status':
        return filters.status || 'all';
      case 'employmentType':
        return filters.employmentType || 'all';
      case 'location':
        return filters.location || 'all';
      case 'dateRange':
        return filters.dateRange || 'all';
      case 'reportType':
        return filters.reportType || 'all';
      case 'sortBy':
        return filters.sortBy || 'name';
      default:
        return 'all';
    }
  };

  const handleFilterSelect = (filterType: string, value: string) => {
    updateFilter(filterType as any, value);
    setOpenDropdown(null);
  };

  const getDropdownClass = (key: string) => {
    const base = 'absolute left-0 z-[99999] bg-slate-800 border border-slate-600/50 rounded-lg shadow-2xl min-w-max';
    const position = dropUpMap[key] ? 'bottom-full mb-1' : 'top-full mt-1';
    return `${base} ${position}`;
  };

  const filterPills = getFilterPills();

  if (compact) {
    return (
      <div className="bg-slate-800/60 backdrop-blur-lg border border-slate-700/50 rounded-2xl p-4 mb-6 relative z-10">
        <div className="flex flex-col space-y-4 overflow-visible">
          {/* Search Bar */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Search employees..."
              value={filters.search}
              onChange={(e) => updateFilter('search', e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-slate-700/50 border border-slate-600/50 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-teal-500/50 focus:border-teal-500/50 transition-all duration-200"
            />
          </div>

          {/* Active Filter Pills */}
          {filterPills.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {filterPills.map((pill) => (
                <div
                  key={pill.key}
                  className="inline-flex items-center gap-1 px-3 py-1 bg-teal-500/20 text-teal-300 border border-teal-500/30 rounded-full text-sm"
                >
                  <span>{pill.label}</span>
                  <button
                    onClick={pill.onRemove}
                    className="ml-1 hover:text-white transition-colors"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* Filter Header Pills with Dropdowns */}
          <div className="flex flex-wrap gap-2 relative overflow-visible">
            {showDepartment && (
              <div
                ref={(el) => { dropdownRefs.current['department'] = el; }}
                className="relative"
              >
                <button
                  onClick={() => handleDropdownToggle('department')}
                  className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm transition-all duration-200 ${
                    isFilterActive('department')
                      ? 'bg-blue-500/20 text-blue-300 border border-blue-500/30'
                      : 'bg-slate-700/30 text-gray-400 hover:bg-slate-700/50 hover:text-white'
                  }`}
                >
                  <span>{getActiveFilterLabel('department')}</span>
                  <ChevronDown className="w-3 h-3" />
                </button>

                {openDropdown === 'department' && (
                  <div className={getDropdownClass('department')}>
                    <div className="max-h-60 overflow-y-auto">
                      {departments.map((dept) => (
                        <button
                          key={dept.value}
                          onClick={() => handleFilterSelect('department', dept.value)}
                          className={`block w-full px-4 py-2 text-left text-sm hover:bg-slate-700/50 transition-colors ${
                            getCurrentValue('department') === dept.value
                              ? 'bg-blue-500/20 text-blue-300'
                              : 'text-gray-300 hover:text-white'
                          }`}
                        >
                          {dept.label}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {showStatus && (
              <div
                ref={(el) => { dropdownRefs.current['status'] = el; }}
                className="relative"
              >
                <button
                  onClick={() => handleDropdownToggle('status')}
                  className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm transition-all duration-200 ${
                    isFilterActive('status')
                      ? 'bg-green-500/20 text-green-300 border border-green-500/30'
                      : 'bg-slate-700/30 text-gray-400 hover:bg-slate-700/50 hover:text-white'
                  }`}
                >
                  <span>{getActiveFilterLabel('status')}</span>
                  <ChevronDown className="w-3 h-3" />
                </button>

                {openDropdown === 'status' && (
                  <div className={getDropdownClass('status')}>
                    <div className="max-h-60 overflow-y-auto">
                      {statuses.map((status) => (
                        <button
                          key={status.value}
                          onClick={() => handleFilterSelect('status', status.value)}
                          className={`block w-full px-4 py-2 text-left text-sm hover:bg-slate-700/50 transition-colors ${
                            getCurrentValue('status') === status.value
                              ? 'bg-green-500/20 text-green-300'
                              : 'text-gray-300 hover:text-white'
                          }`}
                        >
                          {status.label}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {showEmploymentType && (
              <div
                ref={(el) => { dropdownRefs.current['employmentType'] = el; }}
                className="relative"
              >
                <button
                  onClick={() => handleDropdownToggle('employmentType')}
                  className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm transition-all duration-200 ${
                    isFilterActive('employmentType')
                      ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30'
                      : 'bg-slate-700/30 text-gray-400 hover:bg-slate-700/50 hover:text-white'
                  }`}
                >
                  <span>{getActiveFilterLabel('employmentType')}</span>
                  <ChevronDown className="w-3 h-3" />
                </button>

                {openDropdown === 'employmentType' && (
                  <div className={getDropdownClass('employmentType')}>
                    <div className="max-h-60 overflow-y-auto">
                      {employmentTypes.map((type) => (
                        <button
                          key={type.value}
                          onClick={() => handleFilterSelect('employmentType', type.value)}
                          className={`block w-full px-4 py-2 text-left text-sm hover:bg-slate-700/50 transition-colors ${
                            getCurrentValue('employmentType') === type.value
                              ? 'bg-purple-500/20 text-purple-300'
                              : 'text-gray-300 hover:text-white'
                          }`}
                        >
                          {type.label}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {showLocation && (
              <div
                ref={(el) => { dropdownRefs.current['location'] = el; }}
                className="relative"
              >
                <button
                  onClick={() => handleDropdownToggle('location')}
                  className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm transition-all duration-200 ${
                    isFilterActive('location')
                      ? 'bg-orange-500/20 text-orange-300 border border-orange-500/30'
                      : 'bg-slate-700/30 text-gray-400 hover:bg-slate-700/50 hover:text-white'
                  }`}
                >
                  <span>{getActiveFilterLabel('location')}</span>
                  <ChevronDown className="w-3 h-3" />
                </button>

                {openDropdown === 'location' && (
                  <div className={getDropdownClass('location')}>
                    <div className="max-h-60 overflow-y-auto">
                      {locations.map((location) => (
                        <button
                          key={location.value}
                          onClick={() => handleFilterSelect('location', location.value)}
                          className={`block w-full px-4 py-2 text-left text-sm hover:bg-slate-700/50 transition-colors ${
                            getCurrentValue('location') === location.value
                              ? 'bg-orange-500/20 text-orange-300'
                              : 'text-gray-300 hover:text-white'
                          }`}
                        >
                          {location.label}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {showDateRange && (
              <div
                ref={(el) => { dropdownRefs.current['dateRange'] = el; }}
                className="relative"
              >
                <button
                  onClick={() => handleDropdownToggle('dateRange')}
                  className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm transition-all duration-200 ${
                    isFilterActive('dateRange')
                      ? 'bg-yellow-500/20 text-yellow-300 border border-yellow-500/30'
                      : 'bg-slate-700/30 text-gray-400 hover:bg-slate-700/50 hover:text-white'
                  }`}
                >
                  <span>{getActiveFilterLabel('dateRange')}</span>
                  <ChevronDown className="w-3 h-3" />
                </button>

                {openDropdown === 'dateRange' && (
                  <div className={getDropdownClass('dateRange')}>
                    <div className="max-h-60 overflow-y-auto">
                      {dateRanges.map((range) => (
                        <button
                          key={range.value}
                          onClick={() => handleFilterSelect('dateRange', range.value)}
                          className={`block w-full px-4 py-2 text-left text-sm hover:bg-slate-700/50 transition-colors ${
                            getCurrentValue('dateRange') === range.value
                              ? 'bg-yellow-500/20 text-yellow-300'
                              : 'text-gray-300 hover:text-white'
                          }`}
                        >
                          {range.label}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {showReportType && (
              <div
                ref={(el) => { dropdownRefs.current['reportType'] = el; }}
                className="relative"
              >
                <button
                  onClick={() => handleDropdownToggle('reportType')}
                  className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm transition-all duration-200 ${
                    isFilterActive('reportType')
                      ? 'bg-pink-500/20 text-pink-300 border border-pink-500/30'
                      : 'bg-slate-700/30 text-gray-400 hover:bg-slate-700/50 hover:text-white'
                  }`}
                >
                  <span>{getActiveFilterLabel('reportType')}</span>
                  <ChevronDown className="w-3 h-3" />
                </button>

                {openDropdown === 'reportType' && (
                  <div className={getDropdownClass('reportType')}>
                    <div className="max-h-60 overflow-y-auto">
                      {reportTypes.map((type) => (
                        <button
                          key={type.value}
                          onClick={() => handleFilterSelect('reportType', type.value)}
                          className={`block w-full px-4 py-2 text-left text-sm hover:bg-slate-700/50 transition-colors ${
                            getCurrentValue('reportType') === type.value
                              ? 'bg-pink-500/20 text-pink-300'
                              : 'text-gray-300 hover:text-white'
                          }`}
                        >
                          {type.label}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {showSortOptions && (
              <div
                ref={(el) => { dropdownRefs.current['sortBy'] = el; }}
                className="relative"
              >
                <button
                  onClick={() => handleDropdownToggle('sortBy')}
                  className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm transition-all duration-200 ${
                    isFilterActive('sortBy')
                      ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/30'
                      : 'bg-slate-700/30 text-gray-400 hover:bg-slate-700/50 hover:text-white'
                  }`}
                >
                  <span>{getActiveFilterLabel('sortBy')}</span>
                  <ChevronDown className="w-3 h-3" />
                </button>

                {openDropdown === 'sortBy' && (
                  <div className={getDropdownClass('sortBy')}>
                    <div className="max-h-60 overflow-y-auto">
                      {sortOptions.map((option) => (
                        <button
                          key={option.value}
                          onClick={() => handleFilterSelect('sortBy', option.value)}
                          className={`block w-full px-4 py-2 text-left text-sm hover:bg-slate-700/50 transition-colors ${
                            getCurrentValue('sortBy') === option.value
                              ? 'bg-indigo-500/20 text-indigo-300'
                              : 'text-gray-300 hover:text-white'
                          }`}
                        >
                          {option.label}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Clear Filters Button */}
            {activeFilterCount > 0 && (
              <button
                onClick={clearFilters}
                className="px-3 py-1 bg-red-500/20 text-red-300 border border-red-500/30 rounded-full text-sm hover:bg-red-500/30 transition-all duration-200"
              >
                Clear All
              </button>
            )}
          </div>

          {/* Filter Status */}
          {activeFilterCount > 0 && (
            <div className="flex items-center justify-between text-xs text-gray-500">
              <span>{activeFilterCount} filter{activeFilterCount !== 1 ? 's' : ''} active</span>
            </div>
          )}
        </div>
      </div>
    );
  }

  // Original expanded filter interface (non-compact)
  return (
    <div className="bg-slate-800/60 backdrop-blur-lg border border-slate-700/50 rounded-2xl p-6 mb-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-white flex items-center">
          <FilterIcon className="w-5 h-5 mr-2 text-teal-400" />
          Filters
          {activeFilterCount > 0 && (
            <span className="ml-2 px-2 py-1 bg-teal-500/20 text-teal-300 text-xs rounded-full">
              {activeFilterCount}
            </span>
          )}
        </h3>
        <button
          onClick={clearFilters}
          className="text-sm text-gray-400 hover:text-white transition-colors"
        >
          Clear All
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Search */}
        <div>
          <label className="block text-sm font-medium text-gray-400 mb-2">Search</label>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Search..."
              value={filters.search}
              onChange={(e) => updateFilter('search', e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-slate-700/50 border border-slate-600/50 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-teal-500/50 focus:border-teal-500/50"
            />
          </div>
        </div>

        {/* Other filter fields would go here */}
      </div>
    </div>
  );
};

export default Filter;
