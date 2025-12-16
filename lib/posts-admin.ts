
import fs from "fs";
import path from "path";
import { POSTS_DIR, updateJsonPost, getAllPosts, type PostStatus } from "@/lib/posts";

function ensureDir() {
  if (!fs.existsSync(POSTS_DIR)) fs.mkdirSync(POSTS_DIR, { recursive: true });
}

function isValidYmd(s?: string) {
  return !!s && /^\d{4}-\d{2}-\d{2}$/.test(s);
}

function addDaysYmd(base: string, days: number) {
  const [y, m, d] = base.split("-").map(Number);
  const dt = new Date(Date.UTC(y, m - 1, d));
  dt.setUTCDate(dt.getUTCDate() + days);
  return dt.toISOString().slice(0, 10);
}

function todayYmdUTC() {
  return new Date().toISOString().slice(0, 10);
}

/**
 * Agenda TODOS os drafts (sem publishedAt) como scheduled 1/dia
 * startDate opcional: "YYYY-MM-DD"
 */
export function scheduleDraftsOnePerDay(startDate?: string) {
  ensureDir();

  const posts = getAllPosts();

  // Descobre a maior data já usada por scheduled/published
  let maxDate: string | null = null;
  for (const p of posts) {
    if ((p.status === "scheduled" || p.status === "published") && isValidYmd(p.publishedAt)) {
      if (!maxDate || p.publishedAt! > maxDate) maxDate = p.publishedAt!;
    }
  }

  const base = startDate && isValidYmd(startDate)
    ? startDate
    : (maxDate ? addDaysYmd(maxDate, 1) : addDaysYmd(todayYmdUTC(), 1));

  // pega drafts sem data (só JSON)
  const drafts = posts
    .filter((p) => p.raw.trim().startsWith("{"))
    .filter((p) => p.status === "draft" && !isValidYmd(p.publishedAt))
    .sort((a, b) => a.slug.localeCompare(b.slug));

  drafts.forEach((p, idx) => {
    updateJsonPost(p.slug, { status: "scheduled", publishedAt: addDaysYmd(base, idx) });
  });

  return { scheduled: drafts.length, startDate: base };
}

/**
 * PUBLICA somente 1 por dia:
 * - se já existe publishedAt==hoje e status=published => não faz nada
 * - pega o primeiro scheduled com publishedAt <= hoje e marca como published
 */
export function publishNextScheduled() {
  ensureDir();
  const today = todayYmdUTC();

  const posts = getAllPosts()
    .filter((p) => p.raw.trim().startsWith("{"));

  const already = posts.some((p) => p.status === "published" && p.publishedAt === today);
  if (already) return { published: false, reason: "already_published_today" as const };

  const due = posts
    .filter((p) => p.status === "scheduled" && isValidYmd(p.publishedAt) && p.publishedAt! <= today)
    .sort((a, b) => (a.publishedAt!).localeCompare(b.publishedAt!));

  if (due.length === 0) return { published: false, reason: "none_due" as const };

  const next = due[0];
  updateJsonPost(next.slug, { status: "published", publishedAt: today });

  return { published: true, slug: next.slug, publishedAt: today };
}
