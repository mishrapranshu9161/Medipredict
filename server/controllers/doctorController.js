const Doctor = require('../models/Doctor');
const User = require('../models/User');
const Department = require('../models/Department');
const { successResponse, errorResponse } = require('../utils/apiResponse');

// @desc    Get all doctors with search, department filter
// @route   GET /api/doctors
// @access  Public
const getDoctors = async (req, res, next) => {
  try {
    const { department, search, specialization } = req.query;

    const query = { isApproved: true };

    if (department) {
      query.department = department;
    }

    if (specialization) {
      query.specialization = { $regex: specialization, $options: 'i' };
    }

    let doctorQuery = Doctor.find(query)
      .populate('user', 'name email phone avatar isActive')
      .populate('department', 'name code icon');

    if (search) {
      const matchingUsers = await User.find({
        role: 'doctor',
        $or: [
          { name: { $regex: search, $options: 'i' } },
          { email: { $regex: search, $options: 'i' } }
        ]
      }).select('_id');

      const userIds = matchingUsers.map(u => u._id);
      query.$or = [
        { user: { $in: userIds } },
        { specialization: { $regex: search, $options: 'i' } },
        { qualification: { $regex: search, $options: 'i' } }
      ];
      doctorQuery = Doctor.find(query)
        .populate('user', 'name email phone avatar isActive')
        .populate('department', 'name code icon');
    }

    const doctors = await doctorQuery.sort({ createdAt: -1 });

    return successResponse(res, 200, 'Doctors retrieved successfully', { doctors });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single doctor by ID
// @route   GET /api/doctors/:id
// @access  Public
const getDoctorById = async (req, res, next) => {
  try {
    const doctor = await Doctor.findById(req.params.id)
      .populate('user', 'name email phone avatar')
      .populate('department', 'name code icon description');

    if (!doctor) {
      return errorResponse(res, 404, 'Doctor profile not found');
    }

    return successResponse(res, 200, 'Doctor details fetched', { doctor });
  } catch (error) {
    next(error);
  }
};

// @desc    Create new Doctor (Admin action)
// @route   POST /api/doctors
// @access  Private/Admin
const createDoctor = async (req, res, next) => {
  try {
    const { name, email, password, phone, departmentId, qualification, specialization, experienceYears, consultationFee, availability, bio } = req.body;

    if (!name || !email || !password || !departmentId || !qualification || !specialization) {
      return errorResponse(res, 400, 'Please provide all required doctor details');
    }

    const userExists = await User.findOne({ email: email.toLowerCase() });
    if (userExists) {
      return errorResponse(res, 409, 'User with this email already exists');
    }

    const dept = await Department.findById(departmentId);
    if (!dept) {
      return errorResponse(res, 404, 'Selected department does not exist');
    }

    // Create User account
    const user = await User.create({
      name,
      email: email.toLowerCase(),
      password,
      phone: phone || '',
      role: 'doctor'
    });

    // Default slot timings if not provided
    const defaultAvailability = availability || [
      { day: 'Monday', slots: ['09:00 AM', '10:00 AM', '11:00 AM', '02:00 PM', '03:00 PM'] },
      { day: 'Tuesday', slots: ['09:00 AM', '10:00 AM', '11:00 AM', '02:00 PM', '03:00 PM'] },
      { day: 'Wednesday', slots: ['09:00 AM', '10:00 AM', '11:00 AM', '02:00 PM', '03:00 PM'] },
      { day: 'Thursday', slots: ['09:00 AM', '10:00 AM', '11:00 AM', '02:00 PM', '03:00 PM'] },
      { day: 'Friday', slots: ['09:00 AM', '10:00 AM', '11:00 AM', '02:00 PM', '03:00 PM'] }
    ];

    // Create Doctor Profile
    const doctor = await Doctor.create({
      user: user._id,
      department: departmentId,
      qualification,
      specialization,
      experienceYears: experienceYears || 1,
      consultationFee: consultationFee || 500,
      availability: defaultAvailability,
      bio: bio || ''
    });

    const populatedDoctor = await Doctor.findById(doctor._id)
      .populate('user', 'name email phone avatar')
      .populate('department', 'name code');

    return successResponse(res, 201, 'Doctor created successfully', { doctor: populatedDoctor });
  } catch (error) {
    next(error);
  }
};

// @desc    Update Doctor profile (Doctor or Admin)
// @route   PUT /api/doctors/:id
// @access  Private/Doctor/Admin
const updateDoctor = async (req, res, next) => {
  try {
    const doctor = await Doctor.findById(req.params.id);
    if (!doctor) {
      return errorResponse(res, 404, 'Doctor profile not found');
    }

    // Check authorization: doctor can only update their own profile unless admin
    if (req.user.role === 'doctor' && doctor.user.toString() !== req.user._id.toString()) {
      return errorResponse(res, 403, 'Unauthorized to update another doctor profile');
    }

    const { qualification, specialization, experienceYears, consultationFee, availability, bio, departmentId } = req.body;

    if (qualification) doctor.qualification = qualification;
    if (specialization) doctor.specialization = specialization;
    if (experienceYears !== undefined) doctor.experienceYears = experienceYears;
    if (consultationFee !== undefined) doctor.consultationFee = consultationFee;
    if (availability) doctor.availability = availability;
    if (bio !== undefined) doctor.bio = bio;
    if (departmentId && req.user.role === 'admin') doctor.department = departmentId;

    await doctor.save();

    const updatedDoctor = await Doctor.findById(doctor._id)
      .populate('user', 'name email phone avatar')
      .populate('department', 'name code');

    return successResponse(res, 200, 'Doctor profile updated successfully', { doctor: updatedDoctor });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getDoctors,
  getDoctorById,
  createDoctor,
  updateDoctor
};
