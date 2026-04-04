import React, { useState, useEffect, useMemo } from 'react';
import { getEmployees, ApiError } from '../api/employeeApi';
import type { Employee } from '../api/employeeApi';

const Directory: React.FC = () => {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Filter states
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDepartment, setSelectedDepartment] = useState('');
  const [selectedLocation, setSelectedLocation] = useState('');

  useEffect(() => {
    const fetchEmployees = async () => {
      try {
        setLoading(true);
        setError(null);
        const employeesData = await getEmployees();
        setEmployees(employeesData);
      } catch (err) {
        console.error('Failed to fetch employees:', err);
        if (err instanceof ApiError) {
          setError(err.message);
        } else {
          setError('Failed to load employee data');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchEmployees();
  }, []);

  // Get unique departments and locations for filter options
  const filterOptions = useMemo(() => {
    const departments = [...new Set(employees.map(emp => emp.department))].sort();
    const locations = [...new Set(employees.map(emp => emp.location))].sort();
    return { departments, locations };
  }, [employees]);

  // Filter employees based on all filter criteria
  const filteredEmployees = useMemo(() => {
    return employees.filter(employee => {
      // Name search filter
      const matchesSearch = searchTerm === '' || 
        employee.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        employee.email.toLowerCase().includes(searchTerm.toLowerCase());
      
      // Department filter
      const matchesDepartment = selectedDepartment === '' || 
        employee.department === selectedDepartment;
      
      // Location filter
      const matchesLocation = selectedLocation === '' || 
        employee.location === selectedLocation;
      
      return matchesSearch && matchesDepartment && matchesLocation;
    });
  }, [employees, searchTerm, selectedDepartment, selectedLocation]);

  const handleRefresh = async () => {
    try {
      setLoading(true);
      setError(null);
      const employeesData = await getEmployees();
      setEmployees(employeesData);
    } catch (err) {
      console.error('Failed to refresh employees:', err);
      if (err instanceof ApiError) {
        setError(err.message);
      } else {
        setError('Failed to refresh employee data');
      }
    } finally {
      setLoading(false);
    }
  };

  const clearFilters = () => {
    setSearchTerm('');
    setSelectedDepartment('');
    setSelectedLocation('');
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'active':
        return 'text-green-400 bg-green-400/20';
      case 'inactive':
        return 'text-red-400 bg-red-400/20';
      case 'pending':
        return 'text-yellow-400 bg-yellow-400/20';
      default:
        return 'text-gray-400 bg-gray-400/20';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="flex flex-col items-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-500"></div>
          <p className="text-gray-400">Loading employee data...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center max-w-md">
          <div className="text-red-400 text-4xl mb-4">
            <i className="fas fa-exclamation-triangle"></i>
          </div>
          <h3 className="text-lg font-semibold text-white mb-2">Error Loading Data</h3>
          <p className="text-gray-400 mb-6">{error}</p>
          <button
            onClick={handleRefresh}
            className="px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors duration-200 flex items-center space-x-2 mx-auto"
          >
            <i className="fas fa-sync-alt"></i>
            <span>Retry</span>
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white">Employee Directory</h2>
          <p className="text-gray-400">Manage and view all employee information</p>
        </div>
        <div className="flex items-center space-x-3">
          <button
            onClick={handleRefresh}
            className="px-4 py-2 bg-slate-700/60 text-white rounded-lg hover:bg-slate-700/80 transition-colors duration-200 flex items-center space-x-2"
          >
            <i className="fas fa-sync-alt"></i>
            <span>Refresh</span>
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-slate-800/40 backdrop-blur-xl rounded-xl p-6 border border-slate-700/50">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">Total Employees</p>
              <p className="text-2xl font-bold text-white">{employees.length}</p>
            </div>
            <div className="text-blue-400 text-2xl">
              <i className="fas fa-users"></i>
            </div>
          </div>
        </div>
        <div className="bg-slate-800/40 backdrop-blur-xl rounded-xl p-6 border border-slate-700/50">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">Active</p>
              <p className="text-2xl font-bold text-white">
                {employees.filter(emp => emp.status.toLowerCase() === 'active').length}
              </p>
            </div>
            <div className="text-green-400 text-2xl">
              <i className="fas fa-user-check"></i>
            </div>
          </div>
        </div>
        <div className="bg-slate-800/40 backdrop-blur-xl rounded-xl p-6 border border-slate-700/50">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">Departments</p>
              <p className="text-2xl font-bold text-white">
                {new Set(employees.map(emp => emp.department)).size}
              </p>
            </div>
            <div className="text-purple-400 text-2xl">
              <i className="fas fa-building"></i>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-slate-800/40 backdrop-blur-xl rounded-xl p-6 border border-slate-700/50">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-white">Filters</h3>
          <button
            onClick={clearFilters}
            className="text-sm text-teal-400 hover:text-teal-300 transition-colors duration-200"
          >
            Clear All
          </button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Search Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Search</label>
            <div className="relative">
              <input
                type="text"
                placeholder="Search by name or email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-slate-700/60 text-white rounded-lg pl-10 pr-3 py-2 focus:outline-none focus:ring-2 focus:ring-teal-500 transition-all duration-300 border border-slate-600/50"
              />
              <i className="fas fa-search absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"></i>
            </div>
          </div>

          {/* Department Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Department</label>
            <select
              value={selectedDepartment}
              onChange={(e) => setSelectedDepartment(e.target.value)}
              className="w-full bg-slate-700/60 text-white rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-teal-500 transition-all duration-300 border border-slate-600/50"
            >
              <option value="">All Departments</option>
              {filterOptions.departments.map(dept => (
                <option key={dept} value={dept}>{dept}</option>
              ))}
            </select>
          </div>

          {/* Location Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Location</label>
            <select
              value={selectedLocation}
              onChange={(e) => setSelectedLocation(e.target.value)}
              className="w-full bg-slate-700/60 text-white rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-teal-500 transition-all duration-300 border border-slate-600/50"
            >
              <option value="">All Locations</option>
              {filterOptions.locations.map(location => (
                <option key={location} value={location}>{location}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Active Filters Display */}
        {(searchTerm || selectedDepartment || selectedLocation) && (
          <div className="mt-4 flex items-center space-x-2">
            <span className="text-sm text-gray-400">Active filters:</span>
            {searchTerm && (
              <span className="px-2 py-1 bg-teal-500/20 text-teal-400 text-xs rounded-full">
                Search: {searchTerm}
              </span>
            )}
            {selectedDepartment && (
              <span className="px-2 py-1 bg-teal-500/20 text-teal-400 text-xs rounded-full">
                Department: {selectedDepartment}
              </span>
            )}
            {selectedLocation && (
              <span className="px-2 py-1 bg-teal-500/20 text-teal-400 text-xs rounded-full">
                Location: {selectedLocation}
              </span>
            )}
            <span className="text-sm text-gray-400">
              ({filteredEmployees.length} results)
            </span>
          </div>
        )}
      </div>

      {/* Employee Table */}
      <div className="bg-slate-800/40 backdrop-blur-xl rounded-xl border border-slate-700/50 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-700/50 border-b border-slate-700/50">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                  Employee
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                  Job Title
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                  Department
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                  Location
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-700/30">
              {filteredEmployees.map((employee) => (
                <tr key={employee.id} className="hover:bg-slate-700/20 transition-colors duration-150">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <img
                        className="h-10 w-10 rounded-full border-2 border-slate-600"
                        src={`https://picsum.photos/seed/${employee.name.toLowerCase().replace(' ', '')}/40/40.jpg`}
                        alt={employee.name}
                      />
                      <div className="ml-4">
                        <div className="text-sm font-medium text-white">{employee.name}</div>
                        <div className="text-sm text-gray-400">{employee.email}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-white">{employee.jobTitle}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-300">{employee.department}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-300">{employee.location}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(employee.status)}`}>
                      {employee.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                    <button className="text-teal-400 hover:text-teal-300 mr-3">
                      <i className="fas fa-edit"></i>
                    </button>
                    <button className="text-red-400 hover:text-red-300">
                      <i className="fas fa-trash"></i>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {filteredEmployees.length === 0 && !loading && (
        <div className="text-center py-12">
          <div className="text-gray-400 text-4xl mb-4">
            <i className="fas fa-search"></i>
          </div>
          <h3 className="text-lg font-semibold text-white mb-2">No Employees Found</h3>
          <p className="text-gray-400">
            {employees.length === 0 
              ? 'No employee data is available at the moment.' 
              : 'No employees match your current filters. Try adjusting your search criteria.'
            }
          </p>
          {(searchTerm || selectedDepartment || selectedLocation) && (
            <button
              onClick={clearFilters}
              className="mt-4 px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors duration-200"
            >
              Clear Filters
            </button>
          )}
        </div>
      )}
    </div>
  );
};

export default Directory;
