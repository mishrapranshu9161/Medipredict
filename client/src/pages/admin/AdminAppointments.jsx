import React, { useState, useEffect } from 'react';
import { appointmentAPI } from '../../services/api';
import { StatusBadge } from '../../components/ui/Badge';
import { LoadingBlock } from '../../components/ui/Spinner';
import { EmptyState } from '../../components/ui/EmptyState';

export const AdminAppointments = () => {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('');

  const fetchAppointments = () => {
    setLoading(true);
    appointmentAPI.getAppointments({ status: statusFilter })
      .then(res => res.success && setAppointments(res.data.appointments))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchAppointments();
  }, [statusFilter]);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-black text-slate-900">System Appointments Overview</h1>
        <p className="text-xs text-slate-500 mt-1">Audit all outpatient appointment bookings across hospital departments.</p>
      </div>

      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex justify-end">
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold"
        >
          <option value="">All Statuses</option>
          <option value="Pending">Pending</option>
          <option value="Confirmed">Confirmed</option>
          <option value="Completed">Completed</option>
          <option value="Cancelled">Cancelled</option>
          <option value="Rejected">Rejected</option>
        </select>
      </div>

      {loading ? (
        <LoadingBlock message="Fetching appointments..." />
      ) : appointments.length > 0 ? (
        <div className="bg-white rounded-3xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-400 font-extrabold uppercase tracking-wider text-[10px]">
                  <th className="py-3.5 px-4">Patient</th>
                  <th className="py-3.5 px-4">Doctor & Department</th>
                  <th className="py-3.5 px-4">Date & Slot</th>
                  <th className="py-3.5 px-4">Reason</th>
                  <th className="py-3.5 px-4">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                {appointments.map((a) => (
                  <tr key={a._id} className="hover:bg-slate-50/50">
                    <td className="py-3.5 px-4 font-bold text-slate-900">{a.patient?.user?.name || 'Patient'}</td>
                    <td className="py-3.5 px-4">
                      <div>Dr. {a.doctor?.user?.name || 'Doctor'}</div>
                      <span className="text-[11px] text-indigo-600">{a.department?.name}</span>
                    </td>
                    <td className="py-3.5 px-4 font-semibold">{a.appointmentDate} ({a.timeSlot})</td>
                    <td className="py-3.5 px-4 max-w-xs truncate">{a.reason}</td>
                    <td className="py-3.5 px-4"><StatusBadge status={a.status} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <EmptyState title="No appointments" description="No appointments found." />
      )}
    </div>
  );
};
