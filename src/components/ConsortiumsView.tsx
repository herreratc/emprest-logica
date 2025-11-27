import { useEffect, useMemo, useState } from "react";
import { clsx } from "clsx";
import type { Company, Consortium } from "../data/mockData";
import { formatCurrency } from "../utils/formatters";
import type { MutationResult, UpsertConsortiumInput } from "../hooks/useSupabaseData";
import CompanySelect from "./CompanySelect";

const cardClass = "rounded-2xl border border-logica-purple/20 bg-white/80 p-4 shadow-md backdrop-blur";
const inputClass =
  "w-full rounded-xl border border-logica-lilac/40 bg-white px-4 py-2 text-sm text-logica-purple focus:border-logica-purple focus:outline-none";

const filterButtonClass =
  "rounded-full border px-4 py-2 text-xs font-semibold uppercase tracking-wide transition";

type ConsortiumsViewProps = {
  companies: Company[];
  consortiums: Consortium[];
  selectedCompany: string | "all";
  onSelectCompany: (company: string | "all") => void;
  onSaveConsortium: (consortium: UpsertConsortiumInput) => Promise<MutationResult<Consortium>>;
  onDeleteConsortium: (id: string) => Promise<MutationResult<null>>;
  isUsingSupabase: boolean;
};

type FeedbackState = { type: "success" | "error"; message: string } | null;

type ConsortiumFormState = {
  companyId: string;
  observation: string;
  groupCode: string;
  quota: string;
  administrator: string;
  category: string;
  currentInstallmentValue: string;
  totalInstallments: string;
  creditToReceive: string;
  outstandingBalance: string;
  amountPaid: string;
  amountToPay: string;
  installmentsToPay: string;
  paidInstallments: string;
};

const initialForm: ConsortiumFormState = {
  companyId: "",
  observation: "",
  groupCode: "",
  quota: "",
  administrator: "",
  category: "",
  currentInstallmentValue: "",
  totalInstallments: "",
  creditToReceive: "",
  outstandingBalance: "",
  amountPaid: "0",
  amountToPay: "0",
  installmentsToPay: "0",
  paidInstallments: "0"
};

const createInitialForm = (companyId?: string): ConsortiumFormState => ({
  ...initialForm,
  ...(companyId ? { companyId } : {})
});

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

