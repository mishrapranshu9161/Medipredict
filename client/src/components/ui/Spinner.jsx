import React from 'react';

export const Spinner = ({ size = 'md', className = '' }) => {
  const sizes = {
    sm: 'h-4 w-4 border-2',
    md: 'h-8 w-8 border-3',
    lg: 'h-12 w-12 border-4'
  };

  return (
    <div className={`inline-block animate-spin rounded-full border-indigo-600 border-t-transparent ${sizes[size] || sizes.md} ${className}`} />
  );
};

export const LoadingBlock = ({ message = 'Loading details...' }) => (
  <div className="py-12 flex flex-col items-center justify-center text-slate-500">
    <Spinner size="lg" className="mb-3" />
    <p className="text-sm font-medium">{message}</p>
  </div>
);
