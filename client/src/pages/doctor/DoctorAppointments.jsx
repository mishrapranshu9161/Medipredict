import React, { useState, useEffect } from 'react';
import { appointmentAPI } from '../../services/api';
import { StatusBadge } from '../../components/ui/Badge';
import { LoadingBlock } from '../../components/ui/Spinner';
import { EmptyState } from '../../components/ui/EmptyState';
import { Search, Filter, Calendar as CalendarIcon, CheckCircle2, XCircle } from 'lucide-react';

export const DoctorAppointments = () => {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('');
  const [dateFilter, setDateFilter] = useState('');

  const fetchAppointments = () => {
    setLoading(true);
    appointmentAPI.getAppointments({ status: statusFilter, date: dateFilter })
      .then(res => res.success && setAppointments(res.data.appointments))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchAppointments();
  }, [statusFilter, dateFilter]);

  const handleUpdateStatus = async (id, status) => {
    try {
      await appointmentAPI.updateStatus(id, { status });
      fetchAppointments();
    } catch (err) {
      alert(err.message);
    }
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-black text-slate-900">Doctor Consultation Queue</h1>
        <p className="text-xs text-slate-500 mt-1">Review pending patient appointment requests, accept, or mark encounters complete.</p>
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-col sm:flex-row gap-4">
        <div className="flex-1">
          <input
            type="date"
            value={dateFilter}
            onChange={(e) => setDateFilter(e.target.value)}
            className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs"
          />
        </div>
        <div className="w-full sm:w-64">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold"
          >
            <option value="">All Statuses</option>
            <option value="Pending">Pending</option>
            <option value="Confirmed">Confirmed</option>
            <option value="Completed">Completed</option>
            <option value="Cancelled">Cancelled</option>
            <option value="Rejected">Rejected</option>
          </select>
        </div>
      </div>

      {/* Appointments List */}
      {loading ? (
        <LoadingBlock message="Loading appointments queue..." />
      ) : appointments.length > 0 ? (
        <div className="bg-white rounded-3xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-400 font-extrabold uppercase tracking-wider text-[10px]">
                  <th className="py-3.5 px-4">Patient Demographics</th>
                  <th className="py-3.5 px-4">Date & Slot</th>
                  <th className="py-3.5 px-4">Reason for Visit</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                {appointments.map((a) => (
                  <tr key={a._id} className="hover:bg-slate-50/50">
                    <td className="py-3.5 px-4 font-bold text-slate-900">
                      <div>{a.patient?.user?.name || 'Patient'}</div>
                      <span className="text-[11px] text-slate-400 font-normal">{a.patient?.user?.email} | {a.patient?.user?.phone}</span>
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="font-semibold text-slate-900">{a.appointmentDate}</span>
                      <span className="text-slate-400 block text-[11px]">{a.timeSlot}</span>
                    </td>
                    <td className="py-3.5 px-4 max-w-xs truncate">{a.reason}</td>
                    <td className="py-3.5 px-4">
                      <StatusBadge status={a.status} />
                    </td>
                    <td className="py-3.5 px-4 text-right space-x-2">
                      {a.status === 'Pending' && (
                        <>
                          <button
                            onClick={() => handleUpdateStatus(a._id, 'Confirmed')}
                            className="px-3 py-1.5 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 rounded-lg font-bold text-[11px]"
                          >
                            Accept
                          </button>
                          <button
                            onClick={() => handleUpdateStatus(a._id, 'Rejected')}
                            className="px-3 py-1.5 bg-rose-50 text-rose-700 hover:bg-rose-100 rounded-lg font-bold text-[11px]"
                          >
                            Reject
                          </button>
                        </>
                      )}
                      {a.status === 'Confirmed' && (
                        <button
                          onClick={() => handleUpdateStatus(a._id, 'Completed')}
                          className="px-3 py-1.5 bg-indigo-50 text-indigo-700 hover:bg-indigo-100 rounded-lg font-bold text-[11px]"
                        >
                          Complete Encounter
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <EmptyState title="No appointments found" description="No patient appointments match the selected filter." />
      )}
    </div>
  );
};
