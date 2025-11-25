-- Zera todas as tabelas transacionais mantendo os registros de empresas.
-- Execute no SQL Editor do Supabase ou via CLI quando precisar refazer a carga.

do $$
declare
  t record;
begin
  for t in (
    select tablename
    from pg_tables
    where schemaname = 'public'
      and tablename in ('installments', 'consortiums', 'loans', 'user_profiles')
  ) loop
    execute format('truncate table public.%I restart identity cascade;', t.tablename);
  end loop;
exception when undefined_table then
  null;
end;
$$;
