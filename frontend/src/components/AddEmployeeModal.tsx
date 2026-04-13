import React, { useState } from "react";
import toast from "react-hot-toast";
import { employeeApi, type CreateEmployeeRequest } from "../api/employeeApi";
import { useNotificationStore, createEmployeeNotification } from "../store/notificationStore";
import Button from "./Button";
import Input from "./Input";
import { EnhancedModal } from "./EnhancedModal";

interface AddEmployeeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export function AddEmployeeModal({ isOpen, onClose, onSuccess }: AddEmployeeModalProps) {
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      await employeeApi.createEmployee(formData);
      toast.success("Employee added successfully!");
      
      const notification = createEmployeeNotification('added', formData.name || 'Unknown Employee');
      useNotificationStore.getState().addNotification(notification);
      
      setFormData({
        name: "",
        email: "",
        jobTitle: "",
        department: "",
        location: "",
        status: "Active"
      });
      
      onClose();
      onSuccess?.();
    } catch (err: any) {
      setError(err.message || "Failed to add employee");
      toast.error("Failed to add employee");
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    if (!loading) {
      setFormData({
        name: "",
        email: "",
        jobTitle: "",
        department: "",
        location: "",
        status: "Active"
      });
      setError("");
      onClose();
    }
  };

  return (
    <EnhancedModal
      isOpen={isOpen}
      onClose={handleClose}
      title="Add Employee"
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
          disabled={loading}
        />
        
        <Input
          name="email"
          type="email"
          value={formData.email}
          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
          placeholder="Email"
          required
          disabled={loading}
        />
        
        <Input
          name="jobTitle"
          value={formData.jobTitle}
          onChange={(e) => setFormData({ ...formData, jobTitle: e.target.value })}
          placeholder="Job Title"
          required
          disabled={loading}
        />
        
        <Input
          name="department"
          value={formData.department}
          onChange={(e) => setFormData({ ...formData, department: e.target.value })}
          placeholder="Department"
          required
          disabled={loading}
        />
        
        <Input
          name="location"
          value={formData.location}
          onChange={(e) => setFormData({ ...formData, location: e.target.value })}
          placeholder="Location"
          required
          disabled={loading}
        />
        
        <div className="flex justify-end space-x-3 pt-4">
          <Button
            type="button"
            onClick={handleClose}
            disabled={loading}
            variant="secondary"
          >
            Cancel
          </Button>
          <Button
            type="submit"
            disabled={loading}
            loading={loading}
          >
            Add Employee
          </Button>
        </div>
      </form>
    </EnhancedModal>
  );
}
