import { createClient as createSupabaseClient } from "@supabase/supabase-js";

// Server-side client using the anon key.
// Auth state is managed client-side via @supabase/supabase-js sessions.
export async function createClient() {
  return createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}
