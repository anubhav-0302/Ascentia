import React from 'react';

interface SkeletonProps {
  className?: string;
  variant?: 'text' | 'circular' | 'rectangular';
  width?: string | number;
  height?: string | number;
  lines?: number;
}

const SkeletonLoader: React.FC<SkeletonProps> = ({
  className = '',
  variant = 'text',
  width,
  height,
  lines = 1
}) => {
  const baseClasses = 'skeleton';
  
  const variantClasses = {
    text: 'h-4 rounded',
    circular: 'rounded-full',
    rectangular: 'rounded-lg'
  };

  const style: React.CSSProperties = {};
  if (width) style.width = typeof width === 'number' ? `${width}px` : width;
  if (height) style.height = typeof height === 'number' ? `${height}px` : height;

  if (variant === 'text' && lines > 1) {
    return (
      <div className={`space-y-2 ${className}`}>
        {Array.from({ length: lines }, (_, index) => (
          <div
            key={index}
            className={`${baseClasses} ${variantClasses[variant]}`}
            style={{
              ...style,
              width: index === lines - 1 ? '70%' : style.width || '100%'
            }}
          />
        ))}
      </div>
    );
  }

  return (
    <div
      className={`${baseClasses} ${variantClasses[variant]} ${className}`}
      style={style}
    />
  );
};

// Card Skeleton for Dashboard
export const CardSkeleton: React.FC = () => (
  <div className="bg-slate-800/60 backdrop-blur-lg border border-slate-700/50 rounded-2xl p-6">
    <div className="flex items-center justify-between mb-4">
      <SkeletonLoader variant="circular" width={48} height={48} />
      <SkeletonLoader width={60} height={16} />
    </div>
    <SkeletonLoader height={32} className="mb-2" />
    <SkeletonLoader width={120} height={16} />
  </div>
);

// Table Skeleton
export const TableSkeleton: React.FC<{ rows?: number }> = ({ rows = 5 }) => (
  <div className="space-y-3">
    {Array.from({ length: rows }, (_, index) => (
      <div key={index} className="flex items-center space-x-4 p-4 bg-slate-700/30 rounded-lg">
        <SkeletonLoader variant="circular" width={40} height={40} />
        <div className="flex-1 space-y-2">
          <SkeletonLoader height={16} width="40%" />
          <SkeletonLoader height={14} width="60%" />
        </div>
        <SkeletonLoader width={80} height={24} />
      </div>
    ))}
  </div>
);

// Chart Skeleton
export const ChartSkeleton: React.FC = () => (
  <div className="bg-slate-800/60 backdrop-blur-lg border border-slate-700/50 rounded-2xl p-6">
    <SkeletonLoader height={24} width={200} className="mb-4" />
    <div className="flex items-center justify-center" style={{ height: '250px' }}>
      <div className="relative w-32 h-32">
        <SkeletonLoader variant="circular" width={128} height={128} className="absolute" />
      </div>
    </div>
  </div>
);

export default SkeletonLoader;
