
ALTER TABLE public.customers
  ADD COLUMN IF NOT EXISTS birth_date DATE,
  ADD COLUMN IF NOT EXISTS cpf_cnpj TEXT,
  ADD COLUMN IF NOT EXISTS city TEXT,
  ADD COLUMN IF NOT EXISTS state TEXT,
  ADD COLUMN IF NOT EXISTS latitude NUMERIC(10, 7),
  ADD COLUMN IF NOT EXISTS longitude NUMERIC(10, 7);

CREATE UNIQUE INDEX IF NOT EXISTS ux_customers_cpf_cnpj
  ON public.customers (cpf_cnpj)
  WHERE cpf_cnpj IS NOT NULL;

CREATE SEQUENCE IF NOT EXISTS public.gl_code_seq START 1;
CREATE SEQUENCE IF NOT EXISTS public.gmail_alias_seq START 1;

CREATE OR REPLACE FUNCTION public.next_gl_code()
RETURNS TEXT LANGUAGE plpgsql SECURITY DEFINER SET search_path = public
AS $$
DECLARE n bigint;
BEGIN
  n := nextval('public.gl_code_seq');
  RETURN 'GL-' || lpad(n::text, 5, '0');
END $$;

CREATE OR REPLACE FUNCTION public.next_gmail_alias()
RETURNS TEXT LANGUAGE plpgsql SECURITY DEFINER SET search_path = public
AS $$
DECLARE n bigint;
BEGIN
  n := nextval('public.gmail_alias_seq');
  RETURN 'greennetantenas+' || n::text || '@gmail.com';
END $$;

REVOKE ALL ON FUNCTION public.next_gl_code() FROM PUBLIC;
REVOKE ALL ON FUNCTION public.next_gmail_alias() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.next_gl_code() TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.next_gmail_alias() TO authenticated, service_role;

