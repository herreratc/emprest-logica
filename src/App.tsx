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

function IconLogout() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" className={iconClass}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 8.25 19.5 12l-3.75 3.75" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 12h-9.75m0 0V8.25m0 3.75V15.75M12 3H6.75A2.25 2.25 0 0 0 4.5 5.25v13.5A2.25 2.25 0 0 0 6.75 21H12" />
    </svg>
  );
}

function IconFilter() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className={iconClass}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M7 12h10M10 18h4" />
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
    deleteInstallment,
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
    <div className="min-h-screen bg-logica-light-lilac text-logica-deep-purple md:flex">
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
        <div className="mb-6 flex flex-col gap-4 rounded-2xl border border-logica-light-lilac bg-white/85 p-4 shadow-md sm:flex-row sm:items-start sm:justify-between">
          <div className="flex flex-1 items-center gap-3">
            <div className="rounded-2xl bg-logica-light-lilac p-2 shadow-inner shadow-logica-light-lilac/80">
              <img src="/logo.svg" alt="Lógica" className="h-12 w-12" />
            </div>
            <div className="space-y-1">
              <p className="text-xs font-semibold uppercase tracking-wide text-logica-lilac">Painel financeiro</p>
              <p className="text-lg font-semibold text-logica-purple">{displayName}</p>
              <p className="text-xs text-logica-lilac">{companies.length} empresas cadastradas</p>
            </div>
          </div>
          <div className="flex flex-1 flex-col gap-3 sm:items-end">
            <div className="flex flex-wrap items-center gap-3">
              <div className="rounded-xl border border-logica-light-lilac bg-logica-light-lilac/50 px-4 py-3 text-sm text-logica-purple shadow-inner">
                <p className="text-[11px] uppercase tracking-wide text-logica-lilac">Filtro ativo</p>
                <div className="mt-1 flex items-center gap-2 font-semibold text-logica-deep-purple">
                  <IconFilter />
                  {selectedCompany === "all" ? "Todas as empresas (visão consolidada)" : activeCompany?.name ?? "Selecionar"}
                </div>
              </div>
              {user ? (
                <div className="flex items-center gap-2 rounded-full border border-logica-light-lilac bg-white px-3 py-2 text-sm font-semibold text-logica-purple shadow-sm">
                  <IconUser />
                  <span className="whitespace-nowrap">{displayName}</span>
                  <span className="h-4 w-px bg-logica-light-lilac" aria-hidden />
                  <button
                    type="button"
                    onClick={handleSignOut}
                    className="flex items-center gap-1 rounded-full px-2 py-1 text-xs font-semibold text-logica-purple transition hover:text-logica-deep-purple"
                  >
                    <IconLogout />
                    Sair
                  </button>
                </div>
              ) : (
                <div className="rounded-full bg-logica-light-lilac px-3 py-2 text-sm font-semibold text-logica-purple">
                  Login necessário para sincronizar
                </div>
              )}
            </div>
            <label className="flex flex-col text-xs font-semibold uppercase tracking-wide text-logica-lilac">
              Selecionar empresa
              <select
                value={selectedCompany}
                onChange={(event) => setSelectedCompany(event.target.value as typeof selectedCompany)}
                className="mt-1 min-w-[220px] rounded-full border border-logica-lilac bg-white px-4 py-2 text-sm font-semibold text-logica-purple shadow transition focus:border-logica-purple focus:outline-none"
              >
                <option value="all">Todas as empresas</option>
                {companies.map((company) => (
                  <option key={company.id} value={company.id}>
                    {company.name}
                  </option>
                ))}
              </select>
            </label>
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
