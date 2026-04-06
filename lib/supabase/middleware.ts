import { NextResponse, type NextRequest } from "next/server";

// Session is managed client-side via supabase.auth.onAuthStateChange in app/page.tsx.
// This middleware simply passes all requests through without requiring @supabase/ssr.
export function updateSession(request: NextRequest) {
  return NextResponse.next({ request });
}
