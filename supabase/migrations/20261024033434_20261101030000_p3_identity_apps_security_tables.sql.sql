/*
# Fase 3 — Tablas de aplicaciones conectadas, eventos de seguridad y auditoría

## Descripción general
Esta migración añade tres tablas nuevas para soportar la funcionalidad de
identidad digital de Llave GT:

1. `connected_apps` — Catálogo de aplicaciones/plataformas autorizadas que
   pueden integrarse con Llave GT para autenticación de identidad.
2. `user_app_connections` — Vínculos entre usuarios y aplicaciones conectadas,
   con estado (pendiente, autorizado, revocado) y permisos otorgados.
3. `security_events` — Registro de eventos de seguridad por usuario (inicio de
   sesión, cambio de contraseña, cierre de sesiones, cambios de correo, etc.)
   para alimentar la página "Actividad de seguridad".

## Tablas nuevas

### connected_apps
- `id` (uuid, PK)
- `name` (text, not null) — Nombre de la aplicación
- `description` (text) — Descripción de la aplicación
- `logo_url` (text) — URL del logo
- `client_id` (text, unique, not null) — Identificador único del cliente
- `status` (text, default 'active') — 'active' | 'inactive'
- `created_at` (timestamptz, default now())
- `created_by` (uuid, references profiles) — Admin que registró la app

### user_app_connections
- `id` (uuid, PK)
- `user_id` (uuid, not null, default auth.uid(), references profiles)
- `app_id` (uuid, not null, references connected_apps)
- `status` (text, default 'pending') — 'pending' | 'authorized' | 'revoked'
- `scopes` (text, default '') — Permisos otorgados separados por coma
- `authorized_at` (timestamptz) — Fecha de autorización
- `revoked_at` (timestamptz) — Fecha de revocación
- `created_at` (timestamptz, default now())

### security_events
- `id` (uuid, PK)
- `user_id` (uuid, not null, default auth.uid(), references profiles)
- `event_type` (text, not null) — Tipo de evento (login, logout, password_change, etc.)
- `description` (text) — Descripción del evento
- `ip_address` (text) — IP desde donde se realizó la acción
- `user_agent` (text) — User agent del navegador/dispositivo
- `created_at` (timestamptz, default now())

## Seguridad (RLS)

### connected_apps
- RLS habilitada
- SELECT para authenticated (todos pueden ver el catálogo de apps)
- INSERT/UPDATE/DELETE solo para admins (vía has_admin_role('llave_gt'))

### user_app_connections
- RLS habilitada
- CRUD para authenticated — solo sobre las conexiones propias (user_id = auth.uid())

### security_events
- RLS habilitada
- INSERT para authenticated — solo para eventos propios (user_id = auth.uid())
- SELECT para authenticated — solo eventos propios (user_id = auth.uid())
- DELETE no permitido para usuarios (solo service_role/admin puede purgar)
- UPDATE no permitido (los eventos de seguridad son inmutables)

## Notas
- Los grants son a nivel de columnas donde aplica para restringir escritura.
- Las políticas usan auth.uid() para verificación de propiedad.
- Las funciones has_admin_role() ya existen en la base de datos.
*/

-- ============================================================
-- Tabla: connected_apps
-- ============================================================
CREATE TABLE IF NOT EXISTS connected_apps (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text DEFAULT '',
  logo_url text DEFAULT '',
  client_id text UNIQUE NOT NULL,
  status text NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive')),
  created_at timestamptz NOT NULL DEFAULT now(),
  created_by uuid REFERENCES profiles(id) ON DELETE SET NULL
);

ALTER TABLE connected_apps ENABLE ROW LEVEL SECURITY;

-- Grants: authenticated can SELECT; only llave_gt admins can write
GRANT SELECT ON connected_apps TO authenticated;
GRANT INSERT, UPDATE, DELETE ON connected_apps TO authenticated;

-- Policies for connected_apps
DROP POLICY IF EXISTS "select_connected_apps" ON connected_apps;
CREATE POLICY "select_connected_apps"
  ON connected_apps FOR SELECT
  TO authenticated USING (true);

DROP POLICY IF EXISTS "insert_connected_apps_admin" ON connected_apps;
CREATE POLICY "insert_connected_apps_admin"
  ON connected_apps FOR INSERT
  TO authenticated WITH CHECK (has_admin_role('llave_gt'));

