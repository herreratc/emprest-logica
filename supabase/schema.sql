-- Supabase schema for Emprest Lógica
-- Executar este script no SQL Editor ou via supabase cli para provisionar o banco.

create extension if not exists "pgcrypto";

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

create table if not exists public.installments (
  id uuid primary key default gen_random_uuid(),
  loan_id uuid not null references public.loans(id) on delete cascade,
  sequence integer not null,
  date date not null,
  value numeric(16,2) not null default 0,
  status text not null check (status in ('paga', 'pendente', 'vencida')),
  interest numeric(16,2) not null default 0,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  constraint installments_unique_sequence unique (loan_id, sequence)
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
create index if not exists installments_loan_id_idx on public.installments (loan_id);
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

insert into public.companies (id, name, nickname, cnpj, address)
values
  ('11111111-2222-4333-9444-aaaaaaaaaaaa', 'Lógica Distribuição', 'Lógica', '12.345.678/0001-90', 'Rua das Inovações, 123 - São Paulo/SP'),
  ('22222222-3333-5444-9555-bbbbbbbbbbbb', 'Lógica Serviços', 'Serviços', '98.765.432/0001-09', 'Av. Tecnologia, 987 - Campinas/SP')
on conflict (id) do nothing;

insert into public.loans (
  id,
  company_id,
  reference,
  bank,
  total_value,
  start_date,
  end_date,
  status,
  operation,
  operation_number,
  upfront_value,
  financed_value,
  interest_value,
  installments,
  installment_value,
  installment_value_no_interest,
  interest_per_installment,
  nominal_rate,
  effective_annual_rate,
  paid_installments,
  remaining_installments,
  amount_paid,
  amount_to_pay,
  as_of_date,
  contract_start
)
values
  (
    '33333333-4444-5555-9666-cccccccccccc',
    '11111111-2222-4333-9444-aaaaaaaaaaaa',
    'Operação Congelados',
    'Bradesco',
    731292.36,
    '2023-07-16',
    '2027-05-16',
    'ativo',
    'Capital de Giro FGI',
    '237/1497/2806',
    524013.85,
    731292.36,
    207278.51,
    46,
    15897.66,
    11391.61,
    4506.05,
    1.25,
    16.08,
    28,
    18,
    445134.48,
    286157.88,
    '2025-10-01',
    '2023-07-16'
  ),
  (
    '44444444-5555-6666-9777-dddddddddddd',
    '22222222-3333-5444-9555-bbbbbbbbbbbb',
    'Ampliação Data Center',
    'Banco do Brasil',
    520000.00,
    '2022-01-10',
    '2026-01-10',
    'ativo',
    'Inovação Digital',
    '145/8912/3201',
    320000.00,
    520000.00,
    200000.00,
    48,
    10833.33,
    6666.67,
    4166.66,
    1.15,
    14.80,
    20,
    28,
    216666.60,
    303333.40,
    '2025-10-01',
    '2022-01-10'
  ),
  (
    '55555555-6666-7777-9888-eeeeeeeeeeee',
    '11111111-2222-4333-9444-aaaaaaaaaaaa',
    'Renovação Frota',
    'Santander',
    280000.00,
    '2021-03-05',
    '2024-03-05',
    'finalizado',
    'Financiamento Frota',
    '874/3045/8812',
    180000.00,
    280000.00,
    100000.00,
    36,
    7777.78,
    5000.00,
    2777.78,
    1.05,
    12.70,
    36,
    0,
    280000.00,
    0.00,
    '2024-03-05',
    '2021-03-05'
  )
on conflict (id) do nothing;

insert into public.installments (
  id,
  loan_id,
  sequence,
  date,
  value,
  status,
  interest
)
values
  ('66666666-7777-8888-9999-ffffffffffff', '33333333-4444-5555-9666-cccccccccccc', 1, '2024-07-26', 15897.66, 'paga', 4506.05),
  ('77777777-8888-9999-aaaa-000000000000', '33333333-4444-5555-9666-cccccccccccc', 2, '2024-08-26', 15897.66, 'paga', 4012.11),
  ('88888888-9999-aaaa-bbbb-111111111111', '33333333-4444-5555-9666-cccccccccccc', 3, '2024-09-26', 15897.66, 'pendente', 3800.50),
  ('99999999-aaaa-bbbb-cccc-222222222222', '44444444-5555-6666-9777-dddddddddddd', 15, '2024-07-15', 10833.33, 'vencida', 4166.66),
  ('aaaaaaaa-bbbb-cccc-dddd-333333333333', '44444444-5555-6666-9777-dddddddddddd', 16, '2024-08-15', 10833.33, 'pendente', 4000.00),
  ('bbbbbbbb-cccc-dddd-eeee-444444444444', '55555555-6666-7777-9888-eeeeeeeeeeee', 35, '2023-12-05', 7777.78, 'paga', 2777.78)
on conflict (id) do nothing;

insert into public.user_profiles (
  id,
  name,
  email,
  role,
  user_id
)
values
  ('cccccccc-dddd-eeee-ffff-111111111111', 'Ana Souza', 'ana@logica.com', 'master', null),
  ('dddddddd-eeee-ffff-0000-222222222222', 'Bruno Lima', 'bruno@logica.com', 'gestor', null),
  ('eeeeeeee-ffff-0000-1111-333333333333', 'Carla Dias', 'carla@logica.com', 'financeiro', null)
on conflict (id) do nothing;
