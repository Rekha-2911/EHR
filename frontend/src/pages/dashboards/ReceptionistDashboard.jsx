import { useEffect, useState } from 'react';
import { UserPlus, Users, ClipboardList, Check, X, Search } from 'lucide-react';
import api from '../../api/axios';
import StatCard from '../../components/StatCard';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';

const DEPARTMENTS = ['General', 'Cardiology', 'Neurology', 'Radiology', 'Orthopedics', 'Pediatrics', 'Emergency', 'Oncology', 'Laboratory'];

const DEPT_SYMPTOMS = {
  Cardiology:   'Heart issues, chest pain, palpitations, hypertension',
  Neurology:    'Headaches, seizures, memory loss, nerve pain',
  Radiology:    'Imaging required, X-ray, MRI, CT scan',
  Orthopedics:  'Bone/joint pain, fractures, back pain',
  Pediatrics:   'Children under 18',
  Emergency:    'Urgent/critical condition',
  Oncology:     'Cancer screening or treatment',
  Laboratory:   'Blood tests, urine tests, lab work',
  General:      'General checkup, fever, cold, other',
};

const deptColors = {
  Cardiology: 'bg-red-100 text-red-700', Neurology: 'bg-purple-100 text-purple-700',
  Radiology: 'bg-blue-100 text-blue-700', General: 'bg-slate-100 text-slate-700',
  Orthopedics: 'bg-orange-100 text-orange-700', Pediatrics: 'bg-pink-100 text-pink-700',
  Emergency: 'bg-rose-100 text-rose-700', Oncology: 'bg-indigo-100 text-indigo-700',
  Laboratory: 'bg-teal-100 text-teal-700',
};

const fmt = (d) => { const dt = new Date(d); return isNaN(dt) ? '—' : dt.toLocaleDateString(); };

