/*
# Fase 1b — Lock down backup tables (_bak_p0_*)

## Summary
The Phase 0 backup tables (_bak_p0_*) were created without RLS and with full CRUD
grants to anon + authenticated. The Supabase security advisor flags these as ERROR
because they expose data through the Data API without any row-level protection.

## Changes
- Enable RLS on all 7 backup tables (no policies = completely locked)
- Revoke all privileges from anon and authenticated
- Grant SELECT only to service_role (for manual recovery if needed)

## Security
After this migration, the backup tables are completely inaccessible through the
Data API. Only the service_role (server-side, bypasses RLS) can read them.
*/

DO $$
DECLARE
  tbl text;
  backup_tables text[] := ARRAY[
    '_bak_p0_profiles', '_bak_p0_courses', '_bak_p0_course_sessions',
    '_bak_p0_enrollments', '_bak_p0_attendance_records',
    '_bak_p0_certificates', '_bak_p0_email_logs'
  ];
BEGIN
  FOREACH tbl IN ARRAY backup_tables LOOP
    -- Enable RLS (no policies = locked for anon + authenticated)
    EXECUTE format('ALTER TABLE public.%I ENABLE ROW LEVEL SECURITY', tbl);

    -- Revoke all from anon and authenticated
    EXECUTE format('REVOKE ALL ON public.%I FROM anon, authenticated', tbl);

    -- Grant SELECT to service_role for manual recovery
    EXECUTE format('GRANT SELECT ON public.%I TO service_role', tbl);
  END LOOP;
END $$;
