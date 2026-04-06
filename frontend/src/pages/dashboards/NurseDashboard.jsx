import { useEffect, useState } from 'react';
import { Users, Pill, ClipboardList, Heart, AlertCircle, CheckCircle } from 'lucide-react';
import api from '../../api/axios';
import StatCard from '../../components/StatCard';
import { useAuth } from '../../context/AuthContext';

const fmt = (dateStr) => {
  if (!dateStr) return '—';
  const d = new Date(dateStr);
  return isNaN(d) ? '—' : d.toLocaleDateString();
};

export default function NurseDashboard() {
  const { user } = useAuth();
  const [patients, setPatients] = useState([]);
  const [diagnoses, setDiagnoses] = useState([]);

  useEffect(() => {
    api.get('/patients').then(r => setPatients(r.data)).catch(() => {});
    api.get('/diagnosis').then(r => setDiagnoses(r.data)).catch(() => {});
  }, []);

  const totalMeds = diagnoses.reduce((acc, d) => acc + (d.medications?.length || 0), 0);

  return (
    <div className="p-8 min-h-screen bg-slate-50">
      <div className="mb-8">
        <div className="flex items-center gap-2 mb-1">
          <div className="w-8 h-8 rounded-lg bg-emerald-100 flex items-center justify-center">
            <Heart size={16} className="text-emerald-600" />
          </div>
          <span className="text-sm font-medium text-emerald-600">{user?.department} Department</span>
        </div>
        <h1 className="text-3xl font-bold text-slate-800">Nurse Dashboard</h1>
        <p className="text-slate-500 mt-1">Welcome, <span className="font-semibold text-slate-700">{user?.name}</span></p>
      </div>

      <div className="grid grid-cols-3 gap-4 mb-8">
        <StatCard title="Total Patients"       value={patients.length}  icon={Users}         color="green"  />
        <StatCard title="Active Prescriptions" value={diagnoses.length} icon={ClipboardList} color="blue"   />
        <StatCard title="Medications Assigned" value={totalMeds}        icon={Pill}          color="purple" />
      </div>

      <div className="mb-6">
        <div className="flex items-center gap-2 mb-4">
          <div className="w-8 h-8 rounded-lg bg-emerald-50 flex items-center justify-center">
            <Pill size={16} className="text-emerald-600" />
          </div>
          <h2 className="font-semibold text-slate-800">Patient Medication Instructions</h2>
          <span className="ml-auto px-3 py-1 bg-slate-100 text-slate-600 rounded-full text-xs font-medium">
            {diagnoses.length} prescriptions
          </span>
        </div>

        {diagnoses.length === 0 ? (
          <div className="bg-white rounded-2xl border border-slate-100 p-12 text-center">
            <Pill size={40} className="mx-auto mb-3 text-slate-200" />
            <p className="text-slate-400">No prescriptions available yet.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {diagnoses.map(d => (
              <div key={d.id || d._id} className="bg-white rounded-2xl shadow-sm border border-slate-100 p-5 hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h3 className="font-semibold text-slate-800">{d.patient_name || d.patientName || '—'}</h3>
                    <span className="text-xs font-mono text-slate-400">{d.patient_id || d.patientId}</span>
                  </div>
                  <div className={`flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-medium ${
                    d.medications?.length > 0 ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-50 text-slate-500'
                  }`}>
                    {d.medications?.length > 0
                      ? <><CheckCircle size={11} /> {d.medications.length} med(s)</>
                      : <><AlertCircle size={11} /> No meds</>
                    }
                  </div>
                </div>

                {d.prescription && (
                  <div className="bg-blue-50 rounded-xl p-3 mb-3">
                    <p className="text-xs font-semibold text-blue-700 mb-1">Prescription</p>
                    <p className="text-xs text-blue-600">{d.prescription}</p>
                  </div>
                )}

                {d.medications?.length > 0 && (
                  <div className="space-y-2">
                    {d.medications.map((med, i) => (
                      <div key={i} className="flex items-center gap-2 p-2 bg-slate-50 rounded-lg">
                        <div className="w-6 h-6 rounded-full bg-emerald-100 flex items-center justify-center flex-shrink-0">
                          <Pill size={11} className="text-emerald-600" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-semibold text-slate-700">
                            {med.medicineName || med.name || '—'}
                          </p>
                          <p className="text-xs text-slate-500">
                            {med.dosage}{med.timesPerDay ? ` · ${med.timesPerDay}x/day` : ''}{med.specialInstructions ? ` · ${med.specialInstructions}` : ''}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                <p className="text-xs text-slate-400 mt-3">{fmt(d.created_at || d.createdAt)}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
