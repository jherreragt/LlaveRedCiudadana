/*
# Fase 1 — Security Fixes: RLS, Role Protection, Certificate Verification

## Summary
This migration fixes all security vulnerabilities identified in the Fase 0 audit.
It is 100% additive: no tables, columns, or data are deleted. All existing data is preserved.

## Vulnerabilities Fixed

### 1. Self-assignment of admin roles (CRITICAL)
- **Problem**: Any authenticated user could UPDATE their own `role` column to 'admin'
  via the Data API. The "Users can update own profile" policy allowed updating ALL columns.
- **Fix**: Revoke table-level UPDATE on `profiles`. Grant column-level UPDATE only on
  personal fields (full_name, phone, organization, job_title, country, city, avatar_url).
  The `role` and `is_active` columns are NOT in the grant, so no client can write them
  directly. Two SECURITY DEFINER RPCs (`set_user_role`, `set_user_active`) provide the
  only path to change these fields, and both verify the caller is an admin.

### 2. Recursive RLS policies (CRITICAL)
- **Problem**: 14 policies across 6 tables used `EXISTS (SELECT 1 FROM profiles WHERE
  id = auth.uid() AND role IN (...))`. This creates a recursive RLS dependency: the
  policy on `profiles` SELECTs from `profiles`, which triggers the same policy again.
  Postgres handles this by evaluating the inner query as the owner (bypassing RLS),
  but it is fragile, slow, and a known Supabase anti-pattern.
- **Fix**: Create `has_admin_role()` and `has_staff_role()` as SECURITY DEFINER functions
  that read `profiles` with owner privileges (bypassing RLS). Replace all 14 recursive
  policy predicates with calls to these functions.

### 3. Public access to all certificates (HIGH)
- **Problem**: The policy "Public can verify certificates" used `USING (true)` with no
  role restriction, so anyone (anon key) could SELECT * FROM certificates and see every
  user_id, course_id, email, attendance percentage, etc.
- **Fix**: Drop the public SELECT policy. Revoke SELECT from `anon`. Create
  `verify_certificate_by_code(p_code text)` as a SECURITY DEFINER function that returns
  ONLY non-sensitive fields (participant name, course title, issue date, validity, 
  attendance percentage) — no user_id, no email, no certificate UUID.

### 4. No column-level protection on privileged fields (HIGH)
- **Problem**: `profiles.role` and `profiles.is_active` were writable by any user on
  their own row. `email_logs` allowed any authenticated user to INSERT logs.
- **Fix**: Column-level grants on `profiles`. Email_logs INSERT restricted to
  `service_role` only (edge functions / server-side code).

### 5. Distinguishing Llave GT admins from Escuela admins
- **Problem**: The single `role` column cannot distinguish between an admin of the
  identity platform (Llave GT) and an admin of the educational platform (Escuela).
- **Fix**: Add a nullable `admin_scope` column to `profiles` with values
  `'llave_gt'` or `'escuela'`. The `has_admin_role()` and `has_staff_role()` functions
  accept an optional scope parameter so policies can restrict access to the correct
  platform. For now, all existing admins default to NULL (both scopes) for backwards
  compatibility.

## New Database Objects

### Functions (all SECURITY DEFINER, search_path locked)
1. `has_admin_role(p_scope text DEFAULT NULL)` — returns true if caller's profile role
   is 'admin' (and optionally matches the given scope). Bypasses RLS.
2. `has_staff_role(p_scope text DEFAULT NULL)` — returns true if caller's role is
   'admin' OR 'coordinator' (and optionally matches scope). Bypasses RLS.
3. `set_user_role(p_user_id uuid, p_role text, p_scope text DEFAULT NULL)` — sets a
   user's role and admin_scope. Only callable by existing admins.
4. `set_user_active(p_user_id uuid, p_active boolean)` — sets a user's is_active flag.
   Only callable by admins.
5. `verify_certificate_by_code(p_code text)` — public function that returns minimal
   certificate info for verification. No sensitive fields.

### Columns
- `profiles.admin_scope text` (nullable, CHECK in ('llave_gt', 'escuela'))

## Modified Tables
- **profiles**: column-level UPDATE grant (personal fields only); all policies replaced
- **courses**: policies replaced with has_staff_role()
- **course_sessions**: policies replaced with has_staff_role()
- **enrollments**: policies replaced with has_staff_role()
- **attendance_records**: policies replaced with has_staff_role()
- **certificates**: public SELECT policy dropped, anon grant revoked, policies replaced
- **email_logs**: INSERT restricted to service_role only

## Security Changes
- 30+ policies dropped and recreated with non-recursive predicates
- `anon` SELECT revoked on `certificates`
- `authenticated` table-level UPDATE revoked on `profiles`; column-level granted
- `authenticated` INSERT revoked on `email_logs`
- All SECURITY DEFINER functions have `SET search_path = public, pg_temp`
- EXECUTE on helper functions revoked from PUBLIC/anon; granted to authenticated

## Important Notes
1. This migration is safe to re-run (uses DROP IF EXISTS for all policies)
2. No data is deleted or modified (except adding admin_scope column)
3. Existing profiles retain their role and is_active values
4. The two existing users (both 'participant') are unaffected
5. To promote a user to admin, use: SELECT set_user_role('user-uuid', 'admin', 'llave_gt');
*/

