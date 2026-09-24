import React, { useState, useEffect } from 'react';
import { labAPI } from '../../services/api';
import { FlaskConical, Download, Calendar, User, FileText, CheckCircle2, Clock } from 'lucide-react';
import { StatusBadge } from '../../components/ui/Badge';
import { LoadingBlock } from '../../components/ui/Spinner';
import { EmptyState } from '../../components/ui/EmptyState';

export const PatientLabsPage = () => {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    labAPI.getLabReports()
      .then(res => res.success && setReports(res.data.reports))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <LoadingBlock message="Loading laboratory reports..." />;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-black text-slate-900">My Laboratory Reports</h1>
        <p className="text-xs text-slate-500 mt-1">Track ordered diagnostic tests and download uploaded lab reports.</p>
      </div>

      {reports.length > 0 ? (
        <div className="bg-white rounded-3xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-400 font-extrabold uppercase tracking-wider text-[10px]">
                  <th className="py-3.5 px-4">Test Name</th>
                  <th className="py-3.5 px-4">Ordered By</th>
                  <th className="py-3.5 px-4">Date</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4">Result / Values</th>
                  <th className="py-3.5 px-4 text-right">Report File</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                {reports.map((r) => (
                  <tr key={r._id} className="hover:bg-slate-50/50">
                    <td className="py-3.5 px-4 font-bold text-slate-900">
                      {r.labTest?.testName || 'Lab Test'}
                    </td>
                    <td className="py-3.5 px-4">Dr. {r.doctor?.user?.name || 'Doctor'}</td>
                    <td className="py-3.5 px-4">{new Date(r.createdAt).toLocaleDateString()}</td>
                    <td className="py-3.5 px-4">
                      <StatusBadge status={r.status} />
                    </td>
                    <td className="py-3.5 px-4">
                      {r.result ? (
                        <span className="font-bold text-slate-800">{r.result} {r.unit} (Ref: {r.referenceRange})</span>
                      ) : (
                        <span className="text-slate-400 italic">Pending processing</span>
                      )}
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      {r.reportFile ? (
                        <a
                          href={r.reportFile}
                          target="_blank"
                          rel="noreferrer"
                          className="px-3 py-1.5 bg-indigo-50 text-indigo-700 hover:bg-indigo-100 rounded-lg font-bold text-[11px] inline-flex items-center space-x-1"
                        >
                          <Download className="w-3.5 h-3.5" />
                          <span>Download Report</span>
                        </a>
                      ) : (
                        <span className="text-[11px] text-slate-400">File not attached</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <EmptyState title="No lab test records found" description="Laboratory tests requested by doctors during consultation will be tracked here." />
      )}
    </div>
  );
};
