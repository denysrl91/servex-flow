CREATE OR REPLACE FUNCTION public.bootstrap_company_for_current_user(_company_name text DEFAULT NULL)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _uid uuid := auth.uid();
  _email text;
  _full_name text;
  _company_id uuid;
  _workspace_name text;
BEGIN
  IF _uid IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;

  SELECT email, full_name, company_id
  INTO _email, _full_name, _company_id
  FROM public.profiles
  WHERE id = _uid;

  IF _email IS NULL THEN
    SELECT email, COALESCE(raw_user_meta_data->>'full_name', raw_user_meta_data->>'name', email)
    INTO _email, _full_name
    FROM auth.users
    WHERE id = _uid;

    INSERT INTO public.profiles (id, email, full_name)
    VALUES (_uid, COALESCE(_email, 'user@example.com'), _full_name)
    ON CONFLICT (id) DO UPDATE
      SET email = COALESCE(public.profiles.email, EXCLUDED.email),
          full_name = COALESCE(public.profiles.full_name, EXCLUDED.full_name)
    RETURNING company_id INTO _company_id;
  END IF;

  IF _company_id IS NULL THEN
    _workspace_name := NULLIF(trim(_company_name), '');
    IF _workspace_name IS NULL THEN
      _workspace_name := COALESCE(NULLIF(trim(_full_name), '') || '''s HVAC Company', split_part(_email, '@', 1) || '''s HVAC Company', 'Servex HVAC Company');
    END IF;

    INSERT INTO public.companies (name, email)
    VALUES (_workspace_name, _email)
    RETURNING id INTO _company_id;

    UPDATE public.profiles
    SET company_id = _company_id,
        full_name = COALESCE(NULLIF(full_name, ''), _full_name),
        updated_at = now()
    WHERE id = _uid;
  END IF;

  INSERT INTO public.user_roles (user_id, company_id, role)
  VALUES (_uid, _company_id, 'owner')
  ON CONFLICT (user_id, company_id, role) DO NOTHING;

  RETURN _company_id;
END;
$$;

REVOKE ALL ON FUNCTION public.bootstrap_company_for_current_user(text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.bootstrap_company_for_current_user(text) TO authenticated;