const express = require('express');
const router = express.Router();
const { getLabTests, createLabTest, requestLabTest, uploadLabReport, getLabReports } = require('../controllers/labController');
const { protect, authorize } = require('../middleware/authMiddleware');
const upload = require('../config/cloudinary');

router.get('/tests', getLabTests);
router.post('/tests', protect, authorize('admin'), createLabTest);

router.post('/reports/request', protect, authorize('doctor'), requestLabTest);
router.put('/reports/:id/upload', protect, authorize('admin', 'doctor'), upload.single('reportFile'), uploadLabReport);
router.get('/reports', protect, getLabReports);

module.exports = router;
