import { FormEvent, useState } from "react";
import { useAuth } from "../auth/AuthProvider";

export function LoginView() {
  const { signInWithEmail, signUpWithEmail, isConfigured } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [mode, setMode] = useState<"login" | "signup">("login");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    if (!isConfigured) {
      setError("Configure o Supabase para realizar login.");
      return;
    }
    setLoading(true);
    try {
      if (mode === "login") {
        await signInWithEmail(email, password);
      } else {
        await signUpWithEmail(email, password);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro inesperado");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-logica-deep-purple via-logica-purple to-logica-rose">
      <div className="mx-auto flex w-full max-w-5xl flex-col justify-center px-6 py-12 text-white">
        <div className="grid items-center gap-8 rounded-3xl border border-white/15 bg-white/5 p-8 shadow-2xl backdrop-blur md:grid-cols-[1.1fr_0.9fr]">
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="rounded-2xl bg-white/90 p-3 shadow-lg shadow-black/10">
                <img src="/logo.svg" alt="Lógica" className="h-12 w-12" />
              </div>
              <div>
                <p className="text-sm uppercase tracking-[0.2em] text-white/80">Logística financeira</p>
                <h1 className="text-3xl font-semibold leading-tight">Portal de empréstimos e consórcios</h1>
              </div>
            </div>
            <p className="text-sm text-white/80">
              Centralize cadastros, acompanhe parcelas e mantenha os dados sincronizados via Supabase. Crie sua conta
              administrativa ou acesse com as credenciais já configuradas.
            </p>
            <div className="grid gap-3 sm:grid-cols-2">
              {["Acesso seguro por e-mail", "Painéis com indicadores", "Fluxo de parcelas em destaque", "Cadastro de empresas, contratos e usuários"].map((item) => (
                <div
                  key={item}
                  className="rounded-xl border border-white/15 bg-white/10 px-3 py-2 text-sm font-medium text-white/90 shadow-inner shadow-black/10"
                >
                  {item}
                </div>
              ))}
            </div>
            {!isConfigured && (
              <div className="flex items-start gap-3 rounded-xl border border-yellow-200/50 bg-yellow-100/10 p-3 text-sm text-yellow-50">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  className="mt-0.5 h-5 w-5"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 16.5h.007" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M10.125 3.75 3 18.75h18l-7.125-15" />
                </svg>
                <div>
                  <p className="font-semibold">Variáveis de ambiente pendentes</p>
                  <p className="text-white/80">
                    Defina VITE_SUPABASE_URL e VITE_SUPABASE_ANON_KEY para habilitar login e criação de contas direto no
                    Supabase.
                  </p>
                </div>
              </div>
            )}
          </div>

          <div className="rounded-2xl bg-white p-6 text-logica-deep-purple shadow-xl">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-xl font-semibold text-logica-purple">
                {mode === "login" ? "Entrar" : "Criar conta"}
              </h2>
              <div className="rounded-full bg-logica-light-lilac px-3 py-1 text-xs font-semibold text-logica-purple">
                Acesso via Supabase
              </div>
            </div>
            <div className="mb-4 grid grid-cols-2 rounded-lg border border-logica-light-lilac bg-logica-light-lilac/60 text-sm font-semibold">
              <button
                type="button"
                onClick={() => setMode("login")}
                className={`rounded-md px-3 py-2 transition ${
                  mode === "login" ? "bg-white text-logica-purple shadow" : "text-logica-deep-purple/70"
                }`}
              >
                Já tenho acesso
              </button>
              <button
                type="button"
                onClick={() => setMode("signup")}
                className={`rounded-md px-3 py-2 transition ${
                  mode === "signup" ? "bg-white text-logica-purple shadow" : "text-logica-deep-purple/70"
                }`}
              >
                Criar conta
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-semibold uppercase tracking-wide text-logica-purple">E-mail</label>
                <input
                  type="email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  required
                  disabled={!isConfigured}
                  className="w-full rounded-lg border border-logica-light-lilac px-3 py-2 text-logica-deep-purple shadow-sm focus:border-logica-rose focus:outline-none disabled:cursor-not-allowed disabled:opacity-70"
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-semibold uppercase tracking-wide text-logica-purple">Senha</label>
                <input
                  type="password"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  required
                  disabled={!isConfigured}
                  className="w-full rounded-lg border border-logica-light-lilac px-3 py-2 text-logica-deep-purple shadow-sm focus:border-logica-rose focus:outline-none disabled:cursor-not-allowed disabled:opacity-70"
                />
              </div>
              {error && <p className="text-sm text-rose-600">{error}</p>}
              <button
                type="submit"
                disabled={loading || !isConfigured}
                className="flex w-full items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-logica-purple to-logica-rose px-4 py-2 text-sm font-semibold text-white shadow-lg shadow-logica-rose/30 transition hover:brightness-105 disabled:cursor-not-allowed disabled:opacity-70"
              >
                {loading ? "Autenticando..." : mode === "login" ? "Entrar" : "Cadastrar"}
              </button>
              <p className="text-xs text-logica-deep-purple/70">
                Apenas autenticação por e-mail e senha está habilitada. As credenciais são armazenadas diretamente no
                Supabase.
              </p>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
