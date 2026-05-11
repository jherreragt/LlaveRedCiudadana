import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Shield, BookOpen, Award, Users, CheckCircle, ArrowRight } from 'lucide-react';
import PublicLayout from '../../components/layout/PublicLayout';
import Button from '../../components/ui/Button';

const features = [
  {
    icon: Shield,
    title: 'Identidad Institucional Única',
    desc: 'Una sola cuenta conecta todos tus procesos de formación. Sin registros repetidos ni información dispersa.',
  },
  {
    icon: BookOpen,
    title: 'Catálogo de Formación',
    desc: 'Accede a cursos presenciales, virtuales e híbridos diseñados para fortalecer la participación ciudadana.',
  },
  {
    icon: CheckCircle,
    title: 'Seguimiento de Asistencia',
    desc: 'Monitorea tu asistencia en tiempo real y conoce tu porcentaje para obtener certificados.',
  },
  {
    icon: Award,
    title: 'Certificados Verificables',
    desc: 'Descarga tus certificados de participación con código único que puede verificarse en línea.',
  },
];

const stats = [
  { value: '500+', label: 'Participantes activos' },
  { value: '24', label: 'Cursos disponibles' },
  { value: '12', label: 'Países alcanzados' },
  { value: '1,200+', label: 'Certificados emitidos' },
];

export default function Landing() {
  const navigate = useNavigate();
  return (
    <PublicLayout>
      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-br from-slate-900 via-teal-900 to-slate-800 pt-24 pb-32">
        <div className="absolute inset-0 bg-[url('https://images.pexels.com/photos/3184292/pexels-photo-3184292.jpeg')] bg-cover bg-center opacity-10" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-flex items-center gap-2 bg-teal-700/30 border border-teal-600/30 rounded-full px-4 py-1.5 text-teal-300 text-sm mb-6">
            <Shield size={14} />
            Escuela Red Ciudadana
          </div>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-white leading-tight">
            Tu identidad digital
            <br />
            <span className="text-teal-400">para la ciudadanía activa</span>
          </h1>
          <p className="mt-6 text-lg text-slate-300 max-w-2xl mx-auto leading-relaxed">
            LlaveRed Ciudadana es la plataforma institucional de la Escuela Red Ciudadana. Gestiona tu formación, asistencia y certificados desde un solo lugar.
          </p>
          <div className="mt-10 flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" onClick={() => navigate('/registro')} icon={<ArrowRight size={18} />}>
              Crear mi cuenta
            </Button>
            <Button size="lg" variant="outline" onClick={() => navigate('/cursos')}
              className="border-white/40 text-white hover:bg-white/10 hover:text-white">
              Ver cursos disponibles
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
          <h2 className="text-3xl font-bold text-slate-900">Todo lo que necesitas en un solo portal</h2>
          <p className="text-slate-500 mt-3 max-w-xl mx-auto">
            Diseñado para fortalecer la formación y la participación ciudadana en América Latina.
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

      {/* CTA */}
      <section className="bg-teal-700 py-16">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold text-white mb-4">
            Únete a la red ciudadana
          </h2>
          <p className="text-teal-100 mb-8 max-w-xl mx-auto">
            Regístrate gratuitamente y accede al catálogo de formación de la Escuela Red Ciudadana.
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
              onClick={() => navigate('/cursos')}
              className="text-white hover:bg-teal-600"
            >
              Explorar cursos
            </Button>
          </div>
        </div>
      </section>

      {/* Course preview */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-2xl font-bold text-slate-900">Cursos destacados</h2>
            <p className="text-slate-500 text-sm mt-1">Formación para la participación activa</p>
          </div>
          <Button variant="outline" size="sm" onClick={() => navigate('/cursos')} icon={<ArrowRight size={16} />}>
            Ver todos
          </Button>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {[
            {
              title: 'Gobernanza Digital y Participación Ciudadana',
              cat: 'Gobernanza',
              hours: 40,
              modality: 'Virtual',
              img: 'https://images.pexels.com/photos/3184292/pexels-photo-3184292.jpeg',
            },
            {
              title: 'Comunicación Política y Redes Sociales',
              cat: 'Comunicación',
              hours: 24,
              modality: 'Híbrido',
              img: 'https://images.pexels.com/photos/3184465/pexels-photo-3184465.jpeg',
            },
            {
              title: 'Tecnología Cívica para Organizaciones',
              cat: 'Tecnología',
              hours: 32,
              modality: 'Presencial',
              img: 'https://images.pexels.com/photos/3861969/pexels-photo-3861969.jpeg',
            },
          ].map((c) => (
            <div key={c.title} className="bg-white rounded-2xl overflow-hidden border border-slate-100 shadow-sm hover:shadow-md transition-shadow group">
              <div className="h-40 overflow-hidden">
                <img src={c.img} alt={c.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
              </div>
              <div className="p-5">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-xs font-medium text-teal-700 bg-teal-50 px-2 py-0.5 rounded-full">{c.cat}</span>
                  <span className="text-xs text-slate-400">{c.modality}</span>
                </div>
                <h3 className="font-semibold text-slate-900 text-sm leading-snug">{c.title}</h3>
                <p className="text-xs text-slate-500 mt-1">{c.hours} horas</p>
                <button
                  onClick={() => navigate('/cursos')}
                  className="mt-3 text-xs text-teal-700 font-medium hover:underline flex items-center gap-1"
                >
                  Ver detalles <ArrowRight size={12} />
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>
    </PublicLayout>
  );
}
