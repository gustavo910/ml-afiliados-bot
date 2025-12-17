import { NextResponse } from "next/server";
import { normalizeCountry } from "@/lib/countries";
import { getPublishedPostsDue } from "@/lib/posts";

export const runtime = "nodejs";
export const revalidate = 3600; // 1h (ajuste como quiser)

function getBaseUrl(req: Request) {
  const url = new URL(req.url);
  const proto = req.headers.get("x-forwarded-proto") ?? url.protocol.replace(":", "") ?? "http";
  const host = req.headers.get("x-forwarded-host") ?? req.headers.get("host") ?? url.host;
  return `${proto}://${host}`;
}

function xmlEscape(s: string) {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

export async function GET(req: Request, ctx: { params: { locale: string } }) {
  const country = normalizeCountry(ctx.params.locale);
  const base = getBaseUrl(req);

  const posts = getPublishedPostsDue(country);

  const urls = posts
    .map((p) => {
      const loc = `${base}/${country}/${p.slug}`; // ✅ rota do seu (posts) group = /{locale}/{slug}
      const lastmod = p.publishedAt ? `<lastmod>${p.publishedAt}</lastmod>` : "";
      return `<url><loc>${xmlEscape(loc)}</loc>${lastmod}</url>`;
    })
    .join("");

  const xml =
    `<?xml version="1.0" encoding="UTF-8"?>` +
    `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">` +
    urls +
    `</urlset>`;

  return new NextResponse(xml, {
    headers: { "Content-Type": "application/xml; charset=utf-8" },
  });
}
