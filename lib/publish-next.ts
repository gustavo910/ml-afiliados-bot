import fs from "fs";
import path from "path";
import { POSTS_DIR } from "@/lib/posts-path";

type JsonPost = {
  status?: "draft" | "scheduled" | "published";
  publishedAt?: string; // YYYY-MM-DD
  [key: string]: unknown;
};

function ensureDir() {
  if (!fs.existsSync(POSTS_DIR)) fs.mkdirSync(POSTS_DIR, { recursive: true });
}

function isValidYmd(s?: string) {
  return !!s && /^\d{4}-\d{2}-\d{2}$/.test(s);
}

function todayYmdUTC() {
  const now = new Date();
  const y = now.getUTCFullYear();
  const m = String(now.getUTCMonth() + 1).padStart(2, "0");
  const d = String(now.getUTCDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

export function publishNextDuePost() {
  ensureDir();

  const today = todayYmdUTC();

  const jsonFiles = fs
    .readdirSync(POSTS_DIR)
    .filter((f) => f.toLowerCase().endsWith(".json"));

  const due: { filename: string; filePath: string; data: JsonPost }[] = [];

  for (const filename of jsonFiles) {
    const filePath = path.join(POSTS_DIR, filename);
    const raw = fs.readFileSync(filePath, "utf-8");

    let data: JsonPost;
    try {
      data = JSON.parse(raw) as JsonPost;
    } catch {
      continue;
    }

    if (data.status !== "scheduled") continue;
    if (!isValidYmd(data.publishedAt)) continue;

    // se publishedAt <= hoje, está “na hora”
    if (data.publishedAt! <= today) {
      due.push({ filename, filePath, data });
    }
  }

  // nada pra publicar hoje
  if (due.length === 0) return { published: false };

  // pega o mais antigo (menor publishedAt); desempata por filename
  due.sort((a, b) => {
    const d = (a.data.publishedAt!).localeCompare(b.data.publishedAt!);
    return d !== 0 ? d : a.filename.localeCompare(b.filename);
  });

  const next = due[0];

  next.data.status = "published";

  fs.writeFileSync(next.filePath, JSON.stringify(next.data, null, 2), "utf-8");

  return { published: true, slug: next.filename.replace(/\.json$/i, ""), publishedAt: next.data.publishedAt };
}
