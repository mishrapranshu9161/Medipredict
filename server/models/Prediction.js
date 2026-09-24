const mongoose = require('mongoose');

const predictionSchema = new mongoose.Schema(
  {
    patient: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Patient',
      required: true
    },
    symptomsSelected: [{ type: String, required: true }],
    results: [
      {
        condition: { type: String, required: true },
        riskScore: { type: Number, required: true }, // e.g. 0.75
        matchedSymptoms: [{ type: String }],
        explanation: { type: String, default: '' },
        recommendedAction: { type: String, default: 'Consult a qualified healthcare professional.' }
      }
    ],
    disclaimer: {
      type: String,
      default: 'This prediction is for educational and decision-support purposes only and is not a medical diagnosis. Consult a qualified healthcare professional for medical advice.'
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model('Prediction', predictionSchema);
