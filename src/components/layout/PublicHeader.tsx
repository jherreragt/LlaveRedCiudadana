import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Shield, Menu, X, LogIn, UserPlus, LayoutDashboard } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import Button from '../ui/Button';
import { clsx } from '../../lib/utils';

const publicNav = [
  { to: '/', label: 'Inicio' },
  { to: '/que-es', label: '¿Qué es Llave GT?' },
  { to: '/como-funciona', label: 'Cómo funciona' },
  { to: '/privacidad', label: 'Privacidad y seguridad' },
];

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
        <Link to="/" className="flex items-center gap-2.5 font-bold text-slate-900 text-lg" aria-label="Llave GT, inicio">
          <div className="w-8 h-8 bg-teal-700 rounded-lg flex items-center justify-center">
            <Shield size={16} className="text-white" />
          </div>
          <span>Llave GT</span>
        </Link>

        {/* Desktop nav */}
        <nav className="hidden md:flex items-center gap-5 text-sm font-medium text-slate-600" aria-label="Navegación pública">
          {publicNav.map((item) => (
            <Link
              key={item.to}
              to={item.to}
              className="hover:text-teal-700 transition-colors"
            >
              {item.label}
            </Link>
          ))}
          {profile?.role === 'admin' && (
            <Link to="/admin" className="text-teal-700 font-medium hover:text-teal-800 transition-colors">
              Panel Admin
            </Link>
          )}
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
                Mi identidad
              </Button>
              <Button variant="outline" size="sm" onClick={handleSignOut}>
                Cerrar sesión
              </Button>
            </>
          ) : (
            <>
              <Button variant="ghost" size="sm" icon={<LogIn size={16} />} onClick={() => navigate('/ingresar')}>
                Iniciar sesión
              </Button>
              <Button size="sm" icon={<UserPlus size={16} />} onClick={() => navigate('/registro')}>
                Crear cuenta
              </Button>
            </>
          )}
        </div>

        {/* Mobile menu toggle */}
        <button
          className="md:hidden p-2 rounded-lg text-slate-600 hover:bg-slate-100"
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label={menuOpen ? 'Cerrar menú' : 'Abrir menú'}
          aria-expanded={menuOpen}
        >
          {menuOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <div className="md:hidden border-t border-slate-100 bg-white px-4 py-3 flex flex-col gap-1">
          {publicNav.map((item) => (
            <Link
              key={item.to}
              to={item.to}
              onClick={() => setMenuOpen(false)}
              className={clsx(
                'px-3 py-2.5 rounded-lg text-sm text-slate-700 hover:bg-slate-100 transition-colors'
              )}
            >
              {item.label}
            </Link>
          ))}
          {profile?.role === 'admin' && (
            <Link
              to="/admin"
              onClick={() => setMenuOpen(false)}
              className="px-3 py-2.5 rounded-lg text-sm text-teal-700 font-medium hover:bg-teal-50"
            >
              Panel Admin
            </Link>
          )}
          <div className="border-t border-slate-100 mt-2 pt-2 flex flex-col gap-2">
            {user ? (
              <>
                <Button variant="ghost" size="sm" onClick={() => { navigate('/dashboard'); setMenuOpen(false); }}>Mi identidad</Button>
                <Button variant="outline" size="sm" onClick={handleSignOut}>Cerrar sesión</Button>
              </>
            ) : (
              <>
                <Button variant="ghost" size="sm" icon={<LogIn size={16} />} onClick={() => { navigate('/ingresar'); setMenuOpen(false); }}>Iniciar sesión</Button>
                <Button size="sm" icon={<UserPlus size={16} />} onClick={() => { navigate('/registro'); setMenuOpen(false); }}>Crear cuenta</Button>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
