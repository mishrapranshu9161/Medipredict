import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { prescriptionAPI } from '../services/api';
import { Activity, Printer, FileText, CheckCircle2 } from 'lucide-react';
import { LoadingBlock } from '../components/ui/Spinner';

export const PrescriptionPrintPage = () => {
  const { id } = useParams();
  const [prescription, setPrescription] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    prescriptionAPI.getPrescriptionById(id)
      .then(res => res.success && setPrescription(res.data.prescription))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return <LoadingBlock message="Loading printable prescription..." />;
  if (!prescription) return <div className="p-8 text-center text-slate-500 font-bold">Prescription not found</div>;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="min-h-screen bg-slate-100 p-4 sm:p-8 flex flex-col items-center">
      
      {/* Top Action Bar (hidden when printing) */}
      <div className="no-print w-full max-w-3xl mb-6 flex items-center justify-between">
        <span className="text-xs font-bold text-slate-600">Official Clinical Digital Prescription</span>
        <button
          onClick={handlePrint}
          className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold text-xs shadow-lg flex items-center space-x-2 transition-all"
        >
          <Printer className="w-4 h-4" />
          <span>Print Prescription</span>
        </button>
      </div>

      {/* Printable Sheet */}
      <div
        id="printable-prescription"
        className="w-full max-w-3xl bg-white rounded-2xl shadow-xl border border-slate-200 p-8 sm:p-12 space-y-8 text-slate-900"
      >
        
        {/* Header */}
        <div className="flex items-start justify-between border-b-2 border-slate-900 pb-6">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 rounded-2xl bg-indigo-600 text-white flex items-center justify-center font-bold">
              <Activity className="w-7 h-7" />
            </div>
            <div>
              <h1 className="text-2xl font-black tracking-tight text-slate-900">MediPredict Healthcare</h1>
              <p className="text-xs font-bold text-indigo-600 uppercase tracking-widest">Multi-Specialty Hospital & Research Center</p>
              <p className="text-[11px] text-slate-400">123 University Health Park, Metro City | Phone: +1 800-555-0199</p>
            </div>
          </div>
          <div className="text-right text-xs">
            <span className="font-mono font-bold text-slate-400 block text-[10px]">RX REF NO</span>
            <span className="font-bold text-slate-800 text-sm">#RX-{prescription._id.slice(-6).toUpperCase()}</span>
            <span className="block text-slate-500 mt-1">{new Date(prescription.date).toLocaleDateString()}</span>
          </div>
        </div>

        {/* Doctor & Patient Info Bar */}
        <div className="grid grid-cols-2 gap-6 bg-slate-50 p-4 rounded-xl border border-slate-200 text-xs">
          <div>
            <span className="text-[10px] font-extrabold uppercase text-slate-400 block mb-1">Prescribing Physician</span>
            <p className="font-extrabold text-sm text-slate-900">Dr. {prescription.doctor?.user?.name || 'Medical Specialist'}</p>
            <p className="font-semibold text-indigo-600">{prescription.doctor?.qualification}</p>
            <p className="text-slate-500">{prescription.doctor?.specialization} ({prescription.doctor?.department?.name || 'Department'})</p>
          </div>

          <div>
            <span className="text-[10px] font-extrabold uppercase text-slate-400 block mb-1">Patient Details</span>
            <p className="font-extrabold text-sm text-slate-900">{prescription.patient?.user?.name}</p>
            <p className="text-slate-600">Gender: <strong>{prescription.patient?.gender}</strong> | Phone: <strong>{prescription.patient?.user?.phone || 'N/A'}</strong></p>
            <p className="text-slate-500">Email: {prescription.patient?.user?.email}</p>
          </div>
        </div>

        {/* Clinical Diagnosis Header */}
        <div className="space-y-1">
          <span className="text-xs font-extrabold uppercase tracking-wider text-indigo-700">Clinical Diagnosis</span>
          <h3 className="text-lg font-black text-slate-900">{prescription.diagnosis}</h3>
        </div>

        {/* Prescribed Medicines Rx Table */}
        <div className="space-y-3">
          <div className="flex items-center space-x-2">
            <span className="text-2xl font-black text-indigo-600">Rx</span>
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Medication Instructions</span>
          </div>

          <table className="w-full text-left border-collapse text-xs border border-slate-200 rounded-xl overflow-hidden">
            <thead>
              <tr className="bg-slate-100 text-slate-700 font-extrabold uppercase text-[10px]">
                <th className="py-2.5 px-3 border-b border-slate-200">#</th>
                <th className="py-2.5 px-3 border-b border-slate-200">Medicine Name</th>
                <th className="py-2.5 px-3 border-b border-slate-200">Dosage</th>
                <th className="py-2.5 px-3 border-b border-slate-200">Frequency</th>
                <th className="py-2.5 px-3 border-b border-slate-200">Duration</th>
                <th className="py-2.5 px-3 border-b border-slate-200">Instructions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {prescription.medicines?.map((med, index) => (
                <tr key={index}>
                  <td className="py-2.5 px-3 font-bold text-slate-400">{index + 1}</td>
                  <td className="py-2.5 px-3 font-bold text-slate-900">{med.name}</td>
                  <td className="py-2.5 px-3 font-semibold text-indigo-700">{med.dosage}</td>
                  <td className="py-2.5 px-3 font-semibold">{med.frequency}</td>
                  <td className="py-2.5 px-3">{med.duration}</td>
                  <td className="py-2.5 px-3 text-slate-600">{med.instructions}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Additional Clinical Advice */}
        {prescription.additionalNotes && (
          <div className="p-4 bg-amber-50/60 border border-amber-200/80 rounded-xl text-xs space-y-1">
            <span className="font-extrabold uppercase text-[10px] text-amber-800 tracking-wider">Doctor Advice & Dietary Notes</span>
            <p className="text-amber-950 font-medium">{prescription.additionalNotes}</p>
          </div>
        )}

        {/* Signature Line */}
        <div className="pt-12 flex justify-end">
          <div className="text-center w-48">
            <div className="font-serif italic font-bold text-indigo-900 text-lg border-b border-slate-400 pb-1 mb-1">
              Dr. {prescription.doctor?.user?.name ? prescription.doctor.user.name.split(' ')[1] || prescription.doctor.user.name : 'Sign'}
            </div>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">Authorized Signatory</span>
            <span className="text-[10px] text-slate-500 font-semibold">{prescription.doctor?.qualification}</span>
          </div>
        </div>

      </div>
    </div>
  );
};
