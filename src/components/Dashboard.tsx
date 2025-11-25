import { useMemo } from "react";
import type { Company, Consortium, Installment, Loan } from "../data/mockData";
import { formatCurrency } from "../utils/formatters";

const scheduleDateFormatter = new Intl.DateTimeFormat("pt-BR", {
  day: "2-digit",
  month: "short"
});

const scheduleDateWithYearFormatter = new Intl.DateTimeFormat("pt-BR", {
  day: "2-digit",
  month: "short",
  year: "numeric"
});

const monthReferenceFormatter = new Intl.DateTimeFormat("pt-BR", {
  month: "short"
});

const cardBaseClass =
  "rounded-2xl border border-logica-light-lilac/70 bg-white/90 p-5 shadow-lg shadow-logica-light-lilac/50 backdrop-blur transition hover:-translate-y-0.5 hover:shadow-xl";

const iconClass = "h-5 w-5";

const summaryIcons = {
  document: (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" className={iconClass}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 5.25h6M9 9.75h6M9 14.25h6" />
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M4.5 5.25A2.25 2.25 0 0 1 6.75 3h7.005c.596 0 1.167.237 1.588.659l2.998 2.998a2.25 2.25 0 0 1 .659 1.591V18.75A2.25 2.25 0 0 1 16.75 21h-10A2.25 2.25 0 0 1 4.5 18.75V5.25Z"
      />
    </svg>
  ),
  layers: (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" className={iconClass}>
      <path strokeLinecap="round" strokeLinejoin="round" d="m12 3 8.25 4.5L12 12 3.75 7.5 12 3Z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 12 12 16.5 3.75 12" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 16.5 12 21l-8.25-4.5" />
    </svg>
  ),
  cash: (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" className={iconClass}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 6.75h15v10.5h-15z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 9.75v.75M6.75 13.5v.75M17.25 9.75v.75M17.25 13.5v.75" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 10.5c-1.25 0-1.25 1.5 0 1.5s1.25 1.5 0 1.5c-1.25 0-1.25 1.5 0 1.5" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 9.75v.75m0 4.5v.75" />
    </svg>
  ),
  pie: (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" className={iconClass}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 3.75a8.25 8.25 0 1 1-8.25 8.25H12z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 3.75V12l6.364-6.364A8.225 8.225 0 0 0 12 3.75Z" />
    </svg>
  ),
  wallet: (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" className={iconClass}>
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M4.5 7.5h15A1.5 1.5 0 0 1 21 9v7.5a1.5 1.5 0 0 1-1.5 1.5h-15A1.5 1.5 0 0 1 3 16.5V9A1.5 1.5 0 0 1 4.5 7.5Z"
      />
      <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 12.75A.75.75 0 1 1 15 12.75a.75.75 0 0 1 1.5 0Z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M3 9.75h16.5" />
    </svg>
  ),
  clock: (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" className={iconClass}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6l3 1.5" />
      <circle cx="12" cy="12" r="8.25" />
    </svg>
  ),
  calendar: (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" className={iconClass}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 4.5V6m10.5-1.5V6" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 9.75h15" />
      <rect x="4.5" y="6" width="15" height="13.5" rx="2" />
    </svg>
  ),
  shield: (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" className={iconClass}>
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="m9.75 12.75 1.5 1.5 3-3m3-4.227a45.284 45.284 0 0 1-5.933-1.853.75.75 0 0 0-.634 0A45.284 45.284 0 0 1 6.75 7.023v5.58a7.125 7.125 0 0 0 4.063 6.426l1.187.541a.75.75 0 0 0 .6 0l1.187-.54a7.125 7.125 0 0 0 4.063-6.427v-5.58Z"
      />
    </svg>
  )
};

const badgeIcons = {
  bell: (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className={iconClass}>
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M14.25 18.75a2.25 2.25 0 0 1-4.5 0m-4.5 0h13.5M4.5 18.75h-.75a.75.75 0 0 1-.75-.75V15c0-2.56 1.734-4.706 4.05-5.33a4.878 4.878 0 0 1 9.9 0A5.625 5.625 0 0 1 21 15v3a.75.75 0 0 1-.75.75h-.75"
      />
    </svg>
  ),
  alert: (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className={iconClass}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 16.5h.007" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M10.125 3.75 3 18.75h18l-7.125-15" />
    </svg>
  )
};

