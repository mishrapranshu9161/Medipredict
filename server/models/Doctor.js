const mongoose = require('mongoose');

const doctorSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true
    },
    department: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Department',
      required: true
    },
    qualification: {
      type: String,
      required: [true, 'Please specify doctor qualification (e.g. MBBS, MD)']
    },
    specialization: {
      type: String,
      required: [true, 'Please specify doctor specialization']
    },
    experienceYears: {
      type: Number,
      required: true,
      default: 1
    },
    consultationFee: {
      type: Number,
      required: true,
      default: 500
    },
    availability: [
      {
        day: {
          type: String,
          enum: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
          required: true
        },
        slots: [{ type: String }] // e.g. ["09:00 AM", "09:30 AM", "10:00 AM", "02:00 PM"]
      }
    ],
    bio: {
      type: String,
      default: ''
    },
    isApproved: {
      type: Boolean,
      default: true
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model('Doctor', doctorSchema);
