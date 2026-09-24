import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { doctorAPI, departmentAPI } from '../services/api';
import { Activity, Sparkles, ShieldCheck, Calendar, Users, Stethoscope, ArrowRight, CheckCircle2 } from 'lucide-react';
import { Footer } from '../components/common/Footer';

export const LandingPage = () => {
  const [doctors, setDoctors] = useState([]);
  const [departments, setDepartments] = useState([]);

  useEffect(() => {
    doctorAPI.getDoctors().then(res => res.success && setDoctors(res.data.doctors.slice(0, 4))).catch(() => {});
    departmentAPI.getDepartments().then(res => res.success && setDepartments(res.data.departments.slice(0, 4))).catch(() => {});
  }, []);

  return (
    <div className="flex flex-col min-h-screen bg-slate-50">
      {/* Hero Section */}
      <section className="relative pt-12 pb-20 md:pt-20 md:pb-28 overflow-hidden bg-gradient-to-b from-indigo-900 via-slate-900 to-slate-950 text-white">
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#3b82f6_1px,transparent_1px)] [background-size:16px_16px]"></div>
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            
            <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
              <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-indigo-500/20 border border-indigo-400/30 text-indigo-300 text-xs font-semibold backdrop-blur-md">
                <Sparkles className="w-4 h-4 text-indigo-400" />
                <span>AI-Powered Disease Risk Prediction & EHR System</span>
              </div>

              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight leading-tight">
                Modern Hospital Care <br />
                <span className="bg-gradient-to-r from-cyan-400 via-indigo-300 to-blue-400 bg-clip-text text-transparent">
                  & Smart Risk Analysis
                </span>
              </h1>

              <p className="text-base sm:text-lg text-slate-300 max-w-2xl mx-auto lg:mx-0 font-normal leading-relaxed">
                MediPredict seamlessly unites outpatient appointment scheduling, electronic health records (EHR), digital prescriptions, laboratory workflows, and educational disease risk scoring into one unified hospital platform.
              </p>

              <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 pt-4">
                <Link
                  to="/register"
                  className="w-full sm:w-auto px-7 py-3.5 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-sm shadow-xl shadow-indigo-600/30 transition-all flex items-center justify-center space-x-2"
                >
                  <span>Book Appointment Now</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>

                <Link
                  to="/patient/prediction"
                  className="w-full sm:w-auto px-7 py-3.5 rounded-2xl bg-slate-800/80 hover:bg-slate-800 text-slate-200 border border-slate-700/80 font-bold text-sm backdrop-blur-md transition-all flex items-center justify-center space-x-2"
                >
                  <Sparkles className="w-4 h-4 text-indigo-400" />
                  <span>Check Disease Symptoms</span>
                </Link>
              </div>

              <div className="pt-8 border-t border-slate-800/80 grid grid-cols-3 gap-4 text-center lg:text-left">
                <div>
                  <h4 className="text-2xl font-black text-white">99.8%</h4>
                  <p className="text-xs text-slate-400 font-medium">Slot Accuracy</p>
                </div>
                <div>
                  <h4 className="text-2xl font-black text-white">24/7</h4>
                  <p className="text-xs text-slate-400 font-medium">Digital Portal</p>
                </div>
                <div>
                  <h4 className="text-2xl font-black text-white">100%</h4>
                  <p className="text-xs text-slate-400 font-medium">HIPAA Security Standard</p>
                </div>
              </div>
            </div>

            {/* Feature Card Preview */}
            <div className="lg:col-span-5">
              <div className="relative mx-auto max-w-md bg-slate-900/90 border border-slate-700/60 rounded-3xl p-6 shadow-2xl backdrop-blur-xl">
                <div className="flex items-center space-x-3 mb-6 pb-4 border-b border-slate-800">
                  <div className="w-10 h-10 rounded-2xl bg-indigo-600 flex items-center justify-center text-white font-bold">
                    <Activity className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-white">Educational Risk Engine</h3>
                    <p className="text-xs text-slate-400">Clinical decision-support tool</p>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="p-3.5 rounded-2xl bg-slate-800/60 border border-slate-700/50">
                    <div className="flex items-center justify-between text-xs mb-1">
                      <span className="font-semibold text-slate-300">Selected Symptoms</span>
                      <span className="text-indigo-400 font-bold">3 Symptoms</span>
                    </div>
                    <p className="text-xs text-slate-400">Fever, Cough, Body Pain</p>
                  </div>

                  <div className="p-3.5 rounded-2xl bg-indigo-950/40 border border-indigo-500/30">
                    <div className="flex items-center justify-between text-xs mb-1">
                      <span className="font-bold text-indigo-300">Viral Influenza Risk</span>
                      <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 font-bold text-[10px]">Score: 0.78</span>
                    </div>
                    <p className="text-[11px] text-slate-300">Matched key indicators. Consult a physician for diagnostic advice.</p>
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* Departments Showcase */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <h2 className="text-3xl font-extrabold text-slate-900">Clinical Departments</h2>
            <p className="text-slate-500 text-sm mt-2">Specialized medical services backed by experienced consultants</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {departments.map(dept => (
              <div key={dept._id} className="p-6 rounded-2xl bg-slate-50 border border-slate-100 hover:shadow-lg transition-all">
                <div className="w-12 h-12 rounded-xl bg-indigo-100 text-indigo-600 flex items-center justify-center font-bold mb-4">
                  <Stethoscope className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-bold text-slate-800">{dept.name}</h3>
                <p className="text-xs text-slate-500 mt-2 line-clamp-2">{dept.description}</p>
                <Link to="/doctors" className="inline-flex items-center text-xs font-bold text-indigo-600 hover:underline mt-4">
                  <span>View Specialist Doctors</span>
                  <ArrowRight className="w-3.5 h-3.5 ml-1" />
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};
