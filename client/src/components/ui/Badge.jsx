import React from 'react';

export const Badge = ({ children, variant = 'info', className = '' }) => {
  const variants = {
    success: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    warning: 'bg-amber-50 text-amber-700 border-amber-200',
    danger: 'bg-rose-50 text-rose-700 border-rose-200',
    info: 'bg-blue-50 text-blue-700 border-blue-200',
    indigo: 'bg-indigo-50 text-indigo-700 border-indigo-200',
    gray: 'bg-slate-100 text-slate-700 border-slate-200'
  };

  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${
        variants[variant] || variants.info
      } ${className}`}
    >
      {children}
    </span>
  );
};

export const StatusBadge = ({ status }) => {
  let variant = 'info';
  switch (status) {
    case 'Completed':
    case 'Confirmed':
    case 'Available':
      variant = 'success';
      break;
    case 'Pending':
    case 'Requested':
    case 'Processing':
      variant = 'warning';
      break;
    case 'Cancelled':
    case 'Rejected':
    case 'Out of Stock':
      variant = 'danger';
      break;
    default:
      variant = 'gray';
  }
  return <Badge variant={variant}>{status}</Badge>;
};
