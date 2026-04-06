/**
 * One-time script to push all existing DB data into Supabase Storage buckets.
 * Run: node src/syncNow.js
 */
require('dotenv').config();
const supabase = require('./utils/supabase');

const PATIENT_BUCKET = 'patient-files';
const USER_BUCKET = 'user-data';

function toCSV(rows, columns) {
  if (!rows || rows.length === 0) return columns.join(',') + '\n';
  const header = columns.join(',');
  const lines = rows.map(row =>
    columns.map(col => {
      const val = row[col] ?? '';
      const str = typeof val === 'object' ? JSON.stringify(val) : String(val);
      return str.includes(',') || str.includes('\n') || str.includes('"')
        ? `"${str.replace(/"/g, '""')}"` : str;
    }).join(',')
  );
  return [header, ...lines].join('\n');
}

async function uploadCSV(bucket, filePath, content) {
  const buf = Buffer.from(content, 'utf8');

  // Try remove first (ignore error if not exists)
  await supabase.storage.from(bucket).remove([filePath]);

  const { data, error } = await supabase.storage
    .from(bucket)
    .upload(filePath, buf, { contentType: 'text/csv; charset=utf-8', upsert: true });

  if (error) {
    console.error(`  ✗ FAILED [${bucket}/${filePath}]: ${error.message}`);
    return false;
  }
  console.log(`  ✓ Uploaded: ${bucket}/${filePath}`);
  return true;
}

async function syncAllPatients() {
  console.log('\n--- Syncing patients-files bucket ---');
  const { data: patients, error } = await supabase.from('patients').select('*');
  if (error) { console.error('Failed to fetch patients:', error.message); return; }
  if (!patients || patients.length === 0) { console.log('No patients found in DB.'); return; }

  for (const patient of patients) {
    const { data: diagnoses } = await supabase
      .from('diagnoses').select('*').eq('patient_id', patient.patient_id);

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

    await uploadCSV(PATIENT_BUCKET, filePath, fullCSV);
  }
}

async function syncAllUsers() {
  console.log('\n--- Syncing user-data bucket ---');
  const roles = ['admin', 'doctor', 'nurse', 'lab_technician'];

  for (const role of roles) {
    const { data: users, error } = await supabase
      .from('users')
      .select('id, name, email, role, department, created_at')
      .eq('role', role)
      .order('created_at', { ascending: true });

    if (error) { console.error(`Failed to fetch ${role}s:`, error.message); continue; }

    const csv = toCSV(users || [], ['id','name','email','role','department','created_at']);
    // lab_technician → lab_technicians.csv
    const fileName = `${role}s.csv`;
    await uploadCSV(USER_BUCKET, fileName, csv);
  }
}

async function main() {
  console.log('Starting storage sync...');
  console.log('Supabase URL:', process.env.SUPABASE_URL);

  // Test connection
  const { data: test, error: testErr } = await supabase.from('users').select('count').single();
  if (testErr) {
    console.error('DB connection failed:', testErr.message);
    console.error('Check your SUPABASE_SERVICE_KEY in .env');
    process.exit(1);
  }

  await syncAllPatients();
  await syncAllUsers();

  console.log('\nSync complete!');
}

main().catch(err => {
  console.error('Fatal error:', err.message);
  process.exit(1);
});
