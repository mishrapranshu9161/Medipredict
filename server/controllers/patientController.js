const Patient = require('../models/Patient');
const MedicalRecord = require('../models/MedicalRecord');
const Prescription = require('../models/Prescription');
const LabReport = require('../models/LabReport');
const Appointment = require('../models/Appointment');
const { successResponse, errorResponse } = require('../utils/apiResponse');

// @desc    Get current patient profile with full details
// @route   GET /api/patients/me
// @access  Private/Patient
const getMyPatientProfile = async (req, res, next) => {
  try {
    const patient = await Patient.findOne({ user: req.user._id }).populate('user', 'name email phone avatar');
    if (!patient) {
      return errorResponse(res, 404, 'Patient profile not found');
    }
    return successResponse(res, 200, 'Patient profile retrieved', { patient });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all patients (for Doctor or Admin)
// @route   GET /api/patients
// @access  Private/Doctor/Admin
const getPatients = async (req, res, next) => {
  try {
    const { search, page = 1, limit = 20 } = req.query;

    let patientQuery = Patient.find().populate('user', 'name email phone avatar isActive');

    if (search) {
      const users = await require('../models/User').find({
        role: 'patient',
        $or: [
          { name: { $regex: search, $options: 'i' } },
          { email: { $regex: search, $options: 'i' } },
          { phone: { $regex: search, $options: 'i' } }
        ]
      }).select('_id');
      const userIds = users.map(u => u._id);
      patientQuery = patientQuery.where('user').in(userIds);
    }

    const count = await Patient.countDocuments(patientQuery.getFilter());
    const patients = await patientQuery
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit));

    return successResponse(res, 200, 'Patients retrieved successfully', {
      patients,
      page: Number(page),
      pages: Math.ceil(count / limit),
      total: count
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single patient details by ID
// @route   GET /api/patients/:id
// @access  Private/Doctor/Admin/Patient
const getPatientById = async (req, res, next) => {
  try {
    const patient = await Patient.findById(req.params.id).populate('user', 'name email phone avatar');
    if (!patient) {
      return errorResponse(res, 404, 'Patient record not found');
    }

    // Check authorization: if role is patient, ensure it's their own record
    if (req.user.role === 'patient' && patient.user._id.toString() !== req.user._id.toString()) {
      return errorResponse(res, 403, 'Access denied to other patient records');
    }

    // Fetch medical timeline summary
    const medicalRecords = await MedicalRecord.find({ patient: patient._id })
      .populate('doctor', 'qualification specialization')
      .populate({ path: 'doctor', populate: { path: 'user', select: 'name' } })
      .sort({ visitDate: -1 });

    const prescriptions = await Prescription.find({ patient: patient._id })
      .populate({ path: 'doctor', populate: { path: 'user', select: 'name' } })
      .sort({ date: -1 });

    const labReports = await LabReport.find({ patient: patient._id })
      .populate('labTest')
      .populate({ path: 'doctor', populate: { path: 'user', select: 'name' } })
      .sort({ createdAt: -1 });

    return successResponse(res, 200, 'Patient details retrieved', {
      patient,
      medicalRecords,
      prescriptions,
      labReports
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Upload medical document to patient profile
// @route   POST /api/patients/upload-document
// @access  Private/Patient
const uploadDocument = async (req, res, next) => {
  try {
    if (!req.file) {
      return errorResponse(res, 400, 'Please attach a document file');
    }

    const { title } = req.body;
    const patient = await Patient.findOne({ user: req.user._id });
    if (!patient) {
      return errorResponse(res, 404, 'Patient record not found');
    }

    const fileUrl = req.file.path || `/uploads/${req.file.filename}`;

    patient.uploadedDocuments.push({
      title: title || req.file.originalname,
      fileUrl
    });

    await patient.save();

    return successResponse(res, 200, 'Document uploaded successfully', {
      documents: patient.uploadedDocuments
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getMyPatientProfile,
  getPatients,
  getPatientById,
  uploadDocument
};
