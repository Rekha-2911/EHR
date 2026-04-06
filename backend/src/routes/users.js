const express = require('express');
const router = express.Router();
const { getAllUsers, createUser, deleteUser, updateUserRole } = require('../controllers/userController');
const { protect, authorize } = require('../middleware/auth');

router.use(protect, authorize('admin'));

router.get('/', getAllUsers);
router.post('/', createUser);
router.delete('/:id', deleteUser);
router.put('/:id', updateUserRole);

module.exports = router;
