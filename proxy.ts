import { type NextRequest, NextResponse } from "next/server";

// Session is managed client-side via supabase.auth.onAuthStateChange in app/page.tsx.
// This proxy passes all requests through — no @supabase/ssr dependency needed.
export function proxy(request: NextRequest) {
  return NextResponse.next({ request });
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
