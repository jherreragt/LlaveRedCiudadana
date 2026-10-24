import { Navigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { PageSpinner } from '../ui/Spinner';

export function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, emailVerified, loading } = useAuth();
  if (loading) return <PageSpinner />;
  if (!user) return <Navigate to="/ingresar" replace />;
  if (!emailVerified) return <Navigate to="/verificar-correo" replace />;
  return <>{children}</>;
}

export function AdminRoute({ children }: { children: React.ReactNode }) {
  const { user, profile, emailVerified, loading } = useAuth();
  if (loading) return <PageSpinner />;
  if (!user) return <Navigate to="/ingresar" replace />;
  if (!emailVerified) return <Navigate to="/verificar-correo" replace />;
  if (profile && profile.role !== 'admin') {
    return <Navigate to="/dashboard" replace />;
  }
  return <>{children}</>;
}
