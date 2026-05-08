-- Generic per-module records table for new modules (AI Brain, Communications, Documents, Memberships, Projects, Installations, Forms & Checklists, Fleet, Financing, Membership Billing, Vendors, Payroll, Time Tracking, Commissions, Training, Commercial Accounts, Assets, Locations, SLA, Preventive Maintenance, Customer Portal, Online Booking, Reviews, Notifications, Executive Dashboard, Forecasting, BI, Integrations, API Access, Automation)
CREATE TABLE public.module_records (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  company_id uuid NOT NULL,
  module_key text NOT NULL,
  title text NOT NULL,
  subtitle text,
  status text NOT NULL DEFAULT 'active',
  notes text,
  data jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_by uuid,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_module_records_company_module ON public.module_records (company_id, module_key, created_at DESC);

ALTER TABLE public.module_records ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Tenant access module_records"
  ON public.module_records
  FOR ALL
  TO authenticated
  USING (company_id = public.get_my_company_id())
  WITH CHECK (company_id = public.get_my_company_id());

CREATE TRIGGER set_module_records_updated_at
  BEFORE UPDATE ON public.module_records
  FOR EACH ROW
  EXECUTE FUNCTION public.set_updated_at();