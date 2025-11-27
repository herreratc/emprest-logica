import { clsx } from "clsx";
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
  "rounded-3xl border border-white/60 bg-white/90 p-5 shadow-[0_18px_40px_rgba(106,27,154,0.08)] backdrop-blur-sm transition hover:-translate-y-0.5 hover:shadow-[0_22px_60px_rgba(233,30,99,0.12)]";

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

      let openValue = 0;
      let activeValue = 0;

      activeInstallments.forEach((installment) => {
        const installmentDate = new Date(installment.date);
        if (installmentDate >= monthDate && installmentDate < nextMonth) {
          const value = installment.value;
          if (installment.status === "paga") {
            activeValue += value;
            return;
          }

          if (installmentDate < today || installment.status === "vencida") {
            openValue += value;
          } else {
            activeValue += value;
          }
        }
      });

      const total = openValue + activeValue;
      const label = monthReferenceFormatter.format(monthDate).replace(".", "");
      const capitalized = label.charAt(0).toUpperCase() + label.slice(1);

      return {
        key: `${monthDate.getFullYear()}-${monthDate.getMonth()}`,
        label: `${capitalized} ${monthDate.getFullYear()}`,
        openValue,
        activeValue,
        total
      };
    });
  }, [activeInstallments, monthlyStart, today]);

  const maxMonthlyCashflow = Math.max(1, ...monthlyCashflow.map((month) => month.total));
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

  const hasCashflow = monthlyCashflow.some((month) => month.total > 0);

  const mapToPoints = (selector: (month: (typeof monthlyCashflow)[number]) => number) => {
    if (monthlyCashflow.length === 0) return [] as { x: number; y: number; value: number }[];
    const denominator = Math.max(monthlyCashflow.length - 1, 1);
    return monthlyCashflow.map((month, index) => {
      const x = (index / denominator) * 100;
      const value = selector(month);
      const y = 100 - (value / maxMonthlyCashflow) * 100;
      return { x: Number(x.toFixed(2)), y: Number(y.toFixed(2)), value };
    });
  };

  const createSmoothPath = (points: { x: number; y: number }[]) => {
    if (points.length === 0) return "";
    if (points.length === 1) return `M 0,${points[0].y} L 100,${points[0].y}`;

    return points.reduce((path, point, index) => {
      if (index === 0) return `M ${point.x},${point.y}`;
      const previous = points[index - 1];
      const controlX = (previous.x + point.x) / 2;
      return `${path} Q ${controlX},${previous.y} ${point.x},${point.y}`;
    }, "");
  };

  const createAreaPath = (points: { x: number; y: number }[]) => {
    if (points.length === 0) return "";
    const linePath = createSmoothPath(points);
    const lastPoint = points[points.length - 1];
    const firstPoint = points[0];
    return `${linePath} L ${lastPoint.x},100 L ${firstPoint.x},100 Z`;
  };

  const openPoints = mapToPoints((month) => month.openValue);
  const activePoints = mapToPoints((month) => month.activeValue);
  const totalOpenFlow = monthlyCashflow.reduce((acc, month) => acc + month.openValue, 0);
  const totalActiveFlow = monthlyCashflow.reduce((acc, month) => acc + month.activeValue, 0);

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
      card: "border-logica-purple/25 shadow-[0_12px_34px_rgba(106,27,154,0.14)]",
      icon: "bg-logica-purple/10 text-logica-purple"
    },
    rose: {
      card: "border-logica-rose/25 shadow-[0_12px_34px_rgba(233,30,99,0.14)]",
      icon: "bg-logica-rose/10 text-logica-rose"
    }
  };

  type SummaryCard = {
    label: string;
    value: string | number;
    description: string;
    icon: keyof typeof summaryIcons;
    tone: keyof typeof toneStyles;
    trend: { direction: "up" | "down"; value: string; caption: string };
    progress?: number;
  };

  const summaryCards: SummaryCard[] = [
    {
      label: "Total de empréstimos",
      value: activeLoans.length,
      description: "Contratos ativos",
      icon: "document",
      tone: "rose",
      trend: { direction: "up", value: "2,4%", caption: "vs. mês anterior" }
    },
    {
      label: "Total de consórcios",
      value: activeConsortiums.length,
      description: "Operações em acompanhamento",
      icon: "layers",
      tone: "purple",
      trend: { direction: "up", value: "1,1%", caption: "crescimento orgânico" }
    },
    {
      label: "Empréstimos em R$",
      value: formatCurrency(totalLoanValue),
      description: "Saldo atual a pagar",
      icon: "cash",
      tone: "rose",
      trend: { direction: "down", value: "0,8%", caption: "queda com amortizações" }
    },
    {
      label: "Consórcios em R$",
      value: formatCurrency(totalConsortiumValue),
      description: "Saldo devedor das cotas",
      icon: "pie",
      tone: "purple",
      trend: { direction: "up", value: "3,2%", caption: "novas adesões" }
    },
    {
      label: "Dívida total",
      value: formatCurrency(totalDebt),
      description: "Empréstimos + consórcios",
      icon: "wallet",
      tone: "purple",
      trend: { direction: "down", value: "1,4%", caption: "melhora de carteira" }
    },
    {
      label: "Próximos pagamentos",
      value: formatCurrency(upcomingInstallmentsValue),
      description: "Parcelas ainda não pagas",
      icon: "calendar",
      tone: "purple",
      trend: { direction: "up", value: "2,9%", caption: "entrada de agenda" }
    }
  ];

  const hasScheduleBadges = next7DaysCount > 0 || overdueInstallments.length > 0;

  return (
    <div className="space-y-6">
      <header className="overflow-hidden rounded-3xl border border-white/70 bg-white/80 p-6 shadow-[0_18px_36px_rgba(106,27,154,0.08)] backdrop-blur-sm">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="space-y-2">
            <div className="flex items-center gap-3 text-xs font-semibold uppercase tracking-wide text-logica-lilac">
              <span className="h-8 w-8 rounded-full bg-gradient-to-br from-logica-purple to-logica-rose" />
              <span>Visão consolidada</span>
            </div>
            <h1 className="text-3xl font-extrabold uppercase tracking-tight text-logica-purple">Dashboard</h1>
            {hasScheduleBadges && (
              <div className="flex flex-wrap gap-2 text-xs text-logica-purple">
                {next7DaysCount > 0 && (
                  <span className="flex items-center gap-2 rounded-full bg-white/80 px-3 py-1 font-semibold shadow-inner text-logica-purple ring-1 ring-logica-purple/10">
                    <span className="text-logica-purple">{badgeIcons.bell}</span> {next7DaysCount} vencimentos em 7 dias
                  </span>
                )}
                {overdueInstallments.length > 0 && (
                  <span className="flex items-center gap-2 rounded-full bg-white/80 px-3 py-1 font-semibold shadow-inner text-rose-600 ring-1 ring-rose-100">
                    <span className="text-rose-500">{badgeIcons.alert}</span> {overdueInstallments.length} em atraso
                  </span>
                )}
              </div>
            )}
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <div className="rounded-full bg-white px-4 py-2 text-sm font-semibold text-logica-purple shadow-inner ring-1 ring-logica-light-lilac">
              Visualizando:
              <select
                value={selectedCompany}
                onChange={(event) => onSelectCompany(event.target.value as typeof selectedCompany)}
                className="ml-2 rounded-full bg-transparent text-logica-deep-purple focus:outline-none"
              >
                <option value="all">Todas as empresas ⌄</option>
                {companies.map((company) => (
                  <option key={company.id} value={company.id}>
                    {company.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex items-center gap-3 rounded-2xl bg-gradient-to-r from-logica-purple to-logica-rose px-4 py-3 text-sm font-semibold text-white shadow-lg">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white/20 text-base font-bold">
                {userName.slice(0, 2).toUpperCase()}
              </div>
              <div className="text-left">
                <p className="text-[11px] uppercase tracking-wide text-white/70">Usuário</p>
                <p className="text-sm font-bold">{userName}</p>
              </div>
              {isAuthenticated && onSignOut && (
                <button
                  type="button"
                  onClick={onSignOut}
                  className="flex h-9 w-9 items-center justify-center rounded-full bg-white/15 text-white transition hover:bg-white/25"
                  aria-label="Sair"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} className="h-5 w-5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="m15 16.5 3.75-3.75L15 9" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 12h14.25" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 18.75H6.75A2.25 2.25 0 0 1 4.5 16.5V7.5A2.25 2.25 0 0 1 6.75 5.25H12" />
                  </svg>
                </button>
              )}
            </div>
          </div>
        </div>
      </header>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
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
            <p className="mt-2 break-words text-2xl font-bold leading-snug text-logica-purple sm:text-3xl">
              {card.value}
            </p>
            <div className="mt-1 flex items-center gap-2 text-xs font-semibold text-emerald-600">
              <span
                className={clsx(
                  "flex h-6 w-6 items-center justify-center rounded-full bg-emerald-50 text-xs shadow-inner",
                  card.trend.direction === "down" && "bg-rose-50 text-rose-600"
                )}
              >
                {card.trend.direction === "up" ? "↑" : "↓"}
              </span>
              <span className={card.trend.direction === "up" ? "text-emerald-700" : "text-rose-600"}>{card.trend.value}</span>
              <span className="text-[11px] font-medium text-logica-lilac">{card.trend.caption}</span>
            </div>
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
        <div className={`${cardBaseClass} border-logica-purple/25`}>
          <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
            <div>
              <h2 className="text-lg font-semibold text-logica-purple">Fluxo de parcelas</h2>
              <p className="text-xs text-logica-lilac">Linha do tempo dos próximos lançamentos</p>
            </div>
            <div className="flex flex-wrap items-center gap-3 text-xs font-semibold text-logica-purple">
              <div className="flex items-center gap-2 rounded-full bg-white/80 px-3 py-2 shadow-inner ring-1 ring-logica-light-lilac">
                <span className="h-2.5 w-2.5 rounded-full bg-logica-purple" /> Em aberto: {formatCurrency(totalOpenFlow)}
              </div>
              <div className="flex items-center gap-2 rounded-full bg-white/80 px-3 py-2 shadow-inner ring-1 ring-logica-light-lilac">
                <span className="h-2.5 w-2.5 rounded-full bg-logica-rose" /> Ativo: {formatCurrency(totalActiveFlow)}
              </div>
              <div className="flex items-center gap-2 rounded-full bg-logica-light-lilac/70 px-3 py-2 shadow-inner">
                <span className="text-logica-purple">Período</span>
                <button type="button" className="rounded-full bg-white/80 px-3 py-1 text-logica-purple shadow transition hover:bg-white">12 meses</button>
                <button type="button" className="rounded-full bg-white/30 px-3 py-1 text-logica-purple/70 ring-1 ring-white/50">6 meses</button>
              </div>
            </div>
          </div>
          <div className="relative mt-2 h-80 w-full">
            <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="h-full w-full">
              <defs>
                <linearGradient id="openArea" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#6a1b9a" stopOpacity="0.35" />
                  <stop offset="100%" stopColor="#6a1b9a" stopOpacity="0" />
                </linearGradient>
                <linearGradient id="activeArea" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#e91e63" stopOpacity="0.35" />
                  <stop offset="100%" stopColor="#e91e63" stopOpacity="0" />
                </linearGradient>
              </defs>

              <g>
                {yAxisScale.map((scale, index) => {
                  const position = (100 / yAxisSteps) * (yAxisSteps - index);
                  return (
                    <g key={scale.id}>
                      <text x="2" y={position - 2} className="fill-logica-lilac text-[2.5px] font-semibold">
                        {scale.label}
                      </text>
                      <line
                        x1="12"
                        x2="100"
                        y1={position}
                        y2={position}
                        className="stroke-logica-light-lilac/60"
                        strokeWidth={0.4}
                      />
                    </g>
                  );
                })}
              </g>

              <path d={createAreaPath(openPoints)} fill="url(#openArea)" />
              <path d={createSmoothPath(openPoints)} fill="none" stroke="#6a1b9a" strokeWidth={1.2} />

              <path d={createAreaPath(activePoints)} fill="url(#activeArea)" />
              <path d={createSmoothPath(activePoints)} fill="none" stroke="#e91e63" strokeWidth={1.2} />

              {monthlyCashflow.map((month, index) => {
                const x = openPoints[index]?.x ?? 0;
                return (
                  <text
                    key={`${month.key}-label`}
                    x={x}
                    y={97}
                    className="fill-logica-lilac text-[2.5px] font-semibold"
                    textAnchor="middle"
                  >
                    {month.label}
                  </text>
                );
              })}
            </svg>

            {!hasCashflow && (
              <div className="absolute inset-0 flex items-center justify-center rounded-2xl bg-white/70 text-[11px] font-semibold text-logica-lilac">
                Sem lançamentos no período selecionado
              </div>
            )}
          </div>
        </div>
      </section>

      <section className="grid gap-4 lg:grid-cols-3">
        <div className={`${cardBaseClass} lg:col-span-2 border-logica-purple/20`}>
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
        <div className={`${cardBaseClass} flex flex-col gap-6 border-logica-rose/20`}>
          <div>
            <h2 className="text-lg font-semibold text-logica-purple">Composição da carteira</h2>
            <p className="text-xs text-logica-lilac">Distribuição entre empréstimos e consórcios</p>
          </div>
          <div className="flex flex-col items-center gap-5">
            <div className="relative h-48 w-48">
              <div
                className="absolute inset-0 rounded-full border border-white/60"
                style={{
                  background: `conic-gradient(#e91e63 ${loanShare}%, #6a1b9a ${loanShare}% 100%)`
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
        <div className={`${cardBaseClass} flex flex-col gap-5 border-logica-rose/20 lg:col-span-3`}>
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
