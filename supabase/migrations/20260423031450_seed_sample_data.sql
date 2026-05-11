/*
  # Seed Sample Data for LlaveRed Ciudadana

  ## Summary
  Inserts demo courses, sessions, and sample data so the application
  has meaningful content from the start.

  ## Data Inserted
  - 4 sample courses (3 active, 1 draft) with various categories
  - 3-4 sessions per course
  - Categories: Gobernanza, Participación Ciudadana, Tecnología, Comunicación
*/

-- Sample courses
INSERT INTO courses (id, title, description, instructor, duration_hours, start_date, end_date, status, max_participants, attendance_threshold, category, modality, location, image_url) VALUES
(
  'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
  'Gobernanza Digital y Participación Ciudadana',
  'Este curso aborda los fundamentos de la gobernanza digital, herramientas de participación en línea, y cómo los ciudadanos pueden incidir en políticas públicas mediante plataformas tecnológicas. Incluye casos de estudio latinoamericanos y talleres prácticos.',
  'Dra. Mariana López',
  40,
  '2026-05-05',
  '2026-06-20',
  'active',
  30,
  75,
  'Gobernanza',
  'virtual',
  'En línea - Zoom',
  'https://images.pexels.com/photos/3184292/pexels-photo-3184292.jpeg'
),
(
  'b2c3d4e5-f6a7-8901-bcde-f12345678901',
  'Comunicación Política y Redes Sociales',
  'Aprende estrategias de comunicación política efectiva en entornos digitales. Estudia el uso responsable de redes sociales para la incidencia ciudadana, la narrativa política y la gestión de crisis comunicacionales.',
  'Lic. Carlos Mendoza',
  24,
  '2026-05-12',
  '2026-06-05',
  'active',
  40,
  75,
  'Comunicación',
  'hibrido',
  'Centro Comunitario Norte / En línea',
  'https://images.pexels.com/photos/3184465/pexels-photo-3184465.jpeg'
),
(
  'c3d4e5f6-a7b8-9012-cdef-123456789012',
  'Tecnología Cívica para Organizaciones Sociales',
  'Herramientas tecnológicas al servicio de organizaciones de la sociedad civil. Desde gestión de proyectos con herramientas gratuitas hasta automatización de procesos y gestión de datos para incidencia.',
  'Ing. Patricia Rojas',
  32,
  '2026-06-02',
  '2026-07-15',
  'active',
  25,
  80,
  'Tecnología',
  'presencial',
  'Sede Escuela Red Ciudadana - Sala A',
  'https://images.pexels.com/photos/3861969/pexels-photo-3861969.jpeg'
),
(
  'd4e5f6a7-b8c9-0123-defa-234567890123',
  'Presupuesto Participativo y Contraloría Social',
  'Mecanismos de presupuesto participativo, auditoría ciudadana y contraloría social. Cómo organizarse para monitorear el gasto público y exigir rendición de cuentas en gobiernos locales.',
  'Dr. Fernando Castillo',
  20,
  '2026-07-07',
  '2026-07-30',
  'draft',
  35,
  75,
  'Gobernanza',
  'presencial',
  'Sede Escuela Red Ciudadana - Sala B',
  'https://images.pexels.com/photos/3184339/pexels-photo-3184339.jpeg'
)
ON CONFLICT (id) DO NOTHING;

-- Sessions for course 1: Gobernanza Digital
INSERT INTO course_sessions (course_id, title, session_date, duration_minutes, description, is_mandatory, session_order) VALUES
('a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'Introducción a la Gobernanza Digital', '2026-05-05 09:00:00-06', 120, 'Conceptos fundamentales de gobernanza digital y democracia participativa.', true, 1),
('a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'Plataformas de Participación Ciudadana', '2026-05-12 09:00:00-06', 120, 'Revisión de plataformas como Decidim, Consul y otras herramientas de participación.', true, 2),
('a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'Casos de Estudio: América Latina', '2026-05-19 09:00:00-06', 120, 'Análisis de experiencias exitosas en la región.', true, 3),
('a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'Taller: Diseño de Estrategia Digital', '2026-05-26 09:00:00-06', 180, 'Taller práctico para diseñar una estrategia de participación digital.', true, 4),
('a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'Incidencia en Políticas Públicas', '2026-06-02 09:00:00-06', 120, 'Cómo incidir en políticas públicas usando herramientas digitales.', true, 5),
('a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'Evaluación y Presentación Final', '2026-06-20 09:00:00-06', 120, 'Presentación de proyectos finales y evaluación del curso.', true, 6)
ON CONFLICT DO NOTHING;

-- Sessions for course 2: Comunicación Política
INSERT INTO course_sessions (course_id, title, session_date, duration_minutes, description, is_mandatory, session_order) VALUES
('b2c3d4e5-f6a7-8901-bcde-f12345678901', 'Fundamentos de Comunicación Política', '2026-05-12 10:00:00-06', 90, 'Bases teóricas de la comunicación política contemporánea.', true, 1),
('b2c3d4e5-f6a7-8901-bcde-f12345678901', 'Narrativa y Storytelling Político', '2026-05-19 10:00:00-06', 90, 'Cómo construir narrativas efectivas para causas ciudadanas.', true, 2),
('b2c3d4e5-f6a7-8901-bcde-f12345678901', 'Redes Sociales para la Incidencia', '2026-05-26 10:00:00-06', 90, 'Uso estratégico de Twitter/X, Instagram, Facebook y TikTok.', true, 3),
('b2c3d4e5-f6a7-8901-bcde-f12345678901', 'Gestión de Crisis Comunicacional', '2026-06-02 10:00:00-06', 90, 'Estrategias para manejar crisis en el entorno digital.', true, 4),
('b2c3d4e5-f6a7-8901-bcde-f12345678901', 'Taller Final y Evaluación', '2026-06-05 10:00:00-06', 120, 'Presentación de campañas diseñadas por los participantes.', true, 5)
ON CONFLICT DO NOTHING;

-- Sessions for course 3: Tecnología Cívica
INSERT INTO course_sessions (course_id, title, session_date, duration_minutes, description, is_mandatory, session_order) VALUES
('c3d4e5f6-a7b8-9012-cdef-123456789012', 'Diagnóstico Tecnológico Organizacional', '2026-06-02 14:00:00-06', 120, 'Evaluación de las necesidades tecnológicas de tu organización.', true, 1),
('c3d4e5f6-a7b8-9012-cdef-123456789012', 'Herramientas de Gestión de Proyectos', '2026-06-09 14:00:00-06', 120, 'Trello, Notion, Airtable y otras herramientas gratuitas.', true, 2),
('c3d4e5f6-a7b8-9012-cdef-123456789012', 'Automatización con Zapier y Make', '2026-06-16 14:00:00-06', 120, 'Automatización de tareas repetitivas sin necesidad de programar.', true, 3),
('c3d4e5f6-a7b8-9012-cdef-123456789012', 'Gestión y Análisis de Datos', '2026-06-23 14:00:00-06', 120, 'Google Sheets avanzado y visualización de datos con Looker Studio.', true, 4),
('c3d4e5f6-a7b8-9012-cdef-123456789012', 'Seguridad Digital para Organizaciones', '2026-07-07 14:00:00-06', 90, 'Prácticas básicas de ciberseguridad para organizaciones civiles.', false, 5),
('c3d4e5f6-a7b8-9012-cdef-123456789012', 'Proyecto Final: Plan Tecnológico', '2026-07-15 14:00:00-06', 150, 'Presentación del plan tecnológico diseñado para su organización.', true, 6)
ON CONFLICT DO NOTHING;
