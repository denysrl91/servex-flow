-- Extend job_status enum with the dispatch lifecycle states
ALTER TYPE public.job_status ADD VALUE IF NOT EXISTS 'unassigned';
ALTER TYPE public.job_status ADD VALUE IF NOT EXISTS 'on_the_way';
ALTER TYPE public.job_status ADD VALUE IF NOT EXISTS 'arrived';
ALTER TYPE public.job_status ADD VALUE IF NOT EXISTS 'invoiced';
ALTER TYPE public.job_status ADD VALUE IF NOT EXISTS 'paid';

-- Dispatch fields on jobs
ALTER TABLE public.jobs
  ADD COLUMN IF NOT EXISTS eta_minutes integer,
  ADD COLUMN IF NOT EXISTS duration_minutes integer DEFAULT 60,
  ADD COLUMN IF NOT EXISTS recurrence text,
  ADD COLUMN IF NOT EXISTS is_emergency boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS service_address text;

CREATE INDEX IF NOT EXISTS idx_jobs_company_scheduled ON public.jobs(company_id, scheduled_start);
CREATE INDEX IF NOT EXISTS idx_jobs_company_status ON public.jobs(company_id, status);