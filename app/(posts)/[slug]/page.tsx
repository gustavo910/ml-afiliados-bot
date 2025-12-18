import { notFound } from "next/navigation";
import { getPostBySlug } from "@/lib/posts";

type Props = { params: { slug: string } };

function todayYmdUTC() {
  return new Date().toISOString().slice(0, 10);
}

export default async function PostPage({ params }: Props) {
  const slug = params.slug;

  const post = getPostBySlug(slug);
  if (!post) return notFound();

  // ✅ Só aceita JSON (se MD não é publicado)
  if (!post.raw.trim().startsWith("{")) return notFound();

  let data: {
    status?: "draft" | "scheduled" | "published";
    publishedAt?: string; // YYYY-MM-DD
    title?: string;
    content?: string;
  };

  try {
    data = JSON.parse(post.raw);
  } catch {
    return notFound();
  }

  const status = data.status ?? "draft";
  const publishedAt = data.publishedAt;
  const today = todayYmdUTC();

  // ✅ bloqueia TUDO que não for publicado
  if (status !== "published") return notFound();

  // ✅ bloqueia se estiver com data futura
  if (publishedAt && publishedAt > today) return notFound();

  const title = data.title ?? post.title ?? slug;
  const html = data.content ?? "";

  return (
    <article className="post">
      <h1>{title}</h1>
      <div className="content" dangerouslySetInnerHTML={{ __html: html }} />
    </article>
  );
}
