const supabase = require('../utils/supabase');
const { logActivity } = require('../utils/logger');
const { syncPatientCSV } = require('../utils/syncStorage');

exports.createDiagnosis = async (req, res) => {
  try {
    const { patientId, patientName, department, diagnosis, prescription, medications, followUpDate, notes } = req.body;

    const { data, error } = await supabase.from('diagnoses').insert({
      patient_id: patientId,
      patient_name: patientName,
      doctor_id: req.user.id,
      doctor_name: req.user.name,
      department: department || req.user.department,
      diagnosis,
      prescription,
      medications: medications || [],
      follow_up_date: followUpDate || null,
      notes
    }).select().single();

    if (error) return res.status(500).json({ message: error.message });

    await logActivity(req.user.id, req.user.name, req.user.role, 'ADD_DIAGNOSIS',
      `Diagnosis added for patient ${patientId} by Dr. ${req.user.name}`, req.ip);

    syncPatientCSV(patientId).catch(e => console.error('[Sync] diagnosis CSV failed:', e.message));
    res.status(201).json(data);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getDiagnoses = async (req, res) => {
  try {
    const { patientId } = req.query;
    let query = supabase.from('diagnoses').select('*').order('created_at', { ascending: false });
    if (patientId) query = query.eq('patient_id', patientId);

    const { data, error } = await query;
    if (error) return res.status(500).json({ message: error.message });
    res.json(data);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.updateDiagnosis = async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('diagnoses').update(req.body).eq('id', req.params.id).select().single();
    if (error || !data) return res.status(404).json({ message: 'Diagnosis not found.' });
    res.json(data);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getMedications = async (req, res) => {
  try {
    const { patientId } = req.query;
    if (!patientId) return res.status(400).json({ message: 'patientId required.' });

    const { data, error } = await supabase
      .from('diagnoses')
      .select('patient_id, patient_name, medications, prescription, follow_up_date, created_at')
      .eq('patient_id', patientId)
      .order('created_at', { ascending: false });

    if (error) return res.status(500).json({ message: error.message });
    res.json(data);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
