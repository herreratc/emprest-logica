import { useCallback, useMemo, useState } from "react";
import type { Company, Consortium, Installment, Loan } from "../data/mockData";
import { formatCurrency, formatDate } from "../utils/formatters";
import type { MutationResult } from "../hooks/useSupabaseData";

const cardClass = "rounded-2xl border border-logica-purple/20 bg-white/80 p-4 shadow-md backdrop-blur";
const inputClass =
  "w-full rounded-xl border border-logica-lilac/40 bg-white px-4 py-2 text-sm text-logica-purple focus:border-logica-purple focus:outline-none";

const feedbackClass = (type: "success" | "error") =>
  `rounded-xl border px-4 py-2 text-sm ${
    type === "success" ? "border-green-200 bg-green-50 text-green-700" : "border-red-200 bg-red-50 text-red-700"
  }`;

type InstallmentsViewProps = {
  companies: Company[];
  loans: Loan[];
  consortiums: Consortium[];
  installments: Installment[];
  selectedCompany: string | "all";
  onSelectCompany: (company: string | "all") => void;
  onDeleteInstallment: (installmentId: string) => Promise<MutationResult<null>>;
};

type StatusFilter = "todas" | Installment["status"];
type ContractFilter = "all" | `${"loan" | "consortium"}:${string}`;
type DateRange = { start?: string; end?: string };
type FeedbackState = { type: "success" | "error"; message: string } | null;

type ContractMaps = {
  companies: Map<string, Company>;
  loans: Map<string, Loan>;
  consortiums: Map<string, Consortium>;
};

const buildContractMaps = (companies: Company[], loans: Loan[], consortiums: Consortium[]): ContractMaps => {
  const companiesMap = new Map<string, Company>();
  companies.forEach((company) => companiesMap.set(company.id, company));

  const loansMap = new Map<string, Loan>();
  loans.forEach((loan) => loansMap.set(loan.id, loan));

  const consortiumMap = new Map<string, Consortium>();
  consortiums.forEach((consortium) => consortiumMap.set(consortium.id, consortium));

  return { companies: companiesMap, loans: loansMap, consortiums: consortiumMap };
};

const getContractDisplayLabel = (
  contract: Loan | Consortium,
  contractType: Installment["contractType"]
) => (contractType === "loan" ? (contract as Loan).reference : (contract as Consortium).observation);

