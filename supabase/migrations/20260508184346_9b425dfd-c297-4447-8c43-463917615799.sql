
-- =========================================================
-- ENUMS
-- =========================================================
CREATE TYPE public.app_role AS ENUM ('owner','admin','dispatcher','technician','accountant');
CREATE TYPE public.customer_type AS ENUM ('residential','commercial');
CREATE TYPE public.customer_status AS ENUM ('lead','active','inactive','archived');
CREATE TYPE public.property_type AS ENUM ('single_family','multi_family','office','retail','industrial','education','healthcare','other');
CREATE TYPE public.equipment_status AS ENUM ('operational','needs_service','out_of_service','decommissioned');
CREATE TYPE public.tech_status AS ENUM ('available','on_job','driving','off','unavailable');
CREATE TYPE public.job_status AS ENUM ('scheduled','dispatched','in_progress','on_hold','completed','cancelled');
CREATE TYPE public.job_priority AS ENUM ('low','medium','high','urgent');
CREATE TYPE public.estimate_status AS ENUM ('draft','sent','approved','rejected','expired');
CREATE TYPE public.invoice_status AS ENUM ('draft','sent','partial','paid','overdue','void');
CREATE TYPE public.payment_method AS ENUM ('cash','check','card','ach','other');
CREATE TYPE public.payment_status AS ENUM ('pending','completed','failed','refunded');
CREATE TYPE public.po_status AS ENUM ('draft','sent','partial','received','cancelled');
CREATE TYPE public.ticket_status AS ENUM ('open','in_progress','waiting','resolved','closed');
CREATE TYPE public.ticket_priority AS ENUM ('low','medium','high','urgent');
CREATE TYPE public.opportunity_stage AS ENUM ('new_lead','qualified','proposal','negotiation','won','lost');
CREATE TYPE public.agreement_status AS ENUM ('draft','active','paused','expired','cancelled');
CREATE TYPE public.notification_type AS ENUM ('job','invoice','ticket','payment','inventory','system');
CREATE TYPE public.location_type AS ENUM ('warehouse','van','other');
CREATE TYPE public.inv_txn_type AS ENUM ('receipt','issue','transfer','adjustment','return');

-- =========================================================
-- COMPANIES (tenant root)
-- =========================================================
CREATE TABLE public.companies (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name         TEXT NOT NULL,
  slug         TEXT UNIQUE,
  email        TEXT,
  phone        TEXT,
  website      TEXT,
  address      TEXT,
  city         TEXT,
  region       TEXT,
  postal_code  TEXT,
  country      TEXT DEFAULT 'US',
  logo_url     TEXT,
  plan         TEXT DEFAULT 'pro',
  status       TEXT NOT NULL DEFAULT 'active',
  created_at   TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at   TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- =========================================================
-- PROFILES (user accounts) + ROLES
-- =========================================================
CREATE TABLE public.profiles (
  id           UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  company_id   UUID REFERENCES public.companies(id) ON DELETE SET NULL,
  email        TEXT NOT NULL,
  full_name    TEXT,
  phone        TEXT,
  avatar_url   TEXT,
  status       TEXT NOT NULL DEFAULT 'active',
  created_at   TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at   TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE public.user_roles (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  company_id  UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  role        public.app_role NOT NULL,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, company_id, role)
);

-- =========================================================
-- HELPER FUNCTIONS (security definer, no recursion)
-- =========================================================
CREATE OR REPLACE FUNCTION public.get_my_company_id()
RETURNS UUID
LANGUAGE SQL STABLE SECURITY DEFINER SET search_path = public
AS $$
  SELECT company_id FROM public.profiles WHERE id = auth.uid();
$$;

CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role public.app_role)
RETURNS BOOLEAN
LANGUAGE SQL STABLE SECURITY DEFINER SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id AND role = _role
  );
$$;

CREATE OR REPLACE FUNCTION public.is_company_admin(_user_id UUID)
RETURNS BOOLEAN
LANGUAGE SQL STABLE SECURITY DEFINER SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id AND role IN ('owner','admin')
  );
