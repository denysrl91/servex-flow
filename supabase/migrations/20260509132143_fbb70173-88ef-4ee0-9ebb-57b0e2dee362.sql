
-- Projects
CREATE TABLE public.projects (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id uuid NOT NULL,
  name text NOT NULL,
  customer_id uuid,
  property_id uuid,
  project_manager_id uuid,
  status text NOT NULL DEFAULT 'planning',
  start_date date,
  end_date date,
  budget numeric NOT NULL DEFAULT 0,
  actual_cost numeric NOT NULL DEFAULT 0,
  description text,
  notes text,
  created_by uuid,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Tenant access projects" ON public.projects FOR ALL TO authenticated
  USING (company_id = get_my_company_id()) WITH CHECK (company_id = get_my_company_id());
CREATE TRIGGER trg_projects_updated BEFORE UPDATE ON public.projects
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- Installations
CREATE TABLE public.installations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id uuid NOT NULL,
  install_number text NOT NULL,
  customer_id uuid,
  property_id uuid,
  equipment_type text,
  brand text,
  model text,
  serial_number text,
  technician_id uuid,
  scheduled_date date,
  completed_date date,
  permit_number text,
  warranty_years integer DEFAULT 10,
  total_value numeric NOT NULL DEFAULT 0,
  status text NOT NULL DEFAULT 'scheduled',
  notes text,
  created_by uuid,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.installations ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Tenant access installations" ON public.installations FOR ALL TO authenticated
  USING (company_id = get_my_company_id()) WITH CHECK (company_id = get_my_company_id());
CREATE TRIGGER trg_installations_updated BEFORE UPDATE ON public.installations
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- Preventive Maintenance Schedules
CREATE TABLE public.pm_schedules (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id uuid NOT NULL,
  name text NOT NULL,
  customer_id uuid,
  property_id uuid,
  equipment_id uuid,
  agreement_id uuid,
  frequency text NOT NULL DEFAULT 'quarterly',
  visits_per_year integer NOT NULL DEFAULT 4,
  next_visit date,
  last_visit date,
  assigned_tech_id uuid,
  checklist text,
  status text NOT NULL DEFAULT 'active',
  notes text,
  created_by uuid,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.pm_schedules ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Tenant access pm_schedules" ON public.pm_schedules FOR ALL TO authenticated
  USING (company_id = get_my_company_id()) WITH CHECK (company_id = get_my_company_id());
CREATE TRIGGER trg_pm_schedules_updated BEFORE UPDATE ON public.pm_schedules
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- SLAs
CREATE TABLE public.slas (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id uuid NOT NULL,
  name text NOT NULL,
  commercial_account_id uuid,
  customer_id uuid,
  priority text NOT NULL DEFAULT 'medium',
  response_time_hours integer NOT NULL DEFAULT 4,
  resolution_time_hours integer NOT NULL DEFAULT 24,
  coverage_window text,
  penalty_amount numeric NOT NULL DEFAULT 0,
  effective_date date,
  expiration_date date,
  status text NOT NULL DEFAULT 'active',
  notes text,
  created_by uuid,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.slas ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Tenant access slas" ON public.slas FOR ALL TO authenticated
  USING (company_id = get_my_company_id()) WITH CHECK (company_id = get_my_company_id());
CREATE TRIGGER trg_slas_updated BEFORE UPDATE ON public.slas
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- Time entries
CREATE TABLE public.time_entries (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id uuid NOT NULL,
  technician_id uuid,
  job_id uuid,
  entry_date date NOT NULL DEFAULT CURRENT_DATE,
  clock_in timestamptz,
  clock_out timestamptz,
  hours numeric NOT NULL DEFAULT 0,
  entry_type text NOT NULL DEFAULT 'regular',
  billable boolean NOT NULL DEFAULT true,
  approved boolean NOT NULL DEFAULT false,
  approved_by uuid,
  notes text,
  status text NOT NULL DEFAULT 'pending',
  created_by uuid,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.time_entries ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Tenant access time_entries" ON public.time_entries FOR ALL TO authenticated
  USING (company_id = get_my_company_id()) WITH CHECK (company_id = get_my_company_id());
CREATE TRIGGER trg_time_entries_updated BEFORE UPDATE ON public.time_entries
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
