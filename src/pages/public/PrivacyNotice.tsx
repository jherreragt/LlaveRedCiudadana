import { FileText, Shield, Mail, Database, Clock, Trash2, Eye, Lock } from 'lucide-react';
import PublicLayout from '../../components/layout/PublicLayout';

const sections = [
  {
    icon: Shield,
    title: '1. Responsable del tratamiento',
    body: [
      'Red Ciudadana es la organización responsable del tratamiento de los datos personales recopilados a través de Llave GT.',
      'Contacto: datos@redciudadana.org.gt',
    ],
  },
  {
    icon: Database,
    title: '2. Datos que recopilamos',
    body: [
      'Datos de identidad: nombre completo, correo electrónico verificado.',
      'Datos opcionales: teléfono, organización, cargo, país, ciudad.',
      'Datos técnicos: dirección IP, agente de usuario (navegador), marcas de tiempo de eventos de seguridad.',
      'No recopilamos documentos de identidad nacional (DPI, CUI, pasaporte) ni información biométrica.',
    ],
  },
  {
    icon: Eye,
    title: '3. Finalidad del tratamiento',
    body: [
      'Proporcionar una identidad digital verificable que permita acceder a plataformas y servicios conectados.',
      'Permitir la autenticación federada mediante el protocolo OAuth 2.1 / OpenID Connect.',
      'Mantener un registro de eventos de seguridad para protección de la cuenta.',
      'Gestionar la relación con aplicaciones autorizadas por el usuario.',
    ],
  },
  {
    icon: Lock,
    title: '4. Base legal y consentimiento',
    body: [
      'El tratamiento de datos se basa en el consentimiento explícito del usuario al momento de crear su cuenta.',
      'El usuario puede retirar su consentimiento en cualquier momento solicitando la eliminación de su cuenta.',
      'La autorización de aplicaciones conectadas requiere consentimiento explícito e informado para cada aplicación.',
    ],
  },
  {
    icon: FileText,
    title: '5. Compartición de datos',
    body: [
      'Los datos personales solo se comparten con aplicaciones que el usuario ha autorizado explícitamente.',
      'El usuario decide en cada caso qué información compartir y puede revocar el acceso cuando lo desee.',
      'Las aplicaciones externas reciben exclusivamente los datos correspondientes a los scopes autorizados (openid, email, profile).',
      'No vendemos ni cedemos datos personales a terceros con fines comerciales.',
    ],
  },
  {
    icon: Clock,
    title: '6. Conservación de datos',
    body: [
      'Los datos de la cuenta se conservan mientras el usuario mantenga su cuenta activa.',
      'Los eventos de seguridad se conservan por 12 meses con fines de auditoría, luego se eliminan automáticamente.',
      'El usuario puede solicitar la eliminación de su cuenta y todos sus datos asociados en cualquier momento.',
      'Tras la eliminación, los datos se remueven de la base de datos dentro de un plazo máximo de 30 días.',
    ],
  },
  {
    icon: Shield,
    title: '7. Medidas de seguridad',
    body: [
      'Cifrado de datos en tránsito mediante TLS/HTTPS.',
      'Contraseñas almacenadas con cifrado unidireccional (bcrypt).',
      'Políticas de seguridad a nivel de fila (RLS) en la base de datos.',
      'Firma asimétrica de tokens JWT (RS256) validable mediante JWKS público.',
      'Tokens de clientes OAuth restringidos por políticas RLS restrictivas que impiden el acceso a tablas internas.',
    ],
  },
  {
    icon: Mail,
    title: '8. Ejercicio de derechos',
    body: [
      'El usuario puede ejercer en cualquier momento sus derechos de acceso, rectificación, supresión y portabilidad.',
      'Para ejercer estos derechos, contactar a: datos@redciudadana.org.gt',
      'Las solicitudes se atienden en un plazo máximo de 15 días hábiles.',
    ],
  },
  {
    icon: Trash2,
    title: '9. Eliminación de cuenta',
    body: [
      'El usuario puede eliminar su cuenta desde su perfil o solicitándolo por correo.',
      'La eliminación incluye: datos personales, conexiones de aplicaciones, eventos de seguridad asociados.',
      'Los registros de auditoría del sistema pueden conservarse de forma anónima por requisitos legales.',
    ],
  },
];

export default function PrivacyNotice() {
  return (
    <PublicLayout>
      <section className="bg-gradient-to-br from-slate-900 via-teal-900 to-slate-800 pt-24 pb-20">
        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-flex items-center gap-2 bg-teal-700/30 border border-teal-600/30 rounded-full px-4 py-1.5 text-teal-300 text-sm mb-6">
            <FileText size={14} />
            Documento legal
          </div>
          <h1 className="text-4xl sm:text-5xl font-extrabold text-white leading-tight">
            Aviso de privacidad
          </h1>
          <p className="mt-6 text-lg text-slate-300 max-w-2xl mx-auto leading-relaxed">
            Llave GT — Un proyecto de Red Ciudadana
          </p>
        </div>
      </section>

      <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-8 mb-8">
          <p className="text-sm text-slate-600 leading-relaxed">
            El presente aviso de privacidad describe cómo Red Ciudadana recopila, usa, protege y
            comparte los datos personales de los usuarios de Llave GT, plataforma de identidad digital.
            Al crear una cuenta, el usuario acepta el tratamiento de sus datos conforme a este aviso.
          </p>
          <p className="text-xs text-slate-400 mt-4">
            Última actualización: octubre 2026
          </p>
        </div>

        <div className="space-y-6">
          {sections.map(({ icon: Icon, title, body }) => (
            <div key={title} className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 bg-teal-50 rounded-xl flex items-center justify-center text-teal-600 shrink-0">
                  <Icon size={20} />
                </div>
                <div className="flex-1">
                  <h2 className="font-semibold text-slate-900 mb-3">{title}</h2>
                  <ul className="space-y-2">
                    {body.map((line, idx) => (
                      <li key={idx} className="text-sm text-slate-600 leading-relaxed">
                        {line}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="bg-slate-50 rounded-2xl border border-slate-200 p-6 mt-8">
          <h2 className="font-semibold text-slate-900 mb-3">Contacto</h2>
          <p className="text-sm text-slate-600 leading-relaxed">
            Para cualquier consulta sobre este aviso de privacidad o el tratamiento de datos personales,
            contactar a: <strong>datos@redciudadana.org.gt</strong>
          </p>
        </div>
      </section>
    </PublicLayout>
  );
}
