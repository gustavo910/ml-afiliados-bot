// src/lib/posts.ts
import fs from "fs";
import path from "path";
import { Country, DEFAULT_COUNTRY } from "@/lib/countries";
import { getPostsDirForRead, getPostsDirForWrite } from "@/lib/posts-path";

export type PostStatus = "draft" | "scheduled" | "published";

export type StoredPost = {
  slug: string;
  title: string;
  status: PostStatus;
  publishedAt?: string; // YYYY-MM-DD
  raw: string;
};

export type JsonPostFile = {
  title?: string;
  status?: PostStatus;
  publishedAt?: string;
  content?: string; // HTML
  heroImageUrl?: string;
  heroImageAlt?: string;
  cardImageUrl?: string;
  cardImageAlt?: string;
  excerpt?: string;
};

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

function stripHtml(html: string) {
  return html
    .replace(/[\s\S]*?<\/script>/gi, " ")
    .replace(/[\s\S]*?<\/style>/gi, " ")
    .replace(/<\/?[^>]+(>|$)/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function makeExcerptFromHtml(html: string, maxLen = 180) {
  const text = stripHtml(html);
  if (!text) return "";
  return text.length > maxLen ? text.slice(0, maxLen).trim() : text;
}

function addDays(yyyyMmDd: string, days: number) {
  const [y, m, d] = yyyyMmDd.split("-").map(Number);
  const dt = new Date(Date.UTC(y, m - 1, d));
  dt.setUTCDate(dt.getUTCDate() + days);
  return dt.toISOString().slice(0, 10);
}

/** Lista posts (read pode cair no legacy enquanto migra) */
export function getAllPosts(country: Country = DEFAULT_COUNTRY): StoredPost[] {
  const POSTS_DIR = getPostsDirForRead(country);

  if (!fs.existsSync(POSTS_DIR)) return [];

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

    return { slug, title: slug, status: "draft", raw };
  });
}

export function getPostBySlug(slug: string, country: Country = DEFAULT_COUNTRY): StoredPost | null {
  const READ_DIR = getPostsDirForRead(country);

  const jsonPath = path.join(READ_DIR, `${slug}.json`);
  const mdPath = path.join(READ_DIR, `${slug}.md`);

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

/**
 * Atualiza JSON do post.
 * Se o JSON estiver no legacy, ele migra para content/{country}/posts e passa a escrever lá.
 */
export function updateJsonPost(
  slug: string,
  patch: Partial<JsonPostFile>,
  country: Country = DEFAULT_COUNTRY
) {
  const READ_DIR = getPostsDirForRead(country);
  const WRITE_DIR = getPostsDirForWrite(country);

  const readJsonPath = path.join(READ_DIR, `${slug}.json`);
  if (!fs.existsSync(readJsonPath)) return { ok: false, reason: "not_json" as const };

  const raw = fs.readFileSync(readJsonPath, "utf-8");
  const data = safeParseJson(raw) ?? {};
  const next: JsonPostFile = { ...data, ...patch };

  // escreve SEMPRE no country dir (migra se estava no legacy)
  const writeJsonPath = path.join(WRITE_DIR, `${slug}.json`);
  fs.writeFileSync(writeJsonPath, JSON.stringify(next, null, 2), "utf-8");

  // se veio do legacy e o caminho mudou, apaga o antigo
  if (readJsonPath !== writeJsonPath) {
    try {
      fs.unlinkSync(readJsonPath);
    } catch {
      // ignore
    }
  }

  return { ok: true, data: next };
}

/* ---------- cards publicados ---------- */
export type PublishedCardPost = {
  slug: string;
  title: string;
  publishedAt?: string;
  excerpt?: string;
  heroImageUrl?: string;
  heroImageAlt?: string;
  cardImageUrl?: string;
  cardImageAlt?: string;
};

export function getPublishedPostsDue(country: Country = DEFAULT_COUNTRY): PublishedCardPost[] {
  const today = new Date().toISOString().slice(0, 10);
  const all = getAllPosts(country);

  const published = all
    .filter((p) => p.raw.trim().startsWith("{"))
    .map((p) => {
      const data = safeParseJson(p.raw);
      if (!data) return null;

      const status = data.status ?? "draft";
      const publishedAt = data.publishedAt;

      if (status !== "published") return null;
      if (publishedAt && publishedAt > today) return null;

      const title = data.title ?? p.title ?? p.slug;

      return {
        slug: p.slug,
        title,
        publishedAt,
        excerpt: data.excerpt ?? makeExcerptFromHtml(data.content ?? "", 180),
        heroImageUrl: data.heroImageUrl,
        heroImageAlt: data.heroImageAlt,
        cardImageUrl: data.cardImageUrl,
        cardImageAlt: data.cardImageAlt,
      } satisfies PublishedCardPost;
    })
    .filter(Boolean) as PublishedCardPost[];

  published.sort((a, b) => (b.publishedAt ?? "").localeCompare(a.publishedAt ?? ""));
  return published;
}

/**
 * Publica 1 por dia: pega o primeiro scheduled com publishedAt <= hoje.
 * Se já publicou hoje, não faz nada.
 */
export function publishNextDuePost(country: Country = DEFAULT_COUNTRY) {
  const today = new Date().toISOString().slice(0, 10);

  const posts = getAllPosts(country)
    .filter((p) => p.raw.trim().startsWith("{"))
    .map((p) => ({ ...p, publishedAt: p.publishedAt ?? undefined }));

  const alreadyPublishedToday = posts.some((p) => p.status === "published" && p.publishedAt === today);
  if (alreadyPublishedToday) return { action: "skipped" as const, reason: "already_published_today" as const };

  const due = posts
    .filter((p) => p.status === "scheduled" && p.publishedAt && p.publishedAt <= today)
    .sort((a, b) => (a.publishedAt!).localeCompare(b.publishedAt!));

  if (due.length === 0) return { action: "none" as const };

  const toPublish = due[0];
  updateJsonPost(toPublish.slug, { status: "published", publishedAt: today }, country);

  let nextDate = addDays(today, 1);
  for (const p of due.slice(1)) {
    updateJsonPost(p.slug, { status: "scheduled", publishedAt: nextDate }, country);
    nextDate = addDays(nextDate, 1);
  }

  return { action: "published" as const, slug: toPublish.slug, publishedAt: today, shifted: due.length - 1 };
}
