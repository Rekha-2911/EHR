const supabase = require('../utils/supabase');

exports.getStats = async (req, res) => {
  try {
    const [
      { count: totalPatients },
      { count: totalReports },
      { count: totalDoctors },
      { count: totalNurses },
      { count: totalLabTechs },
      { count: totalAdmins }
    ] = await Promise.all([
      supabase.from('patients').select('*', { count: 'exact', head: true }),
      supabase.from('medical_reports').select('*', { count: 'exact', head: true }),
      supabase.from('users').select('*', { count: 'exact', head: true }).eq('role', 'doctor'),
      supabase.from('users').select('*', { count: 'exact', head: true }).eq('role', 'nurse'),
      supabase.from('users').select('*', { count: 'exact', head: true }).eq('role', 'lab_technician'),
      supabase.from('users').select('*', { count: 'exact', head: true }).eq('role', 'admin'),
    ]);

    res.json({ totalPatients, totalReports, totalDoctors, totalNurses, totalLabTechs, totalAdmins });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getActivityLogs = async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('activity_logs')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(100);
    if (error) return res.status(500).json({ message: error.message });
    res.json(data);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
