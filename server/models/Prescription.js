const mongoose = require('mongoose');

const prescriptionSchema = new mongoose.Schema(
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
    medicalRecord: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'MedicalRecord'
    },
    date: {
      type: Date,
      default: Date.now
    },
    diagnosis: {
      type: String,
      required: true
    },
    medicines: [
      {
        medicine: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'Medicine'
        },
        name: { type: String, required: true }, // e.g. "Paracetamol"
        dosage: { type: String, required: true }, // e.g. "500mg"
        frequency: { type: String, required: true }, // e.g. "1-0-1 (After Meals)"
        duration: { type: String, required: true }, // e.g. "5 days"
        instructions: { type: String, default: 'Take with water' }
      }
    ],
    additionalNotes: {
      type: String,
      default: ''
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model('Prescription', prescriptionSchema);
