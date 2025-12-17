// src/app/api/logout/[country]/route.ts
import { NextResponse } from "next/server";
import { normalizeCountry } from "@/lib/countries";

export async function POST(_req: Request, ctx: { params: { country: string } }) {
  const country = normalizeCountry(ctx.params.country);

  const res = NextResponse.json({ ok: true });

  res.cookies.set(`admin_ok_${country}`, "", {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: 0,
    secure: process.env.NODE_ENV === "production",
  });

  return res;
}
