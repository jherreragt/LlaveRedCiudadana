import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { ProtectedRoute, AdminRoute } from './components/auth/ProtectedRoute';

// Public pages
import Landing from './pages/public/Landing';
import WhatIs from './pages/public/WhatIs';
import HowItWorks from './pages/public/HowItWorks';
import Privacy from './pages/public/Privacy';
import Developers from './pages/public/Developers';

// Auth pages
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import ForgotPassword from './pages/auth/ForgotPassword';
import VerifyEmail from './pages/auth/VerifyEmail';
import ResetPassword from './pages/auth/ResetPassword';

// OAuth
import OAuthConsent from './pages/oauth/Consent';

// Demo client app
import DemoWelcome from './demo/pages/DemoWelcome';
import DemoCallback from './demo/pages/DemoCallback';

// Participant pages
import Dashboard from './pages/participant/Dashboard';
import Profile from './pages/participant/Profile';
import Security from './pages/participant/Security';
import ConnectedApps from './pages/participant/ConnectedApps';
import SecurityActivity from './pages/participant/SecurityActivity';

// Admin pages
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminUsers from './pages/admin/AdminUsers';
import AdminApps from './pages/admin/AdminApps';
import AdminAudit from './pages/admin/AdminAudit';
import AdminConfig from './pages/admin/AdminConfig';

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          {/* Public */}
          <Route path="/" element={<Landing />} />
          <Route path="/que-es" element={<WhatIs />} />
          <Route path="/como-funciona" element={<HowItWorks />} />
          <Route path="/privacidad" element={<Privacy />} />
          <Route path="/desarrolladores" element={<Developers />} />

          {/* Auth */}
          <Route path="/ingresar" element={<Login />} />
          <Route path="/registro" element={<Register />} />
          <Route path="/verificar-correo" element={<VerifyEmail />} />
          <Route path="/recuperar-contrasena" element={<ForgotPassword />} />
          <Route path="/nueva-contrasena" element={<ResetPassword />} />

          {/* OAuth */}
          <Route path="/oauth/consent" element={<OAuthConsent />} />

          {/* Demo client app (independent OIDC client) */}
          <Route path="/demo" element={<DemoWelcome />} />
          <Route path="/demo/callback" element={<DemoCallback />} />

          {/* Participant (protected) */}
          <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
          <Route path="/perfil" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
          <Route path="/seguridad" element={<ProtectedRoute><Security /></ProtectedRoute>} />
          <Route path="/aplicaciones" element={<ProtectedRoute><ConnectedApps /></ProtectedRoute>} />
          <Route path="/actividad" element={<ProtectedRoute><SecurityActivity /></ProtectedRoute>} />

          {/* Admin (admin only) */}
          <Route path="/admin" element={<AdminRoute><AdminDashboard /></AdminRoute>} />
          <Route path="/admin/usuarios" element={<AdminRoute><AdminUsers /></AdminRoute>} />
          <Route path="/admin/aplicaciones" element={<AdminRoute><AdminApps /></AdminRoute>} />
          <Route path="/admin/auditoria" element={<AdminRoute><AdminAudit /></AdminRoute>} />
          <Route path="/admin/configuracion" element={<AdminRoute><AdminConfig /></AdminRoute>} />

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}
