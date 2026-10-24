import { useNavigate } from 'react-router-dom';
import { Shield, ArrowRight, KeyRound, UserCheck, Building2, Globe } from 'lucide-react';
import PublicLayout from '../../components/layout/PublicLayout';
import Button from '../../components/ui/Button';

const features = [
  {
    icon: KeyRound,
    title: 'Identidad Digital Única',
    desc: 'Una sola cuenta verifica tu identidad institucional. Sin registros duplicados ni información dispersa.',
  },
  {
    icon: UserCheck,
    title: 'Perfil Verificable',
    desc: 'Mantén tu información personal, organización y cargo siempre actualizados y disponibles.',
  },
  {
    icon: Building2,
    title: 'Vínculo Institucional',
    desc: 'Conecta tu perfil con tu organización y fortalece tu presencia dentro de la red ciudadana.',
  },
  {
    icon: Globe,
    title: 'Red Ciudadana',
    desc: 'Forma parte de la comunidad de participación ciudadana en Guatemala y América Latina.',
  },
];

const stats = [
  { value: '500+', label: 'Ciudadanos registrados' },
  { value: '50+', label: 'Organizaciones vinculadas' },
  { value: '12', label: 'Departamentos alcanzados' },
  { value: '1', label: 'Identidad digital unificada' },
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
            Identidad Ciudadana Digital
          </div>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-white leading-tight">
            Tu identidad digital
            <br />
            <span className="text-teal-400">para la ciudadanía activa</span>
          </h1>
          <p className="mt-6 text-lg text-slate-300 max-w-2xl mx-auto leading-relaxed">
            Llave GT es la plataforma de identidad digital que unifica tu perfil ciudadano en un solo lugar. Verifica tu identidad, conecta con tu organización y participa en la red ciudadana.
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
        </div>
      </section>

      {/* Stats */}
      <section className="bg-white border-b border-slate-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 text-center">
            {stats.map((s) => (
              <div key={s.label}>
                <div className="text-3xl font-extrabold text-teal-700">{s.value}</div>
                <div className="text-sm text-slate-500 mt-1">{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center mb-14">
          <h2 className="text-3xl font-bold text-slate-900">Una sola identidad, muchas posibilidades</h2>
          <p className="text-slate-500 mt-3 max-w-xl mx-auto">
            Diseñada para fortalecer la participación ciudadana mediante una identidad digital verificable y segura.
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
            <p className="text-slate-500 mt-3">Tres pasos para tener tu identidad ciudadana digital</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { step: '1', title: 'Regístrate', desc: 'Crea tu cuenta con tu correo y completa tu perfil institucional.' },
              { step: '2', title: 'Verifica tu identidad', desc: 'Mantén tu información personal y organizacional siempre actualizada.' },
              { step: '3', title: 'Participa', desc: 'Usa tu identidad digital para formar parte de la red ciudadana.' },
            ].map(({ step, title, desc }) => (
              <div key={step} className="text-center">
                <div className="w-14 h-14 bg-teal-700 rounded-2xl flex items-center justify-center text-white text-xl font-bold mx-auto mb-4 shadow-lg">
                  {step}
                </div>
                <h3 className="font-semibold text-slate-900 mb-2">{title}</h3>
                <p className="text-sm text-slate-500 leading-relaxed max-w-xs mx-auto">{desc}</p>
              </div>
            ))}
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
            Crea tu identidad digital ciudadana y forma parte de la comunidad de participación en Guatemala.
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
