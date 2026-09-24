const express = require('express');
const router = express.Router();
const { getMedicines, createMedicine, updateMedicine, deleteMedicine } = require('../controllers/medicineController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.get('/', getMedicines);
router.post('/', protect, authorize('admin'), createMedicine);
router.put('/:id', protect, authorize('admin'), updateMedicine);
router.delete('/:id', protect, authorize('admin'), deleteMedicine);

module.exports = router;
