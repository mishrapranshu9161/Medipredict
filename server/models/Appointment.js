const mongoose = require('mongoose');

const appointmentSchema = new mongoose.Schema(
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
    department: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Department',
      required: true
    },
    appointmentDate: {
      type: String, // Stored as ISO string YYYY-MM-DD for easy slot matching
      required: true
    },
    timeSlot: {
      type: String, // e.g., "09:30 AM"
      required: true
    },
    status: {
      type: String,
      enum: ['Pending', 'Confirmed', 'Completed', 'Cancelled', 'Rejected'],
      default: 'Pending'
    },
    reason: {
      type: String,
      required: [true, 'Please provide a reason for consultation']
    },
    consultationNotes: {
      type: String,
      default: ''
    },
    cancellationReason: {
      type: String,
      default: ''
    }
  },
  { timestamps: true }
);

// Compound index for double booking prevention query efficiency
appointmentSchema.index({ doctor: 1, appointmentDate: 1, timeSlot: 1 });

module.exports = mongoose.model('Appointment', appointmentSchema);