export function ConsortiumsView({
  companies,
  consortiums,
  selectedCompany,
  onSelectCompany,
  onSaveConsortium,
  onDeleteConsortium,
  isUsingSupabase
}: ConsortiumsViewProps) {
  const [isFormVisible, setIsFormVisible] = useState(false);
  const [editing, setEditing] = useState<Consortium | null>(null);
  const [form, setForm] = useState<ConsortiumFormState>(initialForm);
  const [feedback, setFeedback] = useState<FeedbackState>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<"todas" | string>("todas");
  const [administratorFilter, setAdministratorFilter] = useState<"todos" | string>("todos");

  const filteredConsortiums = useMemo(() => {
    const normalizedSearch = searchTerm.trim().toLowerCase();
    return consortiums.filter((item) => {
      if (categoryFilter !== "todas" && item.category !== categoryFilter) {
        return false;
      }
      if (administratorFilter !== "todos" && item.administrator !== administratorFilter) {
        return false;
      }
      if (!normalizedSearch) {
        return true;
      }
      return (
        item.observation.toLowerCase().includes(normalizedSearch) ||
        item.groupCode.toLowerCase().includes(normalizedSearch) ||
        item.quota.toLowerCase().includes(normalizedSearch)
      );
    });
  }, [consortiums, categoryFilter, administratorFilter, searchTerm]);

  const totals = useMemo(() => {
    const outstanding = filteredConsortiums.reduce((acc, item) => acc + item.outstandingBalance, 0);
    const credit = filteredConsortiums.reduce((acc, item) => acc + item.creditToReceive, 0);
    const installmentValue = filteredConsortiums.reduce((acc, item) => acc + item.currentInstallmentValue, 0);
    const pending = filteredConsortiums.reduce((acc, item) => {
      const pendingAmount = Number.isFinite(item.amountToPay)
        ? item.amountToPay
        : item.outstandingBalance;
      return acc + Math.max(pendingAmount, 0);
    }, 0);
    return { outstanding, credit, installmentValue, pending };
  }, [filteredConsortiums]);

  const categories = useMemo(() => {
    return Array.from(new Set(consortiums.map((item) => item.category))).sort((a, b) =>
      a.localeCompare(b, "pt-BR", { sensitivity: "base" })
    );
  }, [consortiums]);

  const administrators = useMemo(() => {
    return Array.from(new Set(consortiums.map((item) => item.administrator))).sort((a, b) =>
      a.localeCompare(b, "pt-BR", { sensitivity: "base" })
    );
  }, [consortiums]);

  useEffect(() => {
    if (editing) {
      setForm({
        companyId: editing.companyId,
        observation: editing.observation,
        groupCode: editing.groupCode,
        quota: editing.quota,
        administrator: editing.administrator,
        category: editing.category,
        currentInstallmentValue: String(editing.currentInstallmentValue ?? ""),
        totalInstallments: String(editing.totalInstallments ?? ""),
        creditToReceive: String(editing.creditToReceive ?? ""),
        outstandingBalance: String(editing.outstandingBalance ?? ""),
        amountPaid: String(editing.amountPaid ?? ""),
        amountToPay: String(editing.amountToPay ?? ""),
        installmentsToPay: String(editing.installmentsToPay ?? ""),
        paidInstallments: String(editing.paidInstallments ?? "")
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
    setFeedback(null);
    const defaultCompanyId = selectedCompany === "all" ? undefined : selectedCompany;
    setForm(createInitialForm(defaultCompanyId));
    setIsFormVisible(true);
  };

  const handleEdit = (consortium: Consortium) => {
    setIsFormVisible(true);
    setEditing(consortium);
    onSelectCompany(consortium.companyId);
    setFeedback(null);
  };

  const handleCancel = () => {
    setEditing(null);
    setForm(createInitialForm());
    setFeedback(null);
    setIsFormVisible(false);
  };

  const requiredFields: Array<keyof ConsortiumFormState> = [
    "companyId",
    "observation",
    "groupCode",
    "quota",
    "administrator",
    "category",
    "totalInstallments"
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

    const payload: UpsertConsortiumInput = {
      ...(editing ? { id: editing.id } : {}),
      companyId: form.companyId,
      observation: form.observation.trim(),
      groupCode: form.groupCode.trim(),
      quota: form.quota.trim(),
      administrator: form.administrator.trim(),
      category: form.category.trim(),
      currentInstallmentValue: parseNumber(form.currentInstallmentValue),
      totalInstallments: parseInteger(form.totalInstallments),
      creditToReceive: parseNumber(form.creditToReceive),
      outstandingBalance: parseNumber(form.outstandingBalance),
      amountPaid: parseNumber(form.amountPaid),
      amountToPay: parseNumber(form.amountToPay),
      installmentsToPay: parseInteger(form.installmentsToPay),
      paidInstallments: parseInteger(form.paidInstallments)
    };

    const result = await onSaveConsortium(payload);

    if (!result.success) {
      setFeedback({ type: "error", message: result.error });
      setIsSaving(false);
      return;
    }

    setFeedback({
      type: "success",
      message: editing ? "Consórcio atualizado com sucesso." : "Consórcio cadastrado com sucesso."
    });
    setEditing(result.data);
    onSelectCompany(result.data.companyId);
    setIsSaving(false);
  };

  const handleDelete = async () => {
    if (!editing || isDeleting) return;
    const confirmed = window.confirm(`Confirma a exclusão do consórcio ${editing.observation}?`);
    if (!confirmed) return;

    setIsDeleting(true);
    setFeedback(null);

    const result = await onDeleteConsortium(editing.id);

    if (!result.success) {
      setFeedback({ type: "error", message: result.error });
      setIsDeleting(false);
      return;
    }

    setFeedback({ type: "success", message: "Consórcio removido com sucesso." });
    setEditing(null);
    setForm(createInitialForm());
    setIsFormVisible(false);
    setIsDeleting(false);
  };

  const resetFilters = () => {
    setSearchTerm("");
    setCategoryFilter("todas");
    setAdministratorFilter("todos");
  };

  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-semibold text-logica-purple">Consórcios</h1>
          <p className="text-sm text-logica-lilac">
            Controle detalhado dos consórcios vinculados às empresas do grupo.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <CompanySelect
            value={selectedCompany}
            onChange={(value) => onSelectCompany(value as typeof selectedCompany)}
            companies={companies}
            className="min-w-[220px]"
            ariaLabel="Filtrar consórcios por empresa"
          />
          <button
            className="rounded-full bg-logica-rose px-4 py-2 text-sm font-semibold text-white shadow"
            onClick={handleCreate}
            type="button"
          >
            Novo consórcio
          </button>
        </div>
      </header>

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <div className={cardClass}>
          <p className="text-xs font-semibold uppercase text-logica-lilac">Total de consórcios</p>
          <p className="mt-2 text-3xl font-bold text-logica-purple">{filteredConsortiums.length}</p>
        </div>
        <div className={cardClass}>
          <p className="text-xs font-semibold uppercase text-logica-lilac">Saldo devedor</p>
          <p className="mt-2 text-2xl font-bold text-logica-rose">{formatCurrency(totals.pending)}</p>
        </div>
        <div className={cardClass}>
          <p className="text-xs font-semibold uppercase text-logica-lilac">Crédito a receber</p>
          <p className="mt-2 text-2xl font-bold text-logica-purple">{formatCurrency(totals.credit)}</p>
        </div>
        <div className={cardClass}>
          <p className="text-xs font-semibold uppercase text-logica-lilac">Parcela média atual</p>
          <p className="mt-2 text-2xl font-bold text-logica-rose">
            {filteredConsortiums.length === 0
              ? formatCurrency(0)
              : formatCurrency(totals.installmentValue / filteredConsortiums.length)}
          </p>
        </div>
      </section>

      <section className="rounded-2xl border border-logica-purple/20 bg-white/90 p-6 shadow-lg">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex flex-wrap items-center gap-2">
            <input
              type="search"
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
              placeholder="Buscar por observação, grupo ou cota"
              className="w-64 rounded-full border border-logica-lilac/60 bg-white px-4 py-2 text-sm text-logica-purple focus:border-logica-purple focus:outline-none"
            />
            <select
              value={categoryFilter}
              onChange={(event) => setCategoryFilter(event.target.value)}
              className="rounded-full border border-logica-lilac/60 bg-white px-4 py-2 text-sm text-logica-purple focus:border-logica-purple focus:outline-none"
            >
              <option value="todas">Todas as categorias</option>
              {categories.map((category) => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>
            <select
              value={administratorFilter}
              onChange={(event) => setAdministratorFilter(event.target.value)}
              className="rounded-full border border-logica-lilac/60 bg-white px-4 py-2 text-sm text-logica-purple focus:border-logica-purple focus:outline-none"
            >
              <option value="todos">Todas as administradoras</option>
              {administrators.map((admin) => (
                <option key={admin} value={admin}>
                  {admin}
                </option>
              ))}
            </select>
          </div>
          <button
            onClick={resetFilters}
            className={`${filterButtonClass} border-logica-lilac text-logica-purple hover:bg-logica-light-lilac`}
            type="button"
          >
            Limpar filtros
          </button>
        </div>
      </section>

      <section className="overflow-x-auto rounded-2xl border border-logica-purple/10 bg-white/90 p-6 shadow-lg">
        <table className="min-w-full divide-y divide-logica-lilac/30 text-sm text-logica-purple">
          <thead className="bg-logica-light-lilac/60">
            <tr>
              <th className="px-3 py-2 text-left font-semibold">Observação</th>
              <th className="px-3 py-2 text-left font-semibold">Grupo</th>
              <th className="px-3 py-2 text-left font-semibold">Cota</th>
              <th className="px-3 py-2 text-left font-semibold">Saldo devedor</th>
              <th className="px-3 py-2 text-left font-semibold">Parcela atual</th>
              <th className="px-3 py-2 text-left font-semibold">Parcelas a pagar</th>
              <th className="px-3 py-2 text-left font-semibold">Administradora</th>
              <th className="px-3 py-2 text-left font-semibold">Crédito a receber</th>
              <th className="px-3 py-2 text-left font-semibold">Categoria</th>
              <th className="px-3 py-2 text-right font-semibold">Ações</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-logica-lilac/20">
            {filteredConsortiums.map((consortium) => (
              <tr key={consortium.id} className="hover:bg-logica-light-lilac/40">
                <td className="px-3 py-2">{consortium.observation}</td>
                <td className="px-3 py-2">{consortium.groupCode}</td>
                <td className="px-3 py-2">{consortium.quota}</td>
                <td className="px-3 py-2">{formatCurrency(consortium.outstandingBalance)}</td>
                <td className="px-3 py-2">{formatCurrency(consortium.currentInstallmentValue)}</td>
                <td className="px-3 py-2">{consortium.installmentsToPay}</td>
                <td className="px-3 py-2">{consortium.administrator}</td>
                <td className="px-3 py-2">{formatCurrency(consortium.creditToReceive)}</td>
                <td className="px-3 py-2">{consortium.category}</td>
                <td className="px-3 py-2 text-right">
                  <button
                    type="button"
                    onClick={() => handleEdit(consortium)}
                    className="rounded-full border border-logica-purple px-3 py-1 text-xs font-semibold text-logica-purple transition hover:bg-logica-light-lilac"
                  >
                    Editar
                  </button>
                </td>
              </tr>
            ))}
            {filteredConsortiums.length === 0 && (
              <tr>
                <td colSpan={10} className="px-3 py-6 text-center text-sm text-logica-lilac">
                  Nenhum consórcio encontrado para os filtros selecionados.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </section>

      {isFormVisible && (
        <section className="rounded-2xl border border-logica-purple/20 bg-white/95 p-6 shadow-lg">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-logica-purple">
              {editing ? "Editar consórcio" : "Novo consórcio"}
            </h2>
            <button
              onClick={handleCancel}
              className="rounded-full border border-logica-lilac px-3 py-1 text-sm text-logica-purple hover:bg-logica-light-lilac"
              type="button"
            >
              Fechar
            </button>
          </div>

          {feedback && (
            <div
              className={clsx(
                "mb-4 rounded-xl border px-4 py-3 text-sm",
                feedback.type === "success"
                  ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                  : "border-red-200 bg-red-50 text-red-700"
              )}
            >
              {feedback.message}
            </div>
          )}

          <div className="grid gap-4 md:grid-cols-3">
            <label className="text-sm text-logica-purple">
              Empresa
              <select
                value={form.companyId}
                onChange={(event) => setForm((prev) => ({ ...prev, companyId: event.target.value }))}
                className={inputClass}
                disabled={isSaving || isDeleting}
                required
              >
                <option value="">Selecione</option>
                {companies.map((company) => (
                  <option key={company.id} value={company.id}>
                    {company.name}
                  </option>
                ))}
              </select>
            </label>
            <label className="text-sm text-logica-purple">
              Observação
              <input
                type="text"
                className={inputClass}
                value={form.observation}
                onChange={(event) => setForm((prev) => ({ ...prev, observation: event.target.value }))}
                disabled={isSaving || isDeleting}
                required
              />
            </label>
            <label className="text-sm text-logica-purple">
              Categoria
              <input
                type="text"
                className={inputClass}
                value={form.category}
                onChange={(event) => setForm((prev) => ({ ...prev, category: event.target.value }))}
                disabled={isSaving || isDeleting}
                required
              />
            </label>
          </div>

          <div className="mt-4 grid gap-4 md:grid-cols-4">
            <label className="text-sm text-logica-purple">
              Grupo
              <input
                type="text"
                className={inputClass}
                value={form.groupCode}
                onChange={(event) => setForm((prev) => ({ ...prev, groupCode: event.target.value }))}
                disabled={isSaving || isDeleting}
                required
              />
            </label>
            <label className="text-sm text-logica-purple">
              Cota
              <input
                type="text"
                className={inputClass}
                value={form.quota}
                onChange={(event) => setForm((prev) => ({ ...prev, quota: event.target.value }))}
                disabled={isSaving || isDeleting}
                required
              />
            </label>
            <label className="text-sm text-logica-purple">
              Administradora
              <input
                type="text"
                className={inputClass}
                value={form.administrator}
                onChange={(event) => setForm((prev) => ({ ...prev, administrator: event.target.value }))}
                disabled={isSaving || isDeleting}
                required
              />
            </label>
            <label className="text-sm text-logica-purple">
              Total de parcelas
              <input
                type="number"
                min={0}
                className={inputClass}
                value={form.totalInstallments}
                onChange={(event) => setForm((prev) => ({ ...prev, totalInstallments: event.target.value }))}
                disabled={isSaving || isDeleting}
                required
              />
            </label>
          </div>

          <div className="mt-4 grid gap-4 md:grid-cols-4">
            <label className="text-sm text-logica-purple">
              Valor da parcela atual
              <input
                type="number"
                min={0}
                step="0.01"
                className={inputClass}
                value={form.currentInstallmentValue}
                onChange={(event) =>
                  setForm((prev) => ({ ...prev, currentInstallmentValue: event.target.value }))
                }
                disabled={isSaving || isDeleting}
              />
            </label>
            <label className="text-sm text-logica-purple">
              Crédito a receber
              <input
                type="number"
                min={0}
                step="0.01"
                className={inputClass}
                value={form.creditToReceive}
                onChange={(event) => setForm((prev) => ({ ...prev, creditToReceive: event.target.value }))}
                disabled={isSaving || isDeleting}
              />
            </label>
            <label className="text-sm text-logica-purple">
              Parcelas pagas
              <input
                type="number"
                min={0}
                className={`${inputClass} bg-logica-light-lilac/40`}
                value={form.paidInstallments}
                readOnly
                tabIndex={-1}
              />
            </label>
            <label className="text-sm text-logica-purple">
              Parcelas a pagar
              <input
                type="number"
                min={0}
                className={`${inputClass} bg-logica-light-lilac/40`}
                value={form.installmentsToPay}
                readOnly
                tabIndex={-1}
              />
            </label>
          </div>

          <div className="mt-4 grid gap-4 md:grid-cols-4">
            <label className="text-sm text-logica-purple">
              Valor pago até agora
              <input
                type="number"
                min={0}
                step="0.01"
                className={`${inputClass} bg-logica-light-lilac/40`}
                value={form.amountPaid}
                readOnly
                tabIndex={-1}
              />
            </label>
          <label className="text-sm text-logica-purple">
            Valor a pagar
            <input
              type="number"
              min={0}
              step="0.01"
              className={`${inputClass} bg-logica-light-lilac/40`}
              value={form.amountToPay}
              readOnly
              tabIndex={-1}
            />
          </label>
          <label className="text-sm text-logica-purple">
            Saldo devedor
            <input
              type="number"
              min={0}
              step="0.01"
              className={inputClass}
              value={form.outstandingBalance}
              onChange={(event) =>
                setForm((prev) => ({
                  ...prev,
                  outstandingBalance: event.target.value,
                  amountToPay: event.target.value
                }))
              }
              disabled={isSaving || isDeleting}
            />
          </label>
        </div>

          <div className="mt-6 flex flex-wrap items-center justify-between gap-3">
            <div className="text-xs text-logica-lilac">
              {isUsingSupabase
                ? "Valores atualizados automaticamente com base no histórico de parcelas."
                : "Modo demonstração: simulação de atualização automática pelos pagamentos."}
            </div>
            <div className="flex flex-wrap items-center gap-2">
              {editing && (
                <button
                  onClick={handleDelete}
                  className="rounded-full border border-logica-rose px-4 py-2 text-sm font-semibold text-logica-rose hover:bg-logica-rose hover:text-white disabled:cursor-not-allowed disabled:opacity-60"
                  type="button"
                  disabled={isSaving || isDeleting}
                >
                  {isDeleting ? "Removendo..." : "Excluir"}
                </button>
              )}
              <button
                onClick={handleSubmit}
                className="rounded-full bg-logica-purple px-4 py-2 text-sm font-semibold text-white shadow hover:bg-logica-deep-purple disabled:cursor-not-allowed disabled:opacity-60"
                type="button"
                disabled={isSaving || isDeleting}
              >
                {isSaving ? "Salvando..." : "Salvar"}
              </button>
            </div>
          </div>
        </section>
      )}
    </div>
  );
}
