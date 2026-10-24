import { Lock, Eye, Shield, KeyRound, Monitor, FileText, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import PublicLayout from '../../components/layout/PublicLayout';
import Button from '../../components/ui/Button';

const sections = [
  {
    icon: Lock,
    title: 'Tus datos están protegidos',
    desc: 'Tu información se almacena en una base de datos con cifrado y políticas de seguridad a nivel de fila. Solo tú puedes ver y modificar tus datos personales. Ningún otro usuario tiene acceso a tu perfil.',
  },
  {
    icon: Eye,
    title: 'Controlas lo que compartes',
    desc: 'Cuando autorizas una aplicación conectada, decides qué información puede ver. Puedes revisar y revocar permisos en cualquier momento desde tu panel de seguridad.',
  },
  {
    icon: Shield,
    title: 'Verificación de identidad',
    desc: 'La verificación de tu correo electrónico asegura que la cuenta pertenece a una persona real con acceso a ese correo. No almacenamos documentos de identidad nacional.',
  },
  {
    icon: KeyRound,
    title: 'Contraseñas seguras',
    desc: 'Tu contraseña se almacena con cifrado unidireccional. Nunca podemos verla ni enviarla a nadie. Si la olvidas, puedes restablecerla mediante un enlace enviado a tu correo verificado.',
  },
  {
    icon: Monitor,
    title: 'Gestión de sesiones',
    desc: 'Puedes ver y cerrar sesiones activas en distintos dispositivos desde tu panel de seguridad. Si detectas actividad sospechosa, puedes cerrar todas las sesiones con un solo clic.',
  },
  {
    icon: FileText,
    title: 'Registro de actividad',
    desc: 'Mantenemos un historial de eventos de seguridad importantes en tu cuenta: inicios de sesión, cambios de contraseña, autorizaciones de aplicaciones y más. Puedes revisarlo cuando quieras.',
  },
];

export default function Privacy() {
  const navigate = useNavigate();
  return (
    <PublicLayout>
      <section className="bg-gradient-to-br from-slate-900 via-teal-900 to-slate-800 pt-24 pb-20">
        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-flex items-center gap-2 bg-teal-700/30 border border-teal-600/30 rounded-full px-4 py-1.5 text-teal-300 text-sm mb-6">
            <Shield size={14} />
            Tu seguridad
          </div>
          <h1 className="text-4xl sm:text-5xl font-extrabold text-white leading-tight">
            Privacidad y seguridad
          </h1>
          <p className="mt-6 text-lg text-slate-300 max-w-2xl mx-auto leading-relaxed">
            Cómo protegemos tu información y qué herramientas tienes para mantener tu cuenta segura.
          </p>
        </div>
      </section>

      <section className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          {sections.map(({ icon: Icon, title, desc }) => (
            <div key={title} className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm">
              <div className="w-10 h-10 bg-teal-50 rounded-xl flex items-center justify-center text-teal-600 mb-4">
                <Icon size={20} />
              </div>
              <h3 className="font-semibold text-slate-900 mb-2">{title}</h3>
              <p className="text-sm text-slate-500 leading-relaxed">{desc}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="bg-slate-50 border-y border-slate-100 py-16">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-2xl font-bold text-slate-900 mb-3">¿Tienes dudas de seguridad?</h2>
          <p className="text-slate-500 mb-6">
            Crea tu cuenta y explora las herramientas de seguridad disponibles.
          </p>
          <Button size="lg" variant="outline" onClick={() => navigate('/registro')} icon={<ArrowRight size={18} />}>
            Crear cuenta
          </Button>
        </div>
      </section>
    </PublicLayout>
  );
}
