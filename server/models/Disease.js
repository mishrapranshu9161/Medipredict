const mongoose = require('mongoose');

const diseaseSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Please provide disease name'],
      unique: true,
      trim: true
    },
    category: {
      type: String,
      required: true
    },
    symptoms: [
      {
        symptom: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'Symptom'
        },
        name: String,
        weight: {
          type: Number,
          default: 1.0 // Severity / specificity weight for algorithm
        }
      }
    ],
    riskLevel: {
      type: String,
      enum: ['Low', 'Moderate', 'High', 'Critical'],
      default: 'Moderate'
    },
    description: {
      type: String,
      default: ''
    },
    precautions: [{ type: String }],
    recommendedAction: {
      type: String,
      default: 'Consult a healthcare professional for clinical evaluation.'
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model('Disease', diseaseSchema);
