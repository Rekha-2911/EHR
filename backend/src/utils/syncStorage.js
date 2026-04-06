/**
 * Syncs structured data to Supabase Storage as readable CSV/files.
 * Called after any create/update to keep storage in sync with DB.
 */
const supabase = require('./supabase');
const { toCSV } = require('./csvHelper');

const PATIENT_BUCKET = 'patient-files';
const USER_BUCKET = 'user-data';

// Sync one patient's full record (info + diagnoses + medications) as CSV
async function syncPatientCSV(patientId) {
  try {
    const { data: patient } = await supabase.from('patients').select('*').eq('patient_id', patientId).single();
    if (!patient) return;

    const { data: diagnoses } = await supabase.from('diagnoses').select('*').eq('patient_id', patientId);

    const patientCSV = toCSV([{
      patient_id: patient.patient_id,
      name: patient.name,
      age: patient.age,
      gender: patient.gender,
      department: patient.department,
      contact_number: patient.contact_number || '',
      address: patient.address || '',
      registered_on: patient.created_at
    }], ['patient_id','name','age','gender','department','contact_number','address','registered_on']);

    const diagRows = (diagnoses || []).map(d => ({
      date: d.created_at,
      doctor: d.doctor_name,
      department: d.department,
      diagnosis: d.diagnosis,
      prescription: d.prescription || '',
      medications: (d.medications || []).map(m =>
        `${m.medicineName} ${m.dosage} x${m.timesPerDay}/day`
      ).join(' | '),
      follow_up: d.follow_up_date || '',
      notes: d.notes || ''
    }));

    const diagCSV = toCSV(diagRows, ['date','doctor','department','diagnosis','prescription','medications','follow_up','notes']);

    const fullCSV = `PATIENT INFORMATION\n${patientCSV}\n\nDIAGNOSES & MEDICATIONS\n${diagCSV}`;
    const filePath = `patients/${patient.patient_id}_${patient.name.replace(/\s+/g, '_')}.csv`;

    await supabase.storage.from(PATIENT_BUCKET).remove([filePath]);
    await supabase.storage.from(PATIENT_BUCKET).upload(filePath, Buffer.from(fullCSV, 'utf8'), {
      contentType: 'text/csv', upsert: true
    });
    console.log(`[Storage] Synced patient CSV: ${filePath}`);
  } catch (err) {
    console.error(`[Storage] Patient CSV sync failed for ${patientId}:`, err.message);
  }
}

// Sync all users of a given role as a CSV file
async function syncUserRoleCSV(role) {
  try {
    const { data: users } = await supabase
      .from('users')
      .select('id, name, email, role, department, created_at')
      .eq('role', role)
      .order('created_at', { ascending: true });

    const csv = toCSV(users || [], ['id','name','email','role','department','created_at']);
    const filePath = `${role}s.csv`; // e.g. doctors.csv, nurses.csv

    await supabase.storage.from(USER_BUCKET).remove([filePath]);
    await supabase.storage.from(USER_BUCKET).upload(filePath, Buffer.from(csv, 'utf8'), {
      contentType: 'text/csv', upsert: true
    });
    console.log(`[Storage] Synced user CSV: ${filePath}`);
  } catch (err) {
    console.error(`[Storage] User CSV sync failed for role ${role}:`, err.message);
  }
}

module.exports = { syncPatientCSV, syncUserRoleCSV };
