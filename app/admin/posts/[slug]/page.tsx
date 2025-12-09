// app/posts/[slug]/page.tsx
import { notFound } from "next/navigation";
import { getPostBySlug } from "@/lib/posts-store";
import TiptapRenderer from "@/components/TiptapRenderer";

export default function PostPage({ params }: { params: { slug: string } }) {
  const post = getPostBySlug(params.slug);

  if (!post) return notFound();

  return (
    <main style={{ maxWidth: 800, margin: "0 auto", padding: "2rem" }}>
      <h1>{post.title}</h1>
      <p style={{ color: "#555", marginBottom: "1.5rem" }}>
        Publicado em {new Date(post.createdAt).toLocaleDateString("pt-BR")}
      </p>

      <TiptapRenderer content={post.content} />
    </main>
  );
}
