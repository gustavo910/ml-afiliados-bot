// src/lib/auto-schedule.ts
import fs from "fs";
import { getAllPosts, updateJsonPost } from "./posts";
import { getPostsDirForWrite } from "./posts-path";
import type { Country } from "@/lib/countries";

function ensureDir(country: Country) {
  const dir = getPostsDirForWrite(country);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
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

/** Agenda TODOS os drafts (sem publishedAt) como scheduled 1/dia */
export function scheduleDraftsOnePerDay(country: Country, startDate?: string) {
  ensureDir(country);

  const posts = getAllPosts(country);

  let maxDate: string | null = null;
  for (const p of posts) {
    if ((p.status === "scheduled" || p.status === "published") && isValidYmd(p.publishedAt)) {
      if (!maxDate || p.publishedAt! > maxDate) maxDate = p.publishedAt!;
    }
  }

  const base =
    startDate && isValidYmd(startDate)
      ? startDate
      : maxDate
        ? addDaysYmd(maxDate, 1)
        : addDaysYmd(todayYmdUTC(), 1);

  const drafts = posts
    .filter((p) => p.raw.trim().startsWith("{"))
    .filter((p) => p.status === "draft" && !isValidYmd(p.publishedAt))
    .sort((a, b) => a.slug.localeCompare(b.slug));

  drafts.forEach((p, idx) => {
    updateJsonPost(p.slug, { status: "scheduled", publishedAt: addDaysYmd(base, idx) }, country);
  });

  return { scheduled: drafts.length, startDate: base };
}

/** Publica 1 por dia (scheduled <= hoje) */
export function publishNextScheduled(country: Country) {
  ensureDir(country);
  const today = todayYmdUTC();

  const posts = getAllPosts(country).filter((p) => p.raw.trim().startsWith("{"));

  const already = posts.some((p) => p.status === "published" && p.publishedAt === today);
  if (already) return { published: false, reason: "already_published_today" as const };

  const due = posts
    .filter((p) => p.status === "scheduled" && isValidYmd(p.publishedAt) && p.publishedAt! <= today)
    .sort((a, b) => (a.publishedAt!).localeCompare(b.publishedAt!));

  if (due.length === 0) return { published: false, reason: "none_due" as const };

  const next = due[0];
  updateJsonPost(next.slug, { status: "published", publishedAt: today }, country);

  return { published: true, slug: next.slug, publishedAt: today };
}
