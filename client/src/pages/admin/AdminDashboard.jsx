import React, { useState, useEffect } from 'react';
import { adminAPI } from '../../services/api';
import { StatCard } from '../../components/ui/StatCard';
import { Users, UserPlus, Calendar, CheckCircle2, Clock, AlertTriangle, Sparkles, Building2 } from 'lucide-react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Legend, PieChart, Pie, Cell } from 'recharts';
import { LoadingBlock } from '../../components/ui/Spinner';

export const AdminDashboard = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    adminAPI.getAnalytics()
      .then(res => res.success && setData(res.data))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <LoadingBlock message="Loading system-wide analytics charts..." />;
  if (!data) return <div className="p-8 text-center text-slate-500 font-bold">Failed to load analytics</div>;

  const { summary, departmentStats, statusDistribution, monthlyTrend } = data;

  const COLORS = ['#10B981', '#F59E0B', '#3B82F6', '#EF4444'];

  return (
    <div className="space-y-8">
      
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-blue-900 rounded-3xl p-6 sm:p-8 text-white shadow-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <span className="px-3 py-1 rounded-full bg-indigo-500/30 text-indigo-200 text-xs font-bold uppercase tracking-wider">
            Hospital System Analytics
          </span>
          <h1 className="text-2xl sm:text-3xl font-black mt-2">Executive Admin Dashboard</h1>
          <p className="text-xs text-slate-300 mt-1">Real-time patient growth, doctor productivity, appointment status, and disease prediction statistics.</p>
        </div>
      </div>

      {/* Summary Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard title="Total Patients" value={summary.totalPatients} icon={Users} color="indigo" subtext="Registered Accounts" />
        <StatCard title="Total Doctors" value={summary.totalDoctors} icon={UserPlus} color="emerald" subtext="Active Faculty" />
        <StatCard title="Total Appointments" value={summary.totalAppointments} icon={Calendar} color="amber" subtext="Total Encounters" />
        <StatCard title="Disease Predictions" value={summary.totalPredictions} icon={Sparkles} color="rose" subtext="Risk Engine Runs" />
      </div>

      {/* Recharts Analytics Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* Chart 1: Appointments & Patients Growth Trend */}
        <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs space-y-4">
          <h3 className="text-base font-bold text-slate-900">Appointments & Registration Monthly Growth</h3>
          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={monthlyTrend}>
                <XAxis dataKey="month" stroke="#94a3b8" fontSize={12} />
                <YAxis stroke="#94a3b8" fontSize={12} />
                <Tooltip />
                <Legend />
                <Bar dataKey="appointments" fill="#4F46E5" radius={[6, 6, 0, 0]} name="Appointments" />
                <Bar dataKey="patients" fill="#10B981" radius={[6, 6, 0, 0]} name="New Patients" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 2: Appointment Status Distribution */}
        <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs space-y-4">
          <h3 className="text-base font-bold text-slate-900">Appointment Status Ratios</h3>
          <div className="h-72 w-full flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={statusDistribution}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={90}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {statusDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

      </div>

      {/* Department Distribution Table */}
      <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs space-y-4">
        <h3 className="text-base font-bold text-slate-900">Department Workforce & Consultation Distribution</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-400 font-extrabold uppercase tracking-wider text-[10px]">
                <th className="py-3 px-4">Department Name</th>
                <th className="py-3 px-4">Code</th>
                <th className="py-3 px-4">Assigned Doctors</th>
                <th className="py-3 px-4">Total Appointments</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
              {departmentStats.map((dept, idx) => (
                <tr key={idx} className="hover:bg-slate-50/50">
                  <td className="py-3 px-4 font-bold text-slate-900">{dept.name}</td>
                  <td className="py-3 px-4 font-mono">{dept.code}</td>
                  <td className="py-3 px-4 font-semibold text-indigo-600">{dept.doctors} Doctors</td>
                  <td className="py-3 px-4 font-semibold text-slate-800">{dept.appointments} Bookings</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
};
