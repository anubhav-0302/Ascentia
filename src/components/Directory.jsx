import React, { useState, useEffect } from "react";

function getStatusBadge(status) {
  const statusConfig = {
    Active:
      "bg-green-400/20 text-green-400 border-green-400/30",
    Onboarding:
      "bg-yellow-400/20 text-yellow-400 border-yellow-400/30",
    Remote:
      "bg-blue-400/20 text-blue-400 border-blue-400/30",
  };

  const dotColor = {
    Active: "bg-green-400",
    Onboarding: "bg-yellow-400",
    Remote: "bg-blue-400",
  };

  return (
    <span
      className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border ${
        statusConfig[status] || statusConfig["Active"]
      }`}
    >
      <span
        className={`w-2 h-2 rounded-full ${
          dotColor[status] || dotColor["Active"]
        } mr-2`}
      ></span>
      {status}
    </span>
  );
}

function Directory() {
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);

  const [searchTerm, setSearchTerm] = useState("");
  const [departmentFilter, setDepartmentFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");

  // 🔥 FETCH FROM BACKEND
  useEffect(() => {
    fetch("http://localhost:5000/api/employees")
      .then((res) => res.json())
      .then((data) => {
        setEmployees(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Error fetching employees:", err);
        setLoading(false);
      });
  }, []);

  // 🎯 FILTER LOGIC
  const filteredEmployees = employees.filter((emp) => {
    const matchesSearch = `${emp.name} ${emp.email} ${emp.department} ${emp.jobTitle} ${emp.location} ${emp.status}`
      .toLowerCase()
      .includes(searchTerm.toLowerCase());

    const matchesDepartment = departmentFilter
      ? emp.department === departmentFilter
      : true;

    const matchesStatus = statusFilter
      ? emp.status === statusFilter
      : true;

    return matchesSearch && matchesDepartment && matchesStatus;
  });

  // 🔥 LOADING STATE
  if (loading) {
    return <div className="text-white p-6">Loading employees...</div>;
  }

  return (
    <main className="ml-64 mt-16 p-6 h-screen overflow-y-auto">
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

        {/* 🔍 SEARCH + FILTERS */}
        <div className="bg-slate-800/40 p-4 rounded-xl border border-slate-700/50 mb-6 flex flex-col md:flex-row gap-4">
          
          {/* Search */}
          <div className="flex-1 relative">
            <input
              type="text"
              placeholder="Search employees..."
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
            {[...new Set(employees.map((e) => e.department))].map((dept) => (
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
            <option value="Active">Active</option>
            <option value="Onboarding">Onboarding</option>
            <option value="Remote">Remote</option>
          </select>
        </div>

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

        {/* Employee Rows */}
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
                      `https://picsum.photos/seed/${employee.id}/40/40`
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

        {/* ❌ NO RESULTS */}
        {filteredEmployees.length === 0 && (
          <div className="text-center text-gray-400 mt-10">
            <i className="fas fa-users text-3xl mb-3"></i>
            <p>No employees found</p>
          </div>
        )}
      </div>
    </main>
  );
}

export default Directory;