import React, { useState } from "react";

const initialEmployees = [
  {
    id: 1,
    name: "Sarah Johnson",
    email: "sarah.johnson@ascentia.com",
    avatar: "https://picsum.photos/seed/sarah/40/40.jpg",
    jobTitle: "Senior Developer",
    department: "Engineering",
    location: "San Francisco",
    status: "Active",
  },
  {
    id: 2,
    name: "Michael Chen",
    email: "michael.chen@ascentia.com",
    avatar: "https://picsum.photos/seed/michael/40/40.jpg",
    jobTitle: "Product Manager",
    department: "Product",
    location: "New York",
    status: "Active",
  },
  {
    id: 3,
    name: "Emily Davis",
    email: "emily.davis@ascentia.com",
    avatar: "https://picsum.photos/seed/emily/40/40.jpg",
    jobTitle: "UX Designer",
    department: "Design",
    location: "Remote",
    status: "Remote",
  },
];

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
  const [employees] = useState(initialEmployees);

  return (
    <main className="ml-64 mt-16 p-6 h-screen overflow-y-auto">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">
              Directory
            </h1>
            <p className="text-gray-400">
              Browse company directory and employee profiles
            </p>
          </div>
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
          {employees.map((employee) => (
            <div
              key={employee.id}
              className="bg-slate-800/40 rounded-xl p-4 border border-slate-700/50 hover:bg-slate-800/60 transition-all"
            >
              <div className="grid grid-cols-12 gap-4 items-center">
                <div className="col-span-4 flex items-center space-x-3">
                  <img
                    src={employee.avatar}
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
      </div>
    </main>
  );
}

export default Directory;