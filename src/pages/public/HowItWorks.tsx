import { UserPlus, MailCheck, LayoutGrid, ArrowRight, CheckCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import PublicLayout from '../../components/layout/PublicLayout';
import Button from '../../components/ui/Button';

const steps = [
  {
    icon: UserPlus,
    step: '1',
    title: 'Crea tu cuenta',
    desc: 'Regístrate con tu nombre completo y correo electrónico. No necesitas ningún documento de identidad.',
    details: ['Solo correo y nombre', 'Sin documentos nacionales', 'Contraseña segura'],
  },
  {
    icon: MailCheck,
    step: '2',
    title: 'Verifica tu correo',
    desc: 'Confirma tu correo electrónico con el enlace que te enviamos. Esto garantiza que la cuenta es tuya.',
    details: ['Enlace de confirmación', 'Reenvío disponible', 'Cuenta protegida'],
  },
  {
    icon: LayoutGrid,
    step: '3',
    title: 'Conecta aplicaciones',
    desc: 'Usa tu identidad Llave GT para acceder a plataformas conectadas. Tú decides qué autorizar y puedes revocar cuando quieras.',
    details: ['Acceso con un clic', 'Control total de permisos', 'Revocación inmediata'],
  },
];

export default function HowItWorks() {
  const navigate = useNavigate();
  return (
    <PublicLayout>
      <section className="bg-gradient-to-br from-slate-900 via-teal-900 to-slate-800 pt-24 pb-20">
        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl sm:text-5xl font-extrabold text-white leading-tight">
            Cómo funciona
          </h1>
          <p className="mt-6 text-lg text-slate-300 max-w-2xl mx-auto leading-relaxed">
            Tres pasos simples para tener tu identidad digital lista para usar.
          </p>
        </div>
      </section>

      <section className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="space-y-8">
          {steps.map(({ icon: Icon, step, title, desc, details }, idx) => (
            <div key={step} className="flex flex-col md:flex-row gap-6 items-start">
              <div className="flex items-center gap-4 md:flex-col md:items-center md:w-32 shrink-0">
                <div className="w-14 h-14 bg-teal-700 rounded-2xl flex items-center justify-center text-white shadow-lg">
                  <Icon size={24} />
                </div>
                <div className="text-4xl font-extrabold text-slate-200 md:mt-2">{step}</div>
              </div>
              <div className="flex-1 bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
                <h3 className="font-semibold text-slate-900 text-lg mb-2">{title}</h3>
                <p className="text-sm text-slate-500 leading-relaxed mb-4">{desc}</p>
                <div className="flex flex-wrap gap-2">
                  {details.map((d) => (
                    <span key={d} className="inline-flex items-center gap-1.5 text-xs bg-teal-50 text-teal-700 px-2.5 py-1 rounded-lg">
                      <CheckCircle size={12} /> {d}
                    </span>
                  ))}
                </div>
              </div>
              {idx < steps.length - 1 && (
                <div className="hidden md:block w-px h-8 bg-slate-200 absolute" />
              )}
            </div>
          ))}
        </div>
      </section>

      <section className="bg-slate-50 border-y border-slate-100 py-16">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-2xl font-bold text-slate-900 mb-3">¿Listo para empezar?</h2>
          <p className="text-slate-500 mb-6">El proceso toma menos de dos minutos.</p>
          <Button size="lg" onClick={() => navigate('/registro')} icon={<ArrowRight size={18} />}>
            Crear mi cuenta
          </Button>
        </div>
      </section>
    </PublicLayout>
  );
}
