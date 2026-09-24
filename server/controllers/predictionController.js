const Prediction = require('../models/Prediction');
const Patient = require('../models/Patient');
const { predictDisease } = require('../services/predictionService');
const { successResponse, errorResponse } = require('../utils/apiResponse');

// @desc    Run disease risk prediction on provided symptoms
// @route   POST /api/predictions/predict
// @access  Private/Patient
const predict = async (req, res, next) => {
  try {
    const { symptoms } = req.body;

    if (!symptoms || !Array.isArray(symptoms) || symptoms.length === 0) {
      return errorResponse(res, 400, 'Please provide an array of selected symptoms');
    }

    const patient = await Patient.findOne({ user: req.user._id });
    if (!patient) {
      return errorResponse(res, 404, 'Patient profile not found for logged in user');
    }

    // Call modular prediction service
    const results = await predictDisease(symptoms);

    const disclaimer = 'This prediction is for educational and decision-support purposes only and is not a medical diagnosis. Consult a qualified healthcare professional for medical advice.';

    // Save prediction instance to MongoDB
    const predictionRecord = await Prediction.create({
      patient: patient._id,
      symptomsSelected: symptoms,
      results: results,
      disclaimer: disclaimer
    });

    return successResponse(res, 200, 'Disease risk assessment calculated', {
      predictionId: predictionRecord._id,
      symptomsSelected: symptoms,
      results,
      disclaimer,
      createdAt: predictionRecord.createdAt
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get prediction history for logged in patient or doctor reviewing patient
// @route   GET /api/predictions/history
// @access  Private
const getPredictionHistory = async (req, res, next) => {
  try {
    const { patientId } = req.query;
    const query = {};

    if (req.user.role === 'patient') {
      const patient = await Patient.findOne({ user: req.user._id });
      if (!patient) return successResponse(res, 200, 'No prediction history', { history: [] });
      query.patient = patient._id;
    } else if (patientId) {
      query.patient = patientId;
    }

    const history = await Prediction.find(query)
      .populate({ path: 'patient', populate: { path: 'user', select: 'name email' } })
      .sort({ createdAt: -1 });

    return successResponse(res, 200, 'Prediction history retrieved', { history });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  predict,
  getPredictionHistory
};
