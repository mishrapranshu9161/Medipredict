const express = require('express');
const router = express.Router();
const { getMyPatientProfile, getPatients, getPatientById, uploadDocument } = require('../controllers/patientController');
const { protect, authorize } = require('../middleware/authMiddleware');
const upload = require('../config/cloudinary');

router.get('/me', protect, authorize('patient'), getMyPatientProfile);
router.get('/', protect, authorize('doctor', 'admin'), getPatients);
router.get('/:id', protect, getPatientById);
router.post('/upload-document', protect, authorize('patient'), upload.single('document'), uploadDocument);

module.exports = router;
