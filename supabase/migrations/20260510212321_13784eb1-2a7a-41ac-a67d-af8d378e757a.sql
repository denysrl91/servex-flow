
DROP POLICY IF EXISTS "Admins update own company" ON public.companies;
DROP POLICY IF EXISTS "Admins manage company roles" ON public.user_roles;
DROP FUNCTION IF EXISTS public.is_company_admin(uuid);

CREATE OR REPLACE FUNCTION public.is_company_admin(_user_id uuid, _company_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id
      AND company_id = _company_id
      AND role IN ('owner','admin')
  );
$$;

CREATE POLICY "Admins update own company"
ON public.companies
FOR UPDATE
USING (id = public.get_my_company_id() AND public.is_company_admin(auth.uid(), id))
WITH CHECK (id = public.get_my_company_id() AND public.is_company_admin(auth.uid(), id));

CREATE POLICY "Admins manage company roles"
ON public.user_roles
FOR ALL
USING (company_id = public.get_my_company_id() AND public.is_company_admin(auth.uid(), company_id))
WITH CHECK (company_id = public.get_my_company_id() AND public.is_company_admin(auth.uid(), company_id));

DROP POLICY IF EXISTS "Users update own profile" ON public.profiles;
CREATE POLICY "Users update own profile"
ON public.profiles
FOR UPDATE
USING (id = auth.uid())
WITH CHECK (
  id = auth.uid()
  AND company_id IS NOT DISTINCT FROM (SELECT p.company_id FROM public.profiles p WHERE p.id = auth.uid())
);

DROP POLICY IF EXISTS "Users insert own profile" ON public.profiles;
CREATE POLICY "Users insert own profile"
ON public.profiles
FOR INSERT
WITH CHECK (id = auth.uid());
