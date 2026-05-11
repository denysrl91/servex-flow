-- Ensure every signed-in user can be connected to a company/workspace if their profile is missing or incomplete.
CREATE OR REPLACE FUNCTION public.ensure_user_workspace()
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, auth
AS $$
DECLARE
  _uid uuid := auth.uid();
  _email text;
  _full_name text;
  _company_id uuid;
  _company_name text;
BEGIN
  IF _uid IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;

  SELECT email,
         COALESCE(raw_user_meta_data->>'full_name', raw_user_meta_data->>'name', email)
  INTO _email, _full_name
  FROM auth.users
  WHERE id = _uid;

  IF _email IS NULL THEN
    _email := _uid::text || '@user.local';
  END IF;

  SELECT company_id INTO _company_id
  FROM public.profiles
  WHERE id = _uid;

  IF _company_id IS NULL THEN
    SELECT company_id INTO _company_id
    FROM public.user_roles
    WHERE user_id = _uid
    ORDER BY created_at ASC
    LIMIT 1;
  END IF;

  IF _company_id IS NULL THEN
    _company_name := COALESCE(NULLIF(trim(_full_name), ''), split_part(_email, '@', 1), 'New') || '''s HVAC Company';

    INSERT INTO public.companies (name, email)
    VALUES (_company_name, _email)
    RETURNING id INTO _company_id;
  END IF;

  INSERT INTO public.profiles (id, company_id, email, full_name)
  VALUES (_uid, _company_id, _email, _full_name)
  ON CONFLICT (id) DO UPDATE
    SET company_id = COALESCE(public.profiles.company_id, EXCLUDED.company_id),
        email = COALESCE(NULLIF(public.profiles.email, ''), EXCLUDED.email),
        full_name = COALESCE(NULLIF(public.profiles.full_name, ''), EXCLUDED.full_name),
        updated_at = now();

  INSERT INTO public.user_roles (user_id, company_id, role)
  VALUES (_uid, _company_id, 'owner')
  ON CONFLICT (user_id, company_id, role) DO NOTHING;

  RETURN _company_id;
END;
$$;

REVOKE ALL ON FUNCTION public.ensure_user_workspace() FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.ensure_user_workspace() TO authenticated;

-- Keep legacy signup repair function up to date for projects that use it, without attaching triggers to reserved schemas.
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _company_id uuid;
  _company_name text;
  _full_name text;
BEGIN
  _full_name := COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name', NEW.email);
  _company_name := COALESCE(NULLIF(trim(NEW.raw_user_meta_data->>'company_name'), ''), _full_name || '''s HVAC Company');

  INSERT INTO public.companies (name, email)
  VALUES (_company_name, NEW.email)
  RETURNING id INTO _company_id;

  INSERT INTO public.profiles (id, company_id, email, full_name)
  VALUES (NEW.id, _company_id, NEW.email, _full_name)
  ON CONFLICT (id) DO UPDATE
    SET company_id = COALESCE(public.profiles.company_id, EXCLUDED.company_id),
        email = EXCLUDED.email,
        full_name = COALESCE(NULLIF(public.profiles.full_name, ''), EXCLUDED.full_name),
        updated_at = now();

  INSERT INTO public.user_roles (user_id, company_id, role)
  VALUES (NEW.id, _company_id, 'owner')
  ON CONFLICT (user_id, company_id, role) DO NOTHING;

  RETURN NEW;
END;
$$;

