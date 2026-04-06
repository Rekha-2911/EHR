import { useEffect, useState } from 'react';
import { Trash2, Lock, Search } from 'lucide-react';
import api from '../../api/axios';
import toast from 'react-hot-toast';

const testTypeColors = {
  'Blood Test': 'bg-red-50 text-red-700', 'X-Ray': 'bg-blue-50 text-blue-700',
  'MRI': 'bg-purple-50 text-purple-700',  'CT Scan': 'bg-indigo-50 text-indigo-700',
  'ECG': 'bg-green-50 text-green-700',    'Urine Test': 'bg-yellow-50 text-yellow-700',
  'Other': 'bg-gray-50 text-gray-700',
};

const fmt = (d) => { const dt = new Date(d); return isNaN(dt) ? '—' : dt.toLocaleDateString(); };

export default function AdminReports() {
  const [reports, setReports] = useState([]);
  const [search, setSearch] = useState('');

  const fetchReports = () => api.get('/reports').then(r => setReports(r.data)).catch(() => {});
  useEffect(() => { fetchReports(); }, []);

  const handleDelete = async (id, name) => {
    if (!confirm(`Delete report for "${name}"?`)) return;
    try {
      await api.delete(`/reports/${id}`);
      toast.success('Report deleted.');
      fetchReports();
    } catch {
      toast.error('Failed to delete report.');
    }
  };

  const filtered = reports.filter(r => {
    if (!search) return true;
    const q = search.toLowerCase();
    return (
      (r.patient_name || '').toLowerCase().includes(q) ||
      (r.patient_id || '').toLowerCase().includes(q) ||
      (r.test_type || '').toLowerCase().includes(q)
    );
  });

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-800">All Medical Reports</h1>
        <p className="text-slate-500 mt-1">Manage all uploaded medical reports in the system</p>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100">
        <div className="p-6 border-b border-gray-100">
          <div className="relative max-w-sm">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input type="text" value={search} onChange={e => setSearch(e.target.value)}
              placeholder="Search reports..."
              className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50">
              <tr>
                {['Patient', 'Patient ID', 'Test Type', 'Department', 'Uploaded By', 'File', 'Encryption', 'Date', 'Actions'].map(h => (
                  <th key={h} className="text-left px-6 py-3 text-slate-500 font-medium">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filtered.length === 0 ? (
                <tr><td colSpan={9} className="px-6 py-8 text-center text-slate-400">No reports found.</td></tr>
              ) : filtered.map(r => (
                <tr key={r.id} className="hover:bg-gray-50">
                  <td className="px-6 py-3 font-medium text-slate-700">{r.patient_name}</td>
                  <td className="px-6 py-3 text-slate-500 font-mono text-xs">{r.patient_id}</td>
                  <td className="px-6 py-3">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${testTypeColors[r.test_type] || 'bg-gray-50 text-gray-700'}`}>
                      {r.test_type}
                    </span>
                  </td>
                  <td className="px-6 py-3 text-slate-500">{r.department}</td>
                  <td className="px-6 py-3 text-slate-500">{r.uploaded_by_name}</td>
                  <td className="px-6 py-3 text-slate-500 truncate max-w-xs text-xs">{r.original_file_name}</td>
                  <td className="px-6 py-3">
                    <span className="flex items-center gap-1 text-xs text-green-700 bg-green-50 px-2 py-1 rounded-full w-fit">
                      <Lock size={10} /> AES-256
                    </span>
                  </td>
                  <td className="px-6 py-3 text-slate-400">{fmt(r.created_at)}</td>
                  <td className="px-6 py-3">
                    <button onClick={() => handleDelete(r.id, r.patient_name)}
                      className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg transition-colors">
                      <Trash2 size={15} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
