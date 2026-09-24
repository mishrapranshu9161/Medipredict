const express = require('express');
const router = express.Router();
const { predict, getPredictionHistory } = require('../controllers/predictionController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.post('/predict', protect, authorize('patient'), predict);
router.get('/history', protect, getPredictionHistory);

module.exports = router;
