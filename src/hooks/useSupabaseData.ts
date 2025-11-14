import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { hasSupabaseConfig, supabase } from "../supabaseClient";
import {
  companies as mockCompanies,
  consortiums as mockConsortiums,
  installments as mockInstallments,
  loans as mockLoans,
  type Company,
  type Consortium,
  type Installment,
  type Loan,
  type LoanStatus,
  type InstallmentStatus
} from "../data/mockData";

type MutationSuccess<T> = { success: true; data: T };
type MutationFailure = { success: false; error: string };
export type MutationResult<T> = MutationSuccess<T> | MutationFailure;

export type UpsertCompanyInput = Omit<Company, "id"> & { id?: string };
export type UpsertLoanInput = Omit<Loan, "id"> & { id?: string };
export type UpsertConsortiumInput = Omit<Consortium, "id"> & { id?: string };
export type UpsertInstallmentInput = Omit<Installment, "id"> & { id?: string };

type DbCompany = {
  id: string;
  name: string;
  nickname: string;
  cnpj: string;
  address: string;
};

type DbLoan = {
  id: string;
  company_id: string;
  reference: string;
  bank: string;
  total_value: number | string | null;
  start_date: string;
  end_date: string;
  status: LoanStatus;
  operation: string;
  operation_number: string;
  upfront_value: number | string | null;
  financed_value: number | string | null;
  interest_value: number | string | null;
  installments: number | null;
  installment_value: number | string | null;
  installment_value_no_interest: number | string | null;
  interest_per_installment: number | string | null;
  nominal_rate: number | string | null;
  effective_annual_rate: number | string | null;
  paid_installments: number | null;
  remaining_installments: number | null;
  amount_paid: number | string | null;
  amount_to_pay: number | string | null;
  as_of_date: string;
  contract_start: string;
};

type DbConsortium = {
  id: string;
  company_id: string;
  observation: string;
  group_code: string;
  quota: string;
  outstanding_balance: number | string | null;
  current_installment_value: number | string | null;
  installments_to_pay: number | null;
  administrator: string;
  credit_to_receive: number | string | null;
  category: string;
  total_installments: number | null;
  amount_paid: number | string | null;
  amount_to_pay: number | string | null;
  paid_installments: number | null;
};

type DbInstallment = {
  id: string;
  contract_type: Installment["contractType"];
  contract_id: string;
  sequence: number | null;
  date: string;
  value: number | string | null;
  status: InstallmentStatus;
  interest: number | string | null;
};

const toNumber = (value: number | string | null | undefined): number => {
  if (value === null || value === undefined) return 0;
  if (typeof value === "number") return value;
  const parsed = Number(value);
  return Number.isNaN(parsed) ? 0 : parsed;
};

const ensureId = () =>
  typeof crypto !== "undefined" && "randomUUID" in crypto
    ? crypto.randomUUID()
    : `id-${Date.now()}-${Math.random().toString(16).slice(2)}`;

const sortCompanies = (items: Company[]) =>
  [...items].sort((a, b) => a.name.localeCompare(b.name, "pt-BR", { sensitivity: "base" }));

const sortLoans = (items: Loan[]) =>
  [...items].sort((a, b) => new Date(b.startDate).getTime() - new Date(a.startDate).getTime());

const sortConsortiums = (items: Consortium[]) =>
  [...items].sort((a, b) => a.observation.localeCompare(b.observation, "pt-BR", { sensitivity: "base" }));

const sortInstallments = (items: Installment[]) =>
  [...items].sort((a, b) => a.sequence - b.sequence);

const getBrazilNow = () => new Date(new Date().toLocaleString("en-US", { timeZone: "America/Sao_Paulo" }));

const mapCompanyFromDb = (record: DbCompany): Company => ({
  id: record.id,
  name: record.name,
  nickname: record.nickname,
  cnpj: record.cnpj,
  address: record.address
});

const mapCompanyToDb = (input: UpsertCompanyInput): Record<string, unknown> => {
  const payload: Record<string, unknown> = {
    id: input.id,
    name: input.name,
    nickname: input.nickname,
    cnpj: input.cnpj,
    address: input.address
  };

  if (!payload.id) {
    delete payload.id;
  }

  return payload;
};

