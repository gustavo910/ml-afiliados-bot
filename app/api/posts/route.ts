import fs from "fs";
import path from "path";
import { NextResponse } from "next/server";
import { POSTS_DIR } from "@/lib/posts-path";
import { autoScheduleDraftsIfNeeded } from "@/lib/auto-schedule";

export const runtime = "nodejs";

function ensureDir() {
  if (!fs.existsSync(POSTS_DIR)) fs.mkdirSync(POSTS_DIR, { recursive: true });
}

export async function POST(req: Request) {
  const formData = await req.formData();
  const files = formData.getAll("files") as File[];

  ensureDir();

  for (const file of files) {
    const buffer = Buffer.from(await file.arrayBuffer());
    const filename = file.name;

    // ✅ Se for JSON, normaliza: sempre entra como draft (sem publishedAt)
    if (filename.toLowerCase().endsWith(".json")) {
      const raw = buffer.toString("utf-8");

      try {
        const data = JSON.parse(raw) as Record<string, unknown>;

        // força virar rascunho
        data.status = "draft";
        delete data.publishedAt;

        // opcional: garante title mínimo
        if (!data.title) data.title = filename.replace(/\.json$/i, "");

        fs.writeFileSync(
          path.join(POSTS_DIR, filename),
          JSON.stringify(data, null, 2),
          "utf-8"
        );

        continue;
      } catch {
        // se vier JSON inválido, salva cru mesmo (ou você pode retornar erro)
      }
    }

    // MD ou qualquer outro: salva como está
    fs.writeFileSync(path.join(POSTS_DIR, filename), buffer);
  }

  // ✅ Agora sim: agenda automaticamente 1 por dia
  const result = autoScheduleDraftsIfNeeded();

  return NextResponse.json({ success: true, ...result });
}
