import React, { useState, useEffect } from 'react';
import { userAPI, patientAPI } from '../../services/api';
import { Search, User, Shield, CheckCircle2, XCircle, Trash2, Power } from 'lucide-react';
import { Badge } from '../../components/ui/Badge';
import { LoadingBlock } from '../../components/ui/Spinner';
import { EmptyState } from '../../components/ui/EmptyState';

export const AdminPatients = () => {
  const [patients, setPatients] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  const fetchPatients = () => {
    setLoading(true);
    patientAPI.getPatients({ search })
      .then(res => res.success && setPatients(res.data.patients))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchPatients();
  }, [search]);

  const handleToggleStatus = async (userId) => {
    try {
      await userAPI.toggleStatus(userId);
      fetchPatients();
    } catch (err) {
      alert(err.message);
    }
  };

  const handleDelete = async (userId) => {
    if (window.confirm('Are you sure you want to delete this patient account?')) {
      try {
        await userAPI.deleteUser(userId);
        fetchPatients();
      } catch (err) {
        alert(err.message);
      }
    }
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-black text-slate-900">Manage Patient Accounts</h1>
        <p className="text-xs text-slate-500 mt-1">Review registered patient demographics, active state, and account security.</p>
      </div>

      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
        <div className="relative">
          <Search className="absolute left-3.5 top-3 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search patient by name, email, or phone..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm"
          />
        </div>
      </div>

      {loading ? (
        <LoadingBlock message="Loading patient database..." />
      ) : patients.length > 0 ? (
        <div className="bg-white rounded-3xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-400 font-extrabold uppercase tracking-wider text-[10px]">
                  <th className="py-3.5 px-4">Patient Name</th>
                  <th className="py-3.5 px-4">Email / Phone</th>
                  <th className="py-3.5 px-4">Blood & Gender</th>
                  <th className="py-3.5 px-4">Account Status</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                {patients.map((p) => (
                  <tr key={p._id} className="hover:bg-slate-50/50">
                    <td className="py-3.5 px-4 font-bold text-slate-900">
                      {p.user?.name || 'Patient'}
                    </td>
                    <td className="py-3.5 px-4">
                      <div>{p.user?.email}</div>
                      <span className="text-slate-400 text-[11px]">{p.user?.phone || 'No phone'}</span>
                    </td>
                    <td className="py-3.5 px-4">{p.gender} | <span className="font-bold text-indigo-600">{p.bloodGroup}</span></td>
                    <td className="py-3.5 px-4">
                      <Badge variant={p.user?.isActive ? 'success' : 'danger'}>
                        {p.user?.isActive ? 'Active' : 'Deactivated'}
                      </Badge>
                    </td>
                    <td className="py-3.5 px-4 text-right space-x-2">
                      <button
                        onClick={() => handleToggleStatus(p.user?._id)}
                        className={`px-3 py-1.5 rounded-lg font-bold text-[11px] ${
                          p.user?.isActive ? 'bg-amber-50 text-amber-700 hover:bg-amber-100' : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
                        }`}
                      >
                        {p.user?.isActive ? 'Deactivate' : 'Activate'}
                      </button>
                      <button
                        onClick={() => handleDelete(p.user?._id)}
                        className="px-3 py-1.5 bg-rose-50 text-rose-700 hover:bg-rose-100 rounded-lg font-bold text-[11px]"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <EmptyState title="No patients found" description="No patient accounts match the search criteria." />
      )}
    </div>
  );
};
