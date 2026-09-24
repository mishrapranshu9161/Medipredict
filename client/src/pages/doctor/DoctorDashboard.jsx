import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { appointmentAPI, patientAPI } from '../../services/api';
import { StatCard } from '../../components/ui/StatCard';
import { StatusBadge } from '../../components/ui/Badge';
import { Calendar, Users, Clock, CheckCircle2, XCircle, Stethoscope, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { LoadingBlock } from '../../components/ui/Spinner';

export const DoctorDashboard = () => {
  const { user } = useAuth();
  const [appointments, setAppointments] = useState([]);
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchQueue = () => {
    setLoading(true);
    Promise.all([
      appointmentAPI.getAppointments({ limit: 10 }),
      patientAPI.getPatients({ limit: 5 })
    ]).then(([appRes, patRes]) => {
      if (appRes.success) setAppointments(appRes.data.appointments);
      if (patRes.success) setPatients(patRes.data.patients);
    }).finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchQueue();
  }, []);

  const handleStatusChange = async (id, status) => {
    try {
      await appointmentAPI.updateStatus(id, { status });
      fetchQueue();
    } catch (err) {
      alert(err.message);
    }
  };

  if (loading) return <LoadingBlock message="Loading doctor workstation..." />;

  const todayStr = new Date().toISOString().split('T')[0];
  const todayAppointments = appointments.filter(a => a.appointmentDate === todayStr);
  const pendingAppointments = appointments.filter(a => a.status === 'Pending');

  return (
    <div className="space-y-8">
      
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-blue-900 rounded-3xl p-6 sm:p-8 text-white shadow-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <span className="px-3 py-1 rounded-full bg-indigo-500/30 text-indigo-200 text-xs font-bold uppercase tracking-wider">
            Clinical Workstation
          </span>
          <h1 className="text-2xl sm:text-3xl font-black mt-2">Welcome, Dr. {user?.name}</h1>
          <p className="text-xs text-slate-300 mt-1">Review appointment queue, record patient vitals, and issue digital prescriptions.</p>
        </div>
        <Link
          to="/doctor/patients"
          className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold shadow-md transition-all flex items-center space-x-2 shrink-0"
        >
          <Stethoscope className="w-4 h-4" />
          <span>New Clinical Encounter</span>
        </Link>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard title="Today's Appointments" value={todayAppointments.length} icon={Clock} color="indigo" subtext="Scheduled Today" />
        <StatCard title="Pending Requests" value={pendingAppointments.length} icon={Calendar} color="amber" subtext="Requires Action" />
        <StatCard title="Total Appointments" value={appointments.length} icon={CheckCircle2} color="emerald" subtext="Total Bookings" />
        <StatCard title="Patient Population" value={patients.length} icon={Users} color="blue" subtext="Registered Patients" />
      </div>

      {/* Main Queue Table */}
      <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-base font-bold text-slate-900">Today & Upcoming Appointment Queue</h3>
          <Link to="/doctor/appointments" className="text-xs font-bold text-indigo-600 hover:underline">
            View Complete Queue
          </Link>
        </div>

        {appointments.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-400 font-extrabold uppercase tracking-wider text-[10px]">
                  <th className="py-3 px-4">Patient Name</th>
                  <th className="py-3 px-4">Date & Time Slot</th>
                  <th className="py-3 px-4">Reason for Visit</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Quick Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                {appointments.slice(0, 6).map((a) => (
                  <tr key={a._id} className="hover:bg-slate-50/50">
                    <td className="py-3 px-4 font-bold text-slate-900">
                      {a.patient?.user?.name || 'Patient'}
                    </td>
                    <td className="py-3 px-4">
                      <span className="font-semibold">{a.appointmentDate}</span>
                      <span className="text-slate-400 block text-[11px]">{a.timeSlot}</span>
                    </td>
                    <td className="py-3 px-4 max-w-xs truncate">{a.reason}</td>
                    <td className="py-3 px-4">
                      <StatusBadge status={a.status} />
                    </td>
                    <td className="py-3 px-4 text-right space-x-2">
                      {a.status === 'Pending' && (
                        <>
                          <button
                            onClick={() => handleStatusChange(a._id, 'Confirmed')}
                            className="px-2.5 py-1 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 rounded-lg font-bold text-[11px]"
                          >
                            Accept
                          </button>
                          <button
                            onClick={() => handleStatusChange(a._id, 'Rejected')}
                            className="px-2.5 py-1 bg-rose-50 text-rose-700 hover:bg-rose-100 rounded-lg font-bold text-[11px]"
                          >
                            Reject
                          </button>
                        </>
                      )}
                      {a.status === 'Confirmed' && (
                        <button
                          onClick={() => handleStatusChange(a._id, 'Completed')}
                          className="px-2.5 py-1 bg-indigo-50 text-indigo-700 hover:bg-indigo-100 rounded-lg font-bold text-[11px]"
                        >
                          Mark Completed
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="py-8 text-center text-xs text-slate-400">No appointments in queue.</div>
        )}
      </div>

    </div>
  );
};
