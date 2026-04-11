import React, { useState } from 'react';

interface ButtonProps {
  children: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  disabled?: boolean;
  loading?: boolean;
  icon?: React.ReactNode;
  iconPosition?: 'left' | 'right';
  className?: string;
  onClick?: () => void;
  type?: 'button' | 'submit' | 'reset';
  loadingText?: string;
  successText?: string;
  onSuccess?: () => void;
}

const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'primary',
  size = 'md',
  disabled = false,
  loading = false,
  icon,
  iconPosition = 'left',
  className = '',
  onClick,
  type = 'button',
  loadingText = 'Loading...',
  successText,
  onSuccess
}) => {
  const [showSuccess, setShowSuccess] = useState(false);
  const [isPressed, setIsPressed] = useState(false);

  const handleClick = () => {
    if (!disabled && !loading && !showSuccess) {
      setIsPressed(true);
      setTimeout(() => setIsPressed(false), 150);
      
      if (onClick) {
        onClick();
      }
      
      if (successText && onSuccess) {
        onSuccess();
        setShowSuccess(true);
        setTimeout(() => setShowSuccess(false), 2000);
      }
    }
  };

  const baseClasses = 'font-medium rounded-xl transition-all duration-200 inline-flex items-center justify-center focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-900 relative overflow-hidden';
  
  const variantClasses = {
    primary: 'bg-teal-600 hover:bg-teal-500 text-white focus:ring-teal-500 shadow-lg hover:shadow-xl active:scale-95',
    secondary: 'bg-slate-700 hover:bg-slate-600 text-white focus:ring-slate-500 shadow-md hover:shadow-lg active:scale-95',
    danger: 'bg-red-500 hover:bg-red-400 text-white focus:ring-red-500 shadow-lg hover:shadow-xl active:scale-95'
  };

  const sizeClasses = {
    sm: 'px-3 py-1.5 text-sm min-h-[32px]',
    md: 'px-4 py-2 text-sm min-h-[40px]',
    lg: 'px-6 py-3 text-base min-h-[48px]'
  };

  const disabledClasses = disabled || loading ? 'opacity-50 cursor-not-allowed active:scale-100' : 'cursor-pointer';

  const classes = `${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]} ${disabledClasses} ${isPressed ? 'scale-95' : ''} ${className}`;

  const renderIcon = () => {
    if (!icon) return null;
    return (
      <span className={`${iconPosition === 'left' ? 'mr-2' : 'ml-2'} flex items-center transition-transform duration-200 ${isPressed ? 'scale-90' : 'scale-100'}`}>
        {icon}
      </span>
    );
  };

  const renderContent = () => {
    if (showSuccess && successText) {
      return (
        <>
          <svg className="animate-checkmark mr-2 h-4 w-4 text-current" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
          {successText}
        </>
      );
    }

    if (loading) {
      return (
        <>
          <div className="relative">
            <svg className="animate-spin h-4 w-4 text-current" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
          </div>
          <span className="ml-2">{loadingText}</span>
        </>
      );
    }

    return (
      <>
        {iconPosition === 'left' && renderIcon()}
        <span className="transition-transform duration-200">{children}</span>
        {iconPosition === 'right' && renderIcon()}
      </>
    );
  };

  // Ripple effect
  const createRipple = (e: React.MouseEvent<HTMLButtonElement>) => {
    const button = e.currentTarget;
    const rect = button.getBoundingClientRect();
    const ripple = document.createElement('span');
    const size = Math.max(rect.width, rect.height);
    const x = e.clientX - rect.left - size / 2;
    const y = e.clientY - rect.top - size / 2;

    ripple.style.width = ripple.style.height = size + 'px';
    ripple.style.left = x + 'px';
    ripple.style.top = y + 'px';
    ripple.style.position = 'absolute';
    ripple.style.borderRadius = '50%';
    ripple.style.background = 'rgba(255, 255, 255, 0.3)';
    ripple.style.transform = 'scale(0)';
    ripple.style.animation = 'ripple-animation 0.6s ease-out';
    ripple.style.pointerEvents = 'none';

    button.appendChild(ripple);

    setTimeout(() => {
      ripple.remove();
    }, 600);
  };

  return (
    <button
      type={type}
      className={classes}
      disabled={disabled || loading}
      onClick={handleClick}
      onMouseDown={(e) => createRipple(e)}
    >
      {renderContent()}
    </button>
  );
};

export default Button;
