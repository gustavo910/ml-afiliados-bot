import fs from "fs";
import path from "path";
import { POSTS_DIR } from "@/lib/posts-path";

type PostStatus = "draft" | "scheduled" | "published";

type JsonPost = {
  title?: string;
  status?: PostStatus;
  publishedAt?: string; // "YYYY-MM-DD"
  createdAt?: string;
  content?: unknown;
  [key: string]: unknown;
};

function ensureDir() {
  if (!fs.existsSync(POSTS_DIR)) fs.mkdirSync(POSTS_DIR, { recursive: true });
}

function isJsonFile(name: string) {
  return name.toLowerCase().endsWith(".json");
}

function toSlug(filename: string) {
  return filename.replace(/\.json$/i, "");
}

function isValidYmd(s?: string) {
  return !!s && /^\d{4}-\d{2}-\d{2}$/.test(s);
}

function parseYmd(s: string) {
  // cria Date no UTC pra evitar "voltar um dia" por timezone
  const [y, m, d] = s.split("-").map(Number);
  return new Date(Date.UTC(y, m - 1, d));
}

function formatYmdUTC(date: Date) {
  const y = date.getUTCFullYear();
  const m = String(date.getUTCMonth() + 1).padStart(2, "0");
  const d = String(date.getUTCDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

function addDaysUTC(date: Date, days: number) {
  const d = new Date(date);
  d.setUTCDate(d.getUTCDate() + days);
  return d;
}

function tomorrowUTC() {
  const now = new Date();
  const t = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));
  return addDaysUTC(t, 1);
}

type DraftFile = {
  filename: string;
  filePath: string;
  data: JsonPost;
};

export function autoScheduleDraftsIfNeeded() {
  ensureDir();

  const files = fs.readdirSync(POSTS_DIR).filter(isJsonFile);

  let maxScheduledOrPublished: Date | null = null;
  const draftsToSchedule: DraftFile[] = [];

  for (const filename of files) {
    const filePath = path.join(POSTS_DIR, filename);
    const raw = fs.readFileSync(filePath, "utf-8");

    let data: JsonPost;
    try {
      data = JSON.parse(raw) as JsonPost;
    } catch {
      // se JSON inválido, ignora (ou você pode lançar erro)
      continue;
    }

    const status = (data.status ?? "draft") as PostStatus;

    // Já tem data? considera pra "última data ocupada"
    if ((status === "scheduled" || status === "published") && isValidYmd(data.publishedAt)) {
      const dt = parseYmd(data.publishedAt!);
      if (!maxScheduledOrPublished || dt > maxScheduledOrPublished) {
        maxScheduledOrPublished = dt;
      }
      continue;
    }

    // rascunho sem publishedAt => entra na fila pra agendar
    const needsSchedule = status === "draft" && !isValidYmd(data.publishedAt);
    if (needsSchedule) {
      draftsToSchedule.push({ filename, filePath, data });
    }
  }

  if (draftsToSchedule.length === 0) {
    return { scheduled: 0 };
  }

  // Ordena pra ficar previsível (pode trocar pra createdAt, mtime, etc)
  draftsToSchedule.sort((a, b) => {
    const aSlug = toSlug(a.filename);
    const bSlug = toSlug(b.filename);
    return aSlug.localeCompare(bSlug);
  });

  const startDate = maxScheduledOrPublished ? addDaysUTC(maxScheduledOrPublished, 1) : tomorrowUTC();

  draftsToSchedule.forEach((item, idx) => {
    const publishDate = addDaysUTC(startDate, idx);
    item.data.status = "scheduled";
    item.data.publishedAt = formatYmdUTC(publishDate);

    fs.writeFileSync(item.filePath, JSON.stringify(item.data, null, 2), "utf-8");
  });

  return { scheduled: draftsToSchedule.length };
}
