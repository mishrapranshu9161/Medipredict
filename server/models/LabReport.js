const mongoose = require('mongoose');

const labReportSchema = new mongoose.Schema(
  {
    patient: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Patient',
      required: true
    },
    doctor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Doctor',
      required: true
    },
    labTest: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'LabTest',
      required: true
    },
    appointment: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Appointment'
    },
    testDate: {
      type: Date,
      default: Date.now
    },
    result: {
      type: String,
      default: ''
    },
    referenceRange: {
      type: String,
      default: ''
    },
    unit: {
      type: String,
      default: ''
    },
    remarks: {
      type: String,
      default: ''
    },
    reportFile: {
      type: String, // Cloudinary URL or local file path
      default: ''
    },
    status: {
      type: String,
      enum: ['Requested', 'Processing', 'Completed', 'Cancelled'],
      default: 'Requested'
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model('LabReport', labReportSchema);
