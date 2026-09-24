const LabTest = require('../models/LabTest');
const LabReport = require('../models/LabReport');
const Doctor = require('../models/Doctor');
const Patient = require('../models/Patient');
const { createNotification } = require('../services/notificationService');
const { successResponse, errorResponse } = require('../utils/apiResponse');

// --- LAB TESTS MASTER CONTROLLERS ---

// @desc    Get lab tests catalog
// @route   GET /api/labs/tests
// @access  Public
const getLabTests = async (req, res, next) => {
  try {
    const { category, search } = req.query;
    const query = { isActive: true };

    if (category) query.category = category;
    if (search) {
      query.testName = { $regex: search, $options: 'i' };
    }

    const tests = await LabTest.find(query).sort({ testName: 1 });
    return successResponse(res, 200, 'Lab tests catalog fetched', { tests });
  } catch (error) {
    next(error);
  }
};

// @desc    Create lab test (Admin)
// @route   POST /api/labs/tests
// @access  Private/Admin
const createLabTest = async (req, res, next) => {
  try {
    const { testName, category, description, price, normalRange, unit } = req.body;

    if (!testName || !category) {
      return errorResponse(res, 400, 'Test name and category are required');
    }

    const test = await LabTest.create({
      testName,
      category,
      description: description || '',
      price: price || 0,
      normalRange: normalRange || 'N/A',
      unit: unit || ''
    });

    return successResponse(res, 201, 'Lab test created', { test });
  } catch (error) {
    next(error);
  }
};

// --- LAB REPORT CONTROLLERS ---

// @desc    Request a lab test for patient (Doctor)
// @route   POST /api/labs/reports/request
// @access  Private/Doctor
const requestLabTest = async (req, res, next) => {
  try {
    const { patientId, labTestId, appointmentId, remarks } = req.body;

    if (!patientId || !labTestId) {
      return errorResponse(res, 400, 'Patient and Lab Test are required');
    }

    const doctor = await Doctor.findOne({ user: req.user._id });
    if (!doctor) {
      return errorResponse(res, 404, 'Doctor profile not found');
    }

    const test = await LabTest.findById(labTestId);
    if (!test) {
      return errorResponse(res, 404, 'Lab test not found');
    }

    const labReport = await LabReport.create({
      patient: patientId,
      doctor: doctor._id,
      labTest: labTestId,
      appointment: appointmentId || null,
      remarks: remarks || '',
      referenceRange: test.normalRange,
      unit: test.unit,
      status: 'Requested'
    });

    const patient = await Patient.findById(patientId).populate('user', '_id name');
    if (patient && patient.user) {
      await createNotification({
        recipient: patient.user._id,
        title: 'Lab Test Requested',
        message: `Dr. ${req.user.name} ordered lab test: ${test.testName}.`,
        type: 'lab',
        link: '/patient/labs'
      });
    }

    return successResponse(res, 201, 'Lab test requested successfully', { report: labReport });
  } catch (error) {
    next(error);
  }
};

// @desc    Upload / Complete lab report (Admin/Lab Staff)
// @route   PUT /api/labs/reports/:id/upload
// @access  Private/Admin/Doctor
const uploadLabReport = async (req, res, next) => {
  try {
    const report = await LabReport.findById(req.params.id)
      .populate('patient')
      .populate({ path: 'patient', populate: { path: 'user', select: '_id name' } })
      .populate('labTest');

    if (!report) {
      return errorResponse(res, 404, 'Lab report entry not found');
    }

    const { result, referenceRange, unit, remarks, status } = req.body;

    if (result !== undefined) report.result = result;
    if (referenceRange !== undefined) report.referenceRange = referenceRange;
    if (unit !== undefined) report.unit = unit;
    if (remarks !== undefined) report.remarks = remarks;
    report.status = status || 'Completed';

    if (req.file) {
      report.reportFile = req.file.path || `/uploads/${req.file.filename}`;
    }

    await report.save();

    if (report.patient && report.patient.user) {
      await createNotification({
        recipient: report.patient.user._id,
        title: 'Lab Report Available',
        message: `Your lab test results for ${report.labTest ? report.labTest.testName : 'Lab Test'} are ready to view/download.`,
        type: 'lab',
        link: '/patient/labs'
      });
    }

    return successResponse(res, 200, 'Lab report updated/uploaded successfully', { report });
  } catch (error) {
    next(error);
  }
};

// @desc    Get lab reports
// @route   GET /api/labs/reports
// @access  Private
const getLabReports = async (req, res, next) => {
  try {
    const { patientId, status } = req.query;
    const query = {};

    if (status) query.status = status;

    if (req.user.role === 'patient') {
      const patient = await Patient.findOne({ user: req.user._id });
      if (!patient) return successResponse(res, 200, 'No lab reports', { reports: [] });
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

    const reports = await LabReport.find(query)
      .populate('labTest')
      .populate({ path: 'patient', populate: { path: 'user', select: 'name email phone' } })
      .populate({ path: 'doctor', populate: { path: 'user', select: 'name' } })
      .sort({ createdAt: -1 });

    return successResponse(res, 200, 'Lab reports fetched', { reports });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getLabTests,
  createLabTest,
  requestLabTest,
  uploadLabReport,
  getLabReports
};
