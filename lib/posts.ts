// src/lib/posts.ts
import fs from "fs";
import path from "path";

export const POSTS_DIR = path.join(process.cwd(), "content", "posts");

export type PostStatus = "draft" | "scheduled" | "published";

export type StoredPost = {
  slug: string;
  title: string;
  status: PostStatus;
  publishedAt?: string; // YYYY-MM-DD
  raw: string;
};

type JsonPostFile = {
  title?: string;
  status?: PostStatus;
  publishedAt?: string; // YYYY-MM-DD
  content?: string;     // HTML
  heroImageUrl?: string;
  heroImageAlt?: string;
};

function ensureDir() {
  if (!fs.existsSync(POSTS_DIR)) fs.mkdirSync(POSTS_DIR, { recursive: true });
}

function filenameToSlug(filename: string) {
  return filename.replace(/\.(md|json)$/i, "");
}

function safeParseJson(raw: string): JsonPostFile | null {
  try {
    const parsed: unknown = JSON.parse(raw);
    if (!parsed || typeof parsed !== "object") return null;
    return parsed as JsonPostFile;
  } catch {
    return null;
  }
}

function addDays(yyyyMmDd: string, days: number) {
  const [y, m, d] = yyyyMmDd.split("-").map(Number);
  const dt = new Date(Date.UTC(y, m - 1, d));
  dt.setUTCDate(dt.getUTCDate() + days);
  return dt.toISOString().slice(0, 10);
}

export function getAllPosts(): StoredPost[] {
  ensureDir();

  const files = fs
    .readdirSync(POSTS_DIR)
    .filter((f) => f.endsWith(".json") || f.endsWith(".md"));

  return files.map((filename) => {
    const filePath = path.join(POSTS_DIR, filename);
    const raw = fs.readFileSync(filePath, "utf-8");
    const slug = filenameToSlug(filename);

    if (filename.endsWith(".json")) {
      const data = safeParseJson(raw);
      return {
        slug,
        title: data?.title ?? slug,
        status: data?.status ?? "draft",
        publishedAt: data?.publishedAt,
        raw,
      };
    }

    // MD: por enquanto usa slug como title
    return { slug, title: slug, status: "draft", raw };
  });
}

export function getPostBySlug(slug: string): StoredPost | null {
  ensureDir();

  const jsonPath = path.join(POSTS_DIR, `${slug}.json`);
  const mdPath = path.join(POSTS_DIR, `${slug}.md`);

  if (fs.existsSync(jsonPath)) {
    const raw = fs.readFileSync(jsonPath, "utf-8");
    const data = safeParseJson(raw);
    return {
      slug,
      title: data?.title ?? slug,
      status: data?.status ?? "draft",
      publishedAt: data?.publishedAt,
      raw,
    };
  }

  if (fs.existsSync(mdPath)) {
    const raw = fs.readFileSync(mdPath, "utf-8");
    return { slug, title: slug, status: "draft", raw };
  }

  return null;
}

export function updateJsonPost(slug: string, patch: Partial<JsonPostFile>) {
  ensureDir();
  const jsonPath = path.join(POSTS_DIR, `${slug}.json`);
  if (!fs.existsSync(jsonPath)) return { ok: false, reason: "not_json" as const };

  const raw = fs.readFileSync(jsonPath, "utf-8");
  const data = safeParseJson(raw) ?? {};

  const next: JsonPostFile = { ...data, ...patch };
  fs.writeFileSync(jsonPath, JSON.stringify(next, null, 2), "utf-8");

  return { ok: true, data: next };
}

/**
 * PUBLICA automaticamente 1 por dia:
 * - Se já existe um post published com publishedAt==hoje -> não faz nada
 * - Pega o primeiro scheduled com publishedAt <= hoje e publica (seta publishedAt=hoje)
 * - Se existirem outros scheduled atrasados (<= hoje), empurra para amanhã+ (1 por dia)
 */
export function publishNextDuePost() {
  const today = new Date().toISOString().slice(0, 10);

  const posts = getAllPosts()
    .filter((p) => p.raw.trim().startsWith("{")) // só JSON
    .map((p) => ({
      ...p,
      publishedAt: p.publishedAt ?? undefined,
    }));

  const alreadyPublishedToday = posts.some(
    (p) => p.status === "published" && p.publishedAt === today
  );
  if (alreadyPublishedToday) {
    return { action: "skipped" as const, reason: "already_published_today" as const };
  }

  const due = posts
    .filter((p) => p.status === "scheduled" && p.publishedAt && p.publishedAt <= today)
    .sort((a, b) => (a.publishedAt!).localeCompare(b.publishedAt!));

  if (due.length === 0) {
    return { action: "none" as const };
  }

  const toPublish = due[0];
  updateJsonPost(toPublish.slug, { status: "published", publishedAt: today });

  // empurra os atrasados restantes para amanhã+ (1/dia)
  let nextDate = addDays(today, 1);
  for (const p of due.slice(1)) {
    updateJsonPost(p.slug, { status: "scheduled", publishedAt: nextDate });
    nextDate = addDays(nextDate, 1);
  }

  return {
    action: "published" as const,
    slug: toPublish.slug,
    publishedAt: today,
    shifted: due.length - 1,
  };
}
