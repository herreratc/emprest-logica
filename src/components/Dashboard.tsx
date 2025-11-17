import { useMemo } from "react";
import type { Company, Consortium, Installment, Loan } from "../data/mockData";
import { formatCurrency } from "../utils/formatters";

const scheduleDateFormatter = new Intl.DateTimeFormat("pt-BR", {
  day: "2-digit",
  month: "short"
});

const monthReferenceFormatter = new Intl.DateTimeFormat("pt-BR", {
  month: "short"
});

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
  const paidInstallments = installments.filter((installment) => installment.status === "paga");
  const upcomingInstallments = installments.filter((installment) => installment.status !== "paga");
  const pendingInstallmentsCount = installments.filter((installment) => installment.status === "pendente").length;
  const totalLoanValue = loans.reduce((acc, loan) => acc + loan.amountToPay, 0);
  const totalConsortiumValue = consortiums.reduce((acc, item) => acc + item.outstandingBalance, 0);
  const totalDebt = totalLoanValue + totalConsortiumValue;
  const upcomingInstallmentsValue = upcomingInstallments.reduce((acc, installment) => acc + installment.value, 0);
  const totalInstallmentsCount = installments.length || 1;
  const completionRate = Math.round((paidInstallments.length / totalInstallmentsCount) * 100);
  const contractCount = loans.length + consortiums.length;
  const averageTicketValue = contractCount ? totalDebt / contractCount : 0;

  const upcomingWithin30Days = useMemo(() => {
    const limitDate = new Date();
    limitDate.setDate(limitDate.getDate() + 30);
    return upcomingInstallments.filter((installment) => new Date(installment.date) <= limitDate);
  }, [upcomingInstallments]);

  const next30DaysValue = upcomingWithin30Days.reduce((acc, installment) => acc + installment.value, 0);
  const next30DaysCount = upcomingWithin30Days.length;

  const highestUpcomingInstallment = upcomingInstallments.reduce<Installment | null>((highest, current) => {
    if (!highest || current.value > highest.value) {
      return current;
    }
    return highest;
  }, null);

  const monthlyCashflow = useMemo(() => {
    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);

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

      const label = monthReferenceFormatter.format(monthDate).replace(".", "");

      return {
        key: `${monthDate.getFullYear()}-${monthDate.getMonth()}`,
        label: label.charAt(0).toUpperCase() + label.slice(1),
        value
      };
    });
  }, [installments]);

  const maxMonthlyCashflow = Math.max(1, ...monthlyCashflow.map((month) => month.value));
  const loanShare = totalDebt ? Math.round((totalLoanValue / totalDebt) * 100) : 0;
  const consortiumShare = 100 - loanShare;
  const yAxisSteps = 4;
  const yAxisScale = Array.from({ length: yAxisSteps }, (_, index) => {
    const value = Math.round((maxMonthlyCashflow / yAxisSteps) * (yAxisSteps - index));
    return {
      id: `y-axis-${index}`,
      value,
      label: formatCurrency(value)
    };
  });

  const compositionBreakdown = [
    {
      label: "Empréstimos",
      value: totalLoanValue,
      share: loanShare,
      accent: "text-logica-rose",
      gradient: "from-logica-rose/80 to-logica-purple/80"
    },
    {
      label: "Consórcios",
      value: totalConsortiumValue,
      share: consortiumShare,
      accent: "text-logica-purple",
      gradient: "from-logica-purple/80 to-logica-lilac/80"
    }
  ];

  const companyName = selectedCompany === "all"
    ? "Todas as empresas"
    : companies.find((company) => company.id === selectedCompany)?.name ?? "Empresa";

  const nextInstallments = useMemo(() => {
    return [...upcomingInstallments]
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
      .slice(0, 5);
  }, [upcomingInstallments]);

  const executiveHighlights = [
    {
      label: "Ticket médio por contrato",
      value: formatCurrency(averageTicketValue),
      description: `${contractCount} contratos monitorados`
    },
    {
      label: "Comprometido nos próximos 30 dias",
      value: formatCurrency(next30DaysValue),
      description: `${next30DaysCount} parcelas previstas`
    },
    {
      label: "Maior parcela prevista",
      value: formatCurrency(highestUpcomingInstallment?.value ?? 0),
      description: highestUpcomingInstallment
        ? `Para ${scheduleDateFormatter.format(new Date(highestUpcomingInstallment.date)).replace(".", "")}`
        : "Nenhum lançamento futuro"
    }
  ];

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
          <p className="text-xs font-semibold uppercase tracking-wide text-logica-lilac">Parcelas pendentes</p>
          <p className="mt-2 text-3xl font-bold text-logica-rose">{pendingInstallmentsCount}</p>
          <p className="text-xs text-logica-lilac">{formatCurrency(upcomingInstallmentsValue)} aguardando liquidação</p>
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
          <div className="relative mt-2">
            <div className="absolute inset-0 grid grid-rows-4 text-[10px] text-logica-lilac">
              {yAxisScale.map((scale, index) => (
                <div key={scale.id} className="relative flex h-full items-start">
                  <span className="-translate-y-1/2 pr-3 font-semibold">{scale.label}</span>
                  <div
                    className={`mt-2 h-px flex-1 ${index === yAxisScale.length - 1 ? "bg-transparent" : "bg-logica-light-lilac/70"}`}
                  />
                </div>
              ))}
            </div>
            <div className="relative ml-16 flex h-48 items-end gap-3" role="list">
              {monthlyCashflow.map((month) => {
                const height = Math.round((month.value / maxMonthlyCashflow) * 100);
                const isMax = month.value === maxMonthlyCashflow;
                return (
                  <div key={month.key} className="flex-1" role="listitem" aria-label={`${month.label} ${formatCurrency(month.value)}`}>
                    <div className="group flex h-full flex-col items-center gap-3">
                      <div className="flex h-full w-full items-end rounded-2xl bg-gradient-to-b from-white/60 via-logica-light-lilac/40 to-logica-light-lilac/70 p-1">
                        <div
                          className={`relative w-full rounded-xl bg-gradient-to-t from-logica-purple to-logica-rose shadow-inner transition-all group-hover:brightness-110 ${isMax ? "ring-2 ring-white/70" : ""}`}
                          style={{ height: `${height}%` }}
                        >
                          <span className="absolute inset-x-1 top-1 rounded-full bg-white/90 px-1 text-[10px] font-semibold text-logica-purple">
                            {formatCurrency(month.value)}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
            <div className="mt-4 ml-16 flex items-center justify-between text-[10px] font-semibold uppercase tracking-wide text-logica-lilac">
              {monthlyCashflow.map((month) => (
                <span key={`${month.key}-label`} className="flex-1 text-center">
                  {month.label}
                </span>
              ))}
            </div>
          </div>
        </div>
        <div className={`${cardBaseClass} flex flex-col gap-6 border-logica-rose/20 shadow-logica-rose/10`}>
          <div>
            <h2 className="text-lg font-semibold text-logica-purple">Composição da carteira</h2>
            <p className="text-xs text-logica-lilac">Distribuição entre empréstimos e consórcios</p>
          </div>
          <div className="flex flex-col items-center gap-5">
            <div className="relative h-48 w-48">
              <div
                className="absolute inset-0 rounded-full border border-white/60"
                style={{
                  background: `conic-gradient(#b42a98 ${loanShare}%, #61105c ${loanShare}% 100%)`
                }}
              >
                <span className="sr-only">{loanShare}% em empréstimos</span>
              </div>
              <div className="absolute inset-4 rounded-full bg-white/70" />
              <div className="absolute inset-8 flex flex-col items-center justify-center rounded-full bg-white/90 text-center">
                <p className="text-3xl font-bold text-logica-purple">{loanShare}%</p>
                <p className="text-xs text-logica-lilac">em empréstimos</p>
                <p className="text-xs text-logica-lilac">{consortiumShare}% em consórcios</p>
              </div>
            </div>
            <div className="w-full space-y-3 text-sm">
              {compositionBreakdown.map((item) => (
                <div key={item.label} className="flex items-center gap-3 rounded-2xl bg-white/70 p-3 shadow-inner">
                  <div className={`h-10 w-10 rounded-xl bg-gradient-to-br ${item.gradient}`}>
                    <span className="sr-only">{item.label}</span>
                  </div>
                  <div className="flex-1">
                    <p className="text-xs font-semibold uppercase tracking-wide text-logica-lilac">{item.label}</p>
                    <p className={`text-base font-semibold ${item.accent}`}>{formatCurrency(item.value)}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs font-semibold text-logica-lilac">Participação</p>
                    <p className="text-base font-bold text-logica-purple">{item.share}%</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="grid gap-4 lg:grid-cols-3">
        <div className={`${cardBaseClass} lg:col-span-2 border-logica-purple/20 shadow-logica-purple/10`}>
          <div className="mb-5 flex flex-wrap items-center justify-between gap-2">
            <div>
              <h2 className="text-lg font-semibold text-logica-purple">Cronograma de pagamentos</h2>
              <p className="text-xs text-logica-lilac">Próximas parcelas monitoradas</p>
            </div>
            <span className="rounded-full bg-logica-light-lilac/60 px-3 py-1 text-xs font-semibold text-logica-purple">
              {upcomingInstallments.length} lançamentos futuros
            </span>
          </div>
          <div className="overflow-hidden rounded-2xl border border-logica-light-lilac/80">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-logica-light-lilac/50 text-left text-xs font-semibold uppercase tracking-wide text-logica-lilac">
                  <th className="px-4 py-3">Data</th>
                  <th className="px-4 py-3">Contrato</th>
                  <th className="px-4 py-3">Origem</th>
                  <th className="px-4 py-3 text-right">Valor</th>
                  <th className="px-4 py-3 text-right">Status</th>
                </tr>
              </thead>
              <tbody>
                {nextInstallments.length === 0 && (
                  <tr>
                    <td colSpan={5} className="px-4 py-6 text-center text-sm text-logica-lilac">
                      Nenhuma parcela futura cadastrada para este período.
                    </td>
                  </tr>
                )}
                {nextInstallments.map((installment) => {
                  const relatedLoan = loans.find((loan) => loan.id === installment.contractId);
                  const relatedConsortium = consortiums.find((item) => item.id === installment.contractId);
                  const contractLabel =
                    installment.contractType === "loan"
                      ? relatedLoan?.reference ?? "Empréstimo"
                      : relatedConsortium
                        ? `Consórcio ${relatedConsortium.administrator}`
                        : "Consórcio";
                  const contractOrigin = installment.contractType === "loan" ? "Empréstimo" : "Consórcio";
                  const statusLabel = installment.status === "pendente" ? "Pendente" : "Agendado";

                  return (
                    <tr key={installment.id} className="border-t border-logica-light-lilac/60">
                      <td className="px-4 py-3 font-semibold text-logica-purple">
                        {scheduleDateFormatter.format(new Date(installment.date)).replace(".", "")}
                      </td>
                      <td className="px-4 py-3 text-logica-purple">{contractLabel}</td>
                      <td className="px-4 py-3 text-logica-lilac">{contractOrigin}</td>
                      <td className="px-4 py-3 text-right font-semibold text-logica-purple">
                        {formatCurrency(installment.value)}
                      </td>
                      <td className="px-4 py-3 text-right">
                        <span className="rounded-full bg-white/70 px-3 py-1 text-xs font-semibold text-logica-purple">
                          {statusLabel}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
        <div className={`${cardBaseClass} flex flex-col gap-5 border-logica-rose/20 shadow-logica-rose/10`}>
          <div>
            <h2 className="text-lg font-semibold text-logica-purple">Resumo executivo</h2>
            <p className="text-xs text-logica-lilac">Indicadores-chave da carteira</p>
          </div>
          <ul className="space-y-4">
            {executiveHighlights.map((item) => (
              <li key={item.label} className="rounded-2xl bg-logica-light-lilac/60 p-4">
                <p className="text-xs font-semibold uppercase tracking-wide text-logica-lilac">{item.label}</p>
                <p className="mt-1 text-2xl font-bold text-logica-purple">{item.value}</p>
                <p className="text-xs text-logica-lilac">{item.description}</p>
              </li>
            ))}
          </ul>
          <div className="rounded-2xl border border-dashed border-logica-light-lilac/80 bg-gradient-to-br from-white/70 to-logica-light-lilac/50 p-4 text-sm text-logica-purple">
            <p className="font-semibold">Última atualização</p>
            <p className="text-xs text-logica-lilac">{new Date().toLocaleDateString("pt-BR", { dateStyle: "long" })}</p>
          </div>
        </div>
      </section>
    </div>
  );
}
