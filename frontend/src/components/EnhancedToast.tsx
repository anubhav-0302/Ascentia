import toast from 'react-hot-toast';
import type { ToastPosition, ToastOptions } from 'react-hot-toast';

// Enhanced toast configurations
export const toastConfig = {
  // Success toasts
  success: (message: string, options?: Partial<ToastOptions>) => {
    return toast.success(message, {
      duration: 4000,
      position: 'top-right' as ToastPosition,
      style: {
        background: '#10b981',
        color: '#ffffff',
        padding: '16px',
        borderRadius: '12px',
        fontSize: '14px',
        fontWeight: '500',
        boxShadow: '0 10px 25px rgba(16, 185, 129, 0.3)',
        border: '1px solid rgba(16, 185, 129, 0.2)',
      },
      iconTheme: {
        primary: '#ffffff',
        secondary: '#10b981',
      },
      ...options,
    });
  },

  // Error toasts
  error: (message: string, options?: Partial<ToastOptions>) => {
    return toast.error(message, {
      duration: 6000,
      position: 'top-right' as ToastPosition,
      style: {
        background: '#ef4444',
        color: '#ffffff',
        padding: '16px',
        borderRadius: '12px',
        fontSize: '14px',
        fontWeight: '500',
        boxShadow: '0 10px 25px rgba(239, 68, 68, 0.3)',
        border: '1px solid rgba(239, 68, 68, 0.2)',
      },
      iconTheme: {
        primary: '#ffffff',
        secondary: '#ef4444',
      },
      ...options,
    });
  },

  // Loading toasts
  loading: (message: string, options?: Partial<ToastOptions>) => {
    return toast.loading(message, {
      position: 'top-right' as ToastPosition,
      style: {
        background: '#6366f1',
        color: '#ffffff',
        padding: '16px',
        borderRadius: '12px',
        fontSize: '14px',
        fontWeight: '500',
        boxShadow: '0 10px 25px rgba(99, 102, 241, 0.3)',
        border: '1px solid rgba(99, 102, 241, 0.2)',
      },
      ...options,
    });
  },

  // Info toasts
  info: (message: string, options?: Partial<ToastOptions>) => {
    return toast(message, {
      duration: 5000,
      position: 'top-right' as ToastPosition,
      icon: 'ℹ️',
      style: {
        background: '#3b82f6',
        color: '#ffffff',
        padding: '16px',
        borderRadius: '12px',
        fontSize: '14px',
        fontWeight: '500',
        boxShadow: '0 10px 25px rgba(59, 130, 246, 0.3)',
        border: '1px solid rgba(59, 130, 246, 0.2)',
      },
      ...options,
    });
  },

  // Warning toasts
  warning: (message: string, options?: Partial<ToastOptions>) => {
    return toast(message, {
      duration: 5000,
      position: 'top-right' as ToastPosition,
      icon: '⚠️',
      style: {
        background: '#f59e0b',
        color: '#ffffff',
        padding: '16px',
        borderRadius: '12px',
        fontSize: '14px',
        fontWeight: '500',
        boxShadow: '0 10px 25px rgba(245, 158, 11, 0.3)',
        border: '1px solid rgba(245, 158, 11, 0.2)',
      },
      ...options,
    });
  },
};

// Specific toast messages for common actions
export const appToasts = {
  // Employee related
  employeeAdded: () => toastConfig.success('Employee added successfully!'),
  employeeUpdated: () => toastConfig.success('Employee updated successfully!'),
  employeeDeleted: () => toastConfig.success('Employee deleted successfully!'),
  employeeError: (error?: string) => toastConfig.error(error || 'Failed to perform employee action'),

  // Leave related
  leaveSubmitted: () => toastConfig.success('Leave request submitted successfully!'),
  leaveApproved: () => toastConfig.success('Leave request approved!'),
  leaveRejected: () => toastConfig.success('Leave request rejected!'),
  leaveUpdated: () => toastConfig.success('Leave request updated successfully!'),
  leaveError: (error?: string) => toastConfig.error(error || 'Failed to perform leave action'),

  // Authentication related
  loginSuccess: () => toastConfig.success('Welcome back! You have successfully logged in.'),
  loginError: (error?: string) => toastConfig.error(error || 'Login failed. Please check your credentials.'),
  logoutSuccess: () => toastConfig.success('You have been successfully logged out.'),

  // General actions
  dataLoaded: (type: string) => toastConfig.success(`${type} loaded successfully!`),
  dataLoading: (type: string) => toastConfig.loading(`Loading ${type}...`),
  dataError: (type: string, error?: string) => toastConfig.error(error || `Failed to load ${type}`),
  saveSuccess: (item: string) => toastConfig.success(`${item} saved successfully!`),
  saveError: (item: string, error?: string) => toastConfig.error(error || `Failed to save ${item}`),
  deleteSuccess: (item: string) => toastConfig.success(`${item} deleted successfully!`),
  deleteError: (item: string, error?: string) => toastConfig.error(error || `Failed to delete ${item}`),

  // Network related
  networkError: () => toastConfig.error('Network error. Please check your connection and try again.'),
  serverError: () => toastConfig.error('Server error. Please try again later.'),
  unauthorized: () => toastConfig.error('You are not authorized to perform this action.'),

  // Form validation
  validationError: (field: string) => toastConfig.error(`Please enter a valid ${field}`),
  requiredField: (field: string) => toastConfig.error(`${field} is required`),
  fileSizeError: (size: string) => toastConfig.error(`File size must be less than ${size}`),
  fileTypeError: (types: string) => toastConfig.error(`File type must be ${types}`),

  // Success messages with more context
  actionCompleted: (action: string, item: string) => toastConfig.success(`${action} ${item} successfully!`),
  actionInProgress: (action: string) => toastConfig.loading(`${action} in progress...`),
};

// Toast promise wrapper for async operations
export const toastPromise = async <T,>(
  promise: Promise<T>,
  messages: {
    loading: string;
    success: string;
    error: string;
  },
  options?: ToastOptions
): Promise<T> => {
  return toast.promise(
    promise,
    {
      loading: messages.loading,
      success: messages.success,
      error: messages.error,
    },
    {
      position: 'top-right',
      style: {
        borderRadius: '12px',
        fontSize: '14px',
        fontWeight: '500',
      },
      ...options,
    }
  );
};

export default toastConfig;