type DashboardProps = {
  companies: Company[];
  selectedCompany: string | "all";
  onSelectCompany: (company: string | "all") => void;
  loans: Loan[];
  consortiums: Consortium[];
  installments: Installment[];
  userName: string;
  isAuthenticated: boolean;
  onSignOut?: () => void;
};

export function Dashboard({
  companies,
  selectedCompany,
  onSelectCompany,
  loans,
  consortiums,
  installments,
  userName,
  isAuthenticated,
  onSignOut
}: DashboardProps) {
  const activeLoans = useMemo(() => loans.filter((loan) => loan.status === "ativo"), [loans]);
  const activeConsortiums = useMemo(() => consortiums, [consortiums]);
  const activeInstallments = useMemo(() => {
    const activeLoanIds = new Set(activeLoans.map((loan) => loan.id));
    const activeConsortiumIds = new Set(activeConsortiums.map((item) => item.id));

    return installments.filter((installment) => {
      if (installment.contractType === "loan") {
        return activeLoanIds.has(installment.contractId);
      }
      if (installment.contractType === "consortium") {
        return activeConsortiumIds.has(installment.contractId);
      }
      return false;
    });
  }, [installments, activeLoans, activeConsortiums]);

  const upcomingInstallments = activeInstallments.filter((installment) => installment.status !== "paga");
  const totalLoanValue = activeLoans.reduce((acc, loan) => acc + loan.amountToPay, 0);
  const totalConsortiumValue = activeConsortiums.reduce((acc, item) => acc + item.outstandingBalance, 0);
  const totalDebt = totalLoanValue + totalConsortiumValue;
  const upcomingInstallmentsValue = upcomingInstallments.reduce((acc, installment) => acc + installment.value, 0);
  const today = new Date();
  const overdueInstallments = upcomingInstallments.filter(
    (installment) => new Date(installment.date) < today && installment.status === "pendente"
  );
  const contractCount = activeLoans.length + activeConsortiums.length;
  const averageTicketValue = contractCount ? totalDebt / contractCount : 0;

  const upcomingWithin30Days = useMemo(() => {
    const limitDate = new Date();
    limitDate.setDate(limitDate.getDate() + 30);
    return upcomingInstallments.filter((installment) => new Date(installment.date) <= limitDate);
  }, [upcomingInstallments]);

  const next30DaysValue = upcomingWithin30Days.reduce((acc, installment) => acc + installment.value, 0);
  const next30DaysCount = upcomingWithin30Days.length;
  const next7DaysCount = upcomingWithin30Days.filter((installment) => {
    const limit = new Date();
    limit.setDate(limit.getDate() + 7);
    return new Date(installment.date) <= limit;
  }).length;

  const highestUpcomingInstallment = upcomingInstallments.reduce<Installment | null>((highest, current) => {
    if (!highest || current.value > highest.value) {
      return current;
    }
    return highest;
  }, null);

  const firstScheduledMonth = useMemo(() => {
    if (upcomingInstallments.length === 0) return null;
    const ordered = [...upcomingInstallments].sort(
      (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
    );
    return new Date(ordered[0].date);
  }, [upcomingInstallments]);

  const monthlyStart = useMemo(() => {
    const reference = firstScheduledMonth ?? new Date();
    const normalized = new Date(reference);
    normalized.setDate(1);
    normalized.setHours(0, 0, 0, 0);
    return normalized;
  }, [firstScheduledMonth]);

  const monthlyCashflow = useMemo(() => {
    return Array.from({ length: 12 }, (_, index) => {
      const monthDate = new Date(monthlyStart);
      monthDate.setMonth(monthlyStart.getMonth() + index);
      const nextMonth = new Date(monthDate);
      nextMonth.setMonth(monthDate.getMonth() + 1);

      const value = activeInstallments.reduce((acc, installment) => {
        const installmentDate = new Date(installment.date);
        if (installment.status === "paga") return acc;
        if (installmentDate >= monthDate && installmentDate < nextMonth) {
          return acc + installment.value;
        }
        return acc;
      }, 0);

      const label = monthReferenceFormatter.format(monthDate).replace(".", "");
      const capitalized = label.charAt(0).toUpperCase() + label.slice(1);

      return {
        key: `${monthDate.getFullYear()}-${monthDate.getMonth()}`,
        label: `${capitalized} ${monthDate.getFullYear()}`,
        value
      };
    });
  }, [activeInstallments, monthlyStart]);

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

  const scheduleWindowStart = useMemo(() => {
    const start = new Date();
    start.setDate(start.getDate() - 30);
    start.setHours(0, 0, 0, 0);
    return start;
  }, []);

  const scheduleWindowEnd = useMemo(() => {
    const end = new Date();
    end.setDate(end.getDate() + 30);
    end.setHours(23, 59, 59, 999);
    return end;
  }, []);

  const periodFilteredInstallments = useMemo(() => {
    return upcomingInstallments.filter((installment) => {
      const installmentDate = new Date(installment.date);
      return installmentDate >= scheduleWindowStart && installmentDate <= scheduleWindowEnd;
    });
  }, [upcomingInstallments, scheduleWindowEnd, scheduleWindowStart]);

  const scheduleSource = periodFilteredInstallments.length > 0 ? periodFilteredInstallments : upcomingInstallments;

  const nextInstallments = useMemo(() => {
    return [...scheduleSource]
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
      .slice(0, 5);
  }, [scheduleSource]);

  const schedulePeriodRange = useMemo(() => {
    if (scheduleSource.length === 0) return null;

    const startLabel = scheduleDateWithYearFormatter.format(scheduleWindowStart).replace(".", "");
    const endLabel = scheduleDateWithYearFormatter.format(scheduleWindowEnd).replace(".", "");

    if (periodFilteredInstallments.length > 0) {
      return `Últimos 30 dias (${startLabel} — ${endLabel})`;
    }

    const ordered = [...scheduleSource].sort(
      (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
    );
    const firstDate = scheduleDateWithYearFormatter.format(new Date(ordered[0].date)).replace(".", "");
    const lastDate = scheduleDateWithYearFormatter
      .format(new Date(ordered[ordered.length - 1].date))
      .replace(".", "");
    return `Próximos lançamentos (${firstDate} — ${lastDate})`;
  }, [periodFilteredInstallments.length, scheduleSource, scheduleWindowEnd, scheduleWindowStart]);

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
        ? `Para ${scheduleDateWithYearFormatter
            .format(new Date(highestUpcomingInstallment.date))
            .replace(".", "")}`
        : "Nenhum lançamento futuro"
    }
  ];

  const toneStyles: Record<"purple" | "rose", { card: string; icon: string }> = {
    purple: {
      card: "border-logica-purple/20 shadow-logica-purple/15",
      icon: "bg-logica-purple/10 text-logica-purple"
    },
    rose: {
      card: "border-logica-rose/20 shadow-logica-rose/15",
      icon: "bg-rose-100 text-rose-600"
    }
  };

  type SummaryCard = {
    label: string;
    value: string | number;
    description: string;
    icon: keyof typeof summaryIcons;
    tone: keyof typeof toneStyles;
    progress?: number;
  };

  const summaryCards: SummaryCard[] = [
    {
      label: "Total de empréstimos",
      value: activeLoans.length,
      description: "Contratos ativos",
      icon: "document",
      tone: "rose"
    },
    {
      label: "Total de consórcios",
      value: activeConsortiums.length,
      description: "Operações em acompanhamento",
      icon: "layers",
      tone: "purple"
    },
    {
      label: "Empréstimos em R$",
      value: formatCurrency(totalLoanValue),
      description: "Saldo atual a pagar",
      icon: "cash",
      tone: "rose"
    },
    {
      label: "Consórcios em R$",
      value: formatCurrency(totalConsortiumValue),
      description: "Saldo devedor das cotas",
      icon: "pie",
      tone: "purple"
    },
    {
      label: "Dívida total",
      value: formatCurrency(totalDebt),
      description: "Empréstimos + consórcios",
      icon: "wallet",
      tone: "purple"
    },
    {
      label: "Próximos pagamentos",
      value: formatCurrency(upcomingInstallmentsValue),
      description: "Parcelas ainda não pagas",
      icon: "calendar",
      tone: "purple"
    }
  ];

  return (
    <div className="space-y-6">
      <header className="overflow-hidden rounded-3xl border border-logica-light-lilac/80 bg-gradient-to-r from-white/95 via-logica-light-lilac/60 to-white/95 p-6 shadow-xl">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-logica-lilac">
              <span className="h-2 w-2 rounded-full bg-gradient-to-r from-logica-rose to-logica-purple" />
              Visão consolidada
            </div>
            <h1 className="text-3xl font-semibold text-logica-purple">Dashboard</h1>
            <p className="text-sm text-logica-lilac">
              Indicadores consolidados dos empréstimos e consórcios cadastrados na plataforma.
            </p>
            <div className="flex flex-wrap gap-2 text-xs text-logica-purple">
              <span className="rounded-full bg-white/90 px-3 py-1 font-semibold shadow-inner">{companyName}</span>
              {next7DaysCount > 0 && (
                <span className="flex items-center gap-2 rounded-full bg-white/80 px-3 py-1 font-semibold shadow-inner text-logica-purple">
                  <span className="text-logica-purple">{badgeIcons.bell}</span> {next7DaysCount} vencimentos em 7 dias
                </span>
              )}
              {overdueInstallments.length > 0 && (
                <span className="flex items-center gap-2 rounded-full bg-white/80 px-3 py-1 font-semibold shadow-inner text-rose-600">
                  <span className="text-rose-500">{badgeIcons.alert}</span> {overdueInstallments.length} em atraso
                </span>
              )}
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-3 rounded-2xl border border-logica-light-lilac bg-white/90 px-4 py-3 text-sm font-semibold text-logica-purple shadow">
              <div>
                <p className="text-[11px] uppercase tracking-wide text-logica-lilac">Usuário</p>
                <p className="text-sm font-bold text-logica-purple">{userName}</p>
              </div>
              {isAuthenticated && onSignOut && (
                <button
                  type="button"
                  onClick={onSignOut}
                  className="rounded-full bg-logica-purple px-3 py-1 text-xs font-bold text-white shadow transition hover:bg-logica-deep-purple"
                >
                  Sair
                </button>
              )}
            </div>
            <div className="rounded-2xl border border-logica-light-lilac bg-white/90 px-4 py-3 text-sm font-semibold text-logica-purple shadow">
              <p className="text-[11px] uppercase tracking-wide text-logica-lilac">Filtro</p>
              <div className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-logica-purple" />
                {companyName}
              </div>
            </div>
            <select
              value={selectedCompany}
              onChange={(event) => onSelectCompany(event.target.value as typeof selectedCompany)}
              className="rounded-full border border-logica-lilac bg-white px-4 py-3 text-sm font-semibold text-logica-purple shadow transition focus:border-logica-purple focus:outline-none"
            >
              <option value="all">Todas as empresas</option>
              {companies.map((company) => (
                <option key={company.id} value={company.id}>
                  {company.name}
                </option>
              ))}
            </select>
          </div>
        </div>
      </header>

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4 2xl:grid-cols-5">
        {summaryCards.map((card) => (
          <div key={card.label} className={`${cardBaseClass} ${toneStyles[card.tone].card}`}>
            <div className="flex items-center justify-between">
              <p className="text-xs font-semibold uppercase tracking-wide text-logica-lilac">{card.label}</p>
              <span
                className={`flex h-9 w-9 items-center justify-center rounded-xl ${toneStyles[card.tone].icon} shadow-inner`}
              >
                {summaryIcons[card.icon]}
              </span>
            </div>
            <p className="mt-2 text-3xl font-bold leading-tight text-logica-purple">{card.value}</p>
            <p className="text-xs text-logica-lilac">{card.description}</p>
            {card.progress !== undefined && (
              <div className="mt-3 h-2 w-full rounded-full bg-logica-light-lilac/70">
                <div
                  className="h-2 rounded-full bg-gradient-to-r from-emerald-400 to-emerald-600"
                  style={{ width: `${card.progress}%` }}
                />
              </div>
            )}
          </div>
        ))}
      </section>

      <section>
        <div className={`${cardBaseClass} border-logica-purple/20 shadow-logica-purple/10`}>
          <div className="mb-6 flex flex-wrap items-center justify-between gap-2">
            <div>
              <h2 className="text-lg font-semibold text-logica-purple">Fluxo de parcelas</h2>
              <p className="text-xs text-logica-lilac">Projeção dos próximos meses</p>
            </div>
            <div className="flex flex-wrap items-center gap-2 text-xs font-semibold text-logica-purple">
              <span className="rounded-full bg-logica-light-lilac/70 px-3 py-1 shadow-inner">
                {formatCurrency(upcomingInstallmentsValue)} em aberto
              </span>
              <span className="rounded-full bg-emerald-50 px-3 py-1 text-emerald-700 ring-1 ring-emerald-100">
                {upcomingInstallments.length} lançamentos ativos
              </span>
            </div>
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
            <div className="relative ml-16 flex h-56 items-end gap-3 overflow-visible" role="list">
              {monthlyCashflow.map((month) => {
                const height = Math.round((month.value / maxMonthlyCashflow) * 100);
                const barHeight = Math.max(height, month.value > 0 ? 8 : 6);
                const isMax = month.value === maxMonthlyCashflow;
                return (
                  <div key={month.key} className="flex-1" role="listitem" aria-label={`${month.label} ${formatCurrency(month.value)}`}>
                    <div className="group flex h-full flex-col items-center gap-3">
                      <div className="flex h-full w-full items-end overflow-visible rounded-2xl bg-gradient-to-b from-white via-logica-light-lilac/50 to-logica-light-lilac/80 p-1">
                        <div
                          className={`relative w-full rounded-xl bg-gradient-to-t from-logica-purple to-logica-rose shadow-inner transition-all group-hover:brightness-110 ${isMax ? "ring-2 ring-white/70" : ""}`}
                          style={{ height: `${barHeight}%` }}
                        >
                          <span className="absolute inset-x-1 top-1 rounded-full bg-white/95 px-1 text-[10px] font-semibold leading-tight text-logica-purple">
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
            {maxMonthlyCashflow <= 1 && (
              <div className="absolute inset-0 flex items-center justify-center text-[11px] font-semibold text-logica-lilac">
                Sem lançamentos no período selecionado
              </div>
            )}
          </div>
        </div>
      </section>

      <section className="grid gap-4 lg:grid-cols-3">
        <div className={`${cardBaseClass} lg:col-span-2 border-logica-purple/20 shadow-logica-purple/10`}>
          <div className="mb-5 flex flex-wrap items-center justify-between gap-2">
            <div>
              <h2 className="text-lg font-semibold text-logica-purple">Cronograma de pagamentos</h2>
              <p className="text-xs text-logica-lilac">Próximas parcelas monitoradas</p>
              {schedulePeriodRange && (
                <p className="text-[11px] font-semibold text-logica-lilac/90">
                  Período utilizado nos dados: {schedulePeriodRange}
                </p>
              )}
            </div>
            <div className="flex flex-wrap items-center gap-2 text-xs font-semibold text-logica-purple">
              <span className="rounded-full bg-logica-light-lilac/60 px-3 py-1 shadow-inner">
                Exibindo {nextInstallments.length} de {scheduleSource.length} lançamentos
              </span>
              <span className="rounded-full bg-white/80 px-3 py-1 shadow-inner">
                {periodFilteredInstallments.length > 0 ? "Últimos 30 dias" : "Período padrão"}
              </span>
            </div>
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
                      Nenhuma parcela cadastrada para o período selecionado.
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
                      <td className="px-4 py-3 text-right font-semibold leading-tight text-logica-purple">
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
                <p className="text-3xl font-bold leading-tight text-logica-purple">{loanShare}%</p>
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
                    <p className="text-base font-bold leading-tight text-logica-purple">{item.share}%</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="grid gap-4 lg:grid-cols-3">
        <div className={`${cardBaseClass} flex flex-col gap-5 border-logica-rose/20 shadow-logica-rose/10 lg:col-span-3`}>
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div>
              <h2 className="text-lg font-semibold text-logica-purple">Resumo executivo</h2>
              <p className="text-xs text-logica-lilac">Indicadores-chave da carteira</p>
            </div>
            <span className="rounded-full bg-logica-light-lilac/70 px-3 py-1 text-[11px] font-semibold text-logica-purple shadow-inner">
              {contractCount} contratos em acompanhamento
            </span>
          </div>
          <ul className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {executiveHighlights.map((item) => (
              <li key={item.label} className="rounded-2xl bg-logica-light-lilac/60 p-4">
                <p className="text-xs font-semibold uppercase tracking-wide text-logica-lilac">{item.label}</p>
                <p className="mt-1 text-2xl font-bold leading-tight text-logica-purple">{item.value}</p>
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