const mapLoanFromDb = (record: DbLoan): Loan => ({
  id: record.id,
  companyId: record.company_id,
  reference: record.reference,
  bank: record.bank,
  totalValue: toNumber(record.total_value),
  startDate: record.start_date,
  endDate: record.end_date,
  status: record.status,
  operation: record.operation,
  operationNumber: record.operation_number,
  upfrontValue: toNumber(record.upfront_value),
  financedValue: toNumber(record.financed_value),
  interestValue: toNumber(record.interest_value),
  installments: record.installments ?? 0,
  installmentValue: toNumber(record.installment_value),
  installmentValueNoInterest: toNumber(record.installment_value_no_interest),
  interestPerInstallment: toNumber(record.interest_per_installment),
  nominalRate: toNumber(record.nominal_rate),
  effectiveAnnualRate: toNumber(record.effective_annual_rate),
  paidInstallments: record.paid_installments ?? 0,
  remainingInstallments: record.remaining_installments ?? 0,
  amountPaid: toNumber(record.amount_paid),
  amountToPay: toNumber(record.amount_to_pay),
  currentDate: record.as_of_date,
  contractStart: record.contract_start
});

const mapLoanToDb = (input: UpsertLoanInput): Record<string, unknown> => {
  const payload: Record<string, unknown> = {
    id: input.id,
    company_id: input.companyId,
    reference: input.reference,
    bank: input.bank,
    total_value: input.totalValue,
    start_date: input.startDate,
    end_date: input.endDate,
    status: input.status,
    operation: input.operation,
    operation_number: input.operationNumber,
    upfront_value: input.upfrontValue,
    financed_value: input.financedValue,
    interest_value: input.interestValue,
    installments: input.installments,
    installment_value: input.installmentValue,
    installment_value_no_interest: input.installmentValueNoInterest,
    interest_per_installment: input.interestPerInstallment,
    nominal_rate: input.nominalRate,
    effective_annual_rate: input.effectiveAnnualRate,
    paid_installments: input.paidInstallments,
    remaining_installments: input.remainingInstallments,
    amount_paid: input.amountPaid,
    amount_to_pay: input.amountToPay,
    as_of_date: input.currentDate,
    contract_start: input.contractStart
  };

  if (!payload.id) {
    delete payload.id;
  }

  return payload;
};

const mapConsortiumFromDb = (record: DbConsortium): Consortium => ({
  id: record.id,
  companyId: record.company_id,
  observation: record.observation,
  groupCode: record.group_code,
  quota: record.quota,
  outstandingBalance: toNumber(record.outstanding_balance),
  currentInstallmentValue: toNumber(record.current_installment_value),
  installmentsToPay: record.installments_to_pay ?? 0,
  administrator: record.administrator,
  creditToReceive: toNumber(record.credit_to_receive),
  category: record.category,
  totalInstallments: record.total_installments ?? 0,
  amountPaid: toNumber(record.amount_paid),
  amountToPay: toNumber(record.amount_to_pay),
  paidInstallments: record.paid_installments ?? 0
});

const mapConsortiumToDb = (input: UpsertConsortiumInput): Record<string, unknown> => {
  const payload: Record<string, unknown> = {
    id: input.id,
    company_id: input.companyId,
    observation: input.observation,
    group_code: input.groupCode,
    quota: input.quota,
    outstanding_balance: input.outstandingBalance,
    current_installment_value: input.currentInstallmentValue,
    installments_to_pay: input.installmentsToPay,
    administrator: input.administrator,
    credit_to_receive: input.creditToReceive,
    category: input.category,
    total_installments: input.totalInstallments,
    amount_paid: input.amountPaid,
    amount_to_pay: input.amountToPay,
    paid_installments: input.paidInstallments
  };

  if (!payload.id) {
    delete payload.id;
  }

  return payload;
};

const mapInstallmentFromDb = (record: DbInstallment): Installment => ({
  id: record.id,
  contractType: record.contract_type,
  contractId: record.contract_id,
  sequence: record.sequence ?? 0,
  date: record.date,
  value: toNumber(record.value),
  status: record.status,
  interest: toNumber(record.interest)
});

const mapInstallmentToDb = (input: UpsertInstallmentInput): Record<string, unknown> => {
  const payload: Record<string, unknown> = {
    id: input.id,
    contract_type: input.contractType,
    contract_id: input.contractId,
    sequence: input.sequence,
    date: input.date,
    value: input.value,
    status: input.status,
    interest: input.interest
  };

  if (!payload.id) {
    delete payload.id;
  }

  return payload;
};