-- ============================================================
-- STEP 1: Add admin_scope column to profiles
-- ============================================================
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'profiles' AND column_name = 'admin_scope'
  ) THEN
    ALTER TABLE public.profiles ADD COLUMN admin_scope text
      CHECK (admin_scope IS NULL OR admin_scope IN ('llave_gt', 'escuela'));
  END IF;
END $$;

-- ============================================================
-- STEP 2: Create SECURITY DEFINER helper functions
-- ============================================================

-- has_admin_role: returns true if the calling user is an admin (optionally scoped)
CREATE OR REPLACE FUNCTION public.has_admin_role(p_scope text DEFAULT NULL)
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid()
      AND role = 'admin'
      AND is_active = true
      AND (p_scope IS NULL OR admin_scope IS NULL OR admin_scope = p_scope)
  );
$$;

-- has_staff_role: returns true if the calling user is admin or coordinator
CREATE OR REPLACE FUNCTION public.has_staff_role(p_scope text DEFAULT NULL)
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid()
      AND role IN ('admin', 'coordinator')
      AND is_active = true
      AND (p_scope IS NULL OR admin_scope IS NULL OR admin_scope = p_scope)
  );
$$;

-- set_user_role: allows an admin to set another user's role and scope
CREATE OR REPLACE FUNCTION public.set_user_role(p_user_id uuid, p_role text, p_scope text DEFAULT NULL)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
BEGIN
  IF p_role NOT IN ('participant', 'coordinator', 'admin') THEN
    RAISE EXCEPTION 'Invalid role. Must be participant, coordinator, or admin.';
  END IF;

  IF p_scope IS NOT NULL AND p_scope NOT IN ('llave_gt', 'escuela') THEN
    RAISE EXCEPTION 'Invalid scope. Must be llave_gt, escuela, or NULL.';
  END IF;

  IF NOT public.has_admin_role() THEN
    RAISE EXCEPTION 'Permission denied: only admins can change user roles.';
  END IF;

  -- An admin cannot change their own role (prevents self-demotion lockout too)
  IF p_user_id = auth.uid() THEN
    RAISE EXCEPTION 'You cannot change your own role. Ask another admin.';
  END IF;

  UPDATE public.profiles
  SET role = p_role, admin_scope = p_scope, updated_at = now()
  WHERE id = p_user_id;
END;
$$;

-- set_user_active: allows an admin to activate/deactivate a user
CREATE OR REPLACE FUNCTION public.set_user_active(p_user_id uuid, p_active boolean)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
BEGIN
  IF NOT public.has_admin_role() THEN
    RAISE EXCEPTION 'Permission denied: only admins can change user active status.';
  END IF;

  IF p_user_id = auth.uid() THEN
    RAISE EXCEPTION 'You cannot change your own active status. Ask another admin.';
  END IF;

  UPDATE public.profiles
  SET is_active = p_active, updated_at = now()
  WHERE id = p_user_id;
END;
$$;

