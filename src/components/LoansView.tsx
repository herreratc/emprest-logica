import { useEffect, useMemo, useState } from "react";
import type { Company, Loan, LoanStatus } from "../data/mockData";
import { formatCurrency, formatDate, formatPercentage } from "../utils/formatters";
import { clsx } from "clsx";
import type { MutationResult, UpsertLoanInput } from "../hooks/useSupabaseData";

const filterButtonClass =
  "rounded-full border px-4 py-2 text-xs font-semibold uppercase tracking-wide transition";

const cardClass = "rounded-2xl border border-logica-purple/20 bg-white/80 p-4 shadow-md backdrop-blur";

type LoansViewProps = {
  companies: Company[];
  loans: Loan[];
  selectedCompany: string | "all";
  onSelectCompany: (company: string | "all") => void;
  onSaveLoan: (loan: UpsertLoanInput) => Promise<MutationResult<Loan>>;
  onDeleteLoan: (loanId: string) => Promise<MutationResult<null>>;
  isUsingSupabase: boolean;
};

type LoanFormState = {
  companyId: string;
  reference: string;
  bank: string;
  totalValue: string;
  startDate: string;
  endDate: string;
  status: LoanStatus;
  operation: string;
  operationNumber: string;
  upfrontValue: string;
  financedValue: string;
  interestValue: string;
  installments: string;
  installmentValue: string;
  installmentValueNoInterest: string;
  interestPerInstallment: string;
  nominalRate: string;
  effectiveAnnualRate: string;
  paidInstallments: string;
  remainingInstallments: string;
  amountPaid: string;
  amountToPay: string;
  currentDate: string;
  contractStart: string;
};

const initialLoanForm: LoanFormState = {
  companyId: "",
  reference: "",
  bank: "",
  totalValue: "",
  startDate: "",
  endDate: "",
  status: "ativo",
  operation: "",
  operationNumber: "",
  upfrontValue: "",
  financedValue: "",
  interestValue: "",
  installments: "",
  installmentValue: "",
  installmentValueNoInterest: "",
  interestPerInstallment: "",
  nominalRate: "",
  effectiveAnnualRate: "",
  paidInstallments: "",
  remainingInstallments: "",
  amountPaid: "",
  amountToPay: "",
  currentDate: "",
  contractStart: ""
};

const createInitialForm = (companyId?: string): LoanFormState => ({
  ...initialLoanForm,
  ...(companyId ? { companyId } : {})
});

type FeedbackState = { type: "success" | "error"; message: string } | null;

const inputClass =
  "w-full rounded-xl border border-logica-lilac/40 bg-white px-4 py-2 text-sm text-logica-purple focus:border-logica-purple focus:outline-none";

