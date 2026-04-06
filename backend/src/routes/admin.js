const express = require('express');
const router = express.Router();
const { getStats, getActivityLogs } = require('../controllers/adminController');
const { protect, authorize } = require('../middleware/auth');

router.use(protect, authorize('admin'));

router.get('/stats', getStats);
router.get('/logs', getActivityLogs);

module.exports = router;
