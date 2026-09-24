import React, { useState, useEffect } from 'react';
import { diseaseSymptomAPI } from '../../services/api';
import { BrainCircuit, Plus, Activity, AlertTriangle } from 'lucide-react';
import { Modal } from '../../components/ui/Modal';
import { LoadingBlock } from '../../components/ui/Spinner';
import { EmptyState } from '../../components/ui/EmptyState';

export const AdminDiseases = () => {
  const [diseases, setDiseases] = useState([]);
  const [symptoms, setSymptoms] = useState([]);
  const [loading, setLoading] = useState(true);

  const [isDiseaseModal, setIsDiseaseModal] = useState(false);
  const [isSymptomModal, setIsSymptomModal] = useState(false);

  // New Disease Form
  const [diseaseForm, setDiseaseForm] = useState({
    name: '',
    category: 'Respiratory Infection',
    riskLevel: 'Moderate',
    description: '',
    precautions: '',
    recommendedAction: 'Consult a healthcare professional.'
  });

  // New Symptom Form
  const [symptomForm, setSymptomForm] = useState({
    name: '',
    category: 'General',
    severity: 'Moderate',
    description: ''
  });

  const fetchKnowledgeBase = () => {
    setLoading(true);
    Promise.all([
      diseaseSymptomAPI.getDiseases(),
      diseaseSymptomAPI.getSymptoms()
    ]).then(([dRes, sRes]) => {
      if (dRes.success) setDiseases(dRes.data.diseases);
      if (sRes.success) setSymptoms(sRes.data.symptoms);
    }).finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchKnowledgeBase();
  }, []);

  const handleCreateDisease = async (e) => {
    e.preventDefault();
    try {
      await diseaseSymptomAPI.createDisease({
        ...diseaseForm,
        precautions: diseaseForm.precautions.split(',').map(p => p.trim())
      });
      fetchKnowledgeBase();
      setIsDiseaseModal(false);
    } catch (err) {
      alert(err.message);
    }
  };

  const handleCreateSymptom = async (e) => {
    e.preventDefault();
    try {
      await diseaseSymptomAPI.createSymptom(symptomForm);
      fetchKnowledgeBase();
      setIsSymptomModal(false);
    } catch (err) {
      alert(err.message);
    }
  };

  if (loading) return <LoadingBlock message="Loading prediction knowledge base..." />;

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900">Disease Risk Engine Knowledge Base</h1>
          <p className="text-xs text-slate-500 mt-1">Configure disease conditions, risk levels, precautions, and symptom severity rules.</p>
        </div>
        <div className="flex space-x-3">
          <button
            onClick={() => setIsSymptomModal(true)}
            className="px-4 py-2.5 bg-slate-800 hover:bg-slate-900 text-white rounded-xl text-xs font-bold transition-all flex items-center space-x-1.5"
          >
            <Plus className="w-4 h-4" />
            <span>Add Symptom</span>
          </button>
          <button
            onClick={() => setIsDiseaseModal(true)}
            className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold shadow-md transition-all flex items-center space-x-1.5"
          >
            <Plus className="w-4 h-4" />
            <span>Add Disease Rule</span>
          </button>
        </div>
      </div>

      {/* Grid: Symptoms Summary & Diseases List */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left: Symptoms Catalog */}
        <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h3 className="text-sm font-bold text-slate-900">Symptom Master List</h3>
            <span className="text-xs font-bold text-indigo-600">{symptoms.length} Symptoms</span>
          </div>

          <div className="space-y-2 max-h-96 overflow-y-auto pr-1">
            {symptoms.map(s => (
              <div key={s._id} className="p-2.5 bg-slate-50 rounded-xl border border-slate-100 flex items-center justify-between text-xs">
                <span className="font-bold text-slate-800">{s.name}</span>
                <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-slate-200 text-slate-600">{s.severity}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Right: Diseases Cards */}
        <div className="lg:col-span-2 space-y-4">
          <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs space-y-4">
            <h3 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-3">Configured Disease Models</h3>
            
            <div className="space-y-4">
              {diseases.map(d => (
                <div key={d._id} className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-2 text-xs">
                  <div className="flex items-start justify-between">
                    <div>
                      <h4 className="font-extrabold text-slate-900 text-sm">{d.name}</h4>
                      <span className="text-slate-500 font-semibold">{d.category}</span>
                    </div>
                    <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                      d.riskLevel === 'High' ? 'bg-rose-100 text-rose-700' : 'bg-amber-100 text-amber-700'
                    }`}>
                      {d.riskLevel} Risk
                    </span>
                  </div>
                  <p className="text-slate-600">{d.description}</p>
                  <p className="text-indigo-700 font-bold">Action: {d.recommendedAction}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

      </div>

      {/* Add Disease Modal */}
      <Modal isOpen={isDiseaseModal} onClose={() => setIsDiseaseModal(false)} title="Add Disease Condition Rule">
        <form onSubmit={handleCreateDisease} className="space-y-4 text-xs">
          <div>
            <label className="block font-bold text-slate-700 mb-1">Disease Name *</label>
            <input type="text" required placeholder="Viral Influenza" value={diseaseForm.name} onChange={e => setDiseaseForm({ ...diseaseForm, name: e.target.value })} className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-slate-700 mb-1">Category *</label>
              <input type="text" required value={diseaseForm.category} onChange={e => setDiseaseForm({ ...diseaseForm, category: e.target.value })} className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl" />
            </div>
            <div>
              <label className="block font-bold text-slate-700 mb-1">Risk Level</label>
              <select value={diseaseForm.riskLevel} onChange={e => setDiseaseForm({ ...diseaseForm, riskLevel: e.target.value })} className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl">
                <option value="Low">Low</option>
                <option value="Moderate">Moderate</option>
                <option value="High">High</option>
                <option value="Critical">Critical</option>
              </select>
            </div>
          </div>
          <div>
            <label className="block font-bold text-slate-700 mb-1">Description</label>
            <textarea rows="2" value={diseaseForm.description} onChange={e => setDiseaseForm({ ...diseaseForm, description: e.target.value })} className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl"></textarea>
          </div>
          <div>
            <label className="block font-bold text-slate-700 mb-1">Precautions (Comma separated)</label>
            <input type="text" placeholder="Rest, Hydration, OTC antipyretics" value={diseaseForm.precautions} onChange={e => setDiseaseForm({ ...diseaseForm, precautions: e.target.value })} className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl" />
          </div>
          <div className="flex justify-end space-x-3 pt-2">
            <button type="button" onClick={() => setIsDiseaseModal(false)} className="px-4 py-2 bg-slate-100 text-slate-700 rounded-xl font-bold">Cancel</button>
            <button type="submit" className="px-6 py-2 bg-indigo-600 text-white rounded-xl font-bold">Create Disease</button>
          </div>
        </form>
      </Modal>

      {/* Add Symptom Modal */}
      <Modal isOpen={isSymptomModal} onClose={() => setIsSymptomModal(false)} title="Add Symptom Definition">
        <form onSubmit={handleCreateSymptom} className="space-y-4 text-xs">
          <div>
            <label className="block font-bold text-slate-700 mb-1">Symptom Name *</label>
            <input type="text" required placeholder="Fever" value={symptomForm.name} onChange={e => setSymptomForm({ ...symptomForm, name: e.target.value })} className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-slate-700 mb-1">Category</label>
              <select value={symptomForm.category} onChange={e => setSymptomForm({ ...symptomForm, category: e.target.value })} className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl">
                <option value="General">General</option>
                <option value="Respiratory">Respiratory</option>
                <option value="Cardiovascular">Cardiovascular</option>
                <option value="Gastrointestinal">Gastrointestinal</option>
                <option value="Neurological">Neurological</option>
              </select>
            </div>
            <div>
              <label className="block font-bold text-slate-700 mb-1">Severity</label>
              <select value={symptomForm.severity} onChange={e => setSymptomForm({ ...symptomForm, severity: e.target.value })} className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl">
                <option value="Mild">Mild</option>
                <option value="Moderate">Moderate</option>
                <option value="Severe">Severe</option>
              </select>
            </div>
          </div>
          <div className="flex justify-end space-x-3 pt-2">
            <button type="button" onClick={() => setIsSymptomModal(false)} className="px-4 py-2 bg-slate-100 text-slate-700 rounded-xl font-bold">Cancel</button>
            <button type="submit" className="px-6 py-2 bg-indigo-600 text-white rounded-xl font-bold">Save Symptom</button>
          </div>
        </form>
      </Modal>

    </div>
  );
};
