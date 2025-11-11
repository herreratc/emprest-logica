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

drop table if exists public.installments cascade;
drop table if exists public.consortiums cascade;

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

insert into public.companies (id, name, nickname, cnpj, address)
values
  ('11111111-2222-4333-9444-aaaaaaaaaaaa', 'Lógica Distribuições', 'Lógica Dist', '12.345.678/0001-90', 'Rua das Inovações, 123 - São Paulo/SP'),
  ('22222222-3333-5444-9555-bbbbbbbbbbbb', 'Lógica Distribuidora', 'Distribuidora', '34.567.890/0001-12', 'Av. Tecnologia, 987 - Campinas/SP'),
  ('33333333-4444-6555-9666-cccccccccccc', 'Lógica Distribuidora Transporte A.', 'Transporte A.', '45.678.901/0001-23', 'Rod. BR-050, Km 123 - Uberaba/MG')
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
    '44444444-5555-6666-7777-000000000001',
    '11111111-2222-4333-9444-aaaaaaaaaaaa',
    'Capital de Giro FGI 237/1497/2806',
    'Bradesco',
    731292.36,
    '2023-08-15',
    '2027-05-15',
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
    1.2500,
    16.0800,
    28,
    18,
    445134.48,
    286157.88,
    '2024-09-01',
    '2023-07-16'
  ),
  (
    '44444444-5555-6666-7777-000000000002',
    '11111111-2222-4333-9444-aaaaaaaaaaaa',
    'Capital de Giro FGI 282/1499/3047',
    'Bradesco',
    470871.54,
    '2024-01-25',
    '2027-12-25',
    'ativo',
    'Capital de Giro FGI',
    '282/1499/3047',
    336860.38,
    470871.54,
    134011.16,
    48,
    9814.83,
    7022.93,
    2791.90,
    1.1000,
    14.3200,
    11,
    37,
    105779.64,
    365091.90,
    '2024-09-01',
    '2023-12-26'
  ),
  (
    '44444444-5555-6666-7777-000000000003',
    '11111111-2222-4333-9444-aaaaaaaaaaaa',
    'BNDES 282/3043/2268',
    'Bradesco Matriz',
    269997.60,
    '2023-06-15',
    '2026-05-15',
    'ativo',
    'BNDES',
    '282/3043/2268',
    0.00,
    269997.60,
    58425.60,
    36,
    7499.93,
    5877.00,
    1622.93,
    0.9500,
    12.0000,
    13,
    23,
    96227.80,
    173769.80,
    '2024-09-01',
    '2023-05-08'
  ),
  (
    '44444444-5555-6666-7777-000000000004',
    '22222222-3333-5444-9555-bbbbbbbbbbbb',
    'CDC 297/00174/2291',
    'Bradesco Matriz',
    590000.00,
    '2020-12-25',
    '2023-11-25',
    'ativo',
    'CDC',
    '297/00174/2291',
    0.00,
    590000.00,
    102960.00,
    36,
    16415.28,
    13555.28,
    2860.00,
    0.8000,
    10.0200,
    18,
    18,
    295490.00,
    294510.00,
    '2024-09-01',
    '2020-11-20'
  ),
  (
    '44444444-5555-6666-7777-000000000005',
    '22222222-3333-5444-9555-bbbbbbbbbbbb',
    'BNDES 269/3332/1649',
    'Bradesco Transporte',
    581922.00,
    '2022-01-14',
    '2026-12-14',
    'ativo',
    'BNDES',
    '269/3332/1649',
    0.00,
    581922.00,
    129282.00,
    60,
    9698.70,
    7544.00,
    2154.70,
    0.7800,
    9.7500,
    30,
    30,
    290961.00,
    290961.00,
    '2024-09-01',
    '2021-12-14'
  ),
  (
    '44444444-5555-6666-7777-000000000006',
    '33333333-4444-6555-9666-cccccccccccc',
    'CDC 278/3302/5517',
    'Bradesco Transporte',
    247000.00,
    '2021-11-07',
    '2024-10-07',
    'ativo',
    'CDC (Produtor)',
    '278/3302/5517',
    0.00,
    247000.00,
    39360.00,
    36,
    7134.56,
    6041.23,
    1093.33,
    0.6800,
    8.4500,
    17,
    19,
    123500.00,
    123500.00,
    '2024-09-01',
    '2021-10-07'
  )
on conflict (id) do nothing;

