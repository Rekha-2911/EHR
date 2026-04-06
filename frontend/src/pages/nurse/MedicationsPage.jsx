import { useEffect, useState } from 'react';
import { Search, Pill, Clock, AlertCircle } from 'lucide-react';
import api from '../../api/axios';

const fmt = (d) => { const dt = new Date(d); return isNaN(dt) ? '—' : dt.toLocaleDateString(); };

export default function MedicationsPage() {
  const [diagnoses, setDiagnoses] = useState([]);
  const [search, setSearch] = useState('');
  const [patientId, setPatientId] = useState('');

  const fetchMedications = (pid = '') => {
    const url = pid ? `/diagnosis/medications?patientId=${pid}` : '/diagnosis';
    api.get(url).then(r => setDiagnoses(r.data)).catch(() => {});
  };

  useEffect(() => { fetchMedications(); }, []);

  const handlePatientSearch = (e) => {
    setPatientId(e.target.value);
    if (e.target.value.length > 2 || e.target.value === '') {
      fetchMedications(e.target.value);
    }
  };

  const filtered = diagnoses.filter(d => {
    if (!search) return true;
    const q = search.toLowerCase();
    return (
      (d.patient_name || '').toLowerCase().includes(q) ||
      (d.patient_id || '').toLowerCase().includes(q)
    );
  });

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-800">Medication Instructions</h1>
        <p className="text-slate-500 mt-1">View prescribed medications and follow treatment instructions</p>
      </div>

      <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-6 flex items-start gap-3">
        <AlertCircle size={18} className="text-amber-600 flex-shrink-0 mt-0.5" />
        <div className="text-sm text-amber-700">
          <p className="font-medium">Nurse Access — Limited View</p>
          <p>You can only see medication instructions and prescriptions. X-ray images, MRI scans, and doctor diagnosis notes are restricted.</p>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100">
        <div className="p-6 border-b border-gray-100 flex gap-4">
          <div className="relative flex-1 max-w-sm">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input type="text" value={search} onChange={e => setSearch(e.target.value)}
              placeholder="Search by patient name..."
              className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
          <div className="relative max-w-xs">
            <input type="text" value={patientId} onChange={handlePatientSearch}
              placeholder="Filter by Patient ID..."
              className="w-full px-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
        </div>

        <div className="divide-y divide-gray-50">
          {filtered.length === 0 ? (
            <p className="px-6 py-8 text-center text-slate-400">No medication records found.</p>
          ) : filtered.map(d => (
            <div key={d.id} className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <p className="font-semibold text-slate-800 text-lg">{d.patient_name}</p>
                  <p className="text-sm text-slate-400 font-mono">{d.patient_id}</p>
                </div>
                <div className="text-right">
                  <p className="text-xs text-slate-400">Prescribed on</p>
                  <p className="text-sm font-medium text-slate-600">{fmt(d.created_at)}</p>
                </div>
              </div>

              {d.prescription && (
                <div className="mb-4 p-3 bg-blue-50 rounded-lg">
                  <p className="text-xs font-medium text-blue-600 uppercase tracking-wide mb-1">Prescription</p>
                  <p className="text-sm text-slate-700">{d.prescription}</p>
                </div>
              )}

              {d.medications?.length > 0 ? (
                <div>
                  <p className="text-xs font-medium text-slate-500 uppercase tracking-wide mb-3 flex items-center gap-1">
                    <Pill size={12} /> Medications ({d.medications.length})
                  </p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {d.medications.map((med, i) => (
                      <div key={i} className="border border-gray-100 rounded-xl p-4 bg-gray-50">
                        <div className="flex items-center justify-between mb-2">
                          <p className="font-semibold text-slate-800">{med.medicineName || med.name}</p>
                          <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-medium">{med.dosage}</span>
                        </div>
                        <div className="flex items-center gap-4 text-sm text-slate-600">
                          <span className="flex items-center gap-1">
                            <Clock size={12} className="text-blue-500" />
                            {med.timesPerDay}x per day
                          </span>
                          {med.specialInstructions && (
                            <span className="text-slate-500 italic">{med.specialInstructions}</span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <p className="text-sm text-slate-400">No specific medications listed.</p>
              )}

              {d.follow_up_date && (
                <div className="mt-4 flex items-center gap-2 text-sm text-blue-600">
                  <Clock size={14} />
                  Follow-up appointment: {fmt(d.follow_up_date)}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
