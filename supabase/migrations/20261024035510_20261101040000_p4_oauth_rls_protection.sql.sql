/*
# Fase 4 — Protección RLS contra tokens de clientes OAuth

## Descripción general
Cuando el servidor OAuth 2.1 de Supabase está habilitado, las aplicaciones externas
pueden obtener access tokens JWT que incluyen el claim `client_id`. Estos tokens
tienen `role: authenticated`, por lo que pasan las mismas políticas RLS que los
tokens de usuarios normales.

Los scopes OIDC (openid, email, profile, phone) controlan qué datos van en el
ID token y en el UserInfo endpoint, pero NO controlan el acceso a las tablas
de la base de datos. Sin protección adicional, una aplicación externa con un
token OAuth podría consultar datos privados de Llave GT.

## Cambios

### 1. Políticas RESTRICTIVE en tablas internas
Se añaden políticas `AS RESTRICTIVE` en las tablas internas de Llave GT
(`profiles`, `connected_apps`, `user_app_connections`, `security_events`)
que bloquean el acceso cuando el token proviene de un cliente OAuth
(`client_id IS NOT NULL` en `auth.jwt()`).

Las políticas RESTRICTIVE se combinan con AND lógico frente a las políticas
normales (USING), por lo que aunque una política normal permita el acceso,
la restrictiva lo bloquea si el token es de un cliente OAuth.

### 2. Función helper: is_oauth_client_token()
Devuelve true si el JWT actual contiene un claim `client_id` no nulo,
indicando que el token fue emitido a una aplicación externa vía OAuth.

## Tablas afectadas
- profiles — bloquea acceso desde tokens OAuth
- connected_apps — bloquea acceso desde tokens OAuth
- user_app_connections — bloquea acceso desde tokens OAuth
- security_events — bloquea acceso desde tokens OAuth

## Seguridad
- Los usuarios normales (sin client_id en su JWT) no se ven afectados.
- Las aplicaciones externas que reciben tokens OAuth solo pueden usar el
  UserInfo endpoint y los claims del ID token, no pueden consultar tablas.
- El service_role sigue teniendo acceso completo (bypassa RLS).
*/

-- ============================================================
-- Función helper: detectar tokens de clientes OAuth
-- ============================================================
CREATE OR REPLACE FUNCTION is_oauth_client_token()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT (auth.jwt() ->> 'client_id') IS NOT NULL;
$$;

REVOKE EXECUTE ON FUNCTION is_oauth_client_token() FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION is_oauth_client_token() TO authenticated;

-- ============================================================
-- Políticas RESTRICTIVE: bloquear acceso desde tokens OAuth
-- ============================================================

-- profiles: bloquear OAuth
DROP POLICY IF EXISTS "restrict_oauth_profiles" ON profiles;
CREATE POLICY "restrict_oauth_profiles"
  ON profiles AS RESTRICTIVE
  FOR ALL TO authenticated
  USING (NOT is_oauth_client_token())
  WITH CHECK (NOT is_oauth_client_token());

-- connected_apps: bloquear OAuth
DROP POLICY IF EXISTS "restrict_oauth_connected_apps" ON connected_apps;
CREATE POLICY "restrict_oauth_connected_apps"
  ON connected_apps AS RESTRICTIVE
  FOR ALL TO authenticated
  USING (NOT is_oauth_client_token())
  WITH CHECK (NOT is_oauth_client_token());

-- user_app_connections: bloquear OAuth
DROP POLICY IF EXISTS "restrict_oauth_user_app_connections" ON user_app_connections;
CREATE POLICY "restrict_oauth_user_app_connections"
  ON user_app_connections AS RESTRICTIVE
  FOR ALL TO authenticated
  USING (NOT is_oauth_client_token())
  WITH CHECK (NOT is_oauth_client_token());

-- security_events: bloquear OAuth
DROP POLICY IF EXISTS "restrict_oauth_security_events" ON security_events;
CREATE POLICY "restrict_oauth_security_events"
  ON security_events AS RESTRICTIVE
  FOR ALL TO authenticated
  USING (NOT is_oauth_client_token())
  WITH CHECK (NOT is_oauth_client_token());

-- ============================================================
-- Bloquear también tablas educativas residuales
-- (courses, course_sessions, enrollments, attendance_records,
--  certificates, email_logs) por si acaso siguen existiendo
-- ============================================================
DO $$
DECLARE
  tbl text;
BEGIN
  FOR tbl IN
    SELECT unnest(ARRAY['courses', 'course_sessions', 'enrollments', 'attendance_records', 'certificates', 'email_logs'])
  LOOP
    BEGIN
      EXECUTE format('DROP POLICY IF EXISTS "restrict_oauth_%s" ON %s;', tbl, tbl);
      EXECUTE format(
        'CREATE POLICY "restrict_oauth_%s" ON %s AS RESTRICTIVE FOR ALL TO authenticated USING (NOT is_oauth_client_token()) WITH CHECK (NOT is_oauth_client_token())',
        tbl, tbl
      );
    EXCEPTION WHEN OTHERS THEN
      -- Tabla no existe, saltar
      NULL;
    END;
  END LOOP;
END $$;