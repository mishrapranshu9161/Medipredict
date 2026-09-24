import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  LayoutDashboard,
  Calendar,
  Users,
  UserPlus,
  FileText,
  FlaskConical,
  Activity,
  Sparkles,
  Pill,
  Building2,
  BrainCircuit,
  PieChart,
  UserCheck,
  X
} from 'lucide-react';

export const Sidebar = ({ isOpen, onClose }) => {
  const { user } = useAuth();

  if (!user) return null;

  const patientLinks = [
    { name: 'Dashboard', path: '/patient/dashboard', icon: LayoutDashboard },
    { name: 'Appointments', path: '/patient/appointments', icon: Calendar },
    { name: 'Disease Risk Predictor', path: '/patient/prediction', icon: Sparkles, highlight: true },
    { name: 'Prescriptions', path: '/patient/prescriptions', icon: FileText },
    { name: 'Lab Reports', path: '/patient/labs', icon: FlaskConical },
    { name: 'My Profile', path: '/patient/profile', icon: UserCheck }
  ];

  const doctorLinks = [
    { name: 'Dashboard', path: '/doctor/dashboard', icon: LayoutDashboard },
    { name: 'Appointments Queue', path: '/doctor/appointments', icon: Calendar },
    { name: 'Patient Directory', path: '/doctor/patients', icon: Users }
  ];

  const adminLinks = [
    { name: 'Dashboard & Analytics', path: '/admin/dashboard', icon: LayoutDashboard },
    { name: 'Manage Patients', path: '/admin/patients', icon: Users },
    { name: 'Manage Doctors', path: '/admin/doctors', icon: UserPlus },
    { name: 'Departments', path: '/admin/departments', icon: Building2 },
    { name: 'Appointments', path: '/admin/appointments', icon: Calendar },
    { name: 'Medicines Inventory', path: '/admin/medicines', icon: Pill },
    { name: 'Disease Database', path: '/admin/diseases', icon: BrainCircuit },
    { name: 'Lab Tests & Reports', path: '/admin/labs', icon: FlaskConical }
  ];

  let links = patientLinks;
  if (user.role === 'doctor') links = doctorLinks;
  if (user.role === 'admin') links = adminLinks;

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          onClick={onClose}
          className="fixed inset-0 z-40 bg-slate-900/40 backdrop-blur-xs lg:hidden"
        />
      )}

      <aside
        className={`fixed top-16 bottom-0 left-0 z-40 w-64 bg-white border-r border-slate-200/80 transform transition-transform duration-300 ease-in-out lg:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex flex-col h-full py-4 px-3 justify-between">
          <div className="space-y-1">
            <div className="flex items-center justify-between px-3 mb-2 lg:hidden">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Navigation</span>
              <button onClick={onClose} className="p-1 text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            {links.map((link) => {
              const Icon = link.icon;
              return (
                <NavLink
                  key={link.path}
                  to={link.path}
                  onClick={onClose}
                  className={({ isActive }) =>
                    `flex items-center space-x-3 px-3.5 py-2.5 rounded-xl font-semibold text-xs transition-all ${
                      isActive
                        ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/20'
                        : link.highlight
                        ? 'bg-gradient-to-r from-indigo-50 to-blue-50 text-indigo-700 border border-indigo-200/60 hover:bg-indigo-100/50'
                        : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                    }`
                  }
                >
                  <Icon className="w-4 h-4" />
                  <span>{link.name}</span>
                </NavLink>
              );
            })}
          </div>

          {/* User Card at bottom of sidebar */}
          <div className="p-3 bg-slate-50 border border-slate-100 rounded-2xl">
            <div className="flex items-center space-x-2.5">
              <div className="w-8 h-8 rounded-lg bg-indigo-600 text-white flex items-center justify-center font-bold text-xs">
                {user.name.charAt(0).toUpperCase()}
              </div>
              <div className="flex flex-col truncate">
                <span className="text-xs font-bold text-slate-800 truncate">{user.name}</span>
                <span className="text-[10px] text-slate-400 capitalize">{user.role} Portal</span>
              </div>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
};
