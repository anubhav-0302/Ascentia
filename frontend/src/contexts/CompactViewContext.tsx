import React, { createContext, useContext } from 'react';
import { useSettingsStore } from '../store/useSettingsStore';

interface CompactViewContextType {
  isCompact: boolean;
}

const CompactViewContext = createContext<CompactViewContextType>({
  isCompact: false,
});

export const useCompactView = () => {
  const context = useContext(CompactViewContext);
  return context;
};

interface CompactViewProviderProps {
  children: React.ReactNode;
}

export const CompactViewProvider: React.FC<CompactViewProviderProps> = ({ children }) => {
  const { settings } = useSettingsStore();
  const isCompact = settings?.compactView ?? false; // Default to false

  return (
    <CompactViewContext.Provider value={{ isCompact }}>
      <div className={isCompact ? 'compact-view' : ''}>
        {children}
      </div>
    </CompactViewContext.Provider>
  );
};
