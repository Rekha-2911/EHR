const express = require('express');
const router = express.Router();
const { createDiagnosis, getDiagnoses, updateDiagnosis, getMedications } = require('../controllers/diagnosisController');
const { protect, authorize } = require('../middleware/auth');

router.use(protect);

router.get('/', getDiagnoses);
router.post('/', authorize('doctor'), createDiagnosis);
router.put('/:id', authorize('doctor'), updateDiagnosis);
router.get('/medications', authorize('nurse', 'doctor', 'admin'), getMedications);

module.exports = router;
