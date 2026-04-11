import React from 'react';

interface SkeletonProps {
  className?: string;
  height?: string | number;
  width?: string | number;
  lines?: number;
  variant?: 'text' | 'circular' | 'rectangular' | 'rounded';
}

export const Skeleton: React.FC<SkeletonProps> = ({
  className = '',
  height = 'h-4',
  width = 'w-full',
  lines = 1,
  variant = 'rounded'
}) => {
  const getVariantClasses = () => {
    switch (variant) {
      case 'text':
        return 'h-4 rounded';
      case 'circular':
        return 'rounded-full';
      case 'rectangular':
        return 'rounded-none';
      case 'rounded':
      default:
        return 'rounded-lg';
    }
  };

  const baseClasses = `animate-pulse bg-slate-700 ${getVariantClasses()} ${className}`;
  const sizeClasses = typeof height === 'string' ? height : `h-[${height}px]`;
  const widthClasses = typeof width === 'string' ? width : `w-[${width}px]`;

  if (lines > 1) {
    return (
      <div className="space-y-2">
        {Array.from({ length: lines }, (_, i) => (
          <div
            key={i}
            className={`${baseClasses} ${sizeClasses} ${i === lines - 1 ? widthClasses : 'w-full'}`}
          />
        ))}
      </div>
    );
  }

  return (
    <div className={`${baseClasses} ${sizeClasses} ${widthClasses}`} />
  );
};

// Card Skeleton
export const CardSkeleton: React.FC<{ className?: string }> = ({ className = '' }) => {
  return (
    <div className={`bg-slate-800/60 backdrop-blur-lg border border-slate-700/50 rounded-2xl p-6 ${className}`}>
      <div className="flex items-center space-x-4 mb-4">
        <Skeleton variant="circular" height={40} width={40} />
        <div className="flex-1 space-y-2">
          <Skeleton height={20} width="60%" />
          <Skeleton height={16} width="40%" />
        </div>
      </div>
      <div className="space-y-3">
        <Skeleton height={16} />
        <Skeleton height={16} width="80%" />
        <Skeleton height={16} width="65%" />
      </div>
      <div className="flex justify-between items-center mt-4">
        <Skeleton height={24} width={80} />
        <Skeleton height={32} width={60} />
      </div>
    </div>
  );
};

// Table Skeleton
export const TableSkeleton: React.FC<{ rows?: number; columns?: number; className?: string }> = ({
  rows = 5,
  columns = 4,
  className = ''
}) => {
  return (
    <div className={`bg-slate-800/60 backdrop-blur-lg border border-slate-700/50 rounded-2xl overflow-hidden ${className}`}>
      <div className="px-6 py-4 border-b border-slate-700/50">
        <Skeleton height={28} width={200} />
      </div>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-slate-700/50">
            <tr>
              {Array.from({ length: columns }, (_, i) => (
                <th key={i} className="px-6 py-3">
                  <Skeleton height={16} width="80%" />
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-700/50">
            {Array.from({ length: rows }, (_, rowIndex) => (
              <tr key={rowIndex} className="animate-fadeIn" style={{ animationDelay: `${rowIndex * 50}ms` }}>
                {Array.from({ length: columns }, (_, colIndex) => (
                  <td key={colIndex} className="px-6 py-4">
                    <Skeleton height={16} width={colIndex === 0 ? '60%' : '80%'} />
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

// Dashboard Stats Skeleton
export const StatsSkeleton: React.FC<{ className?: string }> = ({ className = '' }) => {
  return (
    <div className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 ${className}`}>
      {Array.from({ length: 4 }, (_, i) => (
        <div key={i} className="bg-slate-800/60 backdrop-blur-lg border border-slate-700/50 rounded-2xl p-6">
          <div className="flex items-center justify-between mb-4">
            <Skeleton variant="circular" height={48} width={48} />
            <Skeleton height={16} width={60} />
          </div>
          <Skeleton height={32} width={120} className="mb-2" />
          <Skeleton height={16} width={80} />
        </div>
      ))}
    </div>
  );
};

// Form Skeleton
export const FormSkeleton: React.FC<{ fields?: number; className?: string }> = ({
  fields = 4,
  className = ''
}) => {
  return (
    <div className={`bg-slate-800/60 backdrop-blur-lg border border-slate-700/50 rounded-2xl p-6 ${className}`}>
      <div className="space-y-4">
        {Array.from({ length: fields }, (_, i) => (
          <div key={i}>
            <Skeleton height={16} width={120} className="mb-2" />
            <Skeleton height={44} />
          </div>
        ))}
        <div className="flex justify-end space-x-4 pt-4">
          <Skeleton height={40} width={80} />
          <Skeleton height={40} width={120} />
        </div>
      </div>
    </div>
  );
};

// List Skeleton
export const ListSkeleton: React.FC<{ items?: number; className?: string }> = ({
  items = 3,
  className = ''
}) => {
  return (
    <div className={`space-y-4 ${className}`}>
      {Array.from({ length: items }, (_, i) => (
        <div key={i} className="bg-slate-800/60 backdrop-blur-lg border border-slate-700/50 rounded-xl p-4 flex items-center space-x-4">
          <Skeleton variant="circular" height={40} width={40} />
          <div className="flex-1 space-y-2">
            <Skeleton height={20} width="60%" />
            <Skeleton height={16} width="40%" />
          </div>
          <Skeleton height={32} width={80} />
        </div>
      ))}
    </div>
  );
};

export default Skeleton;
