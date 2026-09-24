import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { authAPI, patientAPI } from '../../services/api';
import { User, Phone, Mail, Calendar, Shield, AlertTriangle, FileText, Upload, Save, Check } from 'lucide-react';
import { LoadingBlock } from '../../components/ui/Spinner';

export const PatientProfile = () => {
  const { user, refreshUser } = useAuth();
  const [profileData, setProfileData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState({ type: '', text: '' });
  const [docTitle, setDocTitle] = useState('');
  const [selectedFile, setSelectedFile] = useState(null);

  useEffect(() => {
    patientAPI.getMyProfile()
      .then(res => res.success && setProfileData(res.data.patient))
      .finally(() => setLoading(false));
  }, []);

  const handleUpdate = async (e) => {
    e.preventDefault();
    setSaving(true);
    setMsg({ type: '', text: '' });

    try {
      const formData = new FormData();
      formData.append('name', e.target.name.value);
      formData.append('phone', e.target.phone.value);
      formData.append('dob', e.target.dob.value);
      formData.append('gender', e.target.gender.value);
      formData.append('bloodGroup', e.target.bloodGroup.value);
      formData.append('allergies', e.target.allergies.value);
      formData.append('existingConditions', e.target.existingConditions.value);
      formData.append('medicalHistory', e.target.medicalHistory.value);

      const res = await authAPI.updateProfile(formData);
      if (res.success) {
        setMsg({ type: 'success', text: 'Profile updated successfully!' });
        refreshUser();
      }
    } catch (err) {
      setMsg({ type: 'error', text: err.message || 'Update failed' });
    } finally {
      setSaving(false);
    }
  };

  const handleDocUpload = async (e) => {
    e.preventDefault();
    if (!selectedFile) return;

    try {
      const formData = new FormData();
      formData.append('document', selectedFile);
      formData.append('title', docTitle);

      const res = await patientAPI.uploadDocument(formData);
      if (res.success) {
        setProfileData({ ...profileData, uploadedDocuments: res.data.documents });
        setDocTitle('');
        setSelectedFile(null);
        setMsg({ type: 'success', text: 'Medical document uploaded!' });
      }
    } catch (err) {
      setMsg({ type: 'error', text: err.message || 'Upload failed' });
    }
  };

  if (loading) return <LoadingBlock message="Loading profile..." />;

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div>
        <h1 className="text-2xl font-black text-slate-900">Patient Demographics & Medical Profile</h1>
        <p className="text-xs text-slate-500 mt-1">Keep your allergies, contact numbers, and medical documents up-to-date.</p>
      </div>

      {msg.text && (
        <div className={`p-4 rounded-2xl text-xs font-semibold ${msg.type === 'success' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-rose-50 text-rose-700 border border-rose-200'}`}>
          {msg.text}
        </div>
      )}

      <form onSubmit={handleUpdate} className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-xs space-y-6">
        <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider border-b border-slate-100 pb-3">Personal & Contact Details</h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          <div>
            <label className="block font-bold text-slate-700 mb-1">Full Name</label>
            <input type="text" name="name" defaultValue={user?.name} required className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm" />
          </div>
          <div>
            <label className="block font-bold text-slate-700 mb-1">Email (Read Only)</label>
            <input type="email" disabled value={user?.email} className="w-full px-3 py-2 bg-slate-100 text-slate-500 border border-slate-200 rounded-xl text-sm" />
          </div>
          <div>
            <label className="block font-bold text-slate-700 mb-1">Phone Number</label>
            <input type="tel" name="phone" defaultValue={user?.phone} className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm" />
          </div>
          <div>
            <label className="block font-bold text-slate-700 mb-1">Date of Birth</label>
            <input type="date" name="dob" defaultValue={profileData?.dob ? new Date(profileData.dob).toISOString().split('T')[0] : ''} className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm" />
          </div>
          <div>
            <label className="block font-bold text-slate-700 mb-1">Gender</label>
            <select name="gender" defaultValue={profileData?.gender || 'Male'} className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm">
              <option value="Male">Male</option>
              <option value="Female">Female</option>
              <option value="Other">Other</option>
            </select>
          </div>
          <div>
            <label className="block font-bold text-slate-700 mb-1">Blood Group</label>
            <select name="bloodGroup" defaultValue={profileData?.bloodGroup || 'O+'} className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm">
              <option value="A+">A+</option>
              <option value="A-">A-</option>
              <option value="B+">B+</option>
              <option value="B-">B-</option>
              <option value="AB+">AB+</option>
              <option value="AB-">AB-</option>
              <option value="O+">O+</option>
              <option value="O-">O-</option>
            </select>
          </div>
        </div>

        <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider border-b border-slate-100 pb-3 pt-4">Clinical History & Allergies</h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          <div>
            <label className="block font-bold text-slate-700 mb-1">Known Allergies (Comma separated)</label>
            <input type="text" name="allergies" defaultValue={profileData?.allergies?.join(', ')} placeholder="Penicillin, Peanuts" className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm" />
          </div>
          <div>
            <label className="block font-bold text-slate-700 mb-1">Existing Medical Conditions</label>
            <input type="text" name="existingConditions" defaultValue={profileData?.existingConditions?.join(', ')} placeholder="Hypertension, Asthma" className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm" />
          </div>
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-700 mb-1">Detailed Medical Notes</label>
          <textarea name="medicalHistory" rows="3" defaultValue={profileData?.medicalHistory} placeholder="Past surgeries, family medical history..." className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm"></textarea>
        </div>

        <div className="flex justify-end pt-2">
          <button type="submit" disabled={saving} className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold shadow-md shadow-indigo-600/20 transition-all flex items-center space-x-2">
            <Save className="w-4 h-4" />
            <span>{saving ? 'Saving...' : 'Save Profile Changes'}</span>
          </button>
        </div>
      </form>

      {/* Document Upload Section */}
      <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-xs">
        <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider border-b border-slate-100 pb-3 mb-4">Uploaded Medical Documents</h3>
        
        <form onSubmit={handleDocUpload} className="flex flex-col sm:flex-row gap-3 mb-6">
          <input type="text" placeholder="Document Title (e.g. Past MRI Report)" value={docTitle} onChange={e => setDocTitle(e.target.value)} required className="flex-1 px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs" />
          <input type="file" required onChange={e => setSelectedFile(e.target.files[0])} className="text-xs text-slate-500 file:mr-2 file:py-1.5 file:px-3 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-indigo-50 file:text-indigo-700" />
          <button type="submit" className="px-4 py-2 bg-slate-800 hover:bg-slate-900 text-white rounded-xl text-xs font-bold transition-all flex items-center space-x-1.5 justify-center">
            <Upload className="w-4 h-4" />
            <span>Upload File</span>
          </button>
        </form>

        <div className="space-y-2">
          {profileData?.uploadedDocuments?.length > 0 ? (
            profileData.uploadedDocuments.map((doc, idx) => (
              <div key={idx} className="p-3 bg-slate-50 border border-slate-100 rounded-xl flex items-center justify-between text-xs">
                <span className="font-semibold text-slate-800">{doc.title}</span>
                <a href={doc.fileUrl} target="_blank" rel="noreferrer" className="text-indigo-600 font-bold hover:underline">View Document</a>
              </div>
            ))
          ) : (
            <p className="text-xs text-slate-400 py-4 text-center">No documents uploaded yet.</p>
          )}
        </div>
      </div>
    </div>
  );
};
