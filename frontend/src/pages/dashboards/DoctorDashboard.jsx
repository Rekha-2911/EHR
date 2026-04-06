import { useEffect, useState } from 'react';
import { Users, FileText, Stethoscope, ClipboardList, Lock, TrendingUp, Activity } from 'lucide-react';
import api from '../../api/axios';
import StatCard from '../../components/StatCard';
import { useAuth } from '../../context/AuthContext';

const testTypeColors = {
  'Blood Test': 'bg-red-100 text-red-700',
  'X-Ray':      'bg-blue-100 text-blue-700',
  'MRI':        'bg-purple-100 text-purple-700',
  'CT Scan':    'bg-indigo-100 text-indigo-700',
  'ECG':        'bg-green-100 text-green-700',
  'Urine Test': 'bg-yellow-100 text-yellow-700',
  'Other':      'bg-gray-100 text-gray-700',
};

const testTypeIcons = {
  'Blood Test': '🩸', 'X-Ray': '🦴', 'MRI': '🧠', 'CT Scan': '🔬', 'ECG': '💓', 'Urine Test': '🧪', 'Other': '📋',
};

export default function DoctorDashboard() {
  const { user } = useAuth();
  const [patients, setPatients] = useState([]);
  const [reports, setReports] = useState([]);
  const [diagnoses, setDiagnoses] = useState([]);

  useEffect(() => {
    api.get('/patients').then(r => setPatients(r.data)).catch(() => {});
    api.get('/reports').then(r => setReports(r.data)).catch(() => {});
    api.get('/diagnosis').then(r => setDiagnoses(r.data)).catch(() => {});
  }, []);

  const recentReports = reports.slice(0, 6);
  const pending = reports.filter(r => !diagnoses.find(d => d.patientId === r.patientId)).length;

  // Test type distribution — use snake_case field from Supabase
  const testTypeCounts = reports.reduce((acc, r) => {
    const t = r.test_type || r.testType || 'Other';
    acc[t] = (acc[t] || 0) + 1;
    return acc;
  }, {});

  return (
    <div className="p-8 min-h-screen bg-slate-50">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-2 mb-1">
          <div className="w-8 h-8 rounded-lg bg-blue-100 flex items-center justify-center">
            <Stethoscope size={16} className="text-blue-600" />
          </div>
          <span className="text-sm font-medium text-blue-600">{user?.department} Department</span>
        </div>
        <h1 className="text-3xl font-bold text-slate-800">Doctor Dashboard</h1>
        <p className="text-slate-500 mt-1">Welcome, <span className="font-semibold text-slate-700">Dr. {user?.name}</span></p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <StatCard title="Total Patients"  value={patients.length}  icon={Users}         color="blue"   />
        <StatCard title="Medical Reports" value={reports.length}   icon={FileText}      color="orange" />
        <StatCard title="My Diagnoses"    value={diagnoses.length} icon={Stethoscope}   color="purple" />
        <StatCard title="Pending Review"  value={pending}          icon={ClipboardList} color="red"    />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        {/* Test Type Breakdown */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
          <div className="flex items-center gap-2 mb-5">
            <div className="w-8 h-8 rounded-lg bg-purple-50 flex items-center justify-center">
              <Activity size={16} className="text-purple-600" />
            </div>
            <h2 className="font-semibold text-slate-800">Report Types</h2>
          </div>
          <div className="space-y-3">
            {Object.entries(testTypeCounts).length === 0 ? (
              <p className="text-sm text-slate-400 text-center py-4">No reports yet</p>
            ) : Object.entries(testTypeCounts).map(([type, count]) => (
              <div key={type} className="flex items-center gap-3">
                <span className="text-lg">{testTypeIcons[type] || '📋'}</span>
                <div className="flex-1">
                  <div className="flex justify-between mb-1">
                    <span className="text-xs font-medium text-slate-600">{type}</span>
                    <span className="text-xs font-bold text-slate-700">{count}</span>
                  </div>
                  <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-blue-400 to-blue-600 rounded-full transition-all"
                      style={{ width: `${(count / reports.length) * 100}%` }}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Quick Stats */}
        <div className="lg:col-span-2 bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
          <div className="flex items-center gap-2 mb-5">
            <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center">
              <TrendingUp size={16} className="text-blue-600" />
            </div>
            <h2 className="font-semibold text-slate-800">Recent Medical Reports</h2>
          </div>
          <div className="space-y-3">
            {recentReports.length === 0 ? (
              <p className="text-sm text-slate-400 text-center py-8">No reports available.</p>
            ) : recentReports.map(r => (
              <div key={r._id} className="flex items-center gap-4 p-3 rounded-xl bg-slate-50 hover:bg-slate-100 transition-colors">
                <div className="text-2xl">{testTypeIcons[r.testType] || '📋'}</div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-sm text-slate-700">{r.patientName}</span>
                    <span className="text-xs text-slate-400 font-mono">{r.patientId}</span>
                  </div>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${testTypeColors[r.testType] || 'bg-gray-100 text-gray-700'}`}>
                      {r.testType}
                    </span>
                    <span className="text-xs text-slate-400">{r.department}</span>
                  </div>
                </div>
                <div className="text-right flex-shrink-0">
                  <div className="flex items-center gap-1 text-xs text-emerald-600 bg-emerald-50 px-2 py-1 rounded-lg">
                    <Lock size={10} />
                    <span>AES</span>
                  </div>
                  <p className="text-xs text-slate-400 mt-1">{new Date(r.createdAt).toLocaleDateString()}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
