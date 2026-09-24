const express = require('express');
const router = express.Router();
const { getSymptoms, createSymptom, getDiseases, createDisease } = require('../controllers/diseaseSymptomController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.get('/symptoms', getSymptoms);
router.post('/symptoms', protect, authorize('admin'), createSymptom);

router.get('/diseases', getDiseases);
router.post('/diseases', protect, authorize('admin'), createDisease);

module.exports = router;
