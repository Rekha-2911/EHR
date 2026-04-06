import { useEffect, useState } from 'react';
import { Search, Users } from 'lucide-react';
import api from '../../api/axios';

const deptColors = {
  Cardiology: 'bg-red-100 text-red-700', Neurology: 'bg-purple-100 text-purple-700',
  Radiology: 'bg-blue-100 text-blue-700', General: 'bg-slate-100 text-slate-700',
  Orthopedics: 'bg-orange-100 text-orange-700', Pediatrics: 'bg-pink-100 text-pink-700',
  Emergency: 'bg-rose-100 text-rose-700', Oncology: 'bg-indigo-100 text-indigo-700',
  Laboratory: 'bg-teal-100 text-teal-700',
};

const fmt = (d) => { const dt = new Date(d); return isNaN(dt) ? '—' : dt.toLocaleDateString(); };

export default function PatientsListPage() {
  const [patients, setPatients] = useState([]);
  const [search, setSearch] = useState('');

  const fetchPatients = (q = '') =>
    api.get(`/patients${q ? `?search=${q}` : ''}`).then(r => setPatients(r.data)).catch(() => {});

  useEffect(() => { fetchPatients(); }, []);

  return (
    <div className="p-8 min-h-screen bg-slate-50">
      <div className="flex items-center gap-3 mb-8">
        <div className="w-8 h-8 rounded-lg bg-teal-100 flex items-center justify-center">
          <Users size={16} className="text-teal-600" />
        </div>
        <div>
          <h1 className="text-3xl font-bold text-slate-800">All Patients</h1>
          <p className="text-slate-500 text-sm">{patients.length} registered patients</p>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100 flex items-center gap-4">
          <div className="relative flex-1 max-w-sm">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input type="text" value={search}
              onChange={e => { setSearch(e.target.value); fetchPatients(e.target.value); }}
              placeholder="Search by name, ID or department..."
              className="w-full pl-9 pr-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 bg-slate-50" />
          </div>
          <span className="text-sm text-slate-400">{patients.length} patients</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-100">
                {['Patient', 'ID', 'Age', 'Gender', 'Department', 'Contact', 'Registered'].map(h => (
                  <th key={h} className="text-left px-6 py-3.5 text-xs font-semibold text-slate-500 uppercase tracking-wide">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {patients.length === 0 ? (
                <tr><td colSpan={7} className="px-6 py-12 text-center text-slate-400">No patients found.</td></tr>
              ) : patients.map(p => (
                <tr key={p.id} className="hover:bg-slate-50">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-teal-400 to-teal-600 flex items-center justify-center text-white text-xs font-bold">
                        {p.name?.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()}
                      </div>
                      <span className="font-semibold text-slate-700">{p.name}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 font-mono text-xs text-slate-500">{p.patient_id}</td>
                  <td className="px-6 py-4 text-slate-600">{p.age} yrs</td>
                  <td className="px-6 py-4 text-slate-600">{p.gender}</td>
                  <td className="px-6 py-4">
                    <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${deptColors[p.department] || 'bg-slate-100 text-slate-700'}`}>
                      {p.department}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-slate-500">{p.contact_number || '—'}</td>
                  <td className="px-6 py-4 text-slate-400 text-xs">{fmt(p.created_at)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
