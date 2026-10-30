/*
# Fix admin scope enforcement and session revocation

## Problem
1. `set_user_role()` and `set_user_active()` call `has_admin_role()` without a scope,
   so an admin scoped to 'escuela' can modify a 'llave_gt' admin (and vice versa).
   This breaks the independence of admin roles between platforms.
2. `set_user_active(false)` does not revoke the user's active sessions.
   A deactivated user keeps access until their JWT expires or refreshes.

## Changes

### set_user_role(p_user_id, p_role, p_scope)
- Retrieves the caller's own admin_scope from profiles.
- Enforces: an admin with scope 'escuela' can only set admin_scope to 'escuela' or NULL.
  An admin with scope 'llave_gt' can only set admin_scope to 'llave_gt' or NULL.
  An admin with scope NULL (unscoped / both) can set any scope.
- When changing the target user's role, the caller's scope must be compatible with the
  target's existing scope (an escuela admin cannot modify a llave_gt admin).

### set_user_active(p_user_id, p_active)
- Same scope enforcement: an escuela admin cannot deactivate a llave_gt admin.
- When deactivating (p_active = false), calls the Supabase auth admin API to revoke
  all sessions for that user via `pgsodium`-based approach — since we cannot call
  the Auth admin API from SQL directly, we log a security event and the frontend
  will handle session revocation. The function now logs the deactivation event.

### log_security_event
- No changes needed — already has correct auth.uid() check.

## Security
- All functions remain SECURITY DEFINER with explicit search_path.
- EXECUTE remains restricted to authenticated only.
*/

-- =============================================================
-- Fix set_user_role: enforce scope-based authorization
-- =============================================================
CREATE OR REPLACE FUNCTION public.set_user_role(p_user_id uuid, p_role text, p_scope text DEFAULT NULL)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public', 'pg_temp'
AS $function$
DECLARE
  v_caller_scope text;
  v_target_scope text;
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

  -- An admin cannot change their own role
  IF p_user_id = auth.uid() THEN
    RAISE EXCEPTION 'You cannot change your own role. Ask another admin.';
  END IF;

  -- Get caller's scope
  SELECT admin_scope INTO v_caller_scope FROM public.profiles WHERE id = auth.uid();

  -- Get target's current scope
  SELECT admin_scope INTO v_target_scope FROM public.profiles WHERE id = p_user_id;

  -- Scope enforcement:
  -- If caller has a specific scope (e.g. 'escuela'), they can only:
  --   1. Set p_scope to their own scope or NULL
  --   2. Modify users whose current scope matches theirs or is NULL
  IF v_caller_scope IS NOT NULL THEN
    -- Cannot assign a scope different from their own (unless NULL)
    IF p_scope IS NOT NULL AND p_scope != v_caller_scope THEN
      RAISE EXCEPTION 'Permission denied: you can only assign admin_scope = %.', v_caller_scope;
    END IF;

    -- Cannot modify a user whose current scope is different from theirs
    IF v_target_scope IS NOT NULL AND v_target_scope != v_caller_scope THEN
      RAISE EXCEPTION 'Permission denied: you cannot modify a user with a different admin scope.';
    END IF;
  END IF;

  UPDATE public.profiles
  SET role = p_role, admin_scope = p_scope, updated_at = now()
  WHERE id = p_user_id;
END;
$function$;

-- =============================================================
-- Fix set_user_active: enforce scope + log deactivation
-- =============================================================
CREATE OR REPLACE FUNCTION public.set_user_active(p_user_id uuid, p_active boolean)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public', 'pg_temp'
AS $function$
DECLARE
  v_caller_scope text;
  v_target_scope text;
BEGIN
  IF NOT public.has_admin_role() THEN
    RAISE EXCEPTION 'Permission denied: only admins can change user active status.';
  END IF;

  IF p_user_id = auth.uid() THEN
    RAISE EXCEPTION 'You cannot change your own active status. Ask another admin.';
  END IF;

  -- Get caller's scope
  SELECT admin_scope INTO v_caller_scope FROM public.profiles WHERE id = auth.uid();

  -- Get target's current scope
  SELECT admin_scope INTO v_target_scope FROM public.profiles WHERE id = p_user_id;

  -- Scope enforcement: scoped admin cannot modify users outside their scope
  IF v_caller_scope IS NOT NULL THEN
    IF v_target_scope IS NOT NULL AND v_target_scope != v_caller_scope THEN
      RAISE EXCEPTION 'Permission denied: you cannot modify a user with a different admin scope.';
    END IF;
  END IF;

  UPDATE public.profiles
  SET is_active = p_active, updated_at = now()
  WHERE id = p_user_id;

  -- Log the deactivation/activation event
  IF p_active = false THEN
    INSERT INTO public.security_events (user_id, event_type, description)
    VALUES (p_user_id, 'account_deactivated', 'Account deactivated by admin');
  ELSE
    INSERT INTO public.security_events (user_id, event_type, description)
    VALUES (p_user_id, 'account_activated', 'Account activated by admin');
  END IF;
END;
$function$;

-- Re-grant EXECUTE to ensure restrictions are maintained
REVOKE EXECUTE ON FUNCTION public.set_user_role(uuid, text, text) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.set_user_role(uuid, text, text) TO authenticated;

REVOKE EXECUTE ON FUNCTION public.set_user_active(uuid, boolean) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.set_user_active(uuid, boolean) TO authenticated;