insert into public.consortiums (
  id,
  company_id,
  observation,
  group_code,
  quota,
  outstanding_balance,
  current_installment_value,
  installments_to_pay,
  administrator,
  credit_to_receive,
  category,
  total_installments,
  amount_paid,
  amount_to_pay,
  paid_installments
)
values
  (
    '55555555-6666-7777-8888-000000000001',
    '11111111-2222-4333-9444-aaaaaaaaaaaa',
    'Caminhão placa PVC-0G90',
    '10274',
    '221',
    8228.75,
    1408.37,
    6,
    'Bradesco',
    0.00,
    'VEICULO',
    6,
    0.00,
    8228.75,
    0
  ),
  (
    '55555555-6666-7777-8888-000000000002',
    '11111111-2222-4333-9444-aaaaaaaaaaaa',
    'Virtus Lincoln',
    '40063',
    '101',
    22527.18,
    949.51,
    24,
    'Bradesco',
    0.00,
    'VEICULO',
    24,
    0.00,
    22527.18,
    0
  ),
  (
    '55555555-6666-7777-8888-000000000003',
    '11111111-2222-4333-9444-aaaaaaaaaaaa',
    'Compass Leandro',
    '70196',
    '166',
    86224.75,
    5373.60,
    23,
    'Santander',
    0.00,
    'VEICULO',
    23,
    0.00,
    86224.75,
    0
  ),
  (
    '55555555-6666-7777-8888-000000000004',
    '11111111-2222-4333-9444-aaaaaaaaaaaa',
    'Caminhão placa PWO-1F23',
    '10724',
    '222',
    130564.26,
    3264.68,
    40,
    'Itaú (Matriz)',
    185586.06,
    'MAQUINAS',
    40,
    0.00,
    130564.26,
    0
  ),
  (
    '55555555-6666-7777-8888-000000000005',
    '11111111-2222-4333-9444-aaaaaaaaaaaa',
    'Mercedes Leandro 188',
    '33231',
    '188',
    204772.00,
    3656.00,
    56,
    'Santander',
    0.00,
    'VEICULO',
    56,
    0.00,
    204772.00,
    0
  ),
  (
    '55555555-6666-7777-8888-000000000006',
    '11111111-2222-4333-9444-aaaaaaaaaaaa',
    'Mercedes Leandro 242',
    '33552',
    '242',
    611605.21,
    2407.47,
    56,
    'Bama',
    0.00,
    'VEICULO',
    56,
    0.00,
    611605.21,
    0
  )
on conflict (id) do nothing;

insert into public.installments (
  id,
  contract_type,
  contract_id,
  sequence,
  date,
  value,
  status,
  interest
)
values
  ('66666666-7777-8888-9999-000000000001', 'loan', '44444444-5555-6666-7777-000000000001', 28, '2024-07-26', 15897.66, 'paga', 4506.05),
  ('66666666-7777-8888-9999-000000000002', 'loan', '44444444-5555-6666-7777-000000000001', 29, '2024-08-26', 15897.66, 'pendente', 4012.11),
  ('66666666-7777-8888-9999-000000000003', 'loan', '44444444-5555-6666-7777-000000000002', 11, '2024-08-25', 9814.83, 'paga', 2791.90),
  ('66666666-7777-8888-9999-000000000004', 'loan', '44444444-5555-6666-7777-000000000002', 12, '2024-09-25', 9814.83, 'pendente', 2791.90),
  ('66666666-7777-8888-9999-000000000005', 'loan', '44444444-5555-6666-7777-000000000003', 13, '2024-07-15', 7499.93, 'paga', 1622.93),
  ('66666666-7777-8888-9999-000000000006', 'loan', '44444444-5555-6666-7777-000000000003', 14, '2024-08-15', 7499.93, 'pendente', 1622.93),
  ('66666666-7777-8888-9999-000000000007', 'loan', '44444444-5555-6666-7777-000000000004', 18, '2024-07-25', 16415.28, 'paga', 2860.00),
  ('66666666-7777-8888-9999-000000000008', 'loan', '44444444-5555-6666-7777-000000000004', 19, '2024-08-25', 16415.28, 'pendente', 2860.00),
  ('66666666-7777-8888-9999-000000000009', 'loan', '44444444-5555-6666-7777-000000000005', 31, '2024-07-14', 9698.70, 'paga', 2154.70),
  ('66666666-7777-8888-9999-000000000010', 'loan', '44444444-5555-6666-7777-000000000005', 32, '2024-08-14', 9698.70, 'pendente', 2154.70),
  ('66666666-7777-8888-9999-000000000011', 'loan', '44444444-5555-6666-7777-000000000006', 18, '2024-07-07', 7134.56, 'paga', 1093.33),
  ('66666666-7777-8888-9999-000000000012', 'loan', '44444444-5555-6666-7777-000000000006', 19, '2024-08-07', 7134.56, 'pendente', 1093.33),
  ('66666666-7777-8888-9999-000000000013', 'consortium', '55555555-6666-7777-8888-000000000001', 1, '2024-08-15', 1408.37, 'pendente', 0),
  ('66666666-7777-8888-9999-000000000014', 'consortium', '55555555-6666-7777-8888-000000000002', 1, '2024-08-20', 949.51, 'pendente', 0),
  ('66666666-7777-8888-9999-000000000015', 'consortium', '55555555-6666-7777-8888-000000000003', 1, '2024-08-25', 5373.60, 'pendente', 0),
  ('66666666-7777-8888-9999-000000000016', 'consortium', '55555555-6666-7777-8888-000000000004', 1, '2024-08-30', 3264.68, 'pendente', 0),
  ('66666666-7777-8888-9999-000000000017', 'consortium', '55555555-6666-7777-8888-000000000005', 1, '2024-08-18', 3656.00, 'pendente', 0),
  ('66666666-7777-8888-9999-000000000018', 'consortium', '55555555-6666-7777-8888-000000000006', 1, '2024-08-22', 2407.47, 'pendente', 0)
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
