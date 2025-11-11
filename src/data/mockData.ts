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

export type ConsortiumCategory =
  | "VEICULO"
  | "IMOVEIS"
  | "SERVICOS"
  | "MAQUINAS"
  | "OUTROS"
  | string;

export type Consortium = {
  id: string;
  companyId: string;
  observation: string;
  groupCode: string;
  quota: string;
  outstandingBalance: number;
  currentInstallmentValue: number;
  installmentsToPay: number;
  administrator: string;
  creditToReceive: number;
  category: ConsortiumCategory;
  totalInstallments: number;
  amountPaid: number;
  amountToPay: number;
  paidInstallments: number;
};

export type InstallmentStatus = "paga" | "pendente" | "vencida";

export type Installment = {
  id: string;
  contractType: "loan" | "consortium";
  contractId: string;
  sequence: number;
  date: string;
  value: number;
  status: InstallmentStatus;
  interest: number;
};

export const companies: Company[] = [
  {
    id: "empresa-logica-distribuicoes",
    name: "Lógica Distribuições",
    nickname: "Lógica Dist",
    cnpj: "12.345.678/0001-90",
    address: "Rua das Inovações, 123 - São Paulo/SP"
  },
  {
    id: "empresa-logica-distribuidora",
    name: "Lógica Distribuidora",
    nickname: "Distribuidora",
    cnpj: "34.567.890/0001-12",
    address: "Av. Tecnologia, 987 - Campinas/SP"
  },
  {
    id: "empresa-logica-transporte",
    name: "Lógica Distribuidora Transporte A.",
    nickname: "Transporte A.",
    cnpj: "45.678.901/0001-23",
    address: "Rod. BR-050, Km 123 - Uberaba/MG"
  }
];

export const loans: Loan[] = [
  {
    id: "loan-fgi-237",
    companyId: "empresa-logica-distribuicoes",
    reference: "Capital de Giro FGI 237/1497/2806",
    bank: "Bradesco",
    totalValue: 731292.36,
    startDate: "2023-08-15",
    endDate: "2027-05-15",
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
    currentDate: "2024-09-01",
    contractStart: "2023-07-16"
  },
  {
    id: "loan-fgi-282",
    companyId: "empresa-logica-distribuicoes",
    reference: "Capital de Giro FGI 282/1499/3047",
    bank: "Bradesco",
    totalValue: 470871.54,
    startDate: "2024-01-25",
    endDate: "2027-12-25",
    status: "ativo",
    operation: "Capital de Giro FGI",
    operationNumber: "282/1499/3047",
    upfrontValue: 336860.38,
    financedValue: 470871.54,
    interestValue: 134011.16,
    installments: 48,
    installmentValue: 9814.83,
    installmentValueNoInterest: 7022.93,
    interestPerInstallment: 2791.9,
    nominalRate: 1.1,
    effectiveAnnualRate: 14.32,
    paidInstallments: 11,
    remainingInstallments: 37,
    amountPaid: 105779.64,
    amountToPay: 365091.9,
    currentDate: "2024-09-01",
    contractStart: "2023-12-26"
  },
  {
    id: "loan-bndes-282",
    companyId: "empresa-logica-distribuicoes",
    reference: "BNDES 282/3043/2268",
    bank: "Bradesco Matriz",
    totalValue: 269997.6,
    startDate: "2023-06-15",
    endDate: "2026-05-15",
    status: "ativo",
    operation: "BNDES",
    operationNumber: "282/3043/2268",
    upfrontValue: 0,
    financedValue: 269997.6,
    interestValue: 58425.6,
    installments: 36,
    installmentValue: 7499.93,
    installmentValueNoInterest: 5877,
    interestPerInstallment: 1622.93,
    nominalRate: 0.95,
    effectiveAnnualRate: 12,
    paidInstallments: 13,
    remainingInstallments: 23,
    amountPaid: 96227.8,
    amountToPay: 173769.8,
    currentDate: "2024-09-01",
    contractStart: "2023-05-08"
  },
  {
    id: "loan-cdc-297",
    companyId: "empresa-logica-distribuidora",
    reference: "CDC 297/00174/2291",
    bank: "Bradesco Matriz",
    totalValue: 590000,
    startDate: "2020-12-25",
    endDate: "2023-11-25",
    status: "ativo",
    operation: "CDC",
    operationNumber: "297/00174/2291",
    upfrontValue: 0,
    financedValue: 590000,
    interestValue: 102960,
    installments: 36,
    installmentValue: 16415.28,
    installmentValueNoInterest: 13555.28,
    interestPerInstallment: 2860,
    nominalRate: 0.8,
    effectiveAnnualRate: 10.02,
    paidInstallments: 18,
    remainingInstallments: 18,
    amountPaid: 295490,
    amountToPay: 294510,
    currentDate: "2024-09-01",
    contractStart: "2020-11-20"
  },
  {
    id: "loan-bndes-269",
    companyId: "empresa-logica-distribuidora",
    reference: "BNDES 269/3332/1649",
    bank: "Bradesco Transporte",
    totalValue: 581922,
    startDate: "2022-01-14",
    endDate: "2026-12-14",
    status: "ativo",
    operation: "BNDES",
    operationNumber: "269/3332/1649",
    upfrontValue: 0,
    financedValue: 581922,
    interestValue: 129282,
    installments: 60,
    installmentValue: 9698.7,
    installmentValueNoInterest: 7544,
    interestPerInstallment: 2154.7,
    nominalRate: 0.78,
    effectiveAnnualRate: 9.75,
    paidInstallments: 30,
    remainingInstallments: 30,
    amountPaid: 290961,
    amountToPay: 290961,
    currentDate: "2024-09-01",
    contractStart: "2021-12-14"
  },
  {
    id: "loan-cdc-278",
    companyId: "empresa-logica-transporte",
    reference: "CDC 278/3302/5517",
    bank: "Bradesco Transporte",
    totalValue: 247000,
    startDate: "2021-11-07",
    endDate: "2024-10-07",
    status: "ativo",
    operation: "CDC (Produtor)",
    operationNumber: "278/3302/5517",
    upfrontValue: 0,
    financedValue: 247000,
    interestValue: 39360,
    installments: 36,
    installmentValue: 7134.56,
    installmentValueNoInterest: 6041.23,
    interestPerInstallment: 1093.33,
    nominalRate: 0.68,
    effectiveAnnualRate: 8.45,
    paidInstallments: 17,
    remainingInstallments: 19,
    amountPaid: 123500,
    amountToPay: 123500,
    currentDate: "2024-09-01",
    contractStart: "2021-10-07"
  }
];

