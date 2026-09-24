import React, { useState, useEffect } from 'react';
import { departmentAPI } from '../../services/api';
import { Building2, Plus, Edit2, Trash2 } from 'lucide-react';
import { Modal } from '../../components/ui/Modal';
import { LoadingBlock } from '../../components/ui/Spinner';
import { EmptyState } from '../../components/ui/EmptyState';

export const AdminDepartments = () => {
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({ name: '', code: '', description: '' });
  const [editingId, setEditingId] = useState(null);

  const fetchDepts = () => {
    setLoading(true);
    departmentAPI.getDepartments()
      .then(res => res.success && setDepartments(res.data.departments))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchDepts();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingId) {
        await departmentAPI.updateDepartment(editingId, formData);
      } else {
        await departmentAPI.createDepartment(formData);
      }
      fetchDepts();
      setIsModalOpen(false);
      setFormData({ name: '', code: '', description: '' });
      setEditingId(null);
    } catch (err) {
      alert(err.message);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Delete this department?')) {
      try {
        await departmentAPI.deleteDepartment(id);
        fetchDepts();
      } catch (err) {
        alert(err.message);
      }
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900">Hospital Departments</h1>
          <p className="text-xs text-slate-500 mt-1">Configure clinical medical departments and specialty codes.</p>
        </div>
        <button
          onClick={() => {
            setEditingId(null);
            setFormData({ name: '', code: '', description: '' });
            setIsModalOpen(true);
          }}
          className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold shadow-md shadow-indigo-600/20 transition-all flex items-center justify-center space-x-2"
        >
          <Plus className="w-4 h-4" />
          <span>Add Department</span>
        </button>
      </div>

      {loading ? (
        <LoadingBlock message="Loading departments..." />
      ) : departments.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {departments.map((d) => (
            <div key={d._id} className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="px-2.5 py-1 rounded-lg bg-indigo-50 text-indigo-700 text-xs font-mono font-bold">{d.code}</span>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => {
                        setEditingId(d._id);
                        setFormData({ name: d.name, code: d.code, description: d.description });
                        setIsModalOpen(true);
                      }}
                      className="text-slate-400 hover:text-indigo-600 font-bold"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button onClick={() => handleDelete(d._id)} className="text-slate-400 hover:text-rose-600 font-bold">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
                <h3 className="text-base font-bold text-slate-900">{d.name}</h3>
                <p className="text-xs text-slate-500 mt-2">{d.description || 'Clinical department unit.'}</p>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <EmptyState title="No departments" description="Add your first department." />
      )}

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={editingId ? 'Edit Department' : 'Create Department'}>
        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div>
            <label className="block font-bold text-slate-700 mb-1">Department Name *</label>
            <input type="text" required placeholder="Cardiology" value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl" />
          </div>
          <div>
            <label className="block font-bold text-slate-700 mb-1">Department Code *</label>
            <input type="text" required placeholder="CARD" value={formData.code} onChange={e => setFormData({ ...formData, code: e.target.value })} className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl font-mono uppercase" />
          </div>
          <div>
            <label className="block font-bold text-slate-700 mb-1">Description</label>
            <textarea rows="3" placeholder="Department overview..." value={formData.description} onChange={e => setFormData({ ...formData, description: e.target.value })} className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl"></textarea>
          </div>
          <div className="flex justify-end space-x-3 pt-2">
            <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 bg-slate-100 text-slate-700 rounded-xl font-bold">Cancel</button>
            <button type="submit" className="px-6 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold shadow-md">Save</button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
