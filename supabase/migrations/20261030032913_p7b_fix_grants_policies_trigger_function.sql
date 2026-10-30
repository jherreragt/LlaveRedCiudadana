/*
# Fix connected_apps SELECT policy, revoke anon grants, fix update_updated_at_column

## Problems
1. `connected_apps` has a SELECT policy `USING (true)` — any authenticated user
   can see ALL registered apps including client_ids. Should be admin-only.
2. Multiple tables have unnecessary `anon` grants (SELECT, INSERT, UPDATE, DELETE)
   when all policies are scoped to `authenticated` only.
3. `update_updated_at_column()` is SECURITY DEFINER and executable by anon —
   it's a trigger function that should be SECURITY INVOKER.

## Changes

### connected_apps SELECT policy
- Replace `USING (true)` with admin-only SELECT.
- Users see connected apps through `user_app_connections` which joins to `connected_apps`.
- The participant-facing page (`ConnectedApps.tsx`) queries `user_app_connections`
  with `select=*,connected_apps(*)` so it needs SELECT on `user_app_connections` (already owner-scoped)
  but does NOT need direct SELECT on `connected_apps`.

### Revoke anon grants
- Remove all grants from `anon` role on: profiles, connected_apps, user_app_connections,
  security_events, attendance_records, certificates, course_sessions, courses,
  enrollments, email_logs.
- These tables are only accessed by authenticated users. The `anon` grants are unnecessary
  and create risk if an `anon` policy is accidentally added in the future.

### update_updated_at_column
- Change from SECURITY DEFINER to SECURITY INVOKER (it's a trigger function).
- Revoke EXECUTE from PUBLIC and anon.
*/

-- =============================================================
-- Fix connected_apps SELECT policy: admin-only
-- =============================================================
DROP POLICY IF EXISTS "connected_apps_select_all" ON public.connected_apps;
DROP POLICY IF EXISTS "connected_apps_public_read" ON public.connected_apps;

-- Find and drop the existing SELECT policy with USING (true)
DO $$
DECLARE
  pol record;
BEGIN
  FOR pol IN
    SELECT policyname FROM pg_policies
    WHERE tablename = 'connected_apps'
    AND schemaname = 'public'
    AND cmd = 'SELECT'
  LOOP
    EXECUTE format('DROP POLICY IF EXISTS %I ON public.connected_apps', pol.policyname);
  END LOOP;
END $$;

CREATE POLICY "connected_apps_select_admin" ON public.connected_apps
FOR SELECT TO authenticated
USING (public.has_admin_role());

-- =============================================================
-- Revoke anon grants on all auth-required tables
-- =============================================================
REVOKE SELECT, INSERT, UPDATE, DELETE ON public.profiles FROM anon;
REVOKE SELECT, INSERT, UPDATE, DELETE ON public.connected_apps FROM anon;
REVOKE SELECT, INSERT, UPDATE, DELETE ON public.user_app_connections FROM anon;
REVOKE SELECT, INSERT, UPDATE, DELETE ON public.security_events FROM anon;
REVOKE SELECT, INSERT, UPDATE, DELETE ON public.attendance_records FROM anon;
REVOKE SELECT, INSERT, UPDATE, DELETE ON public.certificates FROM anon;
REVOKE SELECT, INSERT, UPDATE, DELETE ON public.course_sessions FROM anon;
REVOKE SELECT, INSERT, UPDATE, DELETE ON public.courses FROM anon;
REVOKE SELECT, INSERT, UPDATE, DELETE ON public.enrollments FROM anon;
REVOKE SELECT, INSERT, UPDATE, DELETE ON public.email_logs FROM anon;

-- =============================================================
-- Fix update_updated_at_column: SECURITY INVOKER, no PUBLIC execute
-- =============================================================
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS trigger
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path TO 'public', 'pg_temp'
AS $function$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$function$;

REVOKE EXECUTE ON FUNCTION public.update_updated_at_column() FROM PUBLIC, anon;
