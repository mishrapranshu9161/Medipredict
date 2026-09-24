const Medicine = require('../models/Medicine');
const { successResponse, errorResponse } = require('../utils/apiResponse');

// @desc    Get medicines catalog (with search and category filter)
// @route   GET /api/medicines
// @access  Public
const getMedicines = async (req, res, next) => {
  try {
    const { search, category, status } = req.query;

    const query = {};
    if (category) query.category = category;
    if (status) query.status = status;
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { genericName: { $regex: search, $options: 'i' } }
      ];
    }

    const medicines = await Medicine.find(query).sort({ name: 1 });
    return successResponse(res, 200, 'Medicines retrieved', { medicines });
  } catch (error) {
    next(error);
  }
};

// @desc    Create medicine (Admin)
// @route   POST /api/medicines
// @access  Private/Admin
const createMedicine = async (req, res, next) => {
  try {
    const { name, genericName, category, strength, description, stock, status } = req.body;

    if (!name || !genericName || !strength) {
      return errorResponse(res, 400, 'Name, generic name, and strength are required');
    }

    const medicine = await Medicine.create({
      name,
      genericName,
      category: category || 'Other',
      strength,
      description: description || '',
      stock: stock || 100,
      status: status || 'Available'
    });

    return successResponse(res, 201, 'Medicine created successfully', { medicine });
  } catch (error) {
    next(error);
  }
};

// @desc    Update medicine (Admin)
// @route   PUT /api/medicines/:id
// @access  Private/Admin
const updateMedicine = async (req, res, next) => {
  try {
    const medicine = await Medicine.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!medicine) {
      return errorResponse(res, 404, 'Medicine not found');
    }
    return successResponse(res, 200, 'Medicine updated successfully', { medicine });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete medicine (Admin)
// @route   DELETE /api/medicines/:id
// @access  Private/Admin
const deleteMedicine = async (req, res, next) => {
  try {
    const medicine = await Medicine.findById(req.params.id);
    if (!medicine) {
      return errorResponse(res, 404, 'Medicine not found');
    }
    await medicine.deleteOne();
    return successResponse(res, 200, 'Medicine deleted successfully');
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getMedicines,
  createMedicine,
  updateMedicine,
  deleteMedicine
};
