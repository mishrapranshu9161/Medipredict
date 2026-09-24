const express = require('express');
const router = express.Router();
const { createMedicalRecord, getMedicalRecords } = require('../controllers/medicalRecordController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.post('/', protect, authorize('doctor'), createMedicalRecord);
router.get('/', protect, getMedicalRecords);

module.exports = router;
