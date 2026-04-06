import { useEffect, useState } from 'react';
import { UserPlus, Trash2, X, Check, UserCog, Shield, Stethoscope, Heart, FlaskConical, ClipboardList } from 'lucide-react';
import api from '../../api/axios';
import toast from 'react-hot-toast';

const DEPARTMENTS = ['General', 'Cardiology', 'Neurology', 'Radiology', 'Orthopedics', 'Pediatrics', 'Emergency', 'Oncology', 'Laboratory'];

const roleConfig = {
  admin:          { color: 'bg-purple-100 text-purple-700 border-purple-200',   icon: Shield,         label: 'Admin'          },
  doctor:         { color: 'bg-blue-100 text-blue-700 border-blue-200',         icon: Stethoscope,    label: 'Doctor'         },
  nurse:          { color: 'bg-emerald-100 text-emerald-700 border-emerald-200', icon: Heart,          label: 'Nurse'          },
  lab_technician: { color: 'bg-orange-100 text-orange-700 border-orange-200',   icon: FlaskConical,   label: 'Lab Technician' },
  receptionist:   { color: 'bg-teal-100 text-teal-700 border-teal-200',         icon: ClipboardList,  label: 'Receptionist'   },
};

const avatarColors = ['bg-blue-500', 'bg-purple-500', 'bg-emerald-500', 'bg-orange-500', 'bg-rose-500', 'bg-teal-500', 'bg-indigo-500'];

export default function UserManagement() {
  const [users, setUsers] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ name: '', email: '', password: '', role: 'doctor', department: 'General' });
  const [loading, setLoading] = useState(false);

  const fetchUsers = () => api.get('/users').then(r => setUsers(r.data)).catch(() => {});
  useEffect(() => { fetchUsers(); }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.post('/users', form);
      toast.success('User created successfully.');
      setShowForm(false);
      setForm({ name: '', email: '', password: '', role: 'doctor', department: 'General' });
      fetchUsers();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create user.');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id, name) => {
    if (!confirm(`Delete user "${name}"?`)) return;
    try {
      await api.delete(`/users/${id}`);
      toast.success('User deleted.');
      fetchUsers();
    } catch {
      toast.error('Failed to delete user.');
    }
  };

  const initials = (name) => name?.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase() || '?';

  // Role counts
  const roleCounts = users.reduce((acc, u) => { acc[u.role] = (acc[u.role] || 0) + 1; return acc; }, {});

  return (
    <div className="p-8 min-h-screen bg-slate-50">
      <div className="flex items-center justify-between mb-8">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <div className="w-8 h-8 rounded-lg bg-purple-100 flex items-center justify-center">
              <UserCog size={16} className="text-purple-600" />
            </div>
            <span className="text-sm font-medium text-purple-600">{users.length} staff members</span>
          </div>
          <h1 className="text-3xl font-bold text-slate-800">User Management</h1>
          <p className="text-slate-500 mt-1">Create, manage and assign roles to hospital staff</p>
        </div>
        <button onClick={() => setShowForm(!showForm)}
          className="flex items-center gap-2 px-5 py-2.5 bg-purple-600 text-white rounded-xl hover:bg-purple-700 transition-colors text-sm font-semibold shadow-sm shadow-purple-200">
          <UserPlus size={16} /> Add User
        </button>
      </div>

      {/* Role summary cards */}
      <div className="grid grid-cols-5 gap-4 mb-6">
        {Object.entries(roleConfig).map(([role, cfg]) => {
          const Icon = cfg.icon;
          return (
            <div key={role} className={`bg-white rounded-2xl p-4 border ${cfg.color.split(' ')[2] || 'border-slate-100'} shadow-sm`}>
              <div className="flex items-center gap-3">
                <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${cfg.color.split(' ')[0]} `}>
                  <Icon size={16} className={cfg.color.split(' ')[1]} />
                </div>
                <div>
                  <p className="text-2xl font-bold text-slate-800">{roleCounts[role] || 0}</p>
                  <p className="text-xs text-slate-500">{cfg.label}s</p>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {showForm && (
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 mb-6">
          <h2 className="font-semibold text-slate-800 mb-5 flex items-center gap-2">
            <UserPlus size={18} className="text-purple-600" /> Create New User
          </h2>
          <form onSubmit={handleCreate} className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {[
              { label: 'Full Name', key: 'name', type: 'text' },
              { label: 'Email', key: 'email', type: 'email' },
              { label: 'Password', key: 'password', type: 'password' },
            ].map(({ label, key, type }) => (
              <div key={key}>
                <label className="block text-xs font-semibold text-slate-600 mb-1.5 uppercase tracking-wide">{label}</label>
                <input type={type} required value={form[key]} onChange={e => setForm({ ...form, [key]: e.target.value })}
                  className="w-full px-3 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 bg-slate-50" />
              </div>
            ))}
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1.5 uppercase tracking-wide">Role</label>
              <select value={form.role} onChange={e => setForm({ ...form, role: e.target.value })}
                className="w-full px-3 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 bg-slate-50">
                <option value="doctor">Doctor</option>
                <option value="nurse">Nurse</option>
                <option value="lab_technician">Lab Technician</option>
                <option value="receptionist">Receptionist</option>
                <option value="admin">Admin</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1.5 uppercase tracking-wide">Department</label>
              <select value={form.department} onChange={e => setForm({ ...form, department: e.target.value })}
                className="w-full px-3 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 bg-slate-50">
                {DEPARTMENTS.map(d => <option key={d} value={d}>{d}</option>)}
              </select>
            </div>
            <div className="flex items-end gap-2">
              <button type="submit" disabled={loading}
                className="flex items-center gap-2 px-4 py-2.5 bg-purple-600 text-white rounded-xl text-sm font-semibold hover:bg-purple-700 disabled:opacity-60">
                <Check size={14} /> {loading ? 'Creating...' : 'Create'}
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
        <div className="px-6 py-4 border-b border-slate-100">
          <h2 className="font-semibold text-slate-800">All Staff ({users.length})</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-100">
                {['Staff Member', 'Email', 'Role', 'Department', 'Joined', 'Actions'].map(h => (
                  <th key={h} className="text-left px-6 py-3.5 text-xs font-semibold text-slate-500 uppercase tracking-wide">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {users.length === 0 ? (
                <tr><td colSpan={6} className="px-6 py-16 text-center text-slate-400">No users found.</td></tr>
              ) : users.map((u, i) => {
                const cfg = roleConfig[u.role] || roleConfig.doctor;
                const RoleIcon = cfg.icon;
                return (
                  <tr key={u.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className={`w-9 h-9 rounded-full ${avatarColors[i % avatarColors.length]} flex items-center justify-center text-white text-xs font-bold`}>
                          {initials(u.name)}
                        </div>
                        <span className="font-semibold text-slate-700">{u.name}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-slate-500">{u.email}</td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${cfg.color}`}>
                        <RoleIcon size={11} />
                        {cfg.label}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-slate-500">{u.department}</td>
                    <td className="px-6 py-4 text-slate-400 text-xs">{u.created_at ? new Date(u.created_at).toLocaleDateString() : '—'}</td>
                    <td className="px-6 py-4">
                      <button onClick={() => handleDelete(u.id, u.name)}
                        className="p-2 text-red-400 hover:bg-red-50 hover:text-red-600 rounded-lg transition-colors">
                        <Trash2 size={15} />
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
