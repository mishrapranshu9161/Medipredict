import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { NotificationProvider } from './context/NotificationContext';
import { ProtectedRoute, RoleRoute } from './components/ProtectedRoute';
import { PublicLayout, DashboardLayout } from './layouts/DashboardLayout';

// Public Pages
import { LandingPage } from './pages/LandingPage';
import { DoctorsPage } from './pages/DoctorsPage';
import { DepartmentsPage } from './pages/DepartmentsPage';
import { LoginPage } from './pages/auth/LoginPage';
import { RegisterPage } from './pages/auth/RegisterPage';

// Printable Page
import { PrescriptionPrintPage } from './pages/PrescriptionPrintPage';

// Patient Pages
import { PatientDashboard } from './pages/patient/PatientDashboard';
import { PatientProfile } from './pages/patient/PatientProfile';
import { PatientAppointments } from './pages/patient/PatientAppointments';
import { DiseasePredictorPage } from './pages/patient/DiseasePredictorPage';
import { PatientPrescriptionsPage } from './pages/patient/PatientPrescriptionsPage';
import { PatientLabsPage } from './pages/patient/PatientLabsPage';

// Doctor Pages
import { DoctorDashboard } from './pages/doctor/DoctorDashboard';
import { DoctorAppointments } from './pages/doctor/DoctorAppointments';
import { DoctorPatientsPage } from './pages/doctor/DoctorPatientsPage';

// Admin Pages
import { AdminDashboard } from './pages/admin/AdminDashboard';
import { AdminPatients } from './pages/admin/AdminPatients';
import { AdminDoctors } from './pages/admin/AdminDoctors';
import { AdminDepartments } from './pages/admin/AdminDepartments';
import { AdminAppointments } from './pages/admin/AdminAppointments';
import { AdminMedicines } from './pages/admin/AdminMedicines';
import { AdminDiseases } from './pages/admin/AdminDiseases';
import { AdminLabs } from './pages/admin/AdminLabs';

export default function App() {
  return (
    <AuthProvider>
      <NotificationProvider>
        <Routes>
          
          {/* Public Routes */}
          <Route element={<PublicLayout />}>
            <Route path="/" element={<LandingPage />} />
            <Route path="/doctors" element={<DoctorsPage />} />
            <Route path="/departments" element={<DepartmentsPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
          </Route>

          {/* Printable Prescription Route */}
          <Route element={<ProtectedRoute />}>
            <Route path="/prescriptions/:id/print" element={<PrescriptionPrintPage />} />
          </Route>

          {/* Protected Dashboard Routes */}
          <Route element={<ProtectedRoute />}>
            <Route element={<DashboardLayout />}>
              
              {/* Patient Routes */}
              <Route element={<RoleRoute allowedRoles={['patient']} />}>
                <Route path="/patient/dashboard" element={<PatientDashboard />} />
                <Route path="/patient/profile" element={<PatientProfile />} />
                <Route path="/patient/appointments" element={<PatientAppointments />} />
                <Route path="/patient/prediction" element={<DiseasePredictorPage />} />
                <Route path="/patient/prescriptions" element={<PatientPrescriptionsPage />} />
                <Route path="/patient/labs" element={<PatientLabsPage />} />
              </Route>

              {/* Doctor Routes */}
              <Route element={<RoleRoute allowedRoles={['doctor']} />}>
                <Route path="/doctor/dashboard" element={<DoctorDashboard />} />
                <Route path="/doctor/appointments" element={<DoctorAppointments />} />
                <Route path="/doctor/patients" element={<DoctorPatientsPage />} />
              </Route>

              {/* Admin Routes */}
              <Route element={<RoleRoute allowedRoles={['admin']} />}>
                <Route path="/admin/dashboard" element={<AdminDashboard />} />
                <Route path="/admin/patients" element={<AdminPatients />} />
                <Route path="/admin/doctors" element={<AdminDoctors />} />
                <Route path="/admin/departments" element={<AdminDepartments />} />
                <Route path="/admin/appointments" element={<AdminAppointments />} />
                <Route path="/admin/medicines" element={<AdminMedicines />} />
                <Route path="/admin/diseases" element={<AdminDiseases />} />
                <Route path="/admin/labs" element={<AdminLabs />} />
              </Route>

            </Route>
          </Route>

          {/* Fallback Catch-all */}
          <Route path="*" element={<Navigate to="/" replace />} />

        </Routes>
      </NotificationProvider>
    </AuthProvider>
  );
}