export default function ReceptionistDashboard() {
  const { user } = useAuth();
  const [patients, setPatients] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    name: '', patientId: '', age: '', gender: 'Male',
    department: 'General', contactNumber: '', address: '', symptoms: ''
  });

  const fetchPatients = (q = '') =>
    api.get(`/patients${q ? `?search=${q}` : ''}`).then(r => setPatients(r.data)).catch(() => {});

  useEffect(() => { fetchPatients(); }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.post('/patients', {
        name: form.name, patientId: form.patientId, age: form.age,
        gender: form.gender, department: form.department,
        contactNumber: form.contactNumber, address: form.address
      });
      toast.success(`Patient registered and assigned to ${form.department}`);
      setShowForm(false);
      setForm({ name: '', patientId: '', age: '', gender: 'Male', department: 'General', contactNumber: '', address: '', symptoms: '' });
      fetchPatients();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to register patient.');
    } finally {
      setLoading(false);
    }
  };

  const todayCount = patients.filter(p => {
    const d = new Date(p.created_at);
    const today = new Date();
    return d.toDateString() === today.toDateString();
  }).length;

  const filtered = patients.filter(p =>
    !search ||
    p.name?.toLowerCase().includes(search.toLowerCase()) ||
    p.patient_id?.toLowerCase().includes(search.toLowerCase()) ||
    p.department?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="p-8 min-h-screen bg-slate-50">
      {/* Header */}
      <div className="flex items-start justify-between mb-8">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <div className="w-8 h-8 rounded-lg bg-teal-100 flex items-center justify-center">
              <ClipboardList size={16} className="text-teal-600" />
            </div>
            <span className="text-sm font-medium text-teal-600">Reception Desk</span>
          </div>
          <h1 className="text-3xl font-bold text-slate-800">Receptionist Dashboard</h1>
          <p className="text-slate-500 mt-1">Welcome, <span className="font-semibold text-slate-700">{user?.name}</span></p>
        </div>
        <button onClick={() => setShowForm(!showForm)}
          className="flex items-center gap-2 px-5 py-2.5 bg-teal-600 text-white rounded-xl hover:bg-teal-700 text-sm font-semibold shadow-sm">
          <UserPlus size={16} /> Register New Patient
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 mb-8">
        <StatCard title="Total Patients"    value={patients.length} icon={Users}         color="teal"  />
        <StatCard title="Registered Today"  value={todayCount}      icon={UserPlus}      color="green" />
        <StatCard title="Departments"       value={DEPARTMENTS.length} icon={ClipboardList} color="blue" />
      </div>

      {/* Registration Form */}
      {showForm && (
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 mb-6">
          <h2 className="font-semibold text-slate-800 mb-2 flex items-center gap-2">
            <UserPlus size={18} className="text-teal-600" /> Register New Patient
          </h2>
          <p className="text-xs text-slate-400 mb-5">Select the department based on the patient's condition/symptoms</p>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1.5 uppercase tracking-wide">Full Name</label>
                <input required type="text" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })}
                  placeholder="Patient full name"
                  className="w-full px-3 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 bg-slate-50" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1.5 uppercase tracking-wide">Patient ID</label>
                <input required type="text" value={form.patientId} onChange={e => setForm({ ...form, patientId: e.target.value })}
                  placeholder="e.g. PAT-010"
                  className="w-full px-3 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 bg-slate-50" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1.5 uppercase tracking-wide">Age</label>
                <input required type="number" value={form.age} onChange={e => setForm({ ...form, age: e.target.value })}
                  placeholder="Age in years"
                  className="w-full px-3 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 bg-slate-50" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1.5 uppercase tracking-wide">Gender</label>
                <select value={form.gender} onChange={e => setForm({ ...form, gender: e.target.value })}
                  className="w-full px-3 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 bg-slate-50">
                  <option>Male</option><option>Female</option><option>Other</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1.5 uppercase tracking-wide">Contact Number</label>
                <input type="text" value={form.contactNumber} onChange={e => setForm({ ...form, contactNumber: e.target.value })}
                  placeholder="Phone number"
                  className="w-full px-3 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 bg-slate-50" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1.5 uppercase tracking-wide">Address</label>
                <input type="text" value={form.address} onChange={e => setForm({ ...form, address: e.target.value })}
                  placeholder="Home address"
                  className="w-full px-3 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 bg-slate-50" />
              </div>
            </div>

            {/* Department selector with symptom hints */}
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-2 uppercase tracking-wide">
                Assign Department <span className="text-teal-600">(based on patient condition)</span>
              </label>
              <div className="grid grid-cols-3 md:grid-cols-4 gap-2">
                {DEPARTMENTS.map(dept => (
                  <button key={dept} type="button"
                    onClick={() => setForm({ ...form, department: dept })}
                    className={`p-3 rounded-xl border-2 text-left transition-all ${
                      form.department === dept
                        ? 'border-teal-500 bg-teal-50'
                        : 'border-slate-200 bg-white hover:border-slate-300'
                    }`}>
                    <p className={`text-xs font-semibold mb-1 ${form.department === dept ? 'text-teal-700' : 'text-slate-700'}`}>
                      {dept}
                    </p>
                    <p className="text-xs text-slate-400 leading-tight">{DEPT_SYMPTOMS[dept]}</p>
                  </button>
                ))}
              </div>
            </div>

            <div className="flex gap-3">
              <button type="submit" disabled={loading}
                className="flex items-center gap-2 px-5 py-2.5 bg-teal-600 text-white rounded-xl text-sm font-semibold hover:bg-teal-700 disabled:opacity-60">
                <Check size={15} /> {loading ? 'Registering...' : `Register & Assign to ${form.department}`}
              </button>
              <button type="button" onClick={() => setShowForm(false)}
                className="flex items-center gap-2 px-5 py-2.5 bg-slate-100 text-slate-600 rounded-xl text-sm hover:bg-slate-200">
                <X size={15} /> Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Patient List */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100 flex items-center gap-4">
          <div className="relative flex-1 max-w-sm">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input type="text" value={search} onChange={e => { setSearch(e.target.value); fetchPatients(e.target.value); }}
              placeholder="Search patients..."
              className="w-full pl-9 pr-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 bg-slate-50" />
          </div>
          <span className="text-sm text-slate-400">{patients.length} registered</span>
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
              {filtered.length === 0 ? (
                <tr><td colSpan={7} className="px-6 py-12 text-center text-slate-400">No patients found.</td></tr>
              ) : filtered.map(p => (
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
