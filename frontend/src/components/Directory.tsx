import React, { useState, useEffect, useMemo } from "react";
import toast from "react-hot-toast";
import { useEmployeeStore } from "../store/useEmployeeStore";
import { useDebounce } from "../hooks/useDebounce";
import { employeeApi, type Employee, type CreateEmployeeRequest, type UpdateEmployeeRequest } from "../api/employeeApi";
import { useIsAdmin } from "../store/useAuthStore";
import Button from "./Button";
import Input from "./Input";
import StatusBadge from "./StatusBadge";
import Card from "./Card";
import { PageTransition, StaggerContainer, FadeIn } from "./PageTransition";
import { EnhancedModal } from "./EnhancedModal";
import { CardSkeleton } from "./EnhancedSkeletonLoader";
import { EmployeesEmptyState, SearchEmptyState } from "./EmptyState";
import { Search, Plus, Edit } from 'lucide-react';

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
    <EnhancedModal
      isOpen={isOpen}
      onClose={onClose}
      title={employee ? "Edit Employee" : "Add Employee"}
      size="md"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="p-3 bg-red-500/20 border border-red-500/30 rounded-lg text-red-400 text-sm">
            {error}
          </div>
        )}
        
        <Input
          name="name"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          placeholder="Name"
          required
        />
        <Input
          name="email"
          value={formData.email}
          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
          placeholder="Email"
          type="email"
          required
        />
          <Input
            name="jobTitle"
            value={formData.jobTitle}
            onChange={(e) => setFormData({ ...formData, jobTitle: e.target.value })}
            placeholder="Job Title"
            required
          />
          <Input
            name="department"
            value={formData.department}
            onChange={(e) => setFormData({ ...formData, department: e.target.value })}
            placeholder="Department"
            required
          />
          <Input
            name="location"
            value={formData.location || ''}
            onChange={(e) => setFormData({ ...formData, location: e.target.value })}
            placeholder="Location"
          />

          <select
            name="status"
            value={formData.status}
            onChange={(e) =>
              setFormData({ ...formData, status: e.target.value })
            }
            className="w-full bg-slate-700/60 rounded-xl border border-slate-600 text-white px-4 py-2 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-all duration-200"
          >
            <option>Active</option>
            <option>Onboarding</option>
            <option>Remote</option>
          </select>

          <div className="flex gap-2">
            <Button 
              type="button" 
              onClick={onClose}
              variant="secondary"
              className="flex-1"
            >
              Cancel
            </Button>
            <Button 
              type="submit" 
              loading={loading}
              className="flex-1"
              loadingText="Saving..."
            >
              {employee ? "Update" : "Save"}
            </Button>
          </div>
        </form>
      </EnhancedModal>
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

  const handleAddEmployee = () => {
    setEditingEmployee(null);
    setIsModalOpen(true);
  };

  const handleEditEmployee = (emp: Employee) => {
    setEditingEmployee(emp);
    setIsModalOpen(true);
  };

  const handleSaveEmployee = async (data: CreateEmployeeRequest | UpdateEmployeeRequest) => {
    try {
      if (editingEmployee) {
        await employeeApi.updateEmployee(editingEmployee.id, data as UpdateEmployeeRequest);
        toast.success("Employee updated successfully!");
      } else {
        await employeeApi.createEmployee(data as CreateEmployeeRequest);
        toast.success("Employee added successfully!");
      }
      await fetchEmployees();
      setIsModalOpen(false);
    } catch (err: any) {
      console.error("Failed to save employee:", err);
      throw err;
    }
  };

  return (
    <PageTransition>
      <div className="text-white">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <FadeIn delay={100}>
            <div className="mb-8">
              <h1 className="text-4xl font-bold text-white mb-2">
                {isAdmin ? "Employee Directory" : "Team Directory"}
              </h1>
              <p className="text-gray-400 text-sm">
                {isAdmin 
                  ? "Manage your team members and their information"
                  : "View your team members and their information"
                }
              </p>
            </div>
          </FadeIn>

          {/* Search and Actions */}
          <FadeIn delay={200}>
            <div className="mb-6">
              <Input
                type="text"
                placeholder="Search employees..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                icon={<Search className="w-5 h-5" />}
              />
            </div>

            {/* Admin-only Add Employee Button */}
            {isAdmin && (
              <Button
                onClick={handleAddEmployee}
                icon={<Plus className="w-4 h-4" />}
                className="mb-6"
              >
                Add Employee
              </Button>
            )}
          </FadeIn>

          {/* Content */}
          <div className="min-h-[400px]">
            {loading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <CardSkeleton />
                <CardSkeleton />
                <CardSkeleton />
              </div>
            ) : error ? (
              <div className="text-center py-12">
                <p className="text-red-400 mb-4">{error}</p>
                <Button onClick={fetchEmployees} icon={<Search className="w-4 h-4" />}>
                  Try Again
                </Button>
              </div>
            ) : filteredEmployees?.length === 0 ? (
              debouncedSearchTerm ? (
                <SearchEmptyState 
                  searchTerm={debouncedSearchTerm}
                  onClearSearch={() => setSearchTerm("")}
                />
              ) : (
                <EmployeesEmptyState 
                  onAddEmployee={isAdmin ? handleAddEmployee : undefined}
                />
              )
            ) : (
              <StaggerContainer staggerDelay={100} initialDelay={300}>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredEmployees.map((emp: Employee) => (
                    <Card key={emp.id} hover className="group">
                      <div className="flex items-center mb-3">
                        <img
                          src={`https://picsum.photos/seed/${emp.id}/40/40.jpg`}
                          alt={emp.name}
                          className="w-10 h-10 rounded-full mr-3 group-hover:scale-110 transition-transform duration-300"
                        />
                        <div className="flex-1">
                          <h3 className="text-white font-medium group-hover:text-teal-400 transition-colors duration-200">
                            {emp.name}
                          </h3>
                          <p className="text-gray-400 text-sm">{emp.jobTitle}</p>
                        </div>
                        {isAdmin && (
                          <Button
                            size="sm"
                            variant="secondary"
                            onClick={() => handleEditEmployee(emp)}
                            icon={<Edit className="w-3 h-3" />}
                            className="opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                          >
                            Edit
                          </Button>
                        )}
                      </div>
                      
                      <div className="space-y-2 text-sm">
                        <p className="text-gray-300 flex items-center">
                          <svg className="w-4 h-4 mr-2 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                          </svg>
                          {emp.email}
                        </p>
                        <p className="text-gray-300 flex items-center">
                          <svg className="w-4 h-4 mr-2 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                          </svg>
                          {emp.department}
                        </p>
                        <p className="text-gray-300 flex items-center">
                          <svg className="w-4 h-4 mr-2 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                          </svg>
                          {emp.location || "Remote"}
                        </p>
                      </div>

                      <div className="mt-4 pt-4 border-t border-slate-700">
                        <StatusBadge status={emp.status} />
                      </div>
                    </Card>
                  ))}
                </div>
              </StaggerContainer>
            )}
          </div>
        </div>

        {/* Modal */}
        <EmployeeFormModal
          employee={editingEmployee}
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onSave={handleSaveEmployee}
        />
      </div>
    </PageTransition>
  );
}

export default Directory;