export const consortiums: Consortium[] = [
  {
    id: "consortium-pvc-0g90",
    companyId: "empresa-logica-distribuicoes",
    observation: "Caminhão placa PVC-0G90",
    groupCode: "10274",
    quota: "221",
    outstandingBalance: 8228.75,
    currentInstallmentValue: 1408.37,
    installmentsToPay: 6,
    administrator: "Bradesco",
    creditToReceive: 0,
    category: "VEICULO",
    totalInstallments: 6,
    amountPaid: 0,
    amountToPay: 8228.75,
    paidInstallments: 0
  },
  {
    id: "consortium-virtus-lincoln",
    companyId: "empresa-logica-distribuicoes",
    observation: "Virtus Lincoln",
    groupCode: "40063",
    quota: "101",
    outstandingBalance: 22527.18,
    currentInstallmentValue: 949.51,
    installmentsToPay: 24,
    administrator: "Bradesco",
    creditToReceive: 0,
    category: "VEICULO",
    totalInstallments: 24,
    amountPaid: 0,
    amountToPay: 22527.18,
    paidInstallments: 0
  },
  {
    id: "consortium-compass-leandro",
    companyId: "empresa-logica-distribuicoes",
    observation: "Compass Leandro",
    groupCode: "70196",
    quota: "166",
    outstandingBalance: 86224.75,
    currentInstallmentValue: 5373.6,
    installmentsToPay: 23,
    administrator: "Santander",
    creditToReceive: 0,
    category: "VEICULO",
    totalInstallments: 23,
    amountPaid: 0,
    amountToPay: 86224.75,
    paidInstallments: 0
  },
  {
    id: "consortium-pwo-1f23",
    companyId: "empresa-logica-distribuicoes",
    observation: "Caminhão placa PWO-1F23",
    groupCode: "10724",
    quota: "222",
    outstandingBalance: 130564.26,
    currentInstallmentValue: 3264.68,
    installmentsToPay: 40,
    administrator: "Itaú (Matriz)",
    creditToReceive: 185586.06,
    category: "MAQUINAS",
    totalInstallments: 40,
    amountPaid: 0,
    amountToPay: 130564.26,
    paidInstallments: 0
  },
  {
    id: "consortium-mercedes-188",
    companyId: "empresa-logica-distribuicoes",
    observation: "Mercedes Leandro 188",
    groupCode: "33231",
    quota: "188",
    outstandingBalance: 204772,
    currentInstallmentValue: 3656,
    installmentsToPay: 56,
    administrator: "Santander",
    creditToReceive: 0,
    category: "VEICULO",
    totalInstallments: 56,
    amountPaid: 0,
    amountToPay: 204772,
    paidInstallments: 0
  },
  {
    id: "consortium-mercedes-242",
    companyId: "empresa-logica-distribuicoes",
    observation: "Mercedes Leandro 242",
    groupCode: "33552",
    quota: "242",
    outstandingBalance: 611605.21,
    currentInstallmentValue: 2407.47,
    installmentsToPay: 56,
    administrator: "Bama",
    creditToReceive: 0,
    category: "VEICULO",
    totalInstallments: 56,
    amountPaid: 0,
    amountToPay: 611605.21,
    paidInstallments: 0
  }
];

