
-- Revoke direct API access to has_role. RLS policies that call it still work
-- because they run under the definer's privileges; only direct RPC calls from
-- signed-in users are blocked.
REVOKE EXECUTE ON FUNCTION public.has_role(uuid, public.app_role) FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.has_role(uuid, public.app_role) FROM anon;
REVOKE EXECUTE ON FUNCTION public.has_role(uuid, public.app_role) FROM authenticated;
GRANT EXECUTE ON FUNCTION public.has_role(uuid, public.app_role) TO service_role;

-- claim_admin_role() MUST remain callable by authenticated users — it is the
-- mechanism by which the authorized company email activates their admin role
-- on first sign-in. Internally it only grants the role when the caller's
-- email matches the hardcoded authorized address, so exposing EXECUTE is safe.
REVOKE EXECUTE ON FUNCTION public.claim_admin_role() FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.claim_admin_role() FROM anon;
GRANT EXECUTE ON FUNCTION public.claim_admin_role() TO authenticated;
GRANT EXECUTE ON FUNCTION public.claim_admin_role() TO service_role;
