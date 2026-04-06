const mongoose = require('mongoose');

const diagnosisSchema = new mongoose.Schema({
  patientId: { type: String, required: true },
  patientName: { type: String },
  doctorId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  doctorName: { type: String },
  department: { type: String },
  diagnosis: { type: String, required: true },
  prescription: { type: String },
  medications: [
    {
      medicineName: String,
      dosage: String,
      timesPerDay: Number,
      specialInstructions: String
    }
  ],
  followUpDate: { type: Date },
  notes: { type: String }
}, { timestamps: true });

module.exports = mongoose.model('Diagnosis', diagnosisSchema);
