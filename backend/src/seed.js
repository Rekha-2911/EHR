require('dotenv').config();
const bcrypt = require('bcryptjs');
const PDFDocument = require('pdfkit');
const supabase = require('./utils/supabase');
const { syncPatientCSV, syncUserRoleCSV } = require('./utils/syncStorage');

const REPORT_BUCKET = 'medical-reports';

function generatePDF(data) {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({ margin: 50 });
    const chunks = [];
    doc.on('data', c => chunks.push(c));
    doc.on('end', () => resolve(Buffer.concat(chunks)));
    doc.on('error', reject);

    doc.rect(0, 0, doc.page.width, 80).fill('#1e40af');
    doc.fillColor('white').fontSize(20).font('Helvetica-Bold').text('SECURE EHR SYSTEM', 50, 20);
    doc.fontSize(11).font('Helvetica').text('Electronic Health Record — Medical Report', 50, 48);
    doc.moveDown(3);

    doc.fillColor('#1e293b').fontSize(14).font('Helvetica-Bold').text('PATIENT INFORMATION', 50, 100);
    doc.moveTo(50, 118).lineTo(545, 118).strokeColor('#3b82f6').lineWidth(2).stroke();

    const info = [
      ['Patient Name', data.patientName], ['Patient ID', data.patientId],
      ['Age / Gender', `${data.age} years / ${data.gender}`],
      ['Department', data.department], ['Test Type', data.testType],
      ['Report Date', data.date], ['Uploaded By', data.uploadedBy],
    ];

    let y = 128;
    doc.fontSize(11).font('Helvetica');
    info.forEach(([label, value]) => {
      doc.fillColor('#64748b').text(label + ':', 50, y, { width: 150 });
      doc.fillColor('#1e293b').text(value, 200, y);
      y += 22;
    });

    y += 10;
    doc.fillColor('#1e293b').fontSize(14).font('Helvetica-Bold').text('REPORT FINDINGS', 50, y);
    y += 18;
    doc.moveTo(50, y).lineTo(545, y).strokeColor('#3b82f6').lineWidth(2).stroke();
    y += 12;
    doc.fontSize(11).font('Helvetica').fillColor('#1e293b')
      .text(data.notes, 50, y, { width: 495, lineGap: 4 });

    const policyY = y + doc.heightOfString(data.notes, { width: 495 }) + 30;
    doc.rect(50, policyY, 495, 60).fillAndStroke('#eff6ff', '#3b82f6');
    doc.fillColor('#1e40af').fontSize(11).font('Helvetica-Bold').text('ABE ACCESS POLICY', 65, policyY + 10);
    doc.fillColor('#1e293b').font('Helvetica').fontSize(10).text(data.accessPolicy, 65, policyY + 28);

    doc.rect(0, doc.page.height - 40, doc.page.width, 40).fill('#1e40af');
    doc.fillColor('white').fontSize(9).font('Helvetica')
      .text('Secure EHR System — Access controlled via ABE policy simulation.',
        50, doc.page.height - 28, { align: 'center', width: doc.page.width - 100 });

    doc.end();
  });
}

