import React, { useState, useRef, useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { ChevronDown } from 'lucide-react';

interface DropdownOption {
  value: string | number;
  label: string;
}

interface UnifiedDropdownProps {
  value: string | number;
  onChange: (value: string | number) => void;
  options: DropdownOption[];
  placeholder?: string;
  label?: string;
  disabled?: boolean;
  className?: string;
  showLabel?: boolean;
  required?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

const UnifiedDropdown: React.FC<UnifiedDropdownProps> = ({
  value,
  onChange,
  options,
  placeholder = 'Select an option',
  label,
  disabled = false,
  className = '',
  showLabel = true,
  required = false,
  size = 'md'
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [dropUp, setDropUp] = useState(false);
  const [portalStyle, setPortalStyle] = useState<React.CSSProperties>({});
  const triggerRef = useRef<HTMLButtonElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  // Calculate portal position based on trigger button
  const updatePosition = useCallback(() => {
    if (!triggerRef.current) return;
    const rect = triggerRef.current.getBoundingClientRect();
    const estimatedHeight = Math.min(384, options.length * 36);
    const spaceBelow = window.innerHeight - rect.bottom;
    const spaceAbove = rect.top;
    const shouldDropUp = spaceBelow < estimatedHeight && spaceAbove > estimatedHeight;

    setDropUp(shouldDropUp);

    if (shouldDropUp) {
      setPortalStyle({
        position: 'fixed',
        left: rect.left,
        top: rect.top - estimatedHeight - 4,
        width: rect.width,
        zIndex: 99999,
      });
    } else {
      setPortalStyle({
        position: 'fixed',
        left: rect.left,
        top: rect.bottom + 4,
        width: rect.width,
        zIndex: 99999,
      });
    }
  }, [options.length]);

  // Close dropdown when clicking outside
  useEffect(() => {
    if (!isOpen) return;
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node;
      if (
        triggerRef.current && !triggerRef.current.contains(target) &&
        listRef.current && !listRef.current.contains(target)
      ) {
        setIsOpen(false);
      }
    };
    const handleScroll = () => setIsOpen(false);
    const handleResize = () => updatePosition();

    document.addEventListener('mousedown', handleClickOutside);
    window.addEventListener('scroll', handleScroll, true);
    window.addEventListener('resize', handleResize);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      window.removeEventListener('scroll', handleScroll, true);
      window.removeEventListener('resize', handleResize);
    };
  }, [isOpen, updatePosition]);

  // Update position when opening
  useEffect(() => {
    if (isOpen) {
      updatePosition();
    }
  }, [isOpen, updatePosition]);

  const selectedOption = options.find(opt => opt.value === value);
  const displayLabel = selectedOption?.label || placeholder;

  const sizeClasses = {
    sm: 'px-3 py-1 text-sm',
    md: 'px-4 py-2 text-sm',
    lg: 'px-4 py-3 text-base'
  };

  return (
    <div className={`w-full ${className}`}>
      {showLabel && label && (
        <label className="block text-sm font-medium text-gray-300 mb-2">
          {label}
          {required && <span className="text-red-400 ml-1">*</span>}
        </label>
      )}

      <div className="relative">
        <button
          ref={triggerRef}
          type="button"
          onClick={() => !disabled && setIsOpen(!isOpen)}
          disabled={disabled}
          className={`w-full flex items-center justify-between ${sizeClasses[size]} bg-slate-700/60 border border-slate-600 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-all duration-200 ${
            disabled ? 'opacity-50 cursor-not-allowed' : 'hover:border-slate-500'
          }`}
        >
          <span className={selectedOption ? 'text-white' : 'text-gray-400'}>
            {displayLabel}
          </span>
          <ChevronDown
            className={`w-4 h-4 text-gray-400 transition-transform duration-200 ${
              isOpen ? `transform ${dropUp ? 'rotate-0' : 'rotate-180'}` : ''
            }`}
          />
        </button>

        {isOpen && !disabled && createPortal(
          <div
            ref={listRef}
            style={portalStyle}
            className="bg-slate-800 border border-slate-600/50 rounded-lg shadow-2xl overflow-hidden max-w-sm"
          >
            <div className="max-h-96 overflow-y-auto scrollbar-thin scrollbar-thumb-slate-600 scrollbar-track-slate-800">
              {options.map((option) => (
                <button
                  type="button"
                  key={option.value}
                  onClick={() => {
                    onChange(option.value);
                    setIsOpen(false);
                  }}
                  className={`w-full px-4 py-2 text-left text-sm transition-colors ${
                    value === option.value
                      ? 'bg-teal-500/20 text-teal-300'
                      : 'text-gray-300 hover:bg-slate-700/50 hover:text-white'
                  }`}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>,
          document.body
        )}
      </div>
    </div>
  );
};

export default UnifiedDropdown;
