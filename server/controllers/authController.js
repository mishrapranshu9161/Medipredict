const User = require('../models/User');
const Patient = require('../models/Patient');
const Doctor = require('../models/Doctor');
const generateToken = require('../utils/generateToken');
const { successResponse, errorResponse } = require('../utils/apiResponse');

// @desc    Register a new patient
// @route   POST /api/auth/register
// @access  Public
const register = async (req, res, next) => {
  try {
    const { name, email, password, phone, dob, gender, bloodGroup } = req.body;

    if (!name || !email || !password) {
      return errorResponse(res, 400, 'Please provide name, email, and password');
    }

    const userExists = await User.findOne({ email: email.toLowerCase() });
    if (userExists) {
      return errorResponse(res, 409, 'User already exists with this email address');
    }

    // Create base user
    const user = await User.create({
      name,
      email: email.toLowerCase(),
      password,
      phone: phone || '',
      role: 'patient'
    });

    // Create associated Patient profile
    await Patient.create({
      user: user._id,
      dob: dob || null,
      gender: gender || 'Not Specified',
      bloodGroup: bloodGroup || 'Unknown'
    });

    const token = generateToken(user._id, user.role);

    return successResponse(res, 201, 'User registered successfully as Patient', {
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      token
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Authenticate user & get token
// @route   POST /api/auth/login
// @access  Public
const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return errorResponse(res, 400, 'Please provide email and password');
    }

    const user = await User.findOne({ email: email.toLowerCase() }).select('+password');

    if (!user || !(await user.matchPassword(password))) {
      return errorResponse(res, 401, 'Invalid email or password');
    }

    if (!user.isActive) {
      return errorResponse(res, 403, 'Your account has been deactivated. Please contact administration.');
    }

    const token = generateToken(user._id, user.role);

    // Fetch related profile details if applicable
    let profileData = null;
    if (user.role === 'patient') {
      profileData = await Patient.findOne({ user: user._id });
    } else if (user.role === 'doctor') {
      profileData = await Doctor.findOne({ user: user._id }).populate('department');
    }

    return successResponse(res, 200, 'Login successful', {
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        phone: user.phone,
        avatar: user.avatar,
        profile: profileData
      },
      token
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get current user profile
// @route   GET /api/auth/me
// @access  Private
const getMe = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);

    let profileData = null;
    if (user.role === 'patient') {
      profileData = await Patient.findOne({ user: user._id });
    } else if (user.role === 'doctor') {
      profileData = await Doctor.findOne({ user: user._id }).populate('department');
    }

    return successResponse(res, 200, 'User profile fetched', {
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      phone: user.phone,
      avatar: user.avatar,
      profile: profileData
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update user profile & patient metadata
// @route   PUT /api/auth/profile
// @access  Private
const updateProfile = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);

    if (req.body.name) user.name = req.body.name;
    if (req.body.phone) user.phone = req.body.phone;
    if (req.file) {
      user.avatar = req.file.path || `/uploads/${req.file.filename}`;
    }

    await user.save();

    if (user.role === 'patient') {
      const patient = await Patient.findOne({ user: user._id });
      if (patient) {
        if (req.body.dob) patient.dob = req.body.dob;
        if (req.body.gender) patient.gender = req.body.gender;
        if (req.body.bloodGroup) patient.bloodGroup = req.body.bloodGroup;
        if (req.body.address) patient.address = req.body.address;
        if (req.body.emergencyContact) patient.emergencyContact = req.body.emergencyContact;
        if (req.body.allergies) patient.allergies = Array.isArray(req.body.allergies) ? req.body.allergies : req.body.allergies.split(',').map(s => s.trim());
        if (req.body.existingConditions) patient.existingConditions = Array.isArray(req.body.existingConditions) ? req.body.existingConditions : req.body.existingConditions.split(',').map(s => s.trim());
        if (req.body.medicalHistory) patient.medicalHistory = req.body.medicalHistory;

        await patient.save();
      }
    }

    return successResponse(res, 200, 'Profile updated successfully', { user });
  } catch (error) {
    next(error);
  }
};

// @desc    Change user password
// @route   PUT /api/auth/change-password
// @access  Private
const changePassword = async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body;
    if (!currentPassword || !newPassword) {
      return errorResponse(res, 400, 'Please provide current and new password');
    }

    const user = await User.findById(req.user._id).select('+password');
    if (!(await user.matchPassword(currentPassword))) {
      return errorResponse(res, 400, 'Incorrect current password');
    }

    user.password = newPassword;
    await user.save();

    return successResponse(res, 200, 'Password updated successfully');
  } catch (error) {
    next(error);
  }
};

module.exports = {
  register,
  login,
  getMe,
  updateProfile,
  changePassword
};
