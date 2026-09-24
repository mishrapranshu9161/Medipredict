import React, { useState, useEffect } from 'react';
import { prescriptionAPI } from '../../services/api';
import { FileText, Printer, Calendar, User, Stethoscope } from 'lucide-react';
import { Link } from 'react-router-dom';
import { LoadingBlock } from '../../components/ui/Spinner';
import { EmptyState } from '../../components/ui/EmptyState';

export const PatientPrescriptionsPage = () => {
  const [prescriptions, setPrescriptions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    prescriptionAPI.getPrescriptions()
      .then(res => res.success && setPrescriptions(res.data.prescriptions))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <LoadingBlock message="Loading digital prescriptions..." />;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-black text-slate-900">Digital Prescriptions</h1>
        <p className="text-xs text-slate-500 mt-1">View and print official clinical prescriptions issued by your consulting doctors.</p>
      </div>

      {prescriptions.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {prescriptions.map((rx) => (
            <div key={rx._id} className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs flex flex-col justify-between space-y-4">
              <div>
                <div className="flex items-start justify-between border-b border-slate-100 pb-3 mb-3">
                  <div>
                    <span className="text-[10px] font-extrabold uppercase text-indigo-600 tracking-wider">Diagnosis</span>
                    <h3 className="text-base font-bold text-slate-900">{rx.diagnosis}</h3>
                  </div>
                  <span className="text-xs font-semibold text-slate-400">
                    {new Date(rx.date).toLocaleDateString()}
                  </span>
                </div>

                <div className="space-y-1.5 text-xs text-slate-600 mb-4">
                  <p><strong className="text-slate-800">Doctor:</strong> Dr. {rx.doctor?.user?.name || 'Consultant'}</p>
                  <p><strong className="text-slate-800">Department:</strong> {rx.doctor?.department?.name || 'General'}</p>
                  <p><strong className="text-slate-800">Prescribed Medicines:</strong> {rx.medicines?.map(m => m.name).join(', ')}</p>
                </div>
              </div>

              <Link
                to={`/prescriptions/${rx._id}/print`}
                target="_blank"
                className="w-full py-2.5 rounded-xl bg-slate-900 hover:bg-indigo-600 text-white font-bold text-xs text-center transition-all flex items-center justify-center space-x-2"
              >
                <Printer className="w-4 h-4" />
                <span>View & Print Prescription</span>
              </Link>
            </div>
          ))}
        </div>
      ) : (
        <EmptyState title="No digital prescriptions found" description="Prescriptions written during your consultations will appear here." />
      )}
    </div>
  );
};
