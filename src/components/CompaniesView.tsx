import { useState } from "react";
import type { Company } from "../data/mockData";
import { clsx } from "clsx";

const fieldClass =
  "w-full rounded-xl border border-logica-lilac/40 bg-white px-4 py-2 text-sm text-logica-purple focus:border-logica-purple focus:outline-none";

type CompaniesViewProps = {
  companies: Company[];
  selectedCompany?: Company;
  onSelectCompany: (companyId: string | "all") => void;
};

export function CompaniesView({ companies, selectedCompany, onSelectCompany }: CompaniesViewProps) {
  const [editing, setEditing] = useState<Company | null>(selectedCompany ?? null);
  const [form, setForm] = useState({
    name: "",
    nickname: "",
    cnpj: "",
    address: ""
  });

  const handleEdit = (company: Company) => {
    setEditing(company);
    onSelectCompany(company.id);
  };

  const handleCreate = () => {
    setEditing(null);
    onSelectCompany("all");
    setForm({ name: "", nickname: "", cnpj: "", address: "" });
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
        <p className="text-sm text-logica-lilac">
          Os dados são enviados para o Supabase via API (integração a ser conectada).
        </p>
        <form className="mt-4 grid gap-4 md:grid-cols-2">
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
            <button type="button" className="rounded-full border border-logica-lilac px-4 py-2 text-sm text-logica-purple">
              Cancelar
            </button>
            <button type="button" className="rounded-full bg-logica-purple px-4 py-2 text-sm font-semibold text-white shadow">
              Salvar alterações
            </button>
          </div>
        </form>
      </section>
    </div>
  );
}
