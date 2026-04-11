import React from 'react';
import ErrorBoundary from './ErrorBoundary';

interface StandardLayoutProps {
  children: React.ReactNode;
  title?: string;
  description?: string;
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | '7xl' | 'full';
  padding?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}

export const StandardLayout: React.FC<StandardLayoutProps> = ({
  children,
  title,
  description,
  maxWidth = '7xl',
  padding = 'md',
  className = ''
}) => {
  const getMaxWidthClass = () => {
    switch (maxWidth) {
      case 'sm': return 'max-w-sm';
      case 'md': return 'max-w-md';
      case 'lg': return 'max-w-lg';
      case 'xl': return 'max-w-xl';
      case 'full': return 'max-w-full';
      case '7xl':
      default: return 'max-w-7xl';
    }
  };

  const getPaddingClass = () => {
    switch (padding) {
      case 'sm': return 'px-4 py-4';
      case 'md': return 'px-6 py-6';
      case 'lg': return 'px-8 py-8';
      case 'xl': return 'px-12 py-12';
      default: return 'px-6 py-6';
    }
  };

  return (
    <ErrorBoundary>
      <div className={`text-white ${getPaddingClass()} ${className}`}>
        <div className={`${getMaxWidthClass()} mx-auto`}>
          {(title || description) && (
            <div className="mb-8">
              {title && (
                <h1 className="text-4xl font-bold text-white mb-2">
                  {title}
                </h1>
              )}
              {description && (
                <p className="text-gray-400 text-sm">
                  {description}
                </p>
              )}
            </div>
          )}
          {children}
        </div>
      </div>
    </ErrorBoundary>
  );
};

export default StandardLayout;
