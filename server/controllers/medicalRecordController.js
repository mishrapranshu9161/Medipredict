const MedicalRecord = require('../models/MedicalRecord');
const Patient = require('../models/Patient');
const Doctor = require('../models/Doctor');
const Appointment = require('../models/Appointment');
const { successResponse, errorResponse } = require('../utils/apiResponse');

// @desc    Create EHR Medical Record (Doctor)
// @route   POST /api/medical-records
// @access  Private/Doctor
const createMedicalRecord = async (req, res, next) => {
  try {
    const { patientId, appointmentId, symptoms, diagnosis, vitals, clinicalNotes, treatmentNotes, followUpDate } = req.body;

    if (!patientId || !diagnosis) {
      return errorResponse(res, 400, 'Patient ID and Diagnosis are required');
    }

    const doctor = await Doctor.findOne({ user: req.user._id });
    if (!doctor) {
      return errorResponse(res, 404, 'Doctor profile not found for logged-in user');
    }

    // Auto-calculate BMI if height and weight provided
    let computedVitals = { ...vitals };
    if (vitals && vitals.weight && vitals.height) {
      const heightInMeters = vitals.height / 100;
      computedVitals.bmi = Math.round((vitals.weight / (heightInMeters * heightInMeters)) * 10) / 10;
    }

    const medicalRecord = await MedicalRecord.create({
      patient: patientId,
      doctor: doctor._id,
      appointment: appointmentId || null,
      symptoms: Array.isArray(symptoms) ? symptoms : (symptoms ? symptoms.split(',').map(s => s.trim()) : []),
      diagnosis,
      vitals: computedVitals,
      clinicalNotes: clinicalNotes || '',
      treatmentNotes: treatmentNotes || '',
      followUpDate: followUpDate || null
    });

    // If appointment ID provided, mark appointment as Completed
    if (appointmentId) {
      await Appointment.findByIdAndUpdate(appointmentId, {
        status: 'Completed',
        consultationNotes: clinicalNotes || treatmentNotes || diagnosis
      });
    }

    const populatedRecord = await MedicalRecord.findById(medicalRecord._id)
      .populate('patient')
      .populate({ path: 'doctor', populate: { path: 'user', select: 'name' } });

    return successResponse(res, 201, 'Medical record created successfully', { record: populatedRecord });
  } catch (error) {
    next(error);
  }
};

// @desc    Get medical records for patient or doctor
// @route   GET /api/medical-records
// @access  Private
const getMedicalRecords = async (req, res, next) => {
  try {
    const { patientId } = req.query;
    const query = {};

    if (req.user.role === 'patient') {
      const patient = await Patient.findOne({ user: req.user._id });
      if (!patient) return successResponse(res, 200, 'No medical records', { records: [] });
      query.patient = patient._id;
    } else if (req.user.role === 'doctor') {
      const doctor = await Doctor.findOne({ user: req.user._id });
      if (patientId) {
        query.patient = patientId;
      } else if (doctor) {
        query.doctor = doctor._id;
      }
    } else if (patientId) {
      query.patient = patientId;
    }

    const records = await MedicalRecord.find(query)
      .populate({
        path: 'patient',
        populate: { path: 'user', select: 'name email phone avatar' }
      })
      .populate({
        path: 'doctor',
        populate: [
          { path: 'user', select: 'name email' },
          { path: 'department', select: 'name' }
        ]
      })
      .sort({ visitDate: -1 });

    return successResponse(res, 200, 'Medical records fetched successfully', { records });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createMedicalRecord,
  getMedicalRecords
};
