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
  const { user, loading, isConfigured, signOut } = useAuth();
  const [view, setView] = useState<ViewKey>("dashboard");
  const [selectedCompany, setSelectedCompany] = useState<string | "all">("all");
  const [signOutError, setSignOutError] = useState<string | null>(null);
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
    deleteInstallment,
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

  const handleSignOut = async () => {
    setSignOutError(null);
    if (!isConfigured) {
      setSignOutError("Configure o Supabase para encerrar sessões.");
      return;
    }
    try {
      await signOut();
    } catch (err) {
      setSignOutError(err instanceof Error ? err.message : "Erro ao sair");
    }
  };

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
        <div className="mb-6 flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-logica-light-lilac bg-white/80 p-4 shadow-md">
          <div className="flex items-center gap-3">
            <div className="rounded-2xl bg-logica-light-lilac p-2 shadow-inner shadow-logica-light-lilac/80">
              <img src="/logo.svg" alt="Lógica" className="h-12 w-12" />
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-logica-lilac">Painel financeiro</p>
              <p className="text-lg font-semibold text-logica-purple">
                {user ? `Olá, ${user.email}` : "Modo demonstração"}
              </p>
              <p className="text-xs text-logica-lilac">{companies.length} empresas cadastradas</p>
            </div>
          </div>
          <div className="flex items-center gap-3 text-sm text-logica-purple">
            {user && (
              <button
                type="button"
                onClick={handleSignOut}
                className="flex items-center gap-2 rounded-full border border-logica-light-lilac bg-white px-3 py-2 font-semibold shadow-sm transition hover:-translate-y-0.5 hover:shadow"
              >
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="h-5 w-5">
                  <path d="M13 4.5a.75.75 0 0 0-1.5 0v3.75a.75.75 0 0 0 1.5 0V4.5ZM13 15.75a.75.75 0 0 0-1.5 0v3.75a.75.75 0 0 0 1.5 0v-3.75Z" />
                  <path
                    fillRule="evenodd"
                    d="M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9-7.5a7.5 7.5 0 1 0 7.5 7.5A7.508 7.508 0 0 0 12 4.5Zm-2.03 5.47a.75.75 0 0 1 1.06 0L12 10.94l.97-.97a.75.75 0 0 1 1.06 1.06l-.97.97.97.97a.75.75 0 1 1-1.06 1.06L12 13.06l-.97.97a.75.75 0 1 1-1.06-1.06l.97-.97-.97-.97a.75.75 0 0 1 0-1.06Z"
                  />
                </svg>
                Sair
              </button>
            )}
            {!user && (
              <div className="rounded-full bg-logica-light-lilac px-3 py-2 font-semibold text-logica-purple">
                Login necessário para sincronizar
              </div>
            )}
          </div>
        </div>
        {signOutError && (
          <div className="mb-4 rounded-2xl border border-rose-200 bg-rose-50 p-3 text-sm text-rose-700">
            {signOutError}
          </div>
        )}
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
            onDeleteInstallment={deleteInstallment}
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