export const installments: Installment[] = [
  {
    id: "inst-loan-fgi-237-28",
    contractType: "loan",
    contractId: "loan-fgi-237",
    sequence: 28,
    date: "2024-07-26",
    value: 15897.66,
    status: "paga",
    interest: 4506.05
  },
  {
    id: "inst-loan-fgi-237-29",
    contractType: "loan",
    contractId: "loan-fgi-237",
    sequence: 29,
    date: "2024-08-26",
    value: 15897.66,
    status: "pendente",
    interest: 4012.11
  },
  {
    id: "inst-loan-fgi-282-11",
    contractType: "loan",
    contractId: "loan-fgi-282",
    sequence: 11,
    date: "2024-08-25",
    value: 9814.83,
    status: "paga",
    interest: 2791.9
  },
  {
    id: "inst-loan-fgi-282-12",
    contractType: "loan",
    contractId: "loan-fgi-282",
    sequence: 12,
    date: "2024-09-25",
    value: 9814.83,
    status: "pendente",
    interest: 2791.9
  },
  {
    id: "inst-loan-bndes-282-13",
    contractType: "loan",
    contractId: "loan-bndes-282",
    sequence: 13,
    date: "2024-07-15",
    value: 7499.93,
    status: "paga",
    interest: 1622.93
  },
  {
    id: "inst-loan-bndes-282-14",
    contractType: "loan",
    contractId: "loan-bndes-282",
    sequence: 14,
    date: "2024-08-15",
    value: 7499.93,
    status: "pendente",
    interest: 1622.93
  },
  {
    id: "inst-loan-cdc-297-18",
    contractType: "loan",
    contractId: "loan-cdc-297",
    sequence: 18,
    date: "2024-07-25",
    value: 16415.28,
    status: "paga",
    interest: 2860
  },
  {
    id: "inst-loan-cdc-297-19",
    contractType: "loan",
    contractId: "loan-cdc-297",
    sequence: 19,
    date: "2024-08-25",
    value: 16415.28,
    status: "pendente",
    interest: 2860
  },
  {
    id: "inst-loan-bndes-269-31",
    contractType: "loan",
    contractId: "loan-bndes-269",
    sequence: 31,
    date: "2024-07-14",
    value: 9698.7,
    status: "paga",
    interest: 2154.7
  },
  {
    id: "inst-loan-bndes-269-32",
    contractType: "loan",
    contractId: "loan-bndes-269",
    sequence: 32,
    date: "2024-08-14",
    value: 9698.7,
    status: "pendente",
    interest: 2154.7
  },
  {
    id: "inst-loan-cdc-278-18",
    contractType: "loan",
    contractId: "loan-cdc-278",
    sequence: 18,
    date: "2024-07-07",
    value: 7134.56,
    status: "paga",
    interest: 1093.33
  },
  {
    id: "inst-loan-cdc-278-19",
    contractType: "loan",
    contractId: "loan-cdc-278",
    sequence: 19,
    date: "2024-08-07",
    value: 7134.56,
    status: "pendente",
    interest: 1093.33
  },
  {
    id: "inst-consortium-pvc-0g90-1",
    contractType: "consortium",
    contractId: "consortium-pvc-0g90",
    sequence: 1,
    date: "2024-08-15",
    value: 1408.37,
    status: "pendente",
    interest: 0
  },
  {
    id: "inst-consortium-virtus-1",
    contractType: "consortium",
    contractId: "consortium-virtus-lincoln",
    sequence: 1,
    date: "2024-08-20",
    value: 949.51,
    status: "pendente",
    interest: 0
  },
  {
    id: "inst-consortium-compass-1",
    contractType: "consortium",
    contractId: "consortium-compass-leandro",
    sequence: 1,
    date: "2024-08-25",
    value: 5373.6,
    status: "pendente",
    interest: 0
  },
  {
    id: "inst-consortium-pwo-1f23-1",
    contractType: "consortium",
    contractId: "consortium-pwo-1f23",
    sequence: 1,
    date: "2024-08-30",
    value: 3264.68,
    status: "pendente",
    interest: 0
  },
  {
    id: "inst-consortium-mercedes-188-1",
    contractType: "consortium",
    contractId: "consortium-mercedes-188",
    sequence: 1,
    date: "2024-08-18",
    value: 3656,
    status: "pendente",
    interest: 0
  },
  {
    id: "inst-consortium-mercedes-242-1",
    contractType: "consortium",
    contractId: "consortium-mercedes-242",
    sequence: 1,
    date: "2024-08-22",
    value: 2407.47,
    status: "pendente",
    interest: 0
  }
];
