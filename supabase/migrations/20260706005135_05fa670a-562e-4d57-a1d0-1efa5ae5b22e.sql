
CREATE OR REPLACE FUNCTION public.next_gl_code()
RETURNS TEXT LANGUAGE plpgsql SECURITY INVOKER SET search_path = public
AS $$
DECLARE n bigint;
BEGIN
  n := nextval('public.gl_code_seq');
  RETURN 'GL-' || lpad(n::text, 5, '0');
END $$;

CREATE OR REPLACE FUNCTION public.next_gmail_alias()
RETURNS TEXT LANGUAGE plpgsql SECURITY INVOKER SET search_path = public
AS $$
DECLARE n bigint;
BEGIN
  n := nextval('public.gmail_alias_seq');
  RETURN 'greennetantenas+' || n::text || '@gmail.com';
END $$;

GRANT USAGE ON SEQUENCE public.gl_code_seq TO authenticated, service_role;
GRANT USAGE ON SEQUENCE public.gmail_alias_seq TO authenticated, service_role;
