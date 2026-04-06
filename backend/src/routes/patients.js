const express = require('express');
const router = express.Router();
const { getAllPatients, getPatient, createPatient, updatePatient } = require('../controllers/patientController');
const { protect, authorize } = require('../middleware/auth');

router.use(protect);

router.get('/', getAllPatients);
router.get('/:patientId', getPatient);
router.post('/', authorize('admin', 'lab_technician', 'nurse', 'receptionist'), createPatient);
router.put('/:patientId', authorize('admin', 'doctor', 'nurse'), updatePatient);

module.exports = router;
