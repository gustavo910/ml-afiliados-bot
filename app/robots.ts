import type { MetadataRoute } from "next";
import { COUNTRIES } from "@/lib/countries";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: { userAgent: "*", allow: "/" },
    sitemap: COUNTRIES.map((c) => `/${c}/sitemap.xml`),
  };
}
