import { NextResponse, type NextRequest } from "next/server";

// Auth session refresh is handled client-side via supabase-js onAuthStateChange.
// This middleware is a passthrough so no @supabase/ssr dependency is needed.
export async function updateSession(request: NextRequest) {
  return NextResponse.next({ request });
}
