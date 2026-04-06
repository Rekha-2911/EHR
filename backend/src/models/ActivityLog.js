const mongoose = require('mongoose');

const activityLogSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  userName: String,
  userRole: String,
  action: String,
  details: String,
  ipAddress: String
}, { timestamps: true });

module.exports = mongoose.model('ActivityLog', activityLogSchema);
