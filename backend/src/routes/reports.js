const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const { uploadReport, getReports, downloadReport, deleteReport } = require('../controllers/reportController');
const { protect, authorize } = require('../middleware/auth');

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, path.join(__dirname, '../../uploads')),
  filename: (req, file, cb) => cb(null, `${Date.now()}-${file.originalname}`)
});

const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
  fileFilter: (req, file, cb) => {
    const allowed = /pdf|jpg|jpeg|png|gif/;
    const ext = allowed.test(path.extname(file.originalname).toLowerCase());
    if (ext) cb(null, true);
    else cb(new Error('Only PDF and image files are allowed.'));
  }
});

router.use(protect);

router.get('/', getReports);
router.post('/', authorize('lab_technician', 'admin'), upload.single('file'), uploadReport);
router.get('/:id/download', authorize('doctor', 'admin'), downloadReport);
router.delete('/:id', authorize('admin', 'lab_technician'), deleteReport);

module.exports = router;
