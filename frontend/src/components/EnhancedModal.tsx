import React, { useEffect, useState } from 'react';
import { X } from 'lucide-react';

interface EnhancedModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
  showCloseButton?: boolean;
  closeOnBackdropClick?: boolean;
  className?: string;
}

export const EnhancedModal: React.FC<EnhancedModalProps> = ({
  isOpen,
  onClose,
  title,
  children,
  size = 'md',
  showCloseButton = true,
  closeOnBackdropClick = true,
  className = ''
}) => {
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setIsAnimating(true);
      document.body.style.overflow = 'hidden';
    } else {
      setIsAnimating(false);
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget && closeOnBackdropClick) {
      onClose();
    }
  };

  const getSizeClasses = () => {
    switch (size) {
      case 'sm':
        return 'max-w-md';
      case 'lg':
        return 'max-w-4xl';
      case 'xl':
        return 'max-w-6xl';
      case 'full':
        return 'max-w-full mx-4';
      case 'md':
      default:
        return 'max-w-2xl';
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      onClick={handleBackdropClick}
    >
      {/* Backdrop */}
      <div
        className={`
          absolute inset-0 bg-black/60 backdrop-blur-sm
          transition-opacity duration-300 ease-out
          ${isAnimating ? 'opacity-100' : 'opacity-0'}
        `}
      />
      
      {/* Modal Content */}
      <div
        className={`
          relative w-full ${getSizeClasses()}
          bg-slate-800 border border-slate-700 rounded-2xl shadow-2xl
          transition-all duration-300 ease-out
          ${isAnimating 
            ? 'opacity-100 scale-100 translate-y-0' 
            : 'opacity-0 scale-95 translate-y-4'
          }
          ${className}
        `}
      >
        {/* Header */}
        {(title || showCloseButton) && (
          <div className="flex items-center justify-between px-6 py-4 border-b border-slate-700">
            {title && (
              <h2 className="text-xl font-semibold text-white">
                {title}
              </h2>
            )}
            {showCloseButton && (
              <button
                onClick={onClose}
                className="p-2 text-gray-400 hover:text-white hover:bg-slate-700 rounded-lg transition-colors duration-200"
                aria-label="Close modal"
              >
                <X className="w-5 h-5" />
              </button>
            )}
          </div>
        )}

        {/* Content */}
        <div className="px-6 py-4">
          {children}
        </div>
      </div>
    </div>
  );
};

// Slide Modal (slides in from side)
export const SlideModal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
  position?: 'right' | 'left' | 'top' | 'bottom';
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}> = ({
  isOpen,
  onClose,
  children,
  position = 'right',
  size = 'md',
  className = ''
}) => {
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setIsAnimating(true);
      document.body.style.overflow = 'hidden';
    } else {
      setIsAnimating(false);
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  const getPositionClasses = () => {
    const baseClasses = 'fixed top-0 h-full bg-slate-800 border-l border-slate-700 shadow-2xl transition-transform duration-300 ease-out z-50';
    
    switch (position) {
      case 'left':
        return `${baseClasses} left-0 border-r border-l-0`;
      case 'top':
        return `${baseClasses} top-0 left-0 right-0 h-auto max-h-[50vh] border-b border-t-0 border-l-0 border-r-0`;
      case 'bottom':
        return `${baseClasses} bottom-0 left-0 right-0 h-auto max-h-[50vh] border-t border-b-0 border-l-0 border-r-0`;
      case 'right':
      default:
        return `${baseClasses} right-0`;
    }
  };

  const getSizeClasses = () => {
    switch (size) {
      case 'sm':
        return position === 'top' || position === 'bottom' ? 'max-w-sm' : 'w-80';
      case 'lg':
        return position === 'top' || position === 'bottom' ? 'max-w-4xl' : 'w-96';
      case 'xl':
        return position === 'top' || position === 'bottom' ? 'max-w-6xl' : 'w-[480px]';
      case 'md':
      default:
        return position === 'top' || position === 'bottom' ? 'max-w-2xl' : 'w-80';
    }
  };

  const getTransformClasses = () => {
    switch (position) {
      case 'left':
        return isAnimating ? 'translate-x-0' : '-translate-x-full';
      case 'top':
        return isAnimating ? 'translate-y-0' : '-translate-y-full';
      case 'bottom':
        return isAnimating ? 'translate-y-0' : 'translate-y-full';
      case 'right':
      default:
        return isAnimating ? 'translate-x-0' : 'translate-x-full';
    }
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className={`
          fixed inset-0 bg-black/60 backdrop-blur-sm z-40
          transition-opacity duration-300 ease-out
          ${isAnimating ? 'opacity-100' : 'opacity-0'}
        `}
        onClick={onClose}
      />
      
      {/* Slide Panel */}
      <div
        className={`
          ${getPositionClasses()} ${getSizeClasses()}
          ${getTransformClasses()}
          ${className}
        `}
      >
        <div className="h-full overflow-y-auto p-6">
          {children}
        </div>
      </div>
    </>
  );
};

// Confirmation Modal
export const ConfirmModal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  variant?: 'danger' | 'warning' | 'info';
  loading?: boolean;
}> = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  variant = 'danger',
  loading = false
}) => {
  const getVariantClasses = () => {
    switch (variant) {
      case 'warning':
        return 'text-yellow-400 bg-yellow-400/10 border-yellow-400/30';
      case 'info':
        return 'text-blue-400 bg-blue-400/10 border-blue-400/30';
      case 'danger':
      default:
        return 'text-red-400 bg-red-400/10 border-red-400/30';
    }
  };

  return (
    <EnhancedModal isOpen={isOpen} onClose={onClose} size="sm">
      <div className="text-center">
        <div className={`mx-auto flex items-center justify-center h-12 w-12 rounded-full border mb-4 ${getVariantClasses()}`}>
          <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
          </svg>
        </div>
        
        <h3 className="text-lg font-medium text-white mb-2">
          {title}
        </h3>
        
        <p className="text-sm text-gray-400 mb-6">
          {message}
        </p>
        
        <div className="flex justify-center space-x-3">
          <button
            onClick={onClose}
            disabled={loading}
            className="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-xl font-medium transition-all duration-200 disabled:opacity-50"
          >
            {cancelText}
          </button>
          <button
            onClick={onConfirm}
            disabled={loading}
            className={`px-4 py-2 rounded-xl font-medium transition-all duration-200 disabled:opacity-50 ${
              variant === 'danger' 
                ? 'bg-red-500 hover:bg-red-400 text-white' 
                : variant === 'warning'
                ? 'bg-yellow-500 hover:bg-yellow-400 text-white'
                : 'bg-blue-500 hover:bg-blue-400 text-white'
            }`}
          >
            {loading ? (
              <div className="flex items-center space-x-2">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                <span>Processing...</span>
              </div>
            ) : (
              confirmText
            )}
          </button>
        </div>
      </div>
    </EnhancedModal>
  );
};

export default EnhancedModal;
