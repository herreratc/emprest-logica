import { useMemo, useState } from "react";
import type { Company, Consortium, Installment, Loan } from "../data/mockData";
import { formatCurrency, formatDate } from "../utils/formatters";
import type { MutationResult, UpsertInstallmentInput } from "../hooks/useSupabaseData";

const cardClass = "rounded-2xl border border-logica-purple/20 bg-white/80 p-4 shadow-md backdrop-blur";
const inputClass =
  "w-full rounded-lg border border-logica-lilac/40 bg-white px-3 py-1.5 text-xs text-logica-purple focus:border-logica-purple focus:outline-none";

type InstallmentsViewProps = {
  companies: Company[];
  loans: Loan[];
  consortiums: Consortium[];
  installments: Installment[];
  selectedCompany: string | "all";
  onSelectCompany: (company: string | "all") => void;
  onSaveInstallment: (input: UpsertInstallmentInput) => Promise<MutationResult<Installment>>;
};

type StatusFilter = "todas" | Installment["status"];
type ContractFilter = "all" | `${"loan" | "consortium"}:${string}`;
type DateRange = { start?: string; end?: string };
type ContractMaps = {
  companies: Map<string, Company>;
  loans: Map<string, Loan>;
  consortiums: Map<string, Consortium>;
};

type FeedbackState = { type: "success" | "error"; message: string } | null;

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
  onSaveInstallment
}: InstallmentsViewProps) {
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("todas");
  const [dateRange, setDateRange] = useState<DateRange>({});
  const [contractFilter, setContractFilter] = useState<ContractFilter>("all");
  const [contractTypeFilter, setContractTypeFilter] = useState<"todos" | "loan" | "consortium">("todos");
  const [editingInstallment, setEditingInstallment] = useState<Installment | null>(null);
  const [editForm, setEditForm] = useState<{ date: string; value: string; status: Installment["status"]; interest: string }>(
    {
      date: "",
      value: "",
      status: "pendente",
      interest: ""
    }
  );
  const [editFeedback, setEditFeedback] = useState<FeedbackState>(null);
  const [isSavingEdit, setIsSavingEdit] = useState(false);

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

  const startEditing = (installment: Installment) => {
    setEditingInstallment(installment);
    setEditForm({
      date: installment.date,
      value: installment.value.toString(),
      status: installment.status,
      interest: installment.interest.toString()
    });
    setEditFeedback(null);
  };

  const handleSaveEdit = async () => {
    if (!editingInstallment) return;
    setIsSavingEdit(true);
    setEditFeedback(null);

    const payload: UpsertInstallmentInput = {
      ...editingInstallment,
      date: editForm.date,
      value: Number(editForm.value) || 0,
      status: editForm.status,
      interest: Number(editForm.interest) || 0
    };

    const result = await onSaveInstallment(payload);

    if (!result.success) {
      setEditFeedback({ type: "error", message: result.error });
      setIsSavingEdit(false);
      return;
    }

    setEditFeedback({ type: "success", message: "Parcela atualizada com sucesso." });
    setEditingInstallment(result.data);
    setIsSavingEdit(false);
  };

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
        </div>
      </header>

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
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-lg font-semibold text-logica-purple">Filtros avançados</h2>
          <button
            type="button"
            onClick={resetFilters}
            className="rounded-full border border-logica-lilac px-4 py-2 text-xs font-semibold text-logica-purple"
          >
            Limpar filtros
          </button>
        </div>
        <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
          <label className="text-xs font-medium text-logica-purple">
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
          <label className="text-xs font-medium text-logica-purple">
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
          <label className="text-xs font-medium text-logica-purple">
            Data início
            <input
              type="date"
              value={dateRange.start ?? ""}
              onChange={(event) => setDateRange((prev) => ({ ...prev, start: event.target.value || undefined }))}
              className={`mt-1 ${inputClass}`}
            />
          </label>
          <label className="text-xs font-medium text-logica-purple">
            Data fim
            <input
              type="date"
              value={dateRange.end ?? ""}
              onChange={(event) => setDateRange((prev) => ({ ...prev, end: event.target.value || undefined }))}
              className={`mt-1 ${inputClass}`}
            />
          </label>
          <label className="text-xs font-medium text-logica-purple">
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
        <h2 className="text-lg font-semibold text-logica-purple">Parcelas filtradas</h2>
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
              <th className="px-3 py-2 text-left font-semibold">Editar</th>
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
                          ? "bg-emerald-100 text-emerald-700"
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
                      onClick={() => startEditing(installment)}
                      className="rounded-full border border-logica-purple px-3 py-1 text-xs font-semibold text-logica-purple transition hover:bg-logica-purple hover:text-white"
                    >
                      Editar
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </section>

      {editingInstallment && (
        <section className="rounded-2xl border border-logica-purple/20 bg-white/90 p-6 shadow-lg">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <h3 className="text-lg font-semibold text-logica-purple">Editar parcela #{editingInstallment.sequence}</h3>
              <p className="text-xs text-logica-lilac">
                Somente edição está habilitada para parcelas — exclusão foi desabilitada.
              </p>
            </div>
            <button
              type="button"
              className="rounded-full border border-logica-lilac px-3 py-1 text-xs font-semibold text-logica-purple hover:border-logica-purple"
              onClick={() => setEditingInstallment(null)}
            >
              Fechar
            </button>
          </div>

          {editFeedback && (
            <div
              className={`mt-4 rounded-xl border px-4 py-3 text-sm ${
                editFeedback.type === "success"
                  ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                  : "border-red-200 bg-red-50 text-red-700"
              }`}
            >
              {editFeedback.message}
            </div>
          )}

          <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <label className="text-xs font-semibold text-logica-purple">
              Vencimento
              <input
                type="date"
                value={editForm.date}
                onChange={(event) => setEditForm((prev) => ({ ...prev, date: event.target.value }))}
                className={`mt-1 ${inputClass}`}
              />
            </label>
            <label className="text-xs font-semibold text-logica-purple">
              Valor
              <input
                type="number"
                min={0}
                step="0.01"
                value={editForm.value}
                onChange={(event) => setEditForm((prev) => ({ ...prev, value: event.target.value }))}
                className={`mt-1 ${inputClass}`}
              />
            </label>
            <label className="text-xs font-semibold text-logica-purple">
              Juros
              <input
                type="number"
                min={0}
                step="0.01"
                value={editForm.interest}
                onChange={(event) => setEditForm((prev) => ({ ...prev, interest: event.target.value }))}
                className={`mt-1 ${inputClass}`}
              />
            </label>
            <label className="text-xs font-semibold text-logica-purple">
              Status
              <select
                value={editForm.status}
                onChange={(event) =>
                  setEditForm((prev) => ({ ...prev, status: event.target.value as Installment["status"] }))
                }
                className={`mt-1 ${inputClass}`}
              >
                <option value="pendente">Pendente</option>
                <option value="paga">Paga</option>
                <option value="vencida">Vencida</option>
              </select>
            </label>
          </div>

          <div className="mt-4 flex flex-wrap gap-2">
            <button
              type="button"
              onClick={handleSaveEdit}
              disabled={isSavingEdit}
              className="rounded-full bg-logica-purple px-4 py-2 text-sm font-semibold text-white shadow transition hover:bg-logica-deep-purple disabled:opacity-60"
            >
              {isSavingEdit ? "Salvando..." : "Salvar alterações"}
            </button>
            <button
              type="button"
              onClick={() => setEditingInstallment(null)}
              className="rounded-full border border-logica-lilac px-4 py-2 text-sm font-semibold text-logica-purple hover:border-logica-purple"
            >
              Cancelar
            </button>
          </div>
        </section>
      )}
    </div>
  );
}
