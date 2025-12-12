// src/lib/posts.ts
import fs from "fs";
import path from "path";
import { POSTS_DIR } from "@/lib/posts-path";

export type StoredPost = {
  slug: string;
  title: string;
  status: "draft" | "scheduled" | "published";
  publishedAt?: string;
  raw: string;
};

function ensureDir() {
  if (!fs.existsSync(POSTS_DIR)) fs.mkdirSync(POSTS_DIR, { recursive: true });
}

function filenameToSlug(filename: string) {
  return filename.replace(/\.(md|json)$/i, "");
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
      try {
        const data = JSON.parse(raw) as any;
        return {
          slug,
          title: data.title ?? slug,
          status: (data.status ?? "draft") as StoredPost["status"],
          publishedAt: data.publishedAt,
          raw,
        };
      } catch {
        return { slug, title: slug, status: "draft", raw };
      }
    }

    return { slug, title: slug, status: "draft", raw };
  });
}

export function getPostBySlug(slug: string): StoredPost | null {
  ensureDir();

  const mdPath = path.join(POSTS_DIR, `${slug}.md`);
  const jsonPath = path.join(POSTS_DIR, `${slug}.json`);

  if (fs.existsSync(jsonPath)) {
    const raw = fs.readFileSync(jsonPath, "utf-8");
    let title = slug;
    let status: StoredPost["status"] = "draft";
    let publishedAt: string | undefined;

    try {
      const data = JSON.parse(raw) as any;
      title = data.title ?? slug;
      status = (data.status ?? "draft") as StoredPost["status"];
      publishedAt = data.publishedAt;
    } catch {}

    return { slug, title, status, publishedAt, raw };
  }

  if (fs.existsSync(mdPath)) {
    const raw = fs.readFileSync(mdPath, "utf-8");
    return { slug, title: slug, status: "draft", raw };
  }

  return null;
}
