const Appointment = require('../models/Appointment');
const Patient = require('../models/Patient');
const Doctor = require('../models/Doctor');
const Department = require('../models/Department');
const { createNotification } = require('../services/notificationService');
const { successResponse, errorResponse } = require('../utils/apiResponse');

// @desc    Book a new appointment (Patient)
// @route   POST /api/appointments
// @access  Private/Patient
const bookAppointment = async (req, res, next) => {
  try {
    const { doctorId, departmentId, appointmentDate, timeSlot, reason } = req.body;

    if (!doctorId || !departmentId || !appointmentDate || !timeSlot || !reason) {
      return errorResponse(res, 400, 'Please provide doctor, department, date, time slot, and reason');
    }

    const patient = await Patient.findOne({ user: req.user._id });
    if (!patient) {
      return errorResponse(res, 404, 'Patient record not found for logged-in user');
    }

    const doctor = await Doctor.findById(doctorId).populate('user', 'name');
    if (!doctor) {
      return errorResponse(res, 404, 'Selected doctor not found');
    }

    // DOUBLE BOOKING CHECK
    const existingAppointment = await Appointment.findOne({
      doctor: doctorId,
      appointmentDate: appointmentDate,
      timeSlot: timeSlot,
      status: { $nin: ['Cancelled', 'Rejected'] }
    });

    if (existingAppointment) {
      return errorResponse(
        res,
        409,
        `Doctor ${doctor.user.name} is already booked for ${timeSlot} on ${appointmentDate}. Please choose another time slot.`
      );
    }

    const appointment = await Appointment.create({
      patient: patient._id,
      doctor: doctorId,
      department: departmentId,
      appointmentDate,
      timeSlot,
      reason,
      status: 'Pending'
    });

    // Notify Doctor
    await createNotification({
      recipient: doctor.user._id,
      title: 'New Appointment Booking',
      message: `Patient ${req.user.name} booked an appointment for ${appointmentDate} at ${timeSlot}.`,
      type: 'appointment',
      link: '/doctor/appointments'
    });

    const populatedAppointment = await Appointment.findById(appointment._id)
      .populate('patient')
      .populate({ path: 'patient', populate: { path: 'user', select: 'name email phone' } })
      .populate({ path: 'doctor', populate: { path: 'user', select: 'name email' } })
      .populate('department', 'name code');

    return successResponse(res, 201, 'Appointment booked successfully', { appointment: populatedAppointment });
  } catch (error) {
    next(error);
  }
};

// @desc    Get appointments (filtered by role)
// @route   GET /api/appointments
// @access  Private
const getAppointments = async (req, res, next) => {
  try {
    const { status, date, doctorId, patientId, page = 1, limit = 20 } = req.query;

    const query = {};

    if (status) query.status = status;
    if (date) query.appointmentDate = date;

    // Apply role-based filtering
    if (req.user.role === 'patient') {
      const patient = await Patient.findOne({ user: req.user._id });
      if (!patient) return successResponse(res, 200, 'No appointments', { appointments: [], total: 0 });
      query.patient = patient._id;
    } else if (req.user.role === 'doctor') {
      const doctor = await Doctor.findOne({ user: req.user._id });
      if (!doctor) return successResponse(res, 200, 'No appointments', { appointments: [], total: 0 });
      query.doctor = doctor._id;
    } else if (req.user.role === 'admin') {
      if (doctorId) query.doctor = doctorId;
      if (patientId) query.patient = patientId;
    }

    const count = await Appointment.countDocuments(query);
    const appointments = await Appointment.find(query)
      .populate({
        path: 'patient',
        populate: { path: 'user', select: 'name email phone avatar' }
      })
      .populate({
        path: 'doctor',
        populate: [
          { path: 'user', select: 'name email phone avatar' },
          { path: 'department', select: 'name code' }
        ]
      })
      .populate('department', 'name code')
      .sort({ appointmentDate: -1, createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit));

    return successResponse(res, 200, 'Appointments retrieved successfully', {
      appointments,
      page: Number(page),
      pages: Math.ceil(count / limit),
      total: count
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get booked time slots for a specific doctor & date
// @route   GET /api/appointments/booked-slots
// @access  Public
const getBookedSlots = async (req, res, next) => {
  try {
    const { doctorId, date } = req.query;

    if (!doctorId || !date) {
      return errorResponse(res, 400, 'doctorId and date query parameters are required');
    }

    const bookedAppointments = await Appointment.find({
      doctor: doctorId,
      appointmentDate: date,
      status: { $nin: ['Cancelled', 'Rejected'] }
    }).select('timeSlot');

    const bookedSlots = bookedAppointments.map(a => a.timeSlot);

    return successResponse(res, 200, 'Booked slots retrieved', { bookedSlots });
  } catch (error) {
    next(error);
  }
};

// @desc    Update appointment status (Confirm/Reject/Complete/Cancel)
// @route   PATCH /api/appointments/:id/status
// @access  Private
const updateAppointmentStatus = async (req, res, next) => {
  try {
    const { status, consultationNotes, cancellationReason } = req.body;
    const appointment = await Appointment.findById(req.params.id)
      .populate('patient')
      .populate({ path: 'patient', populate: { path: 'user', select: '_id name email' } })
      .populate({ path: 'doctor', populate: { path: 'user', select: '_id name' } });

    if (!appointment) {
      return errorResponse(res, 404, 'Appointment not found');
    }

    const allowedStatuses = ['Pending', 'Confirmed', 'Completed', 'Cancelled', 'Rejected'];
    if (!allowedStatuses.includes(status)) {
      return errorResponse(res, 400, 'Invalid appointment status value');
    }

    appointment.status = status;
    if (consultationNotes !== undefined) appointment.consultationNotes = consultationNotes;
    if (cancellationReason !== undefined) appointment.cancellationReason = cancellationReason;

    await appointment.save();

    // Send notification to Patient
    if (appointment.patient && appointment.patient.user) {
      await createNotification({
        recipient: appointment.patient.user._id,
        title: `Appointment ${status}`,
        message: `Your appointment with Dr. ${appointment.doctor.user.name} on ${appointment.appointmentDate} at ${appointment.timeSlot} is now ${status}.`,
        type: 'appointment',
        link: '/patient/appointments'
      });
    }

    return successResponse(res, 200, `Appointment status updated to ${status}`, { appointment });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  bookAppointment,
  getAppointments,
  getBookedSlots,
  updateAppointmentStatus
};
