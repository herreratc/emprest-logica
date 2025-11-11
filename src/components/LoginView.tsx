import { FormEvent, useState } from "react";
import { useAuth } from "../auth/AuthProvider";

export function LoginView() {
  const { signInWithEmail, signUpWithEmail, signInWithGoogle, isConfigured } = useAuth();
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

  const handleGoogle = async () => {
    setError(null);
    if (!isConfigured) {
      setError("Configure o Supabase para autenticar com Google.");
      return;
    }
    try {
      await signInWithGoogle();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro inesperado");
    }
  };

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-logica-deep-purple via-logica-purple to-logica-rose">
      <div className="mx-auto flex w-full max-w-md flex-col justify-center px-6 py-12 text-white">
        <div className="rounded-2xl bg-white/10 p-8 shadow-2xl backdrop-blur">
          <div className="mb-6 text-center">
            <img src="/logo.svg" alt="Lógica" className="mx-auto h-14 w-14" />
            <h1 className="mt-4 text-2xl font-semibold">Controle de Empréstimos</h1>
            <p className="text-sm text-logica-light-lilac">
              Acesse com sua conta master ou crie uma nova conta via Supabase.
            </p>
            {!isConfigured && (
              <p className="mt-2 text-xs text-yellow-200">
                Defina as variáveis VITE_SUPABASE_URL e VITE_SUPABASE_ANON_KEY para habilitar o login.
              </p>
            )}
          </div>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-xs uppercase tracking-wide text-logica-light-lilac">E-mail</label>
              <input
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                required
                disabled={!isConfigured}
                className="mt-1 w-full rounded-lg border border-logica-lilac/40 bg-white/90 px-3 py-2 text-logica-deep-purple focus:border-logica-rose focus:outline-none disabled:cursor-not-allowed disabled:opacity-70"
              />
            </div>
            <div>
              <label className="text-xs uppercase tracking-wide text-logica-light-lilac">Senha</label>
              <input
                type="password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                required
                disabled={!isConfigured}
                className="mt-1 w-full rounded-lg border border-logica-lilac/40 bg-white/90 px-3 py-2 text-logica-deep-purple focus:border-logica-rose focus:outline-none disabled:cursor-not-allowed disabled:opacity-70"
              />
            </div>
            {error && <p className="text-sm text-rose-200">{error}</p>}
            <button
              type="submit"
              disabled={loading || !isConfigured}
              className="w-full rounded-lg bg-logica-rose px-4 py-2 text-sm font-semibold text-white shadow-lg shadow-logica-rose/40 transition hover:bg-logica-purple disabled:cursor-not-allowed disabled:opacity-70"
            >
              {loading ? "Aguarde..." : mode === "login" ? "Entrar" : "Criar conta"}
            </button>
          </form>
          <div className="mt-6 space-y-3 text-center text-sm">
            <button
              onClick={handleGoogle}
              disabled={!isConfigured}
              className="w-full rounded-lg border border-white/30 px-4 py-2 font-medium transition hover:border-white/60 disabled:cursor-not-allowed disabled:opacity-70"
            >
              Entrar com Google
            </button>
            <button
              onClick={() => setMode(mode === "login" ? "signup" : "login")}
              className="text-logica-light-lilac underline hover:text-white"
            >
              {mode === "login" ? "Criar nova conta" : "Já tenho conta"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
