create table if not exists public.companies (
  id uuid primary key default gen_random_uuid(),
  name text not null default 'My HVAC Company',
  email text,
  phone text,
  address text,
  logo_url text,
  created_by uuid references auth.users(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  company_id uuid references public.companies(id) on delete set null,
  full_name text,
  email text,
  phone text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.user_roles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  company_id uuid not null references public.companies(id) on delete cascade,
  role text not null default 'owner',
  created_at timestamptz not null default now(),
  unique(user_id, company_id, role)
);

alter table public.companies enable row level security;
alter table public.profiles enable row level security;
alter table public.user_roles enable row level security;

drop policy if exists "users can read own profile" on public.profiles;
create policy "users can read own profile"
on public.profiles for select
using (auth.uid() = id);

drop policy if exists "users can insert own profile" on public.profiles;
create policy "users can insert own profile"
on public.profiles for insert
with check (auth.uid() = id);

drop policy if exists "users can update own profile" on public.profiles;
create policy "users can update own profile"
on public.profiles for update
using (auth.uid() = id)
with check (auth.uid() = id);

drop policy if exists "users can create companies" on public.companies;
create policy "users can create companies"
on public.companies for insert
with check (auth.uid() = created_by);

drop policy if exists "company members can read companies" on public.companies;
create policy "company members can read companies"
on public.companies for select
using (
  id in (
    select company_id from public.profiles where profiles.id = auth.uid()
  )
  or created_by = auth.uid()
);

drop policy if exists "company owners can update companies" on public.companies;
create policy "company owners can update companies"
on public.companies for update
using (
  created_by = auth.uid()
  or id in (
    select company_id from public.user_roles
    where user_id = auth.uid()
    and role in ('owner','admin')
  )
);

drop policy if exists "users can read own roles" on public.user_roles;
create policy "users can read own roles"
on public.user_roles for select
using (user_id = auth.uid());

drop policy if exists "users can insert own owner role" on public.user_roles;
create policy "users can insert own owner role"
on public.user_roles for insert
with check (user_id = auth.uid());
