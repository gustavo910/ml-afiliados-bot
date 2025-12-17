import { notFound } from "next/navigation";
import { getPostBySlug } from "@/lib/posts";
import { normalizeCountry } from "@/lib/countries";

type Props = { params: { locale: string; slug: string } };

function todayYmdUTC() {
  return new Date().toISOString().slice(0, 10);
}

export default async function PostPage({ params }: Props) {
  const country = normalizeCountry(params.locale);
  const slug = params.slug;

  const post = getPostBySlug(slug, country);
  if (!post) return notFound();

  // ✅ Só deixa público se estiver published e "due"
  if (post.raw.trim().startsWith("{")) {
    const data = JSON.parse(post.raw) as { status?: string; publishedAt?: string; title?: string; content?: string };

    const status = data.status ?? "draft";
    const publishedAt = data.publishedAt;
    const today = todayYmdUTC();

    if (status !== "published") return notFound();
    if (publishedAt && publishedAt > today) return notFound();

    const title = data.title ?? post.title;
    const html = data.content ?? "";

    return (
      <article className="post">
        <h1>{title}</h1>
        <div className="content" dangerouslySetInnerHTML={{ __html: html }} />
      </article>
    );
  }

  // se for MD, trate como não-publicado (ou notFound)
  return notFound();
}
