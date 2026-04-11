import React, { useState } from 'react';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  hover?: boolean;
  clickable?: boolean;
  onClick?: () => void;
  padding?: 'sm' | 'md' | 'lg';
  variant?: 'default' | 'outlined' | 'elevated' | 'glass';
  animated?: boolean;
  delay?: number;
}

const Card: React.FC<CardProps> = ({
  children,
  className = '',
  hover = true,
  clickable = false,
  onClick,
  padding = 'md',
  variant = 'default',
  animated = true,
  delay = 0
}) => {
  const [isHovered, setIsHovered] = useState(false);
  const [isPressed, setIsPressed] = useState(false);

  const handleMouseEnter = () => {
    if (hover) setIsHovered(true);
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
  };

  const handleMouseDown = () => {
    if (clickable) setIsPressed(true);
  };

  const handleMouseUp = () => {
    setIsPressed(false);
  };

  const handleClick = () => {
    if (onClick && clickable) {
      onClick();
    }
  };

  const baseClasses = 'bg-slate-800/60 backdrop-blur-lg border border-slate-700/50 rounded-2xl transition-all duration-300 ease-out relative overflow-hidden';
  
  const variantClasses = {
    default: 'shadow-md',
    outlined: 'border-2 border-slate-600/50 shadow-sm',
    elevated: 'shadow-lg',
    glass: 'bg-slate-800/40 backdrop-blur-xl border-slate-600/30 shadow-xl'
  };

  const hoverClasses = hover ? [
    'hover:shadow-2xl',
    'hover:scale-[1.02]',
    'hover:border-slate-600/70',
    'hover:bg-slate-800/80'
  ].join(' ') : '';

  const clickableClasses = clickable ? [
    'cursor-pointer',
    'active:scale-[0.98]',
    'select-none'
  ].join(' ') : '';

  const stateClasses = [
    isPressed ? 'scale-[0.98]' : '',
    isHovered && hover ? 'shadow-2xl scale-[1.02] border-slate-600/70 bg-slate-800/80' : ''
  ].filter(Boolean).join(' ');
  
  const paddingClasses = {
    sm: 'p-4',
    md: 'p-6',
    lg: 'p-8'
  };

  const animationClasses = animated ? `animate-fadeIn` : '';
  const delayStyle = delay > 0 ? { animationDelay: `${delay}ms` } : {};

  const classes = [
    baseClasses,
    variantClasses[variant],
    hoverClasses,
    clickableClasses,
    stateClasses,
    paddingClasses[padding],
    animationClasses,
    className
  ].filter(Boolean).join(' ');

  return (
    <div
      className={classes}
      style={delayStyle}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onMouseDown={handleMouseDown}
      onMouseUp={handleMouseUp}
      onClick={handleClick}
    >
      {/* Subtle glow effect on hover */}
      <div 
        className="card-glow" 
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'radial-gradient(circle at var(--mouse-x, 50%) var(--mouse-y, 50%), rgba(20, 184, 166, 0.1) 0%, transparent 50%)',
          opacity: isHovered ? 1 : 0,
          transition: 'opacity 0.3s ease',
          pointerEvents: 'none'
        }}
      />
      
      {/* Content */}
      <div className="relative z-10">
        {children}
      </div>
    </div>
  );
};

// Interactive Card with enhanced effects
export const InteractiveCard: React.FC<{
  children: React.ReactNode;
  onClick: () => void;
  className?: string;
  title?: string;
  subtitle?: string;
  icon?: React.ReactNode;
  action?: React.ReactNode;
}> = ({ 
  children, 
  onClick, 
  className = '',
  title,
  subtitle,
  icon,
  action
}) => {
  return (
    <Card
      clickable
      onClick={onClick}
      hover
      variant="elevated"
      className={`group ${className}`}
    >
      {icon && (
        <div className="flex items-center justify-center w-12 h-12 bg-slate-700/50 rounded-xl mb-4 text-teal-400 group-hover:scale-110 transition-transform duration-300">
          {icon}
        </div>
      )}
      
      {title && (
        <h3 className="text-lg font-semibold text-white mb-1 group-hover:text-teal-400 transition-colors duration-200">
          {title}
        </h3>
      )}
      
      {subtitle && (
        <p className="text-gray-400 text-sm mb-4">
          {subtitle}
        </p>
      )}
      
      <div className="text-gray-300 text-sm">
        {children}
      </div>
      
      {action && (
        <div className="mt-4 flex items-center justify-between">
          {action}
          <div className="text-teal-400 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </div>
        </div>
      )}
    </Card>
  );
};

// Stats Card for dashboard metrics
export const StatsCard: React.FC<{
  title: string;
  value: string | number;
  change?: {
    value: string;
    trend: 'up' | 'down' | 'neutral';
  };
  icon?: React.ReactNode;
  className?: string;
  loading?: boolean;
}> = ({ 
  title, 
  value, 
  change, 
  icon, 
  className = '',
  loading = false
}) => {
  if (loading) {
    return (
      <Card className={className}>
        <div className="animate-pulse">
          <div className="flex items-center justify-between mb-4">
            <div className="w-8 h-8 bg-slate-700 rounded-lg"></div>
            <div className="w-16 h-4 bg-slate-700 rounded"></div>
          </div>
          <div className="w-24 h-8 bg-slate-700 rounded mb-2"></div>
          <div className="w-20 h-4 bg-slate-700 rounded"></div>
        </div>
      </Card>
    );
  }

  const getTrendColor = () => {
    switch (change?.trend) {
      case 'up':
        return 'text-green-400';
      case 'down':
        return 'text-red-400';
      default:
        return 'text-gray-400';
    }
  };

  const getTrendIcon = () => {
    switch (change?.trend) {
      case 'up':
        return <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />;
      case 'down':
        return <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 17h8m0 0V9m0 8l-8-8-4 4-6-6" />;
      default:
        return <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 12h14" />;
    }
  };

  return (
    <Card hover className={className}>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center justify-center w-12 h-12 bg-slate-700/50 rounded-xl text-teal-400">
          {icon}
        </div>
        {change && (
          <div className={`flex items-center text-sm font-medium ${getTrendColor()}`}>
            <svg className="w-4 h-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              {getTrendIcon()}
            </svg>
            {change.value}
          </div>
        )}
      </div>
      
      <div>
        <p className="text-gray-400 text-sm mb-1">{title}</p>
        <p className="text-2xl font-bold text-white">{value}</p>
      </div>
    </Card>
  );
};

export default Card;
