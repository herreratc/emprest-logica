-- Supabase schema for Emprest Lógica
-- Executar este script no SQL Editor ou via supabase cli para provisionar o banco.

create extension if not exists "pgcrypto";

-- Remove todos os dados mantendo a estrutura existente
do $$
declare
  t record;
begin
  for t in (
    select tablename
    from pg_tables
    where schemaname = 'public'
      and tablename in (
        'installments',
        'consortiums',
        'loans',
        'companies',
        'user_profiles'
      )
  ) loop
    execute format('truncate table public.%I restart identity cascade;', t.tablename);
  end loop;
exception when undefined_table then
  null;
end;
$$;

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = timezone('utc', now());
  return new;
end;
$$;


create table if not exists public.companies (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  nickname text not null,
  cnpj text not null,
  address text not null,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  constraint companies_cnpj_unique unique (cnpj)
);

create table if not exists public.loans (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references public.companies(id) on delete cascade,
  reference text not null,
  bank text not null,
  total_value numeric(16,2) not null default 0,
  start_date date not null,
  end_date date not null,
  status text not null check (status in ('ativo', 'finalizado')),
  operation text not null,
  operation_number text not null,
  upfront_value numeric(16,2) not null default 0,
  financed_value numeric(16,2) not null default 0,
  interest_value numeric(16,2) not null default 0,
  installments integer not null default 0,
  installment_value numeric(16,2) not null default 0,
  installment_value_no_interest numeric(16,2) not null default 0,
  interest_per_installment numeric(16,2) not null default 0,
  nominal_rate numeric(8,4) not null default 0,
  effective_annual_rate numeric(8,4) not null default 0,
  paid_installments integer not null default 0,
  remaining_installments integer not null default 0,
  amount_paid numeric(16,2) not null default 0,
  amount_to_pay numeric(16,2) not null default 0,
  as_of_date date not null,
  contract_start date not null,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.consortiums (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references public.companies(id) on delete cascade,
  observation text not null,
  group_code text not null,
  quota text not null,
  outstanding_balance numeric(16,2) not null default 0,
  current_installment_value numeric(16,2) not null default 0,
  installments_to_pay integer not null default 0,
  administrator text not null,
  credit_to_receive numeric(16,2) not null default 0,
  category text not null,
  total_installments integer not null default 0,
  amount_paid numeric(16,2) not null default 0,
  amount_to_pay numeric(16,2) not null default 0,
  paid_installments integer not null default 0,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.installments (
  id uuid primary key default gen_random_uuid(),
  contract_type text not null check (contract_type in ('loan', 'consortium')),
  contract_id uuid not null,
  sequence integer not null,
  date date not null,
  value numeric(16,2) not null default 0,
  status text not null check (status in ('paga', 'pendente', 'vencida')),
  interest numeric(16,2) not null default 0,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  constraint installments_unique_sequence unique (contract_type, contract_id, sequence)
);

create table if not exists public.user_profiles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete set null,
  name text not null,
  email text not null,
  role text not null check (role in ('master', 'gestor', 'financeiro')),
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  constraint user_profiles_email_unique unique (email)
);

create index if not exists loans_company_id_idx on public.loans (company_id);
create index if not exists consortiums_company_id_idx on public.consortiums (company_id);
create index if not exists installments_contract_idx on public.installments (contract_type, contract_id);
create index if not exists loans_status_idx on public.loans (status);
create index if not exists installments_status_idx on public.installments (status);

create trigger companies_set_updated_at
before update on public.companies
for each row
execute function public.set_updated_at();

create trigger loans_set_updated_at
before update on public.loans
for each row
execute function public.set_updated_at();

create trigger consortiums_set_updated_at
before update on public.consortiums
for each row
execute function public.set_updated_at();

create trigger installments_set_updated_at
before update on public.installments
for each row
execute function public.set_updated_at();

create trigger user_profiles_set_updated_at
before update on public.user_profiles
for each row
execute function public.set_updated_at();

alter table public.companies enable row level security;
alter table public.loans enable row level security;
alter table public.consortiums enable row level security;
alter table public.installments enable row level security;
alter table public.user_profiles enable row level security;

create policy "companies_select_anon" on public.companies
for select
using (true);

create policy "companies_mutate_authenticated" on public.companies
for all
using (auth.role() = 'authenticated')
with check (auth.role() = 'authenticated');

create policy "loans_select_anon" on public.loans
for select
using (true);

create policy "loans_mutate_authenticated" on public.loans
for all
using (auth.role() = 'authenticated')
with check (auth.role() = 'authenticated');

create policy "consortiums_select_anon" on public.consortiums
for select
using (true);

create policy "consortiums_mutate_authenticated" on public.consortiums
for all
using (auth.role() = 'authenticated')
with check (auth.role() = 'authenticated');

create policy "installments_select_anon" on public.installments
for select
using (true);

create policy "installments_mutate_authenticated" on public.installments
for all
using (auth.role() = 'authenticated')
with check (auth.role() = 'authenticated');

create policy "user_profiles_select_authenticated" on public.user_profiles
for select
using (auth.role() = 'authenticated');

create policy "user_profiles_mutate_authenticated" on public.user_profiles
for all
using (auth.role() = 'authenticated')
with check (auth.role() = 'authenticated');