$$;

-- updated_at trigger
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

-- auto-create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name)
  VALUES (NEW.id, NEW.email, COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email));
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
AFTER INSERT ON auth.users
FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- =========================================================
-- DOMAIN TABLES
-- =========================================================
CREATE TABLE public.customers (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id   UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  name         TEXT NOT NULL,
  type         public.customer_type NOT NULL DEFAULT 'residential',
  contact_name TEXT,
  email        TEXT,
  phone        TEXT,
  billing_address TEXT,
  notes        TEXT,
  lifetime_value NUMERIC(12,2) NOT NULL DEFAULT 0,
  status       public.customer_status NOT NULL DEFAULT 'active',
  created_by   UUID REFERENCES auth.users(id),
  created_at   TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at   TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE public.properties (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id   UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  customer_id  UUID NOT NULL REFERENCES public.customers(id) ON DELETE CASCADE,
  name         TEXT,
  address      TEXT NOT NULL,
  city         TEXT,
  region       TEXT,
  postal_code  TEXT,
  type         public.property_type NOT NULL DEFAULT 'single_family',
  units        INT DEFAULT 1,
  square_feet  INT,
  notes        TEXT,
  status       TEXT NOT NULL DEFAULT 'active',
  created_by   UUID REFERENCES auth.users(id),
  created_at   TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at   TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE public.equipment (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id      UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  property_id     UUID NOT NULL REFERENCES public.properties(id) ON DELETE CASCADE,
  customer_id     UUID REFERENCES public.customers(id) ON DELETE SET NULL,
  type            TEXT NOT NULL,
  brand           TEXT,
  model           TEXT,
  serial_number   TEXT,
  installed_on    DATE,
  warranty_expires DATE,
  last_service_at TIMESTAMPTZ,
  next_service_due DATE,
  status          public.equipment_status NOT NULL DEFAULT 'operational',
  notes           TEXT,
  created_by      UUID REFERENCES auth.users(id),
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE public.technicians (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id    UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  user_id       UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  full_name     TEXT NOT NULL,
  email         TEXT,
  phone         TEXT,
  role_title    TEXT,
  skills        TEXT[] DEFAULT '{}',
  hourly_cost   NUMERIC(10,2),
  hourly_rate   NUMERIC(10,2),
  status        public.tech_status NOT NULL DEFAULT 'available',
  created_by    UUID REFERENCES auth.users(id),
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE public.warehouses (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id  UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  name        TEXT NOT NULL,
  address     TEXT,
  status      TEXT NOT NULL DEFAULT 'active',
  created_by  UUID REFERENCES auth.users(id),
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE public.vans (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id    UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  name          TEXT NOT NULL,
  license_plate TEXT,
  make          TEXT,
  model         TEXT,
  year          INT,
  technician_id UUID REFERENCES public.technicians(id) ON DELETE SET NULL,
  status        TEXT NOT NULL DEFAULT 'active',
  created_by    UUID REFERENCES auth.users(id),
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE public.inventory_locations (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id    UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  name          TEXT NOT NULL,
  type          public.location_type NOT NULL DEFAULT 'warehouse',
  warehouse_id  UUID REFERENCES public.warehouses(id) ON DELETE CASCADE,
  van_id        UUID REFERENCES public.vans(id) ON DELETE CASCADE,
  status        TEXT NOT NULL DEFAULT 'active',
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE public.inventory_items (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id      UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  sku             TEXT NOT NULL,
  name            TEXT NOT NULL,
  description     TEXT,
  category        TEXT,
  unit            TEXT DEFAULT 'each',
  unit_cost       NUMERIC(10,2) NOT NULL DEFAULT 0,
  unit_price      NUMERIC(10,2) NOT NULL DEFAULT 0,
  reorder_point   INT NOT NULL DEFAULT 0,
  status          TEXT NOT NULL DEFAULT 'active',
  created_by      UUID REFERENCES auth.users(id),
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (company_id, sku)
);

CREATE TABLE public.inventory_stock (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id    UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  item_id       UUID NOT NULL REFERENCES public.inventory_items(id) ON DELETE CASCADE,
  location_id   UUID NOT NULL REFERENCES public.inventory_locations(id) ON DELETE CASCADE,
  quantity      NUMERIC(12,2) NOT NULL DEFAULT 0,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (item_id, location_id)
);

CREATE TABLE public.inventory_transactions (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id      UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  item_id         UUID NOT NULL REFERENCES public.inventory_items(id) ON DELETE CASCADE,
  from_location_id UUID REFERENCES public.inventory_locations(id) ON DELETE SET NULL,
  to_location_id   UUID REFERENCES public.inventory_locations(id) ON DELETE SET NULL,
  type            public.inv_txn_type NOT NULL,
  quantity        NUMERIC(12,2) NOT NULL,
  reference       TEXT,
  job_id          UUID,
  notes           TEXT,
  status          TEXT NOT NULL DEFAULT 'posted',
  created_by      UUID REFERENCES auth.users(id),
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE public.purchase_orders (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id    UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  po_number     TEXT NOT NULL,
  vendor_name   TEXT NOT NULL,
  vendor_email  TEXT,
  warehouse_id  UUID REFERENCES public.warehouses(id) ON DELETE SET NULL,
  subtotal      NUMERIC(12,2) NOT NULL DEFAULT 0,
  tax           NUMERIC(12,2) NOT NULL DEFAULT 0,
  total         NUMERIC(12,2) NOT NULL DEFAULT 0,
  expected_at   DATE,
  received_at   TIMESTAMPTZ,
  status        public.po_status NOT NULL DEFAULT 'draft',
  notes         TEXT,
  created_by    UUID REFERENCES auth.users(id),
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (company_id, po_number)
);

CREATE TABLE public.purchase_order_items (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id    UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  purchase_order_id UUID NOT NULL REFERENCES public.purchase_orders(id) ON DELETE CASCADE,
  item_id       UUID REFERENCES public.inventory_items(id) ON DELETE SET NULL,
  description   TEXT NOT NULL,
  quantity      NUMERIC(12,2) NOT NULL DEFAULT 1,
  unit_cost     NUMERIC(10,2) NOT NULL DEFAULT 0,
  total         NUMERIC(12,2) NOT NULL DEFAULT 0,
  received_qty  NUMERIC(12,2) NOT NULL DEFAULT 0,
  status        TEXT NOT NULL DEFAULT 'pending',
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE public.jobs (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id      UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  job_number      TEXT NOT NULL,
  customer_id     UUID NOT NULL REFERENCES public.customers(id) ON DELETE CASCADE,
  property_id     UUID REFERENCES public.properties(id) ON DELETE SET NULL,
  equipment_id    UUID REFERENCES public.equipment(id) ON DELETE SET NULL,
  technician_id   UUID REFERENCES public.technicians(id) ON DELETE SET NULL,
  title           TEXT NOT NULL,
  description     TEXT,
  scheduled_start TIMESTAMPTZ,
  scheduled_end   TIMESTAMPTZ,
  actual_start    TIMESTAMPTZ,
  actual_end      TIMESTAMPTZ,
  priority        public.job_priority NOT NULL DEFAULT 'medium',
  status          public.job_status NOT NULL DEFAULT 'scheduled',
  total_value     NUMERIC(12,2) NOT NULL DEFAULT 0,
  created_by      UUID REFERENCES auth.users(id),
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (company_id, job_number)
);

CREATE TABLE public.job_photos (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id  UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  job_id      UUID NOT NULL REFERENCES public.jobs(id) ON DELETE CASCADE,
  url         TEXT NOT NULL,
  caption     TEXT,
  taken_at    TIMESTAMPTZ DEFAULT now(),
  status      TEXT NOT NULL DEFAULT 'active',
  created_by  UUID REFERENCES auth.users(id),
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE public.estimates (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id      UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  estimate_number TEXT NOT NULL,
  customer_id     UUID NOT NULL REFERENCES public.customers(id) ON DELETE CASCADE,
  property_id     UUID REFERENCES public.properties(id) ON DELETE SET NULL,
  job_id          UUID REFERENCES public.jobs(id) ON DELETE SET NULL,
  title           TEXT NOT NULL,
  notes           TEXT,
  subtotal        NUMERIC(12,2) NOT NULL DEFAULT 0,
  tax             NUMERIC(12,2) NOT NULL DEFAULT 0,
  total           NUMERIC(12,2) NOT NULL DEFAULT 0,
  expires_at      DATE,
  approved_at     TIMESTAMPTZ,
  status          public.estimate_status NOT NULL DEFAULT 'draft',
  created_by      UUID REFERENCES auth.users(id),
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (company_id, estimate_number)
);

CREATE TABLE public.estimate_options (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id    UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  estimate_id   UUID NOT NULL REFERENCES public.estimates(id) ON DELETE CASCADE,
  name          TEXT NOT NULL,
  description   TEXT,
  amount        NUMERIC(12,2) NOT NULL DEFAULT 0,
  is_selected   BOOLEAN NOT NULL DEFAULT false,
  sort_order    INT NOT NULL DEFAULT 0,
  status        TEXT NOT NULL DEFAULT 'active',
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE public.invoices (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id      UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  invoice_number  TEXT NOT NULL,
  customer_id     UUID NOT NULL REFERENCES public.customers(id) ON DELETE CASCADE,
  job_id          UUID REFERENCES public.jobs(id) ON DELETE SET NULL,
  estimate_id     UUID REFERENCES public.estimates(id) ON DELETE SET NULL,
  issued_at       DATE NOT NULL DEFAULT CURRENT_DATE,
  due_at          DATE,
  subtotal        NUMERIC(12,2) NOT NULL DEFAULT 0,
  tax             NUMERIC(12,2) NOT NULL DEFAULT 0,
  total           NUMERIC(12,2) NOT NULL DEFAULT 0,
  amount_paid     NUMERIC(12,2) NOT NULL DEFAULT 0,
  balance_due     NUMERIC(12,2) NOT NULL DEFAULT 0,
  status          public.invoice_status NOT NULL DEFAULT 'draft',
  notes           TEXT,
  created_by      UUID REFERENCES auth.users(id),
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (company_id, invoice_number)
);

CREATE TABLE public.payments (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id    UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  invoice_id    UUID NOT NULL REFERENCES public.invoices(id) ON DELETE CASCADE,
  customer_id   UUID NOT NULL REFERENCES public.customers(id) ON DELETE CASCADE,
  amount        NUMERIC(12,2) NOT NULL,
  method        public.payment_method NOT NULL DEFAULT 'card',
  reference     TEXT,
  paid_at       TIMESTAMPTZ NOT NULL DEFAULT now(),
  status        public.payment_status NOT NULL DEFAULT 'completed',
  created_by    UUID REFERENCES auth.users(id),
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE public.service_tickets (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id    UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  ticket_number TEXT NOT NULL,
  customer_id   UUID NOT NULL REFERENCES public.customers(id) ON DELETE CASCADE,
  property_id   UUID REFERENCES public.properties(id) ON DELETE SET NULL,
  subject       TEXT NOT NULL,
  description   TEXT,
  assigned_to   UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  priority      public.ticket_priority NOT NULL DEFAULT 'medium',
  status        public.ticket_status NOT NULL DEFAULT 'open',
  resolved_at   TIMESTAMPTZ,
  created_by    UUID REFERENCES auth.users(id),
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (company_id, ticket_number)
);

CREATE TABLE public.sales_opportunities (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id    UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  customer_id   UUID REFERENCES public.customers(id) ON DELETE SET NULL,
  name          TEXT NOT NULL,
  value         NUMERIC(12,2) NOT NULL DEFAULT 0,
  stage         public.opportunity_stage NOT NULL DEFAULT 'new_lead',
  probability   INT NOT NULL DEFAULT 10,
  expected_close DATE,
  owner_id      UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  notes         TEXT,
  status        TEXT NOT NULL DEFAULT 'open',
  created_by    UUID REFERENCES auth.users(id),
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE public.maintenance_agreements (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id    UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  customer_id   UUID NOT NULL REFERENCES public.customers(id) ON DELETE CASCADE,
  property_id   UUID REFERENCES public.properties(id) ON DELETE SET NULL,
  name          TEXT NOT NULL,
  frequency     TEXT NOT NULL DEFAULT 'quarterly',
  visits_per_year INT NOT NULL DEFAULT 4,
  annual_price  NUMERIC(12,2) NOT NULL DEFAULT 0,
  start_date    DATE NOT NULL DEFAULT CURRENT_DATE,
  end_date      DATE,
  next_visit    DATE,
  status        public.agreement_status NOT NULL DEFAULT 'active',
  created_by    UUID REFERENCES auth.users(id),
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE public.reviews (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id    UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  customer_id   UUID REFERENCES public.customers(id) ON DELETE SET NULL,
  job_id        UUID REFERENCES public.jobs(id) ON DELETE SET NULL,
  technician_id UUID REFERENCES public.technicians(id) ON DELETE SET NULL,
  rating        INT NOT NULL CHECK (rating BETWEEN 1 AND 5),
  comment       TEXT,
  source        TEXT DEFAULT 'in_app',
  status        TEXT NOT NULL DEFAULT 'published',
  created_by    UUID REFERENCES auth.users(id),
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE public.notifications (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id    UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  user_id       UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  type          public.notification_type NOT NULL DEFAULT 'system',
  title         TEXT NOT NULL,
  body          TEXT,
  link          TEXT,
  read_at       TIMESTAMPTZ,
  status        TEXT NOT NULL DEFAULT 'unread',
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Self-reference inventory_transactions.job_id
ALTER TABLE public.inventory_transactions
  ADD CONSTRAINT inventory_transactions_job_fk
  FOREIGN KEY (job_id) REFERENCES public.jobs(id) ON DELETE SET NULL;

-- =========================================================
-- updated_at TRIGGERS
-- =========================================================
DO $$
DECLARE
  t TEXT;
  tables TEXT[] := ARRAY[
    'companies','profiles','customers','properties','equipment','technicians',
    'warehouses','vans','inventory_locations','inventory_items','inventory_stock',
    'inventory_transactions','purchase_orders','purchase_order_items',
    'jobs','job_photos','estimates','estimate_options','invoices','payments',
    'service_tickets','sales_opportunities','maintenance_agreements','reviews','notifications'
  ];
BEGIN
  FOREACH t IN ARRAY tables LOOP
    EXECUTE format('CREATE TRIGGER set_updated_at_%I BEFORE UPDATE ON public.%I FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();', t, t);
  END LOOP;
END $$;

-- =========================================================
-- INDEXES
-- =========================================================
CREATE INDEX idx_profiles_company ON public.profiles(company_id);
CREATE INDEX idx_user_roles_user ON public.user_roles(user_id);
CREATE INDEX idx_user_roles_company ON public.user_roles(company_id);
CREATE INDEX idx_customers_company ON public.customers(company_id);
CREATE INDEX idx_properties_company ON public.properties(company_id);
CREATE INDEX idx_properties_customer ON public.properties(customer_id);
CREATE INDEX idx_equipment_company ON public.equipment(company_id);
CREATE INDEX idx_equipment_property ON public.equipment(property_id);
CREATE INDEX idx_technicians_company ON public.technicians(company_id);
CREATE INDEX idx_jobs_company ON public.jobs(company_id);
CREATE INDEX idx_jobs_customer ON public.jobs(customer_id);
CREATE INDEX idx_jobs_tech ON public.jobs(technician_id);
CREATE INDEX idx_jobs_status ON public.jobs(status);
CREATE INDEX idx_jobs_scheduled ON public.jobs(scheduled_start);
CREATE INDEX idx_estimates_company ON public.estimates(company_id);
CREATE INDEX idx_invoices_company ON public.invoices(company_id);
CREATE INDEX idx_invoices_customer ON public.invoices(customer_id);
CREATE INDEX idx_payments_invoice ON public.payments(invoice_id);
CREATE INDEX idx_inv_items_company ON public.inventory_items(company_id);
CREATE INDEX idx_inv_stock_item ON public.inventory_stock(item_id);
CREATE INDEX idx_po_company ON public.purchase_orders(company_id);
CREATE INDEX idx_tickets_company ON public.service_tickets(company_id);
CREATE INDEX idx_opps_company ON public.sales_opportunities(company_id);
CREATE INDEX idx_agreements_company ON public.maintenance_agreements(company_id);
CREATE INDEX idx_reviews_company ON public.reviews(company_id);
CREATE INDEX idx_notifications_user ON public.notifications(user_id);

-- =========================================================
-- ROW LEVEL SECURITY
-- =========================================================
ALTER TABLE public.companies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.properties ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.equipment ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.technicians ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.warehouses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.inventory_locations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.inventory_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.inventory_stock ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.inventory_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.purchase_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.purchase_order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.job_photos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.estimates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.estimate_options ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.service_tickets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sales_opportunities ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.maintenance_agreements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- COMPANIES policies
CREATE POLICY "Members view own company" ON public.companies
  FOR SELECT TO authenticated USING (id = public.get_my_company_id());
CREATE POLICY "Admins update own company" ON public.companies
  FOR UPDATE TO authenticated
  USING (id = public.get_my_company_id() AND public.is_company_admin(auth.uid()));
CREATE POLICY "Anyone can create a company" ON public.companies
  FOR INSERT TO authenticated WITH CHECK (true);

-- PROFILES policies
CREATE POLICY "Users view own profile" ON public.profiles
  FOR SELECT TO authenticated USING (id = auth.uid());
CREATE POLICY "Members view company profiles" ON public.profiles
  FOR SELECT TO authenticated USING (company_id IS NOT NULL AND company_id = public.get_my_company_id());
CREATE POLICY "Users update own profile" ON public.profiles
  FOR UPDATE TO authenticated USING (id = auth.uid());

-- USER_ROLES policies
CREATE POLICY "Members view company roles" ON public.user_roles
  FOR SELECT TO authenticated USING (company_id = public.get_my_company_id());
CREATE POLICY "Admins manage company roles" ON public.user_roles
  FOR ALL TO authenticated
  USING (company_id = public.get_my_company_id() AND public.is_company_admin(auth.uid()))
  WITH CHECK (company_id = public.get_my_company_id() AND public.is_company_admin(auth.uid()));

-- Generic tenant-isolation policies for all domain tables
DO $$
DECLARE
  t TEXT;
  tables TEXT[] := ARRAY[
    'customers','properties','equipment','technicians','warehouses','vans',
    'inventory_locations','inventory_items','inventory_stock','inventory_transactions',
    'purchase_orders','purchase_order_items','jobs','job_photos','estimates','estimate_options',
    'invoices','payments','service_tickets','sales_opportunities','maintenance_agreements','reviews'
  ];
BEGIN
  FOREACH t IN ARRAY tables LOOP
    EXECUTE format(
      'CREATE POLICY "Tenant access %1$s" ON public.%1$I FOR ALL TO authenticated USING (company_id = public.get_my_company_id()) WITH CHECK (company_id = public.get_my_company_id());',
      t
    );
  END LOOP;
END $$;

-- NOTIFICATIONS - per user within company
CREATE POLICY "Users view own notifications" ON public.notifications
  FOR SELECT TO authenticated
  USING (user_id = auth.uid() AND company_id = public.get_my_company_id());
CREATE POLICY "Users update own notifications" ON public.notifications
  FOR UPDATE TO authenticated
  USING (user_id = auth.uid() AND company_id = public.get_my_company_id());
CREATE POLICY "System can insert notifications" ON public.notifications
  FOR INSERT TO authenticated
  WITH CHECK (company_id = public.get_my_company_id());
CREATE POLICY "Users delete own notifications" ON public.notifications
  FOR DELETE TO authenticated
  USING (user_id = auth.uid() AND company_id = public.get_my_company_id());
