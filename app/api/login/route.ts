import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";

const ADMIN_USER = "admin";

// cole aqui o hash que você gerou no passo 2
const ADMIN_PASS_HASH =
  "$2b$12$fyM/OoAD2wSg9us/4IK/PeoGLDgOxvWfJypM/n/8jFGq3cfK9nomK";

export async function POST(req: Request) {
  const body = (await req.json()) as { username?: string; password?: string };

  const username = (body.username ?? "").trim();
  const password = body.password ?? "";

  if (username !== ADMIN_USER) {
    return NextResponse.json({ ok: false }, { status: 401 });
  }

  const ok = await bcrypt.compare(password, ADMIN_PASS_HASH);
  if (!ok) {
    return NextResponse.json({ ok: false }, { status: 401 });
  }

  const res = NextResponse.json({ ok: true });

  res.cookies.set("admin_ok", "1", {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 7,
    secure: process.env.NODE_ENV === "production",
  });

  return res;
}
