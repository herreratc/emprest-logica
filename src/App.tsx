import { useMemo, useState } from "react";
import { AuthProvider, useAuth } from "./auth/AuthProvider";
import { Sidebar } from "./components/Sidebar";
import { Dashboard } from "./components/Dashboard";
import { CompaniesView } from "./components/CompaniesView";
import { LoansView } from "./components/LoansView";
import { ConsortiumsView } from "./components/ConsortiumsView";
import { InstallmentsView } from "./components/InstallmentsView";
import { SimulationView } from "./components/SimulationView";
import { UsersView } from "./components/UsersView";
import { LoginView } from "./components/LoginView";
import { useSupabaseData } from "./hooks/useSupabaseData";

type ViewKey =
  | "dashboard"
  | "companies"
  | "loans"
  | "consortiums"
  | "installments"
  | "simulation"
  | "users";

function AppContent() {
  const { user, loading, isConfigured } = useAuth();
  const [view, setView] = useState<ViewKey>("dashboard");
  const [selectedCompany, setSelectedCompany] = useState<string | "all">("all");
  const {
    companies,
    loans,
    consortiums,
    installments,
    loading: dataLoading,
    error: dataError,
    refresh,
    saveCompany,
    deleteCompany,
    saveLoan,
    deleteLoan,
    saveConsortium,
    deleteConsortium,
    resetData,
    isUsingSupabase
  } = useSupabaseData();

  const filteredLoans = useMemo(() => {
    if (selectedCompany === "all") return loans;
    return loans.filter((loan) => loan.companyId === selectedCompany);
  }, [selectedCompany, loans]);

  const filteredConsortiums = useMemo(() => {
    if (selectedCompany === "all") return consortiums;
    return consortiums.filter((consortium) => consortium.companyId === selectedCompany);
  }, [selectedCompany, consortiums]);

  const filteredInstallments = useMemo(() => {
    if (selectedCompany === "all") return installments;
    const loanIds = new Set(filteredLoans.map((loan) => loan.id));
    const consortiumIds = new Set(filteredConsortiums.map((item) => item.id));
    return installments.filter((installment) => {
      if (installment.contractType === "loan") {
        return loanIds.has(installment.contractId);
      }
      if (installment.contractType === "consortium") {
        return consortiumIds.has(installment.contractId);
      }
      return false;
    });
  }, [selectedCompany, installments, filteredLoans, filteredConsortiums]);

  if (loading || dataLoading) {
    return (
      <div className="flex h-screen items-center justify-center bg-logica-light-lilac">
        <div className="text-lg font-semibold text-logica-purple">Carregando...</div>
      </div>
    );
  }

  if (!user && isConfigured) {
    return <LoginView />;
  }

  const activeCompany =
    selectedCompany === "all" ? undefined : companies.find((company) => company.id === selectedCompany);

  return (
    <div className="flex min-h-screen bg-logica-light-lilac text-logica-deep-purple">
      <Sidebar activeView={view} onChangeView={setView} />
      <main className="flex-1 overflow-y-auto p-6">
        {!isConfigured && (
          <div className="mb-4 rounded-2xl border border-yellow-200 bg-yellow-50 p-4 text-sm text-yellow-800">
            Modo demonstração ativo: configure o Supabase para habilitar login e persistência real dos dados.
          </div>
        )}
        {dataError && (
          <div className="mb-4 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
            Falha ao carregar dados do Supabase: {dataError}
            <button
              className="ml-4 rounded-lg bg-logica-purple px-3 py-1 text-white transition hover:bg-logica-deep-purple"
              onClick={refresh}
              type="button"
            >
              Tentar novamente
            </button>
          </div>
        )}
        {view === "dashboard" && (
          <Dashboard
            companies={companies}
            selectedCompany={selectedCompany}
            onSelectCompany={setSelectedCompany}
            loans={filteredLoans}
            consortiums={filteredConsortiums}
            installments={filteredInstallments}
            onResetData={resetData}
            isUsingSupabase={isUsingSupabase}
          />
        )}
        {view === "companies" && (
          <CompaniesView
            companies={companies}
            selectedCompany={activeCompany}
            onSelectCompany={setSelectedCompany}
            onSaveCompany={saveCompany}
            onDeleteCompany={deleteCompany}
            isUsingSupabase={isUsingSupabase}
          />
        )}
        {view === "loans" && (
          <LoansView
            companies={companies}
            loans={filteredLoans}
            selectedCompany={selectedCompany}
            onSelectCompany={setSelectedCompany}
            onSaveLoan={saveLoan}
            onDeleteLoan={deleteLoan}
            isUsingSupabase={isUsingSupabase}
          />
        )}
        {view === "consortiums" && (
          <ConsortiumsView
            companies={companies}
            consortiums={filteredConsortiums}
            selectedCompany={selectedCompany}
            onSelectCompany={setSelectedCompany}
            onSaveConsortium={saveConsortium}
            onDeleteConsortium={deleteConsortium}
            isUsingSupabase={isUsingSupabase}
          />
        )}
        {view === "installments" && (
          <InstallmentsView
            companies={companies}
            installments={filteredInstallments}
            loans={filteredLoans}
            consortiums={filteredConsortiums}
            selectedCompany={selectedCompany}
            onSelectCompany={setSelectedCompany}
          />
        )}
        {view === "simulation" && <SimulationView />}
        {view === "users" && <UsersView />}
      </main>
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}
