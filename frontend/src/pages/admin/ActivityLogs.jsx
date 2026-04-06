import { useEffect, useState } from 'react';
import { Activity, RefreshCw, Clock, Shield, AlertTriangle, LogIn, Upload, Stethoscope, UserPlus, Trash2, Download } from 'lucide-react';
import api from '../../api/axios';

const actionConfig = {
  LOGIN:           { color: 'bg-emerald-100 text-emerald-700', dot: 'bg-emerald-500', icon: LogIn       },
  REGISTER:        { color: 'bg-blue-100 text-blue-700',       dot: 'bg-blue-500',    icon: UserPlus    },
  UPLOAD_REPORT:   { color: 'bg-orange-100 text-orange-700',   dot: 'bg-orange-500',  icon: Upload      },
  ADD_DIAGNOSIS:   { color: 'bg-purple-100 text-purple-700',   dot: 'bg-purple-500',  icon: Stethoscope },
  CREATE_USER:     { color: 'bg-teal-100 text-teal-700',       dot: 'bg-teal-500',    icon: UserPlus    },
  DELETE_USER:     { color: 'bg-red-100 text-red-700',         dot: 'bg-red-500',     icon: Trash2      },
  ACCESS_DENIED:   { color: 'bg-red-100 text-red-700',         dot: 'bg-red-500',     icon: AlertTriangle },
  DOWNLOAD_REPORT: { color: 'bg-indigo-100 text-indigo-700',   dot: 'bg-indigo-500',  icon: Download    },
  DELETE_REPORT:   { color: 'bg-red-100 text-red-700',         dot: 'bg-red-500',     icon: Trash2      },
  CREATE_PATIENT:  { color: 'bg-cyan-100 text-cyan-700',       dot: 'bg-cyan-500',    icon: UserPlus    },
};

const roleColors = {
  admin: 'bg-purple-100 text-purple-700', doctor: 'bg-blue-100 text-blue-700',
  nurse: 'bg-emerald-100 text-emerald-700', lab_technician: 'bg-orange-100 text-orange-700',
};

export default function ActivityLogs() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [filter, setFilter] = useState('ALL');

  const fetchLogs = async () => {
    setLoading(true);
    try { const res = await api.get('/admin/logs'); setLogs(res.data); }
    catch { } finally { setLoading(false); }
  };

  useEffect(() => { fetchLogs(); }, []);

  const actionTypes = ['ALL', ...Object.keys(actionConfig)];
  const filtered = filter === 'ALL' ? logs : logs.filter(l => l.action === filter);

  const initials = (name) => name?.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase() || '?';

  return (
    <div className="p-8 min-h-screen bg-slate-50">
      <div className="flex items-center justify-between mb-8">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <div className="w-8 h-8 rounded-lg bg-blue-100 flex items-center justify-center">
              <Shield size={16} className="text-blue-600" />
            </div>
            <span className="text-sm font-medium text-blue-600">Audit Trail</span>
          </div>
          <h1 className="text-3xl font-bold text-slate-800">Activity Logs</h1>
          <p className="text-slate-500 mt-1">System-wide audit trail of all user actions</p>
        </div>
        <button onClick={fetchLogs}
          className="flex items-center gap-2 px-4 py-2.5 bg-white border border-slate-200 text-slate-600 rounded-xl hover:bg-slate-50 transition-colors text-sm font-medium shadow-sm">
          <RefreshCw size={15} className={loading ? 'animate-spin' : ''} />
          Refresh
        </button>
      </div>

      {/* Filter pills */}
      <div className="flex gap-2 flex-wrap mb-6">
        {actionTypes.map(type => (
          <button key={type} onClick={() => setFilter(type)}
            className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
              filter === type
                ? 'bg-blue-600 text-white shadow-sm'
                : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
            }`}>
            {type === 'ALL' ? `All (${logs.length})` : type.replace('_', ' ')}
          </button>
        ))}
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100 flex items-center gap-3">
          <Activity size={18} className="text-blue-600" />
          <h2 className="font-semibold text-slate-800">Events</h2>
          <span className="ml-auto px-3 py-1 bg-slate-100 text-slate-600 rounded-full text-xs font-medium">{filtered.length} records</span>
        </div>

        <div className="divide-y divide-slate-50">
          {filtered.length === 0 ? (
            <div className="px-6 py-16 text-center">
              <Activity size={40} className="mx-auto mb-3 text-slate-200" />
              <p className="text-slate-400">No activity logs found.</p>
            </div>
          ) : filtered.map(log => {
            const cfg = actionConfig[log.action] || { color: 'bg-gray-100 text-gray-600', dot: 'bg-gray-400', icon: Activity };
            const ActionIcon = cfg.icon;
            return (
              <div key={log._id} className="px-6 py-4 hover:bg-slate-50 transition-colors flex items-center gap-4">
                {/* Action icon */}
                <div className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 ${cfg.color}`}>
                  <ActionIcon size={16} />
                </div>
                {/* User avatar */}
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 ${roleColors[log.userRole] || 'bg-slate-100 text-slate-600'}`}>
                  {initials(log.userName)}
                </div>
                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-semibold text-sm text-slate-700">{log.userName || 'System'}</span>
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${cfg.color}`}>
                      {log.action?.replace(/_/g, ' ')}
                    </span>
                    {log.userRole && (
                      <span className={`px-2 py-0.5 rounded-full text-xs ${roleColors[log.userRole] || 'bg-slate-100 text-slate-500'}`}>
                        {log.userRole.replace('_', ' ')}
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-slate-500 mt-0.5 truncate">{log.details}</p>
                </div>
                {/* Timestamp */}
                <div className="flex items-center gap-1.5 text-xs text-slate-400 flex-shrink-0">
                  <Clock size={11} />
                  <div className="text-right">
                    <p>{new Date(log.createdAt).toLocaleDateString()}</p>
                    <p>{new Date(log.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
