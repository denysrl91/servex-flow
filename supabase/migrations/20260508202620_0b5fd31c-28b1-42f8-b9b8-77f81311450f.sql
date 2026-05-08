DROP FUNCTION IF EXISTS public.bootstrap_company_for_current_user(text);

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
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