import { createClient, type SupabaseClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string | undefined;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined;
const supabaseServiceRoleKey = import.meta.env.VITE_SUPABASE_SERVICE_ROLE_KEY as string | undefined;

export const hasSupabaseConfig = Boolean(supabaseUrl && supabaseAnonKey);

let client: SupabaseClient | null = null;
let adminClient: SupabaseClient | null = null;

if (hasSupabaseConfig) {
  client = createClient(supabaseUrl!, supabaseAnonKey!);
} else {
  console.warn(
    "Supabase URL e chave anônima não configuradas. Configure as variáveis VITE_SUPABASE_URL e VITE_SUPABASE_ANON_KEY."
  );
}

if (hasSupabaseConfig && supabaseServiceRoleKey) {
  adminClient = createClient(supabaseUrl!, supabaseServiceRoleKey!, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  });
} else if (!supabaseServiceRoleKey) {
  console.warn(
    "Chave de service role do Supabase não configurada. Defina VITE_SUPABASE_SERVICE_ROLE_KEY para habilitar o gerenciamento de senhas."
  );
}

export const supabase = client;
export const supabaseAdmin = adminClient;
export const hasSupabaseAdmin = Boolean(adminClient);
