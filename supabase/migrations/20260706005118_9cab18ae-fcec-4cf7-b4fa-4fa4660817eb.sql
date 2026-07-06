
ALTER VIEW public.technicians_stats SET (security_invoker = true);

REVOKE EXECUTE ON FUNCTION public.next_gl_code() FROM anon, PUBLIC;
REVOKE EXECUTE ON FUNCTION public.next_gmail_alias() FROM anon, PUBLIC;
GRANT EXECUTE ON FUNCTION public.next_gl_code() TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.next_gmail_alias() TO authenticated, service_role;
