import { NextResponse } from "next/server";

const ADMIN_PASSWORD = "senha123";

export async function POST(req: Request) {
  const { password } = (await req.json()) as { password?: string };

  if (password !== ADMIN_PASSWORD) {
    return NextResponse.json({ ok: false }, { status: 401 });
  }

  const res = NextResponse.json({ ok: true });
  res.cookies.set("admin_ok", "1", {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 7,
  });
  return res;
}
