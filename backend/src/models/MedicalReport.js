const mongoose = require('mongoose');

const medicalReportSchema = new mongoose.Schema({
  patientId: { type: String, required: true },
  patientName: { type: String, required: true },
  testType: {
    type: String,
    enum: ['Blood Test', 'X-Ray', 'MRI', 'CT Scan', 'ECG', 'Urine Test', 'Other'],
    required: true
  },
  department: { type: String, required: true },
  uploadedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  uploadedByName: { type: String },
  // AES encrypted file path stored in cloud/local
  encryptedFilePath: { type: String },
  originalFileName: { type: String },
  fileSize: { type: Number },
  // ABE access policy: role=Doctor AND department=Cardiology
  accessPolicy: { type: String, default: 'role=doctor' },
  notes: { type: String },
  isEncrypted: { type: Boolean, default: true },
  storageType: { type: String, enum: ['local', 's3'], default: 'local' }
}, { timestamps: true });

module.exports = mongoose.model('MedicalReport', medicalReportSchema);