export function InstallmentsView({
  companies,
  loans,
  consortiums,
  installments,
  selectedCompany,
  onSelectCompany,
  onDeleteInstallment
}: InstallmentsViewProps) {
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("todas");
  const [dateRange, setDateRange] = useState<DateRange>({});
  const [contractFilter, setContractFilter] = useState<ContractFilter>("all");
  const [contractTypeFilter, setContractTypeFilter] = useState<"todos" | "loan" | "consortium">("todos");
  const [tableFeedback, setTableFeedback] = useState<FeedbackState>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const maps = useMemo(() => buildContractMaps(companies, loans, consortiums), [companies, loans, consortiums]);

  const filteredInstallments = useMemo(() => {
    return installments.filter((installment) => {
      if (statusFilter !== "todas" && installment.status !== statusFilter) {
        return false;
      }
      if (contractTypeFilter !== "todos" && installment.contractType !== contractTypeFilter) {
        return false;
      }
      if (
        contractFilter !== "all" &&
        `${installment.contractType}:${installment.contractId}` !== contractFilter
      ) {
        return false;
      }
      if (dateRange.start && new Date(installment.date) < new Date(dateRange.start)) {
        return false;
      }
      if (dateRange.end && new Date(installment.date) > new Date(dateRange.end)) {
        return false;
      }
      return true;
    });
  }, [installments, statusFilter, dateRange, contractFilter, contractTypeFilter]);

  const totals = useMemo(() => {
    const totalValue = filteredInstallments.reduce((acc, item) => acc + item.value, 0);
    const paidValue = filteredInstallments
      .filter((item) => item.status === "paga")
      .reduce((acc, item) => acc + item.value, 0);

    return {
      totalCount: filteredInstallments.length,
      pendingCount: filteredInstallments.filter((item) => item.status === "pendente").length,
      paidCount: filteredInstallments.filter((item) => item.status === "paga").length,
      overdueCount: filteredInstallments.filter((item) => item.status === "vencida").length,
      totalValue,
      paidValue
    };
  }, [filteredInstallments]);

  const contractOptions = useMemo(() => {
    const options: Array<{ label: string; value: ContractFilter }> = [{ label: "Todos", value: "all" }];

    loans.forEach((loan) => {
      options.push({ label: `Empréstimo · ${loan.reference}`, value: `loan:${loan.id}` });
    });

    consortiums.forEach((consortium) => {
      options.push({ label: `Consórcio · ${consortium.observation}`, value: `consortium:${consortium.id}` });
    });

    return options;
  }, [loans, consortiums]);

  const resetFilters = () => {
    setStatusFilter("todas");
    setDateRange({});
    setContractFilter("all");
    setContractTypeFilter("todos");
  };

  const handleDeleteInstallment = useCallback(
    async (installmentId: string) => {
      setTableFeedback(null);
      setDeletingId(installmentId);
      const result = await onDeleteInstallment(installmentId);
      setDeletingId(null);

      if (!result.success) {
        setTableFeedback({
          type: "error",
          message: result.error ?? "Não foi possível remover a parcela selecionada."
        });
        return;
      }

      setTableFeedback({ type: "success", message: "Parcela removida com sucesso." });
    },
    [onDeleteInstallment]
  );

  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-semibold text-logica-purple">Parcelas</h1>
          <p className="text-sm text-logica-lilac">
            As parcelas agora são geradas automaticamente sempre que um empréstimo é cadastrado.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <select
            value={selectedCompany}
            onChange={(event) => onSelectCompany(event.target.value as typeof selectedCompany)}
            className="rounded-full border border-logica-lilac bg-white px-4 py-2 text-sm font-medium text-logica-purple shadow"
          >
            <option value="all">Todas as empresas</option>
            {companies.map((company) => (
              <option key={company.id} value={company.id}>
                {company.name}
              </option>
            ))}
          </select>
          <button
            type="button"
            onClick={resetFilters}
            className="rounded-full border border-logica-lilac px-4 py-2 text-sm font-semibold text-logica-purple"
          >
            Limpar filtros
          </button>
        </div>
      </header>

      <section className="rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-800">
        Novos empréstimos criados na aba correspondente já recebem o cronograma de parcelas com base nas
        informações do contrato.
      </section>

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <div className={cardClass}>
          <p className="text-xs font-semibold uppercase text-logica-lilac">Parcelas filtradas</p>
          <p className="mt-2 text-3xl font-bold text-logica-purple">{totals.totalCount}</p>
          <p className="text-xs text-logica-lilac">Total: {formatCurrency(totals.totalValue)}</p>
        </div>
        <div className={cardClass}>
          <p className="text-xs font-semibold uppercase text-logica-lilac">Pagas</p>
          <p className="mt-2 text-3xl font-bold text-logica-purple">{totals.paidCount}</p>
          <p className="text-xs text-logica-lilac">{formatCurrency(totals.paidValue)} recebidos</p>
        </div>
        <div className={cardClass}>
          <p className="text-xs font-semibold uppercase text-logica-lilac">Pendentes</p>
          <p className="mt-2 text-3xl font-bold text-logica-purple">{totals.pendingCount}</p>
        </div>
        <div className={cardClass}>
          <p className="text-xs font-semibold uppercase text-logica-lilac">Vencidas</p>
          <p className="mt-2 text-3xl font-bold text-logica-purple">{totals.overdueCount}</p>
        </div>
      </section>

      <section className="rounded-2xl border border-logica-purple/20 bg-white/90 p-6 shadow-lg">
        <h2 className="text-lg font-semibold text-logica-purple">Filtros avançados</h2>
        <div className="mt-4 grid gap-4 md:grid-cols-4">
          <label className="text-sm text-logica-purple">
            Status
            <select
              value={statusFilter}
              onChange={(event) => setStatusFilter(event.target.value as StatusFilter)}
              className={`mt-1 ${inputClass}`}
            >
              <option value="todas">Todas</option>
              <option value="pendente">Pendentes</option>
              <option value="paga">Pagas</option>
              <option value="vencida">Vencidas</option>
            </select>
          </label>
          <label className="text-sm text-logica-purple">
            Tipo de contrato
            <select
              value={contractTypeFilter}
              onChange={(event) => setContractTypeFilter(event.target.value as typeof contractTypeFilter)}
              className={`mt-1 ${inputClass}`}
            >
              <option value="todos">Todos</option>
              <option value="loan">Empréstimos</option>
              <option value="consortium">Consórcios</option>
            </select>
          </label>
          <label className="text-sm text-logica-purple">
            Data início
            <input
              type="date"
              value={dateRange.start ?? ""}
              onChange={(event) => setDateRange((prev) => ({ ...prev, start: event.target.value || undefined }))}
              className={`mt-1 ${inputClass}`}
            />
          </label>
          <label className="text-sm text-logica-purple">
            Data fim
            <input
              type="date"
              value={dateRange.end ?? ""}
              onChange={(event) => setDateRange((prev) => ({ ...prev, end: event.target.value || undefined }))}
              className={`mt-1 ${inputClass}`}
            />
          </label>
          <label className="text-sm text-logica-purple">
            Contrato
            <select
              value={contractFilter}
              onChange={(event) => setContractFilter(event.target.value as ContractFilter)}
              className={`mt-1 ${inputClass}`}
            >
              {contractOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </label>
        </div>
      </section>

      <section className="overflow-x-auto rounded-2xl border border-logica-purple/10 bg-white/90 p-6 shadow-lg">
        <div className="flex items-center justify-between gap-4">
          <h2 className="text-lg font-semibold text-logica-purple">Parcelas filtradas</h2>
          {tableFeedback && <div className={feedbackClass(tableFeedback.type)}>{tableFeedback.message}</div>}
        </div>
        <table className="mt-4 min-w-full divide-y divide-logica-lilac/30 text-sm text-logica-purple">
          <thead className="bg-logica-light-lilac/60">
            <tr>
              <th className="px-3 py-2 text-left font-semibold">Contrato</th>
              <th className="px-3 py-2 text-left font-semibold">Empresa</th>
              <th className="px-3 py-2 text-left font-semibold">Tipo</th>
              <th className="px-3 py-2 text-left font-semibold">Parcela</th>
              <th className="px-3 py-2 text-left font-semibold">Vencimento</th>
              <th className="px-3 py-2 text-left font-semibold">Valor</th>
              <th className="px-3 py-2 text-left font-semibold">Juros</th>
              <th className="px-3 py-2 text-left font-semibold">Status</th>
              <th className="px-3 py-2 text-right font-semibold">Ações</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-logica-lilac/20">
            {filteredInstallments.map((installment) => {
              const contract =
                installment.contractType === "loan"
                  ? maps.loans.get(installment.contractId)
                  : maps.consortiums.get(installment.contractId);
              const contractName = contract
                ? getContractDisplayLabel(contract, installment.contractType)
                : "-";
              const companyName = contract ? maps.companies.get(contract.companyId)?.name ?? "-" : "-";
              const contractTypeLabel = installment.contractType === "loan" ? "Empréstimo" : "Consórcio";

              return (
                <tr key={installment.id} className="hover:bg-logica-light-lilac/40">
                  <td className="px-3 py-2">{contractName}</td>
                  <td className="px-3 py-2">{companyName}</td>
                  <td className="px-3 py-2">{contractTypeLabel}</td>
                  <td className="px-3 py-2">{installment.sequence}</td>
                  <td className="px-3 py-2">{formatDate(installment.date)}</td>
                  <td className="px-3 py-2">{formatCurrency(installment.value)}</td>
                  <td className="px-3 py-2">{formatCurrency(installment.interest)}</td>
                  <td className="px-3 py-2">
                    <span
                      className={`rounded-full px-3 py-1 text-xs font-semibold uppercase ${
                        installment.status === "paga"
                          ? "bg-logica-purple/20 text-logica-purple"
                          : installment.status === "pendente"
                          ? "bg-logica-rose/20 text-logica-rose"
                          : "bg-red-100 text-red-600"
                      }`}
                    >
                      {installment.status}
                    </span>
                  </td>
                  <td className="px-3 py-2 text-right">
                    <button
                      type="button"
                      onClick={() => void handleDeleteInstallment(installment.id)}
                      className="rounded-full border border-red-200 px-3 py-1 text-xs font-semibold text-red-600 transition hover:bg-red-50 disabled:opacity-60"
                      disabled={deletingId === installment.id}
                    >
                      {deletingId === installment.id ? "Removendo..." : "Excluir"}
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </section>
    </div>
  );
}
