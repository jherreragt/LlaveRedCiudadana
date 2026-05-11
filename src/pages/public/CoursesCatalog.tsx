import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, BookOpen, Clock, MapPin, Users } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import type { Course } from '../../lib/types';
import PublicLayout from '../../components/layout/PublicLayout';
import Input from '../../components/ui/Input';
import { statusBadge } from '../../components/ui/Badge';
import Spinner from '../../components/ui/Spinner';
import EmptyState from '../../components/ui/EmptyState';
import { modalityLabel, formatShortDate } from '../../lib/utils';

const CATEGORIES = ['Todas', 'Gobernanza', 'Comunicación', 'Tecnología', 'Participación Ciudadana'];
const MODALITIES = ['Todas', 'presencial', 'virtual', 'hibrido'];

export default function CoursesCatalog() {
  const navigate = useNavigate();
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('Todas');
  const [modality, setModality] = useState('Todas');

  useEffect(() => {
    supabase
      .from('courses')
      .select('*')
      .eq('status', 'active')
      .order('created_at', { ascending: false })
      .then(({ data }) => {
        setCourses(data ?? []);
        setLoading(false);
      });
  }, []);

  const filtered = courses.filter((c) => {
    const matchesSearch = search === '' || c.title.toLowerCase().includes(search.toLowerCase()) || c.description.toLowerCase().includes(search.toLowerCase());
    const matchesCat = category === 'Todas' || c.category === category;
    const matchesMod = modality === 'Todas' || c.modality === modality;
    return matchesSearch && matchesCat && matchesMod;
  });

  return (
    <PublicLayout>
      {/* Hero */}
      <div className="bg-gradient-to-r from-slate-900 to-teal-900 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-3xl sm:text-4xl font-bold text-white">Catálogo de Formación</h1>
          <p className="text-slate-300 mt-3 max-w-xl mx-auto">
            Encuentra el curso que impulse tu participación ciudadana y desarrollo profesional.
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {/* Filters */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-4 mb-8 flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <Input
              placeholder="Buscar por nombre o descripción..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              icon={<Search size={16} />}
            />
          </div>
          <div className="flex gap-3 flex-wrap">
            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                onClick={() => setCategory(cat)}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${category === cat ? 'bg-teal-700 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
              >
                {cat}
              </button>
            ))}
          </div>
          <div className="flex gap-2">
            {MODALITIES.map((m) => (
              <button
                key={m}
                onClick={() => setModality(m)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${modality === m ? 'bg-slate-800 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
              >
                {m === 'Todas' ? 'Todas' : modalityLabel(m)}
              </button>
            ))}
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center py-20"><Spinner size={36} /></div>
        ) : filtered.length === 0 ? (
          <EmptyState
            icon={<BookOpen size={28} />}
            title="No se encontraron cursos"
            description="Intenta con otros filtros o amplía tu búsqueda."
          />
        ) : (
          <>
            <p className="text-sm text-slate-500 mb-4">{filtered.length} curso{filtered.length !== 1 ? 's' : ''} encontrado{filtered.length !== 1 ? 's' : ''}</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {filtered.map((course) => (
                <CourseCard key={course.id} course={course} onClick={() => navigate(`/cursos/${course.id}`)} />
              ))}
            </div>
          </>
        )}
      </div>
    </PublicLayout>
  );
}

function CourseCard({ course, onClick }: { course: Course; onClick: () => void }) {
  return (
    <div
      onClick={onClick}
      className="bg-white rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-all duration-200 cursor-pointer overflow-hidden group"
    >
      <div className="h-44 overflow-hidden bg-slate-100">
        {course.image_url ? (
          <img src={course.image_url} alt={course.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-slate-300">
            <BookOpen size={40} />
          </div>
        )}
      </div>
      <div className="p-5">
        <div className="flex items-center gap-2 mb-2">
          {course.category && (
            <span className="text-xs font-medium text-teal-700 bg-teal-50 px-2 py-0.5 rounded-full">{course.category}</span>
          )}
          {statusBadge(course.modality)}
        </div>
        <h3 className="font-semibold text-slate-900 text-sm leading-snug mb-2 group-hover:text-teal-700 transition-colors">
          {course.title}
        </h3>
        <p className="text-xs text-slate-500 line-clamp-2 mb-3">{course.description}</p>
        <div className="flex flex-wrap gap-3 text-xs text-slate-500">
          <span className="flex items-center gap-1"><Clock size={12} />{course.duration_hours}h</span>
          {course.location && <span className="flex items-center gap-1"><MapPin size={12} />{course.location}</span>}
          {course.max_participants && <span className="flex items-center gap-1"><Users size={12} />Máx. {course.max_participants}</span>}
        </div>
        {(course.start_date || course.end_date) && (
          <div className="mt-3 pt-3 border-t border-slate-100 text-xs text-slate-500">
            {course.start_date && <span>Inicio: {formatShortDate(course.start_date)}</span>}
          </div>
        )}
      </div>
    </div>
  );
}
