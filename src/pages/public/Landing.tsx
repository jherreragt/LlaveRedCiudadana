import { useNavigate } from 'react-router-dom';
import { Shield, ArrowRight, KeyRound, UserCheck, Lock, Globe } from 'lucide-react';
import PublicLayout from '../../components/layout/PublicLayout';
import Button from '../../components/ui/Button';

const features = [
  {
    icon: KeyRound,
    title: 'Identidad Digital Única',
    desc: 'Una sola cuenta verifica tu identidad. Sin registros duplicados ni información dispersa entre plataformas.',
  },
  {
    icon: UserCheck,
    title: 'Perfil Verificable',
    desc: 'Mantén tu información personal siempre actualizada y disponible para las aplicaciones que autorices.',
  },
  {
    icon: Lock,
    title: 'Control y Seguridad',
    desc: 'Decides qué aplicaciones pueden acceder a tu información. Revoca permisos en cualquier momento.',
  },
  {
    icon: Globe,
    title: 'Red Ciudadana',
    desc: 'Forma parte del ecosistema de participación ciudadana de Red Ciudadana en Guatemala.',
  },
];

const steps = [
  { step: '1', title: 'Regístrate', desc: 'Crea tu cuenta con tu correo electrónico. No necesitas ningún documento.' },
  { step: '2', title: 'Verifica tu correo', desc: 'Confirma tu identidad con el enlace que enviamos a tu correo.' },
  { step: '3', title: 'Conecta y usa', desc: 'Autoriza aplicaciones conectadas y accede con tu identidad Llave GT.' },
];

export default function Landing() {
  const navigate = useNavigate();
  return (
    <PublicLayout>
      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-br from-slate-900 via-teal-900 to-slate-800 pt-24 pb-32">
        <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(circle at 20% 50%, rgba(13,148,136,0.4) 0%, transparent 50%), radial-gradient(circle at 80% 80%, rgba(13,148,136,0.2) 0%, transparent 40%)' }} />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-flex items-center gap-2 bg-teal-700/30 border border-teal-600/30 rounded-full px-4 py-1.5 text-teal-300 text-sm mb-6">
            <Shield size={14} />
            Identidad Digital
          </div>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-white leading-tight">
            Tu identidad digital
            <br />
            <span className="text-teal-400">para acceder a servicios y plataformas</span>
          </h1>
          <p className="mt-6 text-lg text-slate-300 max-w-2xl mx-auto leading-relaxed">
            Llave GT es la plataforma de identidad digital que te permite acceder a servicios y
            plataformas de manera sencilla y segura. Un proyecto de Red Ciudadana para Guatemala.
          </p>
          <div className="mt-10 flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" onClick={() => navigate('/registro')} icon={<ArrowRight size={18} />}>
              Crear mi cuenta
            </Button>
            <Button size="lg" variant="outline" onClick={() => navigate('/ingresar')}
              className="border-white/40 text-white hover:bg-white/10 hover:text-white">
              Ya tengo cuenta
            </Button>
          </div>
          <p className="mt-6 text-xs text-slate-400">
            Un proyecto de Red Ciudadana
          </p>
        </div>
      </section>

      {/* Features */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center mb-14">
          <h2 className="text-3xl font-bold text-slate-900">Una sola identidad, muchas posibilidades</h2>
          <p className="text-slate-500 mt-3 max-w-xl mx-auto">
            Diseñada para que accedas a plataformas y servicios con una cuenta verificable y segura.
          </p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map(({ icon: Icon, title, desc }) => (
            <div key={title} className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm hover:shadow-md transition-shadow">
              <div className="w-10 h-10 bg-teal-50 rounded-xl flex items-center justify-center text-teal-600 mb-4">
                <Icon size={20} />
              </div>
              <h3 className="font-semibold text-slate-900 mb-2">{title}</h3>
              <p className="text-sm text-slate-500 leading-relaxed">{desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* How it works */}
      <section className="bg-slate-50 border-y border-slate-100 py-20">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <h2 className="text-3xl font-bold text-slate-900">Cómo funciona</h2>
            <p className="text-slate-500 mt-3">Tres pasos para tener tu identidad digital</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {steps.map(({ step, title, desc }) => (
              <div key={step} className="text-center">
                <div className="w-14 h-14 bg-teal-700 rounded-2xl flex items-center justify-center text-white text-xl font-bold mx-auto mb-4 shadow-lg">
                  {step}
                </div>
                <h3 className="font-semibold text-slate-900 mb-2">{title}</h3>
                <p className="text-sm text-slate-500 leading-relaxed max-w-xs mx-auto">{desc}</p>
              </div>
            ))}
          </div>
          <div className="text-center mt-10">
            <Button variant="outline" onClick={() => navigate('/como-funciona')} icon={<ArrowRight size={16} />}>
              Ver más detalles
            </Button>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-teal-700 py-16">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold text-white mb-4">
            Únete a la red ciudadana
          </h2>
          <p className="text-teal-100 mb-8 max-w-xl mx-auto">
            Crea tu identidad digital y forma parte de la comunidad de Red Ciudadana en Guatemala.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              size="lg"
              onClick={() => navigate('/registro')}
              className="bg-white text-teal-700 hover:bg-teal-50"
            >
              Crear cuenta gratuita
            </Button>
            <Button
              size="lg"
              variant="ghost"
              onClick={() => navigate('/ingresar')}
              className="text-white hover:bg-teal-600"
            >
              Iniciar sesión
            </Button>
          </div>
        </div>
      </section>
    </PublicLayout>
  );
}
