import { NextResponse } from "next/server";
import { normalizeCountry } from "@/lib/countries";
import { publishNextDuePost } from "@/lib/posts";

export async function GET(req: Request) {
  const url = new URL(req.url);
  const country = normalizeCountry(url.searchParams.get("country") ?? "de");

  const result = publishNextDuePost(country);
  return NextResponse.json({ ok: true, country, result });
}
