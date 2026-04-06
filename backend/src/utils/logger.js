const supabase = require('./supabase');

async function logActivity(userId, userName, userRole, action, details, ipAddress) {
  try {
    await supabase.from('activity_logs').insert({
      user_id: userId,
      user_name: userName,
      user_role: userRole,
      action,
      details,
      ip_address: ipAddress
    });
  } catch (err) {
    console.error('Logging error:', err.message);
  }
}

module.exports = { logActivity };
