import React from 'react';

interface LoadingSkeletonProps {
  className?: string;
}

export const LoadingSkeleton: React.FC<LoadingSkeletonProps> = ({ className = '' }) => (
  <div className={`animate-pulse ${className}`}>
    <div className="h-4 bg-slate-700 rounded"></div>
  </div>
);

export const TableSkeleton: React.FC<{ rows?: number }> = ({ rows = 5 }) => (
  <div className="space-y-4">
    {/* Header skeleton */}
    <div className="grid grid-cols-6 gap-4 p-4 bg-slate-800/50 rounded-lg">
      <LoadingSkeleton />
      <LoadingSkeleton />
      <LoadingSkeleton />
      <LoadingSkeleton />
      <LoadingSkeleton />
      <LoadingSkeleton />
    </div>
    
    {/* Row skeletons */}
    {Array.from({ length: rows }).map((_, index) => (
      <div key={index} className="grid grid-cols-6 gap-4 p-4 bg-slate-800/30 rounded-lg">
        <LoadingSkeleton />
        <LoadingSkeleton />
        <LoadingSkeleton />
        <LoadingSkeleton />
        <LoadingSkeleton />
        <LoadingSkeleton />
      </div>
    ))}
  </div>
);

export const CardSkeleton: React.FC<{ rows?: number }> = ({ rows = 3 }) => (
  <div className="space-y-4">
    {Array.from({ length: rows }).map((_, index) => (
      <div key={index} className="p-4 bg-slate-800/50 rounded-lg space-y-3">
        <div className="flex items-center space-x-3">
          <LoadingSkeleton className="h-4 w-4" />
          <LoadingSkeleton className="h-4 w-32" />
        </div>
        <div className="space-y-2">
          <LoadingSkeleton className="h-3 w-16" />
          <LoadingSkeleton className="h-3 w-24" />
        </div>
        <div className="flex justify-end space-x-2">
          <LoadingSkeleton className="h-8 w-16" />
          <LoadingSkeleton className="h-8 w-16" />
        </div>
      </div>
    ))}
  </div>
);

export const ButtonSkeleton: React.FC = () => (
  <div className="animate-pulse">
    <div className="h-8 w-20 bg-slate-700 rounded"></div>
  </div>
);
