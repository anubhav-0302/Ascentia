import React, { useState, useEffect, useMemo } from "react";
import { useEmployeeStore } from "../store/useEmployeeStore";
import { useDebounce } from "../hooks/useDebounce";
import { employeeApi, type Employee, type CreateEmployeeRequest, type UpdateEmployeeRequest } from "../api/employeeApi";
import { useIsAdmin } from "../store/useAuthStore";

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

/* =========================
   MODAL
========================= */
function EmployeeFormModal({
  employee,
  isOpen,
  onClose,
  onSave
}: {
  employee: Employee | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: CreateEmployeeRequest | UpdateEmployeeRequest) => Promise<void>;
}) {
  const [formData, setFormData] = useState<CreateEmployeeRequest>({
    name: "",
    email: "",
    jobTitle: "",
    department: "",
    location: "",
    status: "Active"
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (employee) {
      setFormData({ ...employee });
    } else {
      setFormData({
        name: "",
        email: "",
        jobTitle: "",
        department: "",
        location: "",
        status: "Active"
      });
    }
    setError("");
  }, [employee, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      console.log("🔍 Form submitting with data:", formData);
      await onSave(formData);
      console.log("✅ Form saved successfully, closing modal");
      onClose();
    } catch (err: any) {
      console.error("❌ Form submission error:", err);
      setError(err.message || "Failed to save employee");
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-slate-800 rounded-xl p-6 w-full max-w-md">
        <h2 className="text-xl font-bold text-white mb-4">
          {employee ? "Edit Employee" : "Add Employee"}
        </h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          {["name", "email", "jobTitle", "department", "location"].map((field) => (
            <input
              key={field}
              name={field}
              value={(formData as any)[field]}
              onChange={(e) =>
                setFormData({ ...formData, [field]: e.target.value })
              }
              placeholder={field}
              className="w-full bg-slate-700 text-white px-3 py-2 rounded"
              required={field !== "location"}
            />
          ))}

          <select
            name="status"
            value={formData.status}
            onChange={(e) =>
              setFormData({ ...formData, status: e.target.value })
            }
            className="w-full bg-slate-700 text-white px-3 py-2 rounded"
          >
            <option>Active</option>
            <option>Onboarding</option>
            <option>Remote</option>
          </select>

          {error && <p className="text-red-400">{error}</p>}

          <div className="flex gap-2">
            <button type="button" onClick={onClose} className="flex-1 bg-gray-600 p-2 rounded">
              Cancel
            </button>
            <button type="submit" className="flex-1 bg-teal-600 p-2 rounded">
              {loading ? "Saving..." : "Save"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

/* =========================
   MAIN COMPONENT
========================= */
function Directory() {
  const { employees = [], loading, error, fetchEmployees } = useEmployeeStore();
  const isAdmin = useIsAdmin();

  // Debug log to track employees state
  console.log("employees state:", employees);

  const [searchTerm, setSearchTerm] = useState("");
  const debouncedSearchTerm = useDebounce(searchTerm, 300);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState<Employee | null>(null);

  useEffect(() => {
    fetchEmployees();
  }, [fetchEmployees]);

  const filteredEmployees = useMemo(() => {
    if (!employees || employees.length === 0) return [];
    return employees.filter((emp: Employee) =>
      (emp.name + emp.email + emp.department)
        .toLowerCase()
        .includes(debouncedSearchTerm.toLowerCase())
    );
  }, [employees, debouncedSearchTerm]);

  if (loading) return <p className="text-white">Loading...</p>;
  if (error) return <p className="text-red-400">{error}</p>;

  return (
    <div className="max-w-6xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">
          Employee Directory
        </h1>
        <p className="text-gray-400">
          {isAdmin 
            ? "Manage your team members and their information"
            : "View your team members and their information"
          }
        </p>
      </div>

      <div className="mb-6">
        <input
          type="text"
          placeholder="Search employees..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-teal-500"
        />
      </div>

      {/* Admin-only Add Employee Button */}
      {isAdmin && (
        <button
          onClick={() => setIsModalOpen(true)}
          className="mb-4 bg-teal-600 px-4 py-2 rounded hover:bg-teal-700 transition-colors"
        >
          Add Employee
        </button>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {(filteredEmployees || []).map((emp: Employee) => (
          <div key={emp.id} className="bg-slate-800 p-4 rounded-lg border border-slate-700">
            <div className="flex items-center mb-3">
              <img
                src={`https://picsum.photos/seed/${emp.id}/40/40.jpg`}
                alt={emp.name}
                className="w-10 h-10 rounded-full mr-3"
              />
              <div>
                <h3 className="text-white font-medium">{emp.name}</h3>
                <p className="text-gray-400 text-sm">{emp.jobTitle}</p>
              </div>
            </div>
            
            <div className="space-y-2 text-sm">
              <p className="text-gray-300">
                <i className="fas fa-envelope mr-2 text-gray-500"></i>
                {emp.email}
              </p>
              <p className="text-gray-300">
                <i className="fas fa-building mr-2 text-gray-500"></i>
                {emp.department}
              </p>
              <p className="text-gray-300">
                <i className="fas fa-map-marker-alt mr-2 text-gray-500"></i>
                {emp.location}
              </p>
            </div>
            
            <div className="flex items-center justify-between mt-4">
              {getStatusBadge(emp.status)}
              
              {/* Admin-only Edit Button */}
              {isAdmin && (
                <button 
                  onClick={() => { 
                    setEditingEmployee(emp); 
                    setIsModalOpen(true); 
                  }}
                  className="text-blue-400 hover:text-blue-300 text-sm"
                >
                  Edit
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Employee Form Modal - Admin Only */}
      {isAdmin && isModalOpen && (
        <EmployeeFormModal
          employee={editingEmployee}
          isOpen={isModalOpen}
          onClose={() => {
            setIsModalOpen(false);
            setEditingEmployee(null);
          }}
          onSave={async (data: CreateEmployeeRequest | UpdateEmployeeRequest) => {
            try {
              console.log("🔍 Saving employee:", data);
              console.log("🔍 Editing employee:", editingEmployee);

              let response;
              if (editingEmployee) {
                console.log("🔍 Updating employee ID:", editingEmployee.id);
                response = await employeeApi.updateEmployee(editingEmployee.id, data as UpdateEmployeeRequest);
                console.log("✅ Employee updated successfully:", response);
              } else {
                console.log("🔍 Creating new employee");
                response = await employeeApi.createEmployee(data as CreateEmployeeRequest);
                console.log("✅ Employee created successfully:", response);
              }

              // Refresh the employee list
              console.log("🔄 Refreshing employee list...");
              await fetchEmployees();
              console.log("✅ Employee list refreshed");

              // Close modal and reset form
              setIsModalOpen(false);
              setEditingEmployee(null);
              console.log("✅ Modal closed and form reset");

            } catch (error: any) {
              console.error("❌ SAVE ERROR:", error);
              console.error("❌ Error details:", {
                message: error.message,
                status: error.status,
                data: error.data
              });
              
              // You could add a toast notification here
              alert(`Failed to save employee: ${error.message || 'Unknown error'}`);
            }
          }}
        />
      )}

      {/* Empty State */}
      {filteredEmployees.length === 0 && (
        <div className="text-center py-12">
          <i className="fas fa-users text-gray-600 text-5xl mb-4"></i>
          <p className="text-gray-400 text-lg">
            {searchTerm ? 'No employees found matching your search' : 'No employees found'}
          </p>
        </div>
      )}
    </div>
  );
}

export default Directory;