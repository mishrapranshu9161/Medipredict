import React, { useState, useEffect } from 'react';
import { doctorAPI, departmentAPI } from '../../services/api';
import { Search, Plus, UserPlus, Stethoscope, DollarSign, Calendar, ShieldCheck, Mail, Lock, Phone } from 'lucide-react';
import { Modal } from '../../components/ui/Modal';
import { LoadingBlock } from '../../components/ui/Spinner';
import { EmptyState } from '../../components/ui/EmptyState';

export const AdminDoctors = () => {
  const [doctors, setDoctors] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  // Create Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: 'Doctor@12345',
    phone: '',
    departmentId: '',
    qualification: 'MBBS, MD',
    specialization: '',
    experienceYears: 5,
    consultationFee: 500,
    bio: ''
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const fetchDoctors = () => {
    setLoading(true);
    doctorAPI.getDoctors({ search })
      .then(res => res.success && setDoctors(res.data.doctors))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchDoctors();
    departmentAPI.getDepartments().then(res => res.success && setDepartments(res.data.departments)).catch(() => {});
  }, [search]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleCreateDoctor = async (e) => {
    e.preventDefault();
    setError('');

    if (!formData.departmentId) {
      setError('Please select a department');
      return;
    }

    setSaving(true);
    try {
      const res = await doctorAPI.createDoctor(formData);
      if (res.success) {
        fetchDoctors();
        setIsModalOpen(false);
        setFormData({
          name: '',
          email: '',
          password: 'Doctor@12345',
          phone: '',
          departmentId: '',
          qualification: 'MBBS, MD',
          specialization: '',
          experienceYears: 5,
          consultationFee: 500,
          bio: ''
        });
      }
    } catch (err) {
      setError(err.message || 'Failed to create doctor account');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900">Manage Medical Faculty & Doctors</h1>
          <p className="text-xs text-slate-500 mt-1">Register new doctors, set consultation fees, and assign clinical departments.</p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold shadow-md shadow-indigo-600/20 transition-all flex items-center justify-center space-x-2"
        >
          <UserPlus className="w-4 h-4" />
          <span>Add New Doctor Account</span>
        </button>
      </div>

      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
        <div className="relative">
          <Search className="absolute left-3.5 top-3 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search doctors by name or specialization..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm"
          />
        </div>
      </div>

      {loading ? (
        <LoadingBlock message="Fetching doctor profiles..." />
      ) : doctors.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {doctors.map(d => (
            <div key={d._id} className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs flex flex-col justify-between">
              <div>
                <div className="flex items-center space-x-3 mb-4">
                  <div className="w-12 h-12 rounded-2xl bg-indigo-600 text-white font-bold flex items-center justify-center text-lg">
                    {d.user?.name ? d.user.name.split(' ').map(n=>n[0]).join('') : 'DR'}
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-slate-900">{d.user?.name}</h3>
                    <p className="text-xs font-semibold text-indigo-600">{d.qualification}</p>
                  </div>
                </div>

                <div className="space-y-1.5 py-3 border-t border-b border-slate-100 text-xs text-slate-600 mb-4">
                  <div className="flex justify-between">
                    <span className="text-slate-400">Department:</span>
                    <span className="font-semibold text-slate-800">{d.department?.name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Specialization:</span>
                    <span className="font-semibold text-slate-800">{d.specialization}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Experience:</span>
                    <span className="font-semibold text-slate-800">{d.experienceYears} Years</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Consultation Fee:</span>
                    <span className="font-extrabold text-emerald-600">₹{d.consultationFee}</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <EmptyState title="No doctors found" description="Click 'Add New Doctor Account' to register a new physician." />
      )}

      {/* Create Doctor Modal */}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Register Doctor Account">
        {error && (
          <div className="mb-4 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-bold">
            {error}
          </div>
        )}

        <form onSubmit={handleCreateDoctor} className="space-y-4 text-xs">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-bold text-slate-700 mb-1">Doctor Name *</label>
              <input type="text" name="name" required placeholder="Dr. Sarah Jenkins" value={formData.name} onChange={handleChange} className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl" />
            </div>
            <div>
              <label className="block font-bold text-slate-700 mb-1">Email Address *</label>
              <input type="email" name="email" required placeholder="doctor@medipredict.com" value={formData.email} onChange={handleChange} className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl" />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-bold text-slate-700 mb-1">Default Password *</label>
              <input type="password" name="password" required value={formData.password} onChange={handleChange} className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl" />
            </div>
            <div>
              <label className="block font-bold text-slate-700 mb-1">Phone Number</label>
              <input type="tel" name="phone" placeholder="+1 555-0199" value={formData.phone} onChange={handleChange} className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl" />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-bold text-slate-700 mb-1">Clinical Department *</label>
              <select name="departmentId" required value={formData.departmentId} onChange={handleChange} className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl font-semibold">
                <option value="">-- Choose Department --</option>
                {departments.map(d => (
                  <option key={d._id} value={d._id}>{d.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block font-bold text-slate-700 mb-1">Qualification *</label>
              <input type="text" name="qualification" required placeholder="MBBS, MD (Cardiology)" value={formData.qualification} onChange={handleChange} className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl" />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block font-bold text-slate-700 mb-1">Specialization *</label>
              <input type="text" name="specialization" required placeholder="Cardiologist" value={formData.specialization} onChange={handleChange} className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl" />
            </div>
            <div>
              <label className="block font-bold text-slate-700 mb-1">Experience (Years)</label>
              <input type="number" name="experienceYears" value={formData.experienceYears} onChange={handleChange} className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl" />
            </div>
            <div>
              <label className="block font-bold text-slate-700 mb-1">Consultation Fee (₹)</label>
              <input type="number" name="consultationFee" value={formData.consultationFee} onChange={handleChange} className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl font-bold text-emerald-600" />
            </div>
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">Bio / Profile Description</label>
            <textarea name="bio" rows="2" placeholder="Brief professional background..." value={formData.bio} onChange={handleChange} className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl"></textarea>
          </div>

          <div className="flex justify-end space-x-3 pt-3">
            <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 bg-slate-100 text-slate-700 rounded-xl font-bold">Cancel</button>
            <button type="submit" disabled={saving} className="px-6 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold shadow-md">
              {saving ? 'Creating...' : 'Create Doctor'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
