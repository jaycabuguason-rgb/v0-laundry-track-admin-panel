import { createClient as _createClient } from "@supabase/supabase-js";

// Server-side client — uses the same anon key but is created fresh per call.
// Cookie-based session persistence is not needed here since auth is managed
// client-side via createClient() in lib/supabase/client.ts.
export async function createClient() {
  return _createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}
