import React, { useState, useEffect } from 'react';
import { EnhancedModal } from './EnhancedModal';
import Button from './Button';
import Input from './Input';
import UnifiedDropdown from './UnifiedDropdown';
import { type Employee, type CreateEmployeeRequest, type UpdateEmployeeRequest } from '../api/employeeApi';
import { validateEmail } from '../utils/emailValidator';

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
    
    // Validate email format
    const emailValidation = validateEmail(formData.email, { requireProfessionalTLD: true });
    if (!emailValidation.isValid) {
      setError(emailValidation.error || 'Please enter a valid email address');
      return;
    }
    
    setLoading(true);
    try {
      // console.log('🔍 Submitting form data:', formData);
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
        
        <UnifiedDropdown
          value={formData.jobTitle || ''}
          onChange={(value) => setFormData(prev => ({ ...prev, jobTitle: value as string }))}
          options={[
            { value: '', label: 'Select Job Title' },
            { value: 'Software Engineer', label: 'Software Engineer' },
            { value: 'Senior Software Engineer', label: 'Senior Software Engineer' },
            { value: 'Lead Developer', label: 'Lead Developer' },
            { value: 'Engineering Manager', label: 'Engineering Manager' },
            { value: 'Product Manager', label: 'Product Manager' },
            { value: 'UX Designer', label: 'UX Designer' },
            { value: 'UI Designer', label: 'UI Designer' },
            { value: 'Data Analyst', label: 'Data Analyst' },
            { value: 'Marketing Specialist', label: 'Marketing Specialist' },
            { value: 'Sales Representative', label: 'Sales Representative' },
            { value: 'HR Manager', label: 'HR Manager' },
            { value: 'HR Specialist', label: 'HR Specialist' },
            { value: 'Finance Manager', label: 'Finance Manager' },
            { value: 'Accountant', label: 'Accountant' },
            { value: 'Operations Manager', label: 'Operations Manager' },
            { value: 'Customer Support', label: 'Customer Support' },
            { value: 'CEO', label: 'CEO' },
            { value: 'CTO', label: 'CTO' },
            { value: 'CFO', label: 'CFO' },
            { value: 'COO', label: 'COO' }
          ]}
          showLabel={false}
          required={true}
          size="md"
        />
        
        <UnifiedDropdown
          value={formData.department || ''}
          onChange={(value) => setFormData(prev => ({ ...prev, department: value as string }))}
          options={[
            { value: '', label: 'Select Department' },
            { value: 'Engineering', label: 'Engineering' },
            { value: 'Sales', label: 'Sales' },
            { value: 'Marketing', label: 'Marketing' },
            { value: 'HR', label: 'HR' },
            { value: 'Finance', label: 'Finance' },
            { value: 'Operations', label: 'Operations' },
            { value: 'Customer Support', label: 'Customer Support' },
            { value: 'Product', label: 'Product' },
            { value: 'Design', label: 'Design' },
            { value: 'General', label: 'General' }
          ]}
          showLabel={false}
          required={true}
          size="md"
        />
        
        <UnifiedDropdown
          value={formData.role || ''}
          onChange={(value) => setFormData(prev => ({ ...prev, role: value as string }))}
          options={[
            { value: '', label: 'Select Role' },
            { value: 'employee', label: 'Employee' },
            { value: 'manager', label: 'Manager' },
            { value: 'teamlead', label: 'Team Lead' },
            { value: 'hr', label: 'HR' },
            { value: 'admin', label: 'Admin' }
          ]}
          showLabel={false}
          required={true}
          size="md"
        />
        
        <Input
          name="location"
          value={formData.location || ''}
          onChange={handleChange}
          placeholder="Location"
        />

        <UnifiedDropdown
          value={formData.managerId || ''}
          onChange={(value) => setFormData(prev => ({ ...prev, managerId: value ? parseInt(value as string) : undefined }))}
          options={[
            { value: '', label: 'No Manager' },
            ...employees
              .filter(emp => emp.role === 'manager' || emp.role === 'teamlead' || emp.role === 'admin') // Only show managers, team leads, and admins
              .filter(emp => currentUserId ? emp.id !== currentUserId : true) // Exclude current user
              .filter(emp => employee ? emp.id !== employee.id : true) // Exclude employee being edited
              .map(emp => ({
                value: emp.id,
                label: `${emp.name} - ${emp.jobTitle}`
              }))
          ]}
          showLabel={false}
          size="md"
        />

        <UnifiedDropdown
          value={formData.status}
          onChange={(value) => setFormData(prev => ({ ...prev, status: value as string }))}
          options={[
            { value: 'Active', label: 'Active' },
            { value: 'Onboarding', label: 'Onboarding' },
            { value: 'Remote', label: 'Remote' }
          ]}
          showLabel={false}
          size="md"
        />

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