const toIsoDate = (date: Date) => date.toISOString().split("T")[0] ?? "";

const addMonths = (date: Date, months: number) => {
  const reference = new Date(date);
  reference.setMonth(reference.getMonth() + months);
  return reference;
};

const parseIsoDate = (value: string): Date | null => {
  if (!value) {
    return null;
  }

  const [year, month, day] = value.split("-").map(Number);
  if (!year || !month || !day) {
    return null;
  }

  const parsed = new Date(year, (month ?? 1) - 1, day ?? 1);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
};

const generateLoanInstallments = (loan: Loan): Installment[] => {
  const totalInstallments = loan.installments ?? 0;
  if (totalInstallments <= 0) {
    return [];
  }

  const baseDate = parseIsoDate(loan.startDate);
  if (!baseDate) {
    return [];
  }

  const referenceDate = getBrazilNow();
  const installmentValue = loan.installmentValue ?? 0;
  const installmentInterest = loan.interestPerInstallment ?? 0;

  return Array.from({ length: totalInstallments }).map((_, index) => {
    const dueDate = addMonths(baseDate, index);
    const draftInstallment: Installment = {
      id: ensureId(),
      contractType: "loan",
      contractId: loan.id,
      sequence: index + 1,
      date: toIsoDate(dueDate),
      value: installmentValue,
      status: "pendente",
      interest: installmentInterest
    };

    return {
      ...draftInstallment,
      status: computeInstallmentAutoStatus(draftInstallment, referenceDate)
    };
  });
};

const computeInstallmentAutoStatus = (installment: Installment, referenceDate: Date): InstallmentStatus => {
  if (installment.status === "paga") {
    return "paga";
  }

  const [year, month, day] = installment.date.split("-").map(Number);
  const dueDate = new Date(year, (month ?? 1) - 1, day ?? 1);
  const startOfToday = new Date(referenceDate.getFullYear(), referenceDate.getMonth(), referenceDate.getDate());
  const endOfToday = new Date(startOfToday.getTime() + 86_399_999);

  if (dueDate < startOfToday) {
    return "vencida";
  }

  if (dueDate <= endOfToday) {
    return "paga";
  }

  return "pendente";
};

const normalizeInstallmentStatuses = (items: Installment[], referenceDate: Date) => {
  const updates: Installment[] = [];
  const normalized = items.map((item) => {
    const nextStatus = computeInstallmentAutoStatus(item, referenceDate);
    if (nextStatus !== item.status) {
      const updated = { ...item, status: nextStatus };
      updates.push(updated);
      return updated;
    }
    return item;
  });

  return { normalized, updates };
};

const recalculateLoanFromInstallments = (loan: Loan, installments: Installment[]) => {
  const related = installments.filter(
    (installment) => installment.contractType === "loan" && installment.contractId === loan.id
  );

  if (related.length === 0) {
    return loan;
  }

  const paid = related.filter((installment) => installment.status === "paga");
  const pending = related.filter((installment) => installment.status !== "paga");
  const paidAmount = paid.reduce((acc, installment) => acc + installment.value, 0);
  const pendingAmount = pending.reduce((acc, installment) => acc + installment.value, 0);
  const paidCount = paid.length;
  const totalInstallments = loan.installments || related.length;
  const remainingFromTotal = totalInstallments > 0 ? Math.max(totalInstallments - paidCount, 0) : 0;
  const remaining = Math.max(pending.length, remainingFromTotal);

  if (
    paidAmount === loan.amountPaid &&
    pendingAmount === loan.amountToPay &&
    paidCount === loan.paidInstallments &&
    remaining === loan.remainingInstallments
  ) {
    return loan;
  }

  return {
    ...loan,
    amountPaid: paidAmount,
    amountToPay: pendingAmount,
    paidInstallments: paidCount,
    remainingInstallments: remaining
  };
};

