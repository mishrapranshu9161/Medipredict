import React, { useState, useEffect } from 'react';
import { doctorAPI, departmentAPI } from '../services/api';
import { Search, Filter, Stethoscope, Calendar, Clock, DollarSign } from 'lucide-react';
import { Link } from 'react-router-dom';
import { LoadingBlock } from '../components/ui/Spinner';
import { EmptyState } from '../components/ui/EmptyState';
import { Footer } from '../components/common/Footer';

export const DoctorsPage = () => {
  const [doctors, setDoctors] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [search, setSearch] = useState('');
  const [selectedDept, setSelectedDept] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    departmentAPI.getDepartments().then(res => res.success && setDepartments(res.data.departments)).catch(() => {});
  }, []);

  useEffect(() => {
    setLoading(true);
    doctorAPI.getDoctors({ search, department: selectedDept })
      .then(res => {
        if (res.success) setDoctors(res.data.doctors);
      })
      .finally(() => setLoading(false));
  }, [search, selectedDept]);

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full flex-1">
        
        {/* Page Header */}
        <div className="mb-8 text-center sm:text-left">
          <h1 className="text-3xl font-extrabold text-slate-900">Find & Book Specialist Doctors</h1>
          <p className="text-slate-500 text-sm mt-1">Browse our medical faculty, check slot timings, and book appointments directly.</p>
        </div>

        {/* Filter Controls */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs mb-8 flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-3 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search by doctor name or specialization..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div className="w-full sm:w-64">
            <select
              value={selectedDept}
              onChange={(e) => setSelectedDept(e.target.value)}
              className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="">All Departments</option>
              {departments.map(d => (
                <option key={d._id} value={d._id}>{d.name}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Doctor Grid */}
        {loading ? (
          <LoadingBlock message="Fetching doctor profiles..." />
        ) : doctors.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {doctors.map(doc => (
              <div key={doc._id} className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs hover:shadow-md transition-shadow flex flex-col justify-between">
                <div>
                  <div className="flex items-start space-x-4 mb-4">
                    <div className="w-14 h-14 rounded-2xl bg-indigo-600 text-white font-bold text-xl flex items-center justify-center shadow-md">
                      {doc.user?.name ? doc.user.name.split(' ').map(n=>n[0]).join('') : 'DR'}
                    </div>
                    <div>
                      <h3 className="text-base font-bold text-slate-900">{doc.user?.name}</h3>
                      <p className="text-xs font-semibold text-indigo-600">{doc.qualification}</p>
                      <p className="text-xs text-slate-500">{doc.specialization}</p>
                    </div>
                  </div>

                  <div className="space-y-2 py-3 border-t border-b border-slate-100 text-xs text-slate-600 mb-4">
                    <div className="flex items-center justify-between">
                      <span className="text-slate-400">Department:</span>
                      <span className="font-semibold text-slate-800">{doc.department?.name || 'General'}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-slate-400">Experience:</span>
                      <span className="font-semibold text-slate-800">{doc.experienceYears} Years</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-slate-400">Consultation Fee:</span>
                      <span className="font-extrabold text-emerald-600">₹{doc.consultationFee}</span>
                    </div>
                  </div>
                </div>

                <Link
                  to={`/patient/appointments?doctorId=${doc._id}`}
                  className="w-full py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs text-center shadow-md shadow-indigo-600/20 transition-all flex items-center justify-center space-x-2"
                >
                  <Calendar className="w-4 h-4" />
                  <span>Book Appointment</span>
                </Link>
              </div>
            ))}
          </div>
        ) : (
          <EmptyState title="No doctors found" description="Try adjusting your department filter or search criteria." />
        )}
      </div>
      <Footer />
    </div>
  );
};
