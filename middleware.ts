// middleware.ts
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import {
  COUNTRIES,
  DEFAULT_COUNTRY,
  getCountryFromHost,
  normalizeCountry,
} from "@/lib/countries";

function hasCountryPrefix(pathname: string) {
  return COUNTRIES.some((c) => pathname === `/${c}` || pathname.startsWith(`/${c}/`));
}

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // libera next internals + api
  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/api") ||
    pathname === "/favicon.ico"
  ) {
    return NextResponse.next();
  }

  // ✅ libera /{locale}/login...
  const loginMatch = pathname.match(/^\/([a-z]{2})\/login(\/|$)/i);
  if (loginMatch) return NextResponse.next();

  // país inferido por host (quando usar domínios)
  const host = req.headers.get("host");
  const inferredCountry = normalizeCountry(getCountryFromHost(host) ?? DEFAULT_COUNTRY);

  // ✅ protege /{locale}/admin...
  const adminMatch = pathname.match(/^\/([a-z]{2})\/admin(\/|$)/i);
  if (adminMatch) {
    const country = normalizeCountry(adminMatch[1]);

    const ok = req.cookies.get(`admin_ok_${country}`)?.value === "1";
    if (!ok) {
      const url = req.nextUrl.clone();

      // ✅ SUA ROTA DE LOGIN É /{country}/login (porque você tem app/[locale]/login/page.tsx)
      url.pathname = `/${country}/login`;

      const safeNext =
        pathname === `/${country}/admin` || pathname === `/${country}/admin/`
          ? `/${country}/admin/posts`
          : pathname;

      url.searchParams.set("next", safeNext);
      return NextResponse.redirect(url);
    }

    return NextResponse.next();
  }

  // ✅ garante prefixo /{country} nas rotas públicas
  if (!hasCountryPrefix(pathname)) {
    const url = req.nextUrl.clone();
    url.pathname = `/${inferredCountry}${pathname === "/" ? "" : pathname}`;
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