const recalculateConsortiumFromInstallments = (consortium: Consortium, installments: Installment[]) => {
  const related = installments.filter(
    (installment) => installment.contractType === "consortium" && installment.contractId === consortium.id
  );

  if (related.length === 0) {
    return consortium;
  }

  const paid = related.filter((installment) => installment.status === "paga");
  const pending = related.filter((installment) => installment.status !== "paga");
  const paidAmount = paid.reduce((acc, installment) => acc + installment.value, 0);
  const pendingAmount = pending.reduce((acc, installment) => acc + installment.value, 0);
  const paidCount = paid.length;
  const totalInstallments = consortium.totalInstallments || related.length;
  const remainingFromTotal = totalInstallments > 0 ? Math.max(totalInstallments - paidCount, 0) : 0;
  const remaining = Math.max(pending.length, remainingFromTotal);

  if (
    paidAmount === consortium.amountPaid &&
    pendingAmount === consortium.amountToPay &&
    paidCount === consortium.paidInstallments &&
    remaining === consortium.installmentsToPay &&
    pendingAmount === consortium.outstandingBalance
  ) {
    return consortium;
  }

  return {
    ...consortium,
    amountPaid: paidAmount,
    amountToPay: pendingAmount,
    outstandingBalance: pendingAmount,
    paidInstallments: paidCount,
    installmentsToPay: remaining
  };
};

const reconcileContractsWithInstallments = (
  loans: Loan[],
  consortiums: Consortium[],
  installments: Installment[]
) => {
  const loanUpdates: Loan[] = [];
  const consortiumUpdates: Consortium[] = [];

  const reconciledLoans = loans.map((loan) => {
    const updated = recalculateLoanFromInstallments(loan, installments);
    if (updated !== loan) {
      loanUpdates.push(updated);
    }
    return updated;
  });

  const reconciledConsortiums = consortiums.map((consortium) => {
    const updated = recalculateConsortiumFromInstallments(consortium, installments);
    if (updated !== consortium) {
      consortiumUpdates.push(updated);
    }
    return updated;
  });

  return { loans: reconciledLoans, consortiums: reconciledConsortiums, loanUpdates, consortiumUpdates };
};

export type SupabaseDataState = {
  companies: Company[];
  loans: Loan[];
  consortiums: Consortium[];
  installments: Installment[];
  loading: boolean;
  error: string | null;
  isUsingSupabase: boolean;
  refresh: () => Promise<void>;
  saveCompany: (input: UpsertCompanyInput) => Promise<MutationResult<Company>>;
  deleteCompany: (companyId: string) => Promise<MutationResult<null>>;
  saveLoan: (input: UpsertLoanInput) => Promise<MutationResult<Loan>>;
  deleteLoan: (loanId: string) => Promise<MutationResult<null>>;
  saveConsortium: (input: UpsertConsortiumInput) => Promise<MutationResult<Consortium>>;
  deleteConsortium: (consortiumId: string) => Promise<MutationResult<null>>;
  saveInstallment: (input: UpsertInstallmentInput) => Promise<MutationResult<Installment>>;
  deleteInstallment: (installmentId: string) => Promise<MutationResult<null>>;
  resetData: () => Promise<MutationResult<null>>;
};

const hasClient = hasSupabaseConfig && Boolean(supabase);

