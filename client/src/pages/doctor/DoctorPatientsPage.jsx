import React, { useState, useEffect } from 'react';
import { patientAPI, medicalRecordAPI, prescriptionAPI, labAPI, medicineAPI } from '../../services/api';
import { Search, Plus, User, Activity, FileText, FlaskConical, Stethoscope, CheckCircle2, AlertCircle } from 'lucide-react';
import { Modal } from '../../components/ui/Modal';
import { LoadingBlock } from '../../components/ui/Spinner';
import { EmptyState } from '../../components/ui/EmptyState';

export const DoctorPatientsPage = () => {
  const [patients, setPatients] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  // Encounter Modal State
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [labTestsList, setLabTestsList] = useState([]);
  const [medicinesList, setMedicinesList] = useState([]);

  // Form Fields
  const [diagnosis, setDiagnosis] = useState('');
  const [symptoms, setSymptoms] = useState('');
  const [bp, setBp] = useState('120/80');
  const [hr, setHr] = useState(72);
  const [temp, setTemp] = useState(98.6);
  const [weight, setWeight] = useState('');
  const [height, setHeight] = useState('');
  const [clinicalNotes, setClinicalNotes] = useState('');

  // Prescription medicines array
  const [rxMedicines, setRxMedicines] = useState([
    { name: '', dosage: '500mg', frequency: '1-0-1 (After Meals)', duration: '5 days', instructions: 'Take with warm water' }
  ]);

  // Lab test request
  const [selectedLabTestId, setSelectedLabTestId] = useState('');

  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState('');

  useEffect(() => {
    setLoading(true);
    patientAPI.getPatients({ search })
      .then(res => res.success && setPatients(res.data.patients))
      .finally(() => setLoading(false));

    labAPI.getLabTests().then(res => res.success && setLabTestsList(res.data.tests)).catch(() => {});
    medicineAPI.getMedicines().then(res => res.success && setMedicinesList(res.data.medicines)).catch(() => {});
  }, [search]);

  const openEncounter = (patient) => {
    setSelectedPatient(patient);
    setIsModalOpen(true);
    setMsg('');
  };

  const handleAddMedicineRow = () => {
    setRxMedicines([...rxMedicines, { name: '', dosage: '500mg', frequency: '1-0-1', duration: '5 days', instructions: 'Take with water' }]);
  };

  const handleMedicineChange = (idx, field, value) => {
    const updated = [...rxMedicines];
    updated[idx][field] = value;
    setRxMedicines(updated);
  };

  const handleSaveEncounter = async (e) => {
    e.preventDefault();
    if (!diagnosis) {
      alert('Diagnosis is required for clinical encounter');
      return;
    }

    setSaving(true);
    setMsg('');

    try {
      // 1. Create EHR Medical Record
      const recRes = await medicalRecordAPI.createRecord({
        patientId: selectedPatient._id,
        diagnosis,
        symptoms: symptoms.split(',').map(s => s.trim()),
        vitals: { bloodPressure: bp, heartRate: Number(hr), temperature: Number(temp), weight: Number(weight), height: Number(height) },
        clinicalNotes
      });

      // 2. Create Prescription if medicines added
      const validMeds = rxMedicines.filter(m => m.name.trim() !== '');
      if (validMeds.length > 0) {
        await prescriptionAPI.createPrescription({
          patientId: selectedPatient._id,
          diagnosis,
          medicines: validMeds,
          additionalNotes: clinicalNotes
        });
      }

      // 3. Request Lab test if selected
      if (selectedLabTestId) {
        await labAPI.requestLabTest({
          patientId: selectedPatient._id,
          labTestId: selectedLabTestId,
          remarks: `Requested during clinical encounter for ${diagnosis}`
        });
      }

      setMsg('Clinical encounter recorded, prescription generated & lab requested!');
      setTimeout(() => {
        setIsModalOpen(false);
        setDiagnosis('');
        setSymptoms('');
        setClinicalNotes('');
      }, 1500);
    } catch (err) {
      alert(err.message || 'Failed to record encounter');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-black text-slate-900">Patient Clinical Directory</h1>
        <p className="text-xs text-slate-500 mt-1">Search patients, review medical histories, record vitals, and issue prescriptions.</p>
      </div>

      {/* Search Filter */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
        <div className="relative">
          <Search className="absolute left-3.5 top-3 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search patients by name, email, or phone..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm"
          />
        </div>
      </div>

      {/* Patient Cards Grid */}
      {loading ? (
        <LoadingBlock message="Fetching patient directory..." />
      ) : patients.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {patients.map(p => (
            <div key={p._id} className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs flex flex-col justify-between">
              <div>
                <div className="flex items-center space-x-3 mb-4">
                  <div className="w-12 h-12 rounded-2xl bg-indigo-600 text-white font-bold flex items-center justify-center text-lg">
                    {p.user?.name ? p.user.name.charAt(0).toUpperCase() : 'P'}
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-slate-900">{p.user?.name}</h3>
                    <p className="text-xs text-slate-500">{p.user?.email}</p>
                  </div>
                </div>

                <div className="space-y-1.5 py-3 border-t border-b border-slate-100 text-xs text-slate-600 mb-4">
                  <div className="flex justify-between">
                    <span className="text-slate-400">Gender / Blood:</span>
                    <span className="font-semibold">{p.gender} | {p.bloodGroup}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Allergies:</span>
                    <span className="font-semibold text-rose-600">{p.allergies?.join(', ') || 'None reported'}</span>
                  </div>
                </div>
              </div>

              <button
                onClick={() => openEncounter(p)}
                className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold text-xs shadow-md transition-all flex items-center justify-center space-x-2"
              >
                <Stethoscope className="w-4 h-4" />
                <span>Start Clinical Encounter</span>
              </button>
            </div>
          ))}
        </div>
      ) : (
        <EmptyState title="No patients found" description="Adjust search term to locate patient record." />
      )}

      {/* Clinical Encounter Modal */}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={`Clinical Encounter: ${selectedPatient?.user?.name}`} maxWidth="max-w-3xl">
        {msg && (
          <div className="mb-4 p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-bold">
            {msg}
          </div>
        )}

        <form onSubmit={handleSaveEncounter} className="space-y-6 text-xs">
          
          {/* Section 1: Vital Signs */}
          <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200/80 space-y-3">
            <h4 className="font-extrabold uppercase text-[10px] tracking-wider text-slate-500">1. Vital Signs Recording</h4>
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Blood Pressure</label>
                <input type="text" value={bp} onChange={e => setBp(e.target.value)} placeholder="120/80" className="w-full p-2 bg-white border border-slate-200 rounded-lg" />
              </div>
              <div>
                <label className="block font-bold text-slate-700 mb-1">Heart Rate (bpm)</label>
                <input type="number" value={hr} onChange={e => setHr(e.target.value)} className="w-full p-2 bg-white border border-slate-200 rounded-lg" />
              </div>
              <div>
                <label className="block font-bold text-slate-700 mb-1">Temp (°F)</label>
                <input type="number" step="0.1" value={temp} onChange={e => setTemp(e.target.value)} className="w-full p-2 bg-white border border-slate-200 rounded-lg" />
              </div>
              <div>
                <label className="block font-bold text-slate-700 mb-1">Weight (kg)</label>
                <input type="number" value={weight} onChange={e => setWeight(e.target.value)} placeholder="70" className="w-full p-2 bg-white border border-slate-200 rounded-lg" />
              </div>
              <div>
                <label className="block font-bold text-slate-700 mb-1">Height (cm)</label>
                <input type="number" value={height} onChange={e => setHeight(e.target.value)} placeholder="175" className="w-full p-2 bg-white border border-slate-200 rounded-lg" />
              </div>
            </div>
          </div>

          {/* Section 2: Diagnosis & Notes */}
          <div className="space-y-3">
            <h4 className="font-extrabold uppercase text-[10px] tracking-wider text-slate-500">2. Clinical Diagnosis & Encounters</h4>
            <div>
              <label className="block font-bold text-slate-700 mb-1">Primary Diagnosis *</label>
              <input type="text" required placeholder="e.g. Acute Bronchitis" value={diagnosis} onChange={e => setDiagnosis(e.target.value)} className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl font-bold" />
            </div>
            <div>
              <label className="block font-bold text-slate-700 mb-1">Presenting Symptoms (Comma separated)</label>
              <input type="text" placeholder="Fever, Cough, Chest Tightness" value={symptoms} onChange={e => setSymptoms(e.target.value)} className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl" />
            </div>
          </div>

          {/* Section 3: Digital Prescription */}
          <div className="bg-indigo-50/50 p-4 rounded-2xl border border-indigo-100 space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="font-extrabold uppercase text-[10px] tracking-wider text-indigo-700">3. Digital Prescription (Rx)</h4>
              <button type="button" onClick={handleAddMedicineRow} className="text-indigo-600 font-bold text-[11px] hover:underline">+ Add Medicine</button>
            </div>

            {rxMedicines.map((m, idx) => (
              <div key={idx} className="grid grid-cols-1 sm:grid-cols-5 gap-2 bg-white p-2.5 rounded-xl border border-indigo-100">
                <input type="text" placeholder="Medicine Name" value={m.name} onChange={e => handleMedicineChange(idx, 'name', e.target.value)} className="p-1.5 border border-slate-200 rounded-lg text-xs" />
                <input type="text" placeholder="Dosage (500mg)" value={m.dosage} onChange={e => handleMedicineChange(idx, 'dosage', e.target.value)} className="p-1.5 border border-slate-200 rounded-lg text-xs" />
                <input type="text" placeholder="Frequency (1-0-1)" value={m.frequency} onChange={e => handleMedicineChange(idx, 'frequency', e.target.value)} className="p-1.5 border border-slate-200 rounded-lg text-xs" />
                <input type="text" placeholder="Duration (5 days)" value={m.duration} onChange={e => handleMedicineChange(idx, 'duration', e.target.value)} className="p-1.5 border border-slate-200 rounded-lg text-xs" />
                <input type="text" placeholder="Instructions" value={m.instructions} onChange={e => handleMedicineChange(idx, 'instructions', e.target.value)} className="p-1.5 border border-slate-200 rounded-lg text-xs" />
              </div>
            ))}
          </div>

          {/* Section 4: Request Lab Test */}
          <div>
            <h4 className="font-extrabold uppercase text-[10px] tracking-wider text-slate-500 mb-1">4. Order Laboratory Test (Optional)</h4>
            <select value={selectedLabTestId} onChange={e => setSelectedLabTestId(e.target.value)} className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl text-xs">
              <option value="">-- No Lab Test Required --</option>
              {labTestsList.map(t => (
                <option key={t._id} value={t._id}>{t.testName} ({t.category}) — ₹{t.price}</option>
              ))}
            </select>
          </div>

          <div className="flex justify-end space-x-3 pt-4 border-t border-slate-100">
            <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 bg-slate-100 text-slate-700 rounded-xl font-bold">Cancel</button>
            <button type="submit" disabled={saving} className="px-6 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold shadow-md">
              {saving ? 'Saving Encounter...' : 'Save & Issue Prescription'}
            </button>
          </div>

        </form>
      </Modal>
    </div>
  );
};
