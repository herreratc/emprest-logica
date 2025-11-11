import { useMemo, useState } from "react";
import type { Company, Loan } from "../data/mockData";
import { formatCurrency, formatDate, formatPercentage } from "../utils/formatters";

const filterButtonClass =
  "rounded-full border px-4 py-2 text-xs font-semibold uppercase tracking-wide transition";

const cardClass = "rounded-2xl border border-logica-purple/20 bg-white/80 p-4 shadow-md backdrop-blur";

type LoansViewProps = {
  companies: Company[];
  loans: Loan[];
  selectedCompany: string | "all";
  onSelectCompany: (company: string | "all") => void;
};

export function LoansView({ companies, loans, selectedCompany, onSelectCompany }: LoansViewProps) {
  const [statusFilter, setStatusFilter] = useState<"todos" | "ativo" | "finalizado">("todos");

  const filteredLoans = useMemo(() => {
    return loans.filter((loan) => (statusFilter === "todos" ? true : loan.status === statusFilter));
  }, [loans, statusFilter]);

  const totalActive = filteredLoans.filter((loan) => loan.status === "ativo").length;
  const totalFinished = filteredLoans.filter((loan) => loan.status === "finalizado").length;
  const totalValue = filteredLoans.reduce((acc, loan) => acc + loan.totalValue, 0);

  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-semibold text-logica-purple">Empréstimos</h1>
          <p className="text-sm text-logica-lilac">Controle completo dos contratos e condições financeiras.</p>
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
          <button className="rounded-full bg-logica-rose px-4 py-2 text-sm font-semibold text-white shadow">Novo empréstimo</button>
        </div>
      </header>

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <div className={cardClass}>
          <p className="text-xs font-semibold uppercase text-logica-lilac">Total de empréstimos</p>
          <p className="mt-2 text-3xl font-bold text-logica-purple">{filteredLoans.length}</p>
        </div>
        <div className={cardClass}>
          <p className="text-xs font-semibold uppercase text-logica-lilac">Total ativos</p>
          <p className="mt-2 text-3xl font-bold text-logica-purple">{totalActive}</p>
        </div>
        <div className={cardClass}>
          <p className="text-xs font-semibold uppercase text-logica-lilac">Total finalizados</p>
          <p className="mt-2 text-3xl font-bold text-logica-purple">{totalFinished}</p>
        </div>
        <div className={cardClass}>
          <p className="text-xs font-semibold uppercase text-logica-lilac">Valor total contratado</p>
          <p className="mt-2 text-2xl font-bold text-logica-rose">{formatCurrency(totalValue)}</p>
        </div>
      </section>

      <section className="flex flex-wrap items-center gap-2">
        {["todos", "ativo", "finalizado"].map((status) => (
          <button
            key={status}
            onClick={() => setStatusFilter(status as typeof statusFilter)}
            className={`${filterButtonClass} ${
              statusFilter === status
                ? "border-logica-purple bg-logica-purple text-white"
                : "border-logica-lilac text-logica-purple hover:border-logica-purple"
            }`}
          >
            {status === "todos" ? "Todos" : status === "ativo" ? "Ativos" : "Finalizados"}
          </button>
        ))}
      </section>

      <section className="overflow-x-auto rounded-2xl border border-logica-purple/10 bg-white/90 p-4 shadow-lg">
        <table className="min-w-full divide-y divide-logica-lilac/30 text-sm text-logica-purple">
          <thead className="bg-logica-light-lilac/60">
            <tr>
              <th className="px-3 py-2 text-left font-semibold">Empresa</th>
              <th className="px-3 py-2 text-left font-semibold">Referência</th>
              <th className="px-3 py-2 text-left font-semibold">Banco</th>
              <th className="px-3 py-2 text-left font-semibold">Valor total</th>
              <th className="px-3 py-2 text-left font-semibold">Início</th>
              <th className="px-3 py-2 text-left font-semibold">Fim</th>
              <th className="px-3 py-2 text-left font-semibold">Status</th>
              <th className="px-3 py-2 text-left font-semibold">Editar</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-logica-lilac/20">
            {filteredLoans.map((loan) => {
              const company = companies.find((item) => item.id === loan.companyId);
              return (
                <tr key={loan.id} className="hover:bg-logica-light-lilac/40">
                  <td className="px-3 py-2">{company?.nickname ?? "-"}</td>
                  <td className="px-3 py-2">{loan.reference}</td>
                  <td className="px-3 py-2">{loan.bank}</td>
                  <td className="px-3 py-2">{formatCurrency(loan.totalValue)}</td>
                  <td className="px-3 py-2">{formatDate(loan.startDate)}</td>
                  <td className="px-3 py-2">{formatDate(loan.endDate)}</td>
                  <td className="px-3 py-2">
                    <span
                      className={`rounded-full px-3 py-1 text-xs font-semibold uppercase ${
                        loan.status === "ativo"
                          ? "bg-logica-rose/20 text-logica-rose"
                          : "bg-logica-light-lilac text-logica-purple"
                      }`}
                    >
                      {loan.status === "ativo" ? "Ativo" : "Finalizado"}
                    </span>
                  </td>
                  <td className="px-3 py-2">
                    <button className="rounded-full border border-logica-purple px-3 py-1 text-xs font-semibold text-logica-purple transition hover:bg-logica-purple hover:text-white">
                      Editar
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </section>

      {filteredLoans.map((loan) => (
        <section key={loan.id} className="grid gap-4 rounded-2xl border border-logica-purple/20 bg-white/90 p-6 shadow-lg md:grid-cols-2">
          <div>
            <h3 className="text-lg font-semibold text-logica-purple">{loan.operation}</h3>
            <dl className="mt-4 space-y-2 text-sm text-logica-purple">
              <div className="flex justify-between">
                <dt>Nº Operação</dt>
                <dd className="font-medium">{loan.operationNumber}</dd>
              </div>
              <div className="flex justify-between">
                <dt>Valor do bem à vista</dt>
                <dd className="font-medium">{formatCurrency(loan.upfrontValue)}</dd>
              </div>
              <div className="flex justify-between">
                <dt>Valor do bem a prazo</dt>
                <dd className="font-medium">{formatCurrency(loan.financedValue)}</dd>
              </div>
              <div className="flex justify-between">
                <dt>Valor dos juros no período</dt>
                <dd className="font-medium">{formatCurrency(loan.interestValue)}</dd>
              </div>
              <div className="flex justify-between">
                <dt>Valor pago até agora</dt>
                <dd className="font-medium">{formatCurrency(loan.amountPaid)}</dd>
              </div>
              <div className="flex justify-between">
                <dt>Valor a pagar</dt>
                <dd className="font-medium">{formatCurrency(loan.amountToPay)}</dd>
              </div>
            </dl>
          </div>
          <div>
            <h3 className="text-lg font-semibold text-logica-purple">Condições</h3>
            <dl className="mt-4 space-y-2 text-sm text-logica-purple">
              <div className="flex justify-between">
                <dt>Número de parcelas</dt>
                <dd className="font-medium">{loan.installments}</dd>
              </div>
              <div className="flex justify-between">
                <dt>Parcelas pagas</dt>
                <dd className="font-medium">{loan.paidInstallments}</dd>
              </div>
              <div className="flex justify-between">
                <dt>Parcelas restantes</dt>
                <dd className="font-medium">{loan.remainingInstallments}</dd>
              </div>
              <div className="flex justify-between">
                <dt>Valor da parcela</dt>
                <dd className="font-medium">{formatCurrency(loan.installmentValue)}</dd>
              </div>
              <div className="flex justify-between">
                <dt>Valor s/ juros</dt>
                <dd className="font-medium">{formatCurrency(loan.installmentValueNoInterest)}</dd>
              </div>
              <div className="flex justify-between">
                <dt>Juros por parcela</dt>
                <dd className="font-medium">{formatCurrency(loan.interestPerInstallment)}</dd>
              </div>
              <div className="flex justify-between">
                <dt>Taxa nominal</dt>
                <dd className="font-medium">{formatPercentage(loan.nominalRate)}</dd>
              </div>
              <div className="flex justify-between">
                <dt>Taxa efetiva a.a.</dt>
                <dd className="font-medium">{formatPercentage(loan.effectiveAnnualRate)}</dd>
              </div>
              <div className="flex justify-between">
                <dt>Início do contrato</dt>
                <dd className="font-medium">{formatDate(loan.contractStart)}</dd>
              </div>
              <div className="flex justify-between">
                <dt>Data atual</dt>
                <dd className="font-medium">{formatDate(loan.currentDate)}</dd>
              </div>
            </dl>
          </div>
        </section>
      ))}
    </div>
  );
}
