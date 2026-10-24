import React from 'react';
import PublicHeader from './PublicHeader';

export default function PublicLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-slate-50">
      <PublicHeader />
      <main className="pt-16">{children}</main>
      <footer className="bg-slate-900 text-slate-400 py-10 mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex flex-col items-center md:items-start gap-1">
              <div className="flex items-center gap-2 text-white font-semibold">
                <div className="w-6 h-6 bg-teal-600 rounded flex items-center justify-center text-xs">L</div>
                Llave GT
              </div>
              <p className="text-xs text-slate-500">Un proyecto de Red Ciudadana</p>
            </div>
            <p className="text-sm text-slate-500">© {new Date().getFullYear()} Red Ciudadana. Todos los derechos reservados.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
