import { useMemo, useState } from "react";
import type { Company, Consortium, Loan } from "../data/mockData";
import type { MutationResult, UpsertConsortiumInput, UpsertLoanInput } from "../hooks/useSupabaseData";
import { formatCurrency } from "../utils/formatters";
import CompanySelect from "./CompanySelect";

const cardClass = "rounded-2xl border border-logica-purple/20 bg-white/90 p-6 shadow-lg";

type SettlementsViewProps = {
  companies: Company[];
  loans: Loan[];
  consortiums: Consortium[];
  selectedCompany: string | "all";
  onSelectCompany: (company: string | "all") => void;
  onSaveLoan: (loan: UpsertLoanInput) => Promise<MutationResult<Loan>>;
  onSaveConsortium: (input: UpsertConsortiumInput) => Promise<MutationResult<Consortium>>;
};

type FeedbackState = { type: "success" | "error"; message: string } | null;

export function SettlementsView({
  companies,
  loans,
  consortiums,
  selectedCompany,
  onSelectCompany,
  onSaveLoan,
  onSaveConsortium
}: SettlementsViewProps) {
  const [feedback, setFeedback] = useState<FeedbackState>(null);
  const [processingId, setProcessingId] = useState<string | null>(null);

  const filteredLoans = useMemo(
    () => (selectedCompany === "all" ? loans : loans.filter((loan) => loan.companyId === selectedCompany)),
    [loans, selectedCompany]
  );

  const filteredConsortiums = useMemo(
    () =>
      selectedCompany === "all"
        ? consortiums
        : consortiums.filter((consortium) => consortium.companyId === selectedCompany),
    [consortiums, selectedCompany]
  );

  const activeLoans = filteredLoans.filter((loan) => loan.status === "ativo");

  const handleLoanSettlement = async (loan: Loan) => {
    setProcessingId(loan.id);
    setFeedback(null);

    const result = await onSaveLoan({
      ...loan,
      status: "finalizado",
      paidInstallments: loan.installments,
      remainingInstallments: 0,
      amountToPay: 0,
      amountPaid: loan.amountPaid + loan.amountToPay
    });

    if (!result.success) {
      setFeedback({ type: "error", message: result.error });
      setProcessingId(null);
      return;
    }

    setFeedback({ type: "success", message: `${loan.reference} marcado como quitado.` });
    setProcessingId(null);
  };

  const handleConsortiumSettlement = async (consortium: Consortium) => {
    setProcessingId(consortium.id);
    setFeedback(null);

    const result = await onSaveConsortium({
      ...consortium,
      installmentsToPay: 0,
      amountToPay: 0,
      outstandingBalance: 0,
      paidInstallments: consortium.totalInstallments,
      creditToReceive: consortium.creditToReceive,
      currentInstallmentValue: consortium.currentInstallmentValue
    });

    if (!result.success) {
      setFeedback({ type: "error", message: result.error });
      setProcessingId(null);
      return;
    }

    setFeedback({ type: "success", message: `${consortium.observation} marcado como quitado.` });
    setProcessingId(null);
  };

  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-semibold text-logica-purple">Quitação de contratos</h1>
          <p className="text-sm text-logica-lilac">
            Finalize empréstimos ou consórcios após a última parcela. O status será atualizado para finalizado.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <CompanySelect
            value={selectedCompany}
            onChange={(value) => onSelectCompany(value as typeof selectedCompany)}
            companies={companies}
            className="min-w-[220px]"
            ariaLabel="Filtrar contratos por empresa"
          />
        </div>
      </header>

      {feedback && (
        <div
          className={`rounded-2xl border px-4 py-3 text-sm ${
            feedback.type === "success"
              ? "border-emerald-200 bg-emerald-50 text-emerald-700"
              : "border-red-200 bg-red-50 text-red-700"
          }`}
        >
          {feedback.message}
        </div>
      )}

      <section className="grid gap-4 lg:grid-cols-2">
        <div className={cardClass}>
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold text-logica-purple">Empréstimos</h2>
              <p className="text-xs text-logica-lilac">Selecione o contrato para marcar como quitado.</p>
            </div>
            <span className="rounded-full bg-logica-light-lilac/70 px-3 py-1 text-xs font-semibold text-logica-purple">
              {activeLoans.length} ativos
            </span>
          </div>
          <div className="mt-4 overflow-hidden rounded-xl border border-logica-light-lilac/80">
            <table className="w-full text-sm text-logica-purple">
              <thead className="bg-logica-light-lilac/60 text-left text-xs font-semibold uppercase tracking-wide text-logica-lilac">
                <tr>
                  <th className="px-3 py-2">Referência</th>
                  <th className="px-3 py-2">Saldo atual</th>
                  <th className="px-3 py-2">Parcelas</th>
                  <th className="px-3 py-2 text-right">Quitar</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-logica-light-lilac/50">
                {activeLoans.length === 0 && (
                  <tr>
                    <td colSpan={4} className="px-3 py-4 text-center text-sm text-logica-lilac">
                      Nenhum empréstimo ativo para esta empresa.
                    </td>
                  </tr>
                )}
                {activeLoans.map((loan) => (
                  <tr key={loan.id}>
                    <td className="px-3 py-2 font-semibold">{loan.reference}</td>
                    <td className="px-3 py-2">{formatCurrency(loan.amountToPay)}</td>
                    <td className="px-3 py-2 text-logica-lilac">
                      {loan.paidInstallments}/{loan.installments} pagas
                    </td>
                    <td className="px-3 py-2 text-right">
                      <button
                        type="button"
                        onClick={() => handleLoanSettlement(loan)}
                        disabled={processingId === loan.id}
                        className="rounded-full bg-logica-purple px-3 py-1 text-xs font-semibold text-white shadow transition hover:bg-logica-deep-purple disabled:opacity-60"
                      >
                        {processingId === loan.id ? "Processando..." : "Quitar"}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className={cardClass}>
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold text-logica-purple">Consórcios</h2>
              <p className="text-xs text-logica-lilac">Marque a cota como quitada para mover para finalizados.</p>
            </div>
            <span className="rounded-full bg-logica-light-lilac/70 px-3 py-1 text-xs font-semibold text-logica-purple">
              {filteredConsortiums.length} acompanhados
            </span>
          </div>
          <div className="mt-4 overflow-hidden rounded-xl border border-logica-light-lilac/80">
            <table className="w-full text-sm text-logica-purple">
              <thead className="bg-logica-light-lilac/60 text-left text-xs font-semibold uppercase tracking-wide text-logica-lilac">
                <tr>
                  <th className="px-3 py-2">Descrição</th>
                  <th className="px-3 py-2">Saldo</th>
                  <th className="px-3 py-2">Parcelas</th>
                  <th className="px-3 py-2 text-right">Quitar</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-logica-light-lilac/50">
                {filteredConsortiums.length === 0 && (
                  <tr>
                    <td colSpan={4} className="px-3 py-4 text-center text-sm text-logica-lilac">
                      Nenhuma cota encontrada para esta empresa.
                    </td>
                  </tr>
                )}
                {filteredConsortiums.map((consortium) => (
                  <tr key={consortium.id}>
                    <td className="px-3 py-2 font-semibold">{consortium.observation}</td>
                    <td className="px-3 py-2">{formatCurrency(consortium.amountToPay)}</td>
                    <td className="px-3 py-2 text-logica-lilac">
                      {consortium.paidInstallments}/{consortium.totalInstallments} pagas
                    </td>
                    <td className="px-3 py-2 text-right">
                      <button
                        type="button"
                        onClick={() => handleConsortiumSettlement(consortium)}
                        disabled={processingId === consortium.id}
                        className="rounded-full bg-logica-purple px-3 py-1 text-xs font-semibold text-white shadow transition hover:bg-logica-deep-purple disabled:opacity-60"
                      >
                        {processingId === consortium.id ? "Processando..." : "Quitar"}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>
    </div>
  );
}
