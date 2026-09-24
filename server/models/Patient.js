const mongoose = require('mongoose');

const patientSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true
    },
    dob: {
      type: Date
    },
    gender: {
      type: String,
      enum: ['Male', 'Female', 'Other', 'Not Specified'],
      default: 'Not Specified'
    },
    bloodGroup: {
      type: String,
      enum: ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-', 'Unknown'],
      default: 'Unknown'
    },
    address: {
      street: String,
      city: String,
      state: String,
      zipCode: String
    },
    emergencyContact: {
      name: String,
      relation: String,
      phone: String
    },
    allergies: [{ type: String }],
    existingConditions: [{ type: String }],
    medicalHistory: {
      type: String,
      default: ''
    },
    uploadedDocuments: [
      {
        title: String,
        fileUrl: String,
        uploadedAt: { type: Date, default: Date.now }
      }
    ]
  },
  { timestamps: true }
);

module.exports = mongoose.model('Patient', patientSchema);
