import React from 'react';

interface LayoutWrapperProps {
  children: React.ReactNode;
  className?: string;
}

const LayoutWrapper: React.FC<LayoutWrapperProps> = ({ 
  children, 
  className = "" 
}) => {
  return (
    <main className={`max-w-7xl mx-auto px-6 py-6 ${className}`}>
      {children}
    </main>
  );
};

export default LayoutWrapper;
