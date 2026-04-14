import React, { useState, useEffect } from 'react';
import { EnhancedModal } from './EnhancedModal';
import Button from './Button';
import Input from './Input';
import { type Employee, type CreateEmployeeRequest, type UpdateEmployeeRequest } from '../api/employeeApi';

interface EmployeeFormModalProps {
  employee: Employee | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: CreateEmployeeRequest | UpdateEmployeeRequest) => Promise<void>;
  employees: Employee[];
  currentUserId?: number;
}

const EmployeeFormModal: React.FC<EmployeeFormModalProps> = ({
  employee,
  isOpen,
  onClose,
  onSave,
  employees,
  currentUserId
}) => {
  const [formData, setFormData] = useState<CreateEmployeeRequest & { managerId?: number; role?: string }>({
    name: "",
    email: "",
    jobTitle: "",
    department: "",
    location: "",
    status: "Active",
    role: "employee",
    managerId: undefined
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

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
        status: "Active",
        role: "employee",
        managerId: undefined
      });
    }
    setError("");
  }, [employee, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      console.log('🔍 Submitting form data:', formData);
      await onSave(formData);
      onClose();
    } catch (err: any) {
      console.error('❌ Form submission error:', err);
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
        
        {!employee && (
          <div className="p-3 bg-blue-500/20 border border-blue-500/30 rounded-lg text-blue-400 text-sm">
            <strong>Note:</strong> A temporary password will be generated for this user. They will need to change it on first login.
          </div>
        )}
        
        <Input
          name="name"
          value={formData.name}
          onChange={handleChange}
          placeholder="Name"
          required
        />
        <Input
          name="email"
          value={formData.email}
          onChange={handleChange}
          placeholder="Email"
          type="email"
          required
        />
        
        <select
          name="jobTitle"
          value={formData.jobTitle}
          onChange={handleChange}
          className="w-full bg-slate-700/60 rounded-xl border border-slate-600 text-white px-4 py-2 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-all duration-200"
          required
        >
          <option value="">Select Job Title</option>
          <option value="Software Engineer">Software Engineer</option>
          <option value="Senior Software Engineer">Senior Software Engineer</option>
          <option value="Lead Developer">Lead Developer</option>
          <option value="Engineering Manager">Engineering Manager</option>
          <option value="Product Manager">Product Manager</option>
          <option value="UX Designer">UX Designer</option>
          <option value="UI Designer">UI Designer</option>
          <option value="Data Analyst">Data Analyst</option>
          <option value="Marketing Specialist">Marketing Specialist</option>
          <option value="Sales Representative">Sales Representative</option>
          <option value="HR Manager">HR Manager</option>
          <option value="HR Specialist">HR Specialist</option>
          <option value="Finance Manager">Finance Manager</option>
          <option value="Accountant">Accountant</option>
          <option value="Operations Manager">Operations Manager</option>
          <option value="Customer Support">Customer Support</option>
          <option value="CEO">CEO</option>
          <option value="CTO">CTO</option>
          <option value="CFO">CFO</option>
          <option value="COO">COO</option>
        </select>
        
        <div>
          <select
            name="department"
            value={formData.department}
            onChange={handleChange}
            className="w-full bg-slate-700/60 rounded-xl border border-slate-600 text-white px-4 py-2 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-all duration-200"
            required
          >
            <option value="">Select Department</option>
            <option value="Engineering">Engineering</option>
            <option value="Sales">Sales</option>
            <option value="Marketing">Marketing</option>
            <option value="HR">HR</option>
            <option value="Finance">Finance</option>
            <option value="Operations">Operations</option>
            <option value="Customer Support">Customer Support</option>
            <option value="Product">Product</option>
            <option value="Design">Design</option>
            <option value="General">General</option>
          </select>
        </div>
        
        <div>
          <select
            name="role"
            value={formData.role}
            onChange={handleChange}
            className="w-full bg-slate-700/60 rounded-xl border border-slate-600 text-white px-4 py-2 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-all duration-200"
            required
          >
            <option value="">Select Role</option>
            <option value="employee">Employee</option>
            <option value="manager">Manager</option>
            <option value="hr">HR</option>
            <option value="admin">Admin</option>
          </select>
        </div>
        
        <Input
          name="location"
          value={formData.location || ''}
          onChange={handleChange}
          placeholder="Location"
        />

        <div>
          <select
            name="managerId"
            value={formData.managerId || ''}
            onChange={(e) => {
              const value = e.target.value;
              setFormData(prev => ({ ...prev, managerId: value ? parseInt(value) : undefined }));
            }}
            className="w-full bg-slate-700/60 rounded-xl border border-slate-600 text-white px-4 py-2 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-all duration-200"
          >
            <option value="">No Manager</option>
            {employees
              .filter(emp => emp.role === 'manager' || emp.role === 'admin') // Only show managers and admins
              .filter(emp => currentUserId ? emp.id !== currentUserId : true) // Exclude current user
              .filter(emp => employee ? emp.id !== employee.id : true) // Exclude employee being edited
              .map(emp => (
                <option key={emp.id} value={emp.id}>
                  {emp.name} - {emp.jobTitle}
                </option>
              ))}
          </select>
        </div>

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
};

export default EmployeeFormModal;
