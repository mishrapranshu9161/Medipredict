const express = require('express');
const router = express.Router();
const { bookAppointment, getAppointments, getBookedSlots, updateAppointmentStatus } = require('../controllers/appointmentController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.get('/booked-slots', getBookedSlots);
router.post('/', protect, authorize('patient'), bookAppointment);
router.get('/', protect, getAppointments);
router.patch('/:id/status', protect, updateAppointmentStatus);

module.exports = router;
