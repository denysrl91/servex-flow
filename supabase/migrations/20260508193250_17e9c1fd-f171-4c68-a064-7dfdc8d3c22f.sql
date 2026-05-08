
ALTER TABLE public.customers
  ADD COLUMN IF NOT EXISTS tags text[] NOT NULL DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS service_address text;

ALTER TABLE public.properties
  ADD COLUMN IF NOT EXISTS access_notes text,
  ADD COLUMN IF NOT EXISTS gate_code text,
  ADD COLUMN IF NOT EXISTS pets text,
  ADD COLUMN IF NOT EXISTS preferred_appointment_times text,
  ADD COLUMN IF NOT EXISTS system_count integer NOT NULL DEFAULT 1;

ALTER TABLE public.equipment
  ADD COLUMN IF NOT EXISTS tonnage numeric,
  ADD COLUMN IF NOT EXISTS seer_rating numeric,
  ADD COLUMN IF NOT EXISTS refrigerant_type text;

CREATE TABLE IF NOT EXISTS public.customer_communications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id uuid NOT NULL,
  customer_id uuid NOT NULL,
  channel text NOT NULL DEFAULT 'note',
  direction text NOT NULL DEFAULT 'outbound',
  subject text,
  body text,
  status text NOT NULL DEFAULT 'logged',
  created_by uuid,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.customer_communications ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Tenant access customer_communications"
  ON public.customer_communications FOR ALL TO authenticated
  USING (company_id = get_my_company_id())
  WITH CHECK (company_id = get_my_company_id());
CREATE INDEX IF NOT EXISTS idx_customer_comms_customer ON public.customer_communications(customer_id, created_at DESC);
CREATE TRIGGER trg_customer_comms_updated BEFORE UPDATE ON public.customer_communications FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TABLE IF NOT EXISTS public.equipment_photos (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id uuid NOT NULL,
  equipment_id uuid NOT NULL,
  url text NOT NULL,
  caption text,
  status text NOT NULL DEFAULT 'active',
  created_by uuid,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.equipment_photos ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Tenant access equipment_photos"
  ON public.equipment_photos FOR ALL TO authenticated
  USING (company_id = get_my_company_id())
  WITH CHECK (company_id = get_my_company_id());
CREATE INDEX IF NOT EXISTS idx_equipment_photos_equipment ON public.equipment_photos(equipment_id);
CREATE TRIGGER trg_equipment_photos_updated BEFORE UPDATE ON public.equipment_photos FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TABLE IF NOT EXISTS public.customer_photos (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id uuid NOT NULL,
  customer_id uuid NOT NULL,
  url text NOT NULL,
  caption text,
  status text NOT NULL DEFAULT 'active',
  created_by uuid,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.customer_photos ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Tenant access customer_photos"
  ON public.customer_photos FOR ALL TO authenticated
  USING (company_id = get_my_company_id())
  WITH CHECK (company_id = get_my_company_id());
CREATE INDEX IF NOT EXISTS idx_customer_photos_customer ON public.customer_photos(customer_id);
CREATE TRIGGER trg_customer_photos_updated BEFORE UPDATE ON public.customer_photos FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
