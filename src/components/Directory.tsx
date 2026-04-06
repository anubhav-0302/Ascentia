import React, { useState, useEffect, useMemo } from "react";
import { useEmployeeStore } from "../store/useEmployeeStore";
import { useDebounce } from "../hooks/useDebounce";

function getStatusBadge(status: string) {
  const statusConfig = {
    Active: "bg-green-400/20 text-green-400 border-green-400/30",
    Onboarding: "bg-yellow-400/20 text-yellow-400 border-yellow-400/30",
    Remote: "bg-blue-400/20 text-blue-400 border-blue-400/30",
  };

  const dotColor = {
    Active: "bg-green-400",
    Onboarding: "bg-yellow-400",
    Remote: "bg-blue-400",
  };

  const configClass = statusConfig[status] || statusConfig["Active"];
  const dotClass = dotColor[status] || dotColor["Active"];

  return (
    <span className={"inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border " + configClass}>
      <span className={"w-2 h-2 rounded-full " + dotClass + " mr-2"}></span>
      {status}
    </span>
  );
}

function Directory() {
  // DEBUG: Log store usage
  console.log("Directory component rendering");
  
  // Correctly use Zustand store - get everything from the store
  const { employees, loading, error, fetchEmployees } = useEmployeeStore();
  
  // DEBUG: Log employees data
  console.log("employees:", employees);
  console.log("loading:", loading);
  console.log("error:", error);

  // Local state for filters
  const [searchTerm, setSearchTerm] = useState("");
  const [departmentFilter, setDepartmentFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");

  // Debounced search term
  const debouncedSearchTerm = useDebounce(searchTerm, 300);

  // ENSURE fetchEmployees IS CALLED on component mount
  useEffect(() => {
    console.log("Directory useEffect - calling fetchEmployees");
    fetchEmployees();
  }, [fetchEmployees]);

  // Get unique departments and locations for filter options - SAFE with empty array
  const filterOptions = useMemo(() => {
    const safeEmployees = employees || [];
    const departments = [...new Set(safeEmployees.map((emp) => emp.department))].sort();
    const locations = [...new Set(safeEmployees.map((emp) => emp.location))].sort();
    const statuses = [...new Set(safeEmployees.map((emp) => emp.status))].sort();
    return { departments, locations, statuses };
  }, [employees]);

  // Filter employees based on all criteria - SAFE with empty array
  const filteredEmployees = useMemo(() => {
    const safeEmployees = employees || [];
    return safeEmployees.filter((emp) => {
      // Search filter (multi-field, case-insensitive)
      const searchStr = (emp.name + " " + emp.email + " " + emp.department + " " + emp.jobTitle + " " + emp.location + " " + emp.status).toLowerCase();
      const matchesSearch = debouncedSearchTerm === "" || searchStr.includes(debouncedSearchTerm.toLowerCase());

      // Department filter
      const matchesDepartment = departmentFilter
        ? emp.department === departmentFilter
        : true;

      // Status filter
      const matchesStatus = statusFilter
        ? emp.status === statusFilter
        : true;

      return matchesSearch && matchesDepartment && matchesStatus;
    });
  }, [employees, debouncedSearchTerm, departmentFilter, statusFilter]);

  const handleRetry = () => {
    console.log("Retry clicked - calling fetchEmployees");
    fetchEmployees();
  };

  const handleClearFilters = () => {
    setSearchTerm("");
    setDepartmentFilter("");
    setStatusFilter("");
  };

  // DEBUG: Log filtered results
  console.log("filteredEmployees:", filteredEmployees);

  // LOADING STATE - Always returns JSX
  if (loading) {
    console.log("Showing loading state");
    return (
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-center py-12">
          <div className="flex flex-col items-center space-y-4">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-500"></div>
            <p className="text-gray-400">Loading employees...</p>
          </div>
        </div>
      </div>
    );
  }

  // ERROR STATE - Always returns JSX
  if (error) {
    console.log("Showing error state:", error);
    return (
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-center py-12">
          <div className="text-center max-w-md">
            <div className="text-red-400 text-4xl mb-4">
              <i className="fas fa-exclamation-triangle"></i>
            </div>
            <h3 className="text-lg font-semibold text-white mb-2">Error Loading Data</h3>
            <p className="text-gray-400 mb-6">{error}</p>
            <button
              onClick={handleRetry}
              className="px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors duration-200 flex items-center space-x-2 mx-auto"
            >
              <i className="fas fa-sync-alt"></i>
              <span>Retry</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  // MAIN RENDER - Always returns JSX
  console.log("Rendering main Directory UI");
  return (
    <div className="max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">
          Directory
        </h1>
        <p className="text-gray-400">
          Browse company directory and employee profiles
        </p>
      </div>

      {/* SEARCH + FILTERS */}
      <div className="bg-slate-800/40 p-4 rounded-xl border border-slate-700/50 mb-6 flex flex-col md:flex-row gap-4">
        
        {/* Search */}
        <div className="flex-1 relative">
          <input
            type="text"
            placeholder="Search by name, email, department, location, status..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-slate-700/60 text-white rounded-xl pl-10 pr-4 py-2 focus:outline-none focus:ring-2 focus:ring-teal-500 border border-slate-600/50"
          />
          <i className="fas fa-search absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"></i>
        </div>

        {/* Department Filter */}
        <select
          value={departmentFilter}
          onChange={(e) => setDepartmentFilter(e.target.value)}
          className="bg-slate-700/60 text-white rounded-xl px-4 py-2 border border-slate-600/50"
        >
          <option value="">All Departments</option>
          {filterOptions.departments.map((dept) => (
            <option key={dept} value={dept}>{dept}</option>
          ))}
        </select>

        {/* Status Filter */}
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="bg-slate-700/60 text-white rounded-xl px-4 py-2 border border-slate-600/50"
        >
          <option value="">All Status</option>
          {filterOptions.statuses.map((status) => (
            <option key={status} value={status}>{status}</option>
          ))}
        </select>

        {/* Clear Filters */}
        {(searchTerm || departmentFilter || statusFilter) && (
          <button
            onClick={handleClearFilters}
            className="px-4 py-2 bg-slate-700/60 text-white rounded-xl border border-slate-600/50 hover:bg-slate-700/80 transition-colors duration-200"
          >
            <i className="fas fa-times mr-2"></i>
            Clear
          </button>
        )}
      </div>

      {/* Active Filters Display */}
      {(searchTerm || departmentFilter || statusFilter) && (
        <div className="mb-4 flex items-center space-x-2">
          <span className="text-sm text-gray-400">Active filters:</span>
          {searchTerm && (
            <span className="px-2 py-1 bg-teal-500/20 text-teal-400 text-xs rounded-full">
              Search: {searchTerm}
            </span>
          )}
          {departmentFilter && (
            <span className="px-2 py-1 bg-teal-500/20 text-teal-400 text-xs rounded-full">
              Department: {departmentFilter}
            </span>
          )}
          {statusFilter && (
            <span className="px-2 py-1 bg-teal-500/20 text-teal-400 text-xs rounded-full">
              Status: {statusFilter}
            </span>
          )}
          <span className="text-sm text-gray-400">
            ({filteredEmployees.length} results)
          </span>
        </div>
      )}

      {/* Table Header */}
      <div className="bg-slate-800/20 rounded-xl p-4 border border-slate-700/30 mb-4">
        <div className="grid grid-cols-12 gap-4 text-sm font-medium text-gray-400">
          <div className="col-span-4">Employee</div>
          <div className="col-span-2">Job Title</div>
          <div className="col-span-2">Department</div>
          <div className="col-span-2">Location</div>
          <div className="col-span-2">Status</div>
        </div>
      </div>

      {/* Employee Rows - SAFE MAP USAGE */}
      <div className="space-y-3">
        {filteredEmployees.map((employee) => (
          <div
            key={employee.id}
            className="bg-slate-800/40 rounded-xl p-4 border border-slate-700/50 hover:bg-slate-800/60 transition-all"
          >
            <div className="grid grid-cols-12 gap-4 items-center">
              
              <div className="col-span-4 flex items-center space-x-3">
                <img
                  src={
                    employee.avatar ||
                    "https://picsum.photos/seed/" + employee.id + "/40/40"
                  }
                  alt={employee.name}
                  className="w-10 h-10 rounded-full border-2 border-slate-600"
                />
                <div>
                  <p className="text-white font-medium">
                    {employee.name}
                  </p>
                  <p className="text-gray-400 text-sm">
                    {employee.email}
                  </p>
                </div>
              </div>

              <div className="col-span-2 text-gray-300">
                {employee.jobTitle}
              </div>

              <div className="col-span-2 text-gray-300">
                {employee.department}
              </div>

              <div className="col-span-2 text-gray-300">
                {employee.location}
              </div>

              <div className="col-span-2">
                {getStatusBadge(employee.status)}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* NO RESULTS STATE - SAFE RENDERING */}
      {filteredEmployees.length === 0 && (
        <div className="text-center text-gray-400 mt-10">
          <i className="fas fa-search text-3xl mb-3"></i>
          <p>No employees found</p>
          {(searchTerm || departmentFilter || statusFilter) && (
            <button
              onClick={handleClearFilters}
              className="mt-4 px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors duration-200"
            >
              Clear Filters
            </button>
          )}
        </div>
      )}
    </div>
  );
}

export default Directory;