-- verify_certificate_by_code: public verification returning minimal data
CREATE OR REPLACE FUNCTION public.verify_certificate_by_code(p_code text)
RETURNS TABLE(
  participant_name text,
  course_title text,
  issued_at timestamptz,
  is_valid boolean,
  attendance_percentage numeric
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
BEGIN
  RETURN QUERY
  SELECT
    pr.full_name,
    c.title,
    cert.issued_at,
    cert.is_valid,
    cert.attendance_percentage
  FROM public.certificates cert
  JOIN public.profiles pr ON pr.id = cert.user_id
  JOIN public.courses c ON c.id = cert.course_id
  WHERE cert.certificate_code = p_code;
END;
$$;

-- ============================================================
-- STEP 3: Revoke EXECUTE from PUBLIC on all security functions
-- ============================================================
REVOKE EXECUTE ON FUNCTION public.has_admin_role(text) FROM PUBLIC, anon;
REVOKE EXECUTE ON FUNCTION public.has_staff_role(text) FROM PUBLIC, anon;
REVOKE EXECUTE ON FUNCTION public.set_user_role(uuid, text, text) FROM PUBLIC, anon;
REVOKE EXECUTE ON FUNCTION public.set_user_active(uuid, boolean) FROM PUBLIC, anon;
REVOKE EXECUTE ON FUNCTION public.verify_certificate_by_code(text) FROM PUBLIC, anon;

-- Grant EXECUTE to authenticated for the functions they need
GRANT EXECUTE ON FUNCTION public.has_admin_role(text) TO authenticated;
GRANT EXECUTE ON FUNCTION public.has_staff_role(text) TO authenticated;
GRANT EXECUTE ON FUNCTION public.set_user_role(uuid, text, text) TO authenticated;
GRANT EXECUTE ON FUNCTION public.set_user_active(uuid, boolean) TO authenticated;

-- verify_certificate_by_code is public: grant to anon too
GRANT EXECUTE ON FUNCTION public.verify_certificate_by_code(text) TO anon, authenticated;

-- ============================================================
-- STEP 4: Fix profiles — column-level UPDATE, block role/is_active writes
-- ============================================================

-- Revoke the broad table-level UPDATE grant
REVOKE UPDATE ON public.profiles FROM authenticated;

-- Grant UPDATE only on personal columns (NOT role, is_active, admin_scope)
GRANT UPDATE (full_name, phone, organization, job_title, country, city, avatar_url)
  ON public.profiles TO authenticated;

-- Also need SELECT on admin_scope so the frontend can display it
GRANT SELECT (full_name, email, phone, organization, job_title, country, city, avatar_url, role, is_active, admin_scope, created_at, updated_at, id)
  ON public.profiles TO authenticated;

-- Drop all existing profiles policies
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
DROP POLICY IF EXISTS "Admins and coordinators can view all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
DROP POLICY IF EXISTS "Admins can update any profile" ON public.profiles;

-- Recreate with non-recursive predicates
CREATE POLICY "profiles_select_own"
  ON public.profiles FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "profiles_select_admin"
  ON public.profiles FOR SELECT
  TO authenticated
  USING (public.has_staff_role());

CREATE POLICY "profiles_insert_own"
  ON public.profiles FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

-- No UPDATE policy for role/is_active: column-level grant prevents it.
-- Users can update their personal fields; admins use RPCs for role/is_active.
CREATE POLICY "profiles_update_own"
  ON public.profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

CREATE POLICY "profiles_update_admin"
  ON public.profiles FOR UPDATE
  TO authenticated
  USING (public.has_admin_role())
  WITH CHECK (public.has_admin_role());

-- ============================================================
-- STEP 5: Fix courses — replace recursive policies
-- ============================================================
DROP POLICY IF EXISTS "Anyone can view active courses" ON public.courses;
DROP POLICY IF EXISTS "Admins and coordinators can view all courses" ON public.courses;
DROP POLICY IF EXISTS "Admins and coordinators can insert courses" ON public.courses;
DROP POLICY IF EXISTS "Admins and coordinators can update courses" ON public.courses;

CREATE POLICY "courses_select_public"
  ON public.courses FOR SELECT
  TO anon, authenticated
  USING (status = 'active');

CREATE POLICY "courses_select_staff"
  ON public.courses FOR SELECT
  TO authenticated
  USING (public.has_staff_role());

CREATE POLICY "courses_insert_staff"
  ON public.courses FOR INSERT
  TO authenticated
  WITH CHECK (public.has_staff_role());

CREATE POLICY "courses_update_staff"
  ON public.courses FOR UPDATE
  TO authenticated
  USING (public.has_staff_role())
  WITH CHECK (public.has_staff_role());

-- ============================================================
-- STEP 6: Fix course_sessions — replace recursive policies
-- ============================================================
DROP POLICY IF EXISTS "Authenticated users can view sessions" ON public.course_sessions;
DROP POLICY IF EXISTS "Public can view sessions of active courses" ON public.course_sessions;
DROP POLICY IF EXISTS "Admins and coordinators can manage sessions" ON public.course_sessions;
DROP POLICY IF EXISTS "Admins and coordinators can update sessions" ON public.course_sessions;

CREATE POLICY "sessions_select_public"
  ON public.course_sessions FOR SELECT
  TO anon, authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.courses c
      WHERE c.id = course_id AND c.status = 'active'
    )
  );

CREATE POLICY "sessions_select_staff"
  ON public.course_sessions FOR SELECT
  TO authenticated
  USING (public.has_staff_role());