const seed = async () => {
  console.log('Connecting to Supabase...');

  // Clear existing DB data
  await supabase.from('activity_logs').delete().neq('id', '00000000-0000-0000-0000-000000000000');
  await supabase.from('medical_reports').delete().neq('id', '00000000-0000-0000-0000-000000000000');
  await supabase.from('diagnoses').delete().neq('id', '00000000-0000-0000-0000-000000000000');
  await supabase.from('patients').delete().neq('id', '00000000-0000-0000-0000-000000000000');
  await supabase.from('users').delete().neq('id', '00000000-0000-0000-0000-000000000000');
  console.log('Cleared existing DB data');

  // Clear storage buckets
  for (const bucket of ['medical-reports', 'patient-files', 'user-data']) {
    for (const prefix of ['reports/', 'patients/', '']) {
      const { data: files } = await supabase.storage.from(bucket).list(prefix || undefined);
      if (files && files.length > 0) {
        await supabase.storage.from(bucket).remove(files.map(f => prefix + f.name));
      }
    }
  }
  console.log('Cleared storage buckets');

  // --- USERS ---
  const userDefs = [
    { name: 'Admin User',             email: 'admin@hospital.com',       password: 'admin123',       role: 'admin',          department: 'General'    },
    { name: 'Dr. Sarah Johnson',      email: 'doctor@hospital.com',      password: 'doctor123',      role: 'doctor',         department: 'Cardiology' },
    { name: 'Dr. Michael Chen',       email: 'doctor2@hospital.com',     password: 'doctor123',      role: 'doctor',         department: 'Neurology'  },
    { name: 'Nurse Emily Davis',      email: 'nurse@hospital.com',       password: 'nurse123',       role: 'nurse',          department: 'General'    },
    { name: 'Lab Tech Robert Wilson', email: 'lab@hospital.com',         password: 'lab123',         role: 'lab_technician', department: 'Laboratory' },
    { name: 'Receptionist Priya',     email: 'reception@hospital.com',   password: 'reception123',   role: 'receptionist',   department: 'General'    },
  ];

  const createdUsers = {};
  for (const u of userDefs) {
    const hashed = await bcrypt.hash(u.password, 12);
    const { data, error } = await supabase.from('users').insert({
      name: u.name, email: u.email, password: hashed, role: u.role, department: u.department
    }).select().single();
    if (error) { console.error(`Failed user ${u.email}:`, error.message); continue; }
    createdUsers[u.role] = data;
    console.log(`Created user: ${u.email} (${u.role})`);
  }

  // Sync user CSVs to user-data bucket
  for (const role of ['admin', 'doctor', 'nurse', 'lab_technician', 'receptionist']) {
    await syncUserRoleCSV(role);
  }

  // --- PATIENTS ---
  const patientDefs = [
    { name: 'John Smith',   patientId: 'PAT-001', age: 45, gender: 'Male',   department: 'Cardiology', contactNumber: '555-0101' },
    { name: 'Mary Johnson', patientId: 'PAT-002', age: 32, gender: 'Female', department: 'Neurology',  contactNumber: '555-0102' },
    { name: 'Robert Brown', patientId: 'PAT-003', age: 58, gender: 'Male',   department: 'General',    contactNumber: '555-0103' },
    { name: 'Linda Davis',  patientId: 'PAT-004', age: 27, gender: 'Female', department: 'Radiology',  contactNumber: '555-0104' },
    { name: 'James Wilson', patientId: 'PAT-005', age: 63, gender: 'Male',   department: 'Cardiology', contactNumber: '555-0105' },
  ];

  const patientMap = {};
  for (const p of patientDefs) {
    const { data, error } = await supabase.from('patients').insert({
      name: p.name, patient_id: p.patientId, age: p.age, gender: p.gender,
      department: p.department, contact_number: p.contactNumber
    }).select().single();
    if (error) { console.error(`Failed patient ${p.name}:`, error.message); continue; }
    patientMap[p.patientId] = { ...p, dbId: data.id };
    console.log(`Created patient: ${p.name} (${p.patientId})`);
  }

  // --- DIAGNOSES ---
  const diagnoseDefs = [
    {
      patientId: 'PAT-001', department: 'Cardiology',
      diagnosis: 'Mild Anemia with Borderline Hypertension',
      prescription: 'Iron supplements 325mg twice daily, Lisinopril 5mg once daily',
      medications: [
        { medicineName: 'Ferrous Sulfate', dosage: '325mg', timesPerDay: 2, specialInstructions: 'Take with food' },
        { medicineName: 'Lisinopril', dosage: '5mg', timesPerDay: 1, specialInstructions: 'Take in the morning' }
      ],
      notes: 'Patient presents with fatigue and mild shortness of breath. CBC shows hemoglobin at lower normal range.'
    },
    {
      patientId: 'PAT-002', department: 'Neurology',
      diagnosis: 'Tension Headache — Chronic',
      prescription: 'Amitriptyline 10mg nightly, Ibuprofen 400mg as needed',
      medications: [
        { medicineName: 'Amitriptyline', dosage: '10mg', timesPerDay: 1, specialInstructions: 'Take at bedtime' },
        { medicineName: 'Ibuprofen', dosage: '400mg', timesPerDay: 3, specialInstructions: 'Take with food, max 3 times/day' }
      ],
      notes: 'Patient reports recurring headaches for 3 months. MRI shows no structural abnormality.'
    },
    {
      patientId: 'PAT-003', department: 'General',
      diagnosis: 'Hyperlipidemia — Borderline High LDL',
      prescription: 'Atorvastatin 10mg once daily',
      medications: [
        { medicineName: 'Atorvastatin', dosage: '10mg', timesPerDay: 1, specialInstructions: 'Take at night' }
      ],
      notes: 'Lipid panel shows borderline high LDL. Dietary modification advised alongside medication.'
    },
  ];

  const doctorUser = createdUsers['doctor'];
  const labUser = createdUsers['lab_technician'];

  for (const d of diagnoseDefs) {
    const patient = patientMap[d.patientId];
    const { error } = await supabase.from('diagnoses').insert({
      patient_id: d.patientId, patient_name: patient.name,
      doctor_id: doctorUser.id, doctor_name: doctorUser.name,
      department: d.department, diagnosis: d.diagnosis,
      prescription: d.prescription, medications: d.medications, notes: d.notes
    });
    if (error) console.error(`Failed diagnosis for ${d.patientId}:`, error.message);
    else console.log(`Created diagnosis for ${patient.name}`);
  }

  // Sync patient CSVs (includes diagnoses + medications)
  for (const patientId of Object.keys(patientMap)) {
    await syncPatientCSV(patientId);
  }

  // --- REPORTS (plain PDFs in medical-reports bucket) ---
  const reportDefs = [
    {
      patientId: 'PAT-001', testType: 'Blood Test', department: 'Cardiology',
      accessPolicy: 'role=doctor AND department=Cardiology',
      fileName: 'blood_test_john_smith.pdf',
      notes: 'CBC Results:\n• Hemoglobin: 13.5 g/dL\n• WBC: 7,200 /uL\n• Platelets: 210,000 /uL\n• Hematocrit: 41%\n\nConclusion: Mild anemia. Recommend follow-up in 4 weeks with iron supplementation.',
    },
    {
      patientId: 'PAT-001', testType: 'ECG', department: 'Cardiology',
      accessPolicy: 'role=doctor AND department=Cardiology',
      fileName: 'ecg_john_smith.pdf',
      notes: 'ECG Report:\n• Heart Rate: 72 bpm\n• Rhythm: Normal Sinus Rhythm\n• PR Interval: 160 ms\n• QRS: 90 ms\n• ST Segment: Normal\n\nConclusion: Normal ECG.',
    },
    {
      patientId: 'PAT-002', testType: 'MRI', department: 'Neurology',
      accessPolicy: 'role=doctor AND department=Neurology',
      fileName: 'mri_mary_johnson.pdf',
      notes: 'MRI Brain:\n• Ventricles: Normal\n• Cortex: No focal abnormality\n• White Matter: Mild periventricular changes\n\nConclusion: No acute intracranial abnormality.',
    },
    {
      patientId: 'PAT-003', testType: 'Blood Test', department: 'General',
      accessPolicy: 'role=doctor',
      fileName: 'lipid_panel_robert_brown.pdf',
      notes: 'Lipid Panel:\n• Total Cholesterol: 210 mg/dL\n• LDL: 135 mg/dL (Borderline High)\n• HDL: 45 mg/dL\n• Triglycerides: 150 mg/dL\n\nConclusion: Borderline high LDL. Dietary modification recommended.',
    },
    {
      patientId: 'PAT-004', testType: 'X-Ray', department: 'Radiology',
      accessPolicy: 'role=doctor',
      fileName: 'chest_xray_linda_davis.pdf',
      notes: 'Chest X-Ray:\n• Lung Fields: Clear bilaterally\n• Heart: Normal size\n• No consolidation or effusion\n\nConclusion: Normal chest X-ray.',
    },
    {
      patientId: 'PAT-005', testType: 'CT Scan', department: 'Cardiology',
      accessPolicy: 'role=doctor AND department=Cardiology',
      fileName: 'ct_scan_james_wilson.pdf',
      notes: 'CT Coronary Angiography:\n• Calcium Score: 85 (Mild)\n• LAD: Mild calcification, no significant stenosis\n• LCx and RCA: Normal\n\nConclusion: Mild coronary calcification. Annual follow-up recommended.',
    },
    {
      patientId: 'PAT-002', testType: 'Blood Test', department: 'Neurology',
      accessPolicy: 'role=doctor AND department=Neurology',
      fileName: 'thyroid_test_mary_johnson.pdf',
      notes: 'Thyroid Function:\n• TSH: 2.1 mIU/L (Normal)\n• Free T4: 1.2 ng/dL (Normal)\n• Free T3: 3.1 pg/mL (Normal)\n• Anti-TPO: Negative\n\nConclusion: Thyroid function within normal limits.',
    },
  ];

  const today = new Date().toLocaleDateString('en-GB');

  for (const def of reportDefs) {
    const patient = patientMap[def.patientId];
    const pdfBuffer = await generatePDF({
      patientName: patient.name, patientId: def.patientId,
      age: patient.age, gender: patient.gender,
      department: def.department, testType: def.testType,
      date: today, uploadedBy: labUser.name,
      notes: def.notes, accessPolicy: def.accessPolicy,
    });

    // Store as plain readable PDF
    const storagePath = `reports/${Date.now()}_${def.fileName}`;
    const { error: uploadError } = await supabase.storage
      .from(REPORT_BUCKET)
      .upload(storagePath, pdfBuffer, { contentType: 'application/pdf' });

    if (uploadError) {
      console.error(`Failed to upload ${def.fileName}:`, uploadError.message);
      continue;
    }

    const { error: dbError } = await supabase.from('medical_reports').insert({
      patient_id: def.patientId, patient_name: patient.name,
      test_type: def.testType, department: def.department,
      uploaded_by: labUser.id, uploaded_by_name: labUser.name,
      encrypted_file_path: storagePath,
      original_file_name: def.fileName,
      file_size: pdfBuffer.length,
      access_policy: def.accessPolicy,
      notes: def.notes, is_encrypted: false
    });

    if (dbError) console.error(`Failed to save report record:`, dbError.message);
    else console.log(`Created report: ${def.testType} for ${patient.name}`);
  }

  console.log('\n=== DEMO CREDENTIALS ===');
  console.log('Admin:          admin@hospital.com      / admin123');
  console.log('Doctor:         doctor@hospital.com     / doctor123');
  console.log('Nurse:          nurse@hospital.com      / nurse123');
  console.log('Lab Technician: lab@hospital.com        / lab123');
  console.log('Receptionist:   reception@hospital.com  / reception123');
  console.log('========================\n');
  console.log('Seeding complete!');
};

seed().catch(err => {
  console.error('Seed error:', err);
  process.exit(1);
});
