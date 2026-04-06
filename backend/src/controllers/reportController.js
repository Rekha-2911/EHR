const path = require('path');
const fs = require('fs');
const supabase = require('../utils/supabase');
const { evaluatePolicy } = require('../utils/abePolicy');
const { logActivity } = require('../utils/logger');

const REPORT_BUCKET = 'medical-reports';

exports.uploadReport = async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ message: 'No file uploaded.' });

    const { patientId, patientName, testType, department, notes, accessPolicy } = req.body;

    // Ensure it's stored as .pdf
    const originalName = req.file.originalname.endsWith('.pdf')
      ? req.file.originalname
      : req.file.originalname + '.pdf';

    const storagePath = `reports/${Date.now()}_${originalName}`;
    const fileBuffer = fs.readFileSync(req.file.path);
    fs.unlinkSync(req.file.path);

    // Store plain PDF in Supabase Storage (readable)
    const { error: uploadError } = await supabase.storage
      .from(REPORT_BUCKET)
      .upload(storagePath, fileBuffer, { contentType: 'application/pdf', upsert: false });

    if (uploadError) return res.status(500).json({ message: `Storage upload failed: ${uploadError.message}` });

    const { data, error } = await supabase.from('medical_reports').insert({
      patient_id: patientId,
      patient_name: patientName,
      test_type: testType,
      department,
      uploaded_by: req.user.id,
      uploaded_by_name: req.user.name,
      encrypted_file_path: storagePath,
      original_file_name: originalName,
      file_size: req.file.size,
      access_policy: accessPolicy || 'role=doctor OR role=admin',
      notes,
      is_encrypted: false
    }).select().single();

    if (error) return res.status(500).json({ message: error.message });

    await logActivity(req.user.id, req.user.name, req.user.role, 'UPLOAD_REPORT',
      `Report uploaded: ${testType} for patient ${patientId}`, req.ip);

    res.status(201).json({ message: 'Report uploaded successfully.', report: data });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getReports = async (req, res) => {
  try {
    const { patientId, testType } = req.query;
    let query = supabase.from('medical_reports').select('*').order('created_at', { ascending: false });
    if (patientId) query = query.eq('patient_id', patientId);
    if (testType) query = query.eq('test_type', testType);

    const { data, error } = await query;
    if (error) return res.status(500).json({ message: error.message });
    res.json(data);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.downloadReport = async (req, res) => {
  try {
    const { data: report, error: fetchError } = await supabase
      .from('medical_reports').select('*').eq('id', req.params.id).single();
    if (fetchError || !report) return res.status(404).json({ message: 'Report not found.' });

    // ABE Policy Check
    const userAttributes = { role: req.user.role, department: req.user.department };
    const hasAccess = evaluatePolicy(report.access_policy, userAttributes);
    if (!hasAccess) {
      await logActivity(req.user.id, req.user.name, req.user.role, 'ACCESS_DENIED',
        `ABE policy not satisfied for report ${report.id}`, req.ip);
      return res.status(403).json({
        message: 'Access Denied – Attribute Policy Not Satisfied',
        policy: report.access_policy,
        userAttributes
      });
    }

    // Download PDF from Supabase Storage
    const { data: fileData, error: dlError } = await supabase.storage
      .from(REPORT_BUCKET)
      .download(report.encrypted_file_path);

    if (dlError) return res.status(500).json({ message: `Storage download failed: ${dlError.message}` });

    const pdfBuffer = Buffer.from(await fileData.arrayBuffer());

    await logActivity(req.user.id, req.user.name, req.user.role, 'DOWNLOAD_REPORT',
      `Report downloaded: ${report.test_type} for patient ${report.patient_id}`, req.ip);

    const fileName = report.original_file_name.endsWith('.pdf')
      ? report.original_file_name
      : report.original_file_name + '.pdf';

    res.set({
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename="${fileName}"`,
      'Content-Length': pdfBuffer.length,
    });
    return res.send(pdfBuffer);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.deleteReport = async (req, res) => {
  try {
    const { data: report } = await supabase
      .from('medical_reports').select('*').eq('id', req.params.id).single();
    if (!report) return res.status(404).json({ message: 'Report not found.' });

    await supabase.storage.from(REPORT_BUCKET).remove([report.encrypted_file_path]);
    await supabase.from('medical_reports').delete().eq('id', req.params.id);

    await logActivity(req.user.id, req.user.name, req.user.role, 'DELETE_REPORT',
      `Report deleted: ${report.test_type} for patient ${report.patient_id}`, req.ip);

    res.json({ message: 'Report deleted.' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
