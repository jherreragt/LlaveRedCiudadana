import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { ProtectedRoute, AdminRoute } from './components/auth/ProtectedRoute';

// Public pages
import Landing from './pages/public/Landing';
import CoursesCatalog from './pages/public/CoursesCatalog';
import CourseDetail from './pages/public/CourseDetail';
import CertificateVerification from './pages/public/CertificateVerification';

// Auth pages
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import ForgotPassword from './pages/auth/ForgotPassword';

// Participant pages
import Dashboard from './pages/participant/Dashboard';
import Profile from './pages/participant/Profile';
import MyCourses from './pages/participant/MyCourses';
import Certificates from './pages/participant/Certificates';

// Admin pages
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminUsers from './pages/admin/AdminUsers';
import AdminCourses from './pages/admin/AdminCourses';
import AdminSessions from './pages/admin/AdminSessions';
import AdminEnrollments from './pages/admin/AdminEnrollments';
import AdminAttendance from './pages/admin/AdminAttendance';
import AdminCertificates from './pages/admin/AdminCertificates';

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          {/* Public */}
          <Route path="/" element={<Landing />} />
          <Route path="/cursos" element={<CoursesCatalog />} />
          <Route path="/cursos/:id" element={<CourseDetail />} />
          <Route path="/verificar" element={<CertificateVerification />} />

          {/* Auth */}
          <Route path="/ingresar" element={<Login />} />
          <Route path="/registro" element={<Register />} />
          <Route path="/recuperar-contrasena" element={<ForgotPassword />} />

          {/* Participant (protected) */}
          <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
          <Route path="/perfil" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
          <Route path="/mis-cursos" element={<ProtectedRoute><MyCourses /></ProtectedRoute>} />
          <Route path="/mis-certificados" element={<ProtectedRoute><Certificates /></ProtectedRoute>} />

          {/* Admin (admin/coordinator only) */}
          <Route path="/admin" element={<AdminRoute><AdminDashboard /></AdminRoute>} />
          <Route path="/admin/usuarios" element={<AdminRoute><AdminUsers /></AdminRoute>} />
          <Route path="/admin/cursos" element={<AdminRoute><AdminCourses /></AdminRoute>} />
          <Route path="/admin/sesiones" element={<AdminRoute><AdminSessions /></AdminRoute>} />
          <Route path="/admin/inscripciones" element={<AdminRoute><AdminEnrollments /></AdminRoute>} />
          <Route path="/admin/asistencia" element={<AdminRoute><AdminAttendance /></AdminRoute>} />
          <Route path="/admin/certificados" element={<AdminRoute><AdminCertificates /></AdminRoute>} />

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}
