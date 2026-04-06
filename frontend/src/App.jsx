import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Layout from './components/Layout';

// Public pages
import Landing from './pages/Landing';
import Login from './pages/Login';
import Register from './pages/Register';

// Dashboard
import Dashboard from './pages/Dashboard';

// Admin pages
import UserManagement from './pages/admin/UserManagement';
import ActivityLogs from './pages/admin/ActivityLogs';
import AdminReports from './pages/admin/AdminReports';

// Doctor pages
import ReportsPage from './pages/doctor/ReportsPage';
import DiagnosisPage from './pages/doctor/DiagnosisPage';

// Nurse pages
import MedicationsPage from './pages/nurse/MedicationsPage';

// Lab pages
import UploadReport from './pages/lab/UploadReport';

// Shared pages
import PatientsPage from './pages/shared/PatientsPage';
import ReceptionistDashboard from './pages/dashboards/ReceptionistDashboard';
import PatientsListPage from './pages/receptionist/PatientsListPage';

function AppRoutes() {
  return (
    <Routes>
      {/* Public */}
      <Route path="/" element={<Landing />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />

      {/* Protected — all roles */}
      <Route path="/dashboard" element={
        <ProtectedRoute>
          <Layout><Dashboard /></Layout>
        </ProtectedRoute>
      } />

      {/* Admin routes */}
      <Route path="/admin/users" element={
        <ProtectedRoute roles={['admin']}>
          <Layout><UserManagement /></Layout>
        </ProtectedRoute>
      } />
      <Route path="/admin/patients" element={
        <ProtectedRoute roles={['admin']}>
          <Layout><PatientsPage canCreate={true} /></Layout>
        </ProtectedRoute>
      } />
      <Route path="/admin/reports" element={
        <ProtectedRoute roles={['admin']}>
          <Layout><AdminReports /></Layout>
        </ProtectedRoute>
      } />
      <Route path="/admin/logs" element={
        <ProtectedRoute roles={['admin']}>
          <Layout><ActivityLogs /></Layout>
        </ProtectedRoute>
      } />

      {/* Doctor routes */}
      <Route path="/doctor/patients" element={
        <ProtectedRoute roles={['doctor']}>
          <Layout><PatientsPage canCreate={false} /></Layout>
        </ProtectedRoute>
      } />
      <Route path="/doctor/reports" element={
        <ProtectedRoute roles={['doctor']}>
          <Layout><ReportsPage /></Layout>
        </ProtectedRoute>
      } />
      <Route path="/doctor/diagnosis" element={
        <ProtectedRoute roles={['doctor']}>
          <Layout><DiagnosisPage /></Layout>
        </ProtectedRoute>
      } />

      {/* Nurse routes */}
      <Route path="/nurse/patients" element={
        <ProtectedRoute roles={['nurse']}>
          <Layout><PatientsPage canCreate={false} /></Layout>
        </ProtectedRoute>
      } />
      <Route path="/nurse/medications" element={
        <ProtectedRoute roles={['nurse']}>
          <Layout><MedicationsPage /></Layout>
        </ProtectedRoute>
      } />

      {/* Lab Technician routes */}
      <Route path="/lab/patients" element={
        <ProtectedRoute roles={['lab_technician']}>
          <Layout><PatientsPage canCreate={true} /></Layout>
        </ProtectedRoute>
      } />
      <Route path="/lab/upload" element={
        <ProtectedRoute roles={['lab_technician']}>
          <Layout><UploadReport /></Layout>
        </ProtectedRoute>
      } />
      <Route path="/lab/reports" element={
        <ProtectedRoute roles={['lab_technician']}>
          <Layout><Dashboard /></Layout>
        </ProtectedRoute>
      } />

      {/* Receptionist routes */}
      <Route path="/receptionist/patients" element={
        <ProtectedRoute roles={['receptionist']}>
          <Layout><PatientsListPage /></Layout>
        </ProtectedRoute>
      } />

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Toaster position="top-right" toastOptions={{ duration: 3000 }} />
        <AppRoutes />
      </AuthProvider>
    </BrowserRouter>
  );
}
