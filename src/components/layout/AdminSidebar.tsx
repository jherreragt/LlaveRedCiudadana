import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  Shield, LayoutDashboard, Users, ChevronLeft, ChevronRight, LogOut
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { clsx } from '../../lib/utils';

const navItems = [
  { to: '/admin', icon: LayoutDashboard, label: 'Panel General' },
  { to: '/admin/usuarios', icon: Users, label: 'Usuarios' },
];

export default function AdminSidebar() {
  const [collapsed, setCollapsed] = useState(false);
  const { signOut, profile } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  return (
    <aside
      className={clsx(
        'flex flex-col bg-slate-900 text-white transition-all duration-300 shrink-0',
        collapsed ? 'w-16' : 'w-64'
      )}
    >
      {/* Logo */}
      <div className="h-16 flex items-center px-4 border-b border-slate-700">
        <Shield size={20} className="text-teal-400 shrink-0" />
        {!collapsed && (
          <span className="ml-2.5 font-bold text-sm">
            Llave GT <span className="text-teal-400">Admin</span>
          </span>
        )}
      </div>

      {/* Nav */}
      <nav className="flex-1 py-4 overflow-y-auto">
        {navItems.map(({ to, icon: Icon, label }) => {
          const active = location.pathname === to || (to !== '/admin' && location.pathname.startsWith(to));
          return (
            <Link
              key={to}
              to={to}
              className={clsx(
                'flex items-center gap-3 px-4 py-2.5 text-sm font-medium transition-colors duration-150',
                active
                  ? 'bg-teal-700/30 text-teal-300 border-r-2 border-teal-400'
                  : 'text-slate-400 hover:bg-slate-800 hover:text-white'
              )}
            >
              <Icon size={18} className="shrink-0" />
              {!collapsed && label}
            </Link>
          );
        })}
      </nav>

      {/* User + collapse */}
      <div className="border-t border-slate-700 p-4 space-y-2">
        {!collapsed && (
          <div className="text-xs">
            <p className="text-white font-medium truncate">{profile?.full_name || 'Admin'}</p>
            <p className="text-slate-500 truncate">{profile?.email}</p>
          </div>
        )}
        <button
          onClick={handleSignOut}
          className="flex items-center gap-2 text-slate-400 hover:text-red-400 text-xs transition-colors"
        >
          <LogOut size={15} />
          {!collapsed && 'Cerrar sesión'}
        </button>
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="flex items-center gap-2 text-slate-500 hover:text-white text-xs transition-colors"
        >
          {collapsed ? <ChevronRight size={15} /> : <ChevronLeft size={15} />}
          {!collapsed && 'Contraer'}
        </button>
      </div>
    </aside>
  );
}
