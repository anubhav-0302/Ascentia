import React, { useState, useRef, useEffect } from 'react';
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
  const dropdownRef = useRef<HTMLDivElement>(null);
  const dropdownListRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Check if dropdown should drop up
  useEffect(() => {
    if (isOpen && dropdownRef.current && dropdownListRef.current) {
      const rect = dropdownRef.current.getBoundingClientRect();
      const dropdownHeight = 400; // Increased max height for more options
      const spaceBelow = window.innerHeight - rect.bottom;
      const spaceAbove = rect.top;

      // If not enough space below, drop up
      if (spaceBelow < dropdownHeight && spaceAbove > dropdownHeight) {
        setDropUp(true);
      } else {
        setDropUp(false);
      }
    }
  }, [isOpen]);

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
      
      <div ref={dropdownRef} className="relative">
        <button
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

        {isOpen && !disabled && (
          <div 
            ref={dropdownListRef}
            className={`absolute left-0 right-0 z-[99999] bg-slate-800 border border-slate-600/50 rounded-lg shadow-2xl overflow-hidden min-w-full max-w-sm ${
              dropUp ? 'bottom-full mb-1' : 'top-full mt-1'
            }`}
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
          </div>
        )}
      </div>
    </div>
  );
};

export default UnifiedDropdown;