export function LoansView({
  companies,
  loans,
  selectedCompany,
  onSelectCompany,
  onSaveLoan,
  onDeleteLoan,
  isUsingSupabase
}: LoansViewProps) {
  const [statusFilter, setStatusFilter] = useState<"todos" | "ativo" | "finalizado">("todos");
  const [editing, setEditing] = useState<Loan | null>(null);
  const [form, setForm] = useState<LoanFormState>(initialLoanForm);
  const [feedback, setFeedback] = useState<FeedbackState>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isFormVisible, setIsFormVisible] = useState(false);

  const toStringValue = (value: number | string | null | undefined) =>
    value === null || value === undefined ? "" : String(value);

  const filteredLoans = useMemo(() => {
    return loans.filter((loan) => (statusFilter === "todos" ? true : loan.status === statusFilter));
  }, [loans, statusFilter]);

  const totalActive = filteredLoans.filter((loan) => loan.status === "ativo").length;
  const totalFinished = filteredLoans.filter((loan) => loan.status === "finalizado").length;
  const totalValue = filteredLoans.reduce((acc, loan) => acc + loan.totalValue, 0);

  useEffect(() => {
    if (editing) {
      setForm({
        companyId: editing.companyId,
        reference: editing.reference,
        bank: editing.bank,
        totalValue: toStringValue(editing.totalValue),
        startDate: editing.startDate,
        endDate: editing.endDate,
        status: editing.status,
        operation: editing.operation,
        operationNumber: editing.operationNumber,
        upfrontValue: toStringValue(editing.upfrontValue),
        financedValue: toStringValue(editing.financedValue),
        interestValue: toStringValue(editing.interestValue),
        installments: toStringValue(editing.installments),
        installmentValue: toStringValue(editing.installmentValue),
        installmentValueNoInterest: toStringValue(editing.installmentValueNoInterest),
        interestPerInstallment: toStringValue(editing.interestPerInstallment),
        nominalRate: toStringValue(editing.nominalRate),
        effectiveAnnualRate: toStringValue(editing.effectiveAnnualRate),
        paidInstallments: toStringValue(editing.paidInstallments),
        remainingInstallments: toStringValue(editing.remainingInstallments),
        amountPaid: toStringValue(editing.amountPaid),
        amountToPay: toStringValue(editing.amountToPay),
        currentDate: editing.currentDate,
        contractStart: editing.contractStart
      });
      return;
    }

    if (!isFormVisible) {
      setForm(createInitialForm());
      return;
    }

    setForm((prev) => ({
      ...prev,
      companyId: selectedCompany === "all" ? "" : selectedCompany
    }));
  }, [editing, isFormVisible, selectedCompany]);

  const handleCreate = () => {
    setEditing(null);
    const defaultCompanyId = selectedCompany === "all" ? undefined : selectedCompany;
    setForm(createInitialForm(defaultCompanyId));
    setFeedback(null);
    setIsFormVisible(true);
  };

  const handleEdit = (loan: Loan) => {
    setIsFormVisible(true);
    setEditing(loan);
    onSelectCompany(loan.companyId);
    setFeedback(null);
  };

  const handleCancel = () => {
    setEditing(null);
    setForm(createInitialForm());
    setFeedback(null);
    setIsFormVisible(false);
  };

  const parseNumber = (value: string) => {
    if (!value.trim()) return 0;
    const usesComma = value.includes(",");
    const normalized = usesComma ? value.replace(/\./g, "").replace(/,/g, ".") : value;
    const sanitized = normalized.replace(/\s+/g, "");
    const numeric = Number(sanitized);
    return Number.isNaN(numeric) ? 0 : numeric;
  };

  const parseInteger = (value: string) => {
    const numeric = parseNumber(value);
    return Number.isNaN(numeric) ? 0 : Math.max(0, Math.round(numeric));
  };

  const requiredFields: Array<keyof LoanFormState> = [
    "companyId",
    "reference",
    "bank",
    "startDate",
    "endDate",
    "installments"
  ];

  const handleSubmit = async () => {
    if (isSaving) return;

    const missing = requiredFields.filter((field) => !form[field].toString().trim());
    if (missing.length > 0) {
      setFeedback({ type: "error", message: "Preencha todos os campos obrigatórios destacados." });
      return;
    }

    setIsSaving(true);
    setFeedback(null);

    const payload: UpsertLoanInput = {
      ...(editing ? { id: editing.id } : {}),
      companyId: form.companyId,
      reference: form.reference.trim(),
      bank: form.bank.trim(),
      totalValue: parseNumber(form.totalValue),
      startDate: form.startDate,
      endDate: form.endDate,
      status: form.status,
      operation: form.operation.trim(),
      operationNumber: form.operationNumber.trim(),
      upfrontValue: parseNumber(form.upfrontValue),
      financedValue: parseNumber(form.financedValue),
      interestValue: parseNumber(form.interestValue),
      installments: parseInteger(form.installments),
      installmentValue: parseNumber(form.installmentValue),
      installmentValueNoInterest: parseNumber(form.installmentValueNoInterest),
      interestPerInstallment: parseNumber(form.interestPerInstallment),
      nominalRate: parseNumber(form.nominalRate),
      effectiveAnnualRate: parseNumber(form.effectiveAnnualRate),
      paidInstallments: parseInteger(form.paidInstallments),
      remainingInstallments: parseInteger(form.remainingInstallments),
      amountPaid: parseNumber(form.amountPaid),
      amountToPay: parseNumber(form.amountToPay),
      currentDate: form.currentDate || form.startDate,
      contractStart: form.contractStart || form.startDate
    };

    const result = await onSaveLoan(payload);

    if (!result.success) {
      setFeedback({ type: "error", message: result.error });
      setIsSaving(false);
      return;
    }

    setFeedback({
      type: "success",
      message: editing ? "Empréstimo atualizado com sucesso." : "Empréstimo cadastrado com sucesso."
    });
    setEditing(result.data);
    onSelectCompany(result.data.companyId);
    setIsSaving(false);
  };

  const handleDelete = async () => {
    if (!editing || isDeleting) return;
    const confirmed = window.confirm(`Confirma a exclusão do empréstimo ${editing.reference}?`);
    if (!confirmed) return;

    setIsDeleting(true);
    setFeedback(null);

    const result = await onDeleteLoan(editing.id);

    if (!result.success) {
      setFeedback({ type: "error", message: result.error });
      setIsDeleting(false);
      return;
    }

    setFeedback({ type: "success", message: "Empréstimo removido com sucesso." });
    setEditing(null);
    setForm(createInitialForm());
    setIsFormVisible(false);
    setIsDeleting(false);
  };

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
          <button
            className="rounded-full bg-logica-rose px-4 py-2 text-sm font-semibold text-white shadow"
            onClick={handleCreate}
            type="button"
          >
            Novo empréstimo
          </button>
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
                    <button
                      className="rounded-full border border-logica-purple px-3 py-1 text-xs font-semibold text-logica-purple transition hover:bg-logica-purple hover:text-white"
                      onClick={() => handleEdit(loan)}
                      type="button"
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

      {isFormVisible && (
        <section className="rounded-2xl border border-logica-purple/20 bg-white/90 p-6 shadow-lg">
          <h2 className="text-lg font-semibold text-logica-purple">
            {editing ? `Editar ${editing.reference}` : "Cadastrar novo empréstimo"}
          </h2>
          <p className="text-sm text-logica-lilac">
            {isUsingSupabase
              ? "As alterações são sincronizadas com a tabela loans do seu projeto Supabase."
              : "Sem Supabase configurado, as alterações ficam apenas na sessão atual."}
          </p>
          {feedback && (
            <div
              className={clsx(
                "mt-4 rounded-xl border px-4 py-3 text-sm",
                feedback.type === "success"
                  ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                  : "border-red-200 bg-red-50 text-red-700"
              )}
            >
              {feedback.message}
            </div>
          )}
          <form
            className="mt-4 space-y-4"
            onSubmit={(event) => {
              event.preventDefault();
              handleSubmit();
            }}
          >
          <div className="grid gap-4 md:grid-cols-3">
            <label className="text-sm text-logica-purple">
              Empresa
              <select
                className={inputClass}
                value={form.companyId}
                onChange={(event) => setForm((prev) => ({ ...prev, companyId: event.target.value }))}
                disabled={isSaving || isDeleting}
                required
              >
                <option value="">Selecione...</option>
                {companies.map((company) => (
                  <option key={company.id} value={company.id}>
                    {company.name}
                  </option>
                ))}
              </select>
            </label>
            <label className="text-sm text-logica-purple">
              Referência
              <input
                className={inputClass}
                value={form.reference}
                onChange={(event) => setForm((prev) => ({ ...prev, reference: event.target.value }))}
                disabled={isSaving || isDeleting}
                required
              />
            </label>
            <label className="text-sm text-logica-purple">
              Banco
              <input
                className={inputClass}
                value={form.bank}
                onChange={(event) => setForm((prev) => ({ ...prev, bank: event.target.value }))}
                disabled={isSaving || isDeleting}
                required
              />
            </label>
          </div>
          <div className="grid gap-4 md:grid-cols-4">
            <label className="text-sm text-logica-purple">
              Status
              <select
                className={inputClass}
                value={form.status}
                onChange={(event) => setForm((prev) => ({ ...prev, status: event.target.value as LoanStatus }))}
                disabled={isSaving || isDeleting}
              >
                <option value="ativo">Ativo</option>
                <option value="finalizado">Finalizado</option>
              </select>
            </label>
            <label className="text-sm text-logica-purple">
              Data início
              <input
                type="date"
                className={inputClass}
                value={form.startDate}
                onChange={(event) => setForm((prev) => ({ ...prev, startDate: event.target.value }))}
                disabled={isSaving || isDeleting}
                required
              />
            </label>
            <label className="text-sm text-logica-purple">
              Data fim
              <input
                type="date"
                className={inputClass}
                value={form.endDate}
                onChange={(event) => setForm((prev) => ({ ...prev, endDate: event.target.value }))}
                disabled={isSaving || isDeleting}
                required
              />
            </label>
            <label className="text-sm text-logica-purple">
              Nº de parcelas
              <input
                type="number"
                min={0}
                className={inputClass}
                value={form.installments}
                onChange={(event) => setForm((prev) => ({ ...prev, installments: event.target.value }))}
                disabled={isSaving || isDeleting}
                required
              />
            </label>
          </div>
          <div className="grid gap-4 md:grid-cols-4">
            <label className="text-sm text-logica-purple">
              Valor total contratado
              <input
                type="number"
                min={0}
                step="0.01"
                className={inputClass}
                value={form.totalValue}
                onChange={(event) => setForm((prev) => ({ ...prev, totalValue: event.target.value }))}
                disabled={isSaving || isDeleting}
              />
            </label>
            <label className="text-sm text-logica-purple">
              Valor à vista
              <input
                type="number"
                min={0}
                step="0.01"
                className={inputClass}
                value={form.upfrontValue}
                onChange={(event) => setForm((prev) => ({ ...prev, upfrontValue: event.target.value }))}
                disabled={isSaving || isDeleting}
              />
            </label>
            <label className="text-sm text-logica-purple">
              Valor financiado
              <input
                type="number"
                min={0}
                step="0.01"
                className={inputClass}
                value={form.financedValue}
                onChange={(event) => setForm((prev) => ({ ...prev, financedValue: event.target.value }))}
                disabled={isSaving || isDeleting}
              />
            </label>
            <label className="text-sm text-logica-purple">
              Valor dos juros
              <input
                type="number"
                min={0}
                step="0.01"
                className={inputClass}
                value={form.interestValue}
                onChange={(event) => setForm((prev) => ({ ...prev, interestValue: event.target.value }))}
                disabled={isSaving || isDeleting}
              />
            </label>
          </div>
          <div className="grid gap-4 md:grid-cols-4">
            <label className="text-sm text-logica-purple">
              Valor da parcela
              <input
                type="number"
                min={0}
                step="0.01"
                className={inputClass}
                value={form.installmentValue}
                onChange={(event) => setForm((prev) => ({ ...prev, installmentValue: event.target.value }))}
                disabled={isSaving || isDeleting}
              />
            </label>
            <label className="text-sm text-logica-purple">
              Valor s/ juros
              <input
                type="number"
                min={0}
                step="0.01"
                className={inputClass}
                value={form.installmentValueNoInterest}
                onChange={(event) =>
                  setForm((prev) => ({ ...prev, installmentValueNoInterest: event.target.value }))
                }
                disabled={isSaving || isDeleting}
              />
            </label>
            <label className="text-sm text-logica-purple">
              Juros por parcela
              <input
                type="number"
                min={0}
                step="0.01"
                className={inputClass}
                value={form.interestPerInstallment}
                onChange={(event) =>
                  setForm((prev) => ({ ...prev, interestPerInstallment: event.target.value }))
                }
                disabled={isSaving || isDeleting}
              />
            </label>
            <label className="text-sm text-logica-purple">
              Taxa nominal (% a.m.)
              <input
                type="number"
                min={0}
                step="0.01"
                className={inputClass}
                value={form.nominalRate}
                onChange={(event) => setForm((prev) => ({ ...prev, nominalRate: event.target.value }))}
                disabled={isSaving || isDeleting}
              />
            </label>
          </div>
          <div className="grid gap-4 md:grid-cols-4">
            <label className="text-sm text-logica-purple">
              Taxa efetiva a.a. (%)
              <input
                type="number"
                min={0}
                step="0.01"
                className={inputClass}
                value={form.effectiveAnnualRate}
                onChange={(event) => setForm((prev) => ({ ...prev, effectiveAnnualRate: event.target.value }))}
                disabled={isSaving || isDeleting}
              />
            </label>
            <label className="text-sm text-logica-purple">
              Parcelas pagas
              <input
                type="number"
                min={0}
                className={inputClass}
                value={form.paidInstallments}
                onChange={(event) => setForm((prev) => ({ ...prev, paidInstallments: event.target.value }))}
                disabled={isSaving || isDeleting}
              />
            </label>
            <label className="text-sm text-logica-purple">
              Parcelas restantes
              <input
                type="number"
                min={0}
                className={inputClass}
                value={form.remainingInstallments}
                onChange={(event) => setForm((prev) => ({ ...prev, remainingInstallments: event.target.value }))}
                disabled={isSaving || isDeleting}
              />
            </label>
            <label className="text-sm text-logica-purple">
              Valor pago
              <input
                type="number"
                min={0}
                step="0.01"
                className={inputClass}
                value={form.amountPaid}
                onChange={(event) => setForm((prev) => ({ ...prev, amountPaid: event.target.value }))}
                disabled={isSaving || isDeleting}
              />
            </label>
          </div>
          <div className="grid gap-4 md:grid-cols-3">
            <label className="text-sm text-logica-purple">
              Valor a pagar
              <input
                type="number"
                min={0}
                step="0.01"
                className={inputClass}
                value={form.amountToPay}
                onChange={(event) => setForm((prev) => ({ ...prev, amountToPay: event.target.value }))}
                disabled={isSaving || isDeleting}
              />
            </label>
            <label className="text-sm text-logica-purple">
              Data base (situação)
              <input
                type="date"
                className={inputClass}
                value={form.currentDate}
                onChange={(event) => setForm((prev) => ({ ...prev, currentDate: event.target.value }))}
                disabled={isSaving || isDeleting}
              />
            </label>
            <label className="text-sm text-logica-purple">
              Início do contrato
              <input
                type="date"
                className={inputClass}
                value={form.contractStart}
                onChange={(event) => setForm((prev) => ({ ...prev, contractStart: event.target.value }))}
                disabled={isSaving || isDeleting}
              />
            </label>
          </div>
          <label className="text-sm text-logica-purple block">
            Operação
            <input
              className={inputClass}
              value={form.operation}
              onChange={(event) => setForm((prev) => ({ ...prev, operation: event.target.value }))}
              disabled={isSaving || isDeleting}
            />
          </label>
          <label className="text-sm text-logica-purple block">
            Nº da operação
            <input
              className={inputClass}
              value={form.operationNumber}
              onChange={(event) => setForm((prev) => ({ ...prev, operationNumber: event.target.value }))}
              disabled={isSaving || isDeleting}
            />
          </label>
          <div className="flex justify-end gap-3">
            {editing && (
              <button
                type="button"
                onClick={handleDelete}
                disabled={isDeleting || isSaving}
                className={clsx(
                  "rounded-full border border-red-200 px-4 py-2 text-sm font-semibold",
                  isDeleting || isSaving
                    ? "cursor-not-allowed bg-red-100 text-red-300"
                    : "text-red-600 hover:bg-red-50"
                )}
              >
                Excluir
              </button>
            )}
            <button
              type="button"
              onClick={handleCancel}
              className="rounded-full border border-logica-lilac px-4 py-2 text-sm text-logica-purple"
              disabled={isSaving || isDeleting}
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isSaving || isDeleting}
              className={clsx(
                "rounded-full bg-logica-purple px-4 py-2 text-sm font-semibold text-white shadow transition",
                (isSaving || isDeleting) && "cursor-not-allowed opacity-60"
              )}
            >
              {isSaving ? "Salvando..." : "Salvar alterações"}
            </button>
          </div>
          </form>
        </section>
      )}

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
