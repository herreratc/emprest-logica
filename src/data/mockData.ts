export type Company = {
  id: string;
  name: string;
  nickname: string;
  cnpj: string;
  address: string;
};

export type LoanStatus = "ativo" | "finalizado";

export type Loan = {
  id: string;
  companyId: string;
  reference: string;
  bank: string;
  totalValue: number;
  startDate: string;
  endDate: string;
  status: LoanStatus;
  operation: string;
  operationNumber: string;
  upfrontValue: number;
  financedValue: number;
  interestValue: number;
  installments: number;
  installmentValue: number;
  installmentValueNoInterest: number;
  interestPerInstallment: number;
  nominalRate: number;
  effectiveAnnualRate: number;
  paidInstallments: number;
  remainingInstallments: number;
  amountPaid: number;
  amountToPay: number;
  currentDate: string;
  contractStart: string;
};

export type InstallmentStatus = "paga" | "pendente" | "vencida";

export type Installment = {
  id: string;
  loanId: string;
  sequence: number;
  date: string;
  value: number;
  status: InstallmentStatus;
  interest: number;
};

export const companies: Company[] = [
  {
    id: "empresa-x",
    name: "Lógica Distribuição",
    nickname: "Lógica",
    cnpj: "12.345.678/0001-90",
    address: "Rua das Inovações, 123 - São Paulo/SP"
  },
  {
    id: "empresa-y",
    name: "Lógica Serviços",
    nickname: "Serviços",
    cnpj: "98.765.432/0001-09",
    address: "Av. Tecnologia, 987 - Campinas/SP"
  }
];

export const loans: Loan[] = [
  {
    id: "loan-1",
    companyId: "empresa-x",
    reference: "Operação Congelados",
    bank: "Bradesco",
    totalValue: 731292.36,
    startDate: "2023-07-16",
    endDate: "2027-05-16",
    status: "ativo",
    operation: "Capital de Giro FGI",
    operationNumber: "237/1497/2806",
    upfrontValue: 524013.85,
    financedValue: 731292.36,
    interestValue: 207278.51,
    installments: 46,
    installmentValue: 15897.66,
    installmentValueNoInterest: 11391.61,
    interestPerInstallment: 4506.05,
    nominalRate: 1.25,
    effectiveAnnualRate: 16.08,
    paidInstallments: 28,
    remainingInstallments: 18,
    amountPaid: 445134.48,
    amountToPay: 286157.88,
    currentDate: "2025-10-01",
    contractStart: "2023-07-16"
  },
  {
    id: "loan-2",
    companyId: "empresa-y",
    reference: "Ampliação Data Center",
    bank: "Banco do Brasil",
    totalValue: 520000.0,
    startDate: "2022-01-10",
    endDate: "2026-01-10",
    status: "ativo",
    operation: "Inovação Digital",
    operationNumber: "145/8912/3201",
    upfrontValue: 320000.0,
    financedValue: 520000.0,
    interestValue: 200000.0,
    installments: 48,
    installmentValue: 10833.33,
    installmentValueNoInterest: 6666.67,
    interestPerInstallment: 4166.66,
    nominalRate: 1.15,
    effectiveAnnualRate: 14.8,
    paidInstallments: 20,
    remainingInstallments: 28,
    amountPaid: 216666.6,
    amountToPay: 303333.4,
    currentDate: "2025-10-01",
    contractStart: "2022-01-10"
  },
  {
    id: "loan-3",
    companyId: "empresa-x",
    reference: "Renovação Frota",
    bank: "Santander",
    totalValue: 280000.0,
    startDate: "2021-03-05",
    endDate: "2024-03-05",
    status: "finalizado",
    operation: "Financiamento Frota",
    operationNumber: "874/3045/8812",
    upfrontValue: 180000.0,
    financedValue: 280000.0,
    interestValue: 100000.0,
    installments: 36,
    installmentValue: 7777.78,
    installmentValueNoInterest: 5000.0,
    interestPerInstallment: 2777.78,
    nominalRate: 1.05,
    effectiveAnnualRate: 12.7,
    paidInstallments: 36,
    remainingInstallments: 0,
    amountPaid: 280000.0,
    amountToPay: 0,
    currentDate: "2024-03-05",
    contractStart: "2021-03-05"
  }
];

export const installments: Installment[] = [
  {
    id: "inst-1",
    loanId: "loan-1",
    sequence: 1,
    date: "2024-07-26",
    value: 15897.66,
    status: "paga",
    interest: 4506.05
  },
  {
    id: "inst-2",
    loanId: "loan-1",
    sequence: 2,
    date: "2024-08-26",
    value: 15897.66,
    status: "paga",
    interest: 4012.11
  },
  {
    id: "inst-3",
    loanId: "loan-1",
    sequence: 3,
    date: "2024-09-26",
    value: 15897.66,
    status: "pendente",
    interest: 3800.5
  },
  {
    id: "inst-4",
    loanId: "loan-2",
    sequence: 15,
    date: "2024-07-15",
    value: 10833.33,
    status: "vencida",
    interest: 4166.66
  },
  {
    id: "inst-5",
    loanId: "loan-2",
    sequence: 16,
    date: "2024-08-15",
    value: 10833.33,
    status: "pendente",
    interest: 4000.0
  },
  {
    id: "inst-6",
    loanId: "loan-3",
    sequence: 35,
    date: "2023-12-05",
    value: 7777.78,
    status: "paga",
    interest: 2777.78
  }
];