CREATE TABLE IF NOT EXISTS public.invoice_line_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id uuid NOT NULL,
  invoice_id uuid NOT NULL,
  item_id uuid,
  description text NOT NULL,
  type text NOT NULL DEFAULT 'service',
  quantity numeric NOT NULL DEFAULT 1,
  unit_price numeric NOT NULL DEFAULT 0,
  total numeric NOT NULL DEFAULT 0,
  sort_order integer NOT NULL DEFAULT 0,
  status text NOT NULL DEFAULT 'active',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.company_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id uuid NOT NULL UNIQUE,
  company_name text NOT NULL DEFAULT 'HVAC Company',
  email text,
  phone text,
  website text,
  address text,
  city text,
  region text,
  postal_code text,
  country text DEFAULT 'US',
  logo_url text,
  tax_rate numeric NOT NULL DEFAULT 0,
  invoice_prefix text NOT NULL DEFAULT 'INV',
  estimate_prefix text NOT NULL DEFAULT 'EST',
  default_payment_terms text,
  notes text,
  created_by uuid,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.documents (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id uuid NOT NULL,
  customer_id uuid,
  property_id uuid,
  job_id uuid,
  estimate_id uuid,
  invoice_id uuid,
  name text NOT NULL,
  document_type text NOT NULL DEFAULT 'file',
  url text,
  notes text,
  status text NOT NULL DEFAULT 'active',
  created_by uuid,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.memberships (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id uuid NOT NULL,
  customer_id uuid NOT NULL,
  property_id uuid,
  name text NOT NULL,
  plan_name text,
  frequency text NOT NULL DEFAULT 'annual',
  visits_per_year integer NOT NULL DEFAULT 2,
  price numeric NOT NULL DEFAULT 0,
  start_date date NOT NULL DEFAULT CURRENT_DATE,
  end_date date,
  next_visit date,
  status text NOT NULL DEFAULT 'active',
  notes text,
  created_by uuid,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.schedule_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id uuid NOT NULL,
  customer_id uuid,
  property_id uuid,
  job_id uuid,
  technician_id uuid,
  title text NOT NULL,
  description text,
  starts_at timestamptz NOT NULL,
  ends_at timestamptz,
  status text NOT NULL DEFAULT 'scheduled',
  created_by uuid,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.dispatch_assignments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id uuid NOT NULL,
  job_id uuid NOT NULL,
  technician_id uuid,
  scheduled_event_id uuid,
  status text NOT NULL DEFAULT 'assigned',
  assigned_at timestamptz NOT NULL DEFAULT now(),
  notes text,
  created_by uuid,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.invoice_line_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.company_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.memberships ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.schedule_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.dispatch_assignments ENABLE ROW LEVEL SECURITY;

DO $$
DECLARE
  _table text;
BEGIN
  FOREACH _table IN ARRAY ARRAY['invoice_line_items','company_settings','documents','memberships','schedule_events','dispatch_assignments']
  LOOP
    IF NOT EXISTS (
      SELECT 1 FROM pg_policies
      WHERE schemaname = 'public'
        AND tablename = _table
        AND policyname = 'Tenant access ' || _table
    ) THEN
      EXECUTE format('CREATE POLICY %I ON public.%I FOR ALL TO authenticated USING (company_id = public.get_my_company_id()) WITH CHECK (company_id = public.get_my_company_id())', 'Tenant access ' || _table, _table);
    END IF;
  END LOOP;
END $$;

CREATE INDEX IF NOT EXISTS idx_invoice_line_items_company_invoice ON public.invoice_line_items(company_id, invoice_id);
CREATE INDEX IF NOT EXISTS idx_documents_company_customer ON public.documents(company_id, customer_id);
CREATE INDEX IF NOT EXISTS idx_memberships_company_customer ON public.memberships(company_id, customer_id);
CREATE INDEX IF NOT EXISTS idx_schedule_events_company_starts ON public.schedule_events(company_id, starts_at);
CREATE INDEX IF NOT EXISTS idx_dispatch_assignments_company_job ON public.dispatch_assignments(company_id, job_id);

DO $$
DECLARE
  _table text;
  _trigger text;
BEGIN
  FOREACH _table IN ARRAY ARRAY['invoice_line_items','company_settings','documents','memberships','schedule_events','dispatch_assignments']
  LOOP
    _trigger := 'set_updated_at_' || _table;
    IF NOT EXISTS (
      SELECT 1 FROM pg_trigger
      WHERE tgname = _trigger
    ) THEN
      EXECUTE format('CREATE TRIGGER %I BEFORE UPDATE ON public.%I FOR EACH ROW EXECUTE FUNCTION public.set_updated_at()', _trigger, _table);
    END IF;
  END LOOP;
END $$;