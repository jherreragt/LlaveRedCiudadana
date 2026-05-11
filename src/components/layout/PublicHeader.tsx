import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Shield, Menu, X, LogIn, UserPlus, LayoutDashboard } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import Button from '../ui/Button';

export default function PublicHeader() {
  const { user, profile, signOut } = useAuth();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  return (
    <header className="fixed top-0 inset-x-0 z-40 bg-white/95 backdrop-blur border-b border-slate-200 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2.5 font-bold text-slate-900 text-lg">
          <div className="w-8 h-8 bg-teal-700 rounded-lg flex items-center justify-center">
            <Shield size={16} className="text-white" />
          </div>
          <span>LlaveRed <span className="text-teal-700">Ciudadana</span></span>
        </Link>

        {/* Desktop nav */}
        <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-slate-600">
          <Link to="/cursos" className="hover:text-teal-700 transition-colors">Cursos</Link>
          <Link to="/verificar" className="hover:text-teal-700 transition-colors">Verificar Certificado</Link>
          {profile?.role === 'admin' || profile?.role === 'coordinator' ? (
            <Link to="/admin" className="hover:text-teal-700 transition-colors">Panel Admin</Link>
          ) : null}
        </nav>

        {/* Auth actions */}
        <div className="hidden md:flex items-center gap-2">
          {user ? (
            <>
              <Button
                variant="ghost"
                size="sm"
                icon={<LayoutDashboard size={16} />}
                onClick={() => navigate('/dashboard')}
              >
                Mi Portal
              </Button>
              <Button variant="outline" size="sm" onClick={handleSignOut}>
                Salir
              </Button>
            </>
          ) : (
            <>
              <Button variant="ghost" size="sm" icon={<LogIn size={16} />} onClick={() => navigate('/ingresar')}>
                Ingresar
              </Button>
              <Button size="sm" icon={<UserPlus size={16} />} onClick={() => navigate('/registro')}>
                Registrarse
              </Button>
            </>
          )}
        </div>

        {/* Mobile menu toggle */}
        <button
          className="md:hidden p-2 rounded-lg text-slate-600 hover:bg-slate-100"
          onClick={() => setMenuOpen(!menuOpen)}
        >
          {menuOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <div className="md:hidden border-t border-slate-100 bg-white px-4 py-3 flex flex-col gap-2">
          <Link to="/cursos" className="py-2 text-sm text-slate-700" onClick={() => setMenuOpen(false)}>Cursos</Link>
          <Link to="/verificar" className="py-2 text-sm text-slate-700" onClick={() => setMenuOpen(false)}>Verificar Certificado</Link>
          {user ? (
            <>
              <Button variant="ghost" size="sm" onClick={() => { navigate('/dashboard'); setMenuOpen(false); }}>Mi Portal</Button>
              <Button variant="outline" size="sm" onClick={handleSignOut}>Salir</Button>
            </>
          ) : (
            <>
              <Button variant="ghost" size="sm" onClick={() => { navigate('/ingresar'); setMenuOpen(false); }}>Ingresar</Button>
              <Button size="sm" onClick={() => { navigate('/registro'); setMenuOpen(false); }}>Registrarse</Button>
            </>
          )}
        </div>
      )}
    </header>
  );
}
