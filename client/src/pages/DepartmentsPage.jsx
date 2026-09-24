import React, { useState, useEffect } from 'react';
import { departmentAPI } from '../services/api';
import { Building2, Stethoscope, User, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { LoadingBlock } from '../components/ui/Spinner';
import { Footer } from '../components/common/Footer';

export const DepartmentsPage = () => {
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    departmentAPI.getDepartments()
      .then(res => res.success && setDepartments(res.data.departments))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full flex-1">
        
        <div className="mb-8">
          <h1 className="text-3xl font-extrabold text-slate-900">Hospital Departments</h1>
          <p className="text-slate-500 text-sm mt-1">Explore our clinical units and specialized diagnostic wings.</p>
        </div>

        {loading ? (
          <LoadingBlock message="Loading departments..." />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {departments.map(dept => (
              <div key={dept._id} className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs hover:shadow-md transition-shadow">
                <div className="flex items-center space-x-3 mb-4">
                  <div className="w-12 h-12 rounded-2xl bg-indigo-100 text-indigo-600 flex items-center justify-center font-bold">
                    <Building2 className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-slate-900">{dept.name}</h3>
                    <span className="px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 text-[10px] font-mono font-bold">{dept.code}</span>
                  </div>
                </div>

                <p className="text-xs text-slate-600 mb-6 leading-relaxed">{dept.description || 'Specialized outpatient care and clinical facilities.'}</p>

                {dept.headDoctor && (
                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 mb-4 flex items-center space-x-2 text-xs">
                    <User className="w-4 h-4 text-indigo-600" />
                    <div>
                      <span className="text-slate-400 block text-[10px] font-semibold uppercase">Head of Department</span>
                      <span className="font-bold text-slate-800">{dept.headDoctor?.user?.name || 'Dr. Head Specialist'}</span>
                    </div>
                  </div>
                )}

                <Link
                  to={`/doctors?department=${dept._id}`}
                  className="w-full py-2 bg-slate-100 hover:bg-indigo-600 hover:text-white text-slate-700 font-bold text-xs rounded-xl transition-all flex items-center justify-center space-x-2"
                >
                  <span>Browse Doctors</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            ))}
          </div>
        )}
      </div>
      <Footer />
    </div>
  );
};
