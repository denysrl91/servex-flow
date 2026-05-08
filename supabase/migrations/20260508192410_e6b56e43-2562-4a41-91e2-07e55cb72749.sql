
ALTER TABLE public.estimate_options
  ADD COLUMN IF NOT EXISTS tier text,
  ADD COLUMN IF NOT EXISTS warranty_years integer,
  ADD COLUMN IF NOT EXISTS efficiency_rating text,
  ADD COLUMN IF NOT EXISTS monthly_payment numeric,
  ADD COLUMN IF NOT EXISTS highlights text[],
  ADD COLUMN IF NOT EXISTS is_recommended boolean NOT NULL DEFAULT false;

ALTER TABLE public.estimates
  ADD COLUMN IF NOT EXISTS equipment_id uuid,
  ADD COLUMN IF NOT EXISTS signature_data text,
  ADD COLUMN IF NOT EXISTS signed_at timestamptz,
  ADD COLUMN IF NOT EXISTS signed_by_name text;

CREATE TABLE IF NOT EXISTS public.estimate_line_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id uuid NOT NULL,
  estimate_id uuid NOT NULL,
  option_id uuid,
  type text NOT NULL DEFAULT 'material',
  item_id uuid,
  description text NOT NULL,
  quantity numeric NOT NULL DEFAULT 1,
  unit_price numeric NOT NULL DEFAULT 0,
  total numeric NOT NULL DEFAULT 0,
  sort_order integer NOT NULL DEFAULT 0,
  status text NOT NULL DEFAULT 'active',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.estimate_line_items ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Tenant access estimate_line_items"
  ON public.estimate_line_items FOR ALL TO authenticated
  USING (company_id = get_my_company_id())
  WITH CHECK (company_id = get_my_company_id());
CREATE INDEX IF NOT EXISTS idx_estimate_line_items_estimate ON public.estimate_line_items(estimate_id);
CREATE INDEX IF NOT EXISTS idx_estimate_line_items_option ON public.estimate_line_items(option_id);

CREATE TABLE IF NOT EXISTS public.estimate_photos (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id uuid NOT NULL,
  estimate_id uuid NOT NULL,
  url text NOT NULL,
  caption text,
  status text NOT NULL DEFAULT 'active',
  created_by uuid,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.estimate_photos ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Tenant access estimate_photos"
  ON public.estimate_photos FOR ALL TO authenticated
  USING (company_id = get_my_company_id())
  WITH CHECK (company_id = get_my_company_id());
CREATE INDEX IF NOT EXISTS idx_estimate_photos_estimate ON public.estimate_photos(estimate_id);

CREATE TRIGGER trg_estimate_line_items_updated BEFORE UPDATE ON public.estimate_line_items FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE TRIGGER trg_estimate_photos_updated BEFORE UPDATE ON public.estimate_photos FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
