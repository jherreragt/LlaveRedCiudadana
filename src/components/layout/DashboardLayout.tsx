import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  Shield, LayoutDashboard, User, LogOut, Menu, X
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { getInitials } from '../../lib/utils';
import { clsx } from '../../lib/utils';

const navItems = [
  { to: '/dashboard', icon: LayoutDashboard, label: 'Inicio' },
  { to: '/perfil', icon: User, label: 'Mi Perfil' },
];

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { profile, signOut } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      {/* Top bar */}
      <header className="bg-white border-b border-slate-200 h-16 flex items-center px-4 sm:px-6 lg:px-8 gap-4 sticky top-0 z-30">
        <Link to="/" className="flex items-center gap-2 font-bold text-slate-900">
          <div className="w-7 h-7 bg-teal-700 rounded-lg flex items-center justify-center">
            <Shield size={14} className="text-white" />
          </div>
          <span className="hidden sm:block text-sm">Llave GT Ciudadana</span>
        </Link>

        {/* Desktop nav */}
        <nav className="hidden md:flex items-center gap-1 ml-4">
          {navItems.map(({ to, icon: Icon, label }) => {
            const active = location.pathname === to;
            return (
              <Link
                key={to}
                to={to}
                className={clsx(
                  'flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors',
                  active ? 'bg-teal-50 text-teal-700' : 'text-slate-600 hover:bg-slate-100'
                )}
              >
                <Icon size={16} />
                {label}
              </Link>
            );
          })}
        </nav>

        <div className="ml-auto flex items-center gap-3">
          {/* Avatar */}
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-teal-700 rounded-full flex items-center justify-center text-white text-xs font-bold">
              {getInitials(profile?.full_name || 'U')}
            </div>
            <span className="hidden md:block text-sm font-medium text-slate-700 max-w-[120px] truncate">
              {profile?.full_name}
            </span>
          </div>
          <button
            onClick={handleSignOut}
            className="hidden md:flex items-center gap-1.5 text-sm text-slate-500 hover:text-red-600 transition-colors"
          >
            <LogOut size={16} />
          </button>
          {/* Mobile hamburger */}
          <button
            className="md:hidden p-1.5 rounded-lg text-slate-600 hover:bg-slate-100"
            onClick={() => setMobileOpen(!mobileOpen)}
          >
            {mobileOpen ? <X size={18} /> : <Menu size={18} />}
          </button>
        </div>
      </header>

      {/* Mobile nav */}
      {mobileOpen && (
        <div className="md:hidden bg-white border-b border-slate-200 px-4 py-3 flex flex-col gap-1">
          {navItems.map(({ to, icon: Icon, label }) => (
            <Link
              key={to}
              to={to}
              onClick={() => setMobileOpen(false)}
              className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-slate-700 hover:bg-slate-100"
            >
              <Icon size={16} />
              {label}
            </Link>
          ))}
          <button
            onClick={handleSignOut}
            className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-red-600 hover:bg-red-50"
          >
            <LogOut size={16} />
            Cerrar sesión
          </button>
        </div>
      )}

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>
    </div>
  );
}
