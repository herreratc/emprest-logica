import type { Company, Installment, Loan } from "../data/mockData";
import { formatCurrency, formatDate } from "../utils/formatters";

const cardBaseClass = "rounded-2xl border border-white/50 bg-white/70 p-5 shadow-lg backdrop-blur";

type DashboardProps = {
  companies: Company[];
  selectedCompany: string | "all";
  onSelectCompany: (company: string | "all") => void;
  loans: Loan[];
  installments: Installment[];
};

export function Dashboard({ companies, selectedCompany, onSelectCompany, loans, installments }: DashboardProps) {
  const overdueInstallments = installments.filter((installment) => installment.status === "vencida");
  const paidInstallments = installments.filter((installment) => installment.status === "paga");
  const totalDebt = loans.reduce((acc, loan) => acc + loan.amountToPay, 0);

  const companyName = selectedCompany === "all"
    ? "Todas as empresas"
    : companies.find((company) => company.id === selectedCompany)?.name ?? "Empresa";

  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-semibold text-logica-purple">Dashboard</h1>
          <p className="text-sm text-logica-lilac">
            Indicadores consolidados dos empréstimos cadastrados na plataforma.
          </p>
        </div>
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
      </header>

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <div className={`${cardBaseClass} border-logica-purple/20 shadow-logica-purple/20`}>
          <p className="text-xs font-semibold uppercase tracking-wide text-logica-lilac">Empresa</p>
          <p className="mt-2 text-lg font-semibold text-logica-purple">{companyName}</p>
          <p className="text-xs text-logica-lilac">{loans.length} operações vinculadas</p>
        </div>
        <div className={`${cardBaseClass} border-logica-rose/20 shadow-logica-rose/20`}>
          <p className="text-xs font-semibold uppercase tracking-wide text-logica-lilac">Total de empréstimos</p>
          <p className="mt-2 text-3xl font-bold text-logica-rose">{loans.length}</p>
          <p className="text-xs text-logica-lilac">Quantidade de contratos ativos e finalizados</p>
        </div>
        <div className={`${cardBaseClass} border-logica-purple/20 shadow-logica-purple/20`}>
          <p className="text-xs font-semibold uppercase tracking-wide text-logica-lilac">Dívida total</p>
          <p className="mt-2 text-3xl font-bold text-logica-purple">{formatCurrency(totalDebt)}</p>
          <p className="text-xs text-logica-lilac">Saldo restante somando todos os contratos</p>
        </div>
        <div className={`${cardBaseClass} border-logica-rose/20 shadow-logica-rose/20`}>
          <p className="text-xs font-semibold uppercase tracking-wide text-logica-lilac">Parcelas vencidas</p>
          <p className="mt-2 text-3xl font-bold text-logica-rose">{overdueInstallments.length}</p>
          <p className="text-xs text-logica-lilac">Monitoramento de risco e inadimplência</p>
        </div>
      </section>

      <section className={`${cardBaseClass} border-logica-purple/20 shadow-logica-purple/10`}>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-logica-purple">Detalhes dos empréstimos</h2>
          <p className="text-xs text-logica-lilac">Parcelas pagas: {paidInstallments.length}</p>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-logica-lilac/40 text-sm">
            <thead className="bg-logica-light-lilac/60 text-logica-purple">
              <tr>
                <th className="px-3 py-2 text-left font-semibold">Banco/Fornecedor</th>
                <th className="px-3 py-2 text-left font-semibold">Referência</th>
                <th className="px-3 py-2 text-left font-semibold">Valor da Parcela</th>
                <th className="px-3 py-2 text-left font-semibold">Próximo Vencimento</th>
                <th className="px-3 py-2 text-left font-semibold">Último Vencimento</th>
                <th className="px-3 py-2 text-left font-semibold">Parcelas Pagas</th>
                <th className="px-3 py-2 text-left font-semibold">Parcelas a Pagar</th>
                <th className="px-3 py-2 text-left font-semibold">Dívida Total</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-logica-lilac/20 text-logica-purple">
              {loans.map((loan) => {
                const loanInstallments = installments.filter((item) => item.loanId === loan.id);
                const nextInstallment = loanInstallments.find((item) => item.status !== "paga");
                const lastInstallment = loanInstallments
                  .filter((item) => item.status === "paga")
                  .slice(-1)
                  .at(0);
                return (
                  <tr key={loan.id} className="hover:bg-logica-light-lilac/40">
                    <td className="px-3 py-2">{loan.bank}</td>
                    <td className="px-3 py-2">{loan.reference}</td>
                    <td className="px-3 py-2">{formatCurrency(loan.installmentValue)}</td>
                    <td className="px-3 py-2">{nextInstallment ? formatDate(nextInstallment.date) : "-"}</td>
                    <td className="px-3 py-2">{lastInstallment ? formatDate(lastInstallment.date) : "-"}</td>
                    <td className="px-3 py-2">{loan.paidInstallments}</td>
                    <td className="px-3 py-2">{loan.remainingInstallments}</td>
                    <td className="px-3 py-2">{formatCurrency(loan.amountToPay)}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
