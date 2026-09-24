import axios from 'axios';

const API = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json'
  }
});

// Request Interceptor: Attach JWT Bearer token
API.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('medipredict_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response Interceptor: Global error extraction
API.interceptors.response.use(
  (response) => response.data,
  (error) => {
    const message =
      error.response && error.response.data && error.response.data.message
        ? error.response.data.message
        : error.message || 'An unexpected error occurred';
    return Promise.reject({ ...error, message });
  }
);

// Modular API Client Methods
export const authAPI = {
  login: (credentials) => API.post('/auth/login', credentials),
  register: (patientData) => API.post('/auth/register', patientData),
  getMe: () => API.get('/auth/me'),
  updateProfile: (formData) => API.put('/auth/profile', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
  changePassword: (data) => API.put('/auth/change-password', data)
};

export const userAPI = {
  getUsers: (params) => API.get('/users', { params }),
  toggleStatus: (id) => API.patch(`/users/${id}/toggle-status`),
  deleteUser: (id) => API.delete(`/users/${id}`)
};

export const patientAPI = {
  getMyProfile: () => API.get('/patients/me'),
  getPatients: (params) => API.get('/patients', { params }),
  getPatientById: (id) => API.get(`/patients/${id}`),
  uploadDocument: (formData) => API.post('/patients/upload-document', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  })
};

export const doctorAPI = {
  getDoctors: (params) => API.get('/doctors', { params }),
  getDoctorById: (id) => API.get(`/doctors/${id}`),
  createDoctor: (data) => API.post('/doctors', data),
  updateDoctor: (id, data) => API.put(`/doctors/${id}`, data)
};

export const departmentAPI = {
  getDepartments: () => API.get('/departments'),
  createDepartment: (data) => API.post('/departments', data),
  updateDepartment: (id, data) => API.put(`/departments/${id}`, data),
  deleteDepartment: (id) => API.delete(`/departments/${id}`)
};

export const appointmentAPI = {
  bookAppointment: (data) => API.post('/appointments', data),
  getAppointments: (params) => API.get('/appointments', { params }),
  getBookedSlots: (doctorId, date) => API.get('/appointments/booked-slots', { params: { doctorId, date } }),
  updateStatus: (id, data) => API.patch(`/appointments/${id}/status`, data)
};

export const medicalRecordAPI = {
  createRecord: (data) => API.post('/medical-records', data),
  getRecords: (params) => API.get('/medical-records', { params })
};

export const prescriptionAPI = {
  createPrescription: (data) => API.post('/prescriptions', data),
  getPrescriptions: (params) => API.get('/prescriptions', { params }),
  getPrescriptionById: (id) => API.get(`/prescriptions/${id}`)
};

export const medicineAPI = {
  getMedicines: (params) => API.get('/medicines', { params }),
  createMedicine: (data) => API.post('/medicines', data),
  updateMedicine: (id, data) => API.put(`/medicines/${id}`, data),
  deleteMedicine: (id) => API.delete(`/medicines/${id}`)
};

export const labAPI = {
  getLabTests: (params) => API.get('/labs/tests', { params }),
  createLabTest: (data) => API.post('/labs/tests', data),
  requestLabTest: (data) => API.post('/labs/reports/request', data),
  uploadLabReport: (id, formData) => API.put(`/labs/reports/${id}/upload`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
  getLabReports: (params) => API.get('/labs/reports', { params })
};

export const predictionAPI = {
  predict: (symptoms) => API.post('/predictions/predict', { symptoms }),
  getHistory: (params) => API.get('/predictions/history', { params })
};

export const diseaseSymptomAPI = {
  getSymptoms: () => API.get('/symptoms/symptoms'),
  createSymptom: (data) => API.post('/symptoms/symptoms', data),
  getDiseases: () => API.get('/diseases/diseases'),
  createDisease: (data) => API.post('/diseases/diseases', data)
};

export const adminAPI = {
  getAnalytics: () => API.get('/admin/analytics')
};

export const notificationAPI = {
  getNotifications: () => API.get('/notifications'),
  markAsRead: (notificationId) => API.patch('/notifications/mark-read', { notificationId })
};

export default API;
