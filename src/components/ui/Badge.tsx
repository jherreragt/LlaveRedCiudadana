import React from 'react';
import { clsx } from '../../lib/utils';

type Color = 'teal' | 'blue' | 'amber' | 'red' | 'green' | 'gray' | 'slate';

interface BadgeProps {
  children: React.ReactNode;
  color?: Color;
  className?: string;
}

const colors: Record<Color, string> = {
  teal: 'bg-teal-100 text-teal-800',
  blue: 'bg-blue-100 text-blue-800',
  amber: 'bg-amber-100 text-amber-800',
  red: 'bg-red-100 text-red-800',
  green: 'bg-emerald-100 text-emerald-800',
  gray: 'bg-gray-100 text-gray-700',
  slate: 'bg-slate-100 text-slate-700',
};

export default function Badge({ children, color = 'teal', className }: BadgeProps) {
  return (
    <span
      className={clsx(
        'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium',
        colors[color],
        className
      )}
    >
      {children}
    </span>
  );
}

export function statusBadge(status: string) {
  const map: Record<string, { label: string; color: Color }> = {
    active: { label: 'Activo', color: 'green' },
    inactive: { label: 'Inactivo', color: 'gray' },
    pending: { label: 'Pendiente', color: 'amber' },
    authorized: { label: 'Autorizado', color: 'green' },
    revoked: { label: 'Revocado', color: 'red' },
    participant: { label: 'Participante', color: 'teal' },
    coordinator: { label: 'Coordinador', color: 'blue' },
    admin: { label: 'Administrador', color: 'slate' },
  };
  const cfg = map[status] ?? { label: status, color: 'gray' as Color };
  return <Badge color={cfg.color}>{cfg.label}</Badge>;
}
