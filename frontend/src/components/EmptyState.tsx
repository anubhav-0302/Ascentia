import React from 'react';
import { 
  Users, 
  Calendar, 
  Search, 
  Building, 
  TrendingUp, 
  Plus,
  RefreshCw,
  ArrowRight,
  Inbox,
  AlertCircle
} from 'lucide-react';

interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  description: string;
  action?: {
    label: string;
    onClick: () => void;
    variant?: 'primary' | 'secondary';
    icon?: React.ReactNode;
  };
  secondaryAction?: {
    label: string;
    onClick: () => void;
  };
  className?: string;
  animated?: boolean;
}

const EmptyState: React.FC<EmptyStateProps> = ({
  icon = <Inbox className="w-12 h-12" />,
  title,
  description,
  action,
  secondaryAction,
  className = '',
  animated = true
}) => {
  return (
    <div className={`flex flex-col items-center justify-center py-12 px-6 text-center ${animated ? 'animate-fadeIn' : ''} ${className}`}>
      {/* Icon Container */}
      <div className="flex items-center justify-center w-20 h-20 bg-slate-700/50 rounded-2xl mb-6 text-gray-400 backdrop-blur-sm border border-slate-600/50 hover:border-slate-500/50 transition-colors duration-300">
        {icon}
      </div>

      {/* Content */}
      <h3 className="text-xl font-semibold text-white mb-2">
        {title}
      </h3>
      
      <p className="text-gray-400 text-sm max-w-md mb-8 leading-relaxed">
        {description}
      </p>

      {/* Actions */}
      {(action || secondaryAction) && (
        <div className="flex flex-col sm:flex-row gap-3 items-center">
          {action && (
            <button
              onClick={action.onClick}
              className={`
                inline-flex items-center px-6 py-3 rounded-xl font-medium transition-all duration-200
                ${action.variant === 'secondary'
                  ? 'bg-slate-700 hover:bg-slate-600 text-white shadow-md hover:shadow-lg active:scale-95'
                  : 'bg-teal-600 hover:bg-teal-500 text-white shadow-lg hover:shadow-xl active:scale-95'
                }
              `}
            >
              {action.icon && <span className="mr-2">{action.icon}</span>}
              {action.label}
              <ArrowRight className="ml-2 w-4 h-4" />
            </button>
          )}
          
          {secondaryAction && (
            <button
              onClick={secondaryAction.onClick}
              className="text-gray-400 hover:text-white transition-colors duration-200 text-sm font-medium flex items-center"
            >
              {secondaryAction.label}
            </button>
          )}
        </div>
      )}
    </div>
  );
};

// Enhanced Specific Empty States with better icons and actions
export const EmployeesEmptyState: React.FC<{ 
  onAddEmployee?: () => void;
  className?: string;
}> = ({ onAddEmployee, className = '' }) => (
  <EmptyState
    icon={<Users className="w-12 h-12" />}
    title="No Employees Yet"
    description="Start building your team by adding your first employee. Track their information, manage leave requests, and monitor performance."
    action={onAddEmployee ? {
      label: "Add First Employee",
      onClick: onAddEmployee,
      icon: <Plus className="w-4 h-4" />
    } : undefined}
    className={className}
  />
);

export const LeaveEmptyState: React.FC<{ 
  onSubmitLeave?: () => void;
  isEmployee?: boolean;
  className?: string;
}> = ({ onSubmitLeave, isEmployee = true, className = '' }) => (
  <EmptyState
    icon={<Calendar className="w-12 h-12" />}
    title={isEmployee ? "No Leave Requests" : "No Leave Requests to Review"}
    description={isEmployee 
      ? "Submit your first leave request or manage existing ones. Track approval status and view your leave history."
      : "When employees submit leave requests, they will appear here for your review and approval."
    }
    action={onSubmitLeave ? {
      label: isEmployee ? "Submit Leave Request" : "Refresh",
      onClick: onSubmitLeave,
      icon: isEmployee ? <Plus className="w-4 h-4" /> : <RefreshCw className="w-4 h-4" />
    } : undefined}
    className={className}
  />
);

export const DepartmentsEmptyState: React.FC<{ 
  onAddDepartment?: () => void;
  className?: string;
}> = ({ onAddDepartment, className = '' }) => (
  <EmptyState
    icon={<Building className="w-12 h-12" />}
    title="No Departments"
    description="Create departments to organize your team structure and improve management efficiency."
    action={onAddDepartment ? {
      label: "Create Department",
      onClick: onAddDepartment,
      icon: <Plus className="w-4 h-4" />
    } : undefined}
    className={className}
  />
);

export const DataEmptyState: React.FC<{ 
  onRefresh?: () => void;
  className?: string;
}> = ({ onRefresh, className = '' }) => (
  <EmptyState
    icon={<TrendingUp className="w-12 h-12" />}
    title="No Data Available"
    description="There's no data to display yet. Start adding information to see meaningful insights and analytics."
    action={onRefresh ? {
      label: "Refresh Data",
      onClick: onRefresh,
      icon: <RefreshCw className="w-4 h-4" />
    } : undefined}
    className={className}
  />
);

export const SearchEmptyState: React.FC<{ 
  onClearSearch?: () => void;
  searchTerm?: string;
  className?: string;
}> = ({ onClearSearch, searchTerm, className = '' }) => (
  <EmptyState
    icon={<Search className="w-12 h-12" />}
    title="No Results Found"
    description={searchTerm 
      ? `We couldn't find any results for "${searchTerm}". Try different keywords or check your spelling.`
      : "We couldn't find any matching results. Try adjusting your search terms or filters."
    }
    secondaryAction={onClearSearch ? {
      label: "Clear Search",
      onClick: onClearSearch
    } : undefined}
    className={className}
  />
);

// New Error State
export const ErrorState: React.FC<{ 
  title?: string;
  description?: string;
  onRetry?: () => void;
  className?: string;
}> = ({ 
  title = "Something went wrong",
  description = "An error occurred while loading the data. Please try again or contact support if the problem persists.",
  onRetry,
  className = '' 
}) => (
  <EmptyState
    icon={<AlertCircle className="w-12 h-12" />}
    title={title}
    description={description}
    action={onRetry ? {
      label: "Try Again",
      onClick: onRetry,
      icon: <RefreshCw className="w-4 h-4" />
    } : undefined}
    className={className}
  />
);

// Loading State
export const LoadingState: React.FC<{ 
  message?: string;
  className?: string;
}> = ({ 
  message = "Loading your data...",
  className = '' 
}) => (
  <div className={`flex flex-col items-center justify-center py-12 px-6 text-center ${className}`}>
    <div className="flex items-center justify-center w-20 h-20 bg-slate-700/50 rounded-2xl mb-6 text-teal-400">
      <RefreshCw className="w-12 h-12 animate-spin" />
    </div>
    <h3 className="text-xl font-semibold text-white mb-2">
      Loading...
    </h3>
    <p className="text-gray-400 text-sm max-w-md">
      {message}
    </p>
  </div>
);

export default EmptyState;
