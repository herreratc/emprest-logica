import { createClient, type SupabaseClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string | undefined;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined;

export const hasSupabaseConfig = Boolean(supabaseUrl && supabaseAnonKey);

let client: SupabaseClient | null = null;

if (hasSupabaseConfig) {
  client = createClient(supabaseUrl!, supabaseAnonKey!);
} else {
  console.warn(
    "Supabase URL e chave anônima não configuradas. Configure as variáveis VITE_SUPABASE_URL e VITE_SUPABASE_ANON_KEY."
  );
}

export const supabase = client;
