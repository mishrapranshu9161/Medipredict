const Prescription = require('../models/Prescription');
const Doctor = require('../models/Doctor');
const Patient = require('../models/Patient');
const { createNotification } = require('../services/notificationService');
const { successResponse, errorResponse } = require('../utils/apiResponse');

// @desc    Create new digital prescription (Doctor)
// @route   POST /api/prescriptions
// @access  Private/Doctor
const createPrescription = async (req, res, next) => {
  try {
    const { patientId, appointmentId, medicalRecordId, diagnosis, medicines, additionalNotes } = req.body;

    if (!patientId || !diagnosis || !medicines || medicines.length === 0) {
      return errorResponse(res, 400, 'Patient, diagnosis, and at least one medicine are required');
    }

    const doctor = await Doctor.findOne({ user: req.user._id });
    if (!doctor) {
      return errorResponse(res, 404, 'Doctor profile not found');
    }

    const prescription = await Prescription.create({
      patient: patientId,
      doctor: doctor._id,
      appointment: appointmentId || null,
      medicalRecord: medicalRecordId || null,
      diagnosis,
      medicines,
      additionalNotes: additionalNotes || ''
    });

    const patient = await Patient.findById(patientId).populate('user', '_id name');
    if (patient && patient.user) {
      await createNotification({
        recipient: patient.user._id,
        title: 'New Digital Prescription Created',
        message: `Dr. ${req.user.name} issued a new prescription for your consultation.`,
        type: 'prescription',
        link: `/patient/prescriptions`
      });
    }

    const populatedPrescription = await Prescription.findById(prescription._id)
      .populate('patient')
      .populate({ path: 'patient', populate: { path: 'user', select: 'name email phone avatar' } })
      .populate({ path: 'doctor', populate: [{ path: 'user', select: 'name email phone' }, { path: 'department', select: 'name' }] });

    return successResponse(res, 201, 'Prescription created successfully', { prescription: populatedPrescription });
  } catch (error) {
    next(error);
  }
};

// @desc    Get prescriptions
// @route   GET /api/prescriptions
// @access  Private
const getPrescriptions = async (req, res, next) => {
  try {
    const { patientId } = req.query;
    const query = {};

    if (req.user.role === 'patient') {
      const patient = await Patient.findOne({ user: req.user._id });
      if (!patient) return successResponse(res, 200, 'No prescriptions', { prescriptions: [] });
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

    const prescriptions = await Prescription.find(query)
      .populate({ path: 'patient', populate: { path: 'user', select: 'name email phone' } })
      .populate({ path: 'doctor', populate: [{ path: 'user', select: 'name email' }, { path: 'department', select: 'name' }] })
      .sort({ date: -1 });

    return successResponse(res, 200, 'Prescriptions retrieved successfully', { prescriptions });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single prescription by ID (for print view)
// @route   GET /api/prescriptions/:id
// @access  Private
const getPrescriptionById = async (req, res, next) => {
  try {
    const prescription = await Prescription.findById(req.params.id)
      .populate({ path: 'patient', populate: { path: 'user', select: 'name email phone' } })
      .populate({
        path: 'doctor',
        populate: [
          { path: 'user', select: 'name email phone' },
          { path: 'department', select: 'name code' }
        ]
      });

    if (!prescription) {
      return errorResponse(res, 404, 'Prescription not found');
    }

    return successResponse(res, 200, 'Prescription details retrieved', { prescription });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createPrescription,
  getPrescriptions,
  getPrescriptionById
};
