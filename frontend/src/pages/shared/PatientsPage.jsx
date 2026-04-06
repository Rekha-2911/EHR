import { useEffect, useState } from 'react';
import { Search, UserPlus, X, Check, Users } from 'lucide-react';
import api from '../../api/axios';
import toast from 'react-hot-toast';
import { useAuth } from '../../context/AuthContext';

const DEPARTMENTS = ['General', 'Cardiology', 'Neurology', 'Radiology', 'Orthopedics', 'Pediatrics', 'Emergency', 'Oncology', 'Laboratory'];

const deptColors = {
  Cardiology: 'bg-red-100 text-red-700', Neurology: 'bg-purple-100 text-purple-700',
  Radiology: 'bg-blue-100 text-blue-700', General: 'bg-slate-100 text-slate-700',
  Orthopedics: 'bg-orange-100 text-orange-700', Pediatrics: 'bg-pink-100 text-pink-700',
  Emergency: 'bg-rose-100 text-rose-700', Oncology: 'bg-indigo-100 text-indigo-700',
  Laboratory: 'bg-teal-100 text-teal-700',
};

const genderColors = { Male: 'bg-blue-50 text-blue-600', Female: 'bg-pink-50 text-pink-600', Other: 'bg-slate-50 text-slate-600' };

const fmt = (dateStr) => {
  if (!dateStr) return '—';
  const d = new Date(dateStr);
  return isNaN(d) ? '—' : d.toLocaleDateString();
};

export default function PatientsPage({ canCreate = true }) {
  const { user } = useAuth();
  const [patients, setPatients] = useState([]);
  const [search, setSearch] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    name: '', patientId: '', age: '', gender: 'Male',
    department: 'General',
    contactNumber: '', address: ''
  });
  const [loading, setLoading] = useState(false);

  const fetchPatients = (q = '') => {
    api.get(`/patients${q ? `?search=${q}` : ''}`).then(r => setPatients(r.data)).catch(() => {});
  };

  useEffect(() => { fetchPatients(); }, []);

  const handleSearch = (e) => { setSearch(e.target.value); fetchPatients(e.target.value); };

  const handleCreate = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.post('/patients', form);
      toast.success('Patient registered successfully.');
      setShowForm(false);
      setForm({ name: '', patientId: '', age: '', gender: 'Male', department: 'General', contactNumber: '', address: '' });
      fetchPatients();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to register patient.');
    } finally {
      setLoading(false);
    }
  };

  const initials = (name) => name?.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase() || '?';

  // Receptionist can only assign to their own department
  const isReceptionist = user?.role === 'receptionist';

  return (
    <div className="p-8 min-h-screen bg-slate-50">
      <div className="flex items-center justify-between mb-8">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <div className="w-8 h-8 rounded-lg bg-blue-100 flex items-center justify-center">
              <Users size={16} className="text-blue-600" />
            </div>
            <span className="text-sm font-medium text-blue-600">{patients.length} registered</span>
          </div>
          <h1 className="text-3xl font-bold text-slate-800">Patients</h1>
          <p className="text-slate-500 mt-1">View and manage patient records</p>
        </div>
        {canCreate && (
          <button onClick={() => setShowForm(!showForm)}
            className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors text-sm font-semibold shadow-sm shadow-blue-200">
            <UserPlus size={16} /> Register Patient
          </button>
        )}
      </div>

      {showForm && (
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 mb-6">
          <h2 className="font-semibold text-slate-800 mb-5 flex items-center gap-2">
            <UserPlus size={18} className="text-blue-600" /> Register New Patient
          </h2>
          <form onSubmit={handleCreate} className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {[
              { label: 'Full Name', key: 'name', type: 'text', placeholder: 'Patient full name' },
              { label: 'Patient ID', key: 'patientId', type: 'text', placeholder: 'e.g. PAT-006' },
              { label: 'Age', key: 'age', type: 'number', placeholder: 'Age in years' },
              { label: 'Contact Number', key: 'contactNumber', type: 'text', placeholder: 'Phone number' },
              { label: 'Address', key: 'address', type: 'text', placeholder: 'Home address' },
            ].map(({ label, key, type, placeholder }) => (
              <div key={key}>
                <label className="block text-xs font-semibold text-slate-600 mb-1.5 uppercase tracking-wide">{label}</label>
                <input type={type} value={form[key]} onChange={e => setForm({ ...form, [key]: e.target.value })}
                  placeholder={placeholder}
                  className="w-full px-3 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-slate-50" />
              </div>
            ))}
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1.5 uppercase tracking-wide">Gender</label>
              <select value={form.gender} onChange={e => setForm({ ...form, gender: e.target.value })}
                className="w-full px-3 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-slate-50">
                <option>Male</option><option>Female</option><option>Other</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1.5 uppercase tracking-wide">Department</label>
              <select value={form.department} onChange={e => setForm({ ...form, department: e.target.value })}
                className="w-full px-3 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-slate-50">
                {DEPARTMENTS.map(d => <option key={d} value={d}>{d}</option>)}
              </select>
            </div>
            <div className="flex items-end gap-2">
              <button type="submit" disabled={loading}
                className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 text-white rounded-xl text-sm font-semibold hover:bg-blue-700 disabled:opacity-60 shadow-sm">
                <Check size={14} /> {loading ? 'Saving...' : 'Register'}
              </button>
              <button type="button" onClick={() => setShowForm(false)}
                className="flex items-center gap-2 px-4 py-2.5 bg-slate-100 text-slate-600 rounded-xl text-sm hover:bg-slate-200">
                <X size={14} /> Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100 flex items-center gap-4">
          <div className="relative flex-1 max-w-sm">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input type="text" value={search} onChange={handleSearch}
              placeholder="Search by name, ID or department..."
              className="w-full pl-9 pr-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-slate-50" />
          </div>
          <span className="text-sm text-slate-400">{patients.length} patients</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-100">
                <th className="text-left px-6 py-3.5 text-xs font-semibold text-slate-500 uppercase tracking-wide">Patient</th>
                <th className="text-left px-6 py-3.5 text-xs font-semibold text-slate-500 uppercase tracking-wide">ID</th>
                <th className="text-left px-6 py-3.5 text-xs font-semibold text-slate-500 uppercase tracking-wide">Age</th>
                <th className="text-left px-6 py-3.5 text-xs font-semibold text-slate-500 uppercase tracking-wide">Gender</th>
                <th className="text-left px-6 py-3.5 text-xs font-semibold text-slate-500 uppercase tracking-wide">Department</th>
                <th className="text-left px-6 py-3.5 text-xs font-semibold text-slate-500 uppercase tracking-wide">Contact</th>
                <th className="text-left px-6 py-3.5 text-xs font-semibold text-slate-500 uppercase tracking-wide">Registered</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {patients.length === 0 ? (
                <tr><td colSpan={7} className="px-6 py-16 text-center">
                  <Users size={40} className="mx-auto mb-3 text-slate-200" />
                  <p className="text-slate-400">No patients found.</p>
                </td></tr>
              ) : patients.map(p => (
                <tr key={p.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                        {initials(p.name)}
                      </div>
                      <span className="font-semibold text-slate-700">{p.name}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 font-mono text-xs text-slate-500">{p.patient_id}</td>
                  <td className="px-6 py-4 text-slate-600">{p.age} yrs</td>
                  <td className="px-6 py-4">
                    <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${genderColors[p.gender] || 'bg-slate-50 text-slate-600'}`}>
                      {p.gender}
                    </span>
                  </td>
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
