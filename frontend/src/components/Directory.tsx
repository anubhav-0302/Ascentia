import React, { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { useEmployeeStore } from "../store/useEmployeeStore";
import { useDebounce } from "../hooks/useDebounce";
import { employeeApi, type Employee, type CreateEmployeeRequest, type UpdateEmployeeRequest } from "../api/employeeApi";
import { useIsAdmin } from "../store/useAuthStore";
import { useFilters } from "../contexts/FilterContext";
import { useNotificationStore, createEmployeeNotification } from "../store/notificationStore";
import Button from "./Button";
import Input from "./Input";
import StatusBadge from "./StatusBadge";
import Card from "./Card";
import Filter from "./Filter";
import { PageTransition, StaggerContainer, FadeIn } from "./PageTransition";
import { EnhancedModal } from "./EnhancedModal";
import { CardSkeleton } from "./EnhancedSkeletonLoader";
import { EmployeesEmptyState, SearchEmptyState } from "./EmptyState";
import { Search, Edit, Trash2 } from 'lucide-react';

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
    <EnhancedModal
      isOpen={isOpen}
      onClose={onClose}
      title={employee ? "Edit Employee" : "Add Employee"}
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
  const navigate = useNavigate();
  const { employees = [], loading, error, fetchEmployees } = useEmployeeStore();
  const isAdmin = useIsAdmin();
  const { filters } = useFilters();

  const [searchTerm, setSearchTerm] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState<Employee | null>(null);

  const debouncedSearchTerm = useDebounce(searchTerm, 300);
  const { addNotification } = useNotificationStore();

  useEffect(() => {
    fetchEmployees();
  }, [fetchEmployees]);

  const filteredEmployees = useMemo(() => {
    if (!employees || employees.length === 0) return [];
    
    return employees.filter((emp: Employee) => {
      // Search filter (combine with global filter search)
      const searchQuery = (filters.search || debouncedSearchTerm || "").toLowerCase();
      const matchesSearch = !searchQuery || 
        (emp.name + emp.email + emp.department + emp.jobTitle + emp.location)
          .toLowerCase()
          .includes(searchQuery);

      // Department filter
      const matchesDepartment = !filters.department || filters.department === 'all' || 
        emp.department.toLowerCase() === filters.department.toLowerCase();

      // Status filter
      const matchesStatus = !filters.status || filters.status === 'all' || 
        emp.status.toLowerCase() === filters.status.toLowerCase();

      // Employment type filter (if available)
      const matchesEmploymentType = !filters.employmentType || filters.employmentType === 'all' ||
        (emp as any).employmentType && (emp as any).employmentType.toLowerCase() === filters.employmentType.toLowerCase();

      // Location filter
      const matchesLocation = !filters.location || filters.location === 'all' ||
        emp.location.toLowerCase() === filters.location.toLowerCase();

      return matchesSearch && matchesDepartment && matchesStatus && matchesEmploymentType && matchesLocation;
    }).sort((a, b) => {
      // Sort logic
      const { sortBy, sortOrder } = filters;
      let comparison = 0;
      
      switch (sortBy) {
        case 'name':
          comparison = a.name.localeCompare(b.name);
          break;
        case 'department':
          comparison = a.department.localeCompare(b.department);
          break;
        case 'status':
          comparison = a.status.localeCompare(b.status);
          break;
        case 'date':
          comparison = new Date(a.createdAt || '').getTime() - new Date(b.createdAt || '').getTime();
          break;
        default:
          comparison = a.name.localeCompare(b.name);
      }
      
      return sortOrder === 'desc' ? -comparison : comparison;
    });
  }, [employees, debouncedSearchTerm, filters]);

  
  const handleEditEmployee = (emp: Employee) => {
    setEditingEmployee(emp);
    setIsModalOpen(true);
  };

  const handleSaveEmployee = async (data: CreateEmployeeRequest | UpdateEmployeeRequest) => {
    try {
      if (editingEmployee) {
        await employeeApi.updateEmployee(editingEmployee.id, data as UpdateEmployeeRequest);
        toast.success("Employee updated successfully!");
        
        // Trigger notification for employee update
        const notification = createEmployeeNotification('updated', data.name || 'Unknown Employee');
        addNotification(notification);
      } else {
        await employeeApi.createEmployee(data as CreateEmployeeRequest);
        toast.success("Employee added successfully!");
        
        // Trigger notification for new employee
        const notification = createEmployeeNotification('added', data.name || 'Unknown Employee');
        addNotification({
          ...notification,
          actionUrl: '/directory'
        });
      }
      await fetchEmployees();
      setIsModalOpen(false);
    } catch (err: any) {
      throw err;
    }
  };

  const handleDeleteEmployee = async (employee: Employee) => {
    if (window.confirm(`Are you sure you want to delete ${employee.name}?`)) {
      try {
        await employeeApi.deleteEmployee(employee.id);
        toast.success("Employee deleted successfully!");
        
        // Trigger notification for employee deletion
        const notification = createEmployeeNotification('deleted', employee.name);
        addNotification(notification);
        
        await fetchEmployees();
      } catch (err: any) {
        toast.error(err.message || "Failed to delete employee");
      }
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

          {/* Filters and Actions */}
          <FadeIn delay={200}>
            <Filter
              showDepartment={true}
              showStatus={true}
              showEmploymentType={true}
              showLocation={true}
              showSortOptions={true}
            />
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
              (filters.search || debouncedSearchTerm) ? (
                <SearchEmptyState 
                  searchTerm={filters.search || debouncedSearchTerm}
                  onClearSearch={() => setSearchTerm("")}
                />
              ) : (
                <EmployeesEmptyState />
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
                          <h3 
                            className="text-white font-medium group-hover:text-teal-400 transition-colors duration-200 cursor-pointer hover:underline"
                            onClick={() => navigate(`/employee/${emp.id}`)}
                          >
                            {emp.name}
                          </h3>
                          <p className="text-gray-400 text-sm">{emp.jobTitle}</p>
                        </div>
                        {isAdmin && (
                          <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                            <Button
                              size="sm"
                              variant="secondary"
                              onClick={() => handleEditEmployee(emp)}
                              icon={<Edit className="w-3 h-3" />}
                            >
                              Edit
                            </Button>
                            <Button
                              size="sm"
                              variant="danger"
                              onClick={() => handleDeleteEmployee(emp)}
                              icon={<Trash2 className="w-3 h-3" />}
                            >
                              Delete
                            </Button>
                          </div>
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