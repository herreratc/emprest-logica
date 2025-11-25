-- Scripts para incluir consórcios no Supabase a partir do SQL Editor.
-- Ajuste os nomes na CTE company_map caso os registros precisem ser vinculados a outras empresas.

with company_map as (
  select id, name
  from public.companies
  where name in ('Logica Distribuicao', 'Distribuidora Logica ZM')
)
insert into public.consortiums (
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
select
  company_map.id,
  data.observation,
  data.group_code,
  data.quota,
  data.outstanding_balance,
  data.current_installment_value,
  data.installments_to_pay,
  data.administrator,
  data.credit_to_receive,
  data.category,
  data.installments_to_pay,
  0::numeric(16,2) as amount_paid,
  data.outstanding_balance as amount_to_pay,
  0 as paid_installments
from company_map
join (
  values
    ('Logica Distribuicao', 'Caminhão placa PVC-2G90', '10274', '221', 8228.75, 1408.37, 6, 'Bradesco', 0, 'VEICULO'),
    ('Logica Distribuicao', 'Virtus Lincoln', '40063', '101', 22527.18, 949.51, 24, 'Bradesco', 0, 'VEICULO'),
    ('Logica Distribuicao', 'Consórcio Itaú grupo 40051 cota 119', '40051', '119', 150865.64, 1289.27, 117, 'Itaú (Matriz)', 185586.00, 'IMOVEIS'),
    ('Logica Distribuicao', 'Compass Leandro', '20179', '188', 13664.55, 816.89, 17, 'Itaú (Matriz)', 0, 'VEICULO'),
    ('Logica Distribuicao', 'Caminhão placa PUQ-7F52', '20303', '441', 14555.03, 1344.36, 11, 'Itaú (Filial)', 0, 'VEICULO'),
    ('Logica Distribuicao', 'Consórcio Sicoob grupo 1328 cota 79', '1328', '79', 229472.38, 2164.03, 106, 'Sicoob', 272277.00, 'VEICULO'),
    ('Logica Distribuicao', 'Consórcio Sicoob grupo 1414 cota 11', '1414', '11', 57854.11, 903.95, 64, 'Sicoob', 68408.00, 'VEICULO'),
    ('Logica Distribuicao', 'Consórcio Santander 84/30 - 1', '84', '30', 114298.80, 1360.70, 84, 'Santander', 100000.00, 'VEICULO'),
    ('Logica Distribuicao', 'Consórcio Santander 84/30 - 2', '84', '30', 114298.80, 1360.70, 84, 'Santander', 100000.00, 'VEICULO'),
    ('Logica Distribuicao', 'Consórcio Santander 84/30 - 3', '84', '30', 114298.80, 1360.70, 84, 'Santander', 100000.00, 'VEICULO'),
    ('Logica Distribuicao', 'Consórcio Santander 84/30 - 4', '84', '30', 114298.80, 1360.70, 84, 'Santander', 100000.00, 'VEICULO'),
    ('Logica Distribuicao', 'Consórcio Santander 84/30 - 5', '84', '30', 114298.80, 1360.70, 84, 'Santander', 100000.00, 'VEICULO'),
    ('Logica Distribuicao', 'Consórcio Santander 84/30 - 6', '84', '30', 114298.80, 1360.70, 84, 'Santander', 100000.00, 'VEICULO'),
    ('Logica Distribuicao', 'Mercedes Leandro 5029 · 0760-0', '5029', '0760-0', 29482.42, 440.04, 67, 'Bamaq', 0, 'VEICULO'),
    ('Logica Distribuicao', 'Mercedes Leandro 5029 · 0748-0', '5029', '0748-0', 29482.63, 440.04, 67, 'Bamaq', 0, 'VEICULO'),
    ('Logica Distribuicao', 'Mercedes Leandro 5029 · 0744-0', '5029', '0744-0', 29482.63, 440.04, 67, 'Bamaq', 0, 'VEICULO'),
    ('Logica Distribuicao', 'Mercedes Leandro 5029 · 0742-0', '5029', '0742-0', 29482.63, 440.04, 67, 'Bamaq', 0, 'VEICULO'),
    ('Logica Distribuicao', 'Mercedes Leandro 5026 · 4025-0', '5026', '4025-0', 32549.04, 2958.97, 11, 'Bamaq', 0, 'VEICULO'),
    ('Logica Distribuicao', 'Mercedes Leandro 5026 · 4024-0', '5026', '4024-0', 32549.04, 2958.97, 11, 'Bamaq', 0, 'VEICULO'),
    ('Distribuidora Logica ZM', 'Consórcio Itaú grupo 50041 cota 260', '50041', '260', 48159.72, 2247.85, 21, 'Itaú', 93816.00, 'VEICULO')
) as data (
  company_name,
  observation,
  group_code,
  quota,
  outstanding_balance,
  current_installment_value,
  installments_to_pay,
  administrator,
  credit_to_receive,
  category
)
on company_map.name = data.company_name;
