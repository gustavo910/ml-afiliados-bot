import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getPostBySlug } from "@/lib/posts-store";
import TiptapRenderer from "@/components/TiptapRenderer";

type Props = { params: { slug: string } };

// --- SEO Dinâmico ---
export function generateMetadata({ params }: Props): Metadata {
  const post = getPostBySlug(params.slug);

  if (!post) return {};

  return {
    title: post.title,
    description: post.metaDescription ?? "",
    alternates: {
      canonical: `https://www.seublog.com/posts/${post.slug}`,
    },
    openGraph: {
      title: post.title,
      description: post.metaDescription ?? "",
      url: `https://www.seublog.com/posts/${post.slug}`,
      type: "article",
      siteName: "Meu Blog SEO",
    },
  };
}

// --- Página do Post ---
export default function PostPage({ params }: Props) {
  const post = getPostBySlug(params.slug);

  if (!post) return notFound();

  return (
    <main style={{ maxWidth: 800, margin: "0 auto", padding: "2rem" }}>
      <h1>{post.title}</h1>

      {post.createdAt && (
        <p style={{ color: "#555", marginBottom: "1.5rem" }}>
          Publicado em{" "}
          {new Date(post.createdAt).toLocaleDateString("pt-BR")}
        </p>
      )}

      {/* Aqui você renderiza o conteúdo do TipTap */}
      <TiptapRenderer content={post.content} />
    </main>
  );
}
