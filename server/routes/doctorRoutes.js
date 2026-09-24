const express = require('express');
const router = express.Router();
const { getDoctors, getDoctorById, createDoctor, updateDoctor } = require('../controllers/doctorController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.get('/', getDoctors);
router.get('/:id', getDoctorById);
router.post('/', protect, authorize('admin'), createDoctor);
router.put('/:id', protect, authorize('doctor', 'admin'), updateDoctor);

module.exports = router;
