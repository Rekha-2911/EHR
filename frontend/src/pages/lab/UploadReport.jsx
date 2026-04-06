import { useState, useEffect } from 'react';
import { Upload, Lock, CheckCircle } from 'lucide-react';
import api from '../../api/axios';
import toast from 'react-hot-toast';

const TEST_TYPES = ['Blood Test', 'X-Ray', 'MRI', 'CT Scan', 'ECG', 'Urine Test', 'Other'];
const DEPARTMENTS = ['General', 'Cardiology', 'Neurology', 'Radiology', 'Orthopedics', 'Pediatrics', 'Emergency', 'Oncology', 'Laboratory'];

export default function UploadReport() {
  const [patients, setPatients] = useState([]);
  const [form, setForm] = useState({
    patientId: '', patientName: '', testType: 'Blood Test',
    department: 'General', notes: '', accessPolicy: 'role=doctor OR role=admin'
  });
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    api.get('/patients').then(r => setPatients(r.data)).catch(() => {});
  }, []);

  const handlePatientSelect = (e) => {
    const pid = e.target.value;
    const patient = patients.find(p => p.patientId === pid);
    setForm({ ...form, patientId: pid, patientName: patient?.name || '', department: patient?.department || form.department });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file) return toast.error('Please select a file to upload.');
    setLoading(true);
    setSuccess(false);
    try {
      const data = new FormData();
      Object.entries(form).forEach(([k, v]) => data.append(k, v));
      data.append('file', file);
      await api.post('/reports', data, { headers: { 'Content-Type': 'multipart/form-data' } });
      toast.success('Report uploaded and encrypted successfully!');
      setSuccess(true);
      setFile(null);
      setForm({ patientId: '', patientName: '', testType: 'Blood Test', department: 'General', notes: '', accessPolicy: 'role=doctor OR role=admin' });
      e.target.reset();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Upload failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-8 max-w-2xl">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-800">Upload Medical Report</h1>
        <p className="text-slate-500 mt-1">Upload patient reports — files are AES encrypted before storage</p>
      </div>

      {success && (
        <div className="flex items-center gap-3 bg-green-50 border border-green-200 text-green-700 rounded-xl p-4 mb-6">
          <CheckCircle size={20} />
          <div>
            <p className="font-medium">Report uploaded successfully!</p>
            <p className="text-sm">File has been encrypted with AES-256 and stored securely.</p>
          </div>
        </div>
      )}

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <div className="flex items-center gap-2 mb-6 p-3 bg-blue-50 rounded-lg">
          <Lock size={16} className="text-blue-600" />
          <p className="text-sm text-blue-700">All uploaded files are automatically encrypted using AES-256 encryption before storage.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Select Patient</label>
              <select value={form.patientId} onChange={handlePatientSelect}
                className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                <option value="">-- Select Patient --</option>
                {patients.map(p => (
                  <option key={p.patientId} value={p.patientId}>{p.name} ({p.patientId})</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Patient Name</label>
              <input type="text" required value={form.patientName}
                onChange={e => setForm({ ...form, patientName: e.target.value })}
                placeholder="Or type patient name"
                className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Patient ID</label>
              <input type="text" required value={form.patientId}
                onChange={e => setForm({ ...form, patientId: e.target.value })}
                placeholder="e.g. PAT-001"
                className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Test Type</label>
              <select value={form.testType} onChange={e => setForm({ ...form, testType: e.target.value })}
                className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                {TEST_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Department</label>
              <select value={form.department} onChange={e => setForm({ ...form, department: e.target.value })}
                className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                {DEPARTMENTS.map(d => <option key={d} value={d}>{d}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">ABE Access Policy</label>
              <input type="text" value={form.accessPolicy}
                onChange={e => setForm({ ...form, accessPolicy: e.target.value })}
                className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
              <p className="text-xs text-slate-400 mt-1">e.g. role=doctor AND department=Cardiology</p>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Notes (optional)</label>
            <textarea value={form.notes} onChange={e => setForm({ ...form, notes: e.target.value })}
              rows={2} placeholder="Additional notes about this report..."
              className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none" />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Upload File (PDF or Image)</label>
            <div className="border-2 border-dashed border-gray-200 rounded-xl p-6 text-center hover:border-blue-400 transition-colors">
              <Upload size={24} className="mx-auto text-slate-400 mb-2" />
              <p className="text-sm text-slate-500 mb-2">Drag & drop or click to select</p>
              <p className="text-xs text-slate-400 mb-3">PDF, JPG, PNG up to 10MB</p>
              <input type="file" accept=".pdf,.jpg,.jpeg,.png,.gif"
                onChange={e => setFile(e.target.files[0])}
                className="block mx-auto text-sm text-slate-500 file:mr-3 file:py-1.5 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100" />
              {file && <p className="text-xs text-green-600 mt-2 font-medium">{file.name} selected</p>}
            </div>
          </div>

          <button type="submit" disabled={loading}
            className="w-full py-3 bg-blue-600 text-white font-semibold rounded-xl hover:bg-blue-700 transition-colors disabled:opacity-60 flex items-center justify-center gap-2">
            <Upload size={18} />
            {loading ? 'Encrypting & Uploading...' : 'Upload & Encrypt Report'}
          </button>
        </form>
      </div>
    </div>
  );
}
