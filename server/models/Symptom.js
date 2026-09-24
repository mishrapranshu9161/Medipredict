const mongoose = require('mongoose');

const symptomSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Please provide symptom name'],
      unique: true,
      trim: true
    },
    category: {
      type: String,
      enum: ['General', 'Respiratory', 'Cardiovascular', 'Gastrointestinal', 'Neurological', 'Dermatological', 'Musculoskeletal', 'Other'],
      default: 'General'
    },
    severity: {
      type: String,
      enum: ['Mild', 'Moderate', 'Severe'],
      default: 'Moderate'
    },
    description: {
      type: String,
      default: ''
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model('Symptom', symptomSchema);
