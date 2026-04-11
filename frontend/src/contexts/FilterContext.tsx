import React, { createContext, useContext, useState } from 'react';
import type { ReactNode } from 'react';

export interface FilterOptions {
  search: string;
  department: string;
  status: string;
  dateRange: string;
  reportType: string;
  employmentType: string;
  location: string;
  sortBy: string;
  sortOrder: 'asc' | 'desc';
}

export interface FilterContextType {
  filters: FilterOptions;
  updateFilter: (key: keyof FilterOptions, value: string) => void;
  updateFilters: (newFilters: Partial<FilterOptions>) => void;
  clearFilters: () => void;
  applyPresetFilter: (preset: string) => void;
  getActiveFilterCount: () => number;
}

const defaultFilters: FilterOptions = {
  search: '',
  department: 'all',
  status: 'all',
  dateRange: 'all',
  reportType: 'all',
  employmentType: 'all',
  location: 'all',
  sortBy: 'name',
  sortOrder: 'asc'
};

const FilterContext = createContext<FilterContextType | undefined>(undefined);

export const useFilters = () => {
  const context = useContext(FilterContext);
  if (!context) {
    throw new Error('useFilters must be used within a FilterProvider');
  }
  return context;
};

interface FilterProviderProps {
  children: ReactNode;
}

export const FilterProvider: React.FC<FilterProviderProps> = ({ children }) => {
  const [filters, setFilters] = useState<FilterOptions>(defaultFilters);

  const updateFilter = (key: keyof FilterOptions, value: string) => {
    setFilters(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const updateFilters = (newFilters: Partial<FilterOptions>) => {
    setFilters(prev => ({
      ...prev,
      ...newFilters
    }));
  };

  const clearFilters = () => {
    setFilters(defaultFilters);
  };

  const applyPresetFilter = (preset: string) => {
    switch (preset) {
      case 'active-employees':
        setFilters({
          ...defaultFilters,
          status: 'active',
          sortBy: 'name'
        });
        break;
      case 'remote-workers':
        setFilters({
          ...defaultFilters,
          employmentType: 'remote',
          sortBy: 'name'
        });
        break;
      case 'recent-hires':
        setFilters({
          ...defaultFilters,
          dateRange: 'last-30-days',
          sortBy: 'createdAt',
          sortOrder: 'desc'
        });
        break;
      case 'pending-leave':
        setFilters({
          ...defaultFilters,
          status: 'pending',
          sortBy: 'date'
        });
        break;
      case 'engineering-dept':
        setFilters({
          ...defaultFilters,
          department: 'engineering',
          sortBy: 'name'
        });
        break;
      default:
        setFilters(defaultFilters);
    }
  };

  const getActiveFilterCount = () => {
    return Object.values(filters).filter(value => 
      value !== '' && value !== 'all' && value !== 'name' && value !== 'asc'
    ).length;
  };

  const value: FilterContextType = {
    filters,
    updateFilter,
    updateFilters,
    clearFilters,
    applyPresetFilter,
    getActiveFilterCount
  };

  return (
    <FilterContext.Provider value={value}>
      {children}
    </FilterContext.Provider>
  );
};
