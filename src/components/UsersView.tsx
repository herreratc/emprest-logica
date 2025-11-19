import { useState } from "react";
import { clsx } from "clsx";
import { useAuth } from "../auth/AuthProvider";
import { hasSupabaseAdmin, hasSupabaseConfig, supabaseAdmin } from "../supabaseClient";

const inputClass =
  "w-full rounded-xl border border-logica-lilac/40 bg-white px-4 py-2 text-sm text-logica-purple focus:border-logica-purple focus:outline-none";

type FeedbackState = { type: "success" | "error"; message: string } | null;

export function UsersView() {
  const { user, signOut, isConfigured } = useAuth();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [feedback, setFeedback] = useState<FeedbackState>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (isSubmitting) return;

    const trimmedName = name.trim();
    const trimmedEmail = email.trim().toLowerCase();

    if (!trimmedName || !trimmedEmail) {
      setFeedback({ type: "error", message: "Informe nome e e-mail corporativo." });
      return;
    }

    if (!isConfigured || !hasSupabaseConfig) {
      setFeedback({
        type: "error",
        message: "Configure o Supabase para enviar solicitações de criação de usuário."
      });
      return;
    }

    if (!hasSupabaseAdmin || !supabaseAdmin) {
      setFeedback({
        type: "error",
        message: "Inclua a chave service role do Supabase para enviar o convite por e-mail."
      });
      return;
    }

    setIsSubmitting(true);
    setFeedback(null);

    const { error } = await supabaseAdmin.auth.admin.inviteUserByEmail(trimmedEmail, {
      data: { name: trimmedName }
    });

    if (error) {
      setFeedback({ type: "error", message: error.message });
      setIsSubmitting(false);
      return;
    }

    setFeedback({
      type: "success",
      message:
        "Solicitação enviada ao Supabase. Você pode aprovar ou desativar o acesso diretamente pelo painel de usuários."
    });
    setName("");
    setEmail("");
    setIsSubmitting(false);
  };

  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-semibold text-logica-purple">Convites de usuário</h1>
          <p className="text-sm text-logica-lilac">
            Crie uma solicitação e finalize a ativação ou bloqueio diretamente no Supabase via e-mail.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={() => setFeedback(null)}
            className="rounded-full border border-logica-lilac px-4 py-2 text-sm font-medium text-logica-purple"
            type="button"
          >
            Limpar mensagens
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

      {!isConfigured && (
        <div className="rounded-2xl border border-yellow-200 bg-yellow-50 p-4 text-sm text-yellow-800">
          Modo demonstração: configure o Supabase e a service role para enviar os convites por e-mail.
        </div>
      )}

      {feedback && (
        <div
          className={clsx(
            "rounded-2xl border p-4 text-sm",
            feedback.type === "success"
              ? "border-emerald-200 bg-emerald-50 text-emerald-700"
              : "border-red-200 bg-red-50 text-red-700"
          )}
        >
          {feedback.message}
        </div>
      )}

      <section className="rounded-2xl border border-logica-purple/20 bg-white/90 p-6 shadow-lg">
        <h2 className="text-lg font-semibold text-logica-purple">Solicitar criação de usuário</h2>
        <p className="text-sm text-logica-lilac">
          Clique em salvar para que o Supabase envie o e-mail de convite. Depois, ative ou desative o acesso diretamente
          pelo painel de autenticação.
        </p>

        <form
          onSubmit={(event) => {
            event.preventDefault();
            handleSubmit();
          }}
          className="mt-4 grid gap-4 md:grid-cols-2"
        >
          <label className="text-sm text-logica-purple">
            Nome completo
            <input
              className={inputClass}
              value={name}
              onChange={(event) => setName(event.target.value)}
              disabled={isSubmitting}
              required
            />
          </label>
          <label className="text-sm text-logica-purple">
            E-mail corporativo
            <input
              type="email"
              className={inputClass}
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              disabled={isSubmitting}
              required
            />
          </label>
          <div className="md:col-span-2 flex justify-end gap-3">
            <button
              type="button"
              onClick={() => {
                setName("");
                setEmail("");
                setFeedback(null);
              }}
              className="rounded-full border border-logica-lilac px-4 py-2 text-sm text-logica-purple"
              disabled={isSubmitting}
            >
              Limpar
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className={clsx(
                "rounded-full bg-logica-purple px-4 py-2 text-sm font-semibold text-white shadow transition",
                isSubmitting && "cursor-not-allowed opacity-60"
              )}
            >
              {isSubmitting ? "Enviando..." : "Salvar e enviar convite"}
            </button>
          </div>
        </form>
      </section>
    </div>
  );
}
