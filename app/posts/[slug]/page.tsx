// src/app/posts/[slug]/page.tsx
import { notFound } from "next/navigation";
import { getPostBySlug } from "@/lib/posts";

type Props = { params: Promise<{ slug: string }> };

export default async function PostPage({ params }: Props) {
  const { slug } = await params;
  const post = getPostBySlug(slug);
  if (!post) return notFound();

  let title = post.title;
  let html = "";

  if (post.raw.trim().startsWith("{")) {
    const data = JSON.parse(post.raw) as any;
    title = data.title ?? title;
    html = data.content ?? "";
  } else {
    // md/txt: mostra cru por enquanto
    html = `<pre>${post.raw.replaceAll("<", "&lt;")}</pre>`;
  }

  return (
    <main style={{ maxWidth: 800, margin: "0 auto", padding: "2rem" }}>
      <h1>{title}</h1>
      <div dangerouslySetInnerHTML={{ __html: html }} />
    </main>
  );
}