DROP POLICY IF EXISTS "update_connected_apps_admin" ON connected_apps;
CREATE POLICY "update_connected_apps_admin"
  ON connected_apps FOR UPDATE
  TO authenticated USING (has_admin_role('llave_gt'))
  WITH CHECK (has_admin_role('llave_gt'));

DROP POLICY IF EXISTS "delete_connected_apps_admin" ON connected_apps;
CREATE POLICY "delete_connected_apps_admin"
  ON connected_apps FOR DELETE
  TO authenticated USING (has_admin_role('llave_gt'));

-- ============================================================
-- Tabla: user_app_connections
-- ============================================================
CREATE TABLE IF NOT EXISTS user_app_connections (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES profiles(id) ON DELETE CASCADE,
  app_id uuid NOT NULL REFERENCES connected_apps(id) ON DELETE CASCADE,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'authorized', 'revoked')),
  scopes text DEFAULT '',
  authorized_at timestamptz,
  revoked_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE user_app_connections ENABLE ROW LEVEL SECURITY;

-- Grants: authenticated can manage their own connections
GRANT SELECT, INSERT, UPDATE, DELETE ON user_app_connections TO authenticated;

-- Policies for user_app_connections (owner-scoped)
DROP POLICY IF EXISTS "select_own_connections" ON user_app_connections;
CREATE POLICY "select_own_connections"
  ON user_app_connections FOR SELECT
  TO authenticated USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "insert_own_connections" ON user_app_connections;
CREATE POLICY "insert_own_connections"
  ON user_app_connections FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "update_own_connections" ON user_app_connections;
CREATE POLICY "update_own_connections"
  ON user_app_connections FOR UPDATE
  TO authenticated USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "delete_own_connections" ON user_app_connections;
CREATE POLICY "delete_own_connections"
  ON user_app_connections FOR DELETE
  TO authenticated USING (auth.uid() = user_id);

-- ============================================================
-- Tabla: security_events
-- ============================================================
CREATE TABLE IF NOT EXISTS security_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES profiles(id) ON DELETE CASCADE,
  event_type text NOT NULL,
  description text DEFAULT '',
  ip_address text DEFAULT '',
  user_agent text DEFAULT '',
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE security_events ENABLE ROW LEVEL SECURITY;

-- Grants: authenticated can SELECT and INSERT their own; no UPDATE/DELETE
GRANT SELECT, INSERT ON security_events TO authenticated;

-- Policies for security_events (owner-scoped, insert-only)
DROP POLICY IF EXISTS "select_own_security_events" ON security_events;
CREATE POLICY "select_own_security_events"
  ON security_events FOR SELECT
  TO authenticated USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "insert_own_security_events" ON security_events;
CREATE POLICY "insert_own_security_events"
  ON security_events FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = user_id);

-- ============================================================
-- Índices
-- ============================================================
CREATE INDEX IF NOT EXISTS idx_user_app_connections_user_id ON user_app_connections(user_id);
CREATE INDEX IF NOT EXISTS idx_security_events_user_id ON security_events(user_id);
CREATE INDEX IF NOT EXISTS idx_security_events_created_at ON security_events(created_at DESC);

-- ============================================================
-- Función para registrar eventos de seguridad (callable by authenticated)
-- ============================================================
CREATE OR REPLACE FUNCTION log_security_event(
  p_user_id uuid,
  p_event_type text,
  p_description text DEFAULT '',
  p_ip_address text DEFAULT '',
  p_user_agent text DEFAULT ''
) RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF auth.uid() != p_user_id THEN
    RAISE EXCEPTION 'No autorizado: solo puedes registrar tus propios eventos';
  END IF;
  INSERT INTO security_events (user_id, event_type, description, ip_address, user_agent)
  VALUES (p_user_id, p_event_type, p_description, p_ip_address, p_user_agent);
END;
$$;

REVOKE EXECUTE ON FUNCTION log_security_event(uuid, text, text, text, text) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION log_security_event(uuid, text, text, text, text) TO authenticated;

-- ============================================================
-- Seed: aplicaciones conectadas iniciales (ejemplos)
-- ============================================================
INSERT INTO connected_apps (name, description, client_id, status) VALUES
  ('Escuela Red Ciudadana', 'Plataforma educativa para cursos y certificaciones ciudadanas.', 'escuela-red-ciudadana', 'active'),
  ('Consultas Ciudadanas', 'Sistema de participación y consulta ciudadana digital.', 'consultas-ciudadanas-gt', 'active')
ON CONFLICT (client_id) DO NOTHING;