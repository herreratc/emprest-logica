import { useMemo, useState } from "react";
import type { Company, Installment, Loan } from "../data/mockData";
import { formatCurrency, formatDate } from "../utils/formatters";

const cardClass = "rounded-2xl border border-logica-purple/20 bg-white/80 p-4 shadow-md backdrop-blur";

type InstallmentsViewProps = {
  companies: Company[];
  loans: Loan[];
  installments: Installment[];
  selectedCompany: string | "all";
  onSelectCompany: (company: string | "all") => void;
};

type StatusFilter = "todas" | Installment["status"];

type DateRange = {
  start?: string;
  end?: string;
};

export function InstallmentsView({
  companies,
  loans,
  installments,
  selectedCompany,
  onSelectCompany
}: InstallmentsViewProps) {
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("todas");
  const [dateRange, setDateRange] = useState<DateRange>({});
  const [loanFilter, setLoanFilter] = useState<string | "all">("all");

  const filteredInstallments = useMemo(() => {
    return installments.filter((installment) => {
      if (statusFilter !== "todas" && installment.status !== statusFilter) {
        return false;
      }
      if (loanFilter !== "all" && installment.loanId !== loanFilter) {
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
  }, [installments, statusFilter, dateRange, loanFilter]);

  const totals = useMemo(() => {
    const total = filteredInstallments.reduce((acc, item) => acc + item.value, 0);
    const paid = filteredInstallments.filter((item) => item.status === "paga").reduce((acc, item) => acc + item.value, 0);
    return {
      totalCount: filteredInstallments.length,
      pendingCount: filteredInstallments.filter((item) => item.status === "pendente").length,
      paidCount: filteredInstallments.filter((item) => item.status === "paga").length,
      overdueCount: filteredInstallments.filter((item) => item.status === "vencida").length,
      totalValue: total,
      paidValue: paid
    };
  }, [filteredInstallments]);

  const resetFilters = () => {
    setStatusFilter("todas");
    setDateRange({});
    setLoanFilter("all");
  };

  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-semibold text-logica-purple">Parcelas</h1>
          <p className="text-sm text-logica-lilac">Acompanhe a evolução de pagamentos por contrato.</p>
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
            onClick={resetFilters}
            className="rounded-full border border-logica-lilac px-4 py-2 text-sm font-medium text-logica-purple"
          >
            Limpar filtros
          </button>
        </div>
      </header>

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        <div className={cardClass}>
          <p className="text-xs font-semibold uppercase text-logica-lilac">Total de parcelas</p>
          <p className="mt-2 text-3xl font-bold text-logica-purple">{totals.totalCount}</p>
        </div>
        <div className={cardClass}>
          <p className="text-xs font-semibold uppercase text-logica-lilac">Pendentes</p>
          <p className="mt-2 text-3xl font-bold text-logica-purple">{totals.pendingCount}</p>
        </div>
        <div className={cardClass}>
          <p className="text-xs font-semibold uppercase text-logica-lilac">Pagas</p>
          <p className="mt-2 text-3xl font-bold text-logica-purple">{totals.paidCount}</p>
        </div>
        <div className={cardClass}>
          <p className="text-xs font-semibold uppercase text-logica-lilac">Vencidas</p>
          <p className="mt-2 text-3xl font-bold text-logica-purple">{totals.overdueCount}</p>
        </div>
        <div className={cardClass}>
          <p className="text-xs font-semibold uppercase text-logica-lilac">Valor total</p>
          <p className="mt-2 text-2xl font-bold text-logica-rose">{formatCurrency(totals.totalValue)}</p>
        </div>
        <div className={cardClass}>
          <p className="text-xs font-semibold uppercase text-logica-lilac">Valor pago</p>
          <p className="mt-2 text-2xl font-bold text-logica-rose">{formatCurrency(totals.paidValue)}</p>
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
              className="mt-1 w-full rounded-xl border border-logica-lilac/40 bg-white px-4 py-2 text-sm focus:border-logica-purple focus:outline-none"
            >
              <option value="todas">Todas</option>
              <option value="pendente">Pendentes</option>
              <option value="paga">Pagas</option>
              <option value="vencida">Vencidas</option>
            </select>
          </label>
          <label className="text-sm text-logica-purple">
            Data início
            <input
              type="date"
              value={dateRange.start ?? ""}
              onChange={(event) => setDateRange((prev) => ({ ...prev, start: event.target.value || undefined }))}
              className="mt-1 w-full rounded-xl border border-logica-lilac/40 bg-white px-4 py-2 text-sm focus:border-logica-purple focus:outline-none"
            />
          </label>
          <label className="text-sm text-logica-purple">
            Data fim
            <input
              type="date"
              value={dateRange.end ?? ""}
              onChange={(event) => setDateRange((prev) => ({ ...prev, end: event.target.value || undefined }))}
              className="mt-1 w-full rounded-xl border border-logica-lilac/40 bg-white px-4 py-2 text-sm focus:border-logica-purple focus:outline-none"
            />
          </label>
          <label className="text-sm text-logica-purple">
            Contrato
            <select
              value={loanFilter}
              onChange={(event) => setLoanFilter(event.target.value as typeof loanFilter)}
              className="mt-1 w-full rounded-xl border border-logica-lilac/40 bg-white px-4 py-2 text-sm focus:border-logica-purple focus:outline-none"
            >
              <option value="all">Todos</option>
              {loans.map((loan) => (
                <option key={loan.id} value={loan.id}>
                  {loan.reference}
                </option>
              ))}
            </select>
          </label>
        </div>
      </section>

      <section className="overflow-x-auto rounded-2xl border border-logica-purple/10 bg-white/90 p-6 shadow-lg">
        <table className="min-w-full divide-y divide-logica-lilac/30 text-sm text-logica-purple">
          <thead className="bg-logica-light-lilac/60">
            <tr>
              <th className="px-3 py-2 text-left font-semibold">Contrato</th>
              <th className="px-3 py-2 text-left font-semibold">Parcela</th>
              <th className="px-3 py-2 text-left font-semibold">Data</th>
              <th className="px-3 py-2 text-left font-semibold">Valor</th>
              <th className="px-3 py-2 text-left font-semibold">Juros</th>
              <th className="px-3 py-2 text-left font-semibold">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-logica-lilac/20">
            {filteredInstallments.map((installment) => {
              const loan = loans.find((item) => item.id === installment.loanId);
              return (
                <tr key={installment.id} className="hover:bg-logica-light-lilac/40">
                  <td className="px-3 py-2">{loan?.reference ?? "-"}</td>
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
                </tr>
              );
            })}
          </tbody>
        </table>
      </section>
    </div>
  );
}
