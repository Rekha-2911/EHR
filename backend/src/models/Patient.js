const mongoose = require('mongoose');

const patientSchema = new mongoose.Schema({
  name: { type: String, required: true },
  patientId: { type: String, required: true, unique: true },
  age: { type: Number, required: true },
  gender: { type: String, enum: ['Male', 'Female', 'Other'], required: true },
  department: { type: String, required: true },
  contactNumber: { type: String },
  address: { type: String }
}, { timestamps: true });

module.exports = mongoose.model('Patient', patientSchema);
