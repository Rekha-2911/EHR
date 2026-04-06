import { useEffect, useState } from 'react';
import { Search, Download, Lock, AlertTriangle, FileText, Shield } from 'lucide-react';
import api from '../../api/axios';
import toast from 'react-hot-toast';

const testTypeConfig = {
  'Blood Test': { color: 'bg-red-100 text-red-700',      icon: '🩸' },
  'X-Ray':      { color: 'bg-blue-100 text-blue-700',    icon: '🦴' },
  'MRI':        { color: 'bg-purple-100 text-purple-700', icon: '🧠' },
  'CT Scan':    { color: 'bg-indigo-100 text-indigo-700', icon: '🔬' },
  'ECG':        { color: 'bg-green-100 text-green-700',   icon: '💓' },
  'Urine Test': { color: 'bg-yellow-100 text-yellow-700', icon: '🧪' },
  'Other':      { color: 'bg-gray-100 text-gray-700',    icon: '📋' },
};

const fmt = (d) => { const dt = new Date(d); return isNaN(dt) ? '—' : dt.toLocaleDateString(); };

export default function ReportsPage() {
  const [reports, setReports] = useState([]);
  const [search, setSearch] = useState('');
  const [downloading, setDownloading] = useState(null);
  const [abeError, setAbeError] = useState(null);

  useEffect(() => {
    api.get('/reports').then(r => setReports(r.data)).catch(() => {});
  }, []);

  const filtered = reports.filter(r => {
    if (!search) return true;
    const q = search.toLowerCase();
    return (
      (r.patient_name || '').toLowerCase().includes(q) ||
      (r.patient_id || '').toLowerCase().includes(q) ||
      (r.test_type || '').toLowerCase().includes(q)
    );
  });

  const handleDownload = async (report) => {
    setDownloading(report.id);
    setAbeError(null);
    try {
      const res = await api.get(`/reports/${report.id}/download`, { responseType: 'blob' });
      const disposition = res.headers['content-disposition'] || '';
      const match = disposition.match(/filename="?([^"]+)"?/);
      const filename = match ? match[1] : (report.original_file_name || 'report.pdf');
      const url = URL.createObjectURL(res.data);
      const a = document.createElement('a');
      a.href = url; a.download = filename; a.click();
      URL.revokeObjectURL(url);
      toast.success('Report downloaded successfully.');
    } catch (err) {
      if (err.response?.status === 403) {
        try {
          const text = await err.response.data.text();
          const parsed = JSON.parse(text);
          setAbeError({ reportId: report.id, message: parsed.message, policy: parsed.policy });
          toast.error('Access Denied – ABE Policy Not Satisfied');
        } catch { toast.error('Access Denied – ABE Policy Not Satisfied'); }
      } else {
        toast.error('Download failed.');
      }
    } finally { setDownloading(null); }
  };

  return (
    <div className="p-8 min-h-screen bg-slate-50">
      <div className="mb-8">
        <div className="flex items-center gap-2 mb-1">
          <div className="w-8 h-8 rounded-lg bg-blue-100 flex items-center justify-center">
            <FileText size={16} className="text-blue-600" />
          </div>
          <span className="text-sm font-medium text-blue-600">{reports.length} reports available</span>
        </div>
        <h1 className="text-3xl font-bold text-slate-800">Medical Reports</h1>
        <p className="text-slate-500 mt-1">View and download patient reports — protected by ABE access control</p>
      </div>

      {abeError && (
        <div className="flex items-start gap-4 bg-red-50 border border-red-200 text-red-700 rounded-2xl p-5 mb-6">
          <div className="w-10 h-10 rounded-xl bg-red-100 flex items-center justify-center flex-shrink-0">
            <AlertTriangle size={20} className="text-red-600" />
          </div>
          <div>
            <p className="font-semibold">Access Denied – Attribute Policy Not Satisfied</p>
            <p className="text-sm mt-1">Required policy: <code className="bg-red-100 px-1.5 py-0.5 rounded-lg font-mono">{abeError.policy}</code></p>
            <p className="text-sm text-red-600/80 mt-1">Your role/department attributes do not match the required access policy.</p>
          </div>
        </div>
      )}

      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100 flex items-center gap-4">
          <div className="relative flex-1 max-w-sm">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input type="text" value={search} onChange={e => setSearch(e.target.value)}
              placeholder="Search by patient name, ID or test type..."
              className="w-full pl-9 pr-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-slate-50" />
          </div>
          <div className="flex items-center gap-1.5 text-xs text-emerald-600 bg-emerald-50 px-3 py-2 rounded-xl border border-emerald-100">
            <Shield size={13} />
            <span className="font-medium">ABE Protected</span>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-100">
                {['Patient', 'ID', 'Test Type', 'Department', 'Uploaded By', 'ABE Policy', 'Date', 'Action'].map(h => (
                  <th key={h} className="text-left px-6 py-3.5 text-xs font-semibold text-slate-500 uppercase tracking-wide">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {filtered.length === 0 ? (
                <tr><td colSpan={8} className="px-6 py-16 text-center">
                  <FileText size={40} className="mx-auto mb-3 text-slate-200" />
                  <p className="text-slate-400">No reports found.</p>
                </td></tr>
              ) : filtered.map(r => {
                const cfg = testTypeConfig[r.test_type] || testTypeConfig['Other'];
                const initials = (r.patient_name || '??').split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase();
                return (
                  <tr key={r.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                          {initials}
                        </div>
                        <span className="font-semibold text-slate-700">{r.patient_name}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 font-mono text-xs text-slate-500">{r.patient_id}</td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${cfg.color}`}>
                        <span>{cfg.icon}</span> {r.test_type}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-slate-500">{r.department}</td>
                    <td className="px-6 py-4 text-slate-500">{r.uploaded_by_name}</td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-1.5 text-xs text-slate-500 bg-slate-50 px-2 py-1 rounded-lg max-w-fit">
                        <Lock size={10} className="text-blue-500 flex-shrink-0" />
                        <span className="font-mono truncate max-w-32">{r.access_policy}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-slate-400 text-xs">{fmt(r.created_at)}</td>
                    <td className="px-6 py-4">
                      <button onClick={() => handleDownload(r)} disabled={downloading === r.id}
                        className="flex items-center gap-1.5 px-3 py-2 bg-blue-600 text-white rounded-xl text-xs font-semibold hover:bg-blue-700 disabled:opacity-60 transition-colors shadow-sm shadow-blue-200">
                        <Download size={12} />
                        {downloading === r.id ? 'Downloading...' : 'Download'}
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
