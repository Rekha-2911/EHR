import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  LayoutDashboard, Users, FileText, Stethoscope,
  FlaskConical, LogOut, Activity, UserCog, Pill, Heart, Shield, ClipboardList
} from 'lucide-react';

const roleNavItems = {
  admin: [
    { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    { to: '/admin/users', icon: UserCog, label: 'User Management' },
    { to: '/admin/patients', icon: Users, label: 'Patients' },
    { to: '/admin/reports', icon: FileText, label: 'Reports' },
    { to: '/admin/logs', icon: Activity, label: 'Activity Logs' },
  ],
  doctor: [
    { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    { to: '/doctor/patients', icon: Users, label: 'My Patients' },
    { to: '/doctor/reports', icon: FileText, label: 'Medical Reports' },
    { to: '/doctor/diagnosis', icon: Stethoscope, label: 'Diagnosis' },
  ],
  nurse: [
    { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    { to: '/nurse/patients', icon: Users, label: 'Patients' },
    { to: '/nurse/medications', icon: Pill, label: 'Medications' },
  ],
  lab_technician: [
    { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    { to: '/lab/patients', icon: Users, label: 'Patients' },
    { to: '/lab/upload', icon: FlaskConical, label: 'Upload Reports' },
    { to: '/lab/reports', icon: FileText, label: 'My Uploads' },
  ],
  receptionist: [
    { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    { to: '/receptionist/patients', icon: Users, label: 'All Patients' },
  ],
};

const roleConfig = {
  admin:          { label: 'Administrator',   gradient: 'from-purple-500 to-purple-700',   accent: 'bg-purple-500',  dot: 'bg-purple-400'  },
  doctor:         { label: 'Doctor',          gradient: 'from-blue-500 to-blue-700',       accent: 'bg-blue-500',    dot: 'bg-blue-400'    },
  nurse:          { label: 'Nurse',           gradient: 'from-emerald-500 to-emerald-700', accent: 'bg-emerald-500', dot: 'bg-emerald-400' },
  lab_technician: { label: 'Lab Technician',  gradient: 'from-orange-500 to-orange-700',   accent: 'bg-orange-500',  dot: 'bg-orange-400'  },
  receptionist:   { label: 'Receptionist',    gradient: 'from-teal-500 to-teal-700',       accent: 'bg-teal-500',    dot: 'bg-teal-400'    },
};

export default function Sidebar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const navItems = roleNavItems[user?.role] || [];
  const cfg = roleConfig[user?.role] || roleConfig.doctor;

  const handleLogout = () => { logout(); navigate('/'); };

  const initials = user?.name?.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase() || 'U';

  return (
    <aside className="w-64 min-h-screen bg-slate-900 text-white flex flex-col shadow-2xl">
      {/* Logo */}
      <div className="p-5 border-b border-slate-700/60">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-blue-400 to-blue-600 rounded-xl flex items-center justify-center shadow-lg">
            <Heart size={18} className="text-white" />
          </div>
          <div>
            <p className="font-bold text-sm text-white leading-tight">Secure EHR</p>
            <p className="text-xs text-slate-400">Health Records System</p>
          </div>
        </div>
      </div>

      {/* User Profile Card */}
      <div className={`mx-3 mt-4 mb-2 rounded-xl bg-gradient-to-br ${cfg.gradient} p-4 shadow-lg`}>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center text-white font-bold text-sm border-2 border-white/30">
            {initials}
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-semibold text-sm text-white truncate">{user?.name}</p>
            <p className="text-xs text-white/70 truncate">{user?.department}</p>
          </div>
        </div>
        <div className="mt-3 flex items-center gap-1.5">
          <div className={`w-2 h-2 rounded-full ${cfg.dot} animate-pulse`} />
          <span className="text-xs text-white/80 font-medium">{cfg.label}</span>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-2 space-y-0.5">
        <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider px-3 py-2">Navigation</p>
        {navItems.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            end={to === '/dashboard'}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all duration-150 ${
                isActive
                  ? `${cfg.accent} text-white shadow-md`
                  : 'text-slate-400 hover:bg-slate-800 hover:text-white'
              }`
            }
          >
            {({ isActive }) => (
              <>
                <Icon size={17} className={isActive ? 'text-white' : 'text-slate-400'} />
                <span className="font-medium">{label}</span>
                {isActive && <div className="ml-auto w-1.5 h-1.5 rounded-full bg-white/60" />}
              </>
            )}
          </NavLink>
        ))}
      </nav>

      {/* Security Badge */}
      <div className="mx-3 mb-3 p-3 rounded-xl bg-slate-800/60 border border-slate-700/40">
        <div className="flex items-center gap-2">
          <Shield size={14} className="text-green-400" />
          <div>
            <p className="text-xs font-semibold text-green-400">Secured Session</p>
            <p className="text-xs text-slate-500">JWT + AES-256 + ABE</p>
          </div>
        </div>
      </div>

      {/* Logout */}
      <div className="px-3 pb-4 border-t border-slate-700/60 pt-3">
        <button onClick={handleLogout}
          className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-slate-400 hover:bg-red-500/10 hover:text-red-400 transition-all w-full group">
          <LogOut size={17} className="group-hover:translate-x-0.5 transition-transform" />
          <span className="font-medium">Sign Out</span>
        </button>
      </div>
    </aside>
  );
}
