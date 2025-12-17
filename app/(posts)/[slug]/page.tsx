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
    const data = JSON.parse(post.raw);
    title = data.title ?? title;
    html = data.content ?? "";
  } else {
    html = `<pre>${post.raw.replaceAll("<", "&lt;")}</pre>`;
  }

  return (
    <article className="post">
      <h1>{title}</h1>

      {/* se você quiser: data.heroImageUrl, etc. */}
      {/* {data.heroImageUrl && (
        <div className="hero">
          <img src={data.heroImageUrl} alt={data.heroImageAlt ?? title} />
        </div>
      )} */}

      <div className="content" dangerouslySetInnerHTML={{ __html: html }} />
    </article>
  );
}
