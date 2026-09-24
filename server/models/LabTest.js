const mongoose = require('mongoose');

const labTestSchema = new mongoose.Schema(
  {
    testName: {
      type: String,
      required: [true, 'Please provide laboratory test name'],
      unique: true,
      trim: true
    },
    category: {
      type: String,
      required: true,
      enum: ['Hematology', 'Biochemistry', 'Microbiology', 'Radiology', 'Pathology', 'Immunology', 'Other'],
      default: 'Biochemistry'
    },
    description: {
      type: String,
      default: ''
    },
    price: {
      type: Number,
      required: true,
      default: 0
    },
    normalRange: {
      type: String,
      default: 'N/A'
    },
    unit: {
      type: String,
      default: ''
    },
    isActive: {
      type: Boolean,
      default: true
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model('LabTest', labTestSchema);
