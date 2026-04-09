import React, { useEffect, useState } from 'react';

interface ToastProps {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  title: string;
  message?: string;
  duration?: number;
  onClose: (id: string) => void;
}

const Toast: React.FC<ToastProps> = ({
  id,
  type,
  title,
  message,
  duration = 5000,
  onClose
}) => {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      handleClose();
    }, duration);

    return () => clearTimeout(timer);
  }, [duration]);

  const handleClose = () => {
    setIsVisible(false);
    setTimeout(() => onClose(id), 300);
  };

  const getToastConfig = () => {
    const configs = {
      success: {
        icon: 'fas fa-check-circle',
        bgColor: 'bg-green-500/10',
        borderColor: 'border-green-500/30',
        iconColor: 'text-green-400',
        titleColor: 'text-green-400'
      },
      error: {
        icon: 'fas fa-exclamation-circle',
        bgColor: 'bg-red-500/10',
        borderColor: 'border-red-500/30',
        iconColor: 'text-red-400',
        titleColor: 'text-red-400'
      },
      warning: {
        icon: 'fas fa-exclamation-triangle',
        bgColor: 'bg-yellow-500/10',
        borderColor: 'border-yellow-500/30',
        iconColor: 'text-yellow-400',
        titleColor: 'text-yellow-400'
      },
      info: {
        icon: 'fas fa-info-circle',
        bgColor: 'bg-blue-500/10',
        borderColor: 'border-blue-500/30',
        iconColor: 'text-blue-400',
        titleColor: 'text-blue-400'
      }
    };
    return configs[type];
  };

  const config = getToastConfig();

  return (
    <div
      className={`
        flex items-start space-x-3 p-4 rounded-xl border backdrop-blur-lg shadow-lg
        ${config.bgColor} ${config.borderColor}
        ${isVisible ? 'toast-enter' : 'toast-exit'}
        min-w-[320px] max-w-md
      `}
    >
      <div className={`flex-shrink-0 ${config.iconColor}`}>
        <i className={`${config.icon} text-xl`}></i>
      </div>
      <div className="flex-1 min-w-0">
        <h4 className={`font-semibold ${config.titleColor} mb-1`}>{title}</h4>
        {message && (
          <p className="text-gray-300 text-sm leading-relaxed">{message}</p>
        )}
      </div>
      <button
        onClick={handleClose}
        className="flex-shrink-0 text-gray-400 hover:text-white transition-colors duration-200"
      >
        <i className="fas fa-times text-sm"></i>
      </button>
    </div>
  );
};

// Toast Container Component
interface ToastContainerProps {
  toasts: Array<{
    id: string;
    type: 'success' | 'error' | 'warning' | 'info';
    title: string;
    message?: string;
    duration?: number;
  }>;
  onClose: (id: string) => void;
}

export const ToastContainer: React.FC<ToastContainerProps> = ({ toasts, onClose }) => {
  return (
    <div className="fixed top-4 right-4 z-50 space-y-3">
      {toasts.map((toast) => (
        <Toast
          key={toast.id}
          {...toast}
          onClose={onClose}
        />
      ))}
    </div>
  );
};

// Toast Hook for easy usage
interface ToastMessage {
  type: 'success' | 'error' | 'warning' | 'info';
  title: string;
  message?: string;
  duration?: number;
}

export const useToast = () => {
  const [toasts, setToasts] = useState<Array<ToastMessage & { id: string }>>([]);

  const addToast = (toast: ToastMessage) => {
    const id = Date.now().toString();
    setToasts(prev => [...prev, { ...toast, id }]);
  };

  const removeToast = (id: string) => {
    setToasts(prev => prev.filter(toast => toast.id !== id));
  };

  // Convenience methods
  const success = (title: string, message?: string) => {
    addToast({ type: 'success', title, message });
  };

  const error = (title: string, message?: string) => {
    addToast({ type: 'error', title, message });
  };

  const warning = (title: string, message?: string) => {
    addToast({ type: 'warning', title, message });
  };

  const info = (title: string, message?: string) => {
    addToast({ type: 'info', title, message });
  };

  return {
    toasts,
    addToast,
    removeToast,
    success,
    error,
    warning,
    info
  };
};

// Predefined toast messages for common actions
export const ToastMessages = {
  employee: {
    added: {
      type: 'success' as const,
      title: 'Employee Added Successfully',
      message: 'The new employee has been added to your team and can now access the system.'
    },
    updated: {
      type: 'success' as const,
      title: 'Employee Updated',
      message: 'Employee information has been updated successfully.'
    },
    deleted: {
      type: 'warning' as const,
      title: 'Employee Removed',
      message: 'The employee has been removed from your team.'
    },
    error: {
      type: 'error' as const,
      title: 'Failed to Update Employee',
      message: 'There was an error updating the employee information. Please try again.'
    }
  },
  leave: {
    submitted: {
      type: 'success' as const,
      title: 'Leave Request Submitted',
      message: 'Your leave request has been submitted and is awaiting approval.'
    },
    approved: {
      type: 'success' as const,
      title: 'Leave Approved',
      message: 'The leave request has been approved successfully.'
    },
    rejected: {
      type: 'warning' as const,
      title: 'Leave Rejected',
      message: 'The leave request has been rejected. Please check the reason provided.'
    },
    cancelled: {
      type: 'info' as const,
      title: 'Leave Cancelled',
      message: 'The leave request has been cancelled.'
    }
  },
  auth: {
    login: {
      type: 'success' as const,
      title: 'Welcome Back!',
      message: 'You have successfully logged in to your account.'
    },
    logout: {
      type: 'info' as const,
      title: 'Logged Out',
      message: 'You have been successfully logged out.'
    },
    error: {
      type: 'error' as const,
      title: 'Authentication Failed',
      message: 'Invalid credentials. Please check your email and password.'
    }
  },
  general: {
    saved: {
      type: 'success' as const,
      title: 'Changes Saved',
      message: 'Your changes have been saved successfully.'
    },
    error: {
      type: 'error' as const,
      title: 'Something Went Wrong',
      message: 'An unexpected error occurred. Please try again.'
    },
    network: {
      type: 'error' as const,
      title: 'Network Error',
      message: 'Unable to connect to the server. Please check your internet connection.'
    }
  }
};

export default Toast;
