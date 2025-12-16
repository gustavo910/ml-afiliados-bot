import { NextResponse } from "next/server";
import { publishNextDuePost } from "@/lib/posts";

export async function GET() {
  const result = publishNextDuePost();
  return NextResponse.json({ ok: true, result });
}
