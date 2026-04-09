import React from 'react';

interface EmptyStateProps {
  icon?: string;
  title: string;
  description: string;
  action?: {
    label: string;
    onClick: () => void;
  };
  className?: string;
}

const EmptyState: React.FC<EmptyStateProps> = ({
  icon = 'fas fa-inbox',
  title,
  description,
  action,
  className = ''
}) => {
  return (
    <div className={`flex flex-col items-center justify-center py-12 px-6 text-center animate-fadeIn ${className}`}>
      <div className="text-gray-500 text-5xl mb-4 animate-pulse-slow">
        <i className={icon}></i>
      </div>
      <h3 className="text-lg font-semibold text-white mb-2">{title}</h3>
      <p className="text-gray-400 text-sm max-w-md mb-6">{description}</p>
      {action && (
        <button
          onClick={action.onClick}
          className="px-6 py-3 bg-teal-600 text-white rounded-xl hover:bg-teal-700 button-interactive flex items-center space-x-2"
        >
          <span>{action.label}</span>
        </button>
      )}
    </div>
  );
};

// Specific Empty States for different contexts
export const EmployeesEmptyState: React.FC<{ onAddEmployee?: () => void }> = ({ onAddEmployee }) => (
  <EmptyState
    icon="fas fa-users-slash"
    title="No Employees Yet"
    description="Start building your team by adding your first employee. Track their information, manage leave requests, and monitor performance."
    action={onAddEmployee ? {
      label: "Add First Employee",
      onClick: onAddEmployee
    } : undefined}
  />
);

export const LeaveEmptyState: React.FC<{ onSubmitLeave?: () => void }> = ({ onSubmitLeave }) => (
  <EmptyState
    icon="fas fa-calendar-times"
    title="No Leave Requests"
    description="Submit your first leave request or manage existing ones. Track approval status and view your leave history."
    action={onSubmitLeave ? {
      label: "Submit Leave Request",
      onClick: onSubmitLeave
    } : undefined}
  />
);

export const DepartmentsEmptyState: React.FC<{ onAddDepartment?: () => void }> = ({ onAddDepartment }) => (
  <EmptyState
    icon="fas fa-building"
    title="No Departments"
    description="Create departments to organize your team structure and improve management efficiency."
    action={onAddDepartment ? {
      label: "Create Department",
      onClick: onAddDepartment
    } : undefined}
  />
);

export const DataEmptyState: React.FC<{ onRefresh?: () => void }> = ({ onRefresh }) => (
  <EmptyState
    icon="fas fa-chart-line"
    title="No Data Available"
    description="There's no data to display yet. Start adding information to see meaningful insights and analytics."
    action={onRefresh ? {
      label: "Refresh Data",
      onClick: onRefresh
    } : undefined}
  />
);

export const SearchEmptyState: React.FC<{ onClearSearch?: () => void }> = ({ onClearSearch }) => (
  <EmptyState
    icon="fas fa-search"
    title="No Results Found"
    description="We couldn't find any matching results. Try adjusting your search terms or filters."
    action={onClearSearch ? {
      label: "Clear Search",
      onClick: onClearSearch
    } : undefined}
  />
);

export default EmptyState;
