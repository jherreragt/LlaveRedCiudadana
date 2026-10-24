export function formatDate(date: string | null | undefined): string {
  if (!date) return '—';
  return new Date(date).toLocaleDateString('es-GT', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

export function formatDateTime(date: string | null | undefined): string {
  if (!date) return '—';
  return new Date(date).toLocaleString('es-GT', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function formatShortDate(date: string | null | undefined): string {
  if (!date) return '—';
  return new Date(date).toLocaleDateString('es-GT', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

export function getInitials(name: string): string {
  return name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((n) => n[0].toUpperCase())
    .join('');
}

export function clsx(...classes: (string | boolean | undefined | null)[]): string {
  return classes.filter(Boolean).join(' ');
}

export function downloadCSV(data: Record<string, unknown>[], filename: string): void {
  if (!data.length) return;
  const headers = Object.keys(data[0]);
  const rows = data.map((row) => headers.map((h) => JSON.stringify(row[h] ?? '')).join(','));
  const csv = [headers.join(','), ...rows].join('\n');
  const blob = new Blob([csv], { type: 'text/csv' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}
