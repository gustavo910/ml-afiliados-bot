// src/lib/posts-admin.ts
import fs from "fs";
import path from "path";
import type { Country } from "@/lib/countries";
import { getPostsDirForRead, getPostsDirForWrite } from "@/lib/posts-path";
import type { JsonPostFile, PostStatus } from "@/lib/posts";

export type AdminPostRow = {
  slug: string;
  title: string;
  status: PostStatus;
  publishedAt?: string;
  filePath: string;
  source: "country" | "legacy";
};

function isSafeSlug(slug: string) {
  // slug para arquivo: sem barras, sem espaços
  return /^[a-z0-9]+(?:-[a-z0-9]+)*$/i.test(slug);
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

function listJsonFiles(dir: string) {
  if (!fs.existsSync(dir)) return [];
  return fs.readdirSync(dir).filter((f) => f.toLowerCase().endsWith(".json"));
}

/** Lista posts (JSON) para o admin — se existir legacy, ele também pode aparecer */
export function listAdminPosts(country: Country): AdminPostRow[] {
  const countryDir = getPostsDirForWrite(country); // garante dir do país
  const readDir = getPostsDirForRead(country);

  const countryFiles = new Set(listJsonFiles(countryDir));
  const readFiles = listJsonFiles(readDir);

  // união: preferir o countryDir quando houver duplicado
  const allFiles = Array.from(new Set([...readFiles, ...Array.from(countryFiles)]));

  const rows: AdminPostRow[] = [];

  for (const filename of allFiles) {
    const slug = filename.replace(/\.json$/i, "");

    const countryPath = path.join(countryDir, filename);
    const legacyOrReadPath = path.join(readDir, filename);

    const filePath = fs.existsSync(countryPath) ? countryPath : legacyOrReadPath;
    if (!fs.existsSync(filePath)) continue;

    const raw = fs.readFileSync(filePath, "utf-8");
    const data = safeParseJson(raw);
    if (!data) continue;

    rows.push({
      slug,
      title: data.title ?? slug,
      status: (data.status ?? "draft") as PostStatus,
      publishedAt: data.publishedAt,
      filePath,
      source: fs.existsSync(countryPath) ? "country" : "legacy",
    });
  }

  // ordena por publishedAt desc, depois por slug
  rows.sort((a, b) => {
    const da = a.publishedAt ?? "";
    const db = b.publishedAt ?? "";
    if (da !== db) return db.localeCompare(da);
    return a.slug.localeCompare(b.slug);
  });

  return rows;
}

/** Lê um post JSON por slug (procura no country e depois no legacy/read) */
export function readJsonPost(country: Country, slug: string): JsonPostFile | null {
  const readDir = getPostsDirForRead(country);
  const countryDir = getPostsDirForWrite(country);

  const filename = `${slug}.json`;
  const p1 = path.join(countryDir, filename);
  const p2 = path.join(readDir, filename);

  const filePath = fs.existsSync(p1) ? p1 : fs.existsSync(p2) ? p2 : null;
  if (!filePath) return null;

  const raw = fs.readFileSync(filePath, "utf-8");
  return safeParseJson(raw);
}

/**
 * Salva (cria ou sobrescreve) um post JSON SEMPRE no diretório do país.
 * Se existir no legacy, você pode escolher migrar apagando o antigo.
 */
export function saveJsonPost(
  country: Country,
  slug: string,
  data: JsonPostFile,
  opts?: { migrateLegacy?: boolean }
) {
  if (!isSafeSlug(slug)) {
    throw new Error("Slug inválido. Use apenas letras, números e hífen (sem espaços).");
  }

  const countryDir = getPostsDirForWrite(country);
  const filePath = path.join(countryDir, `${slug}.json`);

  fs.writeFileSync(filePath, JSON.stringify(data, null, 2), "utf-8");

  // opcional: remove legado, se existir
  if (opts?.migrateLegacy) {
    const legacyDir = path.join(process.cwd(), "content", "posts");
    const legacyPath = path.join(legacyDir, `${slug}.json`);
    if (fs.existsSync(legacyPath)) {
      try {
        fs.unlinkSync(legacyPath);
      } catch {
        // ignore
      }
    }
  }

  return { ok: true as const, filePath };
}

/** Aplica patch (merge) no JSON — sempre grava no país */
export function patchJsonPost(
  country: Country,
  slug: string,
  patch: Partial<JsonPostFile>,
  opts?: { migrateLegacy?: boolean }
) {
  const current = readJsonPost(country, slug);
  if (!current) return { ok: false as const, reason: "not_found" as const };

  const next: JsonPostFile = { ...current, ...patch };
  saveJsonPost(country, slug, next, opts);

  return { ok: true as const, data: next };
}

/** Deleta post somente do país (não apaga legacy por padrão) */
export function deleteJsonPost(country: Country, slug: string, opts?: { deleteLegacyToo?: boolean }) {
  const countryDir = getPostsDirForWrite(country);
  const filePath = path.join(countryDir, `${slug}.json`);

  if (fs.existsSync(filePath)) {
    fs.unlinkSync(filePath);
  }

  if (opts?.deleteLegacyToo) {
    const legacyDir = path.join(process.cwd(), "content", "posts");
    const legacyPath = path.join(legacyDir, `${slug}.json`);
    if (fs.existsSync(legacyPath)) {
      try {
        fs.unlinkSync(legacyPath);
      } catch {
        // ignore
      }
    }
  }

  return { ok: true as const };
}

/**
 * Upload de JSON (string) -> salva no país
 * Útil para API route receber arquivo e chamar isso.
 */
export function uploadJsonPostFromString(
  country: Country,
  slug: string,
  jsonText: string,
  opts?: { migrateLegacy?: boolean }
) {
  const data = safeParseJson(jsonText);
  if (!data) {
    return { ok: false as const, reason: "invalid_json" as const };
  }

  saveJsonPost(country, slug, data, opts);
  return { ok: true as const };
}
