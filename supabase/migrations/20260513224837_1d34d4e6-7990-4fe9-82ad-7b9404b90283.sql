DROP POLICY IF EXISTS "Users insert own profile" ON public.profiles;
CREATE POLICY "Users insert own profile" ON public.profiles
  FOR INSERT TO authenticated
  WITH CHECK (id = auth.uid());

DROP POLICY IF EXISTS "Users update own profile" ON public.profiles;
CREATE POLICY "Users update own profile" ON public.profiles
  FOR UPDATE TO authenticated
  USING (id = auth.uid())
  WITH CHECK (
    (id = auth.uid())
    AND (NOT (company_id IS DISTINCT FROM (
      SELECT p.company_id FROM public.profiles p WHERE p.id = auth.uid()
    )))
  );

DROP POLICY IF EXISTS "Admins manage company roles" ON public.user_roles;
CREATE POLICY "Admins manage company roles" ON public.user_roles
  FOR ALL TO authenticated
  USING ((company_id = get_my_company_id()) AND is_company_admin(auth.uid(), company_id))
  WITH CHECK ((company_id = get_my_company_id()) AND is_company_admin(auth.uid(), company_id));