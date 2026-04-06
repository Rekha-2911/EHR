import { useEffect, useState } from 'react';
import { FileText, Upload, Users, Lock, FlaskConical, CheckCircle, Clock } from 'lucide-react';
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

export default function LabDashboard() {
  const { user } = useAuth();
  const [reports, setReports] = useState([]);
  const [patients, setPatients] = useState([]);

  useEffect(() => {
    api.get('/reports').then(r => setReports(r.data)).catch(() => {});
    api.get('/patients').then(r => setPatients(r.data)).catch(() => {});
  }, []);

  const myReports = reports.filter(r => r.uploadedByName === user?.name);
  const encrypted = reports.filter(r => r.isEncrypted).length;

  const typeCounts = myReports.reduce((acc, r) => {
    acc[r.testType] = (acc[r.testType] || 0) + 1;
    return acc;
  }, {});

  return (
    <div className="p-8 min-h-screen bg-slate-50">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-2 mb-1">
          <div className="w-8 h-8 rounded-lg bg-orange-100 flex items-center justify-center">
            <FlaskConical size={16} className="text-orange-600" />
          </div>
          <span className="text-sm font-medium text-orange-600">{user?.department} Department</span>
        </div>
        <h1 className="text-3xl font-bold text-slate-800">Lab Technician Dashboard</h1>
        <p className="text-slate-500 mt-1">Welcome, <span className="font-semibold text-slate-700">{user?.name}</span></p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <StatCard title="Total Reports"  value={reports.length}    icon={FileText}    color="orange" />
        <StatCard title="My Uploads"     value={myReports.length}  icon={Upload}      color="blue"   />
        <StatCard title="Total Patients" value={patients.length}   icon={Users}       color="green"  />
        <StatCard title="Encrypted"      value={encrypted}         icon={Lock}        color="purple" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Type breakdown */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
          <div className="flex items-center gap-2 mb-5">
            <div className="w-8 h-8 rounded-lg bg-orange-50 flex items-center justify-center">
              <FlaskConical size={16} className="text-orange-600" />
            </div>
            <h2 className="font-semibold text-slate-800">My Upload Types</h2>
          </div>
          {Object.keys(typeCounts).length === 0 ? (
            <p className="text-sm text-slate-400 text-center py-8">No uploads yet</p>
          ) : (
            <div className="space-y-3">
              {Object.entries(typeCounts).map(([type, count]) => (
                <div key={type} className="flex items-center gap-3">
                  <span className="text-xl">{testTypeIcons[type] || '📋'}</span>
                  <div className="flex-1">
                    <div className="flex justify-between mb-1">
                      <span className="text-xs font-medium text-slate-600">{type}</span>
                      <span className="text-xs font-bold text-slate-700">{count}</span>
                    </div>
                    <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-orange-400 to-orange-600 rounded-full"
                        style={{ width: `${(count / myReports.length) * 100}%` }}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Recent uploads */}
        <div className="lg:col-span-2 bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
          <div className="flex items-center gap-2 mb-5">
            <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center">
              <Upload size={16} className="text-blue-600" />
            </div>
            <h2 className="font-semibold text-slate-800">My Uploaded Reports</h2>
          </div>
          {myReports.length === 0 ? (
            <div className="text-center py-12">
              <Upload size={40} className="mx-auto mb-3 text-slate-200" />
              <p className="text-slate-400 text-sm">No reports uploaded yet.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {myReports.slice(0, 8).map(r => (
                <div key={r._id} className="flex items-center gap-4 p-3 rounded-xl bg-slate-50 hover:bg-slate-100 transition-colors">
                  <div className="text-2xl">{testTypeIcons[r.testType] || '📋'}</div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-sm text-slate-700">{r.patientName}</span>
                      <span className="text-xs font-mono text-slate-400">{r.patientId}</span>
                    </div>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${testTypeColors[r.testType] || 'bg-gray-100 text-gray-700'}`}>
                        {r.testType}
                      </span>
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-1 flex-shrink-0">
                    <div className="flex items-center gap-1 text-xs text-emerald-600 bg-emerald-50 px-2 py-1 rounded-lg">
                      <Lock size={10} />
                      <span>AES-256</span>
                    </div>
                    <div className="flex items-center gap-1 text-xs text-slate-400">
                      <Clock size={10} />
                      {new Date(r.createdAt).toLocaleDateString()}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
