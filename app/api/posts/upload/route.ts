import fs from "fs";
import path from "path";
import { NextResponse } from "next/server";
import { normalizeCountry, DEFAULT_COUNTRY } from "@/lib/countries";
import { getPostsDirForWrite } from "@/lib/posts-path";

export const runtime = "nodejs";

function slugFromFilename(name: string) {
  return name
    .replace(/\.(json|md)$/i, "")
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9\- ]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}

function getCountryFromRequest(req: Request, formData?: FormData) {
  const url = new URL(req.url);

  const fromForm = String(formData?.get("country") ?? "").trim();
  const fromQuery = String(url.searchParams.get("country") ?? "").trim();
  const fromHeader = String(req.headers.get("x-country") ?? "").trim();

  return normalizeCountry(fromForm || fromQuery || fromHeader || DEFAULT_COUNTRY);
}

export async function POST(req: Request) {
  const formData = await req.formData();
  const country = getCountryFromRequest(req, formData);

  const files = formData.getAll("files").filter((v): v is File => v instanceof File);
  if (!files.length) {
    return NextResponse.json({ ok: false, message: "Nenhum arquivo enviado" }, { status: 400 });
  }

  // ✅ SEMPRE salva em content/{country}/posts
  const dir = getPostsDirForWrite(country);

  const saved: string[] = [];

  for (const file of files) {
    const name = file.name.toLowerCase();
    if (!name.endsWith(".md") && !name.endsWith(".json")) continue;

    const buffer = Buffer.from(await file.arrayBuffer());
    const raw = buffer.toString("utf-8");

    const slug = slugFromFilename(file.name);
    const ext = name.endsWith(".md") ? ".md" : ".json";
    const outPath = path.join(dir, `${slug}${ext}`);

    if (ext === ".json") {
      try {
        const data = JSON.parse(raw) as Record<string, unknown>;
        data.status = "draft";
        delete (data).publishedAt;
        if (!data.title) data.title = slug;

        fs.writeFileSync(outPath, JSON.stringify(data, null, 2), "utf-8");
      } catch {
        fs.writeFileSync(outPath, raw, "utf-8");
      }
    } else {
      fs.writeFileSync(outPath, buffer);
    }

    // (Opcional) se existir legacy, apaga pra não confundir
    const legacyPath = path.join(process.cwd(), "content", "posts", `${slug}${ext}`);
    if (fs.existsSync(legacyPath)) {
      try { fs.unlinkSync(legacyPath); } catch {}
    }

    saved.push(slug);
  }

  return NextResponse.json({ ok: true, country, saved, dir });
}
