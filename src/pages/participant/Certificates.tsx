import React, { useEffect, useState } from 'react';
import { Award, Download, Copy, CheckCircle, ExternalLink } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';
import type { CertificateWithCourse } from '../../lib/types';
import DashboardLayout from '../../components/layout/DashboardLayout';
import Spinner from '../../components/ui/Spinner';
import EmptyState from '../../components/ui/EmptyState';
import { formatDate } from '../../lib/utils';
import { useNavigate } from 'react-router-dom';

export default function Certificates() {
  const { profile, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [certs, setCerts] = useState<CertificateWithCourse[]>([]);
  const [copied, setCopied] = useState<string | null>(null);

  useEffect(() => {
    if (authLoading) return;
    if (!profile) { setLoading(false); return; }
    supabase
      .from('certificates')
      .select('*, courses(*)')
      .eq('user_id', profile.id)
      .order('issued_at', { ascending: false })
      .then(({ data }) => {
        setCerts((data ?? []) as CertificateWithCourse[]);
        setLoading(false);
      });
  }, [profile, authLoading]);

  const copyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopied(code);
    setTimeout(() => setCopied(null), 2000);
  };

  if (loading) return <DashboardLayout><div className="flex justify-center py-20"><Spinner size={36} /></div></DashboardLayout>;

  return (
    <DashboardLayout>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-900">Mis Certificados</h1>
        <p className="text-slate-500 text-sm mt-1">{certs.length} certificado{certs.length !== 1 ? 's' : ''} emitido{certs.length !== 1 ? 's' : ''}</p>
      </div>

      {certs.length === 0 ? (
        <EmptyState
          icon={<Award size={28} />}
          title="Aún no tienes certificados"
          description="Completa un curso con la asistencia requerida para obtener tu certificado de participación."
          action={<button onClick={() => navigate('/mis-cursos')} className="text-sm text-teal-700 font-medium hover:underline">Ver mis cursos →</button>}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {certs.map((cert) => (
            <CertificateCard
              key={cert.id}
              cert={cert}
              participantName={profile?.full_name ?? ''}
              copied={copied}
              onCopy={copyCode}
            />
          ))}
        </div>
      )}
    </DashboardLayout>
  );
}

function CertificateCard({
  cert,
  participantName,
  copied,
  onCopy,
}: {
  cert: CertificateWithCourse;
  participantName: string;
  copied: string | null;
  onCopy: (code: string) => void;
}) {
  return (
    <div className={`relative bg-white rounded-2xl border-2 shadow-sm overflow-hidden ${cert.is_valid ? 'border-amber-200' : 'border-slate-200'}`}>
      {/* Header strip */}
      <div className={`h-2 ${cert.is_valid ? 'bg-gradient-to-r from-amber-400 to-amber-600' : 'bg-slate-300'}`} />

      <div className="p-6">
        <div className="flex items-start gap-3 mb-4">
          <div className="w-10 h-10 bg-amber-50 rounded-xl flex items-center justify-center shrink-0">
            <Award size={20} className="text-amber-600" />
          </div>
          <div>
            <h3 className="font-semibold text-slate-900 text-sm leading-snug">{cert.courses?.title}</h3>
            <p className="text-xs text-slate-500 mt-0.5">{cert.courses?.instructor}</p>
          </div>
          {!cert.is_valid && (
            <span className="ml-auto text-xs bg-slate-100 text-slate-500 px-2 py-0.5 rounded-full">Anulado</span>
          )}
        </div>

        {/* Certificate preview */}
        <div className="bg-gradient-to-br from-slate-900 to-teal-900 rounded-xl p-4 mb-4 text-center">
          <p className="text-teal-300 text-xs mb-1 uppercase tracking-wider">Certificado de Participación</p>
          <p className="text-white font-bold">{participantName}</p>
          <p className="text-slate-300 text-xs mt-1">{cert.courses?.title}</p>
          <div className="mt-2 pt-2 border-t border-white/10">
            <p className="text-slate-400 text-xs">{formatDate(cert.issued_at)}</p>
            <p className="text-teal-400 text-xs mt-0.5">Asistencia: {cert.attendance_percentage}%</p>
          </div>
        </div>

        {/* Code */}
        <div className="bg-slate-50 rounded-lg p-3 mb-4">
          <p className="text-xs text-slate-500 mb-1">Código único de verificación</p>
          <div className="flex items-center gap-2">
            <code className="text-xs text-slate-700 flex-1 truncate">{cert.certificate_code}</code>
            <button
              onClick={() => onCopy(cert.certificate_code)}
              className="text-slate-400 hover:text-teal-700 transition-colors shrink-0"
              title="Copiar código"
            >
              {copied === cert.certificate_code ? <CheckCircle size={14} className="text-emerald-500" /> : <Copy size={14} />}
            </button>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-2">
          {cert.pdf_url ? (
            <a
              href={cert.pdf_url}
              download
              className="flex-1 flex items-center justify-center gap-1.5 bg-teal-700 hover:bg-teal-800 text-white text-xs font-medium px-3 py-2 rounded-lg transition-colors"
            >
              <Download size={13} /> Descargar PDF
            </a>
          ) : (
            <span className="flex-1 flex items-center justify-center gap-1.5 bg-slate-100 text-slate-400 text-xs font-medium px-3 py-2 rounded-lg cursor-not-allowed">
              <Download size={13} /> PDF no disponible
            </span>
          )}
          <a
            href={`/verificar?code=${cert.certificate_code}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-1.5 border border-slate-200 text-slate-600 hover:bg-slate-50 text-xs font-medium px-3 py-2 rounded-lg transition-colors"
          >
            <ExternalLink size={13} /> Verificar
          </a>
        </div>
      </div>
    </div>
  );
}
