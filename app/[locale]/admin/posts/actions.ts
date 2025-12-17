"use server";

import { revalidatePath } from "next/cache";
import { normalizeCountry } from "@/lib/countries";
import { publishNextScheduled, scheduleDraftsOnePerDay } from "@/lib/auto-schedule";

export async function actionScheduleDrafts(formData: FormData) {
  const country = normalizeCountry(String(formData.get("country") ?? "de"));
  const startDateRaw = String(formData.get("startDate") ?? "").trim();

  scheduleDraftsOnePerDay(country, startDateRaw || undefined);

  // revalida admin do país + lista pública do país
  revalidatePath(`/${country}/`);
  revalidatePath(`/${country}`);
  // se você tem rota de posts tipo /{country}/{slug}, não precisa revalidar tudo aqui
}

export async function actionPublishNext(formData: FormData) {
  const country = normalizeCountry(String(formData.get("country") ?? "de"));

  publishNextScheduled(country);

  revalidatePath(`/${country}/`);
  revalidatePath(`/${country}`);
  revalidatePath(`/${country}/[slug]`);
}
