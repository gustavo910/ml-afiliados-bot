// src/lib/countries.ts
export const COUNTRIES = ["de", "gb", "ch", "nl", "dk"] as const;
export type Country = (typeof COUNTRIES)[number];

export const DEFAULT_COUNTRY: Country = "de";

// (opcional) quando você comprar domínios e apontar pro mesmo app:
export const HOST_TO_COUNTRY: Record<string, Country> = {
  "seusite.de": "de",
  "seusite.co.uk": "gb",
  "seusite.ch": "ch",
  "seusite.nl": "nl",
  "seusite.dk": "dk",
};

export function normalizeCountry(input: string | undefined): Country {
  const v = (input ?? "").toLowerCase();
  return (COUNTRIES as readonly string[]).includes(v) ? (v as Country) : DEFAULT_COUNTRY;
}

export function getCountryFromHost(host: string | null): Country | null {
  if (!host) return null;
  const clean = host.toLowerCase().split(":")[0];
  return HOST_TO_COUNTRY[clean] ?? null;
}
