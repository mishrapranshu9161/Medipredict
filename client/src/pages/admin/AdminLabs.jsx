import React, { useState, useEffect } from 'react';
import { labAPI } from '../../services/api';
import { FlaskConical, Plus, Upload, FileText, CheckCircle2, Clock } from 'lucide-react';
import { StatusBadge } from '../../components/ui/Badge';
import { Modal } from '../../components/ui/Modal';
import { LoadingBlock } from '../../components/ui/Spinner';
import { EmptyState } from '../../components/ui/EmptyState';

export const AdminLabs = () => {
  const [labTests, setLabTests] = useState([]);
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);

  // New Lab Test Modal
  const [isTestModalOpen, setIsTestModalOpen] = useState(false);
  const [testForm, setTestForm] = useState({
    testName: '',
    category: 'Biochemistry',
    price: 500,
    normalRange: '70 - 99 mg/dL',
    unit: 'mg/dL',
    description: ''
  });

  // Report Upload Modal
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [selectedReport, setSelectedReport] = useState(null);
  const [reportResult, setReportResult] = useState('');
  const [reportFile, setReportFile] = useState(null);
  const [uploading, setUploading] = useState(false);

  const fetchLabs = () => {
    setLoading(true);
    Promise.all([
      labAPI.getLabTests(),
      labAPI.getLabReports()
    ]).then(([tRes, rRes]) => {
      if (tRes.success) setLabTests(tRes.data.tests);
      if (rRes.success) setReports(rRes.data.reports);
    }).finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchLabs();
  }, []);

  const handleCreateTest = async (e) => {
    e.preventDefault();
    try {
      await labAPI.createLabTest(testForm);
      fetchLabs();
      setIsTestModalOpen(false);
      setTestForm({ testName: '', category: 'Biochemistry', price: 500, normalRange: '70 - 99 mg/dL', unit: 'mg/dL', description: '' });
    } catch (err) {
      alert(err.message);
    }
  };

  const openUpload = (report) => {
    setSelectedReport(report);
    setReportResult(report.result || '');
    setIsUploadModalOpen(true);
  };

  const handleUploadReport = async (e) => {
    e.preventDefault();
    if (!selectedReport) return;

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('result', reportResult);
      formData.append('status', 'Completed');
      if (reportFile) formData.append('reportFile', reportFile);

      const res = await labAPI.uploadLabReport(selectedReport._id, formData);
      if (res.success) {
        fetchLabs();
        setIsUploadModalOpen(false);
        setReportFile(null);
      }
    } catch (err) {
      alert(err.message || 'Upload failed');
    } finally {
      setUploading(false);
    }
  };

  if (loading) return <LoadingBlock message="Loading laboratory portal..." />;

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900">Laboratory & Diagnostic Management</h1>
          <p className="text-xs text-slate-500 mt-1">Configure diagnostic test catalog, upload lab results, and attach PDF report documents.</p>
        </div>
        <button
          onClick={() => setIsTestModalOpen(true)}
          className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold shadow-md shadow-indigo-600/20 transition-all flex items-center justify-center space-x-2"
        >
          <Plus className="w-4 h-4" />
          <span>Add Lab Test Definition</span>
        </button>
      </div>

      {/* Lab Reports Processing Queue */}
      <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs space-y-4">
        <h3 className="text-base font-bold text-slate-900">Requested Lab Reports Queue</h3>
        
        {reports.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-400 font-extrabold uppercase tracking-wider text-[10px]">
                  <th className="py-3 px-4">Test Name</th>
                  <th className="py-3 px-4">Patient</th>
                  <th className="py-3 px-4">Doctor</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Result</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                {reports.map(r => (
                  <tr key={r._id} className="hover:bg-slate-50/50">
                    <td className="py-3 px-4 font-bold text-slate-900">{r.labTest?.testName || 'Test'}</td>
                    <td className="py-3 px-4">{r.patient?.user?.name}</td>
                    <td className="py-3 px-4">Dr. {r.doctor?.user?.name}</td>
                    <td className="py-3 px-4"><StatusBadge status={r.status} /></td>
                    <td className="py-3 px-4 font-semibold">{r.result || 'Pending'}</td>
                    <td className="py-3 px-4 text-right">
                      <button
                        onClick={() => openUpload(r)}
                        className="px-3 py-1.5 bg-indigo-50 text-indigo-700 hover:bg-indigo-100 rounded-lg font-bold text-[11px] inline-flex items-center space-x-1"
                      >
                        <Upload className="w-3.5 h-3.5" />
                        <span>Upload / Edit Report</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="py-6 text-center text-xs text-slate-400">No lab reports in queue.</div>
        )}
      </div>

      {/* Lab Tests Catalog */}
      <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs space-y-4">
        <h3 className="text-base font-bold text-slate-900">Lab Test Catalog Master</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {labTests.map(t => (
            <div key={t._id} className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-1 text-xs">
              <span className="font-mono text-[10px] text-indigo-600 uppercase font-bold">{t.category}</span>
              <h4 className="font-bold text-slate-900">{t.testName}</h4>
              <p className="text-slate-500">Normal: {t.normalRange} {t.unit}</p>
              <p className="font-extrabold text-emerald-600">Price: ₹{t.price}</p>
            </div>
          ))}
        </div>
      </div>

      {/* New Test Modal */}
      <Modal isOpen={isTestModalOpen} onClose={() => setIsTestModalOpen(false)} title="Create New Lab Test Definition">
        <form onSubmit={handleCreateTest} className="space-y-4 text-xs">
          <div>
            <label className="block font-bold text-slate-700 mb-1">Test Name *</label>
            <input type="text" required placeholder="Complete Blood Count (CBC)" value={testForm.testName} onChange={e => setTestForm({ ...testForm, testName: e.target.value })} className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-slate-700 mb-1">Category</label>
              <select value={testForm.category} onChange={e => setTestForm({ ...testForm, category: e.target.value })} className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl">
                <option value="Hematology">Hematology</option>
                <option value="Biochemistry">Biochemistry</option>
                <option value="Microbiology">Microbiology</option>
                <option value="Radiology">Radiology</option>
                <option value="Pathology">Pathology</option>
                <option value="Immunology">Immunology</option>
              </select>
            </div>
            <div>
              <label className="block font-bold text-slate-700 mb-1">Price (₹) *</label>
              <input type="number" required value={testForm.price} onChange={e => setTestForm({ ...testForm, price: Number(e.target.value) })} className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl font-bold text-emerald-600" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-slate-700 mb-1">Normal Reference Range</label>
              <input type="text" value={testForm.normalRange} onChange={e => setTestForm({ ...testForm, normalRange: e.target.value })} className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl" />
            </div>
            <div>
              <label className="block font-bold text-slate-700 mb-1">Unit</label>
              <input type="text" value={testForm.unit} onChange={e => setTestForm({ ...testForm, unit: e.target.value })} className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl" />
            </div>
          </div>
          <div className="flex justify-end space-x-3 pt-2">
            <button type="button" onClick={() => setIsTestModalOpen(false)} className="px-4 py-2 bg-slate-100 text-slate-700 rounded-xl font-bold">Cancel</button>
            <button type="submit" className="px-6 py-2 bg-indigo-600 text-white rounded-xl font-bold">Save Test</button>
          </div>
        </form>
      </Modal>

      {/* Upload Report Modal */}
      <Modal isOpen={isUploadModalOpen} onClose={() => setIsUploadModalOpen(false)} title={`Upload Report for: ${selectedReport?.patient?.user?.name}`}>
        <form onSubmit={handleUploadReport} className="space-y-4 text-xs">
          <div>
            <label className="block font-bold text-slate-700 mb-1">Test Result Summary *</label>
            <input type="text" required placeholder="Normal / WBC: 7.5 k/uL, Hb: 14.2 g/dL" value={reportResult} onChange={e => setReportResult(e.target.value)} className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl font-bold" />
          </div>
          <div>
            <label className="block font-bold text-slate-700 mb-1">Upload PDF / Image File</label>
            <input type="file" onChange={e => setReportFile(e.target.files[0])} className="w-full p-2 text-xs text-slate-500 bg-slate-50 border border-slate-200 rounded-xl" />
          </div>
          <div className="flex justify-end space-x-3 pt-2">
            <button type="button" onClick={() => setIsUploadModalOpen(false)} className="px-4 py-2 bg-slate-100 text-slate-700 rounded-xl font-bold">Cancel</button>
            <button type="submit" disabled={uploading} className="px-6 py-2 bg-indigo-600 text-white rounded-xl font-bold shadow-md">
              {uploading ? 'Uploading...' : 'Save & Publish Report'}
            </button>
          </div>
        </form>
      </Modal>

    </div>
  );
};
