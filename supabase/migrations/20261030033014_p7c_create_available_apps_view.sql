/*
# Create view for available connected apps (user-facing)

## Problem
The `connected_apps` table SELECT policy is now admin-only to protect client_ids.
But participants need to see which apps are available to connect to.
Direct SELECT on `connected_apps` returns nothing for non-admin users.

## Solution
Create a view `available_apps` that exposes only public information
(name, description, logo_url, status) for active apps, WITHOUT client_id.
The view uses `security_invoker = true` so RLS on the underlying table still applies.
Since the view doesn't include client_id and only shows active apps, it's safe
for all authenticated users to read.

## Security
- View is `security_invoker = true` — runs with caller's permissions.
- Only exposes: id, name, description, logo_url — NOT client_id or created_by.
- Filters to status = 'active'.
- GRANT SELECT to authenticated only.
*/
CREATE OR REPLACE VIEW public.available_apps AS
SELECT
  id,
  name,
  description,
  logo_url
FROM public.connected_apps
WHERE status = 'active';

ALTER VIEW public.available_apps SET (security_invoker = true);

GRANT SELECT ON public.available_apps TO authenticated;
