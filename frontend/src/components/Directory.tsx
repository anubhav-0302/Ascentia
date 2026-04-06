import React, { useState, useEffect, useMemo } from "react";
import { useEmployeeStore } from "../store/useEmployeeStore";
import { useDebounce } from "../hooks/useDebounce";
import { employeeApi, type Employee, type CreateEmployeeRequest, type UpdateEmployeeRequest } from "../api/employeeApi";

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
      await onSave(formData);
      onClose();
    } catch (err: any) {
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
    <div className="p-6 text-white">
      <h1 className="text-2xl mb-4">Directory</h1>

      <input
        className="mb-4 p-2 text-black"
        placeholder="Search..."
        onChange={(e) => setSearchTerm(e.target.value)}
      />

      <button
        onClick={() => setIsModalOpen(true)}
        className="mb-4 bg-teal-600 px-4 py-2 rounded"
      >
        Add Employee
      </button>

      {(filteredEmployees || []).map((emp: Employee) => (
        <div key={emp.id} className="bg-slate-800 p-4 mb-2 rounded flex justify-between">
          <div>
            <p>{emp.name}</p>
            <p className="text-gray-400">{emp.email}</p>
          </div>
          <div className="flex gap-2">
            {getStatusBadge(emp.status)}
            <button onClick={() => { setEditingEmployee(emp); setIsModalOpen(true); }}>
              Edit
            </button>
            <button onClick={() => employeeApi.deleteEmployee(emp.id)}>
              Delete
            </button>
          </div>
        </div>
      ))}

      <EmployeeFormModal
        employee={editingEmployee}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={async (data) => {
          if (editingEmployee) {
            await employeeApi.updateEmployee(editingEmployee.id, data);
          } else {
            await employeeApi.createEmployee(data);
          }
          fetchEmployees();
        }}
      />
    </div>
  );
}

export default Directory;