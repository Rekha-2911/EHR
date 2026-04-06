const supabase = require('../utils/supabase');
const { logActivity } = require('../utils/logger');
const { syncPatientCSV } = require('../utils/syncStorage');

exports.getAllPatients = async (req, res) => {
  try {
    const { search } = req.query;
    let query = supabase.from('patients').select('*').order('created_at', { ascending: false });
    if (search) {
      query = query.or(`name.ilike.%${search}%,patient_id.ilike.%${search}%,department.ilike.%${search}%`);
    }
    const { data, error } = await query;
    if (error) return res.status(500).json({ message: error.message });
    res.json(data);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getPatient = async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('patients').select('*').eq('patient_id', req.params.patientId).single();
    if (error || !data) return res.status(404).json({ message: 'Patient not found.' });
    res.json(data);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.createPatient = async (req, res) => {
  try {
    const { name, patientId, age, gender, department, contactNumber, address } = req.body;

    const { data: existing } = await supabase.from('patients').select('id').eq('patient_id', patientId).single();
    if (existing) return res.status(400).json({ message: 'Patient ID already exists.' });

    const { data, error } = await supabase.from('patients').insert({
      name, patient_id: patientId, age, gender, department,
      contact_number: contactNumber, address
    }).select().single();

    if (error) return res.status(500).json({ message: error.message });

    await logActivity(req.user.id, req.user.name, req.user.role, 'CREATE_PATIENT',
      `Patient registered: ${name} (${patientId})`, req.ip);

    syncPatientCSV(patientId).catch(e => console.error('[Sync] createPatient CSV failed:', e.message));
    res.status(201).json(data);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.updatePatient = async (req, res) => {
  try {
    const { name, age, gender, department, contactNumber, address } = req.body;
    const { data, error } = await supabase
      .from('patients')
      .update({ name, age, gender, department, contact_number: contactNumber, address })
      .eq('patient_id', req.params.patientId)
      .select().single();

    if (error || !data) return res.status(404).json({ message: 'Patient not found.' });

    syncPatientCSV(req.params.patientId).catch(e => console.error('[Sync] updatePatient CSV failed:', e.message));
    res.json(data);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
