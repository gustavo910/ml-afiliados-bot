import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { normalizeCountry, type Country } from "@/lib/countries";

const ADMIN_USER = "admin";
const HASH = "$2b$12$fyM/OoAD2wSg9us/4IK/PeoGLDgOxvWfJypM/n/8jFGq3cfK9nomK";

// ✅ mesmo hash pra todos (por enquanto)
const ADMIN_BY_COUNTRY: Record<Country, { user: string; hash: string }> = {
  de: { user: ADMIN_USER, hash: HASH },
  gb: { user: ADMIN_USER, hash: HASH },
  ch: { user: ADMIN_USER, hash: HASH },
  nl: { user: ADMIN_USER, hash: HASH },
  dk: { user: ADMIN_USER, hash: HASH },
};

export async function POST(req: Request, ctx: { params: { locale: string } }) {
  const country = normalizeCountry(ctx.params.locale);

  const body = (await req.json()) as { username?: string; password?: string };
  const username = (body.username ?? "").trim();
  const password = body.password ?? "";

  const cfg = ADMIN_BY_COUNTRY[country];

  if (username !== cfg.user) {
    return NextResponse.json({ ok: false }, { status: 401 });
  }

  const ok = await bcrypt.compare(password, cfg.hash);
  if (!ok) {
    return NextResponse.json({ ok: false }, { status: 401 });
  }

  const res = NextResponse.json({ ok: true });

  res.cookies.set(`admin_ok_${country}`, "1", {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 7,
    secure: process.env.NODE_ENV === "production",
  });

  return res;
}