export function useSupabaseData(): SupabaseDataState {
  const [companies, setCompanies] = useState<Company[]>(hasClient ? [] : mockCompanies);
  const [loans, setLoans] = useState<Loan[]>(hasClient ? [] : mockLoans);
  const [consortiums, setConsortiums] = useState<Consortium[]>(hasClient ? [] : mockConsortiums);
  const [installments, setInstallments] = useState<Installment[]>(hasClient ? [] : mockInstallments);
  const [loading, setLoading] = useState<boolean>(hasClient);
  const [error, setError] = useState<string | null>(null);
  const statusSyncingRef = useRef(false);
  const loansRef = useRef(loans);
  const consortiumsRef = useRef(consortiums);
  const installmentsRef = useRef(installments);

  useEffect(() => {
    loansRef.current = loans;
  }, [loans]);

  useEffect(() => {
    consortiumsRef.current = consortiums;
  }, [consortiums]);

  useEffect(() => {
    installmentsRef.current = installments;
  }, [installments]);

  const applyContractsState = useCallback(
    (nextLoans?: Loan[], nextConsortiums?: Consortium[]) => {
      const sourceLoans = sortLoans(nextLoans ?? loansRef.current);
      const sourceConsortiums = sortConsortiums(nextConsortiums ?? consortiumsRef.current);
      const { loans: reconciledLoans, consortiums: reconciledConsortiums } = reconcileContractsWithInstallments(
        sourceLoans,
        sourceConsortiums,
        installmentsRef.current
      );
      setLoans(reconciledLoans);
      setConsortiums(reconciledConsortiums);
    },
    []
  );

  const applyInstallmentsState = useCallback(
    (
      nextInstallments: Installment[],
      overrides?: { loans?: Loan[]; consortiums?: Consortium[] }
    ) => {
      const sortedInstallments = sortInstallments(nextInstallments);
      const loanSource = overrides?.loans ? sortLoans(overrides.loans) : sortLoans(loansRef.current);
      const consortiumSource = overrides?.consortiums
        ? sortConsortiums(overrides.consortiums)
        : sortConsortiums(consortiumsRef.current);
      const { loans: reconciledLoans, consortiums: reconciledConsortiums } = reconcileContractsWithInstallments(
        loanSource,
        consortiumSource,
        sortedInstallments
      );
      setInstallments(sortedInstallments);
      setLoans(reconciledLoans);
      setConsortiums(reconciledConsortiums);
    },
    []
  );

  const fetchData = useCallback(async () => {
    if (!hasClient || !supabase) {
      setError(null);
      setLoading(false);
      setCompanies(sortCompanies(mockCompanies));
      const referenceDate = getBrazilNow();
      const sortedLoans = sortLoans(mockLoans);
      const sortedConsortiums = sortConsortiums(mockConsortiums);
      const { normalized } = normalizeInstallmentStatuses(mockInstallments, referenceDate);
      applyInstallmentsState(normalized, { loans: sortedLoans, consortiums: sortedConsortiums });
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const [companiesResponse, loansResponse, consortiumsResponse, installmentsResponse] = await Promise.all([
        supabase.from("companies").select("*").order("name", { ascending: true }),
        supabase.from("loans").select("*").order("start_date", { ascending: false }),
        supabase.from("consortiums").select("*").order("observation", { ascending: true }),
        supabase.from("installments").select("*").order("sequence", { ascending: true })
      ]);

      const responses = [companiesResponse, loansResponse, consortiumsResponse, installmentsResponse];

      const firstError = responses.find((response) => response.error)?.error;

      if (firstError) {
        setError(firstError.message);
        return;
      }

      setCompanies(sortCompanies(((companiesResponse.data as DbCompany[]) ?? []).map(mapCompanyFromDb)));
      const mappedLoans = sortLoans(((loansResponse.data as DbLoan[]) ?? []).map(mapLoanFromDb));
      const mappedConsortiums = sortConsortiums(
        ((consortiumsResponse.data as DbConsortium[]) ?? []).map(mapConsortiumFromDb)
      );

      const mappedInstallments = ((installmentsResponse.data as DbInstallment[]) ?? []).map(mapInstallmentFromDb);
      const referenceDate = getBrazilNow();
      const { normalized, updates } = normalizeInstallmentStatuses(mappedInstallments, referenceDate);
      const { loanUpdates, consortiumUpdates } = reconcileContractsWithInstallments(
        mappedLoans,
        mappedConsortiums,
        normalized
      );

      applyInstallmentsState(normalized, { loans: mappedLoans, consortiums: mappedConsortiums });

      if (updates.length > 0) {
        await supabase
          .from("installments")
          .upsert(updates.map((installment) => mapInstallmentToDb({ ...installment })), { onConflict: "id" });
      }

      if (loanUpdates.length > 0) {
        await supabase
          .from("loans")
          .upsert(loanUpdates.map((loan) => mapLoanToDb({ ...loan })), { onConflict: "id" });
      }

      if (consortiumUpdates.length > 0) {
        await supabase
          .from("consortiums")
          .upsert(consortiumUpdates.map((item) => mapConsortiumToDb({ ...item })), { onConflict: "id" });
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      setError(message);
    } finally {
      setLoading(false);
    }
  }, [applyInstallmentsState]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const upsertCompany = useCallback(
    async (input: UpsertCompanyInput): Promise<MutationResult<Company>> => {
      const baseCompany: Company = {
        id: input.id ?? ensureId(),
        name: input.name,
        nickname: input.nickname,
        cnpj: input.cnpj,
        address: input.address
      };

      if (!hasClient || !supabase) {
        setCompanies((prev) => sortCompanies([...(prev.filter((company) => company.id !== baseCompany.id)), baseCompany]));
        return { success: true, data: baseCompany };
      }

      const payload = mapCompanyToDb({ ...input, id: input.id ?? undefined });

      const { data, error } = await supabase
        .from("companies")
        .upsert(payload, { onConflict: "id" })
        .select()
        .single();

      if (error) {
        return { success: false, error: error.message };
      }

      const mapped = mapCompanyFromDb(data as DbCompany);
      setCompanies((prev) => sortCompanies([...(prev.filter((company) => company.id !== mapped.id)), mapped]));
      return { success: true, data: mapped };
    },
    []
  );

  const removeCompany = useCallback(
    async (companyId: string): Promise<MutationResult<null>> => {
      const removeFromState = () => {
        setCompanies((prev) => prev.filter((company) => company.id !== companyId));
        const remainingLoans = loansRef.current.filter((loan) => loan.companyId !== companyId);
        const remainingConsortiums = consortiumsRef.current.filter(
          (consortium) => consortium.companyId !== companyId
        );
        const remainingInstallments = installmentsRef.current.filter((installment) => {
          if (installment.contractType === "loan") {
            return remainingLoans.some((loan) => loan.id === installment.contractId);
          }
          if (installment.contractType === "consortium") {
            return remainingConsortiums.some((item) => item.id === installment.contractId);
          }
          return true;
        });

        applyInstallmentsState(remainingInstallments, {
          loans: remainingLoans,
          consortiums: remainingConsortiums
        });
      };

      if (!hasClient || !supabase) {
        removeFromState();
        return { success: true, data: null };
      }

      const { error } = await supabase.from("companies").delete().eq("id", companyId);

      if (error) {
        return { success: false, error: error.message };
      }

      removeFromState();
      return { success: true, data: null };
    },
    [applyInstallmentsState]
  );

  const upsertLoan = useCallback(
    async (input: UpsertLoanInput): Promise<MutationResult<Loan>> => {
      const isCreating = !input.id;
      const baseLoan: Loan = { ...input, id: input.id ?? ensureId() };
      const normalizedLoan = recalculateLoanFromInstallments(baseLoan, installmentsRef.current);

      if (!hasClient || !supabase) {
        const nextLoans = [
          ...loansRef.current.filter((loan) => loan.id !== normalizedLoan.id),
          normalizedLoan
        ];

        applyContractsState(nextLoans, undefined);

        if (isCreating) {
          const generatedInstallments = generateLoanInstallments(normalizedLoan);
          if (generatedInstallments.length > 0) {
            applyInstallmentsState([...installmentsRef.current, ...generatedInstallments], {
              loans: nextLoans
            });
          }
        }

        return { success: true, data: normalizedLoan };
      }

      const payload = mapLoanToDb({ ...input, id: input.id ?? undefined });

      const { data, error } = await supabase
        .from("loans")
        .upsert(payload, { onConflict: "id" })
        .select()
        .single();

      if (error) {
        return { success: false, error: error.message };
      }

      const mapped = mapLoanFromDb(data as DbLoan);
      const recalculated = recalculateLoanFromInstallments(mapped, installmentsRef.current);

      if (
        (recalculated.amountPaid !== mapped.amountPaid ||
          recalculated.amountToPay !== mapped.amountToPay ||
          recalculated.paidInstallments !== mapped.paidInstallments ||
          recalculated.remainingInstallments !== mapped.remainingInstallments) &&
        hasClient &&
        supabase
      ) {
        await supabase
          .from("loans")
          .upsert([mapLoanToDb({ ...recalculated })], { onConflict: "id" });
      }

      let generatedInstallments: Installment[] = [];
      if (isCreating) {
        generatedInstallments = generateLoanInstallments(recalculated);
        if (generatedInstallments.length > 0) {
          const installmentPayloads = generatedInstallments.map((installment) =>
            mapInstallmentToDb({ ...installment })
          );
          const { error: installmentsError } = await supabase
            .from("installments")
            .upsert(installmentPayloads, { onConflict: "id" });

          if (installmentsError) {
            await supabase.from("loans").delete().eq("id", recalculated.id);
            return { success: false, error: installmentsError.message };
          }
        }
      }

      const nextLoans = [
        ...loansRef.current.filter((loan) => loan.id !== recalculated.id),
        recalculated
      ];

      if (generatedInstallments.length > 0) {
        applyInstallmentsState([...installmentsRef.current, ...generatedInstallments], {
          loans: nextLoans
        });
      } else {
        applyContractsState(nextLoans, undefined);
      }

      return { success: true, data: recalculated };
    },
    [applyContractsState, applyInstallmentsState]
  );

  const removeLoan = useCallback(
    async (loanId: string): Promise<MutationResult<null>> => {
      const removeFromState = () => {
        const remainingLoans = loansRef.current.filter((loan) => loan.id !== loanId);
        const remainingInstallments = installmentsRef.current.filter(
          (installment) => !(installment.contractType === "loan" && installment.contractId === loanId)
        );
        applyInstallmentsState(remainingInstallments, { loans: remainingLoans });
      };

      if (!hasClient || !supabase) {
        removeFromState();
        return { success: true, data: null };
      }

      const { error } = await supabase.from("loans").delete().eq("id", loanId);

      if (error) {
        return { success: false, error: error.message };
      }

      removeFromState();
      return { success: true, data: null };
    },
    [applyInstallmentsState]
  );

  const upsertConsortium = useCallback(
    async (input: UpsertConsortiumInput): Promise<MutationResult<Consortium>> => {
      const baseConsortium: Consortium = { ...input, id: input.id ?? ensureId() };
      const normalizedConsortium = recalculateConsortiumFromInstallments(
        baseConsortium,
        installmentsRef.current
      );

      if (!hasClient || !supabase) {
        applyContractsState(undefined, [
          ...consortiumsRef.current.filter((item) => item.id !== normalizedConsortium.id),
          normalizedConsortium
        ]);
        return { success: true, data: normalizedConsortium };
      }

      const payload = mapConsortiumToDb({ ...input, id: input.id ?? undefined });

      const { data, error } = await supabase
        .from("consortiums")
        .upsert(payload, { onConflict: "id" })
        .select()
        .single();

      if (error) {
        return { success: false, error: error.message };
      }

      const mapped = mapConsortiumFromDb(data as DbConsortium);
      const recalculated = recalculateConsortiumFromInstallments(mapped, installmentsRef.current);

      if (
        (recalculated.amountPaid !== mapped.amountPaid ||
          recalculated.amountToPay !== mapped.amountToPay ||
          recalculated.paidInstallments !== mapped.paidInstallments ||
          recalculated.installmentsToPay !== mapped.installmentsToPay ||
          recalculated.outstandingBalance !== mapped.outstandingBalance) &&
        hasClient &&
        supabase
      ) {
        await supabase
          .from("consortiums")
          .upsert([mapConsortiumToDb({ ...recalculated })], { onConflict: "id" });
      }

      applyContractsState(undefined, [
        ...consortiumsRef.current.filter((item) => item.id !== recalculated.id),
        recalculated
      ]);
      return { success: true, data: recalculated };
    },
    [applyContractsState]
  );

  const removeConsortium = useCallback(
    async (consortiumId: string): Promise<MutationResult<null>> => {
      const removeFromState = () => {
        const remainingConsortiums = consortiumsRef.current.filter(
          (consortium) => consortium.id !== consortiumId
        );
        const remainingInstallments = installmentsRef.current.filter(
          (installment) =>
            !(installment.contractType === "consortium" && installment.contractId === consortiumId)
        );
        applyInstallmentsState(remainingInstallments, { consortiums: remainingConsortiums });
      };

      if (!hasClient || !supabase) {
        removeFromState();
        return { success: true, data: null };
      }

      const { error } = await supabase.from("consortiums").delete().eq("id", consortiumId);

      if (error) {
        return { success: false, error: error.message };
      }

      removeFromState();
      return { success: true, data: null };
    },
    [applyInstallmentsState]
  );

  const upsertInstallment = useCallback(
    async (input: UpsertInstallmentInput): Promise<MutationResult<Installment>> => {
      const baseInstallment: Installment = {
        id: input.id ?? ensureId(),
        contractType: input.contractType,
        contractId: input.contractId,
        sequence: input.sequence,
        date: input.date,
        value: input.value,
        status: input.status,
        interest: input.interest
      };

      const normalizedInstallment = {
        ...baseInstallment,
        status: computeInstallmentAutoStatus(baseInstallment, getBrazilNow())
      };

      if (!hasClient || !supabase) {
        const remaining = installmentsRef.current.filter(
          (installment) => installment.id !== normalizedInstallment.id
        );
        applyInstallmentsState([...remaining, normalizedInstallment]);
        return { success: true, data: normalizedInstallment };
      }

      const payload = mapInstallmentToDb({ ...input, id: input.id ?? undefined });

      const { data, error } = await supabase
        .from("installments")
        .upsert(payload, { onConflict: "id" })
        .select()
        .single();

      if (error) {
        return { success: false, error: error.message };
      }

      const mapped = mapInstallmentFromDb(data as DbInstallment);
      const autoStatus = computeInstallmentAutoStatus(mapped, getBrazilNow());
      const syncedInstallment = autoStatus === mapped.status ? mapped : { ...mapped, status: autoStatus };

      if (syncedInstallment !== mapped) {
        await supabase
          .from("installments")
          .upsert([mapInstallmentToDb({ ...syncedInstallment })], { onConflict: "id" });
      }

      const remaining = installmentsRef.current.filter(
        (installment) => installment.id !== syncedInstallment.id
      );
      applyInstallmentsState([...remaining, syncedInstallment]);
      return { success: true, data: syncedInstallment };
    },
    [applyInstallmentsState]
  );

  const removeInstallment = useCallback(
    async (installmentId: string): Promise<MutationResult<null>> => {
      const removeFromState = () => {
        const remaining = installmentsRef.current.filter((installment) => installment.id !== installmentId);
        applyInstallmentsState(remaining);
      };

      if (!hasClient || !supabase) {
        removeFromState();
        return { success: true, data: null };
      }

      const { error } = await supabase.from("installments").delete().eq("id", installmentId);

      if (error) {
        return { success: false, error: error.message };
      }

      removeFromState();
      return { success: true, data: null };
    },
    [applyInstallmentsState]
  );

  const syncInstallmentStatuses = useCallback(async () => {
    if (statusSyncingRef.current) {
      return;
    }

    statusSyncingRef.current = true;
    const referenceDate = getBrazilNow();
    const { normalized, updates } = normalizeInstallmentStatuses(installmentsRef.current, referenceDate);

    if (updates.length > 0) {
      applyInstallmentsState(normalized);
    }

    if (hasClient && supabase && updates.length > 0) {
      try {
        await supabase
          .from("installments")
          .upsert(updates.map((installment) => mapInstallmentToDb({ ...installment })), { onConflict: "id" });
      } catch (err) {
        console.error("Falha ao atualizar status das parcelas automaticamente:", err);
      }
    }

    statusSyncingRef.current = false;
  }, [applyInstallmentsState]);

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    void syncInstallmentStatuses();

    const interval = window.setInterval(() => {
      void syncInstallmentStatuses();
    }, 60_000);

    return () => {
      window.clearInterval(interval);
    };
  }, [syncInstallmentStatuses]);

  const resetData = useCallback(async (): Promise<MutationResult<null>> => {
    const clearState = () => {
      setCompanies([]);
      setLoans([]);
      setConsortiums([]);
      setInstallments([]);
    };

    if (!hasClient || !supabase) {
      clearState();
      return { success: true, data: null };
    }

    try {
      const tables = ["installments", "consortiums", "loans", "companies"] as const;

      for (const table of tables) {
        const { error } = await supabase.from(table).delete().not("id", "is", null);
        if (error) {
          throw error;
        }
      }

      clearState();
      return { success: true, data: null };
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      return { success: false, error: message };
    }
  }, []);

  return useMemo(
    () => ({
      companies,
      loans,
      consortiums,
      installments,
      loading,
      error,
      isUsingSupabase: hasClient,
      refresh: fetchData,
      saveCompany: upsertCompany,
      deleteCompany: removeCompany,
      saveLoan: upsertLoan,
      deleteLoan: removeLoan,
      saveConsortium: upsertConsortium,
      deleteConsortium: removeConsortium,
      saveInstallment: upsertInstallment,
      deleteInstallment: removeInstallment,
      resetData
    }),
    [
      companies,
      loans,
      consortiums,
      installments,
      loading,
      error,
      fetchData,
      upsertCompany,
      removeCompany,
      upsertLoan,
      removeLoan,
      upsertConsortium,
      removeConsortium,
      upsertInstallment,
      removeInstallment,
      resetData
    ]
  );
}
