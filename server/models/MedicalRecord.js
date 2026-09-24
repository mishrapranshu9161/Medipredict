const mongoose = require('mongoose');

const medicalRecordSchema = new mongoose.Schema(
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
    appointment: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Appointment'
    },
    visitDate: {
      type: Date,
      default: Date.now
    },
    symptoms: [{ type: String }],
    clinicalNotes: {
      type: String,
      default: ''
    },
    diagnosis: {
      type: String,
      required: true
    },
    vitals: {
      bloodPressure: { type: String, default: '120/80' },
      heartRate: { type: Number, default: 72 }, // bpm
      temperature: { type: Number, default: 98.6 }, // Fahrenheit
      weight: { type: Number }, // kg
      height: { type: Number }, // cm
      bmi: { type: Number }
    },
    treatmentNotes: {
      type: String,
      default: ''
    },
    followUpDate: {
      type: Date
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model('MedicalRecord', medicalRecordSchema);
