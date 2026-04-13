import React, { useState, useEffect } from 'react';
import Input from './Input';
import Button from './Button';
import Modal from './Modal';
import type { CreateUserData } from '../api/userApi';

interface UserFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: CreateUserData & { jobTitle?: string; department?: string; }) => Promise<void>;
  loading?: boolean;
  title: string;
  initialData?: Partial<CreateUserData & { jobTitle?: string; department?: string; }>;
}

const UserForm: React.FC<UserFormProps> = ({
  isOpen,
  onClose,
  onSubmit,
  loading,
  title,
  initialData = {}
}) => {
  console.log('🔍 UserForm: Component rendered, isOpen:', isOpen, 'initialData:', initialData);
  
  const [formData, setFormData] = useState<CreateUserData & { jobTitle?: string; department?: string; }>(() => ({
    name: '',
    email: '',
    password: '',
    role: 'employee',
    jobTitle: 'Employee',
    department: 'General',
    ...initialData
  }));

  // Reset form when modal opens
  useEffect(() => {
    if (isOpen) {
      setFormData({
        name: '',
        email: '',
        password: '',
        role: 'employee',
        jobTitle: 'Employee',
        department: 'General',
        ...initialData
      });
    }
  }, [isOpen]); // Only depend on isOpen

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (!formData.name || !formData.email || (!initialData.name && !formData.password)) {
      return;
    }

    if (formData.password && formData.password.length < 6) {
      return;
    }

    try {
      await onSubmit(formData);
      onClose();
    } catch (error) {
      // Error handling is done by parent component
    }
  };

  const handleChange = (field: keyof (CreateUserData & { jobTitle?: string; department?: string; }), value: string) => {
    console.log(`🔤 UserForm: ${String(field)} change:`, value);
    setFormData(prev => {
      const newData = { ...prev, [field]: value };
      console.log('🔤 UserForm: New formData:', newData);
      return newData;
    });
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={title}
      closeOnBackdropClick={false}
      closeOnEscape={false}
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          label="Name"
          value={formData.name}
          onChange={(e) => {
            console.log('🔤 UserForm: Name onChange triggered, value:', e.target.value);
            e.stopPropagation();
            handleChange('name', e.target.value);
          }}
          onKeyDown={(e) => {
            console.log('🔤 UserForm: Name keydown:', e.key);
            e.stopPropagation();
          }}
          placeholder="Enter user name"
          required
          autoFocus
        />
        <Input
          label="Email"
          type="email"
          value={formData.email}
          onChange={(e) => {
            console.log('🔤 UserForm: Email onChange triggered, value:', e.target.value);
            e.stopPropagation();
            handleChange('email', e.target.value);
          }}
          onKeyDown={(e) => {
            console.log('🔤 UserForm: Email keydown:', e.key);
            e.stopPropagation();
          }}
          placeholder="Enter email address"
          required
        />
        {!initialData.name && (
          <Input
            label="Password"
            type="password"
            value={formData.password}
            onChange={(e) => {
              console.log('🔤 UserForm: Password onChange triggered, value:', e.target.value);
              e.stopPropagation();
              handleChange('password', e.target.value);
            }}
            onKeyDown={(e) => {
              console.log('🔤 UserForm: Password keydown:', e.key);
              e.stopPropagation();
            }}
            placeholder="Enter password (min 6 characters)"
            required
          />
        )}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">Role</label>
          <select
            value={formData.role}
            onChange={(e) => {
              e.stopPropagation();
              handleChange('role', e.target.value as 'admin' | 'employee');
            }}
            className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-teal-500"
          >
            <option value="employee">Employee</option>
            <option value="admin">Admin</option>
          </select>
        </div>
        <Input
          label="Job Title"
          value={formData.jobTitle || ''}
          onChange={(e) => {
            e.stopPropagation();
            handleChange('jobTitle', e.target.value);
          }}
          onKeyDown={(e) => {
            e.stopPropagation();
          }}
          placeholder="Enter job title"
          required
        />
        <Input
          label="Department"
          value={formData.department || ''}
          onChange={(e) => {
            e.stopPropagation();
            handleChange('department', e.target.value);
          }}
          onKeyDown={(e) => {
            e.stopPropagation();
          }}
          placeholder="Enter department"
          required
        />
        <div className="flex justify-end space-x-3 pt-4">
          <Button
            type="button"
            variant="secondary"
            onClick={() => {
              onClose();
            }}
          >
            Cancel
          </Button>
          <Button 
            type="submit" 
            disabled={loading}
          >
            {loading ? 'Processing...' : initialData.name ? 'Update User' : 'Create User'}
          </Button>
        </div>
      </form>
    </Modal>
  );
};

export default UserForm;
