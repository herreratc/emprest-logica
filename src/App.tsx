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
import { SettlementsView } from "./components/SettlementsView";

type ViewKey =
  | "dashboard"
  | "companies"
  | "loans"
  | "consortiums"
  | "installments"
  | "simulation"
  | "settlements"
  | "users";

const iconClass = "h-4 w-4 text-logica-purple";

function IconMenu() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={iconClass}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
    </svg>
  );
}

function IconUser() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={iconClass}>
      <path
        fillRule="evenodd"
        d="M12 1.5a4.5 4.5 0 1 0 0 9 4.5 4.5 0 0 0 0-9ZM4.5 19.125a7.5 7.5 0 0 1 15 0V21a.75.75 0 0 1-.75.75h-13.5A.75.75 0 0 1 4.5 21v-1.875Z"
        clipRule="evenodd"
      />
    </svg>
  );
}

function AppContent() {
  const { user, loading, isConfigured, signOut } = useAuth();
  const [view, setView] = useState<ViewKey>("dashboard");
  const [selectedCompany, setSelectedCompany] = useState<string | "all">("all");
  const [signOutError, setSignOutError] = useState<string | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
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
    saveInstallment,
    isUsingSupabase
  } = useSupabaseData();

  const displayName = useMemo(() => {
    if (!user) return "Modo demonstração";
    const metadataName =
      (user.user_metadata?.name as string | undefined) ||
      (user.user_metadata?.full_name as string | undefined) ||
      (user.user_metadata?.fullName as string | undefined) ||
      (user.user_metadata?.display_name as string | undefined);
    if (metadataName?.trim()) return metadataName.trim();
    if (user.email) return user.email.split("@")[0];
    return "Usuário autenticado";
  }, [user]);

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
    <div className="min-h-screen bg-gradient-to-b from-[#f9f5ff] via-[#fff8fb] to-[#f3ecff] text-logica-deep-purple antialiased md:flex">
      <Sidebar activeView={view} onChangeView={setView} isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />
      <main className="flex-1 overflow-y-auto p-4 sm:p-6 md:p-8">
        <div className="mb-4 flex items-center justify-between md:hidden">
          <button
            type="button"
            onClick={() => setIsSidebarOpen(true)}
            className="flex items-center gap-2 rounded-full border border-logica-lilac bg-white px-3 py-2 text-sm font-semibold text-logica-purple shadow-sm"
          >
            <IconMenu />
            Menu
          </button>
          <div className="flex items-center gap-2 rounded-full bg-white px-3 py-2 text-xs font-semibold text-logica-purple shadow-inner">
            <IconUser />
            {displayName}
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
            userName={displayName}
            isAuthenticated={!!user}
            onSignOut={user ? handleSignOut : undefined}
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
            onSaveInstallment={saveInstallment}
          />
        )}
        {view === "settlements" && (
          <SettlementsView
            companies={companies}
            loans={filteredLoans}
            consortiums={filteredConsortiums}
            selectedCompany={selectedCompany}
            onSelectCompany={setSelectedCompany}
            onSaveLoan={saveLoan}
            onSaveConsortium={saveConsortium}
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
