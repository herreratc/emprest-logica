import { useMemo } from "react";
import type { Company, Consortium, Installment, Loan } from "../data/mockData";
import { formatCurrency } from "../utils/formatters";

const cardBaseClass =
  "rounded-2xl border border-white/50 bg-white/80 p-5 shadow-lg shadow-black/5 backdrop-blur transition";

type DashboardProps = {
  companies: Company[];
  selectedCompany: string | "all";
  onSelectCompany: (company: string | "all") => void;
  loans: Loan[];
  consortiums: Consortium[];
  installments: Installment[];
};

export function Dashboard({
  companies,
  selectedCompany,
  onSelectCompany,
  loans,
  consortiums,
  installments
}: DashboardProps) {
  const overdueInstallments = installments.filter((installment) => installment.status === "vencida");
  const paidInstallments = installments.filter((installment) => installment.status === "paga");
  const pendingInstallmentsCount = installments.filter((installment) => installment.status === "pendente").length;
  const upcomingInstallments = installments.filter((installment) => installment.status !== "paga");
  const totalLoanValue = loans.reduce((acc, loan) => acc + loan.amountToPay, 0);
  const totalConsortiumValue = consortiums.reduce((acc, item) => acc + item.outstandingBalance, 0);
  const totalDebt = totalLoanValue + totalConsortiumValue;
  const upcomingInstallmentsValue = upcomingInstallments.reduce((acc, installment) => acc + installment.value, 0);
  const totalInstallmentsCount = installments.length || 1;
  const completionRate = Math.round((paidInstallments.length / totalInstallmentsCount) * 100);
  const overdueRate = Math.round((overdueInstallments.length / totalInstallmentsCount) * 100);

  const statusBreakdown = [
    {
      label: "Pagas",
      value: paidInstallments.length,
      percentage: Math.round((paidInstallments.length / totalInstallmentsCount) * 100),
      gradient: "from-emerald-400 to-emerald-600"
    },
    {
      label: "Pendentes",
      value: pendingInstallmentsCount,
      percentage: Math.round((pendingInstallmentsCount / totalInstallmentsCount) * 100),
      gradient: "from-logica-lilac to-logica-purple"
    },
    {
      label: "Vencidas",
      value: overdueInstallments.length,
      percentage: overdueRate,
      gradient: "from-orange-400 to-rose-500"
    }
  ];

  const monthlyCashflow = useMemo(() => {
    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);
    const formatter = new Intl.DateTimeFormat("pt-BR", { month: "short" });

    return Array.from({ length: 6 }, (_, index) => {
      const monthDate = new Date(startOfMonth);
      monthDate.setMonth(startOfMonth.getMonth() + index);
      const nextMonth = new Date(monthDate);
      nextMonth.setMonth(monthDate.getMonth() + 1);

      const value = installments.reduce((acc, installment) => {
        const installmentDate = new Date(installment.date);
        if (installment.status === "paga") return acc;
        if (installmentDate >= monthDate && installmentDate < nextMonth) {
          return acc + installment.value;
        }
        return acc;
      }, 0);

      const label = formatter.format(monthDate).replace(".", "");

      return {
        key: `${monthDate.getFullYear()}-${monthDate.getMonth()}`,
        label: label.charAt(0).toUpperCase() + label.slice(1),
        value
      };
    });
  }, [installments]);

  const maxMonthlyCashflow = Math.max(1, ...monthlyCashflow.map((month) => month.value));
  const loanShare = totalDebt ? Math.round((totalLoanValue / totalDebt) * 100) : 0;

  const companyName = selectedCompany === "all"
    ? "Todas as empresas"
    : companies.find((company) => company.id === selectedCompany)?.name ?? "Empresa";

  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-semibold text-logica-purple">Dashboard</h1>
          <p className="text-sm text-logica-lilac">
            Indicadores consolidados dos empréstimos e consórcios cadastrados na plataforma.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
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

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4 2xl:grid-cols-5">
        <div className={`${cardBaseClass} border-logica-purple/20 shadow-logica-purple/20`}>
          <p className="text-xs font-semibold uppercase tracking-wide text-logica-lilac">Empresa</p>
          <p className="mt-2 text-lg font-semibold text-logica-purple">{companyName}</p>
          <p className="text-xs text-logica-lilac">{loans.length + consortiums.length} contratos vinculados</p>
        </div>
        <div className={`${cardBaseClass} border-logica-rose/20 shadow-logica-rose/20`}>
          <p className="text-xs font-semibold uppercase tracking-wide text-logica-lilac">Total de empréstimos</p>
          <p className="mt-2 text-3xl font-bold text-logica-rose">{loans.length}</p>
          <p className="text-xs text-logica-lilac">Quantidade de contratos ativos e finalizados</p>
        </div>
        <div className={`${cardBaseClass} border-logica-purple/20 shadow-logica-purple/20`}>
          <p className="text-xs font-semibold uppercase tracking-wide text-logica-lilac">Total de consórcios</p>
          <p className="mt-2 text-3xl font-bold text-logica-purple">{consortiums.length}</p>
          <p className="text-xs text-logica-lilac">Operações em acompanhamento</p>
        </div>
        <div className={`${cardBaseClass} border-logica-rose/20 shadow-logica-rose/20`}>
          <p className="text-xs font-semibold uppercase tracking-wide text-logica-lilac">Empréstimos em R$</p>
          <p className="mt-2 text-3xl font-bold text-logica-rose">{formatCurrency(totalLoanValue)}</p>
          <p className="text-xs text-logica-lilac">Saldo atual a pagar em empréstimos</p>
        </div>
        <div className={`${cardBaseClass} border-logica-purple/20 shadow-logica-purple/20`}>
          <p className="text-xs font-semibold uppercase tracking-wide text-logica-lilac">Consórcios em R$</p>
          <p className="mt-2 text-3xl font-bold text-logica-purple">{formatCurrency(totalConsortiumValue)}</p>
          <p className="text-xs text-logica-lilac">Saldo devedor das cotas em aberto</p>
        </div>
        <div className={`${cardBaseClass} border-logica-purple/20 shadow-logica-purple/20`}>
          <p className="text-xs font-semibold uppercase tracking-wide text-logica-lilac">Dívida total</p>
          <p className="mt-2 text-3xl font-bold text-logica-purple">{formatCurrency(totalDebt)}</p>
          <p className="text-xs text-logica-lilac">Saldo restante somando todos os contratos</p>
        </div>
        <div className={`${cardBaseClass} border-logica-rose/20 shadow-logica-rose/20`}>
          <p className="text-xs font-semibold uppercase tracking-wide text-logica-lilac">Parcelas vencidas</p>
          <p className="mt-2 text-3xl font-bold text-logica-rose">{overdueInstallments.length}</p>
          <p className="text-xs text-logica-lilac">{overdueRate}% da carteira</p>
        </div>
        <div className={`${cardBaseClass} border-logica-purple/20 shadow-logica-purple/20`}>
          <p className="text-xs font-semibold uppercase tracking-wide text-logica-lilac">Próximos pagamentos</p>
          <p className="mt-2 text-3xl font-bold text-logica-purple">{formatCurrency(upcomingInstallmentsValue)}</p>
          <p className="text-xs text-logica-lilac">Parcelas ainda não pagas</p>
        </div>
        <div className={`${cardBaseClass} border-logica-purple/20 shadow-logica-purple/20`}>
          <p className="text-xs font-semibold uppercase tracking-wide text-logica-lilac">Taxa de adimplência</p>
          <p className="mt-2 text-3xl font-bold text-logica-purple">{completionRate}%</p>
          <div className="mt-3 h-2 w-full rounded-full bg-logica-light-lilac/70">
            <div
              className="h-2 rounded-full bg-gradient-to-r from-emerald-400 to-emerald-600"
              style={{ width: `${completionRate}%` }}
            />
          </div>
          <p className="mt-2 text-xs text-logica-lilac">Baseada em {installments.length} parcelas</p>
        </div>
      </section>

      <section className="grid gap-4 xl:grid-cols-3">
        <div className={`${cardBaseClass} xl:col-span-2 border-logica-purple/20 shadow-logica-purple/10`}>
          <div className="mb-6 flex flex-wrap items-center justify-between gap-2">
            <div>
              <h2 className="text-lg font-semibold text-logica-purple">Fluxo de parcelas</h2>
              <p className="text-xs text-logica-lilac">Projeção dos próximos meses</p>
            </div>
            <p className="text-xs font-semibold text-logica-purple">
              {formatCurrency(upcomingInstallmentsValue)} em aberto
            </p>
          </div>
          <div className="flex items-end gap-3">
            {monthlyCashflow.map((month) => (
              <div key={month.key} className="flex-1">
                <div className="flex flex-col items-center gap-2">
                  <div className="flex h-44 w-full items-end rounded-2xl bg-logica-light-lilac/60 p-1">
                    <div
                      className="w-full rounded-xl bg-gradient-to-t from-logica-purple to-logica-rose"
                      style={{ height: `${Math.round((month.value / maxMonthlyCashflow) * 100)}%` }}
                    >
                      <span className="sr-only">
                        {month.label}: {formatCurrency(month.value)}
                      </span>
                    </div>
                  </div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-logica-lilac">{month.label}</p>
                  <p className="text-xs text-logica-purple">{formatCurrency(month.value)}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
        <div className={`${cardBaseClass} flex flex-col gap-6 border-logica-rose/20 shadow-logica-rose/10`}>
          <div>
            <h2 className="text-lg font-semibold text-logica-purple">Composição da carteira</h2>
            <p className="text-xs text-logica-lilac">Distribuição entre empréstimos e consórcios</p>
          </div>
          <div className="flex flex-col items-center gap-4">
            <div className="relative h-48 w-48">
              <div
                className="absolute inset-0 rounded-full border border-white/60"
                style={{
                  background: `conic-gradient(#b42a98 ${loanShare}%, #61105c ${loanShare}% 100%)`
                }}
              />
              <div className="absolute inset-6 flex flex-col items-center justify-center rounded-full bg-white/80 text-center">
                <p className="text-3xl font-bold text-logica-purple">{loanShare}%</p>
                <p className="text-xs text-logica-lilac">em empréstimos</p>
              </div>
            </div>
            <div className="grid w-full grid-cols-2 gap-3 text-sm">
              <div className="rounded-2xl bg-logica-light-lilac/80 p-3">
                <p className="text-xs font-semibold uppercase tracking-wide text-logica-lilac">Empréstimos</p>
                <p className="mt-1 text-lg font-semibold text-logica-rose">{formatCurrency(totalLoanValue)}</p>
              </div>
              <div className="rounded-2xl bg-logica-light-lilac/80 p-3">
                <p className="text-xs font-semibold uppercase tracking-wide text-logica-lilac">Consórcios</p>
                <p className="mt-1 text-lg font-semibold text-logica-purple">{formatCurrency(totalConsortiumValue)}</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="grid gap-4 lg:grid-cols-2">
        <div className={`${cardBaseClass} border-logica-purple/20 shadow-logica-purple/10`}>
          <div className="mb-5 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-logica-purple">Saúde das parcelas</h2>
            <p className="text-xs text-logica-lilac">{installments.length} registros</p>
          </div>
          <div className="space-y-5">
            {statusBreakdown.map((status) => (
              <div key={status.label}>
                <div className="flex items-center justify-between text-sm font-semibold text-logica-purple">
                  <span>{status.label}</span>
                  <span>
                    {status.value} • {status.percentage}%
                  </span>
                </div>
                <div className="mt-2 h-2 w-full rounded-full bg-logica-light-lilac/60">
                  <div
                    className={`h-2 rounded-full bg-gradient-to-r ${status.gradient}`}
                    style={{ width: `${status.percentage}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
        <div className={`${cardBaseClass} border-logica-rose/20 shadow-logica-rose/10`}>
          <div className="mb-5 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-logica-purple">Alertas rápidos</h2>
            <p className="text-xs text-logica-lilac">Atualizado em tempo real</p>
          </div>
          <ul className="space-y-4 text-sm text-logica-purple">
            <li className="flex items-center justify-between rounded-2xl bg-logica-light-lilac/70 px-4 py-3">
              <div>
                <p className="font-semibold">Próximas parcelas</p>
                <p className="text-xs text-logica-lilac">{upcomingInstallments.length} lançamentos aguardando pagamento</p>
              </div>
              <span className="text-base font-bold">{formatCurrency(upcomingInstallmentsValue)}</span>
            </li>
            <li className="flex items-center justify-between rounded-2xl bg-logica-light-lilac/70 px-4 py-3">
              <div>
                <p className="font-semibold">Parcelas vencidas</p>
                <p className="text-xs text-logica-lilac">{overdueInstallments.length} registros</p>
              </div>
              <span className="text-base font-bold text-logica-rose">{overdueRate}%</span>
            </li>
            <li className="flex items-center justify-between rounded-2xl bg-logica-light-lilac/70 px-4 py-3">
              <div>
                <p className="font-semibold">Dívida consolidada</p>
                <p className="text-xs text-logica-lilac">Empréstimos + consórcios</p>
              </div>
              <span className="text-base font-bold">{formatCurrency(totalDebt)}</span>
            </li>
          </ul>
        </div>
      </section>
    </div>
  );
}
