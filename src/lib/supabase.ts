import { createClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn(
    "Supabase env vars missing (VITE_SUPABASE_URL, VITE_SUPABASE_ANON_KEY). Feedback nu va fi salvat."
  );
}

export const supabase =
  supabaseUrl && supabaseAnonKey ? createClient(supabaseUrl, supabaseAnonKey) : null;

/** Tabelul în care aterizează un formular trimis. Vezi supabase/migrations/. */
export const FEEDBACK_TABLE = "feedback_intern_21";
