
CREATE TABLE public.vendors (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id uuid NOT NULL,
  name text NOT NULL,
  contact_name text,
  email text,
  phone text,
  website text,
  address text,
  category text,
  payment_terms text,
  lead_time_days integer DEFAULT 0,
  notes text,
  status text NOT NULL DEFAULT 'active',
  created_by uuid,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.vendors ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Tenant access vendors" ON public.vendors FOR ALL TO authenticated
  USING (company_id = get_my_company_id()) WITH CHECK (company_id = get_my_company_id());
CREATE TRIGGER vendors_updated BEFORE UPDATE ON public.vendors FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TABLE public.commercial_accounts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id uuid NOT NULL,
  customer_id uuid,
  account_name text NOT NULL,
  industry text,
  account_manager_id uuid,
  contract_value numeric NOT NULL DEFAULT 0,
  credit_limit numeric NOT NULL DEFAULT 0,
  payment_terms text,
  contract_start date,
  contract_end date,
  primary_contact text,
  email text,
  phone text,
  notes text,
  status text NOT NULL DEFAULT 'active',
  created_by uuid,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.commercial_accounts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Tenant access commercial_accounts" ON public.commercial_accounts FOR ALL TO authenticated
  USING (company_id = get_my_company_id()) WITH CHECK (company_id = get_my_company_id());
CREATE TRIGGER commercial_accounts_updated BEFORE UPDATE ON public.commercial_accounts FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TABLE public.business_locations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id uuid NOT NULL,
  name text NOT NULL,
  type text NOT NULL DEFAULT 'office',
  address text,
  city text,
  region text,
  postal_code text,
  country text DEFAULT 'US',
  phone text,
  manager_id uuid,
  timezone text,
  notes text,
  status text NOT NULL DEFAULT 'active',
  created_by uuid,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.business_locations ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Tenant access business_locations" ON public.business_locations FOR ALL TO authenticated
  USING (company_id = get_my_company_id()) WITH CHECK (company_id = get_my_company_id());
CREATE TRIGGER business_locations_updated BEFORE UPDATE ON public.business_locations FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TABLE public.assets (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id uuid NOT NULL,
  name text NOT NULL,
  asset_tag text,
  category text,
  serial_number text,
  manufacturer text,
  model text,
  location_id uuid,
  assigned_to uuid,
  purchase_date date,
  purchase_price numeric DEFAULT 0,
  warranty_expires date,
  next_service_date date,
  notes text,
  status text NOT NULL DEFAULT 'in_service',
  created_by uuid,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.assets ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Tenant access assets" ON public.assets FOR ALL TO authenticated
  USING (company_id = get_my_company_id()) WITH CHECK (company_id = get_my_company_id());
CREATE TRIGGER assets_updated BEFORE UPDATE ON public.assets FOR EACH ROW EXECUTE FUNCTION set_updated_at();
