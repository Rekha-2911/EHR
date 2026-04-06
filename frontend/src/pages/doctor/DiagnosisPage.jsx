import { useEffect, useState } from 'react';
import { Plus, Stethoscope, X, Check } from 'lucide-react';
import api from '../../api/axios';
import toast from 'react-hot-toast';
import { useAuth } from '../../context/AuthContext';

const fmt = (dateStr) => {
  if (!dateStr) return '—';
  const d = new Date(dateStr);
  return isNaN(d) ? '—' : d.toLocaleDateString();
};

export default function DiagnosisPage() {
  const { user } = useAuth();
  const [diagnoses, setDiagnoses] = useState([]);
  const [patients, setPatients] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    patientId: '', patientName: '', diagnosis: '', prescription: '',
    medications: [{ medicineName: '', dosage: '', timesPerDay: 1, specialInstructions: '' }],
    followUpDate: '', notes: ''
  });

  const fetchDiagnoses = () => api.get('/diagnosis').then(r => setDiagnoses(r.data)).catch(() => {});

  useEffect(() => {
    fetchDiagnoses();
    api.get('/patients').then(r => {
      // Filter patients to doctor's department only
      const all = r.data;
      const filtered = user?.department
        ? all.filter(p => p.department === user.department)
        : all;
      setPatients(filtered);
    }).catch(() => {});
  }, []);

  const handlePatientSelect = (e) => {
    const pid = e.target.value;
    const patient = patients.find(p => p.patient_id === pid);
    setForm({ ...form, patientId: pid, patientName: patient?.name || '' });
  };

  const addMedication = () => {
    setForm({ ...form, medications: [...form.medications, { medicineName: '', dosage: '', timesPerDay: 1, specialInstructions: '' }] });
  };

  const updateMed = (i, field, value) => {
    const meds = [...form.medications];
    meds[i][field] = value;
    setForm({ ...form, medications: meds });
  };

  const removeMed = (i) => {
    setForm({ ...form, medications: form.medications.filter((_, idx) => idx !== i) });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.post('/diagnosis', form);
      toast.success('Diagnosis and prescription saved.');
      setShowForm(false);
      setForm({ patientId: '', patientName: '', diagnosis: '', prescription: '', medications: [{ medicineName: '', dosage: '', timesPerDay: 1, specialInstructions: '' }], followUpDate: '', notes: '' });
      fetchDiagnoses();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save diagnosis.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Diagnosis & Prescriptions</h1>
          <p className="text-slate-500 mt-1">Patients in your department: <span className="font-medium text-blue-600">{user?.department}</span></p>
        </div>
        <button onClick={() => setShowForm(!showForm)}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors text-sm font-medium">
          <Plus size={16} /> Add Diagnosis
        </button>
      </div>

      {showForm && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-6">
          <h2 className="font-semibold text-slate-800 mb-5 flex items-center gap-2">
            <Stethoscope size={18} className="text-blue-600" /> New Diagnosis
          </h2>
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Select Patient <span className="text-slate-400 font-normal">({user?.department} dept)</span>
              </label>
              <select value={form.patientId} onChange={handlePatientSelect} required
                className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                <option value="">-- Select Patient --</option>
                {patients.map(p => (
                  <option key={p.patient_id} value={p.patient_id}>{p.name} — {p.patient_id}</option>
                ))}
              </select>
              {patients.length === 0 && (
                <p className="text-xs text-amber-600 mt-1">No patients assigned to {user?.department} department yet.</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Diagnosis</label>
              <textarea required value={form.diagnosis} onChange={e => setForm({ ...form, diagnosis: e.target.value })}
                rows={3} placeholder="Describe the diagnosis..."
                className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Prescription Summary</label>
              <textarea value={form.prescription} onChange={e => setForm({ ...form, prescription: e.target.value })}
                rows={2} placeholder="General prescription notes..."
                className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none" />
            </div>

            <div>
              <div className="flex items-center justify-between mb-3">
                <label className="text-sm font-medium text-slate-700">Medications</label>
                <button type="button" onClick={addMedication}
                  className="text-xs text-blue-600 hover:text-blue-700 font-medium flex items-center gap-1">
                  <Plus size={12} /> Add Medicine
                </button>
              </div>
              <div className="space-y-3">
                {form.medications.map((med, i) => (
                  <div key={i} className="grid grid-cols-4 gap-3 p-3 bg-gray-50 rounded-lg relative">
                    <div>
                      <label className="block text-xs text-slate-500 mb-1">Medicine Name</label>
                      <input type="text" value={med.medicineName} onChange={e => updateMed(i, 'medicineName', e.target.value)}
                        placeholder="e.g. Paracetamol"
                        className="w-full px-2 py-1.5 border border-gray-200 rounded text-sm focus:outline-none focus:ring-1 focus:ring-blue-500" />
                    </div>
                    <div>
                      <label className="block text-xs text-slate-500 mb-1">Dosage</label>
                      <input type="text" value={med.dosage} onChange={e => updateMed(i, 'dosage', e.target.value)}
                        placeholder="e.g. 500mg"
                        className="w-full px-2 py-1.5 border border-gray-200 rounded text-sm focus:outline-none focus:ring-1 focus:ring-blue-500" />
                    </div>
                    <div>
                      <label className="block text-xs text-slate-500 mb-1">Times/Day</label>
                      <input type="number" min={1} max={10} value={med.timesPerDay} onChange={e => updateMed(i, 'timesPerDay', e.target.value)}
                        className="w-full px-2 py-1.5 border border-gray-200 rounded text-sm focus:outline-none focus:ring-1 focus:ring-blue-500" />
                    </div>
                    <div>
                      <label className="block text-xs text-slate-500 mb-1">Special Instructions</label>
                      <input type="text" value={med.specialInstructions} onChange={e => updateMed(i, 'specialInstructions', e.target.value)}
                        placeholder="e.g. After meals"
                        className="w-full px-2 py-1.5 border border-gray-200 rounded text-sm focus:outline-none focus:ring-1 focus:ring-blue-500" />
                    </div>
                    {form.medications.length > 1 && (
                      <button type="button" onClick={() => removeMed(i)}
                        className="absolute -top-2 -right-2 w-5 h-5 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600">
                        <X size={10} />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Follow-up Date</label>
                <input type="date" value={form.followUpDate} onChange={e => setForm({ ...form, followUpDate: e.target.value })}
                  className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Additional Notes</label>
                <input type="text" value={form.notes} onChange={e => setForm({ ...form, notes: e.target.value })}
                  placeholder="Any additional notes..."
                  className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
            </div>

            <div className="flex gap-3">
              <button type="submit" disabled={loading}
                className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 text-white rounded-xl text-sm font-medium hover:bg-blue-700 disabled:opacity-60">
                <Check size={15} /> {loading ? 'Saving...' : 'Save Diagnosis'}
              </button>
              <button type="button" onClick={() => setShowForm(false)}
                className="flex items-center gap-2 px-5 py-2.5 bg-gray-100 text-slate-600 rounded-xl text-sm hover:bg-gray-200">
                <X size={15} /> Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="bg-white rounded-xl shadow-sm border border-gray-100">
        <div className="p-6 border-b border-gray-100">
          <h2 className="font-semibold text-slate-800">All Diagnoses ({diagnoses.length})</h2>
        </div>
        <div className="divide-y divide-gray-50">
          {diagnoses.length === 0 ? (
            <p className="px-6 py-8 text-center text-slate-400">No diagnoses recorded yet.</p>
          ) : diagnoses.map(d => (
            <div key={d.id} className="p-6 hover:bg-gray-50">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <p className="font-semibold text-slate-800">{d.patient_name}</p>
                  <p className="text-xs text-slate-400 font-mono">
                    {d.patient_id} · {d.doctor_name} · {fmt(d.created_at)}
                  </p>
                </div>
                {d.follow_up_date && (
                  <span className="text-xs bg-blue-50 text-blue-700 px-2 py-1 rounded-full">
                    Follow-up: {fmt(d.follow_up_date)}
                  </span>
                )}
              </div>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-xs font-medium text-slate-500 uppercase tracking-wide mb-1">Diagnosis</p>
                  <p className="text-slate-700">{d.diagnosis}</p>
                </div>
                {d.prescription && (
                  <div>
                    <p className="text-xs font-medium text-slate-500 uppercase tracking-wide mb-1">Prescription</p>
                    <p className="text-slate-700">{d.prescription}</p>
                  </div>
                )}
              </div>
              {d.medications?.length > 0 && (
                <div className="mt-3">
                  <p className="text-xs font-medium text-slate-500 uppercase tracking-wide mb-2">Medications</p>
                  <div className="flex flex-wrap gap-2">
                    {d.medications.map((m, i) => (
                      <span key={i} className="px-3 py-1 bg-green-50 text-green-700 rounded-full text-xs">
                        {m.medicineName} {m.dosage} · {m.timesPerDay}x/day
                        {m.specialInstructions && ` · ${m.specialInstructions}`}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
