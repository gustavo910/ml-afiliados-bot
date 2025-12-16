"use server";

import { publishNextScheduled, scheduleDraftsOnePerDay } from "@/lib/posts-admin";
import { revalidatePath } from "next/cache";


export async function actionScheduleDrafts(formData: FormData) {
  const startDateRaw = String(formData.get("startDate") ?? "").trim();

  // se vier vazio, a função decide (ex: amanhã ou após o último agendado)
  scheduleDraftsOnePerDay(startDateRaw || undefined);

  // ⚠️ ajuste conforme sua URL real:
  // - se sua página está em app/(admin)/posts => URL é "/posts"
  // - se sua página está em app/admin/posts => URL é "/admin/posts"
  revalidatePath("/admin/posts");
  revalidatePath("/posts");
}

export async function actionPublishNext() {
  publishNextScheduled();

  // revalida admin + lista pública + página de post individual
  revalidatePath("/admin/posts");
  revalidatePath("/posts");
  revalidatePath("/posts/[slug]");
}