CREATE TABLE IF NOT EXISTS public.equipment (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id UUID REFERENCES public.customers(id) ON DELETE SET NULL,
  model TEXT,
  serial_number TEXT,
  kit_id TEXT,
  dish_model TEXT,
  pn TEXT,
  power_source TEXT,
  warranty_until DATE,
  installed_at DATE,
  status TEXT NOT NULL DEFAULT 'in_stock' CHECK (status IN ('in_stock','installed','maintenance','retired')),
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE UNIQUE INDEX IF NOT EXISTS ux_equipment_serial ON public.equipment (serial_number) WHERE serial_number IS NOT NULL;
CREATE UNIQUE INDEX IF NOT EXISTS ux_equipment_kit_id ON public.equipment (kit_id) WHERE kit_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS ix_equipment_customer ON public.equipment (customer_id);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.equipment TO authenticated;
GRANT ALL ON public.equipment TO service_role;
ALTER TABLE public.equipment ENABLE ROW LEVEL SECURITY;
CREATE POLICY equipment_staff_all ON public.equipment FOR ALL TO authenticated
  USING (public.is_staff(auth.uid())) WITH CHECK (public.is_staff(auth.uid()));
CREATE TRIGGER trg_equipment_touch BEFORE UPDATE ON public.equipment
  FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();

CREATE TABLE IF NOT EXISTS public.starlink_accounts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  gl_code TEXT NOT NULL DEFAULT public.next_gl_code(),
  customer_id UUID REFERENCES public.customers(id) ON DELETE SET NULL,
  equipment_id UUID REFERENCES public.equipment(id) ON DELETE SET NULL,
  gmail_alias TEXT NOT NULL DEFAULT public.next_gmail_alias(),
  is_primary_account BOOLEAN NOT NULL DEFAULT false,
  plan TEXT,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','active','suspended','cancelled')),
  activated_at DATE,
  customer_has_access BOOLEAN NOT NULL DEFAULT false,
  recovery_email TEXT,
  recovery_phone TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE UNIQUE INDEX IF NOT EXISTS ux_starlink_gl_code ON public.starlink_accounts (gl_code);
CREATE UNIQUE INDEX IF NOT EXISTS ux_starlink_alias ON public.starlink_accounts (gmail_alias);
CREATE INDEX IF NOT EXISTS ix_starlink_customer ON public.starlink_accounts (customer_id);
CREATE INDEX IF NOT EXISTS ix_starlink_equipment ON public.starlink_accounts (equipment_id);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.starlink_accounts TO authenticated;
GRANT ALL ON public.starlink_accounts TO service_role;
ALTER TABLE public.starlink_accounts ENABLE ROW LEVEL SECURITY;
CREATE POLICY starlink_staff_all ON public.starlink_accounts FOR ALL TO authenticated
  USING (public.is_staff(auth.uid())) WITH CHECK (public.is_staff(auth.uid()));
CREATE TRIGGER trg_starlink_touch BEFORE UPDATE ON public.starlink_accounts
  FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();

CREATE TABLE IF NOT EXISTS public.installations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id UUID NOT NULL REFERENCES public.customers(id) ON DELETE CASCADE,
  equipment_id UUID REFERENCES public.equipment(id) ON DELETE SET NULL,
  technician_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  scheduled_at TIMESTAMPTZ,
  executed_at TIMESTAMPTZ,
  checklist JSONB NOT NULL DEFAULT '[]'::jsonb,
  photos_before JSONB NOT NULL DEFAULT '[]'::jsonb,
  photos_after JSONB NOT NULL DEFAULT '[]'::jsonb,
  signature_url TEXT,
  gps_lat NUMERIC(10, 7),
  gps_lng NUMERIC(10, 7),
  status TEXT NOT NULL DEFAULT 'scheduled' CHECK (status IN ('scheduled','in_progress','done','cancelled')),
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS ix_installations_customer ON public.installations (customer_id);
CREATE INDEX IF NOT EXISTS ix_installations_technician ON public.installations (technician_id);
CREATE INDEX IF NOT EXISTS ix_installations_scheduled ON public.installations (scheduled_at);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.installations TO authenticated;
GRANT ALL ON public.installations TO service_role;
ALTER TABLE public.installations ENABLE ROW LEVEL SECURITY;
CREATE POLICY installations_staff_all ON public.installations FOR ALL TO authenticated
  USING (public.is_staff(auth.uid())) WITH CHECK (public.is_staff(auth.uid()));
CREATE TRIGGER trg_installations_touch BEFORE UPDATE ON public.installations
  FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();

CREATE TABLE IF NOT EXISTS public.customer_documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id UUID NOT NULL REFERENCES public.customers(id) ON DELETE CASCADE,
  doc_type TEXT NOT NULL CHECK (doc_type IN ('cnh','energy_bill','starlink_label','photo','other')),
  file_url TEXT NOT NULL,
  ocr_data JSONB,
  uploaded_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  uploaded_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS ix_customer_documents_customer ON public.customer_documents (customer_id);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.customer_documents TO authenticated;
GRANT ALL ON public.customer_documents TO service_role;
ALTER TABLE public.customer_documents ENABLE ROW LEVEL SECURITY;
CREATE POLICY docs_staff_all ON public.customer_documents FOR ALL TO authenticated
  USING (public.is_staff(auth.uid())) WITH CHECK (public.is_staff(auth.uid()));
CREATE TRIGGER trg_customer_documents_touch BEFORE UPDATE ON public.customer_documents
  FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();

CREATE OR REPLACE VIEW public.technicians_stats AS
SELECT
  p.id AS technician_id,
  p.full_name,
  p.email,
  COUNT(i.id) FILTER (WHERE i.status = 'done') AS installations_done,
  COUNT(i.id) FILTER (WHERE i.status = 'scheduled') AS installations_scheduled,
  AVG(EXTRACT(EPOCH FROM (i.executed_at - i.scheduled_at)) / 3600.0)
    FILTER (WHERE i.executed_at IS NOT NULL AND i.scheduled_at IS NOT NULL) AS avg_hours_to_execute
FROM public.profiles p
LEFT JOIN public.installations i ON i.technician_id = p.id
GROUP BY p.id, p.full_name, p.email;

GRANT SELECT ON public.technicians_stats TO authenticated, service_role;
