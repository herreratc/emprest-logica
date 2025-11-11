import { useCallback, useEffect, useMemo, useState } from "react";
import { hasSupabaseConfig, supabase } from "../supabaseClient";
import {
  companies as mockCompanies,
  installments as mockInstallments,
  loans as mockLoans,
  type Company,
  type Installment,
  type Loan
} from "../data/mockData";

export type SupabaseDataState = {
  companies: Company[];
  loans: Loan[];
  installments: Installment[];
  loading: boolean;
  error: string | null;
  isUsingSupabase: boolean;
  refresh: () => Promise<void>;
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
      setCompanies(mockCompanies);
      setLoans(mockLoans);
      setInstallments(mockInstallments);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const [companiesResponse, loansResponse, installmentsResponse] = await Promise.all([
        supabase.from("companies").select("*"),
        supabase.from("loans").select("*"),
        supabase.from("installments").select("*")
      ]);

      const responses = [companiesResponse, loansResponse, installmentsResponse];

      const firstError = responses.find((response) => response.error)?.error;

      if (firstError) {
        setError(firstError.message);
        return;
      }

      setCompanies((companiesResponse.data as Company[]) ?? []);
      setLoans((loansResponse.data as Loan[]) ?? []);
      setInstallments((installmentsResponse.data as Installment[]) ?? []);
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

  return useMemo(
    () => ({
      companies,
      loans,
      installments,
      loading,
      error,
      isUsingSupabase: hasClient,
      refresh: fetchData
    }),
    [companies, loans, installments, loading, error, fetchData]
  );
}
