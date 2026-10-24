import { Shield, KeyRound, UserCheck, Lock, Eye, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import PublicLayout from '../../components/layout/PublicLayout';
import Button from '../../components/ui/Button';

const principles = [
  {
    icon: KeyRound,
    title: 'Una sola identidad',
    desc: 'Una cuenta, un perfil verificado. Sin registros duplicados ni información dispersa entre plataformas.',
  },
  {
    icon: Lock,
    title: 'Tú controlas tus datos',
    desc: 'Decides qué información compartes y con qué aplicaciones. Puedes revocar el acceso en cualquier momento.',
  },
  {
    icon: Eye,
    title: 'Transparencia total',
    desc: 'Puedes ver en todo momento qué aplicaciones están conectadas y qué actividad ha ocurrido en tu cuenta.',
  },
  {
    icon: UserCheck,
    title: 'Verificación real',
    desc: 'Tu correo electrónico es verificado para garantizar que la identidad detrás de cada cuenta es legítima.',
  },
];

export default function WhatIs() {
  const navigate = useNavigate();
  return (
    <PublicLayout>
      <section className="bg-gradient-to-br from-slate-900 via-teal-900 to-slate-800 pt-24 pb-20">
        <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(circle at 20% 50%, rgba(13,148,136,0.4) 0%, transparent 50%), radial-gradient(circle at 80% 80%, rgba(13,148,136,0.2) 0%, transparent 40%)' }} />
        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-flex items-center gap-2 bg-teal-700/30 border border-teal-600/30 rounded-full px-4 py-1.5 text-teal-300 text-sm mb-6">
            <Shield size={14} />
            Identidad Digital
          </div>
          <h1 className="text-4xl sm:text-5xl font-extrabold text-white leading-tight">
            ¿Qué es Llave GT?
          </h1>
          <p className="mt-6 text-lg text-slate-300 max-w-2xl mx-auto leading-relaxed">
            Llave GT es tu identidad digital para acceder a servicios y plataformas de manera
            sencilla y segura. Un proyecto de Red Ciudadana para Guatemala.
          </p>
        </div>
      </section>

      <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="prose prose-slate max-w-none">
          <h2 className="text-2xl font-bold text-slate-900 mb-4">Una identidad, no un documento</h2>
          <p className="text-slate-600 leading-relaxed mb-6">
            Llave GT no es un documento de identidad nacional ni reemplaza tu DPI. Es una
            plataforma digital que te permite crear una cuenta verificada con tu correo
            electrónico, completar tu perfil personal y usar esa identidad para acceder a
            plataformas y servicios conectados dentro del ecosistema de Red Ciudadana.
          </p>
          <h2 className="text-2xl font-bold text-slate-900 mb-4">¿Para quién es?</h2>
          <p className="text-slate-600 leading-relaxed mb-6">
            Para cualquier persona que participe en iniciativas ciudadanas, programas educativos
            o plataformas de Red Ciudadana. Si necesitas una cuenta unificada que funcione en
            varios servicios sin tener que registrarte por separado en cada uno, Llave GT es para ti.
          </p>
        </div>
      </section>

      <section className="bg-slate-50 border-y border-slate-100 py-20">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <h2 className="text-3xl font-bold text-slate-900">Principios que nos definen</h2>
            <p className="text-slate-500 mt-3">Los valores detrás de tu identidad digital</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {principles.map(({ icon: Icon, title, desc }) => (
              <div key={title} className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm">
                <div className="w-10 h-10 bg-teal-50 rounded-xl flex items-center justify-center text-teal-600 mb-4">
                  <Icon size={20} />
                </div>
                <h3 className="font-semibold text-slate-900 mb-2">{title}</h3>
                <p className="text-sm text-slate-500 leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-teal-700 py-16">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold text-white mb-4">Crea tu identidad digital</h2>
          <p className="text-teal-100 mb-8 max-w-xl mx-auto">
            Empieza hoy mismo. Solo necesitas tu correo electrónico.
          </p>
          <Button
            size="lg"
            onClick={() => navigate('/registro')}
            className="bg-white text-teal-700 hover:bg-teal-50"
            icon={<ArrowRight size={18} />}
          >
            Crear cuenta gratuita
          </Button>
        </div>
      </section>
    </PublicLayout>
  );
}
