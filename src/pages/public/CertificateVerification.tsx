import React, { useState } from 'react';
import { Search, CheckCircle, XCircle, Award, Shield } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import type { Certificate, Course, Profile } from '../../lib/types';
import PublicLayout from '../../components/layout/PublicLayout';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import { formatDate } from '../../lib/utils';

interface VerifyResult {
  certificate: Certificate;
  course: Course;
  profile: Profile;
}

export default function CertificateVerification() {
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<VerifyResult | null | 'not_found'>(null);

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!code.trim()) return;
    setLoading(true);
    setResult(null);

    const { data: cert } = await supabase
      .from('certificates')
      .select('*')
      .eq('certificate_code', code.trim())
      .maybeSingle();

    if (!cert) {
      setResult('not_found');
      setLoading(false);
      return;
    }

    const [{ data: course }, { data: profile }] = await Promise.all([
      supabase.from('courses').select('*').eq('id', cert.course_id).maybeSingle(),
      supabase.from('profiles').select('*').eq('id', cert.user_id).maybeSingle(),
    ]);

    if (course && profile) {
      setResult({ certificate: cert, course, profile });
    } else {
      setResult('not_found');
    }
    setLoading(false);
  };

  return (
    <PublicLayout>
      <div className="min-h-[70vh] flex items-center justify-center px-4 py-16">
        <div className="w-full max-w-lg">
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-teal-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Shield size={28} className="text-teal-700" />
            </div>
            <h1 className="text-2xl font-bold text-slate-900">Verificar Certificado</h1>
            <p className="text-slate-500 text-sm mt-2 max-w-sm mx-auto">
              Ingresa el código único del certificado para verificar su autenticidad.
            </p>
          </div>

          <div className="bg-white rounded-2xl border border-slate-100 shadow-lg p-8">
            <form onSubmit={handleVerify} className="space-y-4">
              <Input
                label="Código del certificado"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                placeholder="Ej: a1b2c3d4-e5f6-7890-abcd-ef1234567890"
                required
                icon={<Search size={16} />}
              />
              <Button type="submit" className="w-full" loading={loading} size="lg">
                Verificar certificado
              </Button>
            </form>

            {/* Not found */}
            {result === 'not_found' && (
              <div className="mt-6 bg-red-50 border border-red-200 rounded-xl p-5 text-center">
                <XCircle size={28} className="text-red-500 mx-auto mb-2" />
                <h3 className="font-semibold text-red-800">Certificado no encontrado</h3>
                <p className="text-sm text-red-600 mt-1">
                  El código ingresado no corresponde a ningún certificado válido en nuestro sistema.
                </p>
              </div>
            )}

            {/* Valid result */}
            {result && result !== 'not_found' && (
              <div className={`mt-6 rounded-xl p-5 border ${result.certificate.is_valid ? 'bg-emerald-50 border-emerald-200' : 'bg-amber-50 border-amber-200'}`}>
                <div className="flex items-center gap-2 mb-3">
                  {result.certificate.is_valid ? (
                    <CheckCircle size={22} className="text-emerald-600" />
                  ) : (
                    <XCircle size={22} className="text-amber-600" />
                  )}
                  <span className={`font-semibold ${result.certificate.is_valid ? 'text-emerald-800' : 'text-amber-800'}`}>
                    {result.certificate.is_valid ? 'Certificado válido' : 'Certificado anulado'}
                  </span>
                </div>
                <div className="space-y-2 text-sm">
                  <div className="flex items-start gap-2">
                    <Award size={15} className="text-slate-400 mt-0.5 shrink-0" />
                    <div>
                      <p className="text-xs text-slate-500">Participante</p>
                      <p className="font-medium text-slate-900">{result.profile.full_name}</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-2">
                    <Award size={15} className="text-slate-400 mt-0.5 shrink-0" />
                    <div>
                      <p className="text-xs text-slate-500">Curso</p>
                      <p className="font-medium text-slate-900">{result.course.title}</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-2">
                    <Award size={15} className="text-slate-400 mt-0.5 shrink-0" />
                    <div>
                      <p className="text-xs text-slate-500">Fecha de emisión</p>
                      <p className="font-medium text-slate-900">{formatDate(result.certificate.issued_at)}</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-2">
                    <Award size={15} className="text-slate-400 mt-0.5 shrink-0" />
                    <div>
                      <p className="text-xs text-slate-500">Asistencia</p>
                      <p className="font-medium text-slate-900">{result.certificate.attendance_percentage}%</p>
                    </div>
                  </div>
                  <div className="mt-3 pt-3 border-t border-slate-200">
                    <p className="text-xs text-slate-400">Código: {result.certificate.certificate_code}</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </PublicLayout>
  );
}
