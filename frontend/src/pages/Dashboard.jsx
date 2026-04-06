import { useAuth } from '../context/AuthContext';
import AdminDashboard from './dashboards/AdminDashboard';
import DoctorDashboard from './dashboards/DoctorDashboard';
import NurseDashboard from './dashboards/NurseDashboard';
import LabDashboard from './dashboards/LabDashboard';
import ReceptionistDashboard from './dashboards/ReceptionistDashboard';

export default function Dashboard() {
  const { user } = useAuth();

  if (user?.role === 'admin') return <AdminDashboard />;
  if (user?.role === 'doctor') return <DoctorDashboard />;
  if (user?.role === 'nurse') return <NurseDashboard />;
  if (user?.role === 'lab_technician') return <LabDashboard />;
  if (user?.role === 'receptionist') return <ReceptionistDashboard />;

  return <div className="p-8 text-slate-500">Unknown role.</div>;
}
