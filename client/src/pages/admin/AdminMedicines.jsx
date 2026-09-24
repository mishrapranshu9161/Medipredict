import React, { useState, useEffect } from 'react';
import { medicineAPI } from '../../services/api';
import { Pill, Plus, Search, Trash2, Edit2 } from 'lucide-react';
import { StatusBadge } from '../../components/ui/Badge';
import { Modal } from '../../components/ui/Modal';
import { LoadingBlock } from '../../components/ui/Spinner';
import { EmptyState } from '../../components/ui/EmptyState';

export const AdminMedicines = () => {
  const [medicines, setMedicines] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    genericName: '',
    category: 'Antibiotic',
    strength: '500mg',
    stock: 100,
    status: 'Available',
    description: ''
  });

  const fetchMeds = () => {
    setLoading(true);
    medicineAPI.getMedicines({ search })
      .then(res => res.success && setMedicines(res.data.medicines))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchMeds();
  }, [search]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await medicineAPI.createMedicine(formData);
      fetchMeds();
      setIsModalOpen(false);
      setFormData({ name: '', genericName: '', category: 'Antibiotic', strength: '500mg', stock: 100, status: 'Available', description: '' });
    } catch (err) {
      alert(err.message);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Delete medicine from directory?')) {
      try {
        await medicineAPI.deleteMedicine(id);
        fetchMeds();
      } catch (err) {
        alert(err.message);
      }
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900">Pharmacy & Medicines Inventory</h1>
          <p className="text-xs text-slate-500 mt-1">Manage brand names, generic formulas, dosage strength, and stock levels.</p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold shadow-md shadow-indigo-600/20 transition-all flex items-center justify-center space-x-2"
        >
          <Plus className="w-4 h-4" />
          <span>Add New Medicine</span>
        </button>
      </div>

      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
        <div className="relative">
          <Search className="absolute left-3.5 top-3 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search medicine brand or generic name..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm"
          />
        </div>
      </div>

      {loading ? (
        <LoadingBlock message="Loading pharmacy inventory..." />
      ) : medicines.length > 0 ? (
        <div className="bg-white rounded-3xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-400 font-extrabold uppercase tracking-wider text-[10px]">
                  <th className="py-3.5 px-4">Medicine Name</th>
                  <th className="py-3.5 px-4">Generic Formula</th>
                  <th className="py-3.5 px-4">Category & Strength</th>
                  <th className="py-3.5 px-4">Stock Units</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                {medicines.map((m) => (
                  <tr key={m._id} className="hover:bg-slate-50/50">
                    <td className="py-3.5 px-4 font-bold text-slate-900">{m.name}</td>
                    <td className="py-3.5 px-4 text-indigo-600 font-semibold">{m.genericName}</td>
                    <td className="py-3.5 px-4">{m.category} ({m.strength})</td>
                    <td className="py-3.5 px-4 font-extrabold text-slate-800">{m.stock}</td>
                    <td className="py-3.5 px-4"><StatusBadge status={m.status} /></td>
                    <td className="py-3.5 px-4 text-right">
                      <button onClick={() => handleDelete(m._id)} className="text-rose-600 hover:underline font-bold">Delete</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <EmptyState title="No medicines found" description="Click 'Add New Medicine' to populate pharmacy catalog." />
      )}

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Add Medicine to Catalog">
        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div>
            <label className="block font-bold text-slate-700 mb-1">Brand Name *</label>
            <input type="text" required placeholder="Paracetamol 500mg" value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl" />
          </div>
          <div>
            <label className="block font-bold text-slate-700 mb-1">Generic Name *</label>
            <input type="text" required placeholder="Acetaminophen" value={formData.genericName} onChange={e => setFormData({ ...formData, genericName: e.target.value })} className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-slate-700 mb-1">Category</label>
              <select value={formData.category} onChange={e => setFormData({ ...formData, category: e.target.value })} className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl">
                <option value="Antibiotic">Antibiotic</option>
                <option value="Analgesic">Analgesic</option>
                <option value="Antipyretic">Antipyretic</option>
                <option value="Antihistamine">Antihistamine</option>
                <option value="Antacid">Antacid</option>
                <option value="Cardiovascular">Cardiovascular</option>
                <option value="Vitamin/Supplement">Vitamin/Supplement</option>
                <option value="Other">Other</option>
              </select>
            </div>
            <div>
              <label className="block font-bold text-slate-700 mb-1">Strength *</label>
              <input type="text" required placeholder="500mg / 10ml" value={formData.strength} onChange={e => setFormData({ ...formData, strength: e.target.value })} className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-slate-700 mb-1">Stock Count</label>
              <input type="number" value={formData.stock} onChange={e => setFormData({ ...formData, stock: Number(e.target.value) })} className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl font-bold" />
            </div>
            <div>
              <label className="block font-bold text-slate-700 mb-1">Status</label>
              <select value={formData.status} onChange={e => setFormData({ ...formData, status: e.target.value })} className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl font-bold">
                <option value="Available">Available</option>
                <option value="Out of Stock">Out of Stock</option>
                <option value="Discontinued">Discontinued</option>
              </select>
            </div>
          </div>
          <div className="flex justify-end space-x-3 pt-2">
            <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 bg-slate-100 text-slate-700 rounded-xl font-bold">Cancel</button>
            <button type="submit" className="px-6 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold shadow-md">Add Medicine</button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
