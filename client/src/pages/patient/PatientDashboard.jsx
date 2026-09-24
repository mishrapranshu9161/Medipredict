import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { appointmentAPI, prescriptionAPI, labAPI, predictionAPI } from '../../services/api';
import { StatCard } from '../../components/ui/StatCard';
import { StatusBadge } from '../../components/ui/Badge';
import { Calendar, Sparkles, FileText, FlaskConical, ArrowRight, Activity, Clock } from 'lucide-react';
import { Link } from 'react-router-dom';
import { LoadingBlock } from '../../components/ui/Spinner';

export const PatientDashboard = () => {
  const { user } = useAuth();
  const [appointments, setAppointments] = useState([]);
  const [prescriptions, setPrescriptions] = useState([]);
  const [labs, setLabs] = useState([]);
  const [predictions, setPredictions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      appointmentAPI.getAppointments({ limit: 5 }),
      prescriptionAPI.getPrescriptions(),
      labAPI.getLabReports(),
      predictionAPI.getHistory()
    ]).then(([appRes, rxRes, labRes, predRes]) => {
      if (appRes.success) setAppointments(appRes.data.appointments);
      if (rxRes.success) setPrescriptions(rxRes.data.prescriptions);
      if (labRes.success) setLabs(labRes.data.reports);
      if (predRes.success) setPredictions(predRes.data.history);
    }).finally(() => setLoading(false));
  }, []);

  if (loading) return <LoadingBlock message="Loading patient dashboard metrics..." />;

  const upcomingAppointment = appointments.find(a => ['Pending', 'Confirmed'].includes(a.status));

  return (
    <div className="space-y-8">
      
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-indigo-900 via-blue-900 to-slate-900 rounded-3xl p-6 sm:p-8 text-white shadow-xl relative overflow-hidden">
        <div className="relative z-10 max-w-xl">
          <span className="px-3 py-1 rounded-full bg-indigo-500/30 text-indigo-200 text-xs font-bold uppercase tracking-wider">
            Patient Portal
          </span>
          <h1 className="text-2xl sm:text-3xl font-black mt-2">Welcome back, {user?.name}!</h1>
          <p className="text-xs sm:text-sm text-slate-300 mt-1 leading-relaxed">
            Manage your medical appointments, view lab reports, download digital prescriptions, and check potential symptoms.
          </p>
          <div className="flex flex-wrap gap-3 mt-6">
            <Link
              to="/patient/appointments"
              className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold shadow-md shadow-indigo-600/30 transition-all flex items-center space-x-2"
            >
              <Calendar className="w-4 h-4" />
              <span>Book Appointment</span>
            </Link>
            <Link
              to="/patient/prediction"
              className="px-5 py-2.5 bg-white/10 hover:bg-white/20 text-white border border-white/20 rounded-xl text-xs font-bold backdrop-blur-md transition-all flex items-center space-x-2"
            >
              <Sparkles className="w-4 h-4 text-indigo-300" />
              <span>Analyze Symptoms</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Quick Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard title="Appointments" value={appointments.length} icon={Calendar} color="indigo" subtext="Total Booked" />
        <StatCard title="Prescriptions" value={prescriptions.length} icon={FileText} color="emerald" subtext="Digital Rx Issued" />
        <StatCard title="Lab Reports" value={labs.length} icon={FlaskConical} color="amber" subtext="Reports Uploaded" />
        <StatCard title="Risk Assessments" value={predictions.length} icon={Activity} color="rose" subtext="Engine Queries" />
      </div>

      {/* Main Grid: Upcoming & Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Upcoming Appointment Spotlight */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-bold text-slate-900 flex items-center space-x-2">
                <Clock className="w-5 h-5 text-indigo-600" />
                <span>Next Scheduled Appointment</span>
              </h3>
              <Link to="/patient/appointments" className="text-xs font-bold text-indigo-600 hover:underline">
                View All
              </Link>
            </div>

            {upcomingAppointment ? (
              <div className="p-4 rounded-2xl bg-indigo-50/50 border border-indigo-100 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                  <div className="flex items-center space-x-2">
                    <span className="font-extrabold text-sm text-slate-900">
                      {upcomingAppointment.doctor?.user?.name || 'Doctor'}
                    </span>
                    <StatusBadge status={upcomingAppointment.status} />
                  </div>
                  <p className="text-xs font-semibold text-indigo-700 mt-0.5">
                    {upcomingAppointment.doctor?.specialization} ({upcomingAppointment.department?.name})
                  </p>
                  <p className="text-xs text-slate-500 mt-2">
                    📅 Date: <strong className="text-slate-800">{upcomingAppointment.appointmentDate}</strong> | ⏰ Slot: <strong className="text-slate-800">{upcomingAppointment.timeSlot}</strong>
                  </p>
                </div>
                <Link
                  to="/patient/appointments"
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold shadow-xs transition-all"
                >
                  Manage
                </Link>
              </div>
            ) : (
              <div className="py-8 text-center text-xs text-slate-400">
                No upcoming appointment scheduled.
              </div>
            )}
          </div>

          {/* Recent Prescriptions */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-bold text-slate-900 flex items-center space-x-2">
                <FileText className="w-5 h-5 text-emerald-600" />
                <span>Recent Prescriptions</span>
              </h3>
              <Link to="/patient/prescriptions" className="text-xs font-bold text-indigo-600 hover:underline">
                View Prescriptions
              </Link>
            </div>

            {prescriptions.length > 0 ? (
              <div className="space-y-3">
                {prescriptions.slice(0, 3).map(rx => (
                  <div key={rx._id} className="p-3.5 rounded-xl border border-slate-100 bg-slate-50 flex items-center justify-between text-xs">
                    <div>
                      <p className="font-bold text-slate-800">{rx.diagnosis}</p>
                      <p className="text-[11px] text-slate-500 mt-0.5">
                        Dr. {rx.doctor?.user?.name} | {rx.medicines?.length} Medicines
                      </p>
                    </div>
                    <Link
                      to={`/prescriptions/${rx._id}/print`}
                      target="_blank"
                      className="px-3 py-1.5 bg-white border border-slate-200 text-slate-700 hover:bg-slate-100 rounded-lg font-bold text-[11px]"
                    >
                      Print Rx
                    </Link>
                  </div>
                ))}
              </div>
            ) : (
              <div className="py-6 text-center text-xs text-slate-400">No prescriptions issued yet.</div>
            )}
          </div>
        </div>

        {/* Right Sidebar Widget: Risk Engine Banner */}
        <div className="space-y-6">
          <div className="bg-gradient-to-br from-indigo-600 to-blue-700 rounded-2xl p-6 text-white shadow-md">
            <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center mb-3">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <h3 className="text-lg font-bold">Educational Symptom Checker</h3>
            <p className="text-xs text-indigo-100 mt-2 leading-relaxed">
              Select symptoms like fever, cough, or headache to receive weighted educational risk assessment and care advice.
            </p>
            <Link
              to="/patient/prediction"
              className="mt-6 w-full py-2.5 rounded-xl bg-white text-indigo-700 hover:bg-indigo-50 font-bold text-xs shadow-md transition-all flex items-center justify-center space-x-1.5"
            >
              <span>Start Risk Assessment</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>

      </div>
    </div>
  );
};
