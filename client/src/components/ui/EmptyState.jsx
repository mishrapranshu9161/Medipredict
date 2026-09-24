import React from 'react';
import { Inbox } from 'lucide-react';

export const EmptyState = ({ title = 'No records found', description = 'There are no entries available to display at this time.', icon: Icon = Inbox, actionButton }) => {
  return (
    <div className="py-12 px-4 text-center border-2 border-dashed border-slate-200 rounded-2xl bg-white/50 my-4">
      <div className="mx-auto w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 mb-3">
        <Icon className="w-6 h-6" />
      </div>
      <h4 className="text-base font-semibold text-slate-800 mb-1">{title}</h4>
      <p className="text-sm text-slate-500 max-w-sm mx-auto mb-4">{description}</p>
      {actionButton && <div>{actionButton}</div>}
    </div>
  );
};
