import { useMemo, useState } from "react";
import { AuthProvider, useAuth } from "./auth/AuthProvider";
import { Sidebar } from "./components/Sidebar";
import { Dashboard } from "./components/Dashboard";
import { CompaniesView } from "./components/CompaniesView";
import { LoansView } from "./components/LoansView";
import { InstallmentsView } from "./components/InstallmentsView";
import { SimulationView } from "./components/SimulationView";
import { UsersView } from "./components/UsersView";
import { LoginView } from "./components/LoginView";
import { companies, installments, loans } from "./data/mockData";

type ViewKey = "dashboard" | "companies" | "loans" | "installments" | "simulation" | "users";

function AppContent() {
  const { user, loading, isConfigured } = useAuth();
  const [view, setView] = useState<ViewKey>("dashboard");
  const [selectedCompany, setSelectedCompany] = useState<string | "all">("all");

  const filteredLoans = useMemo(() => {
    if (selectedCompany === "all") return loans;
    return loans.filter((loan) => loan.companyId === selectedCompany);
  }, [selectedCompany]);

  const filteredInstallments = useMemo(() => {
    if (selectedCompany === "all") return installments;
    const loanIds = new Set(filteredLoans.map((loan) => loan.id));
    return installments.filter((installment) => loanIds.has(installment.loanId));
  }, [selectedCompany, filteredLoans]);

  if (loading) {
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
        {view === "dashboard" && (
          <Dashboard
            companies={companies}
            selectedCompany={selectedCompany}
            onSelectCompany={setSelectedCompany}
            loans={filteredLoans}
            installments={filteredInstallments}
          />
        )}
        {view === "companies" && (
          <CompaniesView
            companies={companies}
            selectedCompany={activeCompany}
            onSelectCompany={setSelectedCompany}
          />
        )}
        {view === "loans" && (
          <LoansView
            companies={companies}
            loans={filteredLoans}
            selectedCompany={selectedCompany}
            onSelectCompany={setSelectedCompany}
          />
        )}
        {view === "installments" && (
          <InstallmentsView
            companies={companies}
            installments={filteredInstallments}
            loans={filteredLoans}
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
