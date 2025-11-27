import { useEffect, useMemo, useState, type FormEvent } from "react";
import type { Company } from "../data/mockData";
import { clsx } from "clsx";
import type { MutationResult, UpsertCompanyInput } from "../hooks/useSupabaseData";

const fieldClass =
  "w-full rounded-xl border border-logica-lilac/40 bg-white px-4 py-2 text-sm text-logica-purple focus:border-logica-purple focus:outline-none";

type CompaniesViewProps = {
  companies: Company[];
  selectedCompany?: Company;
  onSelectCompany: (companyId: string | "all") => void;
  onSaveCompany: (company: UpsertCompanyInput) => Promise<MutationResult<Company>>;
  onDeleteCompany: (companyId: string) => Promise<MutationResult<null>>;
  isUsingSupabase: boolean;
};

const initialForm = { name: "", nickname: "", cnpj: "", address: "" };

type FeedbackState = { type: "success" | "error"; message: string } | null;

export function CompaniesView({
  companies,
  selectedCompany,
  onSelectCompany,
  onSaveCompany,
  onDeleteCompany,
  isUsingSupabase
}: CompaniesViewProps) {
  const [editing, setEditing] = useState<Company | null>(selectedCompany ?? null);
  const [form, setForm] = useState(initialForm);
  const [feedback, setFeedback] = useState<FeedbackState>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleEdit = (company: Company) => {
    setEditing(company);
    onSelectCompany(company.id);
    setFeedback(null);
  };

  const handleCreate = () => {
    setEditing(null);
    onSelectCompany("all");
    setForm(initialForm);
    setFeedback(null);
  };

  useEffect(() => {
    if (selectedCompany) {
      setEditing(selectedCompany);
    } else {
      setEditing(null);
      setForm(initialForm);
    }
  }, [selectedCompany]);

  const currentValues = useMemo(() => {
    const source = editing ?? form;
    return {
      name: source.name.trim(),
      nickname: source.nickname.trim(),
      cnpj: source.cnpj.trim(),
      address: source.address.trim()
    };
  }, [editing, form]);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (isSaving) return;

    if (!currentValues.name || !currentValues.nickname || !currentValues.cnpj || !currentValues.address) {
      setFeedback({ type: "error", message: "Preencha todos os campos obrigatórios." });
      return;
    }

    setIsSaving(true);
    setFeedback(null);

    const payload: UpsertCompanyInput = {
      ...(editing ? { id: editing.id } : {}),
      ...currentValues
    };

    const result = await onSaveCompany(payload);

    if (!result.success) {
      setFeedback({ type: "error", message: result.error });
      setIsSaving(false);
      return;
    }

    setFeedback({
      type: "success",
      message: editing ? "Empresa atualizada com sucesso." : "Empresa cadastrada com sucesso."
    });

    if (editing) {
      setEditing(result.data);
      onSelectCompany(result.data.id);
    } else {
      setForm(initialForm);
      onSelectCompany(result.data.id);
    }

    setIsSaving(false);
  };

  const handleDelete = async () => {
    if (!editing || isDeleting) return;
    const confirmed = window.confirm(`Confirma a exclusão da empresa ${editing.name}?`);
    if (!confirmed) return;

    setIsDeleting(true);
    setFeedback(null);

    const result = await onDeleteCompany(editing.id);

    if (!result.success) {
      setFeedback({ type: "error", message: result.error });
      setIsDeleting(false);
      return;
    }

    setFeedback({ type: "success", message: "Empresa removida com sucesso." });
    setEditing(null);
    setForm(initialForm);
    onSelectCompany("all");
    setIsDeleting(false);
  };

  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-3xl font-semibold text-logica-purple">Empresas</h1>
          <p className="text-sm text-logica-lilac">Gerencie os dados cadastrais de cada empresa.</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => onSelectCompany("all")}
            className={clsx(
              "rounded-full border px-4 py-2 text-sm font-medium",
              selectedCompany ? "border-logica-lilac text-logica-purple" : "border-logica-purple bg-logica-purple text-white"
            )}
          >
            Ver todas
          </button>
          <button
            onClick={handleCreate}
            className="rounded-full bg-logica-rose px-4 py-2 text-sm font-semibold text-white shadow"
          >
            Nova empresa
          </button>
        </div>
      </header>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {companies.map((company) => (
          <article
            key={company.id}
            className={clsx(
              "rounded-2xl border border-logica-lilac/40 bg-white/80 p-5 shadow-md backdrop-blur transition",
              selectedCompany?.id === company.id && "border-logica-purple shadow-logica-purple/30"
            )}
          >
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-logica-purple">{company.name}</h2>
              <button
                onClick={() => handleEdit(company)}
                className="rounded-full border border-logica-purple px-3 py-1 text-xs font-semibold text-logica-purple transition hover:bg-logica-purple hover:text-white"
              >
                Editar
              </button>
            </div>
            <p className="mt-1 text-sm text-logica-lilac">{company.nickname}</p>
            <dl className="mt-4 space-y-2 text-sm text-logica-purple">
              <div>
                <dt className="font-semibold">CNPJ</dt>
                <dd>{company.cnpj}</dd>
              </div>
              <div>
                <dt className="font-semibold">Endereço</dt>
                <dd>{company.address}</dd>
              </div>
            </dl>
          </article>
        ))}
      </section>

      <section className="rounded-2xl border border-logica-purple/20 bg-white/90 p-6 shadow-lg">
        <h2 className="text-lg font-semibold text-logica-purple">
          {editing ? `Editar ${editing.name}` : "Cadastrar nova empresa"}
        </h2>
        {!isUsingSupabase && (
          <p className="text-sm text-logica-lilac">
            Sem Supabase configurado, as alterações ficam apenas em modo demonstração.
          </p>
        )}
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
        <form className="mt-4 grid gap-4 md:grid-cols-2" onSubmit={handleSubmit}>
          <label className="text-sm text-logica-purple">
            Nome
            <input
              className={fieldClass}
              value={editing ? editing.name : form.name}
              onChange={(event) =>
                editing
                  ? setEditing({ ...editing, name: event.target.value })
                  : setForm({ ...form, name: event.target.value })
              }
            />
          </label>
          <label className="text-sm text-logica-purple">
            Apelido
            <input
              className={fieldClass}
              value={editing ? editing.nickname : form.nickname}
              onChange={(event) =>
                editing
                  ? setEditing({ ...editing, nickname: event.target.value })
                  : setForm({ ...form, nickname: event.target.value })
              }
            />
          </label>
          <label className="text-sm text-logica-purple">
            CNPJ
            <input
              className={fieldClass}
              value={editing ? editing.cnpj : form.cnpj}
              onChange={(event) =>
                editing ? setEditing({ ...editing, cnpj: event.target.value }) : setForm({ ...form, cnpj: event.target.value })
              }
            />
          </label>
          <label className="md:col-span-2 text-sm text-logica-purple">
            Endereço
            <input
              className={fieldClass}
              value={editing ? editing.address : form.address}
              onChange={(event) =>
                editing
                  ? setEditing({ ...editing, address: event.target.value })
                  : setForm({ ...form, address: event.target.value })
              }
            />
          </label>
          <div className="md:col-span-2 flex justify-end gap-3">
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
              onClick={handleCreate}
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
    </div>
  );
}
