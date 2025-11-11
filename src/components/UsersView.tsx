import { FormEvent, useState } from "react";
import { useAuth } from "../auth/AuthProvider";

const inputClass =
  "w-full rounded-xl border border-logica-lilac/40 bg-white px-4 py-2 text-sm text-logica-purple focus:border-logica-purple focus:outline-none";

type Role = "master" | "gestor" | "financeiro";

type UserRow = {
  id: string;
  name: string;
  email: string;
  role: Role;
};

const mockUsers: UserRow[] = [
  { id: "1", name: "Ana Souza", email: "ana@logica.com", role: "master" },
  { id: "2", name: "Bruno Lima", email: "bruno@logica.com", role: "gestor" },
  { id: "3", name: "Carla Dias", email: "carla@logica.com", role: "financeiro" }
];

export function UsersView() {
  const { user, signOut, isConfigured } = useAuth();
  const [form, setForm] = useState({
    name: "",
    email: "",
    role: "gestor" as Role
  });

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    // TODO: conectar com Supabase Functions/Policies
  };

  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-semibold text-logica-purple">Usuários</h1>
          <p className="text-sm text-logica-lilac">Gerencie acessos via autenticação do Supabase.</p>
        </div>
        <div className="rounded-full bg-white/80 px-4 py-2 text-sm text-logica-purple shadow">
          Logado como <span className="font-semibold">{user?.email ?? "Usuário demo"}</span>
          <button
            onClick={() => (isConfigured ? signOut() : undefined)}
            disabled={!isConfigured}
            className="ml-3 rounded-full bg-logica-rose px-3 py-1 text-xs font-semibold text-white disabled:cursor-not-allowed disabled:opacity-70"
          >
            Sair
          </button>
        </div>
      </header>

      <section className="rounded-2xl border border-logica-purple/20 bg-white/90 p-6 shadow-lg">
        <h2 className="text-lg font-semibold text-logica-purple">Cadastrar novo usuário</h2>
        <p className="text-sm text-logica-lilac">Convide novos colaboradores autenticando com Google ou e-mail.</p>
        <form onSubmit={handleSubmit} className="mt-4 grid gap-4 md:grid-cols-3">
          <label className="text-sm text-logica-purple">
            Nome
            <input
              className={inputClass}
              value={form.name}
              onChange={(event) => setForm((prev) => ({ ...prev, name: event.target.value }))}
              required
              disabled={!isConfigured}
            />
          </label>
          <label className="text-sm text-logica-purple">
            E-mail corporativo
            <input
              type="email"
              className={inputClass}
              value={form.email}
              onChange={(event) => setForm((prev) => ({ ...prev, email: event.target.value }))}
              required
              disabled={!isConfigured}
            />
          </label>
          <label className="text-sm text-logica-purple">
            Perfil de acesso
            <select
              className={inputClass}
              value={form.role}
              onChange={(event) => setForm((prev) => ({ ...prev, role: event.target.value as Role }))}
              disabled={!isConfigured}
            >
              <option value="master">Master</option>
              <option value="gestor">Gestor</option>
              <option value="financeiro">Financeiro</option>
            </select>
          </label>
          <div className="md:col-span-3 flex justify-end gap-3">
            <button
              type="reset"
              disabled={!isConfigured}
              className="rounded-full border border-logica-lilac px-4 py-2 text-sm text-logica-purple disabled:cursor-not-allowed disabled:opacity-70"
            >
              Limpar
            </button>
            <button
              type="submit"
              disabled={!isConfigured}
              className="rounded-full bg-logica-purple px-4 py-2 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-70"
            >
              Criar usuário
            </button>
          </div>
        </form>
      </section>

      <section className="rounded-2xl border border-logica-purple/10 bg-white/90 p-6 shadow-lg">
        <h2 className="text-lg font-semibold text-logica-purple">Usuários ativos</h2>
        {!isConfigured && (
          <p className="text-xs text-logica-lilac">
            Lista ilustrativa. Configure o Supabase para carregar usuários reais.
          </p>
        )}
        <table className="mt-4 min-w-full divide-y divide-logica-lilac/30 text-sm text-logica-purple">
          <thead className="bg-logica-light-lilac/60">
            <tr>
              <th className="px-3 py-2 text-left font-semibold">Nome</th>
              <th className="px-3 py-2 text-left font-semibold">E-mail</th>
              <th className="px-3 py-2 text-left font-semibold">Perfil</th>
              <th className="px-3 py-2 text-left font-semibold">Ações</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-logica-lilac/20">
            {mockUsers.map((row) => (
              <tr key={row.id} className="hover:bg-logica-light-lilac/40">
                <td className="px-3 py-2">{row.name}</td>
                <td className="px-3 py-2">{row.email}</td>
                <td className="px-3 py-2 capitalize">{row.role}</td>
                <td className="px-3 py-2">
                  <div className="flex gap-2">
                    <button className="rounded-full border border-logica-purple px-3 py-1 text-xs font-semibold text-logica-purple transition hover:bg-logica-purple hover:text-white">
                      Editar
                    </button>
                    <button className="rounded-full border border-red-200 px-3 py-1 text-xs font-semibold text-red-500 transition hover:bg-red-500 hover:text-white">
                      Remover
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
    </div>
  );
}
