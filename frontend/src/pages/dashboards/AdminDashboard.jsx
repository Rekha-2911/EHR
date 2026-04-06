import { useEffect, useState } from 'react';
import { Users, FileText, Stethoscope, UserCog, FlaskConical, Activity, TrendingUp, Shield, Clock } from 'lucide-react';
import api from '../../api/axios';
import StatCard from '../../components/StatCard';
import { useAuth } from '../../context/AuthContext';

const actionColors = {
  LOGIN:           'bg-emerald-100 text-emerald-700 border-emerald-200',
  REGISTER:        'bg-blue-100 text-blue-700 border-blue-200',
  UPLOAD_REPORT:   'bg-orange-100 text-orange-700 border-orange-200',
  ADD_DIAGNOSIS:   'bg-purple-100 text-purple-700 border-purple-200',
  CREATE_USER:     'bg-teal-100 text-teal-700 border-teal-200',
  DELETE_USER:     'bg-red-100 text-red-700 border-red-200',
  ACCESS_DENIED:   'bg-red-100 text-red-700 border-red-200',
  DOWNLOAD_REPORT: 'bg-indigo-100 text-indigo-700 border-indigo-200',
};

const actionDots = {
  LOGIN: 'bg-emerald-500', REGISTER: 'bg-blue-500', UPLOAD_REPORT: 'bg-orange-500',
  ADD_DIAGNOSIS: 'bg-purple-500', CREATE_USER: 'bg-teal-500', DELETE_USER: 'bg-red-500',
  ACCESS_DENIED: 'bg-red-500', DOWNLOAD_REPORT: 'bg-indigo-500',
};

const roleInitialColors = {
  admin: 'bg-purple-100 text-purple-700', doctor: 'bg-blue-100 text-blue-700',
  nurse: 'bg-emerald-100 text-emerald-700', lab_technician: 'bg-orange-100 text-orange-700',
};

export default function AdminDashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [logs, setLogs] = useState([]);

  useEffect(() => {
    api.get('/admin/stats').then(r => setStats(r.data)).catch(() => {});
    api.get('/admin/logs').then(r => setLogs(r.data.slice(0, 10))).catch(() => {});
  }, []);

  const initials = user?.name?.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase() || 'A';

  return (
    <div className="p-8 min-h-screen bg-slate-50">
      {/* Header */}
      <div className="mb-8 flex items-start justify-between">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <div className="w-8 h-8 rounded-lg bg-purple-100 flex items-center justify-center">
              <Shield size={16} className="text-purple-600" />
            </div>
            <span className="text-sm font-medium text-purple-600">Admin Panel</span>
          </div>
          <h1 className="text-3xl font-bold text-slate-800">System Overview</h1>
          <p className="text-slate-500 mt-1">Welcome back, <span className="font-semibold text-slate-700">{user?.name}</span></p>
        </div>
        <div className="text-right">
          <p className="text-xs text-slate-400">Last updated</p>
          <p className="text-sm font-medium text-slate-600">{new Date().toLocaleString()}</p>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
        <StatCard title="Total Patients"    value={stats?.totalPatients}  icon={Users}       color="blue"   />
        <StatCard title="Reports Uploaded"  value={stats?.totalReports}   icon={FileText}    color="orange" />
        <StatCard title="Doctors"           value={stats?.totalDoctors}   icon={Stethoscope} color="purple" />
        <StatCard title="Nurses"            value={stats?.totalNurses}    icon={UserCog}     color="green"  />
        <StatCard title="Lab Technicians"   value={stats?.totalLabTechs}  icon={FlaskConical}color="teal"   />
        <StatCard title="Admins"            value={stats?.totalAdmins}    icon={Shield}      color="red"    />
      </div>

      {/* Activity Feed */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-blue-50 flex items-center justify-center">
              <Activity size={18} className="text-blue-600" />
            </div>
            <div>
              <h2 className="font-semibold text-slate-800">Recent Activity</h2>
              <p className="text-xs text-slate-400">Live audit trail</p>
            </div>
          </div>
          <span className="px-3 py-1 bg-slate-100 text-slate-600 rounded-full text-xs font-medium">{logs.length} events</span>
        </div>

        <div className="divide-y divide-slate-50">
          {logs.length === 0 ? (
            <div className="px-6 py-12 text-center text-slate-400">
              <Activity size={32} className="mx-auto mb-3 opacity-30" />
              <p>No activity logs yet.</p>
            </div>
          ) : logs.map((log, i) => (
            <div key={log._id} className="px-6 py-4 hover:bg-slate-50 transition-colors flex items-start gap-4">
              {/* Timeline dot */}
              <div className="flex flex-col items-center mt-1">
                <div className={`w-2.5 h-2.5 rounded-full ${actionDots[log.action] || 'bg-slate-400'}`} />
                {i < logs.length - 1 && <div className="w-px h-full bg-slate-100 mt-1 min-h-4" />}
              </div>
              {/* Avatar */}
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 ${roleInitialColors[log.userRole] || 'bg-slate-100 text-slate-600'}`}>
                {log.userName?.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase() || '?'}
              </div>
              {/* Content */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-medium text-sm text-slate-700">{log.userName || 'System'}</span>
                  <span className={`px-2 py-0.5 rounded-full text-xs font-medium border ${actionColors[log.action] || 'bg-gray-100 text-gray-600 border-gray-200'}`}>
                    {log.action?.replace('_', ' ')}
                  </span>
                </div>
                <p className="text-xs text-slate-500 mt-0.5 truncate">{log.details}</p>
              </div>
              {/* Time */}
              <div className="flex items-center gap-1 text-xs text-slate-400 flex-shrink-0">
                <Clock size={11} />
                {new Date(log.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
