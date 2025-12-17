// src/lib/posts-path.ts
import fs from "fs";
import path from "path";
import type { Country } from "@/lib/countries";

function ensureDir(dir: string) {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
}

/** LEITURA: aceita fallback enquanto você migra */
export function getPostsDirForRead(country: Country) {
  const perCountry = path.join(process.cwd(), "content", country, "posts");
  const legacy = path.join(process.cwd(), "content", "posts");

  if (fs.existsSync(perCountry)) return perCountry;
  return legacy;
}

/** ESCRITA: SEMPRE no país (nada de fallback) */
export function getPostsDirForWrite(country: Country) {
  const perCountry = path.join(process.cwd(), "content", country, "posts");
  ensureDir(perCountry);
  return perCountry;
}