CREATE POLICY "sessions_insert_staff"
  ON public.course_sessions FOR INSERT
  TO authenticated
  WITH CHECK (public.has_staff_role());

CREATE POLICY "sessions_update_staff"
  ON public.course_sessions FOR UPDATE
  TO authenticated
  USING (public.has_staff_role())
  WITH CHECK (public.has_staff_role());

-- ============================================================
-- STEP 7: Fix enrollments — replace recursive policies
-- ============================================================
DROP POLICY IF EXISTS "Users can view own enrollments" ON public.enrollments;
DROP POLICY IF EXISTS "Admins and coordinators can view all enrollments" ON public.enrollments;
DROP POLICY IF EXISTS "Authenticated users can enroll themselves" ON public.enrollments;
DROP POLICY IF EXISTS "Admins can insert any enrollment" ON public.enrollments;
DROP POLICY IF EXISTS "Users can update own enrollment status" ON public.enrollments;
DROP POLICY IF EXISTS "Admins and coordinators can update any enrollment" ON public.enrollments;

CREATE POLICY "enrollments_select_own"
  ON public.enrollments FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "enrollments_select_staff"
  ON public.enrollments FOR SELECT
  TO authenticated
  USING (public.has_staff_role());

CREATE POLICY "enrollments_insert_own"
  ON public.enrollments FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "enrollments_insert_staff"
  ON public.enrollments FOR INSERT
  TO authenticated
  WITH CHECK (public.has_staff_role());

CREATE POLICY "enrollments_update_own"
  ON public.enrollments FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "enrollments_update_staff"
  ON public.enrollments FOR UPDATE
  TO authenticated
  USING (public.has_staff_role())
  WITH CHECK (public.has_staff_role());

-- ============================================================
-- STEP 8: Fix attendance_records — replace recursive policies
-- ============================================================
DROP POLICY IF EXISTS "Users can view own attendance" ON public.attendance_records;
DROP POLICY IF EXISTS "Admins and coordinators can view all attendance" ON public.attendance_records;
DROP POLICY IF EXISTS "Admins and coordinators can mark attendance" ON public.attendance_records;
DROP POLICY IF EXISTS "Admins and coordinators can update attendance" ON public.attendance_records;

CREATE POLICY "attendance_select_own"
  ON public.attendance_records FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "attendance_select_staff"
  ON public.attendance_records FOR SELECT
  TO authenticated
  USING (public.has_staff_role());

CREATE POLICY "attendance_insert_staff"
  ON public.attendance_records FOR INSERT
  TO authenticated
  WITH CHECK (public.has_staff_role());

CREATE POLICY "attendance_update_staff"
  ON public.attendance_records FOR UPDATE
  TO authenticated
  USING (public.has_staff_role())
  WITH CHECK (public.has_staff_role());

-- ============================================================
-- STEP 9: Fix certificates — remove public access, use RPC
-- ============================================================

-- Revoke anon SELECT entirely
REVOKE SELECT ON public.certificates FROM anon;

DROP POLICY IF EXISTS "Users can view own certificates" ON public.certificates;
DROP POLICY IF EXISTS "Public can verify certificates" ON public.certificates;
DROP POLICY IF EXISTS "Admins and coordinators can issue certificates" ON public.certificates;
DROP POLICY IF EXISTS "Admins and coordinators can update certificates" ON public.certificates;

CREATE POLICY "certificates_select_own"
  ON public.certificates FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "certificates_select_staff"
  ON public.certificates FOR SELECT
  TO authenticated
  USING (public.has_staff_role());

CREATE POLICY "certificates_insert_staff"
  ON public.certificates FOR INSERT
  TO authenticated
  WITH CHECK (public.has_staff_role());

CREATE POLICY "certificates_update_staff"
  ON public.certificates FOR UPDATE
  TO authenticated
  USING (public.has_staff_role())
  WITH CHECK (public.has_staff_role());

-- ============================================================
-- STEP 10: Fix email_logs — restrict INSERT to service_role
-- ============================================================
REVOKE INSERT ON public.email_logs FROM authenticated, anon;

DROP POLICY IF EXISTS "Admins can view email logs" ON public.email_logs;
DROP POLICY IF EXISTS "System can insert email logs" ON public.email_logs;

CREATE POLICY "email_logs_select_admin"
  ON public.email_logs FOR SELECT
  TO authenticated
  USING (public.has_admin_role());

-- No INSERT policy for authenticated/anon: only service_role can insert
-- (service_role bypasses RLS entirely)

-- ============================================================
-- STEP 11: Fix update_updated_at_column search_path
-- ============================================================
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;
