const Department = require('../models/Department');
const { successResponse, errorResponse } = require('../utils/apiResponse');

// @desc    Get all active departments
// @route   GET /api/departments
// @access  Public
const getDepartments = async (req, res, next) => {
  try {
    const departments = await Department.find({ isActive: true })
      .populate({
        path: 'headDoctor',
        populate: { path: 'user', select: 'name email' }
      })
      .sort({ name: 1 });

    return successResponse(res, 200, 'Departments retrieved successfully', { departments });
  } catch (error) {
    next(error);
  }
};

// @desc    Create department
// @route   POST /api/departments
// @access  Private/Admin
const createDepartment = async (req, res, next) => {
  try {
    const { name, code, description, icon, headDoctor } = req.body;

    if (!name || !code) {
      return errorResponse(res, 400, 'Department name and code are required');
    }

    const deptExists = await Department.findOne({ $or: [{ name }, { code: code.toUpperCase() }] });
    if (deptExists) {
      return errorResponse(res, 409, 'Department with this name or code already exists');
    }

    const department = await Department.create({
      name,
      code: code.toUpperCase(),
      description: description || '',
      icon: icon || 'Stethoscope',
      headDoctor: headDoctor || null
    });

    return successResponse(res, 201, 'Department created successfully', { department });
  } catch (error) {
    next(error);
  }
};

// @desc    Update department
// @route   PUT /api/departments/:id
// @access  Private/Admin
const updateDepartment = async (req, res, next) => {
  try {
    const department = await Department.findById(req.params.id);
    if (!department) {
      return errorResponse(res, 404, 'Department not found');
    }

    const { name, code, description, icon, headDoctor, isActive } = req.body;

    if (name) department.name = name;
    if (code) department.code = code.toUpperCase();
    if (description !== undefined) department.description = description;
    if (icon) department.icon = icon;
    if (headDoctor !== undefined) department.headDoctor = headDoctor || null;
    if (isActive !== undefined) department.isActive = isActive;

    await department.save();

    return successResponse(res, 200, 'Department updated successfully', { department });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete department
// @route   DELETE /api/departments/:id
// @access  Private/Admin
const deleteDepartment = async (req, res, next) => {
  try {
    const department = await Department.findById(req.params.id);
    if (!department) {
      return errorResponse(res, 404, 'Department not found');
    }

    await department.deleteOne();
    return successResponse(res, 200, 'Department deleted successfully');
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getDepartments,
  createDepartment,
  updateDepartment,
  deleteDepartment
};
