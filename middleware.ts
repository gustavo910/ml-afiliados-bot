import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
console.log("[MIDDLEWARE]", pathname);
  // libera tela de login e endpoint de login
  if (pathname === "/admin/login" || pathname.startsWith("/api/login")) {
    return NextResponse.next();
  }

  // protege tudo em /admin/*
  if (pathname.startsWith("/admin")) {
    const ok = req.cookies.get("admin_ok")?.value === "1";

    if (!ok) {
      const url = req.nextUrl.clone();
      url.pathname = "/admin/login";
      url.searchParams.set("next", pathname);
      return NextResponse.redirect(url);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*"],
};
