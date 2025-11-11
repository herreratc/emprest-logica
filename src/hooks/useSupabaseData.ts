import { useCallback, useEffect, useMemo, useState } from "react";
import { hasSupabaseConfig, supabase } from "../supabaseClient";
import {
  companies as mockCompanies,
  installments as mockInstallments,
  loans as mockLoans,
  type Company,
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

type DbInstallment = {
  id: string;
  loan_id: string;
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

const sortInstallments = (items: Installment[]) =>
  [...items].sort((a, b) => a.sequence - b.sequence);

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

const mapInstallmentFromDb = (record: DbInstallment): Installment => ({
  id: record.id,
  loanId: record.loan_id,
  sequence: record.sequence ?? 0,
  date: record.date,
  value: toNumber(record.value),
  status: record.status,
  interest: toNumber(record.interest)
});

const mapInstallmentToDb = (input: UpsertInstallmentInput): Record<string, unknown> => {
  const payload: Record<string, unknown> = {
    id: input.id,
    loan_id: input.loanId,
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

export type SupabaseDataState = {
  companies: Company[];
  loans: Loan[];
  installments: Installment[];
  loading: boolean;
  error: string | null;
  isUsingSupabase: boolean;
  refresh: () => Promise<void>;
  saveCompany: (input: UpsertCompanyInput) => Promise<MutationResult<Company>>;
  deleteCompany: (companyId: string) => Promise<MutationResult<null>>;
  saveLoan: (input: UpsertLoanInput) => Promise<MutationResult<Loan>>;
  deleteLoan: (loanId: string) => Promise<MutationResult<null>>;
  saveInstallment: (input: UpsertInstallmentInput) => Promise<MutationResult<Installment>>;
  deleteInstallment: (installmentId: string) => Promise<MutationResult<null>>;
  resetData: () => Promise<MutationResult<null>>;
};

const hasClient = hasSupabaseConfig && Boolean(supabase);

export function useSupabaseData(): SupabaseDataState {
  const [companies, setCompanies] = useState<Company[]>(hasClient ? [] : mockCompanies);
  const [loans, setLoans] = useState<Loan[]>(hasClient ? [] : mockLoans);
  const [installments, setInstallments] = useState<Installment[]>(hasClient ? [] : mockInstallments);
  const [loading, setLoading] = useState<boolean>(hasClient);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    if (!hasClient || !supabase) {
      setError(null);
      setLoading(false);
      setCompanies(sortCompanies(mockCompanies));
      setLoans(sortLoans(mockLoans));
      setInstallments(sortInstallments(mockInstallments));
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const [companiesResponse, loansResponse, installmentsResponse] = await Promise.all([
        supabase.from("companies").select("*").order("name", { ascending: true }),
        supabase.from("loans").select("*").order("start_date", { ascending: false }),
        supabase.from("installments").select("*").order("sequence", { ascending: true })
      ]);

      const responses = [companiesResponse, loansResponse, installmentsResponse];

      const firstError = responses.find((response) => response.error)?.error;

      if (firstError) {
        setError(firstError.message);
        return;
      }

      setCompanies(sortCompanies(((companiesResponse.data as DbCompany[]) ?? []).map(mapCompanyFromDb)));
      setLoans(sortLoans(((loansResponse.data as DbLoan[]) ?? []).map(mapLoanFromDb)));
      setInstallments(
        sortInstallments(((installmentsResponse.data as DbInstallment[]) ?? []).map(mapInstallmentFromDb))
      );
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      setError(message);
    } finally {
      setLoading(false);
    }
  }, []);

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
        const relatedLoanIds = loans.filter((loan) => loan.companyId === companyId).map((loan) => loan.id);
        if (relatedLoanIds.length > 0) {
          setLoans((prev) => prev.filter((loan) => loan.companyId !== companyId));
          setInstallments((prev) => prev.filter((installment) => !relatedLoanIds.includes(installment.loanId)));
        }
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
    [loans]
  );

  const upsertLoan = useCallback(
    async (input: UpsertLoanInput): Promise<MutationResult<Loan>> => {
      const baseLoan: Loan = { ...input, id: input.id ?? ensureId() };

      if (!hasClient || !supabase) {
        setLoans((prev) => sortLoans([...(prev.filter((loan) => loan.id !== baseLoan.id)), baseLoan]));
        return { success: true, data: baseLoan };
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
      setLoans((prev) => sortLoans([...(prev.filter((loan) => loan.id !== mapped.id)), mapped]));
      return { success: true, data: mapped };
    },
    []
  );

  const removeLoan = useCallback(
    async (loanId: string): Promise<MutationResult<null>> => {
      const removeFromState = () => {
        setLoans((prev) => prev.filter((loan) => loan.id !== loanId));
        setInstallments((prev) => prev.filter((installment) => installment.loanId !== loanId));
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
    []
  );

  const upsertInstallment = useCallback(
    async (input: UpsertInstallmentInput): Promise<MutationResult<Installment>> => {
      const baseInstallment: Installment = {
        id: input.id ?? ensureId(),
        loanId: input.loanId,
        sequence: input.sequence,
        date: input.date,
        value: input.value,
        status: input.status,
        interest: input.interest
      };

      if (!hasClient || !supabase) {
        setInstallments((prev) =>
          sortInstallments([...(prev.filter((installment) => installment.id !== baseInstallment.id)), baseInstallment])
        );
        return { success: true, data: baseInstallment };
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
      setInstallments((prev) =>
        sortInstallments([...(prev.filter((installment) => installment.id !== mapped.id)), mapped])
      );
      return { success: true, data: mapped };
    },
    []
  );

  const removeInstallment = useCallback(
    async (installmentId: string): Promise<MutationResult<null>> => {
      const removeFromState = () => {
        setInstallments((prev) => prev.filter((installment) => installment.id !== installmentId));
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
    []
  );

  const resetData = useCallback(async (): Promise<MutationResult<null>> => {
    const clearState = () => {
      setCompanies([]);
      setLoans([]);
      setInstallments([]);
    };

    if (!hasClient || !supabase) {
      clearState();
      return { success: true, data: null };
    }

    try {
      const tables = ["installments", "loans", "companies"] as const;

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
      installments,
      loading,
      error,
      isUsingSupabase: hasClient,
      refresh: fetchData,
      saveCompany: upsertCompany,
      deleteCompany: removeCompany,
      saveLoan: upsertLoan,
      deleteLoan: removeLoan,
      saveInstallment: upsertInstallment,
      deleteInstallment: removeInstallment,
      resetData
    }),
    [
      companies,
      loans,
      installments,
      loading,
      error,
      fetchData,
      upsertCompany,
      removeCompany,
      upsertLoan,
      removeLoan,
      upsertInstallment,
      removeInstallment,
      resetData
    ]
  );
}
