import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Activity, Lock, Mail, ArrowRight, ShieldCheck, Sparkles } from 'lucide-react';
import { Footer } from '../../components/common/Footer';

export const LoginPage = () => {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const res = await login({ email, password });
    setLoading(false);

    if (res.success) {
      if (res.role === 'admin') navigate('/admin/dashboard');
      else if (res.role === 'doctor') navigate('/doctor/dashboard');
      else navigate('/patient/dashboard');
    } else {
      setError(res.message);
    }
  };

  const setDemoUser = (demoEmail, demoPass) => {
    setEmail(demoEmail);
    setPassword(demoPass);
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-between">
      <div className="flex-1 flex items-center justify-center p-4 sm:p-6 lg:p-8">
        <div className="w-full max-w-md bg-white rounded-3xl border border-slate-200/80 shadow-xl p-8">
          
          {/* Logo Header */}
          <div className="text-center mb-8">
            <div className="w-12 h-12 rounded-2xl bg-indigo-600 text-white mx-auto flex items-center justify-center shadow-lg shadow-indigo-600/30 mb-3">
              <Activity className="w-6 h-6" />
            </div>
            <h2 className="text-2xl font-black text-slate-900">Sign in to MediPredict</h2>
            <p className="text-xs text-slate-500 mt-1">Access your hospital portal dashboard</p>
          </div>

          {error && (
            <div className="mb-6 p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-3 w-4 h-4 text-slate-400" />
                <input
                  type="email"
                  required
                  placeholder="name@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">Password</label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-3 w-4 h-4 text-slate-400" />
                <input
                  type="password"
                  required
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm shadow-lg shadow-indigo-600/25 transition-all disabled:opacity-50 flex items-center justify-center space-x-2 mt-2"
            >
              <span>{loading ? 'Authenticating...' : 'Sign In'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          {/* Quick Demo Login Credentials Buttons */}
          <div className="mt-8 pt-6 border-t border-slate-100">
            <span className="text-[11px] font-extrabold uppercase tracking-wider text-slate-400 block text-center mb-3">
              Quick Demo Accounts (1-Click Fill)
            </span>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => setDemoUser('admin@medipredict.com', 'Admin@12345')}
                className="py-1.5 px-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 rounded-lg text-[11px] font-bold transition-colors"
              >
                Admin Demo
              </button>
              <button
                type="button"
                onClick={() => setDemoUser('doctor.sarah@medipredict.com', 'Doctor@12345')}
                className="py-1.5 px-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 rounded-lg text-[11px] font-bold transition-colors"
              >
                Doctor Demo
              </button>
              <button
                type="button"
                onClick={() => setDemoUser('john.doe@example.com', 'Patient@12345')}
                className="py-1.5 px-2 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-lg text-[11px] font-bold transition-colors"
              >
                Patient Demo
              </button>
            </div>
          </div>

          <div className="mt-6 text-center text-xs text-slate-500">
            Don't have a patient account?{' '}
            <Link to="/register" className="font-bold text-indigo-600 hover:underline">
              Register Patient Profile
            </Link>
          </div>

        </div>
      </div>
      <Footer />
    </div>
  );
};
