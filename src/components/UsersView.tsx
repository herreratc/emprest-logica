import { useEffect, useMemo, useState } from "react";
import { clsx } from "clsx";
import { useAuth } from "../auth/AuthProvider";
import { type UpsertUserProfileInput, type UserProfile, useSupabaseUsers } from "../hooks/useSupabaseUsers";

const inputClass =
  "w-full rounded-xl border border-logica-lilac/40 bg-white px-4 py-2 text-sm text-logica-purple focus:border-logica-purple focus:outline-none";

const initialForm = { name: "", email: "", password: "" };

type FeedbackState = { type: "success" | "error"; message: string } | null;

export function UsersView() {
  const { user, signOut, isConfigured } = useAuth();
  const { users, loading, error, isUsingSupabase, canManagePasswords, refresh, saveUser, deleteUser } =
    useSupabaseUsers();

  const [editing, setEditing] = useState<UserProfile | null>(null);
  const [form, setForm] = useState(initialForm);
  const [feedback, setFeedback] = useState<FeedbackState>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    if (editing) {
      setForm({ name: editing.name, email: editing.email, password: "" });
    } else {
      setForm(initialForm);
    }
  }, [editing]);

  const totalUsersLabel = useMemo(() => {
    if (users.length === 0) return "Nenhum usuário cadastrado";
    if (users.length === 1) return "1 usuário cadastrado";
    return `${users.length} usuários cadastrados`;
  }, [users.length]);

  const handleCreate = () => {
    setEditing(null);
    setForm(initialForm);
    setFeedback(null);
  };

  const handleEdit = (profile: UserProfile) => {
    setEditing(profile);
    setFeedback(null);
  };

  const handleSubmit = async () => {
    if (isSaving) return;

    const trimmedName = form.name.trim();
    const trimmedEmail = form.email.trim().toLowerCase();
    const trimmedPassword = form.password.trim();

    if (!trimmedName || !trimmedEmail) {
      setFeedback({ type: "error", message: "Informe nome e e-mail corporativo." });
      return;
    }

    if (!editing && trimmedPassword.length < 6) {
      setFeedback({ type: "error", message: "Defina uma senha com pelo menos 6 caracteres." });
      return;
    }

    setIsSaving(true);
    setFeedback(null);

    const payload: UpsertUserProfileInput = {
      ...(editing ? { id: editing.id, userId: editing.userId } : { userId: null }),
      name: trimmedName,
      email: trimmedEmail,
      password: editing ? (form.password ? trimmedPassword : undefined) : trimmedPassword
    };

    const result = await saveUser(payload);

    if (!result.success) {
      setFeedback({ type: "error", message: result.error });
      setIsSaving(false);
      return;
    }

    setFeedback({
      type: "success",
      message: editing ? "Usuário atualizado com sucesso." : "Usuário cadastrado com sucesso."
    });
    setEditing(result.data);
    setForm((prev) => ({ ...prev, password: "" }));
    setIsSaving(false);
  };

  const handleDelete = async (profile: UserProfile) => {
    if (isDeleting) return;
    const confirmed = window.confirm(`Confirma a remoção do usuário ${profile.name}?`);
    if (!confirmed) return;

    setIsDeleting(true);
    setFeedback(null);

    const result = await deleteUser(profile);

    if (!result.success) {
      setFeedback({ type: "error", message: result.error });
      setIsDeleting(false);
      return;
    }

    setFeedback({ type: "success", message: "Usuário removido com sucesso." });
    setIsDeleting(false);
    setEditing((current) => (current?.id === profile.id ? null : current));
  };

  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-semibold text-logica-purple">Usuários</h1>
          <p className="text-sm text-logica-lilac">Gerencie acessos via autenticação do Supabase.</p>
          <p className="text-xs text-logica-lilac">{totalUsersLabel}</p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={refresh}
            className="rounded-full border border-logica-lilac px-4 py-2 text-sm font-medium text-logica-purple"
            type="button"
          >
            Atualizar
          </button>
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
        </div>
      </header>

      {!isUsingSupabase && (
        <div className="rounded-2xl border border-yellow-200 bg-yellow-50 p-4 text-sm text-yellow-800">
          Modo demonstração: configure as variáveis do Supabase para que os cadastros sejam persistidos.
        </div>
      )}

      {error && (
        <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          Falha ao carregar usuários: {error}
          <button
            onClick={refresh}
            className="ml-4 rounded-full bg-logica-purple px-3 py-1 text-xs font-semibold text-white"
            type="button"
          >
            Tentar novamente
          </button>
        </div>
      )}

      <section className="rounded-2xl border border-logica-purple/10 bg-white/90 p-6 shadow-lg">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-logica-purple">Usuários ativos</h2>
          <button
            onClick={handleCreate}
            className="rounded-full bg-logica-rose px-4 py-2 text-sm font-semibold text-white shadow"
            type="button"
          >
            Novo usuário
          </button>
        </div>
        {loading ? (
          <p className="text-sm text-logica-lilac">Carregando usuários...</p>
        ) : users.length === 0 ? (
          <p className="text-sm text-logica-lilac">Nenhum usuário cadastrado até o momento.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-logica-lilac/30 text-sm text-logica-purple">
              <thead className="bg-logica-light-lilac/60">
                <tr>
                  <th className="px-3 py-2 text-left font-semibold">Nome</th>
                  <th className="px-3 py-2 text-left font-semibold">E-mail</th>
                  <th className="px-3 py-2 text-left font-semibold">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-logica-lilac/20">
                {users.map((profile) => (
                  <tr key={profile.id} className="hover:bg-logica-light-lilac/40">
                    <td className="px-3 py-2">{profile.name}</td>
                    <td className="px-3 py-2">{profile.email}</td>
                    <td className="px-3 py-2">
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleEdit(profile)}
                          className={clsx(
                            "rounded-full border px-3 py-1 text-xs font-semibold transition",
                            editing?.id === profile.id
                              ? "border-logica-purple bg-logica-purple text-white"
                              : "border-logica-purple text-logica-purple hover:bg-logica-purple hover:text-white"
                          )}
                          type="button"
                        >
                          Editar
                        </button>
                        <button
                          onClick={() => handleDelete(profile)}
                          disabled={isDeleting}
                          className={clsx(
                            "rounded-full border px-3 py-1 text-xs font-semibold transition",
                            isDeleting
                              ? "cursor-not-allowed border-red-200 bg-red-100 text-red-300"
                              : "border-red-200 text-red-600 hover:bg-red-500 hover:text-white"
                          )}
                          type="button"
                        >
                          Remover
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <section className="rounded-2xl border border-logica-purple/20 bg-white/90 p-6 shadow-lg">
        <h2 className="text-lg font-semibold text-logica-purple">
          {editing ? `Editar ${editing.name}` : "Cadastrar novo usuário"}
        </h2>
        <p className="text-sm text-logica-lilac">
          {isUsingSupabase
            ? "As alterações são sincronizadas com a tabela user_profiles do seu projeto Supabase."
            : "Sem Supabase configurado, as alterações ficam apenas na sessão atual."}
        </p>
        {isUsingSupabase && (
          <p className="mt-2 text-xs text-logica-lilac">
            {canManagePasswords
              ? "As senhas cadastradas aqui são sincronizadas imediatamente com o Supabase."
              : "Cadastros de senha requerem a variável VITE_SUPABASE_SERVICE_ROLE_KEY com a chave service role do seu projeto."}
          </p>
        )}
        {!canManagePasswords && isUsingSupabase && (
          <p className="mt-1 text-xs text-rose-500">
            Sem a chave service role do Supabase não é possível criar ou alterar senhas de acesso.
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
        <form
          onSubmit={(event) => {
            event.preventDefault();
            handleSubmit();
          }}
          className="mt-4 grid gap-4 md:grid-cols-3"
        >
          <label className="text-sm text-logica-purple">
            Nome
            <input
              className={inputClass}
              value={form.name}
              onChange={(event) => setForm((prev) => ({ ...prev, name: event.target.value }))}
              disabled={isSaving || isDeleting}
              required
            />
          </label>
          <label className="text-sm text-logica-purple">
            E-mail corporativo
            <input
              type="email"
              className={inputClass}
              value={form.email}
              onChange={(event) => setForm((prev) => ({ ...prev, email: event.target.value }))}
              disabled={isSaving || isDeleting}
              required
            />
          </label>
          <label className="text-sm text-logica-purple">
            {editing ? "Nova senha" : "Senha inicial"}
            <input
              type="password"
              className={inputClass}
              value={form.password}
              onChange={(event) => setForm((prev) => ({ ...prev, password: event.target.value }))}
              disabled={isSaving || isDeleting}
              placeholder={editing ? "Deixe em branco para manter" : "Informe uma senha segura"}
              required={!editing}
              minLength={6}
            />
          </label>
          <div className="md:col-span-3 flex justify-end gap-3">
            {editing && (
              <button
                type="button"
                onClick={() => editing && handleDelete(editing)}
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
