import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { useEmployeeStore } from "../store/useEmployeeStore";
import { useDebounce } from "../hooks/useDebounce";
import { employeeApi, type Employee, type CreateEmployeeRequest, type UpdateEmployeeRequest } from "../api/employeeApi";
import { useIsAdmin, useAuthStore } from "../store/useAuthStore";
import { useFilters } from "../contexts/FilterContext";
import { useNotificationStore, createEmployeeNotification } from "../store/notificationStore";
import Button from "./Button";
import StatusBadge from "./StatusBadge";
import Card from "./Card";
import Filter from "./Filter";
import { PageTransition, StaggerContainer, FadeIn } from "./PageTransition";
import { CardSkeleton } from "./EnhancedSkeletonLoader";
import { EmployeesEmptyState, SearchEmptyState } from "./EmptyState";
import EmployeeFormModal from "./EmployeeFormModal";
import { Search, Edit, Trash2, UserPlus } from 'lucide-react';


/* =========================
   MAIN COMPONENT
========================= */
function Directory() {
  const navigate = useNavigate();
  const { employees = [], loading, error, fetchEmployees } = useEmployeeStore();
  const isAdmin = useIsAdmin();
  const { user } = useAuthStore();
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
            <div className="mb-8 flex justify-between items-start">
              <div>
                <h1 className="text-4xl font-bold text-white mb-2 bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
                  {isAdmin ? "Employee Directory" : "Team Directory"}
                </h1>
                <p className="text-gray-400 text-sm flex items-center">
                  <span className="inline-block w-2 h-2 bg-teal-400 rounded-full mr-2 animate-pulse"></span>
                  {isAdmin 
                    ? "Manage your team members and their information"
                    : "View your team members and their information"
                  }
                  {filteredEmployees?.length > 0 && (
                    <span className="ml-2 text-teal-400 font-medium">
                      ({filteredEmployees.length} {filteredEmployees.length === 1 ? 'member' : 'members'})
                    </span>
                  )}
                </p>
              </div>
              {isAdmin && (
                <Button
                  onClick={() => {
                    setEditingEmployee(null);
                    setIsModalOpen(true);
                  }}
                  icon={<UserPlus className="w-4 h-4" />}
                  className="shadow-lg hover:shadow-xl hover:shadow-teal-500/10 transition-all duration-300 transform hover:-translate-y-0.5"
                >
                  Add Employee
                </Button>
              )}
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
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-6">
                  {filteredEmployees.map((emp: Employee) => (
                    <Card key={emp.id} className="group bg-gradient-to-br from-slate-800/60 to-slate-800/40 backdrop-blur-lg border border-slate-700/50 hover:border-teal-500/30 hover:shadow-lg hover:shadow-teal-500/5 transition-all duration-300 transform hover:-translate-y-1">
                      <div className="flex items-start mb-4">
                        <div className="w-12 h-12 bg-teal-500/20 rounded-full flex items-center justify-center flex-shrink-0 ring-2 ring-slate-700 group-hover:ring-teal-500/50 transition-all duration-300 group-hover:scale-110">
                          <span className="text-sm font-bold text-teal-400">{emp.name.split(' ').map(n => n[0]).join('')}</span>
                        </div>
                        <div className="flex-1 min-w-0 ml-3">
                          <h3 
                            className="text-white font-semibold text-base group-hover:text-teal-400 transition-colors duration-200 cursor-pointer hover:underline truncate"
                            onClick={() => navigate(`/employee/${emp.id}`)}
                          >
                            {emp.name}
                          </h3>
                          <p className="text-gray-400 text-sm truncate mt-0.5">{emp.jobTitle}</p>
                        </div>
                        {isAdmin && (
                          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-all duration-300 translate-x-2 group-hover:translate-x-0">
                            <Button
                              size="sm"
                              variant="secondary"
                              onClick={() => handleEditEmployee(emp)}
                              icon={<Edit className="w-3 h-3" />}
                              className="hover:bg-teal-500/10 hover:text-teal-400 transition-colors duration-200"
                            >
                              Edit
                            </Button>
                            <Button
                              size="sm"
                              variant="danger"
                              onClick={() => handleDeleteEmployee(emp)}
                              icon={<Trash2 className="w-3 h-3" />}
                              className="hover:bg-red-500/20 transition-colors duration-200"
                            >
                              Delete
                            </Button>
                          </div>
                        )}
                      </div>
                      
                      <div className="space-y-3 text-sm">
                        <div className="flex items-center text-gray-300 hover:text-white transition-colors duration-200">
                          <div className="w-8 h-8 bg-slate-700/50 rounded-lg flex items-center justify-center mr-3 group-hover:bg-blue-500/20 transition-colors duration-300">
                            <svg className="w-4 h-4 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                            </svg>
                          </div>
                          <span className="truncate">{emp.email}</span>
                        </div>
                        <div className="flex items-center text-gray-300 hover:text-white transition-colors duration-200">
                          <div className="w-8 h-8 bg-slate-700/50 rounded-lg flex items-center justify-center mr-3 group-hover:bg-purple-500/20 transition-colors duration-300">
                            <svg className="w-4 h-4 text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                            </svg>
                          </div>
                          <span className="truncate">{emp.department}</span>
                        </div>
                        <div className="flex items-center text-gray-300 hover:text-white transition-colors duration-200">
                          <div className="w-8 h-8 bg-slate-700/50 rounded-lg flex items-center justify-center mr-3 group-hover:bg-green-500/20 transition-colors duration-300">
                            <svg className="w-4 h-4 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                            </svg>
                          </div>
                          <span className="truncate">{emp.location || "Remote"}</span>
                        </div>
                      </div>

                      <div className="mt-4 pt-4 border-t border-slate-700/50">
                        <StatusBadge status={emp.status} />
                      </div>
                    </Card>
                  ))}
                </div>
              </StaggerContainer>
            )}
          </div>
        </div>
      </div>

      {/* Modal - Rendered outside main content container for proper z-index */}
      <EmployeeFormModal
        employee={editingEmployee}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSaveEmployee}
        employees={employees}
        currentUserId={user?.id}
      />
    </PageTransition>
  );
}

export default Directory;