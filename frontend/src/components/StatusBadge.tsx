import React from 'react';

interface StatusBadgeProps {
  status: 'pending' | 'approved' | 'rejected' | 'active' | 'onboarding' | 'remote' | string;
  variant?: 'default' | 'outline';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const StatusBadge: React.FC<StatusBadgeProps> = ({
  status,
  variant = 'default',
  size = 'md',
  className = ''
}) => {
  const getStatusConfig = (status: string) => {
    const configs: { [key: string]: { bg: string; text: string; border: string; dot: string } } = {
      // Leave request statuses
      pending: {
        bg: 'bg-yellow-400/20',
        text: 'text-yellow-400',
        border: 'border-yellow-400/30',
        dot: 'bg-yellow-400'
      },
      approved: {
        bg: 'bg-green-400/20',
        text: 'text-green-400',
        border: 'border-green-400/30',
        dot: 'bg-green-400'
      },
      rejected: {
        bg: 'bg-red-400/20',
        text: 'text-red-400',
        border: 'border-red-400/30',
        dot: 'bg-red-400'
      },
      // Employee/User statuses
      active: {
        bg: 'bg-green-400/20',
        text: 'text-green-400',
        border: 'border-green-400/30',
        dot: 'bg-green-400'
      },
      onboarding: {
        bg: 'bg-yellow-400/20',
        text: 'text-yellow-400',
        border: 'border-yellow-400/30',
        dot: 'bg-yellow-400'
      },
      remote: {
        bg: 'bg-purple-400/20',
        text: 'text-purple-400',
        border: 'border-purple-400/30',
        dot: 'bg-purple-400'
      },
      // Additional statuses
      inactive: {
        bg: 'bg-red-400/20',
        text: 'text-red-400',
        border: 'border-red-400/30',
        dot: 'bg-red-400'
      }
    };

    return configs[status.toLowerCase()] || {
      bg: 'bg-gray-400/20',
      text: 'text-gray-400',
      border: 'border-gray-400/30',
      dot: 'bg-gray-400'
    };
  };

  const config = getStatusConfig(status);

  const sizeClasses = {
    sm: 'px-2 py-1 text-xs',
    md: 'px-3 py-1 text-sm',
    lg: 'px-4 py-2 text-base'
  };

  const dotSizes = {
    sm: 'w-1.5 h-1.5',
    md: 'w-2 h-2',
    lg: 'w-2.5 h-2.5'
  };

  const baseClasses = 'inline-flex items-center font-medium rounded-full transition-all duration-200';
  const variantClasses = variant === 'outline' 
    ? `border ${config.border} ${config.text} bg-transparent`
    : `${config.bg} ${config.text} ${config.border}`;

  const classes = `${baseClasses} ${variantClasses} ${sizeClasses[size]} ${className}`;

  return (
    <span className={classes}>
      <span className={`${dotSizes[size]} ${config.dot} rounded-full mr-2`}></span>
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </span>
  );
};

export default StatusBadge;
