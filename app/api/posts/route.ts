import { NextResponse } from "next/server";
import { normalizeCountry } from "@/lib/countries";
import { getAllPosts } from "@/lib/posts";

export const runtime = "nodejs";

export async function GET(req: Request) {
  const url = new URL(req.url);
  const country = normalizeCountry(url.searchParams.get("country") ?? "de");

  const posts = getAllPosts(country)
    .filter((p) => p.raw.trim().startsWith("{"))
    .map((p) => {
      const data = JSON.parse(p.raw) ;

      return {
        id: p.slug,
        slug: p.slug,
        title: data.title ?? p.title,
        status: data.status ?? p.status,
        publishedAt: data.publishedAt ?? p.publishedAt,
        excerpt: data.excerpt ?? "",
        cardImageUrl: data.cardImageUrl ?? data.heroImageUrl ?? null,
        cardImageAlt: data.cardImageAlt ?? data.heroImageAlt ?? (data.title ?? p.title),
      };
    });

  return NextResponse.json(posts);
}
