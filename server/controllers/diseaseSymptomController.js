const Symptom = require('../models/Symptom');
const Disease = require('../models/Disease');
const { successResponse, errorResponse } = require('../utils/apiResponse');

// --- SYMPTOMS ---

// @desc    Get all symptoms
// @route   GET /api/symptoms
// @access  Public
const getSymptoms = async (req, res, next) => {
  try {
    const symptoms = await Symptom.find().sort({ name: 1 });
    return successResponse(res, 200, 'Symptoms retrieved', { symptoms });
  } catch (error) {
    next(error);
  }
};

// @desc    Create symptom (Admin)
// @route   POST /api/symptoms
// @access  Private/Admin
const createSymptom = async (req, res, next) => {
  try {
    const { name, category, severity, description } = req.body;

    if (!name) {
      return errorResponse(res, 400, 'Symptom name is required');
    }

    const symptom = await Symptom.create({
      name,
      category: category || 'General',
      severity: severity || 'Moderate',
      description: description || ''
    });

    return successResponse(res, 201, 'Symptom created', { symptom });
  } catch (error) {
    next(error);
  }
};

// --- DISEASES ---

// @desc    Get all diseases
// @route   GET /api/diseases
// @access  Public
const getDiseases = async (req, res, next) => {
  try {
    const diseases = await Disease.find().populate('symptoms.symptom').sort({ name: 1 });
    return successResponse(res, 200, 'Diseases retrieved', { diseases });
  } catch (error) {
    next(error);
  }
};

// @desc    Create disease (Admin)
// @route   POST /api/diseases
// @access  Private/Admin
const createDisease = async (req, res, next) => {
  try {
    const { name, category, symptoms, riskLevel, description, precautions, recommendedAction } = req.body;

    if (!name || !category) {
      return errorResponse(res, 400, 'Disease name and category are required');
    }

    const disease = await Disease.create({
      name,
      category,
      symptoms: symptoms || [],
      riskLevel: riskLevel || 'Moderate',
      description: description || '',
      precautions: precautions || [],
      recommendedAction: recommendedAction || 'Consult a healthcare professional.'
    });

    return successResponse(res, 201, 'Disease record created', { disease });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getSymptoms,
  createSymptom,
  getDiseases,
  createDisease
};
