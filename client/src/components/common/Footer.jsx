import React from 'react';
import { Activity } from 'lucide-react';

export const Footer = () => {
  return (
    <footer className="bg-white border-t border-slate-200 mt-auto py-6">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <div className="flex items-center space-x-2">
            <Activity className="w-4 h-4 text-indigo-600" />
            <span className="font-bold text-slate-800">MediPredict Systems</span>
          </div>
          <div>
            <span>Educational Decision-Support System & Hospital Management</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
