const mongoose = require('mongoose');

const medicineSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Please provide medicine brand name'],
      unique: true,
      trim: true
    },
    genericName: {
      type: String,
      required: [true, 'Please provide generic name'],
      trim: true
    },
    category: {
      type: String,
      required: true,
      enum: ['Antibiotic', 'Analgesic', 'Antipyretic', 'Antihistamine', 'Antacid', 'Cardiovascular', 'Vitamin/Supplement', 'Other'],
      default: 'Other'
    },
    strength: {
      type: String, // e.g. "500mg", "10ml"
      required: true
    },
    description: {
      type: String,
      default: ''
    },
    stock: {
      type: Number,
      required: true,
      default: 100
    },
    status: {
      type: String,
      enum: ['Available', 'Out of Stock', 'Discontinued'],
      default: 'Available'
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model('Medicine', medicineSchema);
