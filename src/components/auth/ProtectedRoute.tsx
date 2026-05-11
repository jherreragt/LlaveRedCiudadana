import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { PageSpinner } from '../ui/Spinner';

export function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  if (loading) return <PageSpinner />;
  if (!user) return <Navigate to="/ingresar" replace />;
  return <>{children}</>;
}

export function AdminRoute({ children }: { children: React.ReactNode }) {
  const { user, profile, loading } = useAuth();
  if (loading) return <PageSpinner />;
  if (!user) return <Navigate to="/ingresar" replace />;
  if (profile && profile.role !== 'admin' && profile.role !== 'coordinator') {
    return <Navigate to="/dashboard" replace />;
  }
  return <>{children}</>;
}
