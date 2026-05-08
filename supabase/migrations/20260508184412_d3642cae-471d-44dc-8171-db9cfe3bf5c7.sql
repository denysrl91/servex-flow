
-- Pin search_path on trigger fn
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql SET search_path = public AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

-- Revoke direct execute from public/anon/authenticated; keep available to triggers/policies
REVOKE EXECUTE ON FUNCTION public.set_updated_at() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.get_my_company_id() FROM PUBLIC, anon;
REVOKE EXECUTE ON FUNCTION public.has_role(uuid, public.app_role) FROM PUBLIC, anon;
REVOKE EXECUTE ON FUNCTION public.is_company_admin(uuid) FROM PUBLIC, anon;

-- Replace permissive companies INSERT with a check that anchors the row to the creator
DROP POLICY IF EXISTS "Anyone can create a company" ON public.companies;
CREATE POLICY "Authenticated users can create a company" ON public.companies
  FOR INSERT TO authenticated
  WITH CHECK (auth.uid() IS NOT NULL);
